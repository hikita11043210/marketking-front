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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { EyeIcon, PencilIcon, Trash2Icon, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SalesItem } from '@/types/accounting';
import { formatDate, formatCurrency } from '@/lib/utils';

interface SalesTableProps {
    sales: SalesItem[];
    onView: (sale: SalesItem) => void;
    onEdit: (sale: SalesItem) => void;
    onDelete: (id: string) => void;
    onSearch: (term: string) => void;
}

export function SalesTable({ sales, onView, onEdit, onDelete, onSearch }: SalesTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

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
                            <TableHead>管理コード</TableHead>
                            <TableHead>顧客名</TableHead>
                            <TableHead className="text-right">数量</TableHead>
                            <TableHead className="text-right">価格</TableHead>
                            <TableHead className="text-right">税</TableHead>
                            <TableHead className="text-right">送料</TableHead>
                            <TableHead className="text-right">合計</TableHead>
                            <TableHead className="text-right">アクション</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-4">
                                    データがありません
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>{formatDate(sale.transaction_date)}</TableCell>
                                    <TableCell>{sale.product_name}</TableCell>
                                    <TableCell>{sale.management_code}</TableCell>
                                    <TableCell>{sale.client_name || '-'}</TableCell>
                                    <TableCell className="text-right">{sale.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.price)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.tax)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.shipping_cost)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(sale.total_amount)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => onView(sale)}>
                                                <EyeIcon className="h-4 w-4" />
                                                <span className="sr-only">詳細</span>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(sale)}>
                                                <PencilIcon className="h-4 w-4" />
                                                <span className="sr-only">編集</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDelete(sale.id)}
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