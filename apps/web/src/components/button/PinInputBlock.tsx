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

const PIN_INPUT_KEYS = ["pin-1", "pin-2", "pin-3", "pin-4", "pin-5", "pin-6"] as const;

type PinInputBlockProps = {
  onSubmit: (shortCode: string) => Promise<void> | void;
};

export const PinInputBlock = (props: PinInputBlockProps) => {
  // 入力フォーカス移動のロジックを簡易的に実装
  const handleInput = (e: InputEvent) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    target.value = target.value.replace(/\D/g, "").slice(0, 1);

    const val = target.value;
    const nextInput = target.nextElementSibling;
    if (val && nextInput instanceof HTMLInputElement) {
      nextInput.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const previousInput = target.previousElementSibling;
    if (e.key === "Backspace" && !target.value && previousInput instanceof HTMLInputElement) {
      previousInput.focus();
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const shortCode = PIN_INPUT_KEYS.map((key) => {
      const input = form.elements.namedItem(key);
      return input instanceof HTMLInputElement ? input.value : "";
    }).join("");

    await props.onSubmit(shortCode);
  };

  return (
    <form action="" class={containerStyles} onSubmit={handleSubmit}>
      <p class={titleStyles}>6桁の番号を入力</p>
      <div class={pinContainerStyles}>
        {PIN_INPUT_KEYS.map((key) => (
          <input
            key={key}
            name={key}
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
        type="submit"
        style="margin-top: 0.5rem; background: #f6ad49; color: white; border: none; padding: 0.8rem 2rem; border-radius: 2rem; font-weight: 900; cursor: pointer; font-size: 1.1rem;"
      >
        受信する
      </button>
    </form>
  );
};
