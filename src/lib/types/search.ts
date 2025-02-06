// 商品検索用のパラメータ
export type ItemSearchParams = {
    p: string;
    max?: string;
    auccat?: string;
    va?: string;
    aucmax_bidorbuy_price?: string;
    price_type?: string;
    istatus?: string;
    new?: string;
    is_postage_mode?: string;
    dest_pref_code?: string;
    abatch?: string;
    exflg?: string;
    b?: string;
    n?: string;
};

// カテゴリ検索用のパラメータ
export type CategorySearchParams = {
    category_id?: string;
    parent_id?: string;
    depth?: number;
};

// 検索結果の型定義
export interface SearchResult {
    title: string;
    price: string;
    buy_now_price: string | null;
    image_url: string;
    url: string;
    seller: string;
    end_time: string;
    bid_count: string;
    shipping?: string;
}

export interface SearchDetailResult {
    title: string;
    price: string;
    buy_now_price: string | null;
    image_url: string;
    url: string;
    seller: string;
    end_time: string;
    bid_count: string;
    shipping?: string;
}

export interface SearchResponse {
    success: boolean;
    message: string;
    data: {
        items: SearchResult[];
        total: number;
        fetched: number;
    };
}

// カテゴリ情報の型定義
export type CategoryResult = {
    id: string;
    name: string;
    parent_id?: string;
    children?: CategoryResult[];
    item_count?: number;
}; 