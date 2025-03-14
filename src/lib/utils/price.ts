/**
 * 配送料金文字列から数値のみを抽出します
 * @param shipping - 配送料金を含む文字列（例: "送料 1,000円"）
 * @returns 数値のみの文字列（例: "1000"）
 */
export const extractShippingCost = (shipping: string): string => {
    // 数値とカンマのみを抽出
    const matches = shipping.match(/[0-9,]+/);
    if (matches) {
        // カンマを除去して返す
        return matches[0].replace(/,/g, '');
    }
    return '0';
};
