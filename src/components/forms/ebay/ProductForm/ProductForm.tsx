import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Editor } from '@/components/blocks/editor-00/editor';
import { Checkbox } from "@/components/ui/checkbox";
import type { SearchDetailResult } from '@/types/search';
import type { FulfillmentPolicy, PaymentPolicy, ReturnPolicy } from '@/types/ebay/policy';
import type { ItemSpecificsResponse } from '@/types/ebay/itemSpecifics';
import type { SearchResult } from '@/types/search';
import type { PriceCalculation } from '@/types/price';

interface ProductFormProps {
    initialData?: SearchDetailResult | null;
    selectedItem: SearchResult;
    translateTitle: string;
    translateCondition: string;
    onCancel?: () => void;
    policies: {
        fulfillment: FulfillmentPolicy[];
        payment: PaymentPolicy[];
        return: ReturnPolicy[];
    };
    isLoadingPolicies: boolean;
    price: PriceCalculation;
}

interface Category {
    categoryId: string;
    categoryName: string;
    path: string;
}

// フォームのバリデーションスキーマ
const productFormSchema = z.object({
    title: z.string().min(1, 'タイトルを入力してください'),
    description: z.string().min(1, '説明を入力してください'),
    price: z.string().min(1, '価格を入力してください'),
    final_profit: z.string(),
    quantity: z.string().min(1, '数量を入力してください'),
    condition: z.string().min(1, '商品の状態を選択してください'),
    conditionDescription: z.string().optional(),
    categoryId: z.string().min(1, 'カテゴリーを選択してください'),
    categoryName: z.string().optional(),
    currency: z.string().default('USD'),
    fulfillmentPolicyId: z.string().min(1, '配送ポリシーを選択してください'),
    paymentPolicyId: z.string().min(1, '支払いポリシーを選択してください'),
    returnPolicyId: z.string().min(1, '返品ポリシーを選択してください'),
    ebayItemId: z.string().optional(),
    itemSpecifics: z.array(
        z.object({
            name: z.string().min(1, '項目名を入力してください'),
            value: z.array(z.string()).min(1, '値を入力してください'),
        })
    ).min(1, '少なくとも1つのItem Specificsを追加してください'),
    images: z.array(z.string()).min(1, '少なくとも1枚の画像を選択してください'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export const ProductForm = ({
    initialData,
    selectedItem,
    translateTitle,
    translateCondition,
    onCancel,
    policies,
    isLoadingPolicies,
    price
}: ProductFormProps) => {
    const { toast } = useToast();
    const [allImages, setAllImages] = useState<string[]>(initialData?.images.url || []);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: translateTitle,
            description: initialData?.description || '',  // 直接文字列として受け取る
            price: price.calculated_price_dollar.toString(),
            final_profit: price.final_profit_yen.toString(),
            quantity: "1",
            condition: initialData?.condition === '未使用' ? '1' : initialData?.condition === '未使用に近い' ? '3' : '2',
            conditionDescription: translateCondition,
            categoryId: initialData?.categories[0] || '',
            ebayItemId: '',
            itemSpecifics: [],
            images: initialData?.images.url || [],
        },
    });

    const { fields: itemSpecificsFields, append: appendItemSpecific, remove: removeItemSpecific } = useFieldArray({
        control: form.control,
        name: "itemSpecifics"
    });

    // カテゴリー検索
    const handleSearchCategories = async () => {
        if (!searchQuery.trim()) return;

        setIsLoadingCategories(true);
        try {
            const response = await fetch(`/api/ebay/category?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.categories)) {
                setCategories(data.categories.map((category: { categoryId: string; categoryName: string }) => ({
                    ...category,
                    path: `${category.categoryName}`
                })));
            } else {
                setCategories([]);
                throw new Error(data.message || 'カテゴリーの検索に失敗しました');
            }
        } catch (error) {
            setCategories([]);
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'カテゴリーの検索に失敗しました',
                variant: 'destructive'
            });
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            await handleSearchCategories();
        }
    };

    // 説明文の翻訳処理
    const handleTranslateDescription = async (value: string) => {
        if (!value) {
            toast({
                title: 'エラー',
                description: '翻訳するテキストを入力してください',
                variant: 'destructive'
            });
            return;
        }

        try {
            const response = await fetch(`/api/translate?text=${encodeURIComponent(value)}`);
            const data = await response.json();
            if (data.success) {
                form.setValue('description', data.data.translated_text);
                toast({
                    title: '成功',
                    description: '翻訳が完了しました',
                });
            } else {
                throw new Error(data.message || '翻訳に失敗しました');
            }
        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : '翻訳に失敗しました',
                variant: 'destructive'
            });
        }
    };

    // Item Specifics関連の処理
    const handleFetchItemSpecifics = async () => {
        const ebayItemId = form.getValues('ebayItemId');
        if (!ebayItemId) {
            toast({
                title: 'エラー',
                description: 'eBay商品IDを入力してください',
                variant: 'destructive'
            });
            return;
        }

        try {
            const response = await fetch(`/api/ebay/itemSpecifics?ebayItemId=${ebayItemId}`);
            const data: ItemSpecificsResponse = await response.json();
            if (data.success && data.data?.item_specifics) {
                // 既存のItem Specificsをクリア
                form.setValue('itemSpecifics', []);
                // 新しいItem Specificsを追加
                data.data.item_specifics.forEach((spec: { name: string; values: string[] }) => {
                    appendItemSpecific({
                        name: spec.name,
                        value: spec.values
                    });
                });

                toast({
                    title: '成功',
                    description: 'Item Specificsを取得しました',
                });
            }
        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'Item Specificsの取得に失敗しました',
                variant: 'destructive'
            });
        }
    };

    const handleAddItemSpecific = () => {
        appendItemSpecific({ name: '', value: [''] });
    };

    const handleRemoveItemSpecific = (index: number) => {
        if (itemSpecificsFields.length === 1) {
            toast({
                title: '警告',
                description: '少なくとも1つのItem Specificsが必要です',
                variant: 'destructive'
            });
            return;
        }
        removeItemSpecific(index);
    };

    const handleSubmit = async (values: ProductFormValues) => {
        try {
            const productData = {
                title: values.title,
                description: values.description,
                primaryCategory: {
                    categoryId: values.categoryId,
                },
                startPrice: {
                    value: values.price,
                    currencyId: values.currency,
                },
                quantity: parseInt(values.quantity),
                listingDuration: 'GTC',
                listingType: 'FixedPriceItem',
                country: 'JP',
                currency: values.currency,
                paymentMethods: ['PayPal'],
                condition: {
                    conditionId: values.condition,
                    conditionDescription: values.conditionDescription ?? '',
                },
                returnPolicy: {
                    returnsAccepted: true,
                    returnsPeriod: '14',
                    returnsDescription: '商品到着後14日以内に返品可能',
                },
                shippingDetails: {
                    shippingServiceOptions: [],
                },
                fulfillmentPolicyId: values.fulfillmentPolicyId,
                paymentPolicyId: values.paymentPolicyId,
                returnPolicyId: values.returnPolicyId,
                itemSpecifics: {
                    nameValueList: values.itemSpecifics,
                },
                images: values.images,
            };

            const response = await fetch('/api/ebay/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || '商品の登録に失敗しました');
            }

            toast({
                title: '成功',
                description: '商品を登録しました',
            });

            // 成功時のコールバック
            if (onCancel) {
                onCancel();
            }

        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : '商品の登録に失敗しました',
                variant: 'destructive',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* 画像選択 */}
                {allImages.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground">選択画像（最大24枚）</div>
                        <div className="grid grid-cols-5 gap-2">
                            {allImages.map((url) => (
                                url && (
                                    <label
                                        key={url}
                                        className="relative aspect-square cursor-pointer"
                                        htmlFor={`image-${url}`}
                                    >
                                        <Checkbox
                                            id={`image-${url}`}
                                            checked={form.getValues('images').includes(url)}
                                            onCheckedChange={(checked) => {
                                                const currentSelected = form.getValues('images');
                                                const newSelected = checked
                                                    ? [...currentSelected, url]
                                                    : currentSelected.filter(selectedUrl => selectedUrl !== url);
                                                form.setValue('images', newSelected, { shouldDirty: true, shouldValidate: true });
                                            }}
                                            className="hidden"
                                        />
                                        <div
                                            className={`w-full h-full bg-cover bg-center border-2 rounded-md ${form.getValues('images').includes(url)
                                                ? 'border-blue-500'
                                                : 'border-transparent'
                                                }`}
                                            style={{ backgroundImage: `url(${url})` }}
                                        >
                                            {form.getValues('images').includes(url) && (
                                                <div className="absolute right-1 top-1 bg-blue-500 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* 基本情報 */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-muted-foreground">タイトル</FormLabel>
                            <FormControl>
                                <Input {...field} className="h-11" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-muted-foreground">説明</FormLabel>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2 bg-gray-200 hover:bg-gray-300"
                                    onClick={() => handleTranslateDescription(field.value)}
                                >
                                    翻訳
                                </Button>
                            </div>
                            <FormControl>
                                <textarea
                                    {...field}
                                    rows={10}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 価格フィールド */}
                <div className="grid grid-cols-[200px,1fr,auto,1.5fr] items-center">
                    <FormLabel className="text-muted-foreground">価格</FormLabel>
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="text"
                                        className="h-11"
                                        placeholder="価格（＄）"
                                        value={field.value ? Number(field.value).toLocaleString() : ''}
                                        onChange={async (e) => {
                                            let numericValue = e.target.value.replace(/[^0-9]/g, '');
                                            if (numericValue == '') {
                                                numericValue = '0';
                                            }
                                            field.onChange(numericValue);

                                            try {
                                                const response = await fetch(`/api/calculator/price?price=${encodeURIComponent(numericValue)}`);
                                                const data = await response.json();
                                                if (data.success) {
                                                    form.setValue('final_profit', data.data.final_profit_yen.toString());
                                                }
                                            } catch (error) {
                                                console.error('価格計算エラー:', error);
                                            }
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormLabel className="text-muted-foreground whitespace-nowrap ml-4 mr-2">最終利益</FormLabel>
                    <FormField
                        control={form.control}
                        name="final_profit"
                        render={({ field }) => (
                            <FormItem>
                                <div className="h-11 px-3 border rounded-md bg-muted flex items-center text-muted-foreground">
                                    ￥{Number(field.value).toLocaleString()}
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-[200px,1fr] items-center">
                            <FormLabel className="text-muted-foreground">数量</FormLabel>
                            <div>
                                <FormControl>
                                    <Input {...field} type="number" className="h-11" />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-[200px,1fr] items-center">
                            <FormLabel className="text-muted-foreground">商品の状態</FormLabel>
                            <div>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="商品の状態を選択" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">新品</SelectItem>
                                        <SelectItem value="2">中古</SelectItem>
                                        <SelectItem value="3">未使用に近い</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="conditionDescription"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-[200px,1fr] items-center">
                            <FormLabel className="text-muted-foreground">商品の状態の説明</FormLabel>
                            <div>
                                <FormControl>
                                    <Input {...field} type="text" className="h-11" />
                                </FormControl>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />

                {/* カテゴリー選択 */}
                <div className="grid grid-cols-[200px,1fr] items-start">
                    <FormLabel className="text-muted-foreground">カテゴリー選択</FormLabel>
                    <div className="space-y-4">
                        <div className="flex">
                            <Input
                                placeholder="カテゴリーを検索... (Enterで検索)"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="flex-1"
                                disabled={isLoadingCategories}
                            />
                            <Button
                                type="button"
                                onClick={handleSearchCategories}
                                disabled={isLoadingCategories}
                                variant="secondary"
                                className="ml-2 bg-gray-200 hover:bg-gray-300"
                            >
                                検索
                            </Button>
                        </div>

                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            const selectedCategory = categories.find(cat => cat.categoryId === value);
                                            if (selectedCategory) {
                                                form.setValue('categoryName', selectedCategory.categoryName);
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="カテゴリーを選択">
                                                    {form.watch('categoryId') ? (
                                                        <div className="flex flex-col items-start">
                                                            <span className="text-sm block">{categories.find(c => c.categoryId === form.watch('categoryId'))?.categoryName}</span>
                                                            <span className="text-xs text-muted-foreground block">{categories.find(c => c.categoryId === form.watch('categoryId'))?.path}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-muted-foreground text-left">テキスト検索をしてください</div>
                                                    )}
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map((category) => (
                                                    <SelectItem
                                                        key={category.categoryId}
                                                        value={category.categoryId}
                                                        className="flex flex-col items-start"
                                                    >
                                                        <span className="text-sm block">{category.categoryName}</span>
                                                        <span className="text-xs text-muted-foreground block">{category.path}</span>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground text-left">
                                                    カテゴリーを検索してください
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* ポリシー選択 */}
                <div className="grid grid-cols-[200px,1fr] items-start">
                    <FormLabel className="text-muted-foreground">ポリシー選択</FormLabel>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fulfillmentPolicyId"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11" disabled={isLoadingPolicies}>
                                                <SelectValue placeholder={isLoadingPolicies ? "読み込み中..." : "配送ポリシー（Shipping Policy）"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {policies.fulfillment.map((policy) => (
                                                <SelectItem key={policy.fulfillmentPolicyId} value={policy.fulfillmentPolicyId}>
                                                    {policy.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentPolicyId"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11" disabled={isLoadingPolicies}>
                                                <SelectValue placeholder={isLoadingPolicies ? "読み込み中..." : "支払いポリシー（Payment Policy）"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {policies.payment.map((policy) => (
                                                <SelectItem key={policy.paymentPolicyId} value={policy.paymentPolicyId}>
                                                    {policy.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="returnPolicyId"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11" disabled={isLoadingPolicies}>
                                                <SelectValue placeholder={isLoadingPolicies ? "読み込み中..." : "返品ポリシー（Return Policy）"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {policies.return.map((policy) => (
                                                <SelectItem key={policy.returnPolicyId} value={policy.returnPolicyId}>
                                                    {policy.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Item Specifics */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">Item Specifics</div>
                        <div className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name="ebayItemId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="eBay商品ID"
                                                className="h-11 w-[200px]"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                onClick={handleFetchItemSpecifics}
                                variant="secondary"
                                className="h-11 bg-gray-200 hover:bg-gray-300"
                            >
                                Item Specificsを取得
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {itemSpecificsFields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-4">
                                <FormField
                                    control={form.control}
                                    name={`itemSpecifics.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="項目名"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`itemSpecifics.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    value={field.value?.join(', ')}
                                                    onChange={(e) => field.onChange(e.target.value.split(', ').map(v => v.trim()))}
                                                    placeholder="値（複数ある場合はカンマ区切り）"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-9"
                                    onClick={() => handleRemoveItemSpecific(index)}
                                >
                                    削除
                                </Button>
                            </div>
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddItemSpecific}
                        className="w-full"
                    >
                        項目を追加
                    </Button>
                </div>

                {/* 送信ボタン */}
                <div className="flex justify-end gap-3">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-8 hover:bg-gray-100">
                            キャンセル
                        </Button>
                    )}
                    <Button type="submit" className="h-11 px-8 bg-blue-700 hover:bg-blue-800">
                        登録
                    </Button>
                </div>
            </form>
        </Form>
    );
}; 