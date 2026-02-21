import type { FC } from "hono/jsx";
import { render } from "hono/jsx/dom";
import type { ComponentId } from "@/pages/router";

/**
 * Client Componentのレジストリ
 * ここにClient Componentを登録しておくと、自動的にマウントされます
 */
const componentRegistry: Record<string, FC> = {};

/**
 * Client Componentを登録する関数
 * @param id Client ComponentのID
 * @param component Client ComponentのReactコンポーネント
 */
export function registerComponent(id: ComponentId, component: FC) {
  componentRegistry[id] = component;
}

/**
 * 登録されたすべてのClient Componentをマウントする
 */
export function mountComponents() {
  Object.entries(componentRegistry).forEach(([id, Component]) => {
    const root = document.getElementById(id);
    if (root) {
      render(<Component />, root);
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
