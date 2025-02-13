import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ProductForm } from "@/components/ebay/ProductForm";
import type { EbayRegisterData } from '@/types/product';
import type { SearchDetailResult, SearchResult } from '@/types/search';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: SearchResult;
}

export default function RegisterModal({ isOpen, onClose, selectedItem }: RegisterModalProps) {
    const [detailData, setDetailData] = useState<SearchDetailResult>();
    const [selectedImages, setSelectedImages] = useState<string[]>([]); // 追加: 選択された画像を管理するstate
    const [translate_title, setTranslateTitle] = useState<string>('');
    const [translate_condition, setTranslateCondition] = useState<string>('');
    useEffect(() => {
        const fetchDetail = async () => {
            if (selectedItem?.url) {
                try {
                    setSelectedImages([]);
                    let response = await fetch(`/api/yahoo-auction/detail?url=${encodeURIComponent(selectedItem.url)}`);
                    let data = await response.json();
                    if (data.success) {
                        setDetailData(data.data.data);
                        setSelectedImages(data.data.data.images.url);

                        // タイトル翻訳
                        response = await fetch(`/api/translate?text=${encodeURIComponent(selectedItem.title)}`);
                        data = await response.json();
                        if (data.success) {
                            setTranslateTitle(data.data.translated_text);
                        } else {
                            setTranslateTitle(selectedItem.title);
                        }

                        // 商品状態翻訳
                        if (detailData?.condition) {
                            response = await fetch(`/api/translate?text=${encodeURIComponent(detailData?.condition || '')}`);
                            data = await response.json();
                            if (data.success) {
                                setTranslateCondition(data.data.translated_text);
                            } else {
                                setTranslateCondition(detailData?.condition || '');
                            }
                        }
                    }
                } catch (error) {
                    console.error('API呼び出しエラー:', error);
                }
            }
        };

        fetchDetail();
    }, [selectedItem]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1600px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>商品登録</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-[1fr,2fr] gap-8">
                    {/* 左側：選択商品の情報 */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="pt-6 space-y-6">
                                {/* 商品画像 */}
                                <div className="w-full aspect-square relative">
                                    {selectedItem?.image_url && (
                                        <div
                                            className="w-full h-full bg-center bg-no-repeat bg-contain"
                                            style={{ backgroundImage: `url(${selectedItem.image_url})` }}
                                        />
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
                    </div>

                    {/* 右側：入力フォーム */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="pt-6">
                                {selectedImages.length > 0 && translate_title && translate_condition ? (
                                    <ProductForm
                                        initialData={detailData}
                                        translateTitle={translate_title}
                                        translateCondition={translate_condition}
                                        onCancel={onClose}
                                    />
                                ) : (
                                    <div className="flex justify-center items-center h-32 text-muted-foreground">
                                        画像データを読み込み中...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 