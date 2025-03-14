export interface EbayStoreType {
    id: number;
    store_type: string;
}

export interface Setting {
    ebay_client_id: string;
    ebay_client_secret: string;
    ebay_dev_id: string;
    yahoo_client_id: string;
    yahoo_client_secret: string;
    ebay_refresh_token?: string;
    ebay_store_type_id: string;
    rate: number;
    deepl_api_key: string;
    ebay_store_types?: EbayStoreType[];
}
