// 商品検索用のパラメータ
export type SearchParams = {
    p: string;
    max?: number;
    min?: number;
    auccat?: string;
    va?: string;
    price_type?: string;
    istatus?: string;
    new?: string;
    is_postage_mode?: string;
    dest_pref_code?: string;
    fixed?: number;
    abatch?: string;
    exflg?: string;
    b?: string;
    n?: string;
};

// 検索結果の型定義
export type SearchResult = {
    items: {
        title: string;
        price: string;
        buy_now_price: string | null;
        image_url: string;
        url: string;
        seller: string;
        end_time: string;
        bid_count: string;
        shipping?: string;
    }[];
    total: number;
}

export type SearchDetailResult = {
    title: string;

    current_price: string;
    current_price_in_tax: string;
    buy_now_price: string;
    buy_now_price_in_tax: string;
    categories: string[];
    condition: string;
    start_time: string;
    end_time: string;
    auction_id: string;
    images: {
        url: string[];
    };
}

// カテゴリ検索用のパラメータ
export type CategorySearchParams = {
    category_id?: string;
    parent_id?: string;
    depth?: number;
};

// カテゴリ情報の型定義
export type CategoryResult = {
    id: string;
    name: string;
    parent_id?: string;
    children?: CategoryResult[];
    item_count?: number;
}; 
