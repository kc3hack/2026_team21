import { Script } from "vite-ssr-components/hono";

/**
 * Client Componentをレンダリングするためのスクリプトタグ
 * グローバルに1度だけ読み込めば良い
 */
export function ClientScript() {
  return <Script type="module" src="/src/lib/client/loader.tsx" />;
}
