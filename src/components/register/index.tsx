import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BaseRegisterModal } from '@/components/shared/modals/BaseRegisterModal';
import { ProductInfo } from './product-info';
import { ProductForm } from './product-form';
import { useToast } from '@/hooks/use-toast';
import type { ShippingPolicy, PaymentPolicy, ReturnPolicy, EbayPoliciesResponse } from '@/types/ebay/policy';
import type { PayPayFreeMarketSearchResult, ItemDetailResponse } from '@/types/yahoo-free-market';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: PayPayFreeMarketSearchResult | undefined;
}

export const RegisterModal = ({ isOpen, onClose, selectedItem }: RegisterModalProps) => {
    const { toast } = useToast();
    const [detailData, setDetailData] = useState<ItemDetailResponse>();
    const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
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
            if (selectedItem?.item_id) {
                try {
                    setDetailData(undefined);
                    const response = await fetch(`/api/yahoo-free-market/detail?item_id=${encodeURIComponent(selectedItem.item_id)}`);
                    const data = await response.json();
                    if (data.success) {
                        setDetailData(data.data);
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
                            {detailData ? (
                                <ProductForm
                                    detailData={detailData}
                                    selectedItem={selectedItem}
                                    onCancel={onClose}
                                    policies={policies}
                                    isLoadingPolicies={isLoadingPolicies}
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