import { css } from "hono/css";

type Props = {
  text: string;
  onClick?: () => void;
};

export const GreenButton = ({ text, onClick }: Props) => {
  const styles = css`
    padding: 1.25rem 4rem;
    font-size: 2rem;
    font-weight: bold;
    color: white;
    letter-spacing: 0.1em;
    cursor: pointer;
    background-color: #758e6f;
    border: none;
    border-radius: 4rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition:
    transform 0.1s,
    background-color 0.2s;

    &:hover {
      background-color: #5e7359;
    }

    &:active {
      transform: scale(0.95);
    }
  `;

  return (
    <button type="button" class={styles} id="create-room-btn" onClick={onClick}>
      {text}
    </button>
  );
};
