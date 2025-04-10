import { useState, useEffect } from 'react';
import { ProductInfo } from './YahooAuctionProductInfo';
import { ProductForm } from './YahooAuctionProductForm';
import { toast } from 'sonner';
import type { ItemDetailResponse, SearchResult } from '@/types/yahoo-auction';
import type { ShippingPolicy, PaymentPolicy, ReturnPolicy, EbayPoliciesResponse } from '@/types/ebay/policy';
import { CommonRegisterModal } from '@/components/common/product/CommonRegisterModal';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: SearchResult | null;
}

const extractShippingCost = (shippingText: string): number => {
    const match = shippingText.match(/(\d+,?\d*)/);
    if (!match) return 1200;
    return parseInt(match[1].replace(',', ''), 10);
};

export const RegisterModal = ({ isOpen, onClose, selectedItem }: RegisterModalProps) => {
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
                toast.error(error instanceof Error ? error.message : 'ポリシー情報の取得に失敗しました');
            } finally {
                setIsLoadingPolicies(false);
            }
        };

        loadPolicies();
    }, []);

    useEffect(() => {
        const fetchDetail = async () => {
            if (selectedItem?.url) {
                try {
                    setDetailData(undefined);
                    const shipping = selectedItem.shipping || '';
                    const shippingCost = extractShippingCost(shipping);
                    const response = await fetch(`/api/yahoo-auction/detail?url=${encodeURIComponent(selectedItem.url)}&shipping=${encodeURIComponent(shippingCost)}`);
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
        <CommonRegisterModal
            isOpen={isOpen}
            onClose={onClose}
            isLoading={!detailData}
            productInfoComponent={
                <ProductInfo selectedItem={selectedItem} detailData={detailData} />
            }
            productFormComponent={
                detailData && (
                    <ProductForm
                        detailData={detailData}
                        selectedItem={selectedItem}
                        onCancel={onClose}
                        policies={policies}
                        isLoadingPolicies={isLoadingPolicies}
                    />
                )
            }
        />
    );
}; 