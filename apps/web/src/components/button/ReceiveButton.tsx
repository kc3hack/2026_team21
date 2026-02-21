// apps/web/src/components/button/ReceiveButton.tsx
import { css } from "hono/css";

export const ReceiveButton = () => {
  const styles = css`
    margin-top: 1.5rem;
    background: none;
    border: none;
    padding: 0.5rem 1rem;
    font-size: 2.5rem;
    font-weight: 900;
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
      transform: scale(1.1);
    }
    &:active {
      transform: scale(0.95);
    }
  `;

  const handleClick = () => {
    // r/index.tsx への遷移
    window.location.href = "/r";
  };

  return (
    <button type="button" class={styles} onClick={handleClick}>
      受け取る場合はこちら
    </button>
  );
};
