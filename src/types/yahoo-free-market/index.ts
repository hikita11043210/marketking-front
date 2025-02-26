export type PayPayFreeMarketSearchResult = {
    thumbnail_url: string;
    item_id: string;
    price: number;
}

export type PayPayFreeMarketSearchResults = {
    items: PayPayFreeMarketSearchResult[];
    total: number;
}

export type SearchDetailResult = {
    title: string;
    description: string;
    images: string[];
    price: number;
    item_id: string;
    url: string;
    condition: string;
    category: string[];
    delivery_schedule: string;
    delivery_method: string;
    create_date: string;
    update_date: string;
    status: string;
    pv_count: number;
    like_count: number;
    sold_out: boolean;
}