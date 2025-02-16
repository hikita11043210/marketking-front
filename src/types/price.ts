export interface PriceCalculation {
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

export interface PriceCalculationResponse {
    success: boolean;
    data: PriceCalculation;
}
