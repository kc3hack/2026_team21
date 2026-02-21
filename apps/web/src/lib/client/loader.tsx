import { render } from "hono/jsx/dom";
import type { Component, ComponentId } from "@/pages/router";

/**
 * Client Componentのレジストリ
 * ここにClient Componentを登録しておくと、自動的にマウントされます
 */
const componentRegistry: { [K in ComponentId]?: Component<K> } = {};

/**
 * Client Componentを登録する関数
 * @param id Client ComponentのID
 * @param component Client ComponentのReactコンポーネント
 */
export function registerComponent<T extends ComponentId>(id: T, component: Component<T>) {
  componentRegistry[id] = component;
}

/**
 * 登録されたすべてのClient Componentをマウントする
 */
export function mountComponents() {
  Object.entries(componentRegistry).forEach(([id, Component]) => {
    const root = document.getElementById(id);
    if (root) {
      // サーバーから埋め込まれたpropsを取得してパース
      // この実装は src/pages/router.tsx にあるので合わせて見ること
      const propsScript = document.getElementById(`${id}-props`);
      const props = propsScript?.textContent ? JSON.parse(propsScript.textContent) : {};

      render(<Component {...props} />, root);
    }
  });
}

// レジストリを動的にインポートしてから初期化
async function init() {
  await import("@/pages/router");
  mountComponents();
}

// DOMContentLoadedで自動的にマウント
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", async () => await init());
  } else {
    // biome-ignore lint/nursery/noFloatingPromises: DOMContentLoadedイベントが発火した後にinit()を呼び出すため、awaitせずに呼び出す
    init();
  }
}
