/**
 * Yahoo!オークションの日付をISO 8601形式に変換します
 * @param yahooDate - Yahoo!オークションの日付（例: "2025.02.18（月）10:00"）
 * @returns ISO 8601形式の日付（例: "2025-02-18T10:00:00"）
 */
export const convertYahooDate = (yahooDate: string | undefined): string | undefined => {
    if (!yahooDate) return undefined;

    // 正規表現で日付部分を抽出
    const match = yahooDate.match(/(\d{4})\.(\d{2})\.(\d{2})（[^)]+）(\d{2}:\d{2})/);
    if (!match) return undefined;

    // 抽出した部分をISO 8601形式に変換
    const [_, year, month, day, time] = match;
    return `${year}-${month}-${day}T${time}:00`;
};