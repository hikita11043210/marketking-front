import type { ApiResponse } from './common/api';

// 国リスト
export interface Country {
    code: string;
    name: string;
}

// 送料計算に使用する重量（サービスごと）
export interface ShippingWeights {
    fedex: number;
    dhl: number;
    economy: number;
}

// 各サービスの送料
export interface ShippingRate {
    fedex: number;
    dhl: number;
    economy: number;
}

// 送料計算リクエストパラメータ
export interface ShippingCalculatorParams {
    country_code: string;
    weight: number;
    length?: number;
    width?: number;
    height?: number;
    is_document?: boolean;
}

// 送料計算結果
export interface ShippingCalculatorResult {
    country: {
        code: string;
        name: string;
    };
    physical_weight: number;
    weights_used: ShippingWeights;
    shipping_rates: ShippingRate;
    recommended_service: string;
}

// 国リスト取得APIレスポンス
export interface CountriesResponse extends ApiResponse<{
    countries: Country[];
}> {}

// 送料計算APIレスポンス
export interface ShippingCalculatorResponse extends ApiResponse<ShippingCalculatorResult> {}
