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
import { yahooAuctionEndpoints } from "@/lib/api/endpoint/yahoo-auction";
import { SearchDetailResult } from '@/types/search';
interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: {
        title: string;
        price: string;
        buy_now_price: string | null;
        image_url: string;
        shipping?: string;
        url: string;
    } | null;
}

// propsを受け取るように修正
export default function RegisterModal({ isOpen, onClose, selectedItem }: RegisterModalProps) {
    const [results, setResults] = useState<SearchDetailResult>();

    // selectedItemが存在する場合のみAPIを呼び出す
    useEffect(() => {
        const fetchDetail = async () => {
            if (selectedItem?.url) {
                try {
                    const data = await yahooAuctionEndpoints.getYahooAuctionDetail(selectedItem.url);
                    if (data.success) {
                        setResults(data.data);
                    }
                } catch (error) {
                    console.error('API呼び出しエラー:', error);
                }
            }
        };

        fetchDetail();
    }, [selectedItem]);


    const handleSubmit = (data: EbayRegisterData) => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>商品登録</DialogTitle>
                    <DialogDescription id="dialog-description" className="sr-only">
                        ebay登録フォーム
                    </DialogDescription>
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
                                    {results?.data?.condition && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">商品の状態</div>
                                            <div className="text-base mt-1">{results.data.condition}</div>
                                        </div>
                                    )}
                                    {results?.data?.categories && results.data.categories.length > 0 && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">カテゴリ</div>
                                            <div className="text-base mt-1 whitespace-pre-line">
                                                {results.data.categories.join(' > \n')}
                                            </div>
                                        </div>
                                    )}
                                    {results?.data?.auction_id && (
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">オークションID</div>
                                            <div className="text-base mt-1">{results.data.auction_id}</div>
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
                                <ProductForm
                                    initialData={{
                                        title: selectedItem?.title || '',
                                        price: selectedItem?.price || '',
                                        currency: 'USD',
                                    }}
                                    onSubmit={handleSubmit}
                                    onCancel={onClose}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 