'use client';

import { useState } from 'react';
import { KeyboardEvent, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import RegisterModal from "@/components/modals/RegisterModal";
import type { SearchResult } from "@/types/search";

type SearchItem = SearchResult['items'][0];

export default function SearchPage() {
    const [p, setP] = useState('カメラ');
    const [min, setMin] = useState('');
    const [max, setMax] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult['items']>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [auccat, setAuccat] = useState('');
    const [va, setVa] = useState('');
    const [priceType, setPriceType] = useState('currentprice');
    const [istatus, setStatus] = useState('all');
    const [fixed, setFixed] = useState('3');
    const [new_item, setNewItem] = useState(false);
    const [is_postage_mode, setIsPostageMode] = useState(false);
    const [n, setN] = useState('20');
    const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = async () => {
        if (!p) return;

        setLoading(true);
        try {
            const searchParams = new URLSearchParams({
                p,
                ...(min && { min }),
                ...(max && { max }),
                ...(priceType && { price_type: priceType }),
                ...(auccat && { auccat }),
                ...(va && { va }),
                ...(istatus !== 'all' && { istatus }),
                ...(fixed !== '3' && { fixed }),
                ...(new_item && { new: '1' }),
                ...(is_postage_mode && { is_postage_mode: '1' }),
                n,
            });

            const response = await fetch(`/api/yahoo-auction/items?${searchParams}`);
            const data = await response.json();

            if (data.success) {
                setResults(data.data?.items || []);
                setTotalCount(data.data?.total || 0);
            } else {
                console.error('検索エラー:', data.message);
            }
        } catch (error) {
            console.error('API呼び出しエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRegisterClick = (e: React.MouseEvent, item: SearchItem) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="container mx-auto py-8 px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-6">商品検索</h1>
                        <Card className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        キーワード
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="検索キーワード"
                                        value={p}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setP(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">キーワードフィルター</label>
                                    <Input
                                        type="text"
                                        placeholder="除外キーワード等"
                                        value={va}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setVa(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">カテゴリー</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        value={auccat}
                                        onChange={(e) => setAuccat(e.target.value)}
                                    >
                                        <option value="">すべてのカテゴリー</option>
                                        <option value="23336">ノートPC</option>
                                        <option value="23976">デジタルカメラ</option>
                                        <option value="23632">スマートフォン</option>
                                        <option value="24698">オーディオ</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">商品の状態</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        value={istatus}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="">すべての商品</option>
                                        <option value="1">新品</option>
                                        <option value="2">中古</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">出品形式</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        value={fixed}
                                        onChange={(e) => setFixed(e.target.value)}
                                    >
                                        <option value="3">すべての出品</option>
                                        <option value="1">定額</option>
                                        <option value="2">オークション</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">価格</label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Input
                                                type="number"
                                                placeholder="下限"
                                                value={min}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    setMin(e.target.value)
                                                }}
                                                className="w-full"
                                            />
                                            <span className="text-sm">～</span>
                                            <Input

                                                type="number"
                                                placeholder="上限"
                                                value={max}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    setMax(e.target.value)
                                                }}
                                                className="w-full"
                                            />
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="currentPrice"
                                                    name="priceType"
                                                    value="currentprice"
                                                    checked={priceType === 'currentprice'}
                                                    onChange={(e) => {
                                                        setPriceType(e.target.value);
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor="currentPrice" className="text-sm font-medium">現在価格</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    id="buyNowPrice"
                                                    name="priceType"
                                                    value="bidorbuyprice"
                                                    checked={priceType === 'bidorbuyprice'}
                                                    onChange={(e) => {
                                                        setPriceType(e.target.value);
                                                    }}
                                                    className="rounded border-gray-300"
                                                />
                                                <label htmlFor="buyNowPrice" className="text-sm font-medium">即決価格</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">表示件数</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                                        value={n}
                                        onChange={(e) => setN(e.target.value)}
                                    >
                                        <option value="20">20件</option>
                                        <option value="50">50件</option>
                                        <option value="100">100件</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="new_item"
                                            checked={new_item}
                                            onChange={(e) => setNewItem(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="new_item" className="text-sm font-medium">新着のみ</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="is_postage_mode"
                                            checked={is_postage_mode}
                                            onChange={(e) => setIsPostageMode(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="is_postage_mode" className="text-sm font-medium">送料込みのみ</label>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <Button
                                        className="w-full"
                                        onClick={handleSearch}
                                        disabled={loading || !p}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                検索中...
                                            </>
                                        ) : (
                                            '検索'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {totalCount > 0 && (
                        <p className="text-sm text-muted-foreground mb-4">
                            検索結果: {totalCount}件
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {results.map((item, index) => (
                            <Card key={index} className="flex flex-col h-[360px]">
                                <div
                                    className="flex flex-col flex-1 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                                    onClick={() => window.open(item.url, '_blank')}
                                >
                                    <CardHeader className="p-3 pb-2 flex-none">
                                        <div className="relative w-full pt-[35%]">
                                            <div
                                                className="absolute inset-0 bg-center bg-no-repeat bg-contain"
                                                style={{ backgroundImage: `url(${item.image_url})` }}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 flex-1 overflow-auto">
                                        <h2 className="text-base font-semibold line-clamp-2 h-[3em] mb-2">
                                            {item.title}
                                        </h2>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <p className="text-base font-bold text-primary w-[180px]">
                                                    現在価格: ¥{Number(item.price).toLocaleString()}
                                                </p>
                                                <p className="text-sm font-medium text-orange-600">
                                                    終了まで: {item.end_time}
                                                </p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                {item.buy_now_price ? (
                                                    <p className="text-base font-semibold text-green-600 w-[180px]">
                                                        即決価格: ¥{Number(item.buy_now_price).toLocaleString()}
                                                    </p>
                                                ) : (
                                                    <div className="w-[180px]" />
                                                )}
                                                <p className="text-sm text-gray-600">
                                                    {item.shipping || '送料情報なし'}
                                                </p>
                                            </div>
                                            <div className="flex justify-end">
                                                <p className="text-sm text-muted-foreground">
                                                    入札数: {item.bid_count}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                                <CardFooter className="p-3 border-t flex-none">
                                    <Button
                                        variant="outline"
                                        className="w-full pointer-events-auto"
                                        onClick={(e) => handleRegisterClick(e, item)}
                                    >
                                        出品登録
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                <RegisterModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedItem={selectedItem}
                />
            </div>
        </div>
    );
} 