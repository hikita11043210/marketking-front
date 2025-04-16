'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { PlusIcon, SearchIcon, EyeIcon, PencilIcon, TrashIcon } from "lucide-react";
import { Transaction, TransactionType, TransactionsFilter } from "@/types/antique-ledger";
import { TransactionDialog } from "@/components/antique-ledger/TransactionDialog";
import { Loading } from "@/components/ui/loading";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AntiqueLedgerPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionTypes, setTransactionTypes] = useState<TransactionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);

    const [dialogState, setDialogState] = useState<{
        type: "create" | "edit" | "view";
        isOpen: boolean;
    }>({
        type: "create",
        isOpen: false,
    });

    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        transactionId?: number;
    }>({
        isOpen: false,
    });

    const [filter, setFilter] = useState<TransactionsFilter>({});

    const openDialog = (type: "create" | "edit" | "view", transaction?: Transaction) => {
        setSelectedTransaction(transaction);
        setDialogState({ type, isOpen: true });
    };

    const closeDialog = () => {
        setDialogState((prev) => ({ ...prev, isOpen: false }));
    };

    const openDeleteAlert = (transactionId: number) => {
        setAlertState({ isOpen: true, transactionId });
    };

    const closeDeleteAlert = () => {
        setAlertState({ isOpen: false, transactionId: undefined });
    };

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            // URLSearchParamsを使用してフィルタパラメータを構築
            const params = new URLSearchParams();
            if (filter.transaction_date) params.append("transaction_date", filter.transaction_date);
            if (filter.transaction_type) params.append("transaction_type", filter.transaction_type);
            if (filter.sku) params.append("sku", filter.sku);
            if (filter.search) params.append("search", filter.search);

            const response = await fetch(`/api/antique-ledger/transactions?${params.toString()}`);
            const data = await response.json();

            if (response.ok && data) {
                setTransactions(data);
            } else {
                toast.error(data.message || "古物台帳の取得に失敗しました");
            }
        } catch (error) {
            toast.error("古物台帳の取得中にエラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleDeleteTransaction = async () => {
        if (!alertState.transactionId) return;

        try {
            const response = await fetch(`/api/antique-ledger/transactions/${alertState.transactionId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("古物台帳を削除しました");
                fetchTransactions();
            } else {
                const data = await response.json();
                toast.error(data.message || "古物台帳の削除に失敗しました");
            }
        } catch (error) {
            toast.error("古物台帳の削除中にエラーが発生しました");
        } finally {
            closeDeleteAlert();
        }
    };

    useEffect(() => {
        fetchTransactionTypes();
        fetchTransactions();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const handleFilterChange = (key: keyof TransactionsFilter, value: string) => {
        setFilter((prev) => ({
            ...prev,
            [key]: value === "all" ? undefined : value
        }));
    };

    if (isLoading && transactions.length === 0) {
        return <Loading fullScreen />;
    }

    return (
        <div className="container mx-auto py-10 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">古物台帳</h2>
                    <p className="text-muted-foreground">
                        古物台帳の一覧を管理します。
                    </p>
                </div>
                <Button onClick={() => openDialog("create")}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    新規登録
                </Button>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>検索条件</CardTitle>
                    <CardDescription>検索条件を入力して古物台帳を絞り込みます。</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">取引年月日</label>
                            <Input
                                type="date"
                                value={filter.transaction_date || ""}
                                onChange={(e) => handleFilterChange("transaction_date", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">取引区分</label>
                            <Select
                                value={filter.transaction_type || ""}
                                onValueChange={(value) => handleFilterChange("transaction_type", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="取引区分を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">すべて</SelectItem>
                                    {transactionTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()}>
                                            {type.value}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">管理コード</label>
                            <Input
                                placeholder="管理コード"
                                value={filter.management_code || ""}
                                onChange={(e) => handleFilterChange("management_code", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">品名検索</label>
                            <div className="relative">
                                <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="品名を検索"
                                    className="pl-8"
                                    value={filter.search || ""}
                                    onChange={(e) => handleFilterChange("search", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>取引年月日</TableHead>
                                    <TableHead>取引区分</TableHead>
                                    <TableHead>品名</TableHead>
                                    <TableHead>管理コード</TableHead>
                                    <TableHead>商品URL</TableHead>
                                    <TableHead>数量</TableHead>
                                    <TableHead>代価</TableHead>
                                    <TableHead>取引先</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center py-10">
                                            表示するデータがありません
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="whitespace-nowrap">{transaction.transaction_date}</TableCell>
                                            <TableCell className="whitespace-nowrap">{transaction.transaction_type_name}</TableCell>
                                            <TableCell className="max-w-[200px] truncate">{transaction.product_name}</TableCell>
                                            <TableCell className="whitespace-nowrap">{transaction.management_code}</TableCell>
                                            <TableCell className="max-w-[150px] truncate">
                                                {transaction.url ? (
                                                    <a
                                                        href={transaction.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {transaction.url}
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{transaction.quantity}</TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {transaction.price ? `¥${transaction.price.toLocaleString()}` : "-"}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate">{transaction.client_name}</TableCell>
                                            <TableCell className="text-right space-x-1 whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDialog("view", transaction)}
                                                    title="詳細"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDialog("edit", transaction)}
                                                    title="編集"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openDeleteAlert(transaction.id)}
                                                    title="削除"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <TransactionDialog
                type={dialogState.type}
                isOpen={dialogState.isOpen}
                onClose={closeDialog}
                transaction={selectedTransaction}
                onSuccess={fetchTransactions}
            />

            <AlertDialog open={alertState.isOpen} onOpenChange={closeDeleteAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>古物台帳の削除</AlertDialogTitle>
                        <AlertDialogDescription>
                            この古物台帳を削除してもよろしいですか？この操作は取り消せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTransaction}>削除</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 