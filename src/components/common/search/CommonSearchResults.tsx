import React from 'react';
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface SearchResultItemProps {
    id: string;
    title?: string;
    imageUrl: string;
    price: string | number;
    detailUrl: string;
    additionalInfo?: React.ReactNode;
    height?: string;
    onRegisterClick: (e: React.MouseEvent) => void;
}

export const SearchResultItem = ({
    title,
    imageUrl,
    price,
    detailUrl,
    additionalInfo,
    height = '300px',
    onRegisterClick
}: SearchResultItemProps) => {
    return (
        <Card className="flex flex-col" style={{ height }}>
            <div className="relative flex-1">
                <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => window.open(detailUrl, '_blank')}
                >
                    {/* 画像とタイトル表示方法の違いを吸収 */}
                    {title ? (
                        <>
                            <div className="w-full h-1/2 p-3">
                                <img
                                    src={imageUrl}
                                    alt="商品画像"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="p-3">
                                <h2 className="text-base font-semibold line-clamp-2 mb-2">
                                    {title}
                                </h2>
                                <p className="text-lg font-bold text-primary">
                                    ¥{typeof price === 'number' ? price.toLocaleString() : Number(price).toLocaleString()}
                                </p>
                                {additionalInfo}
                            </div>
                        </>
                    ) : (
                        <>
                            <img
                                src={imageUrl}
                                alt="商品画像"
                                className="w-full h-full object-contain p-3"
                            />
                            <div className="absolute bottom-3 left-3">
                                <div className="bg-black/50 text-white px-3 py-1 rounded-md">
                                    <p className="text-lg font-bold">
                                        ¥{typeof price === 'number' ? price.toLocaleString() : Number(price).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {additionalInfo}
                        </>
                    )}
                </div>
            </div>
            <CardFooter className="p-3 border-t">
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={onRegisterClick}
                >
                    出品登録
                </Button>
            </CardFooter>
        </Card>
    );
};

interface CommonSearchResultsProps {
    results: SearchResultItemProps[];
}

export const CommonSearchResults = ({ results }: CommonSearchResultsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {results.map((item, index) => (
                <SearchResultItem key={index} {...item} />
            ))}
        </div>
    );
}; 