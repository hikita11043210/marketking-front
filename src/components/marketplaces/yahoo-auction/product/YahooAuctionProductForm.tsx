import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import type { SearchResult, ItemDetailResponse, CategoryInfo, ConditionOption } from '@/types/yahoo-auction';
import type { ShippingPolicy, PaymentPolicy, ReturnPolicy } from '@/types/ebay/policy';
import type { ItemSpecificsResponse } from '@/types/ebay/itemSpecifics';
import type { PriceCalculation } from '@/types/price';
import { extractShippingCost } from '@/lib/utils/price';
import { convertYahooDate } from '@/lib/utils/convert-date';
import { replaceSpecialCharacters } from '@/lib/utils/replace-special-characters';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { EbayStoreType } from '@/types/ebay-store-type';
interface LoadingButtonProps {
    loading: boolean;
    loadingText: string;
    defaultText: string;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    type?: 'button' | 'submit' | 'reset';
}

const LoadingButton = ({
    loading,
    loadingText,
    defaultText,
    onClick,
    disabled,
    className,
    size = 'default',
    type = 'button'
}: LoadingButtonProps) => {
    return (
        <Button
            className={`${className} relative min-w-[64px] px-2`}
            size={size}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
        >
            <span className={`${loading ? 'invisible' : ''}`}>
                {defaultText}
            </span>
            {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 absolute" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="invisible">{defaultText}</span>
                </span>
            )}
        </Button>
    );
};

