/**
 * eBay用のタイトルから特殊文字を置換する関数
 * @param text 変換対象のテキスト
 * @returns 特殊文字が置換されたテキスト
 */
export const replaceSpecialCharacters = (text: string): string => {
    return text
        .replace(/[！-～]/g, (s) => {
            // 全角英数字を半角に変換
            return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        })
        .replace(/　/g, ' ') // 全角スペースを半角スペースに変換
        .replace(/[①-⑨]/g, (s) => {
            // 丸数字を通常の数字に変換
            return String.fromCharCode(s.charCodeAt(0) - 0x2460 + 49);
        })
        .replace(/[㈱㈲㈹]/g, '') // 特殊な記号を削除
        .replace(/[™®©℠]/g, '') // 商標関連の記号を削除
        .replace(/[☆★○●◎◇◆□■△▲▽▼※→←↑↓]/g, '') // その他の記号を削除
        .replace(/[。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇〈〉《》「」『』〔〕〖〗〘〙〚〛]/g, '') // 日本語の記号を削除（【】、、を除外）
        .replace(/[∀-∂∃-∇∈-∋∌-∎∏-∑−√∝∟∠∣∥∧-∬∭-∯∰-∴∵-∼∽-∿≀-≂≃-≒≓-≕≖-≚≛-≝≞-≡≢-≣≤-≧≨-≫≬-≯≰-≴≵-≷≸-≺≻-≼≽-⊁⊂-⊅⊆-⊇⊈-⊉⊊-⊋⊌-⊏⊐-⊓⊔-⊕⊖-⊗⊘-⊙⊚-⊛]/g, '') // 数学記号を削除
        .replace(/[‼⁇⁈⁉]/g, '') // 重ね文字を削除
        .replace(/[＃＄％＆＊＠＼］［＾｀｛｜｝～￠￡￢￣￤￥￦]/g, '') // その他の全角記号を削除
        .replace(/[^\p{L}\p{N}\s\-\/#μ【】、]/gu, '') // 文字（全言語）、数字、スペース、ハイフン、スラッシュ、#、μ、【】、、以外を削除
        .replace(/\s+/g, ' ') // 連続するスペースを1つに
        .trim(); // 前後の空白を削除
}; 