import type { ShippingCalculatorParams } from '@/lib/types/shipping-calculator';

export function validateShippingCalculatorParams(params: ShippingCalculatorParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.service_id) {
        errors.push('配送サービスを選択してください');
    }
    if (!params.country_code) {
        errors.push('配送先の国を選択してください');
    }
    if (!params.weight || params.weight <= 0) {
        errors.push('重量を入力してください');
    }
    if (!params.length || params.length <= 0) {
        errors.push('長さを入力してください');
    }
    if (!params.width || params.width <= 0) {
        errors.push('幅を入力してください');
    }
    if (!params.height || params.height <= 0) {
        errors.push('高さを入力してください');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
} 