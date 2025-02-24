import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BaseRegisterModal } from '@/components/shared/modals/BaseRegisterModal';
import { ProductInfo } from './ProductInfo';
import { ProductForm } from './ProductForm';
import { useToast } from '@/hooks/use-toast';
import { extractShippingCost } from '@/lib/utils/price';
import type { SearchDetailResult, SearchResult } from '@/types/search';
import type { ShippingPolicy, PaymentPolicy, ReturnPolicy, EbayPoliciesResponse } from '@/types/ebay/policy';
import type { PriceCalculation } from '@/types/price';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: SearchResult | null;
}

export const RegisterModal = ({ isOpen, onClose, selectedItem }: RegisterModalProps) => {
    const { toast } = useToast();
    const [detailData, setDetailData] = useState<SearchDetailResult>();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [translate_title, setTranslateTitle] = useState<string>('');
    const [translate_condition, setTranslateCondition] = useState<string>('');
    const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
    const [price, setPrice] = useState<PriceCalculation>();
    const [policies, setPolicies] = useState<{
        shipping: ShippingPolicy[];
        payment: PaymentPolicy[];
        return: ReturnPolicy[];
    }>({
        shipping: [],
        payment: [],
        return: []
    });

    // ポリシー情報の取得
    useEffect(() => {
        const loadPolicies = async () => {
            setIsLoadingPolicies(true);
            try {
                const response = await fetch('/api/ebay/policies');
                const data: EbayPoliciesResponse = await response.json();
                if (data.success && data.data) {
                    setPolicies({
                        shipping: data.data.fulfillment.fulfillmentPolicies,
                        payment: data.data.payment.paymentPolicies,
                        return: data.data.return.returnPolicies
                    });
                }
            } catch (error) {
                toast({
                    title: 'エラー',
                    description: error instanceof Error ? error.message : 'ポリシー情報の取得に失敗しました',
                    variant: 'destructive'
                });
            } finally {
                setIsLoadingPolicies(false);
            }
        };

        loadPolicies();
    }, [toast]);

    useEffect(() => {
        const fetchDetail = async () => {
            if (selectedItem?.url) {
                try {
                    setDetailData(undefined);
                    setSelectedImages([]);
                    setTranslateTitle('');
                    setTranslateCondition('');
                    setPrice(undefined);
                    const response = await fetch(`/api/yahoo-auction/detail?url=${encodeURIComponent(selectedItem.url)}`);
                    const data = await response.json();
                    if (data.success) {
                        setDetailData(data.data.data);
                        setSelectedImages(data.data.data.images.url);

                        // タイトル翻訳
                        const response_title_translate = await fetch(`/api/translate?text=${encodeURIComponent(selectedItem.title)}`);
                        const data_title_translate = await response_title_translate.json();
                        if (data_title_translate.success) {
                            setTranslateTitle(data_title_translate.data.translated_text);
                        } else {
                            setTranslateTitle(selectedItem.title);
                        }

                        // 商品状態翻訳
                        if (data.data.data.condition) {
                            const response_condition_translate = await fetch(`/api/translate?text=${encodeURIComponent(data.data.data.condition)}`);
                            const data_condition_translate = await response_condition_translate.json();
                            if (data_condition_translate.success) {
                                setTranslateCondition(data_condition_translate.data.translated_text);
                            } else {
                                setTranslateCondition(data.data.data.condition || '');
                            }
                        }

                        // 価格計算用の配列を作成
                        const priceArray = [
                            selectedItem.buy_now_price || selectedItem.price || '0',
                            extractShippingCost(selectedItem.shipping || '0'),
                        ];

                        // 価格取得
                        if (priceArray.length > 0) {
                            const response_price = await fetch(`/api/calculator/price-init?${priceArray.map(price => `money[]=${encodeURIComponent(price)}`).join('&')}`);
                            const data_price = await response_price.json();
                            if (data_price.success) {
                                setPrice(data_price.data);
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

    if (!selectedItem) return null;

    return (
        <BaseRegisterModal isOpen={isOpen} onClose={onClose}>
            <div className="grid grid-cols-[1fr,2fr] gap-8">
                {/* 左側：選択商品の情報 */}
                <div className="space-y-6">
                    <ProductInfo selectedItem={selectedItem} detailData={detailData} />
                </div>

                {/* 右側：入力フォーム */}
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            {selectedImages.length > 0 && translate_condition && price ? (
                                <ProductForm
                                    initialData={detailData}
                                    selectedItem={selectedItem}
                                    translateCondition={translate_condition}
                                    onCancel={onClose}
                                    policies={policies}
                                    isLoadingPolicies={isLoadingPolicies}
                                    price={price}
                                />
                            ) : (
                                <div className="flex justify-center items-center h-32 text-muted-foreground">
                                    データを読み込み中...
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </BaseRegisterModal>
    );
}; 