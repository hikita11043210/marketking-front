import { useState, useEffect } from 'react';
import { ProductInfo } from './YahooFreeMarketProductInfo';
import { ProductForm } from './YahooFreeMarketProductForm';
import { toast } from 'sonner';
import type { ShippingPolicy, PaymentPolicy, ReturnPolicy, EbayPoliciesResponse } from '@/types/ebay/policy';
import type { PayPayFreeMarketSearchResult, ItemDetailResponse } from '@/types/yahoo-free-market';
import { CommonRegisterModal } from '@/components/common/product/CommonRegisterModal';
import type { EbayStoreType } from '@/types/ebay-store-type';
interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: PayPayFreeMarketSearchResult | undefined;
}

export const RegisterModal = ({ isOpen, onClose, selectedItem }: RegisterModalProps) => {
    const [detailData, setDetailData] = useState<ItemDetailResponse>();
    const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
    const [ebayStoreType, setEbayStoreType] = useState<EbayStoreType[]>([]);
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
            if (selectedItem?.item_id) {
                try {
                    setDetailData(undefined);
                    const response = await fetch(`/api/yahoo-free-market/detail?item_id=${encodeURIComponent(selectedItem.item_id)}`);
                    const data = await response.json();
                    if (data.success) {
                        setDetailData(data.data);
                    }
                } catch (error) {
                    toast.error(error instanceof Error ? error.message : '商品の取得に失敗しました');
                }
            }
        };

        fetchDetail();
    }, [selectedItem]);

    useEffect(() => {
        console.log("aaa");
        const fetchEbayStoreType = async () => {
            if (selectedItem?.item_id) {
                try {
                    const response = await fetch(`/api/master/ebay-store-type`);
                    const data = await response.json();
                    if (data.success) {
                        setEbayStoreType(data.data);
                    }
                } catch (error) {
                    console.error('API呼び出しエラー:', error);
                }
            }
        };

        fetchEbayStoreType();
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
                        ebayStoreType={ebayStoreType}
                    />
                )
            }
        />
    );
}; 