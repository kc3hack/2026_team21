import { render } from "hono/jsx/dom";
import type { Component, ComponentId } from "@/pages/router";

const componentRegistry: { [K in ComponentId]?: Component<K> } = {};

/**
 * Client Componentを登録する関数
 * @param id Client ComponentのID
 * @param component Client ComponentのReactコンポーネント
 */
export function registerComponent<T extends ComponentId>(id: T, component: Component<T>) {
  if (!componentRegistry[id]) componentRegistry[id] = component;
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
