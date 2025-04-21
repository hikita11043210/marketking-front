import type { ShippingCalculatorParams } from '@/types/shipping-calculator';

export function validateShippingCalculatorParams(params: ShippingCalculatorParams): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.country_code) {
        errors.push('配送先の国を選択してください');
    }
    
    if (!params.weight) {
        errors.push('重量を入力してください');
    } else if (params.weight <= 0) {
        errors.push('重量は0より大きい値を入力してください');
    }
    
    // 寸法のバリデーション（任意）
    if (params.length !== undefined && params.length < 0) {
        errors.push('長さには0以上の値を入力してください');
    }
    
    if (params.width !== undefined && params.width < 0) {
        errors.push('幅には0以上の値を入力してください');
    }
    
    if (params.height !== undefined && params.height < 0) {
        errors.push('高さには0以上の値を入力してください');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
} 