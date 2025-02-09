import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { PolicySelector } from './PolicySelector';
import { useToast } from '@/hooks/use-toast';
import { ebayApi } from '@/lib/api/endpoint/ebay';
import { EbayRegisterData } from '@/lib/types/product';
import { useState } from 'react';
import { productFormSchema, type ProductFormValues } from '@/lib/validations/product';
import { Editor } from '@/components/blocks/editor-00/editor'

interface ProductFormProps {
    initialData?: Partial<EbayRegisterData>;
    onSubmit?: (data: EbayRegisterData) => void;
    onCancel?: () => void;
}

export const ProductForm = ({ initialData, onSubmit, onCancel }: ProductFormProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [itemSpecifics, setItemSpecifics] = useState<Array<{ name: string; value: string[] }>>([]);
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            price: initialData?.startPrice?.value || '',
            quantity: String(initialData?.quantity || '1'),
            condition: initialData?.condition?.conditionId || '1000',
            categoryId: initialData?.primaryCategory?.categoryId || '',
            fulfillmentPolicyId: initialData?.fulfillmentPolicyId || '',
            paymentPolicyId: initialData?.paymentPolicyId || '',
            returnPolicyId: initialData?.returnPolicyId || '',
            ebayItemId: '',
            itemSpecifics: initialData?.itemSpecifics?.nameValueList || [
                { name: 'Brand', value: [''] },
                { name: 'Type', value: [''] },
                { name: 'Model', value: [''] }
            ],
        },
    });

    const { fields, append } = useFieldArray({
        control: form.control,
        name: "itemSpecifics"
    });

    const handleSubmit = async (values: ProductFormValues) => {
        try {
            const productData: EbayRegisterData = {
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
                    conditionDescription: values.conditionDescription,
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
                    nameValueList: values.itemSpecifics || [],
                },

            };

            const response = await ebayApi.register(productData);
            if (response.success) {
                toast({
                    title: '成功',
                    description: '商品を登録しました',
                });
                onSubmit?.(productData);
            } else {
                throw new Error(response.message || '商品の登録に失敗しました');
            }
        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : '商品の登録に失敗しました',
                variant: 'destructive',
            });
        }
    };

    const handleFetchItemSpecifics = async () => {
        const ebayItemId = form.getValues('ebayItemId');
        if (!ebayItemId) {
            toast({
                title: 'エラー',
                description: 'eBay商品IDを入力してください',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsLoading(true);
            // 既存のフィールドをクリア
            form.setValue('itemSpecifics', []);

            // テスト用のサンプルデータを追加
            const testSpecs = [
                { name: 'ブランド', value: ['テストブランド'] },
                { name: '型番', value: ['TEST-001'] },
                { name: 'カラー', value: ['ブラック'] },
                { name: 'サイズ', value: ['M'] },
                { name: '素材', value: ['コットン'] }
            ];

            // 各テストデータを1つずつappendで追加
            testSpecs.forEach(spec => {
                append(spec);
            });

            // 取得したItem Specifics表示用
            setItemSpecifics(testSpecs);

            toast({
                title: '成功',
                description: 'テスト用のItem Specificsを追加しました',
            });

        } catch (error) {
            toast({
                title: 'エラー',
                description: error instanceof Error ? error.message : 'Item Specificsの取得に失敗しました',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground">タイトル</FormLabel>
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
                            <FormLabel className="text-foreground">説明</FormLabel>
                            <Editor
                                editorSerializedState={field.value ? JSON.parse(field.value) : undefined}
                                onSerializedChange={(value) => {
                                    field.onChange(JSON.stringify(value));
                                }}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground">価格</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" className="h-11" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground">数量</FormLabel>
                            <FormControl>
                                <Input {...field} type="number" className="h-11" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground">商品の状態</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="商品の状態を選択" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="1000">新品</SelectItem>
                                    <SelectItem value="2000">中古</SelectItem>
                                    <SelectItem value="3000">未使用に近い</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="conditionDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground">商品の状態の説明</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="商品の状態について詳しく説明してください" className="min-h-[100px] resize-none" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-foreground">カテゴリー</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="カテゴリーを選択" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="31388">デジタルカメラ</SelectItem>
                                    <SelectItem value="2">カテゴリー2</SelectItem>
                                    <SelectItem value="3">カテゴリー3</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <PolicySelector form={form} />

                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-specifics">
                        <div className="flex items-center justify-between">
                            <AccordionTrigger className="flex-1">Item Specifics</AccordionTrigger>
                            <div className="flex items-center gap-2 px-4">
                                <FormField
                                    control={form.control}
                                    name="ebayItemId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input {...field} placeholder="eBay商品ID" className="h-9 w-[200px]" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleFetchItemSpecifics}
                                    disabled={isLoading}
                                    className="h-9"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm mr-2"></span>
                                            取得中...
                                        </>
                                    ) : (
                                        'Item Specificsを取得'
                                    )}
                                </Button>
                            </div>
                        </div>
                        <AccordionContent>
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {fields.map((field, index) => (
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
                                                name={`itemSpecifics.${index}.value.0`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="値"
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        append({ name: '', value: [''] });
                                    }}
                                    className="w-full mt-4"
                                >
                                    項目を追加
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="flex justify-end gap-3">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-8">
                            キャンセル
                        </Button>
                    )}
                    <Button type="submit" className="h-11 px-8">
                        登録
                    </Button>
                </div>
            </form>
        </Form>
    );
}; 