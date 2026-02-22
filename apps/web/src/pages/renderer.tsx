import { Style } from "hono/css";
import { jsxRenderer } from "hono/jsx-renderer";
import { Link, ViteClient } from "vite-ssr-components/hono";
import { ClientScript } from "@/lib/client/helper";

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ViteClient />
        <Link href="/src/pages/style.css" rel="stylesheet" />
        <Style />
      </head>
      <body>
        {children}
        <ClientScript />
      </body>
    </html>
  );
});
