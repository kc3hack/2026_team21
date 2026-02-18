import type { Child } from "hono/jsx";

type Props = {
  children: Child;
};

export const Layout = ({ children }: Props) => {
  return (
    <div>
      <header>
        <h1>Direct ファイル便</h1>
      </header>
      <main>{children}</main>
    </div>
  );
};
