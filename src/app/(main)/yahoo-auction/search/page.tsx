'use client';

import { useState, useRef, useEffect } from 'react';
import { KeyboardEvent, ChangeEvent } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { SearchResults, SearchResult } from "@/types/yahoo-auction";
import { CommonSearchLayout } from '@/components/common/search/CommonSearchLayout';
import { CommonSearchResults, SearchResultItemProps } from '@/components/common/search/CommonSearchResults';

type ItemCondition = '1' | '3' | '4';
type Brand = {
    id: string;
    name: string;
};

const BRANDS: Brand[] = [
    { id: 'canon', name: 'Canon' },
    { id: 'nikon', name: 'Nikon' },
    { id: 'sony', name: 'SONY' },
    { id: 'fujifilm', name: 'FUJIFILM' },
    { id: 'olympus', name: 'OLYMPUS' },
    { id: 'panasonic', name: 'Panasonic' },
    { id: 'pentax', name: 'PENTAX' },
];

export default function SearchPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const [p, setP] = useState('カメラ');
    const [url, setUrl] = useState('');
    const [min, setMin] = useState('10000');
    const [max, setMax] = useState('30000');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResults['items']>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [auccat, setAuccat] = useState('');
    const [priceType, setPriceType] = useState('bidorbuyprice');
    const [itemConditions, setItemConditions] = useState<ItemCondition[]>(['1', '3', '4']);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [fixed, setFixed] = useState('3');
    const [isFreeShipping, setIsFreeShipping] = useState(false);
    const [n, setN] = useState('20');
    const [sortOrder, setSortOrder] = useState('end_time_desc');
    const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [s1, setS1] = useState('end');
    const [o1, setO1] = useState('d');
    const [offset, setOffset] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !isLoadingMore && !loading && results.length > 0) {
                    handleSearch(true);
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [hasMore, isLoadingMore, loading, results.length]);

    const handleSearch = async (isLoadMore: boolean = false) => {
        if (!p) return;

        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
            setOffset(1);
            setResults([]);
        }

        try {
            const baseParams = {
                p,
                n,
                b: offset.toString(),
                url,
            };

            const optionalParams = {
                ...(min && { min }),
                ...(max && { max }),
                ...(priceType && { price_type: priceType }),
                ...(auccat && { auccat }),
                ...(itemConditions.length > 0 && { item_conditions: itemConditions.join(',') }),
                ...(selectedBrands.length > 0 && { brands: selectedBrands.join(',') }),
                ...(fixed && { fixed }),
                ...(isFreeShipping && { is_free_shipping: '1' }),
                ...(s1 && { s1 }),
                ...(o1 && { o1 }),
            };

            const searchParams = new URLSearchParams({
                ...baseParams,
                ...optionalParams,
            });

            const response = await fetch(`/api/yahoo-auction/items?${searchParams}`);
            const data = await response.json();

            if (data.success) {
                const newItems = data.data?.items || [];
                setResults(prev => isLoadMore ? [...prev, ...newItems] : newItems);
                setTotalCount(data.data?.total || 0);
                setHasMore(newItems.length > 0 && newItems.length === Number(n));
                setOffset(prev => prev + Number(n));
                if (!isLoadMore) {
                    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                console.error('検索エラー:', data.message);
                setHasMore(false);
            }
        } catch (error) {
            console.error('API呼び出しエラー:', error);
            setHasMore(false);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRegisterClick = (e: React.MouseEvent, item: SearchResult) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // 検索フォームコンポーネント
    const searchFormComponent = (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="p-6 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold">商品検索（ヤフオク）</h1>
                        <CollapsibleTrigger
                            className="rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                        >
                            <ChevronDown
                                className={`h-6 w-6 transform transition-transform duration-200 ${isOpen ? '' : '-rotate-180'
                                    }`}
                            />
                        </CollapsibleTrigger>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                        {/* <Input
                            type="text"
                            placeholder="検索キーワード"
                            value={p}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setP(e.target.value)}
                            onKeyPress={handleKeyPress}
                            required
                        /> */}
                        <Input
                            type="text"
                            placeholder="URL"
                            value={url}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                            onKeyPress={handleKeyPress}
                            required
                        />
                        <Button
                            onClick={() => handleSearch()}
                            disabled={loading || !p}
                            className="w-[120px]"
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
                <CollapsibleContent>
                    <div className="px-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">カテゴリー</label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                    value={auccat}
                                    onChange={(e) => setAuccat(e.target.value)}
                                >
                                    <option value="">すべてのカテゴリー</option>
                                    <option value="23632,26318,23336">家電、AV、カメラ</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
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
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">ブランド</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-2 border rounded-md bg-muted/20">
                                    {BRANDS.map((brand) => (
                                        <div key={brand.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id={`brand-${brand.id}`}
                                                value={brand.id}
                                                checked={selectedBrands.includes(brand.id)}
                                                onChange={(e) => {
                                                    setSelectedBrands(prev =>
                                                        e.target.checked
                                                            ? [...prev, brand.id]
                                                            : prev.filter(id => id !== brand.id)
                                                    );
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                            <label
                                                htmlFor={`brand-${brand.id}`}
                                                className="text-sm font-medium whitespace-nowrap"
                                            >
                                                {brand.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">商品の状態</label>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="condition-3"
                                            value="3"
                                            checked={itemConditions.includes('3')}
                                            onChange={(e) => {
                                                setItemConditions(prev =>
                                                    e.target.checked
                                                        ? [...prev, '3' as ItemCondition]
                                                        : prev.filter(c => c !== '3')
                                                );
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="condition-3" className="text-sm font-medium whitespace-nowrap">未使用</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="condition-1"
                                            value="1"
                                            checked={itemConditions.includes('1')}
                                            onChange={(e) => {
                                                setItemConditions(prev =>
                                                    e.target.checked
                                                        ? [...prev, '1' as ItemCondition]
                                                        : prev.filter(c => c !== '1')
                                                );
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="condition-1" className="text-sm font-medium whitespace-nowrap">未使用に近い</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="condition-4"
                                            value="4"
                                            checked={itemConditions.includes('4')}
                                            onChange={(e) => {
                                                setItemConditions(prev =>
                                                    e.target.checked
                                                        ? [...prev, '4' as ItemCondition]
                                                        : prev.filter(c => c !== '4')
                                                );
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="condition-4" className="text-sm font-medium whitespace-nowrap">目立った傷や汚れなし</label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_free_shipping"
                                        checked={isFreeShipping}
                                        onChange={(e) => setIsFreeShipping(e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="is_free_shipping" className="text-sm font-medium">送料無料のみ</label>
                                </div>
                            </div>
                            <div className="md:col-span-2 border-t pt-4 mt-2">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <div>
                                        <label className="block text-sm font-medium mb-1">並び順</label>
                                        <div className="flex gap-2">
                                            <select
                                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                                value={s1}
                                                onChange={(e) => setS1(e.target.value)}
                                            >
                                                <option value="new">新着順</option>
                                                <option value="end">終了時間</option>
                                                <option value="tbids">現在価格</option>
                                                <option value="tbidorbuy">即決価格</option>
                                                <option value="bids">入札数</option>
                                            </select>
                                            <select
                                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                                value={o1}
                                                onChange={(e) => setO1(e.target.value)}
                                            >
                                                <option value="d">降順</option>
                                                <option value="a">昇順</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );

    // 検索結果を共通フォーマットに変換
    const formattedResults: SearchResultItemProps[] = results.map(item => ({
        id: item.url || Math.random().toString(),
        title: item.title,
        imageUrl: item.image_url,
        price: item.price,
        detailUrl: item.url,
        height: '360px',
        additionalInfo: (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-orange-600">
                        終了まで: {item.end_time}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    {item.buy_now_price ? (
                        <p className="text-sm font-semibold text-green-600">
                            即決: ¥{Number(item.buy_now_price).toLocaleString()}
                        </p>
                    ) : (
                        <div className="w-[180px]" />
                    )}
                    <p className="text-xs text-gray-600">
                        {item.shipping || '送料情報なし'}
                    </p>
                </div>
            </div>
        ),
        onRegisterClick: (e) => handleRegisterClick(e, item)
    }));

    // ページネーションコンポーネント
    const paginationComponent = (
        <div ref={observerRef} className="h-20 flex items-center justify-center mt-4">
            {isLoadingMore && (
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">読み込み中...</span>
                </div>
            )}
            {!hasMore && results.length > 0 && (
                <p className="text-sm text-muted-foreground">
                    すべての検索結果を表示しました
                </p>
            )}
            {!hasMore && results.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">
                    検索結果がありません
                </p>
            )}
        </div>
    );

    return (
        <CommonSearchLayout
            containerRef={containerRef}
            title=""  // すでに検索フォーム内にタイトルがあるため空にしています
            searchFormComponent={searchFormComponent}
            resultsComponent={
                <CommonSearchResults results={formattedResults} />
            }
            paginationComponent={paginationComponent}
            totalCount={totalCount}
            loading={loading}
            isModalOpen={isModalOpen}
            onModalClose={() => setIsModalOpen(false)}
            selectedItem={selectedItem}
            sourceType="yahoo-auction"
        />
    );
} 