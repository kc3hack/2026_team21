import { css } from "hono/css";

const containerStyles = css`
  background-color: #fff;
  border: 6px solid #f6ad49; /* オレンジの太い縁 */
  border-radius: 32px;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;

  @media (max-width: 600px) {
    max-width: 300px;
    padding: 1.5rem 1rem;
    border-width: 4px;
  }
`;

const titleStyles = css`
  color: #f6ad49;
  font-weight: 900;
  font-size: 1.5rem;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 1.2rem;
  }
`;

const pinContainerStyles = css`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const pinInputStyles = css`
  width: 3rem;
  height: 4rem;
  border: 3px solid #ccc;
  border-radius: 12px;
  text-align: center;
  font-size: 2rem;
  font-weight: 900;
  color: #333;
  background: #f9f9f9;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #f6ad49;
    box-shadow: 0 0 0 4px rgba(246, 173, 73, 0.2);
    background: #fff;
  }

  @media (max-width: 600px) {
    width: 2.2rem;
    height: 3rem;
    font-size: 1.5rem;
  }
`;

export const PinInputBlock = () => {
  // 入力フォーカス移動のロジックを簡易的に実装
  const handleInput = (e: any) => {
    const target = e.target;
    const val = target.value;
    if (val && target.nextElementSibling) {
      target.nextElementSibling.focus();
    }
  };

  const handleKeyDown = (e: any) => {
    const target = e.target;
    if (e.key === 'Backspace' && !target.value && target.previousElementSibling) {
      target.previousElementSibling.focus();
    }
  };

  return (
    <div class={containerStyles}>
      <p class={titleStyles}>6桁の番号を入力</p>
      <div class={pinContainerStyles}>
        {[...Array(6)].map((_, i) => (
          <input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            class={pinInputStyles}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
          />
        ))}
      </div>
      <button 
        type="button"
        style="margin-top: 0.5rem; background: #f6ad49; color: white; border: none; padding: 0.8rem 2rem; border-radius: 2rem; font-weight: 900; cursor: pointer; font-size: 1.1rem;"
      >
        受信する
      </button>
    </div>
  );
};
