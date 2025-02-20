'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RemainingTime } from "@/components/layout/RemainingTime";
interface ListItem {
    id: number;
    status: string;
    sku: string;
    ebay_price: string;
    ebay_shipping_price: string;
    final_profit: string;
    yahoo_auction_id: string;
    yahoo_auction_url: string;
    yahoo_auction_item_name: string;
    yahoo_auction_item_price: string;
    yahoo_auction_shipping: string;
    yahoo_auction_end_time: string;
    purchase_price: string;
    remaining_time: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

interface ApiResponse {
    items: ListItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    error?: {
        message: string;
    };
}

export default function ListPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: Number(searchParams.get('page')) || 1,
        totalPages: 1,
        totalItems: 0,
    });

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    search: searchTerm,
                    page: pagination.currentPage.toString(),
                    limit: '10',
                });
                const response = await fetch(`/api/ebay/list?${params.toString()}`);
                const data: ApiResponse = await response.json();

                if (!response.ok) {
                    throw new Error(data.error?.message || 'データの取得に失敗しました');
                }

                setItems(data.items || []);
                setPagination({
                    currentPage: data.currentPage,
                    totalPages: data.totalPages,
                    totalItems: data.totalItems,
                });
            } catch (error) {
                console.error('Failed to fetch items:', error);
                setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [searchTerm, pagination.currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        params.set('search', searchTerm);
        params.set('page', '1');
        router.push(`/list?${params.toString()}`);
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            '出品中': 'bg-green-500',
            '終了': 'bg-red-500',
            '下書き': 'bg-gray-500',
        };
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-500'}`}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">出品一覧</h1>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                    />
                    <Button type="submit">検索</Button>
                </form>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">状態</TableHead>
                                <TableHead className="w-40">SKU</TableHead>
                                <TableHead className="w-28">販売価格</TableHead>
                                <TableHead className="w-24">送料</TableHead>
                                <TableHead className="w-28">最終利益</TableHead>
                                <TableHead className="w-96">商品名</TableHead>
                                <TableHead className="w-36">仕入価格</TableHead>
                                <TableHead className="w-28">残り</TableHead>
                                <TableHead className="w-20">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center">
                                        読み込み中...
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center">
                                        データがありません
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                        <TableCell className="truncate" title={item.sku}>
                                            {item.sku}
                                        </TableCell>
                                        <TableCell>¥{Number(item.ebay_price).toLocaleString()}</TableCell>
                                        <TableCell>¥{Number(item.ebay_shipping_price).toLocaleString()}</TableCell>
                                        <TableCell>¥{Number(item.final_profit).toLocaleString()}</TableCell>
                                        <TableCell className="max-w-md">
                                            <a
                                                href={item.yahoo_auction_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline truncate block"
                                                title={item.yahoo_auction_item_name}
                                            >
                                                {item.yahoo_auction_item_name}
                                            </a>
                                        </TableCell>
                                        <TableCell>¥{Number(item.purchase_price).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <RemainingTime endDate={new Date(item.yahoo_auction_end_time)} />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {/* 編集処理 */ }}
                                            >
                                                編集
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {!loading && items.length > 0 && (
                    <div className="flex justify-between items-center p-4">
                        <div className="text-sm text-gray-600">
                            全{pagination.totalItems}件中 {(pagination.currentPage - 1) * 10 + 1}-
                            {Math.min(pagination.currentPage * 10, pagination.totalItems)}件を表示
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage === 1}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('page', (pagination.currentPage - 1).toString());
                                    router.push(`/list?${params.toString()}`);
                                }}
                            >
                                前へ
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pagination.currentPage === pagination.totalPages}
                                onClick={() => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('page', (pagination.currentPage + 1).toString());
                                    router.push(`/list?${params.toString()}`);
                                }}
                            >
                                次へ
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
} 