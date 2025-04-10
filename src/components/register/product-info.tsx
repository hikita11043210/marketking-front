import { Card, CardContent } from "@/components/ui/card";
import type { PayPayFreeMarketSearchResult, ItemDetailResponse } from '@/types/yahoo-free-market';

interface ProductInfoProps {
    selectedItem: PayPayFreeMarketSearchResult;
    detailData: ItemDetailResponse | undefined;
}

export const ProductInfo = ({ selectedItem, detailData }: ProductInfoProps) => {
    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                {/* 商品画像 */}
                <div className="w-full aspect-square relative">
                    {selectedItem?.thumbnail_url && (
                        <a
                            href={`https://paypayfleamarket.yahoo.co.jp/item/${selectedItem.item_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full block hover:opacity-90 transition-opacity"
                        >
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-contain"
                                style={{ backgroundImage: `url(${selectedItem.thumbnail_url})` }}
                            />
                        </a>
                    )}
                </div>

                {/* 商品情報 */}
                <div className="space-y-4">
                    {detailData?.item_details.title && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品名</div>
                            <div className="text-base mt-1">{detailData?.item_details.title}</div>
                        </div>
                    )}
                    {detailData?.item_details.price && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">価格</div>
                            <div className="text-base mt-1">¥{Number(detailData?.price.original_price).toLocaleString()}</div>
                        </div>
                    )}
                    {detailData?.item_details.condition && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品の状態</div>
                            <div className="text-base mt-1">{detailData?.item_details.condition}</div>
                        </div>
                    )}
                    {detailData?.item_details.category && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">カテゴリ</div>
                            <div className="text-base mt-1 whitespace-pre-line">
                                {detailData?.item_details.category.join('\n')}
                            </div>
                        </div>
                    )}
                    {detailData?.item_details.item_id && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">ユニークID</div>
                            <div className="text-base mt-1">{detailData.item_details.item_id}</div>
                        </div>
                    )}
                    {detailData?.item_details.description && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品説明</div>
                            <div className="text-base mt-1 whitespace-pre-line">{detailData.item_details.description}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 