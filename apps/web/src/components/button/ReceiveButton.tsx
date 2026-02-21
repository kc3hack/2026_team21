// apps/web/src/components/button/ReceiveButton.tsx
import { css } from "hono/css";

type Props = {
  onClick: () => void;
};

export const ReceiveButton = ({ onClick }: Props) => {
  const styles = css`
    margin-top: 1.5rem;
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    cursor: pointer;
    text-shadow: 
      2px 2px 0 #758e6f, -2px -2px 0 #758e6f, 2px -2px 0 #758e6f,
      -2px 2px 0 #758e6f, 0 2px 0 #758e6f, 0 -2px 0 #758e6f,
      2px 0 0 #758e6f, -2px 0 0 #758e6f;
    transition: transform 0.1s ease;

    &:hover { transform: scale(1.1); }
    &:active { transform: scale(0.95); }

    @media (max-width: 600px) {
      margin-top: 1.05rem;
      font-size: 1.68rem;
      padding: 0.55rem 0.9rem;
    }
  `;

  return (
    <button type="button" class={styles} onClick={onClick}>
      受け取る場合はこちら
    </button>
  );
};
