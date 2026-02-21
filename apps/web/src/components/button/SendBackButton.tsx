// apps/web/src/components/button/SendBackButton.tsx
import { css } from "hono/css";

type Props = {
  onClick: () => void;
};

export const SendBackButton = ({ onClick }: Props) => {
  const styles = css`
    margin-top: 1.5rem;
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    font-weight: 900;
    color: white;
    cursor: pointer;
    /* オレンジの縁取り（袋文字） */
    text-shadow: 
      2px 2px 0 #f6ad49, -2px -2px 0 #f6ad49, 2px -2px 0 #f6ad49,
      -2px 2px 0 #f6ad49, 0 2px 0 #f6ad49, 0 -2px 0 #f6ad49,
      2px 0 0 #f6ad49, -2px 0 0 #f6ad49;
    transition: transform 0.1s ease;

    &:hover { transform: scale(1.1); }
    &:active { transform: scale(0.95); }
  `;

  return (
    <button type="button" class={styles} onClick={onClick}>
      送信する場合はこちら
    </button>
  );
};
