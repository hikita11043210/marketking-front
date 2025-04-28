'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { ExpenseItem } from '@/types/accounting';
import { formatDate, formatCurrency } from '@/lib/utils';

interface ExpensesTableProps {
    expenses: ExpenseItem[];
    onView: (expense: ExpenseItem) => void;
    onEdit: (expense: ExpenseItem) => void;
    onDelete: (id: string) => void;
    onSearch: (term: string) => void;
}

export function ExpensesTable({ expenses, onView, onEdit, onDelete, onSearch }: ExpensesTableProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="商品名、取引先で検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="max-w-sm"
                    />
                    <Button variant="outline" onClick={handleSearch}>検索</Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>取引日</TableHead>
                            <TableHead>商品名</TableHead>
                            <TableHead>詳細</TableHead>
                            <TableHead>取引先</TableHead>
                            <TableHead className="text-right">価格</TableHead>
                            <TableHead className="text-right">税</TableHead>
                            <TableHead className="text-right">送料</TableHead>
                            <TableHead className="text-right">合計</TableHead>
                            <TableHead className="text-right">アクション</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    データがありません
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{formatDate(expense.transaction_date)}</TableCell>
                                    <TableCell>{expense.product_name}</TableCell>
                                    <TableCell>{expense.detail || '-'}</TableCell>
                                    <TableCell>{expense.client_name || '-'}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.price)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.tax)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.shipping_cost)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.total_amount)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => onView(expense)}>
                                                <EyeIcon className="h-4 w-4" />
                                                <span className="sr-only">詳細</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
                                                <PencilIcon className="h-4 w-4" />
                                                <span className="sr-only">編集</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(expense.id)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2Icon className="h-4 w-4" />
                                                <span className="sr-only">削除</span>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 