// apps/web/src/components/button/ReceiveButton.tsx
import { css } from "hono/css";

type Props = {
  onClick: () => void;
};

export const ReceiveButton = ({ onClick }: Props) => {
  const styles = css`
    margin-top: clamp(0.85rem, 2.2vw, 1.3rem);
    min-height: 3rem;
    width: min(100%, 22rem);
    background: none;
    border: none;
    padding: 0.75rem 1rem;
    font-size: clamp(1rem, 2.8vw, 1.28rem);
    font-weight: 900;
    line-height: 1.35;
    color: white;
    cursor: pointer;
    text-shadow:
      2px 2px 0 #758e6f,
      -2px -2px 0 #758e6f,
      2px -2px 0 #758e6f,
      -2px 2px 0 #758e6f,
      0 2px 0 #758e6f,
      0 -2px 0 #758e6f,
      2px 0 0 #758e6f,
      -2px 0 0 #758e6f;
    transition: transform 0.1s ease;

    &:hover {
      transform: scale(1.04);
    }

    &:active {
      transform: scale(0.97);
    }

    &:focus-visible {
      outline: 3px solid rgba(94, 115, 89, 0.3);
      outline-offset: 2px;
      border-radius: 14px;
    }

    @media (max-width: 640px) {
      margin-top: 0.8rem;
      min-height: 3.2rem;
      width: min(100%, 21rem);
      padding: 0.72rem 0.75rem;
      font-size: 1.04rem;
    }
  `;

  return (
    <button type="button" class={styles} onClick={onClick}>
      受け取る場合はこちら
    </button>
  );
};
