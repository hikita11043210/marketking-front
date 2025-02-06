import { ItemSearchParams, CategorySearchParams } from '@/lib/types/search';

export const validateItemSearchParams = (params: ItemSearchParams): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // 必須パラメータのチェック
    if (!params.p || params.p.trim() === '') {
        errors.push('検索キーワードは必須です');
    }

    // 価格範囲のチェック
    if (params.aucmax_bidorbuy_price) {
        const price = parseInt(params.aucmax_bidorbuy_price);
        if (isNaN(price) || price < 0) {
            errors.push('価格は0以上の数値を指定してください');
        }
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

export const validateCategorySearchParams = (params: CategorySearchParams): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // カテゴリIDのチェック
    if (params.category_id && !/^\d+$/.test(params.category_id)) {
        errors.push('カテゴリIDは数値で指定してください');
    }

    // 親カテゴリIDのチェック
    if (params.parent_id && !/^\d+$/.test(params.parent_id)) {
        errors.push('親カテゴリIDは数値で指定してください');
    }

    // 階層の深さのチェック
    if (params.depth !== undefined) {
        if (!Number.isInteger(params.depth) || params.depth < 0) {
            errors.push('階層の深さは0以上の整数で指定してください');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}; 