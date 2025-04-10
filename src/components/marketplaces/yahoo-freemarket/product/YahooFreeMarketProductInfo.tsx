import type { PayPayFreeMarketSearchResult, ItemDetailResponse } from '@/types/yahoo-free-market';
import { CommonProductInfo, InfoItem } from '@/components/common/product/CommonProductInfo';

interface ProductInfoProps {
    selectedItem: PayPayFreeMarketSearchResult;
    detailData: ItemDetailResponse | undefined;
}

export const ProductInfo = ({ selectedItem, detailData }: ProductInfoProps) => {
    // 表示する情報項目を作成
    const infoItems: InfoItem[] = [
        {
            label: "商品名",
            value: detailData?.item_details.title || "",
            condition: !!detailData?.item_details.title
        },
        {
            label: "価格",
            value: `¥${Number(detailData?.price.original_price || 0).toLocaleString()}`,
            condition: !!detailData?.item_details.price
        },
        {
            label: "商品の状態",
            value: detailData?.item_details.condition || "",
            condition: !!detailData?.item_details.condition
        },
        {
            label: "カテゴリ",
            value: detailData?.item_details.category?.join('\n') || "",
            condition: !!detailData?.item_details.category
        },
        {
            label: "ユニークID",
            value: detailData?.item_details.item_id || "",
            condition: !!detailData?.item_details.item_id
        },
        {
            label: "商品説明",
            value: detailData?.item_details.description || "",
            condition: !!detailData?.item_details.description
        }
    ];

    return (
        <CommonProductInfo
            imageUrl={selectedItem?.thumbnail_url}
            linkUrl={`https://paypayfleamarket.yahoo.co.jp/item/${selectedItem.item_id}`}
            infoItems={infoItems}
        />
    );
}; 