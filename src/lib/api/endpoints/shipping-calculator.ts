import { apiClient } from '../client';
import type { ShippingCalculatorParams, ShippingCalculatorResponse, ServicesResponse } from '@/lib/types/shipping-calculator';

export const shippingCalculatorEndpoints = {
    services: 'shipping-calculator/services/',
    calculate: 'shipping-calculator/calculate/',
} as const;

export const shippingCalculatorApi = {
    getServices: async (): Promise<ServicesResponse> => {
        const { data } = await apiClient.get(shippingCalculatorEndpoints.services);
        return data;
    },

    calculate: async (params: ShippingCalculatorParams): Promise<ShippingCalculatorResponse> => {
        const { data } = await apiClient.post(shippingCalculatorEndpoints.calculate, params);
        return data;
    },
}; 