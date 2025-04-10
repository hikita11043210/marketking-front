import type { SearchResult, ItemDetailResponse } from '@/types/yahoo-auction';
import { CommonProductInfo, InfoItem } from '@/components/common/product/CommonProductInfo';

interface ProductInfoProps {
    selectedItem: SearchResult;
    detailData: ItemDetailResponse | undefined;
}

export const ProductInfo = ({ selectedItem, detailData }: ProductInfoProps) => {
    // 表示する情報項目を作成
    const infoItems: InfoItem[] = [
        {
            label: "商品名（Yahoo!オークション）",
            value: detailData?.item_details.title || "",
            condition: !!detailData?.item_details.title
        },
        {
            label: "現在価格",
            value: `¥${Number(detailData?.item_details.current_price_in_tax || 0).toLocaleString()}`,
            condition: !!detailData?.item_details.current_price_in_tax
        },
        {
            label: "即決価格",
            value: `¥${Number(detailData?.item_details.buy_now_price_in_tax || 0).toLocaleString()}`,
            condition: !!detailData?.item_details.buy_now_price_in_tax
        },
        {
            label: "送料",
            value: selectedItem?.shipping || '送料情報なし',
            condition: !!selectedItem?.shipping
        },
        {
            label: "終了時間",
            value: `残り：${selectedItem.end_time}`,
            condition: !!(detailData?.item_details.title && selectedItem?.end_time)
        },
        {
            label: "商品の状態",
            value: detailData?.item_details.condition || "",
            condition: !!detailData?.item_details.condition
        },
        {
            label: "カテゴリ",
            value: detailData?.item_details.categories?.join('\n') || "",
            condition: !!(detailData?.item_details.categories && detailData.item_details.categories.length > 0)
        },
        {
            label: "オークションID",
            value: detailData?.item_details.auction_id || "",
            condition: !!detailData?.item_details.auction_id
        },
        {
            label: "商品説明",
            value: detailData?.item_details.description || "",
            condition: !!detailData?.item_details.description
        }
    ];

    return (
        <CommonProductInfo
            imageUrl={selectedItem?.image_url}
            linkUrl={selectedItem?.url}
            infoItems={infoItems}
        />
    );
}; 