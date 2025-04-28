'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ExpenseItem } from '@/types/accounting';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// スキーマ定義
const expenseFormSchema = z.object({
    transaction_date: z.string().min(1, '取引日を選択してください'),
    product_name: z.string().min(1, '商品名を入力してください'),
    detail: z.string().optional(),
    price: z.coerce.number().min(0, '価格は0以上で入力してください'),
    tax: z.coerce.number().min(0, '消費税は0以上で入力してください'),
    shipping_cost: z.coerce.number().min(0, '送料は0以上で入力してください'),
    total_amount: z.coerce.number().min(0, '合計金額は0以上で入力してください'),
    url: z.string().optional(),
    client_name: z.string().optional(),
    client_company_name: z.string().optional(),
    client_postal_code: z.string().optional(),
    client_address: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpensesFormProps {
    expense?: ExpenseItem;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<ExpenseItem>) => void;
    isSubmitting?: boolean;
}

export function ExpensesForm({ expense, isOpen, onClose, onSubmit, isSubmitting = false }: ExpensesFormProps) {
    const [activeTab, setActiveTab] = useState('basic');

    // フォーム初期化
    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseFormSchema),
        defaultValues: {
            transaction_date: format(new Date(), 'yyyy-MM-dd'),
            product_name: '',
            detail: '',
            price: 0,
            tax: 0,
            shipping_cost: 0,
            total_amount: 0,
            url: '',
            client_name: '',
            client_company_name: '',
            client_postal_code: '',
            client_address: '',
        },
    });

    // 編集時のデータ設定
    useEffect(() => {
        if (isOpen) {
            if (expense) {
                const formattedExpense = {
                    ...expense,
                    id: expense.id,
                    transaction_date: format(new Date(expense.transaction_date), 'yyyy-MM-dd'),
                };
                form.reset(formattedExpense, {
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
                    detail: '',
                    price: 0,
                    tax: 0,
                    shipping_cost: 0,
                    total_amount: 0,
                    url: '',
                    client_name: '',
                    client_company_name: '',
                    client_postal_code: '',
                    client_address: '',
                });
            }
        }
    }, [expense, isOpen, form]);

    // 価格や税などが変更されたときに合計金額を自動計算
    useEffect(() => {
        // 値が変更された場合は常に自動計算を実行
        const price = Number(form.watch('price')) || 0;
        const tax = Number(form.watch('tax')) || 0;
        const shipping = Number(form.watch('shipping_cost')) || 0;

        // 合計の計算: 価格+消費税+送料
        const total = price + tax + shipping;

        // NaNチェック
        if (!isNaN(total)) {
            // フォームの値が変更された場合のみ更新
            if (form.formState.isDirty) {
                form.setValue('total_amount', total, { shouldValidate: true });
            }
        }
    }, [
        form.watch('price'),
        form.watch('tax'),
        form.watch('shipping_cost'),
        form
    ]);

    const handleSubmit = (values: ExpenseFormValues) => {
        console.log('フォーム送信:', values);

        // フォームデータをAPIの形式に変換
        const formattedData: Partial<ExpenseItem> = {
            transaction_date: values.transaction_date,
            product_name: values.product_name,
            detail: values.detail,
            price: values.price,
            tax: values.tax,
            shipping_cost: values.shipping_cost,
            total_amount: values.total_amount,
            url: values.url,
            client_name: values.client_name,
            client_company_name: values.client_company_name,
            client_postal_code: values.client_postal_code,
            client_address: values.client_address,
        };

        // 既存の経費データがある場合はIDを追加
        if (expense?.id) {
            formattedData.id = expense.id;
        }

        onSubmit(formattedData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                    <DialogTitle>{expense ? '経費データ編集' : '新規経費データ登録'}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">基本情報</TabsTrigger>
                                <TabsTrigger value="client">取引先情報</TabsTrigger>
                                <TabsTrigger value="other">その他情報</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-4">
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
                                                    <Input placeholder="商品名" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="detail"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>詳細</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="詳細情報" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>価格 *</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
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
                                                <FormLabel>消費税</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
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
                                                <FormLabel>送料</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="total_amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>合計金額</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    className="bg-gray-100"
                                                    readOnly
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="client" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="client_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>取引先 氏名</FormLabel>
                                            <FormControl>
                                                <Input placeholder="山田太郎" {...field} />
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
                                            <FormLabel>取引先 会社名</FormLabel>
                                            <FormControl>
                                                <Input placeholder="株式会社サンプル" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="client_postal_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>取引先 郵便番号</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123-4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="client_address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>取引先 住所</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="東京都渋谷区..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="other" className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                キャンセル
                            </Button>
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