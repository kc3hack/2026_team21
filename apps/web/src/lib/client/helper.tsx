/**
 * Client Componentをレンダリングするためのスクリプトタグ
 * グローバルに1度だけ読み込めば良い
 */
export function ClientScript() {
  return <script type="module" src="/src/lib/client/loader.tsx" />;
}