interface ProductFormProps {
    detailData?: ItemDetailResponse | null;
    selectedItem: SearchResult;
    onCancel?: () => void;
    policies: {
        shipping: ShippingPolicy[];
        payment: PaymentPolicy[];
        return: ReturnPolicy[];
    };
    isLoadingPolicies: boolean;
    ebayStoreType: EbayStoreType[];
}
// フォームのバリデーションスキーマ
const productFormSchema = z.object({
    title: z.string()
        .min(1, { message: 'タイトルを入力してください' })
        .max(80, { message: 'タイトルは80文字以内で入力してください' }),
    titleCondition: z.string().optional(),
    description: z.string()
        .max(4000, { message: '説明は4000文字以内で入力してください' }),
    price: z.string().min(1, { message: '価格を入力してください' }),
    final_profit_yen: z.string(),
    final_profit_dollar: z.string(),
    original_price: z.string().optional(),
    shipping_cost: z.string().optional(),
    rate: z.string().optional(),
    ebay_fee: z.string().optional(),
    international_fee: z.string().optional(),
    tax_rate: z.string().optional(),
    calculated_price_yen: z.string().optional(),
    calculated_price_dollar: z.string().optional(),
    exchange_rate: z.string().optional(),
    ebay_shipping_price: z.number().optional(),
    quantity: z.string().min(1, { message: '数量を入力してください' }),
    condition: z.string().min(1, { message: '商品の状態を選択してください' }),
    conditionDescription: z.string().min(1, { message: '商品の詳細を入力してください' }),
    categoryId: z.string().min(1, { message: 'カテゴリーを選択してください' }),
    categoryName: z.string().optional(),
    currency: z.string().default('USD'),
    shippingPolicyId: z.string().min(1, { message: '配送ポリシーを選択してください' }),
    paymentPolicyId: z.string().min(1, { message: '支払いポリシーを選択してください' }),
    returnPolicyId: z.string().min(1, { message: '返品ポリシーを選択してください' }),
    ebayItemId: z.string().optional(),
    itemSpecifics: z.array(
        z.object({
            name: z.string().min(1, { message: '項目名を入力してください' }),
            value: z.array(
                z.string().min(1, { message: '値を入力してください' })
            ).min(1, { message: '少なくとも1つの値を入力してください' })
        })
    ).min(1, { message: '少なくとも1つの項目を追加してください' }),
    images: z.array(z.string()).min(1, '少なくとも1枚の画像を選択してください'),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export const ProductForm = ({
    detailData,
    selectedItem,
    onCancel,
    policies,
    isLoadingPolicies,
    ebayStoreType,
}: ProductFormProps) => {
    const [allImages, setAllImages] = useState<string[]>(detailData?.item_details.images.url || []);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categories, setCategories] = useState<CategoryInfo[]>(
        detailData?.category.map(cat => ({
            categoryId: cat.categoryId,
            categoryName: cat.categoryName,
            path: cat.path
        })) || []
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingItemSpecifics, setIsLoadingItemSpecifics] = useState(false);
    const [conditions, setConditions] = useState<ConditionOption[]>(
        detailData?.conditions.map(condition => ({
            conditionId: condition.conditionId,
            conditionDescription: condition.conditionDescription
        })) || []
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const description_template_start = `** Description **\n`;
    const description_template_end = `

** Shipping **
1. We always send the item with a tracking number. So please place an order without any concern on delivery. You can always track the delivery status.
2. Shipping is only available to the address registered in eBay. If you want us to send another address, please change your address on eBay and then place an order.
3. Shipping is available from Monday to Friday. Weekends are not available because freight (shipping) companies are closed.
4. We do not mark merchandise values below value or mark items as “gifts” – Japan, US and International government regulations prohibit such behavior.

** About Importer's Obligation **
Import duties, taxes, and charges are not included in the item price or shipping cost.
These charges are the buyer's responsibility. Please check with your country's customs office to determine what these additional costs will be prior to bidding or buying.
Thank you for your understanding.
`;
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: replaceSpecialCharacters(detailData?.title_en || ''),
            titleCondition: '',
            description: description_template_start + detailData?.description_en.replace(/(\. )/g, ".\n") + description_template_end || '',
            price: detailData?.price.calculated_price_dollar.toString(),
            final_profit_yen: detailData?.price.final_profit_yen.toString(),
            final_profit_dollar: detailData?.price.final_profit_dollar.toString(),
            original_price: detailData?.price.original_price?.toString() || '',
            shipping_cost: detailData?.price.shipping_cost?.toString() || '',
            rate: detailData?.price.rate?.toString() || '',
            ebay_fee: detailData?.price.ebay_fee?.toString() || '',
            international_fee: detailData?.price.international_fee?.toString() || '',
            tax_rate: detailData?.price.tax_rate?.toString() || '',
            calculated_price_yen: detailData?.price.calculated_price_yen?.toString() || '',
            calculated_price_dollar: detailData?.price.calculated_price_dollar?.toString() || '',
            exchange_rate: detailData?.price.exchange_rate?.toString() || '',
            ebay_shipping_price: 3000,
            quantity: "1",
            condition: detailData?.selected_condition.toString() || '',
            conditionDescription: detailData?.condition_description_en.translated_text,
            categoryId: detailData?.category_id,
            ebayItemId: '',
            shippingPolicyId: "263632634014",
            paymentPolicyId: "263467812014",
            returnPolicyId: "264716224014",
            itemSpecifics: Array.isArray(detailData?.item_specifics)
                ? detailData.item_specifics.map(item => {
                    const [key, value] = Object.entries(item)[0];
                    return {
                        name: key,
                        value: [typeof value === 'string' ? value : '']
                    };
                })
                : [{ name: '', value: [''] }],
            images: detailData?.item_details.images.url || [],
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

            if (data.success && Array.isArray(data.data)) {
                setCategories(data.data.map((category: { categoryId: string; categoryName: string }) => ({
                    ...category,
                    path: `${category.categoryName}`
                })));
            } else {
                setCategories([]);
                throw new Error(data.message || 'カテゴリーの検索に失敗しました');
            }
        } catch (error) {
            setCategories([]);
            toast.error(error instanceof Error ? error.message : 'カテゴリーの検索に失敗しました');
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
            toast.error('翻訳するテキストを入力してください');
            return;
        }

        try {
            const response = await fetch(`/api/translate?text=${encodeURIComponent(value)}`);
            const data = await response.json();
            if (data.success) {
                form.setValue('description', data.data.translated_text);
                toast.success('翻訳が完了しました');
            } else {
                throw new Error(data.message || '翻訳に失敗しました');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '翻訳に失敗しました');
        }
    };

    // Item Specifics関連の処理
    const handleFetchItemSpecifics = async () => {
        const ebayItemId = form.getValues('ebayItemId');
        if (!ebayItemId) {
            toast.error('eBay商品IDを入力してください');
            return;
        }

        try {
            const response = await fetch(`/api/ebay/itemSpecifics?ebayItemId=${ebayItemId}`);
            const data: ItemSpecificsResponse = await response.json();
            if (data.success && data.data?.item_specifics) {
                const currentItemSpecifics = form.getValues('itemSpecifics');

                data.data.item_specifics.forEach((spec: { name: string; values: string[] }) => {
                    // 既存の項目名を検索
                    const existingIndex = currentItemSpecifics.findIndex(
                        item => item.name.toLowerCase() === spec.name.toLowerCase()
                    );

                    if (existingIndex === -1) {
                        // 新規項目の場合は追加
                        appendItemSpecific({
                            name: spec.name,
                            value: spec.values
                        }, { focusIndex: -1 });
                    } else {
                        // 既存の項目の場合は値を更新
                        const updatedItemSpecifics = [...currentItemSpecifics];
                        updatedItemSpecifics[existingIndex].value = spec.values;
                        form.setValue('itemSpecifics', updatedItemSpecifics);
                    }
                });

                toast.success('Item Specificsを取得しました');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Item Specificsの取得に失敗しました');
        }
    };

    const handleAddItemSpecific = () => {
        appendItemSpecific({ name: '', value: [''] });
    };

    const handleRemoveItemSpecific = (index: number) => {
        if (itemSpecificsFields.length === 1) {
            toast.error('少なくとも1つのItem Specificsが必要です');
            return;
        }
        removeItemSpecific(index);
    };

    const handlePriceChange = async () => {
        const value = form.getValues('price');
        // カンマを削除して数値処理
        const numericValue = value.replace(/,/g, '');

        if (!numericValue) {
            form.setValue('final_profit_yen', '0');
            form.setValue('final_profit_dollar', '0');
            return;
        }

        const priceArray = [
            selectedItem.buy_now_price || selectedItem.price || '0',
            extractShippingCost(selectedItem.shipping || '0'),
        ];

        try {
            const response = await fetch(`/api/calculator/price?${priceArray.map(price => `money[]=${encodeURIComponent(price)}`).join('&')}&price=${encodeURIComponent(numericValue)}`);
            const data = await response.json();
            if (data.success) {
                // 全ての計算値をフォームにセット
                form.setValue('original_price', data.data.original_price.toString());
                form.setValue('shipping_cost', data.data.shipping_cost.toString());
                form.setValue('rate', data.data.rate.toString());
                form.setValue('ebay_fee', data.data.ebay_fee.toString());
                form.setValue('international_fee', data.data.international_fee.toString());
                form.setValue('tax_rate', data.data.tax_rate.toString());
                form.setValue('calculated_price_yen', data.data.calculated_price_yen.toString());
                form.setValue('calculated_price_dollar', data.data.calculated_price_dollar.toString());
                form.setValue('exchange_rate', data.data.exchange_rate.toString());
                form.setValue('final_profit_yen', data.data.final_profit_yen.toString());
                form.setValue('final_profit_dollar', data.data.final_profit_dollar.toString());
            }
        } catch (error) {
            console.error('価格計算エラー:', error);
        }
    };

    const handleCategorySelect = async (title: string, description: string, categoryId: string) => {
        try {
            setIsLoadingItemSpecifics(true);
            // 既存のCondition取得処理
            const conditionResponse = await fetch(`/api/ebay/condition?categoryId=${categoryId}`);
            const conditionData = await conditionResponse.json();
            if (conditionData.success && conditionData.data) {
                setConditions(conditionData.data);
                // 初期値として最初のコンディションをセット
                if (conditionData.data.length > 0) {
                    form.setValue('condition', conditionData.data[0].conditionId);
                }
            }

            // Item Specifics取得処理を追加
            const itemSpecificsResponse = await fetch(`/api/ebay/categoryItemSpecifics?categoryId=${categoryId}&title=${title}&description=${description}`);
            const itemSpecificsData = await itemSpecificsResponse.json();
            if (itemSpecificsData.success && itemSpecificsData.data && itemSpecificsData.data.specifics) {
                // 既存のItem Specificsをクリア
                form.setValue('itemSpecifics', []);

                // 配列形式のデータを処理
                itemSpecificsData.data.specifics.forEach((item: Record<string, string>) => {
                    const [name, value] = Object.entries(item)[0];
                    appendItemSpecific({
                        name: name,
                        value: [typeof value === 'string' ? value : '']
                    }, { focusIndex: -1 });
                });

                toast.success('必須のItem Specificsを更新しました');
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Conditionの取得に失敗しました');
        } finally {
            setIsLoadingItemSpecifics(false);
        }
    };

    const handleSubmit = async (values: ProductFormValues) => {
        try {
            setIsSubmitting(true);
            // タイトルの先頭にコンディションを追加
            const finalTitle = values.titleCondition != ""
                ? `"${values.titleCondition}" ${values.title}`
                : values.title;

            // 説明文の改行を<br>タグに変換して保存
            const formattedDescription = values.description.replace(/\n/g, '<br>');

            const productData = {
                product_data: {
                    images: values.images,
                    title: finalTitle,
                    description: formattedDescription,
                    price: values.price,
                    quantity: parseInt(values.quantity),
                    categoryId: values.categoryId,
                    condition: {
                        conditionId: values.condition,
                        conditionDescription: conditions.find(c => c.conditionId === values.condition)?.conditionDescription || '',
                    },
                    conditionDescription: values.conditionDescription ?? '',
                    shippingPolicyId: values.shippingPolicyId,
                    paymentPolicyId: values.paymentPolicyId,
                    returnPolicyId: values.returnPolicyId,
                    itemSpecifics: {
                        nameValueList: values.itemSpecifics,
                    },
                },
                yahoo_auction_data: {
                    yahoo_auction_id: detailData?.item_details.auction_id,
                    yahoo_auction_url: selectedItem.url,
                    yahoo_auction_item_name: selectedItem.title,
                    yahoo_auction_item_price: selectedItem.buy_now_price || selectedItem.price,
                    yahoo_auction_shipping: extractShippingCost(selectedItem.shipping || '0'),
                    yahoo_auction_end_time: detailData?.item_details.end_time,
                },
                other_data: {
                    ebay_shipping_price: values.ebay_shipping_price,
                    original_price: values.original_price,
                    shipping_cost: values.shipping_cost,
                    rate: values.rate,
                    ebay_fee: values.ebay_fee,
                    international_fee: values.international_fee,
                    tax_rate: values.tax_rate,
                    calculated_price_yen: values.calculated_price_yen,
                    calculated_price_dollar: values.calculated_price_dollar,
                    exchange_rate: values.exchange_rate,
                    final_profit_yen: values.final_profit_yen,
                    final_profit_dollar: values.final_profit_dollar,
                }
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

            toast.success('商品を登録しました');

            // 成功時のコールバック
            if (onCancel) {
                onCancel();
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : '商品の登録に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTranslateTitle = async (value: string) => {
        if (!value) {
            toast.error('翻訳するテキストを入力してください');
            return;
        }

        try {
            const response = await fetch(`/api/translate?text=${encodeURIComponent(value)}`);
            const data = await response.json();
            if (data.success) {
                form.setValue('title', data.data.translated_text);
                toast.success('翻訳が完了しました');
            } else {
                throw new Error(data.message || '翻訳に失敗しました');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '翻訳に失敗しました');
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
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80">
                            <div className="space-y-2 text-sm">
                                <p><span className="font-bold">New:</span> 新品</p>
                                <p><span className="font-bold">New other:</span> 新品だけど一度人手に渡って開封され検品済みなどがここに分類される。Used扱い。</p>
                                <p><span className="font-bold">Unopened:</span> 未開封品</p>
                                <p><span className="font-bold">Top mint:</span> 非常に良い、その中でも最上位</p>
                                <p><span className="font-bold">Mint:</span> 非常に良い</p>
                                <p><span className="font-bold">Near mint:</span> Mintに近いが少し使用感はある</p>
                                <p><span className="font-bold">Excellent+++++:</span> 使用感や傷はあるが程度はそこそこ良い</p>
                                <p><span className="font-bold">Excellent+++:</span> 使用感や傷がある並品</p>
                                <p><span className="font-bold">Excellent:</span> かなりの使用感や傷がある並品</p>
                                <p><span className="font-bold">Very good:</span> 並品以下で一部特記事項あり</p>
                                <p><span className="font-bold">AS-IS:</span> 現状品、不具合あり</p>
                                <p><span className="font-bold">For Parts:</span> 部品取り品。ジャンク品</p>
                                <p><span className="font-bold">Junk:</span> ジャンク品</p>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className="text-muted-foreground">タイトル</FormLabel>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {((field.value?.length || 0) + (form.getValues('titleCondition')?.length || 0) + 2)} / 80文字
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
                                        onClick={() => handleTranslateTitle(field.value)}
                                    >
                                        翻訳
                                    </Button>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <FormField
                                    control={form.control}
                                    name="titleCondition"
                                    render={({ field }) => (
                                        <FormItem className="grid grid-cols-[200px,1fr] items-center">
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    // "none" が選択された場合は空文字列を設定
                                                    field.onChange(value === "none" ? "" : value);
                                                }}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="h-11">
                                                        <SelectValue placeholder="" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">選択なし</SelectItem>
                                                    <SelectItem value="New">New</SelectItem>
                                                    <SelectItem value="New other">New other</SelectItem>
                                                    <SelectItem value="Unopened">Unopened</SelectItem>
                                                    <SelectItem value="Top mint">Top mint</SelectItem>
                                                    <SelectItem value="Mint">Mint</SelectItem>
                                                    <SelectItem value="Near mint">Near mint</SelectItem>
                                                    <SelectItem value="Excellent+++++">Excellent+++++</SelectItem>
                                                    <SelectItem value="Excellent+++">Excellent+++</SelectItem>
                                                    <SelectItem value="Excellent">Excellent</SelectItem>
                                                    <SelectItem value="Very good">Very good</SelectItem>
                                                    <SelectItem value="AS-IS">AS-IS</SelectItem>
                                                    <SelectItem value="For Parts">For Parts</SelectItem>
                                                    <SelectItem value="Junk">Junk</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormControl>
                                    <Input {...field} className="h-11 flex-1" />
                                </FormControl>
                            </div>
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
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {field.value.length === 0 ? 0 : field.value.length + (field.value.split('\n').length) * 7} / 4000文字
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
                                        onClick={() => handleTranslateDescription(field.value)}
                                    >
                                        翻訳
                                    </Button>
                                </div>
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
                                        maxLength={5}
                                        placeholder="価格（＄）"
                                        value={field.value ? field.value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                        onChange={(e) => {
                                            // カンマを削除して数値のみを保持
                                            const rawValue = e.target.value.replace(/,/g, '');
                                            // 数値とドット以外を削除
                                            const sanitizedValue = rawValue.replace(/[^\d.]/g, '');
                                            // 小数点が2つ以上ある場合、最初の小数点以外を削除
                                            const finalValue = sanitizedValue.replace(/\.(?=.*\.)/g, '');

                                            field.onChange(finalValue);
                                            handlePriceChange();
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
                        name="final_profit_yen"
                        render={({ field }) => (
                            <FormItem>
                                <div className="h-11 px-3 border rounded-md bg-muted flex items-center text-muted-foreground">
                                    ￥{Number(field.value).toLocaleString()}
                                </div>
                                <FormControl>
                                    <Input
                                        type="hidden"
                                        {...form.register('final_profit_dollar')}
                                    />
                                </FormControl>
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
                                className="ml-2 bg-blue-100 hover:bg-blue-200 text-blue-700"
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
                                                handleCategorySelect(detailData?.item_details.title ?? '', detailData?.item_details.description ?? '', value);
                                            }
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.length > 0 ? (
                                                categories.map((category) => (
                                                    <SelectItem
                                                        key={category.categoryId}
                                                        value={category.categoryId}
                                                    >
                                                        {category.categoryName}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground">
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

                <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                        <FormItem className="grid grid-cols-[200px,1fr] items-center">
                            <FormLabel className="text-muted-foreground">商品の状態</FormLabel>
                            <div>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {conditions.map((condition) => (
                                            <SelectItem key={condition.conditionId} value={condition.conditionId}>
                                                {condition.conditionDescription}
                                            </SelectItem>
                                        ))}
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

                {/* ポリシー選択 */}
                <div className="grid grid-cols-[200px,1fr] items-start">
                    <FormLabel className="text-muted-foreground">ポリシー選択</FormLabel>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="shippingPolicyId"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11" disabled={isLoadingPolicies}>
                                                <SelectValue placeholder={isLoadingPolicies ? "読み込み中..." : ""} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {policies.shipping.map((policy) => (
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
                                                <SelectValue placeholder={isLoadingPolicies ? "読み込み中..." : ""} />
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
                                                <SelectValue placeholder={isLoadingPolicies ? "読み込み中..." : ""} />
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
                        <div className="text-sm font-medium text-muted-foreground">商品詳細</div>
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
                                className="h-11 bg-blue-200 hover:bg-blue-200 text-blue-700"
                            >
                                商品詳細を取得
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
                                    render={({ field, fieldState }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    value={field.value?.join(', ')}
                                                    onChange={(e) => field.onChange(e.target.value.split(', ').map(v => v.trim()))}
                                                    placeholder="値（複数ある場合はカンマ区切り）"
                                                    className="w-full"
                                                />
                                            </FormControl>
                                            {fieldState.error && (
                                                <FormMessage>
                                                    {fieldState.error.message ?? '無効な入力値です'}
                                                </FormMessage>
                                            )}
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
                    <LoadingButton
                        loading={isSubmitting}
                        loadingText="登録中..."
                        defaultText="登録"
                        type="submit"
                        className="h-11 px-8 bg-blue-700 hover:bg-blue-800 text-white"
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Form>
    );
}; 