import { Card, CardContent } from "@/components/ui/card";
import type { SearchDetailResult, SearchResult } from '@/types/search';

interface ProductInfoProps {
    selectedItem: SearchResult;
    detailData?: SearchDetailResult;
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
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">商品名（Yahoo!オークション）</div>
                        <div className="text-base mt-1">{selectedItem?.title}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">現在価格</div>
                        <div className="text-base mt-1">¥{Number(selectedItem?.price).toLocaleString()}</div>
                    </div>
                    {selectedItem?.buy_now_price && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">即決価格</div>
                            <div className="text-base mt-1">¥{Number(selectedItem.buy_now_price).toLocaleString()}</div>
                        </div>
                    )}
                    <div>
                        <div className="text-sm font-medium text-muted-foreground">送料</div>
                        <div className="text-base mt-1">{selectedItem?.shipping || '送料情報なし'}</div>
                    </div>
                    {selectedItem?.end_time && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">終了時間</div>
                            <div className="text-base mt-1">残り：{selectedItem.end_time}</div>
                        </div>
                    )}
                    {detailData?.condition && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">商品の状態</div>
                            <div className="text-base mt-1">{detailData.condition}</div>
                        </div>
                    )}
                    {detailData?.categories && detailData.categories.length > 0 && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">カテゴリ</div>
                            <div className="text-base mt-1 whitespace-pre-line">
                                {detailData.categories.join(' > \n')}
                            </div>
                        </div>
                    )}
                    {detailData?.auction_id && (
                        <div>
                            <div className="text-sm font-medium text-muted-foreground">オークションID</div>
                            <div className="text-base mt-1">{detailData.auction_id}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}; 