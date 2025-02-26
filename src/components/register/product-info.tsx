import { Card, CardContent } from "@/components/ui/card";
import type { PayPayFreeMarketSearchResult, SearchDetailResult } from '@/types/yahoo-free-market';

interface ProductInfoProps {
    selectedItem: PayPayFreeMarketSearchResult;
    detailData: SearchDetailResult | undefined;
}

export const ProductInfo = ({ selectedItem, detailData }: ProductInfoProps) => {
    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                {/* 商品画像 */}
                <div className="w-full aspect-square relative">
                    {selectedItem?.thumbnail_url && (
                        <a
                            href={selectedItem.item_id}
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
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">商品名（Yahoo!オークション）</div>
                        <div className="text-base mt-1">{detailData?.title}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">価格</div>
                        <div className="text-base mt-1">¥{Number(detailData?.price).toLocaleString()}</div>
                    </div>
                    {detailData?.condition && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品の状態</div>
                            <div className="text-base mt-1">{detailData.condition}</div>
                        </div>
                    )}
                    {detailData?.category && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">カテゴリ</div>
                            <div className="text-base mt-1 whitespace-pre-line">
                                {detailData.category.join('\n')}
                            </div>
                        </div>
                    )}
                    {detailData?.item_id && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">ユニークID</div>
                            <div className="text-base mt-1">{detailData.item_id}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 