# Page 実装方針

ページを SSR するか CSR にするかは各ページで決めて良い。

ただし、それぞれのルールに従うこと。

## CSR / Pages Component を作る

- Page Compoent は `apps/web/src/components/pages/**/index.page.tsx` のように作成する。
- `export const ComponentName = () => { ... }` という形式でエクスポートする
- Page Component を  `Page` という名前でエクスポートする必要はない（`router.tsx` で任意の名前でインポートして登録するため）
- 作成した Page Component を `apps/web/src/pages/router.tsx` に登録する
- `router.tsx` には URL パスと Page Component を紐付ける形で登録する
  - 例: `"/counter": CounterPage,`

バンドルされるコードに機密情報が混じらないか注意すること。

## SSR / 素の hono/jsx を用いる

機密情報をクライアントに渡さないように注意すること。
