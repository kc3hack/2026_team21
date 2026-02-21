import { css } from "hono/css";
import type { PropsWithChildren } from "hono/jsx";

export const ButtonList = ({ children }: PropsWithChildren) => {
  const styles = css`
    position: absolute;
    bottom: 5rem;
  `;

  return <div class={styles}>{children}</div>;
};
