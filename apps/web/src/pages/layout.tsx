import type { Child } from "hono/jsx";

type Props = {
  children: Child;
};

export const Layout = ({ children }: Props) => {
  return (
    <div>
      <header></header>
      <main>{children}</main>
    </div>
  );
};
