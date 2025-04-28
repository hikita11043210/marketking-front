'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SalesItem } from '@/types/accounting';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// バリデーションスキーマの定義
const salesFormSchema = z.object({
    transaction_date: z.string().min(1, "取引日を選択してください"),
    product_name: z.string().min(1, "商品名を入力してください"),
    management_code: z.string().min(1, "管理コードを入力してください"),
    quantity: z.coerce.number().min(1, "1以上の数量を入力してください"),
    price: z.coerce.number().min(0, "0以上の金額を入力してください"),
    tax: z.coerce.number().min(0, "0以上の金額を入力してください"),
    shipping_cost: z.coerce.number().min(0, "0以上の金額を入力してください"),
    total_amount: z.coerce.number().min(0, "0以上の金額を入力してください"),
    url: z.string().optional(),
    invoice_number: z.string().optional(),
    identification_type: z.string().optional(),
    identification_number: z.string().optional(),
    // 顧客情報
    client_name: z.string().optional(),
    client_company_name: z.string().optional(),
    client_postal_code: z.string().optional(),
    client_address: z.string().optional(),
    client_occupation: z.string().optional(),
    client_age: z.coerce.number().optional(),
});

type SalesFormValues = z.infer<typeof salesFormSchema>;

interface SalesFormProps {
    sale?: SalesItem;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<SalesItem>) => Promise<void>;
    isSubmitting?: boolean;
}

export function SalesForm({ sale, isOpen, onClose, onSubmit, isSubmitting = false }: SalesFormProps) {
    const [activeTab, setActiveTab] = useState('basic');

    const form = useForm<SalesFormValues>({
        resolver: zodResolver(salesFormSchema),
        defaultValues: {
            transaction_date: format(new Date(), 'yyyy-MM-dd'),
            product_name: '',
            management_code: '',
            quantity: 1,
            price: 0,
            tax: 0,
            shipping_cost: 0,
            total_amount: 0,
            url: '',
            invoice_number: '',
            identification_type: '',
            identification_number: '',
            client_name: '',
            client_company_name: '',
            client_postal_code: '',
            client_address: '',
            client_occupation: '',
            client_age: undefined,
        },
    });

    // 既存データの読み込み
    useEffect(() => {
        if (sale) {
            const values = {
                transaction_date: format(new Date(sale.transaction_date), 'yyyy-MM-dd'),
                product_name: sale.product_name,
                management_code: sale.management_code,
                quantity: sale.quantity,
                price: sale.price,
                tax: sale.tax,
                shipping_cost: sale.shipping_cost,
                total_amount: sale.total_amount,
                url: sale.url || '',
                invoice_number: sale.invoice_number || '',
                identification_type: sale.identification_type || '',
                identification_number: sale.identification_number || '',
                client_name: sale.client_name || '',
                client_company_name: sale.client_company_name || '',
                client_postal_code: sale.client_postal_code || '',
                client_address: sale.client_address || '',
                client_occupation: sale.client_occupation || '',
                client_age: sale.client_age,
            };
            // 値をセットしてからバリデーションを実行
            form.reset(values, {
                keepIsSubmitted: false,
                keepSubmitCount: false,
                keepErrors: false,
                keepIsValid: false,
                keepDirty: false,
                keepTouched: false,
                keepDefaultValues: false
            });
        } else {
            form.reset({
                transaction_date: format(new Date(), 'yyyy-MM-dd'),
                product_name: '',
                management_code: '',
                quantity: 1,
                price: 0,
                tax: 0,
                shipping_cost: 0,
                total_amount: 0,
                url: '',
                invoice_number: '',
                identification_type: '',
                identification_number: '',
                client_name: '',
                client_company_name: '',
                client_postal_code: '',
                client_address: '',
                client_occupation: '',
                client_age: undefined,
            });
        }
    }, [sale, form]);

    // 小計・消費税・合計を自動計算（数量・単価・税・送料のいずれかが変更された場合のみ）
    useEffect(() => {
        // 値が変更された場合は常に自動計算を実行
        const quantity = Number(form.watch('quantity')) || 0;
        const price = Number(form.watch('price')) || 0;
        const tax = Number(form.watch('tax')) || 0;
        const shipping_cost = Number(form.watch('shipping_cost')) || 0;

        // 粗利の計算: 単価×数量+消費税-送料
        const subtotal = quantity * price;
        const total = subtotal + tax - shipping_cost;

        // NaNチェック
        if (!isNaN(total)) {
            // フォームの値が変更された場合のみ更新
            if (form.formState.isDirty) {
                form.setValue('total_amount', total, { shouldValidate: true });
            }
        }
    }, [form.watch('quantity'), form.watch('price'), form.watch('tax'), form.watch('shipping_cost'), form]);

    const handleSubmit = async (values: SalesFormValues) => {
        // フォームデータをAPIの形式に変換
        const formattedData: Partial<SalesItem> = {
            transaction_date: values.transaction_date,
            product_name: values.product_name,
            management_code: values.management_code,
            quantity: values.quantity,
            price: values.price,
            tax: values.tax,
            shipping_cost: values.shipping_cost,
            total_amount: values.total_amount,
            url: values.url,
            invoice_number: values.invoice_number,
            identification_type: values.identification_type,
            identification_number: values.identification_number,
            client_name: values.client_name,
            client_company_name: values.client_company_name,
            client_postal_code: values.client_postal_code,
            client_address: values.client_address,
            client_occupation: values.client_occupation,
            client_age: values.client_age,
        };

        // 既存の売上データがある場合はIDを追加
        if (sale?.id) {
            formattedData.id = sale.id;
        }

        await onSubmit(formattedData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                    <DialogTitle>{sale ? '売上データ編集' : '新規売上データ登録'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">基本情報</TabsTrigger>
                                <TabsTrigger value="client">顧客情報</TabsTrigger>
                                <TabsTrigger value="other">その他情報</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="transaction_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>取引日 *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="date"
                                                        placeholder="取引日"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="product_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>商品名 *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="商品名を入力" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="management_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>管理コード *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="SKU-001" {...field} />
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
                                                <FormLabel>数量 *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>単価 *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tax"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>消費税 *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="shipping_cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>送料 *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="total_amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>粗利 *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" readOnly {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="client" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="client_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>顧客名</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="顧客名を入力" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="client_company_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>会社名</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="会社名を入力" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="client_postal_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>郵便番号</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123-4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="client_address"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>住所</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="住所を入力"
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="client_occupation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>職業</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="職業を入力" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="client_age"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>年齢</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        placeholder="年齢を入力"
                                                        value={field.value || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                                                            field.onChange(value);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="other" className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="invoice_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>請求書番号</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="INV-001" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="url"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>URL</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="https://example.com"
                                                        type="url"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="identification_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>識別タイプ</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="識別タイプを入力" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="identification_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>識別番号</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="識別番号を入力" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={onClose}>キャンセル</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        保存中...
                                    </>
                                ) : (
                                    "保存"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 