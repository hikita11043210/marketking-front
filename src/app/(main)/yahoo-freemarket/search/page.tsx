'use client';

import { useState, useRef, useEffect } from 'react';
import { KeyboardEvent, ChangeEvent } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PayPayFreeMarketSearchResult } from '@/types/yahoo-free-market';
import { CommonSearchLayout } from '@/components/common/search/CommonSearchLayout';
import { CommonSearchResults, SearchResultItemProps } from '@/components/common/search/CommonSearchResults';

export default function SearchPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);
    const [searchText, setSearchText] = useState('カメラ');
    const [minPrice, setMinPrice] = useState('10000');
    const [maxPrice, setMaxPrice] = useState('30000');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<PayPayFreeMarketSearchResult[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedItem, setSelectedItem] = useState<PayPayFreeMarketSearchResult>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [conditions, setConditions] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [offset, setOffset] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !isLoadingMore && !loading) {
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
    }, [hasMore, isLoadingMore, loading]);

    const conditionOptions = [
        { label: '未使用', value: 'NEW' },
        { label: '未使用に近い', value: 'USED10' },
        { label: '目立った傷や汚れなし', value: 'USED20' },
        { label: 'やや傷や汚れあり', value: 'USED40' },
        { label: '傷や汚れあり', value: 'USED60' },
    ];

    const handleConditionChange = (value: string) => {
        setConditions(prev =>
            prev.includes(value)
                ? prev.filter(v => v !== value)
                : [...prev, value]
        );
    };

    const handleSearch = async (isLoadMore: boolean = false) => {
        if (!searchText) return;

        if (isLoadMore) {
            setIsLoadingMore(true);
        } else {
            setLoading(true);
            setOffset(1);
            setCurrentPage(1);
            setResults([]);
            setHasMore(true); // 新しい検索時にhasMoreをリセット
        }

        // 現在のページを取得し、そのページを使って検索
        const currentRequestPage = isLoadMore ? currentPage : 1;

        try {
            const searchParams = new URLSearchParams({
                searchText,
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
                ...(conditions.length > 0 && { conditions: conditions.join(',') }),
                page: currentRequestPage.toString(),
            });

            const response = await fetch(`/api/yahoo-free-market/search?${searchParams}`);
            const data = await response.json();
            if (data.success) {
                const newItems = data.data?.items || [];
                setResults(prev => isLoadMore ? [...prev, ...newItems] : newItems);
                setTotalCount(data.data?.total || 0);

                // アイテムがない場合、もう取得するものがない
                setHasMore(newItems.length > 0);

                if (isLoadMore) {
                    // 無限スクロール時は次のページを設定（現在のページ+1）
                    setCurrentPage(prev => prev + 1);
                } else {
                    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                console.error('検索エラー:', data.message);
            }
        } catch (error) {
            console.error('API呼び出しエラー:', error);
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

    const handleRegisterClick = (e: React.MouseEvent, item: PayPayFreeMarketSearchResult) => {
        e.stopPropagation();
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    // 検索フォームコンポーネント
    const searchFormComponent = (
        <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                        キーワード
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="検索キーワード"
                        value={searchText}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        required
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">価格範囲</label>
                    <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            placeholder="下限"
                            value={minPrice}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setMinPrice(e.target.value)
                            }}
                            className="w-full"
                        />
                        <span className="text-sm">～</span>
                        <Input
                            type="number"
                            placeholder="上限"
                            value={maxPrice}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                setMaxPrice(e.target.value)
                            }}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">商品の状態</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {conditionOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id={option.value}
                                    checked={conditions.includes(option.value)}
                                    onChange={() => handleConditionChange(option.value)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor={option.value} className="text-sm">
                                    {option.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="md:col-span-2">
                    <Button
                        className="w-full"
                        onClick={() => handleSearch()}
                        disabled={loading || !searchText}
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
    );

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
        </div>
    );

    // 検索結果を共通フォーマットに変換
    const formattedResults: SearchResultItemProps[] = results.map(item => ({
        id: item.item_id,
        imageUrl: item.thumbnail_url,
        price: item.price,
        detailUrl: `https://paypayfleamarket.yahoo.co.jp/item/${item.item_id}`,
        onRegisterClick: (e) => handleRegisterClick(e, item)
    }));

    return (
        <CommonSearchLayout
            containerRef={containerRef}
            title="商品検索（PayPayフリマ）"
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
            sourceType="yahoo-free-market"
        />
    );
} 