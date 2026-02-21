import { CounterPage } from "@/components/pages/counter/index.page";
import { ClientMount } from "@/lib/client/helper";
import { registerComponent } from "@/lib/client/loader";

/**
 * URLパスとClient Componentを紐付けるレジストリ。
 * ここにページを追加していく。
 *
 * アプリケーションのハンドラーはここではなく、 index.tsx で定義すること。
 */
const components = {
  "/counter": CounterPage,
} as const;

export type ComponentId = keyof typeof components;

Object.entries(components).forEach(([id, Component]) => {
  registerComponent(id as ComponentId, Component);
});

/**
 * CSR するページをレンダリングするためのコンポーネント
 *
 * @param id Client ComponentのID（URLパスと同じにする）
 * @returns
 * @example
 * import { Hono } from "hono";
 * import { Page } from "@/pages/router";
 *
 * const app = new Hono();
 *
 * app.get("/", (c) => {
 *   return c.render(<Page id="/counter" />);
 * });
 *
 * export const CounterPageRoute = app;
 */
export const Page = ({ id }: { id: ComponentId }) => {
  return <ClientMount id={id} />;
};
