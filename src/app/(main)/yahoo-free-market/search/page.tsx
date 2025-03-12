'use client';

import { useState, useRef } from 'react';
import { KeyboardEvent, ChangeEvent } from 'react';
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RegisterModal } from "@/components/register";
import type { PayPayFreeMarketSearchResult } from '@/types/yahoo-free-market';

export default function SearchPage() {
    const containerRef = useRef<HTMLDivElement>(null);
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
    const itemsPerPage = 20;

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

    const handleSearch = async (page: number = 1) => {
        if (!searchText) return;

        setLoading(true);
        try {
            const searchParams = new URLSearchParams({
                searchText,
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
                ...(conditions.length > 0 && { conditions: conditions.join(',') }),
                page: page.toString(),
                limit: itemsPerPage.toString(),
            });

            const response = await fetch(`/api/yahoo-free-market/search?${searchParams}`);
            const data = await response.json();
            if (data.success) {
                setResults(data.data?.items || []);
                setTotalCount(data.data?.total || 0);
                setCurrentPage(page);
                containerRef.current?.scrollIntoView({ behavior: 'smooth' });
            } else {
                console.error('検索エラー:', data.message);
            }
        } catch (error) {
            console.error('API呼び出しエラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        handleSearch(page);
    };

    const renderPagination = () => {
        return (
            <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    前のページ
                </Button>
                <span className="px-4 py-2">
                    {currentPage} ページ目
                </span>
                <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!results.length}
                >
                    次のページ
                </Button>
            </div>
        );
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

    return (
        <div className="flex-1 overflow-auto">
            <div ref={containerRef} className="container mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">商品検索</h1>
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
                </div>

                {totalCount > 0 && (
                    <p className="text-sm text-muted-foreground mb-4">
                        検索結果: {totalCount}件
                    </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {results.map((item, index) => (
                        <Card key={index} className="flex flex-col h-[300px]">
                            <div className="relative flex-1">
                                <div
                                    className="absolute inset-0 cursor-pointer"
                                    onClick={() => window.open(`https://paypayfleamarket.yahoo.co.jp/item/${item.item_id}`, '_blank')}
                                >
                                    <img
                                        src={item.thumbnail_url}
                                        alt="商品画像"
                                        className="w-full h-full object-contain p-3"
                                    />
                                    <div className="absolute bottom-3 left-3">
                                        <div className="bg-black/50 text-white px-3 py-1 rounded-md">
                                            <p className="text-lg font-bold">
                                                ¥{Number(item.price).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CardFooter className="p-3 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={(e) => handleRegisterClick(e, item)}
                                >
                                    出品登録
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {totalCount > 0 && renderPagination()}
            </div>

            <RegisterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedItem={selectedItem}
            />
        </div>
    );
} 