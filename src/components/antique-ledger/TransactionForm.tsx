import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { transactionSchema } from "@/validations/antique-ledger";
import { Transaction, TransactionFormValues, TransactionType } from "@/types/antique-ledger";

interface TransactionFormProps {
    defaultValues?: Transaction;
    onSubmit: (values: z.infer<typeof transactionSchema>) => Promise<void>;
    onCancel: () => void;
    readOnly?: boolean;
}

export function TransactionForm({ defaultValues, onSubmit, onCancel, readOnly = false }: TransactionFormProps) {
    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof transactionSchema>>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            transaction_date: defaultValues?.transaction_date || new Date().toISOString().split('T')[0],
            transaction_type: defaultValues?.transaction_type.toString() || "",
            product_name: defaultValues?.product_name || "",
            management_code: defaultValues?.management_code || "",
            url: defaultValues?.url || "",
            identification_type: defaultValues?.identification_type || "運転免許証",
            identification_number: defaultValues?.identification_number || "12345",
            quantity: defaultValues?.quantity || 1,
            price: defaultValues?.price || 0,
            client_name: defaultValues?.client_name || "",
            client_company_name: defaultValues?.client_company_name || "",
            client_postal_code: defaultValues?.client_postal_code || "",
            client_address: defaultValues?.client_address || "",
            client_occupation: defaultValues?.client_occupation || "",
            client_age: defaultValues?.client_age || null,
        },
    });

    useEffect(() => {
        const fetchTransactionTypes = async () => {
            try {
                const response = await fetch("/api/antique-ledger/transaction-types");
                const data = await response.json();

                if (response.ok && data) {
                    setTransactionTypes(data);
                } else {
                    toast.error("取引区分の取得に失敗しました");
                }
            } catch (error) {
                toast.error("取引区分の取得中にエラーが発生しました");
            }
        };

        fetchTransactionTypes();
    }, []);

    const handleSubmit = async (values: z.infer<typeof transactionSchema>) => {
        if (readOnly) return;

        setIsLoading(true);
        try {
            await onSubmit(values);
        } catch (error) {
            toast.error("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="transaction_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>取引年月日</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        {...field}
                                        disabled={readOnly}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="transaction_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>取引区分</FormLabel>
                                <Select
                                    disabled={readOnly}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="取引区分を選択してください" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {transactionTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                {type.value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="product_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>品名</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={readOnly}
                                        placeholder="例: アンティーク時計"
                                    />
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
                                <FormLabel>管理コード</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={readOnly}
                                        placeholder="例: CLOCK001"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>商品URL</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={readOnly}
                                    placeholder="例: https://example.com/item/123"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="identification_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>本人確認情報種類</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={readOnly}
                                        placeholder="例: 運転免許証"
                                    />
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
                                <FormLabel>本人確認情報番号</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={readOnly}
                                        placeholder="例: 12345"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>数量</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        disabled={readOnly}
                                        min={1}
                                    />
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
                                <FormLabel>代価</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        disabled={readOnly}
                                        min={0}
                                        placeholder="例: 15000"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>取引先名前</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={readOnly}
                                    placeholder="例: 山田太郎"
                                />
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
                            <FormLabel>取引先会社名</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={readOnly}
                                    placeholder="例: 株式会社サンプル"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="client_postal_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>取引先郵便番号</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={readOnly}
                                        placeholder="例: 150-0002"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="client_address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>取引先住所</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={readOnly}
                                        placeholder="例: 東京都渋谷区渋谷1-1-1"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="client_occupation"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>取引先職業</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    disabled={readOnly}
                                    placeholder="例: 会社員"
                                />
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
                            <FormLabel>取引先年齢</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    {...field}
                                    disabled={readOnly}
                                    value={field.value ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value === "" ? null : Number(e.target.value);
                                        field.onChange(value);
                                    }}
                                    min={0}
                                    placeholder="例: 30"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!readOnly && (
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "処理中..." : defaultValues ? "更新" : "登録"}
                        </Button>
                    </div>
                )}

                {readOnly && (
                    <div className="flex justify-end">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            閉じる
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
} 