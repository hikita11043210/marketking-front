import { Card, CardContent } from "@/components/ui/card";
import type { SearchResult, ItemDetailResponse } from '@/types/yahoo-auction';

interface ProductInfoProps {
    selectedItem: SearchResult;
    detailData: ItemDetailResponse | undefined;
}

export const ProductInfo = ({ selectedItem, detailData }: ProductInfoProps) => {
    return (
        <Card>
            <CardContent className="pt-6 space-y-6">
                {/* 商品画像 */}
                <div className="w-full aspect-square relative">
                    {selectedItem?.image_url && (
                        <a
                            href={selectedItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-full block hover:opacity-90 transition-opacity"
                        >
                            <div
                                className="w-full h-full bg-center bg-no-repeat bg-contain"
                                style={{ backgroundImage: `url(${selectedItem.image_url})` }}
                            />
                        </a>
                    )}
                </div>

                {/* 商品情報 */}
                <div className="space-y-4">
                    {detailData?.item_details.title && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品名（Yahoo!オークション）</div>
                            <div className="text-base mt-1">{detailData?.item_details.title}</div>
                        </div>
                    )}
                    {detailData?.item_details.current_price && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">現在価格</div>
                            <div className="text-base mt-1">¥{Number(detailData?.item_details.current_price).toLocaleString()}</div>
                        </div>
                    )}
                    {detailData?.item_details.buy_now_price && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">即決価格</div>
                            <div className="text-base mt-1">¥{Number(detailData?.item_details.buy_now_price).toLocaleString()}</div>
                        </div>
                    )}
                    {selectedItem?.shipping && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">送料</div>
                            <div className="text-base mt-1">{selectedItem?.shipping || '送料情報なし'}</div>
                        </div>
                    )}
                    {detailData?.item_details.title && selectedItem?.end_time && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">終了時間</div>
                            <div className="text-base mt-1">残り：{selectedItem.end_time}</div>
                        </div>
                    )}
                    {detailData?.item_details.condition && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品の状態</div>
                            <div className="text-base mt-1">{detailData?.item_details.condition}</div>
                        </div>
                    )}
                    {detailData?.item_details.categories && detailData.item_details.categories.length > 0 && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">カテゴリ</div>
                            <div className="text-base mt-1 whitespace-pre-line">
                                {detailData?.item_details.categories.join('\n')}
                            </div>
                        </div>
                    )}
                    {detailData?.item_details.auction_id && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">オークションID</div>
                            <div className="text-base mt-1">{detailData?.item_details.auction_id}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 