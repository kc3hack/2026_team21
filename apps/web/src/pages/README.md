# Page 実装方針

- 基本的には CSR するため Client Component として実装する
- Page Compoent は `apps/web/src/components/pages/**/index.page.tsx` のように作成する。
- `export const ComponentName = () => { ... }` という形式でエクスポートする
- Page Component を  `Page` という名前でエクスポートする必要はない（`router.tsx` で任意の名前でインポートして登録するため）
- 作成した Page Component を `apps/web/src/pages/router.tsx` に登録する
- `router.tsx` には URL パスと Page Component を紐付ける形で登録する
  - 例: `"/counter": CounterPage,`
