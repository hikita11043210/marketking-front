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
import { toast } from "sonner";
import { MarketplaceActionButtons } from '@/components/marketplaces/ActionButtons';
import { handleFreeMarketAction, handleGlobalSync } from '@/utils/marketplaceActions';
import { RemainingTime } from "@/components/layout/RemainingTime";
import { getStatusBadge } from '@/components/marketplaces/StatusBadge';

interface ListItem {
    ebay_id: number;
    ebay_status: string;
    ebay_sku: string;
    ebay_product_name: string;
    ebay_item_id: string;
    ebay_offer_id: string;
    ebay_url: string;
    ebay_quantity: number;
    ebay_price_dollar: number;
    ebay_price_yen: number;
    ebay_shipping_price: number;
    ebay_final_profit_dollar: number;
    ebay_final_profit_yen: number;
    ebay_view_count: number;
    ebay_watch_count: number;
    yfm_id: number;
    yfm_unique_id: string;
    yfm_url: string;
    yfm_item_name: string;
    yfm_item_price: string;
    yfm_shipping: string;
    yfm_status: string;
    yfm_purchase_amount: number;
    insert_datetime: string;
    update_datetime: string;
}

interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

interface ApiResponse {
    items: ListItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
    counts: {
        active: number;
        sold_out: number;
    };
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

export default function YahooFreeMarketListPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <YahooFreeMarketListContent />
        </Suspense>
    );
}

function YahooFreeMarketListContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [items, setItems] = useState<ListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [searchSku, setSearchSku] = useState(searchParams.get('sku') || '');
    const [searchStatus, setSearchStatus] = useState(searchParams.get('status') || '');
    const [searchYahooStatus, setSearchYahooStatus] = useState(searchParams.get('yahoo_status') || '');
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: Number(searchParams.get('page')) || 1,
        totalPages: 1,
        totalItems: 0,
        hasNext: false,
        hasPrevious: false,
    });
    const [actionLoading, setActionLoading] = useState<string>('');
    const [counts, setCounts] = useState<{ active: number; sold_out: number }>({ active: 0, sold_out: 0 });

    const statusOptions = [
        { label: 'すべて', value: '' },
        { label: '出品中', value: '出品中' },
        { label: '取下げ', value: '取下げ' },
        { label: '売却', value: '売却' },
        { label: '完了', value: '完了' },
        { label: '出品失敗', value: '出品失敗' },
        { label: '再出品済', value: '再出品済' },
    ];

    const yahooStatusOptions = [
        { label: 'すべて', value: '' },
        { label: '仕入可', value: '仕入可' },
        { label: '仕入済', value: '仕入済' },
        { label: '仕入不可', value: '仕入不可' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (searchSku) params.set('sku', searchSku);
        if (searchStatus) params.set('status', searchStatus);
        if (searchYahooStatus) params.set('yahoo_status', searchYahooStatus);
        params.set('page', '1');
        router.push(`/yahoo-free-market/list?${params.toString()}`);
    };

    const handleWithdraw = async (sku: string, offerId?: string) => {
        handleFreeMarketAction({
            actionType: 'withdraw',
            sku,
            offerId,
            setActionLoading,
            fetchItems
        });
    };

    const handleRelist = async (sku: string, offerId?: string) => {
        handleFreeMarketAction({
            actionType: 'relist',
            sku,
            offerId,
            setActionLoading,
            fetchItems
        });
    };

    const handleSynchronize = async (sku: string) => {
        handleFreeMarketAction({
            actionType: 'sync',
            sku,
            setActionLoading,
            fetchItems
        });
    };

    const handleYahooSynchronize = async () => {
        handleGlobalSync('yahoo-auction', setActionLoading, fetchItems);
    };

    const handleGlobalSynchronize = async () => {
        handleGlobalSync('ebay', setActionLoading, fetchItems);
    };

    const handlePurchase = async (sku: string) => {
        handleFreeMarketAction({
            actionType: 'purchase',
            sku,
            setActionLoading,
            fetchItems
        });
    };

    const handleSalesRegistration = async (sku: string) => {
        handleFreeMarketAction({
            actionType: 'sales',
            sku,
            setActionLoading,
            fetchItems
        });
    };

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(searchParams.toString());
            const response = await fetch(`/api/yahoo-free-market/list?${params.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch items');
            }

            setItems(data.items);
            setCounts(data.counts);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalItems: data.totalItems,
                hasPrevious: data.currentPage > 1,
                hasNext: data.currentPage < data.totalPages
            });
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error(error instanceof Error ? error.message : '商品の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    return (
        <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">出品一覧（Yahooフリーマーケット）</h1>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex gap-2">
                        <LoadingButton
                            className="bg-blue-500 hover:bg-blue-600 text-white flex-1 md:flex-none"
                            size="sm"
                            onClick={handleGlobalSynchronize}
                            loading={actionLoading === 'sync'}
                            loadingText="同期中..."
                            defaultText="eBay同期"
                            disabled={!!actionLoading}
                        />
                        <LoadingButton
                            className="bg-red-500 hover:bg-red-600 text-white flex-1 md:flex-none"
                            size="sm"
                            onClick={handleYahooSynchronize}
                            loading={actionLoading === 'yahoo-sync'}
                            loadingText="同期中..."
                            defaultText="Yahoo同期"
                            disabled={!!actionLoading}
                        />
                    </div>
                </div>
            </div>
            {/* 
            <Card className="mb-6">
                <form onSubmit={handleSearch} className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                キーワード
                            </label>
                            <Input
                                type="text"
                                placeholder="商品名で検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                SKU
                            </label>
                            <Input
                                type="text"
                                placeholder="SKUで検索..."
                                value={searchSku}
                                onChange={(e) => setSearchSku(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                状態
                            </label>
                            <select
                                value={searchStatus}
                                onChange={(e) => setSearchStatus(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                {statusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                仕入状態
                            </label>
                            <select
                                value={searchYahooStatus}
                                onChange={(e) => setSearchYahooStatus(e.target.value)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            >
                                {yahooStatusOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button type="submit" disabled={loading} className="w-full md:w-auto">
                            検索
                        </Button>
                    </div>
                </form>
            </Card> */}

            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4">
                    <div className="text-sm text-gray-600">出品中</div>
                    <div className="text-2xl font-bold">{counts.active.toLocaleString()}件</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-gray-600">取下げ</div>
                    <div className="text-2xl font-bold">{counts.sold_out.toLocaleString()}件</div>
                </Card>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-auto">
                <Card className="w-[360px] md:w-full min-w-[900px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24 whitespace-nowrap text-center">状態</TableHead>
                                <TableHead className="w-40 whitespace-nowrap">SKU</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">販売価格</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">仕入価格</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">送料</TableHead>
                                <TableHead className="w-20 whitespace-nowrap">最終利益</TableHead>
                                <TableHead className="w-10 whitespace-nowrap">Views</TableHead>
                                <TableHead className="w-10 whitespace-nowrap">Watchers</TableHead>
                                <TableHead className="w-24 whitespace-nowrap text-center">仕入状態</TableHead>
                                <TableHead className="w-96 whitespace-nowrap">商品名</TableHead>
                                <TableHead className="w-40 whitespace-nowrap">登録日時</TableHead>
                                <TableHead className="w-40 whitespace-nowrap">更新日時</TableHead>
                                <TableHead className="w-20 whitespace-nowrap text-center">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center">
                                        読み込み中...
                                    </TableCell>
                                </TableRow>
                            ) : items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={13} className="text-center">
                                        データがありません
                                    </TableCell>
                                </TableRow>
                            ) : (
                                items.map((item) => (
                                    <TableRow key={item.ebay_id}>
                                        <TableCell className="text-center">{getStatusBadge(item.ebay_status)}</TableCell>
                                        <TableCell>
                                            <div className="truncate max-w-[160px]" title={item.ebay_sku}>
                                                {item.ebay_sku}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">¥{Number(item.ebay_price_yen).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">¥{Number(item.yfm_purchase_amount).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">¥{Number(item.ebay_shipping_price).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">¥{Number(item.ebay_final_profit_yen).toLocaleString()}</TableCell>
                                        <TableCell className="text-center">{item.ebay_view_count}</TableCell>
                                        <TableCell className="text-center">{item.ebay_watch_count}</TableCell>
                                        <TableCell className="text-center">{getStatusBadge(item.yfm_status)}</TableCell>
                                        <TableCell>
                                            <a
                                                href={item.yfm_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[300px]"
                                                title={item.yfm_item_name}
                                            >
                                                {item.yfm_item_name}
                                            </a>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.insert_datetime ? new Date(item.insert_datetime).toLocaleString('ja-JP') : '-'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {item.update_datetime ? new Date(item.update_datetime).toLocaleString('ja-JP') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <MarketplaceActionButtons
                                                itemType="freemarket"
                                                marketStatus={item.ebay_status}
                                                purchaseStatus={item.yfm_status}
                                                sku={item.ebay_sku}
                                                actionLoading={actionLoading}
                                                onWithdraw={handleWithdraw}
                                                onRelist={handleRelist}
                                                onSynchronize={handleSynchronize}
                                                onPurchase={handlePurchase}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
} 