import { z } from 'zod';
import type { Setting } from '@/types/settings';

export const settingSchema = z.object({
    yahoo_client_id: z.string().min(1, { message: 'Yahoo Client IDは必須です' }).optional(),
    yahoo_client_secret: z.string().min(1, { message: 'Yahoo Client Secretは必須です' }).optional(),
    ebay_client_id: z.string().min(1, { message: 'eBay Client IDは必須です' }).optional(),
    ebay_client_secret: z.string().min(1, { message: 'eBay Client Secretは必須です' }).optional()
});

export type SettingFormData = z.infer<typeof settingSchema>;

export function validateSettingParams(params: Setting): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!params.ebay_client_id) {
        errors.push('eBay Client IDは必須です');
    }
    if (!params.ebay_client_secret) {
        errors.push('eBay Client Secretは必須です');
    }
    if (!params.ebay_dev_id) {
        errors.push('eBay Dev IDは必須です');
    }
    if (!params.yahoo_client_id) {
        errors.push('Yahoo Client IDは必須です');
    }
    if (!params.yahoo_client_secret) {
        errors.push('Yahoo Client Secretは必須です');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
} 