/**
 * JSONを安全にHTMLに埋め込むためのエスケープ関数
 * OWASP XSS Prevention Guidelines に基づいて実装
 *
 * - </script> タグによるスクリプトインジェクション
 * - HTML エンティティによる攻撃
 * - Line/Paragraph Separator による改行注入
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
 */
export function escapeJsonForHtml(json: string): string {
  return json
    .replace(/</g, "\\u003c") // '<' -> \u003c
    .replace(/>/g, "\\u003e") // '>' -> \u003e にエスケープ
    .replace(/&/g, "\\u0026") // '&' -> \u0026
    .replace(/\u2028/g, "\\u2028") // Line Separator (U+2028)
    .replace(/\u2029/g, "\\u2029"); // Paragraph Separator (U+2029)
}
