export type PayPayFreeMarketSearchResult = {
    thumbnail_url: string;
    item_id: string;
    price: number;
    item_name: string;
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
    sold_out?: boolean;
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
