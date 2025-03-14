import { SearchParams } from '@/types/search';

export const validateItemSearchParams = (params: SearchParams): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 必須パラメータのチェック
    if (!params.p || params.p.trim() === '') {
        errors.push('検索キーワードは必須です');
    }

    // 都道府県コードのチェック
    if (params.dest_pref_code) {
        const prefCode = parseInt(params.dest_pref_code);
        if (isNaN(prefCode) || prefCode < 1 || prefCode > 47) {
            errors.push('都道府県コードが不正です');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};