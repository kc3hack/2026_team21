import type { ComponentId } from "@/pages/router";

/**
 * Client Componentをマウントするためのヘルパーコンポーネント
 *
 * @example
 * // 指定したIDにClient Componentがマウントされる
 * <ClientMount id="my-component" />
 *
 */
export function ClientMount({ id }: { id: ComponentId }) {
  return <div id={id} />;
}

/**
 * Client Componentをレンダリングするためのスクリプトタグ
 * グローバルに1度だけ読み込めば良い
 */
export function ClientScript() {
  return <script type="module" src="/src/lib/client/loader.tsx" />;
}
