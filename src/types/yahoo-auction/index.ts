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

export type SearchResults = {
    items: SearchResult[];
    total: number;
}

export type SearchResult = {
    title: string;
    price: number;
    buy_now_price: number | null;
    image_url: string;
    url: string;
    seller: string;
    end_time: string;
    bid_count: number;
    shipping?: string;
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
    description: string;
}

// 型定義を修正
export type ItemSpecific = {
    [key: string]: string | null;
}

export type CategoryInfo = {
    categoryId: string;
    categoryName: string;
    path: string;
}

export type ConditionOption = {
    conditionId: string;
    conditionDescription: string;
}

export type PriceCalculation = {
    original_price: number;
    shipping_cost: number;
    rate: number;
    ebay_fee: number;
    international_fee: number;
    tax_rate: number;
    calculated_price_yen: number;
    calculated_price_dollar: number;
    exchange_rate: number;
    final_profit_yen: number;
    final_profit_dollar: number;
}

export type TranslatedText = {
    translated_text: string;
    target_lang: string;
}

export type ItemDetailResponse = {
    item_details: SearchDetailResult;
    item_specifics: ItemSpecific[];
    category: CategoryInfo[];
    category_id: string;
    condition_description_en: TranslatedText;
    price: PriceCalculation;
    conditions: ConditionOption[];
    selected_condition: number;
}
