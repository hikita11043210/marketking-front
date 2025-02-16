import type { ApiResponse } from './common/api';

export interface Service {
    id: number;
    service_name: string;
}

export interface Country {
    country_code: string;
    country_name: string;
    country_name_jp: string;
}

export interface ShippingResult {
    shipping_cost: number;
    currency: string;
    estimated_days: number;
}

export interface ShippingCalculatorParams {
    service_id: number;
    country_code: string;
    length: number;
    width: number;
    height: number;
    weight: number;
}

export interface ShippingCalculatorResult {
    base_rate: number;
    surcharges: { [key: string]: number };
    total_amount: number;
    weight_used: number;
    zone: string;
    is_oversized: boolean;
}

export interface ServicesResponse extends ApiResponse<{
    services: Service[];
    countries: Country[];
}> {
    success: boolean;
    message: string;
    data: {
        services: Service[];
        countries: Country[];
    };
}

export interface ShippingCalculatorResponse extends ApiResponse<ShippingCalculatorData> {}
export interface ShippingResultResponse extends ApiResponse<ShippingResult> {}

export interface ShippingCalculatorData {
    services: Service[];
    countries: Country[];
}
