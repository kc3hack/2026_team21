// apps/web/src/components/button/SendBackButton.tsx
import { css } from "hono/css";

type Props = {
  onClick: () => void;
};

export const SendBackButton = ({ onClick }: Props) => {
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
      2px 2px 0 #f6ad49,
      -2px -2px 0 #f6ad49,
      2px -2px 0 #f6ad49,
      -2px 2px 0 #f6ad49,
      0 2px 0 #f6ad49,
      0 -2px 0 #f6ad49,
      2px 0 0 #f6ad49,
      -2px 0 0 #f6ad49;
    transition: transform 0.1s ease;

    &:hover {
      transform: scale(1.04);
    }

    &:active {
      transform: scale(0.97);
    }

    &:focus-visible {
      outline: 3px solid rgba(246, 173, 73, 0.36);
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
      送信する場合はこちら
    </button>
  );
};
