'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
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
import { showToast } from "@/lib/toast";

interface ListItem {
    id: number;
    status: string;
    sku: string;
    offer_id: string;
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
    yahoo_auction_status: string;
    update_datetime: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasPrevious: boolean;
    hasNext: boolean;
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

interface LoadingButtonProps {
    loading: boolean;
    loadingText: string;
    defaultText: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    size?: 'sm' | 'default' | 'lg';
}

const LoadingButton = ({
    loading,
    loadingText,
    defaultText,
    onClick,
    disabled,
    className,
    size = 'default'
}: LoadingButtonProps) => {
    return (
        <Button
            className={`${className} relative min-w-[64px] px-2`}
            size={size}
            onClick={onClick}
            disabled={disabled || loading}
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

export default function ListPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ListPageContent />
        </Suspense>
    );
}

function ListPageContent() {
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
        hasPrevious: false,
        hasNext: false,
    });
    const [actionLoading, setActionLoading] = useState<string>('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', searchTerm);
        params.set('page', '1');
        router.push(`/list?${params.toString()}`);
    };

    const handleWithdraw = async (offer_id: string, sku: string) => {
        try {
            setActionLoading(`withdraw-${offer_id}`);
            const response = await fetch(`/api/ebay/offer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'withdraw',
                    offer_id,
                    sku
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '取下げに失敗しました');
            }

            // 成功したら一覧を再取得
            fetchItems();
        } catch (error) {
            console.error('Failed to withdraw item:', error);
            setError(error instanceof Error ? error.message : '取下げに失敗しました');
        } finally {
            setActionLoading('');
        }
    };

    const handleRelist = async (offer_id: string, sku: string) => {
        try {
            setActionLoading(`relist-${offer_id}`);
            const response = await fetch(`/api/ebay/offer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'publish',
                    offer_id,
                    sku
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '再出品に失敗しました');
            }

            // 成功したら一覧を再取得
            fetchItems();
        } catch (error) {
            console.error('Failed to relist item:', error);
            setError(error instanceof Error ? error.message : '再出品に失敗しました');
        } finally {
            setActionLoading('');
        }
    };

    const handleSynchronize = async () => {
        try {
            setActionLoading('sync');
            const response = await fetch('/api/synchronize/ebay', {
                method: 'GET',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || '同期に失敗しました');
            }

            // 成功したら一覧を再取得
            fetchItems();
        } catch (error) {
            console.error('Failed to synchronize:', error);
            setError(error instanceof Error ? error.message : '同期に失敗しました');
        } finally {
            setActionLoading('');
        }
    };

    const handleYahooSynchronize = async () => {
        try {
            setActionLoading('yahoo-sync');
            const response = await fetch('/api/synchronize/yahoo-auction', {
                method: 'GET',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Yahoo同期に失敗しました');
            }
            // 成功したら一覧を再取得
            fetchItems();
        } catch (error) {
            console.error('Failed to synchronize Yahoo:', error);
            setError(error instanceof Error ? error.message : 'Yahoo同期に失敗しました');
        } finally {
            setActionLoading('');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors: { [key: string]: string } = {
            '出品中': 'bg-green-500 text-white',
            '取下げ': 'bg-gray-500 text-white',
            '売却': 'bg-blue-500 text-white',
            '仕入済み': 'bg-yellow-500 text-white',
            '完了': 'bg-purple-500 text-white',
            '出品失敗': 'bg-red-500 text-white',
            '購入可': 'bg-green-500 text-white',
            '購入済': 'bg-gray-500 text-white',
            '購入不可': 'bg-red-500 text-white',
        };
        return (
            <Badge className={`${statusColors[status] || 'bg-gray-500 text-white'} whitespace-nowrap min-w-[80px] justify-center`}>
                {status}
            </Badge>
        );
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            const response = await fetch(`/api/ebay/list?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch items');
            }

            setItems(data.items);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalItems: data.totalItems,
                hasPrevious: data.currentPage > 1,
                hasNext: data.currentPage < data.totalPages
            });
        } catch (error) {
            console.error('Error fetching items:', error);
            showToast.error({
                description: error instanceof Error ? error.message : '商品の取得に失敗しました'
            });
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">出品一覧（Yahooオークション）</h1>
                <div className="flex gap-4">
                    <LoadingButton
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        size="sm"
                        onClick={handleSynchronize}
                        loading={actionLoading === 'sync'}
                        loadingText="同期中..."
                        defaultText="eBay同期"
                        disabled={!!actionLoading}
                    />
                    <LoadingButton
                        className="bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                        onClick={handleYahooSynchronize}
                        loading={actionLoading === 'yahoo-sync'}
                        loadingText="同期中..."
                        defaultText="Yahoo同期"
                        disabled={!!actionLoading}
                    />
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
                                <TableHead className="w-24 whitespace-nowrap text-center">状態</TableHead>
                                <TableHead className="w-40 whitespace-nowrap">SKU</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">販売価格</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">仕入価格</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">送料</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">最終利益</TableHead>
                                <TableHead className="w-24 whitespace-nowrap text-center">仕入状態</TableHead>
                                <TableHead className="w-96 whitespace-nowrap">商品名</TableHead>
                                <TableHead className="w-36 whitespace-nowrap">残り</TableHead>
                                <TableHead className="w-40 whitespace-nowrap">更新日時</TableHead>
                                <TableHead className="w-20 whitespace-nowrap text-center">操作</TableHead>
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
                                        <TableCell>
                                            <div className="truncate max-w-[160px]" title={item.sku}>
                                                {item.sku}
                                            </div>
                                        </TableCell>
                                        <TableCell>¥{Number(item.ebay_price).toLocaleString()}</TableCell>
                                        <TableCell>¥{Number(item.purchase_price).toLocaleString()}</TableCell>
                                        <TableCell>¥{Number(item.ebay_shipping_price).toLocaleString()}</TableCell>
                                        <TableCell>¥{Number(item.final_profit).toLocaleString()}</TableCell>
                                        <TableCell className="text-center">{getStatusBadge(item.yahoo_auction_status)}</TableCell>
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
                                        <TableCell className="whitespace-nowrap">
                                            <RemainingTime endDate={new Date(item.yahoo_auction_end_time)} />
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.update_datetime ? new Date(item.update_datetime).toLocaleString('ja-JP') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                {item.status === '出品中' && (
                                                    <LoadingButton
                                                        className="bg-gray-500 hover:bg-gray-600 text-white"
                                                        size="sm"
                                                        onClick={() => handleWithdraw(item.offer_id, item.sku)}
                                                        loading={actionLoading === `withdraw-${item.offer_id}`}
                                                        loadingText="取下げ"
                                                        defaultText="取下げ"
                                                        disabled={!!actionLoading}
                                                    />
                                                )}
                                                {item.status === '取下げ' && (
                                                    <LoadingButton
                                                        className="bg-green-500 hover:bg-green-600 text-white"
                                                        size="sm"
                                                        onClick={() => handleRelist(item.offer_id, item.sku)}
                                                        loading={actionLoading === `relist-${item.offer_id}`}
                                                        loadingText="再出品"
                                                        defaultText="再出品"
                                                        disabled={!!actionLoading}
                                                    />
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {/* 編集処理 */ }}
                                                    disabled={!!actionLoading}
                                                >
                                                    編集
                                                </Button>
                                            </div>
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
                                    const params = new URLSearchParams(searchParams.toString());
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
                                    const params = new URLSearchParams(searchParams.toString());
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