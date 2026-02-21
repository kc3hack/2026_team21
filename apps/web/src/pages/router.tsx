import { CounterPage } from "@/components/pages/counter/index.page";
import { registerComponent } from "@/lib/client/loader";
import { escapeJsonForHtml } from "@/lib/escape";
import { TopPage } from "@/pages/index.page";
import { RoomPage, ReceivePage } from "@/pages/r";


/**
 * URLパスとClient Componentを紐付けるレジストリ。
 * ここにページを追加していく。
 *
 * アプリケーションのハンドラーはここではなく、 index.tsx で定義すること。
 */
const components = {
  "/": TopPage,
  "/counter": CounterPage,
  "/r": ReceivePage,
  "/room/:roomId": RoomPage,
} as const;

export type ComponentId = keyof typeof components;
export type ComponentProps<T extends ComponentId> = Parameters<(typeof components)[T]>[0];
export type ComponentType<T extends ComponentId> = ReturnType<(typeof components)[T]>;
export type Component<T extends ComponentId> = (typeof components)[T];

const isComponentId = (id: string): id is ComponentId => {
  return id in components;
};

Object.entries(components).forEach(([id, Component]) => {
  if (!isComponentId(id)) {
    throw new Error(`Invalid component ID: ${id}`);
  }
  registerComponent(id, Component);
});

/**
 * CSR するページをレンダリングするためのコンポーネント。
 * Client Component がマウントされる場所を提供するだけのシンプルなもの。
 *
 * @param id Client ComponentのID（URLパスと同じにする）
 * @param props コンポーネントに渡すProps
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
 * app.get("/room/:roomId", (c) => {
 *   const roomId = c.req.param("roomId");
 *   return c.render(<Page id="/room/:roomId" roomId={roomId} />);
 * });
 *
 * export const CounterPageRoute = app;
 */
export const Page = <T extends ComponentId>(
  args: { id: T } & (ComponentProps<T> extends undefined ? object : ComponentProps<T>),
) => {
  const { id, ...props } = args;
  const hasProps = Object.keys(props).length > 0;

  return (
    <>
      <div id={id} />
      {hasProps && (
        <script
          id={`${id}-props`}
          type="application/json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: espapeJsonForHtml によってエスケープを行なっている
          dangerouslySetInnerHTML={{ __html: escapeJsonForHtml(JSON.stringify(props)) }}
        />
      )}
    </>
  );
};
