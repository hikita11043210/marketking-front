import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PolicySelector } from './PolicySelector';
import { CategorySelector } from './CategorySelector';
import { ItemSpecifics } from './ItemSpecifics';
import { useToast } from '@/hooks/use-toast';
import type { EbayRegisterData } from '@/types/product';
import { useState } from 'react';
import { productFormSchema, type ProductFormValues } from '@/validations/product';
import { Editor } from '@/components/blocks/editor-00/editor'
import { Checkbox } from "@/components/ui/checkbox";
import type { SearchDetailResult } from '@/types/search';

interface ProductFormProps {
    initialData?: SearchDetailResult | null;
    onCancel?: () => void;
}

export const ProductForm = ({ initialData, onCancel }: ProductFormProps) => {
    const { toast } = useToast();
    const [allImages, setAllImages] = useState<string[]>(initialData?.images.url || []);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: '',
            price: initialData?.current_price || '',
            quantity: "1",
            condition: initialData?.condition || '1000',
            categoryId: initialData?.categories[0] || '',
            ebayItemId: '',
            itemSpecifics: [
                { name: 'Brand', value: [''] },
                { name: 'Type', value: [''] },
                { name: 'Model', value: [''] }
            ],
            images: initialData?.images.url || [],
        },
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
                    nameValueList: values.itemSpecifics || [],
                },
                images: values.images,
            };
            console.log(productData.images);
            //登録処理

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
                {allImages.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground">選択画像（最大24枚）</div>
                        <div className="grid grid-cols-5 gap-2">
                            {allImages.map((url, index) => (
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
                            <FormLabel className="text-muted-foreground">説明</FormLabel>
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
                            <FormLabel className="text-muted-foreground">価格</FormLabel>
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
                            <FormLabel className="text-muted-foreground">数量</FormLabel>
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
                            <FormLabel className="text-muted-foreground">商品の状態</FormLabel>
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
                            <FormLabel className="text-muted-foreground">商品の状態の説明</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="商品の状態について詳しく説明してください" className="min-h-[100px] resize-none" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <CategorySelector form={form} />

                <PolicySelector form={form} />

                <ItemSpecifics form={form} />

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