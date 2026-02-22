import { css } from "hono/css";

type Props = {
  text: string;
  onClick?: () => void;
  id?: string;
  fullWidth?: boolean;
};

export const GreenButton = ({ text, onClick, id = "create-room-btn", fullWidth = false }: Props) => {
  const styles = css`
    width: ${fullWidth ? "100%" : "auto"};
    min-width: 12rem;
    min-height: 3rem;
    padding: clamp(0.8rem, 2.4vw, 1rem) clamp(1.2rem, 5.6vw, 2.2rem);
    font-size: clamp(1.08rem, 2.6vw, 1.35rem);
    font-weight: bold;
    color: white;
    letter-spacing: 0.06em;
    line-height: 1.2;
    cursor: pointer;
    background-color: #758e6f;
    border: none;
    border-radius: 9999px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.1s,
      background-color 0.2s;

    &:focus-visible {
      outline: 3px solid rgba(94, 115, 89, 0.28);
      outline-offset: 2px;
    }

    &:hover {
      background-color: #5e7359;
    }

    &:active {
      transform: scale(0.95);
    }
    @media (max-width: 640px) {
      width: 100%;
      min-width: 0;
      min-height: 3.2rem;
      padding: 0.95rem 1.1rem;
      font-size: 1.08rem;
    }
  `;

  return (
    <button type="button" class={styles} id={id} onClick={onClick}>
      {text}
    </button>
  );
};
