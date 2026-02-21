import { css } from "hono/css";
import { useRef, useState } from "hono/jsx";

const containerStyles = css`
  background-color: #fff;
  border: 6px solid #f6ad49;
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

const submitButtonStyles = css`
  margin-top: 0.5rem;
  background: #f6ad49;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 2rem;
  font-weight: 900;
  cursor: pointer;
  font-size: 1.1rem;
  transition: transform 0.1s ease, opacity 0.2s ease;

  &:active {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }
`;

const errorStyles = css`
  margin: 0;
  color: #d85f39;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
`;

const PIN_INPUT_KEYS = ["pin-1", "pin-2", "pin-3", "pin-4", "pin-5", "pin-6"] as const;

type Props = {
  onSubmit: (pin: string) => Promise<void> | void;
  isSubmitting?: boolean;
  errorMessage?: string;
};

export const PinInputBlock = ({ onSubmit, isSubmitting = false, errorMessage = "" }: Props) => {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: PIN_INPUT_KEYS.length }, () => ""));
  const inputRefs = useRef<Array<HTMLInputElement | null> | null>([]);

  const pin = digits.join("");
  const canSubmit = pin.length === PIN_INPUT_KEYS.length && !isSubmitting;

  const focusInput = (index: number): void => {
    inputRefs.current?.[index]?.focus();
  };

  const updateDigit = (index: number, value: string): void => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  };

  const handleInput = (index: number, e: InputEvent) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const raw = target.value.replace(/\D/g, "");
    if (raw.length === 0) {
      updateDigit(index, "");
      return;
    }

    const value = raw.at(-1) ?? "";
    updateDigit(index, value);

    if (index < PIN_INPUT_KEYS.length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (e.key === "Backspace" && !target.value && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (e.key === "Enter" && canSubmit) {
      void Promise.resolve(onSubmit(pin));
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData?.getData("text") ?? "";
    const onlyDigits = pasted.replace(/\D/g, "").slice(0, PIN_INPUT_KEYS.length);
    if (!onlyDigits) {
      return;
    }

    const next = Array.from({ length: PIN_INPUT_KEYS.length }, (_, index) => onlyDigits[index] ?? "");
    setDigits(next);
    const focusIndex = Math.max(0, Math.min(onlyDigits.length - 1, PIN_INPUT_KEYS.length - 1));
    focusInput(focusIndex);
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }
    void Promise.resolve(onSubmit(pin));
  };

  return (
    <div class={containerStyles}>
      <p class={titleStyles}>6桁の番号を入力</p>
      <div class={pinContainerStyles}>
        {PIN_INPUT_KEYS.map((key, index) => (
          <input
            key={key}
            type="text"
            inputMode="numeric"
            maxLength={1}
            class={pinInputStyles}
            value={digits[index]}
            onInput={(e) => handleInput(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            ref={(element: HTMLInputElement | null) => {
              if (!inputRefs.current) {
                return;
              }
              inputRefs.current[index] = element;
            }}
          />
        ))}
      </div>

      <button type="button" class={submitButtonStyles} onClick={handleSubmit} disabled={!canSubmit}>
        {isSubmitting ? "確認中..." : "受信する"}
      </button>

      {errorMessage && <p class={errorStyles}>{errorMessage}</p>}
    </div>
  );
};
