import { css } from "hono/css";
import { useEffect, useRef, useState } from "hono/jsx";

const containerStyles = css`
  background-color: #fff;
  border: 6px solid #f6ad49;
  border-radius: 32px;
  padding: 2.2rem 1.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  width: 100%;
  max-width: 26.25rem;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: min(95vw, 23rem);
    max-width: 23rem;
    border-radius: 26px;
  }

  @media (max-width: 640px) {
    width: min(95vw, 22.4rem);
    max-width: 22.4rem;
    padding: 1.65rem 1.15rem;
    border-width: 4px;
    border-radius: 22px;
  }
`;

const titleStyles = css`
  color: #f6ad49;
  font-weight: 900;
  font-size: clamp(1.16rem, 3.2vw, 1.4rem);
  margin: 0;
`;

const pinContainerStyles = css`
  display: flex;
  width: 100%;
  gap: 0.45rem;
  justify-content: center;

  @media (max-width: 640px) {
    gap: 0.38rem;
  }
`;

const pinInputStyles = css`
  width: clamp(2.1rem, 7vw, 3rem);
  height: clamp(2.9rem, 9vw, 4rem);
  border: 3px solid #ccc;
  border-radius: 12px;
  text-align: center;
  font-size: clamp(1.4rem, 4.7vw, 2rem);
  font-weight: 900;
  color: #333;
  background: #f9f9f9;
  transition: border-color 0.2s, box-shadow 0.2s;
  appearance: textfield;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    border-color: #f6ad49;
    box-shadow: 0 0 0 4px rgba(246, 173, 73, 0.2);
    background: #fff;
  }

  @media (max-width: 640px) {
    width: 2.28rem;
    height: 3.18rem;
    font-size: 1.45rem;
  }
`;

const errorStyles = css`
  margin: 0;
  color: #d85f39;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
`;

const helperTextStyles = css`
  margin: -0.2rem 0 0;
  color: #5e7359;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.65;
  text-align: center;
  white-space: pre-line;

  @media (max-width: 600px) {
    font-size: 0.98rem;
  }
`;

const PIN_INPUT_KEYS = ["pin-1", "pin-2", "pin-3", "pin-4", "pin-5", "pin-6"] as const;

type Props = {
  onSubmit: (pin: string) => Promise<void> | void;
  isSubmitting?: boolean;
  errorMessage?: string;
  helperMessage?: string;
};

export const PinInputBlock = ({ onSubmit, isSubmitting = false, errorMessage = "", helperMessage = "" }: Props) => {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: PIN_INPUT_KEYS.length }, () => ""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastAutoSubmittedPinRef = useRef<string | null>(null);

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

  const submitIfPossible = (): void => {
    if (!canSubmit) {
      return;
    }
    void Promise.resolve(onSubmit(pin));
  };

  const handleInput = (index: number, e: InputEvent): void => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const raw = target.value.replace(/\D/g, "");
    if (!raw) {
      updateDigit(index, "");
      return;
    }

    const value = raw.slice(-1);
    updateDigit(index, value);

    if (index < PIN_INPUT_KEYS.length - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent): void => {
    const target = e.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (e.key === "Backspace" && !target.value && index > 0) {
      focusInput(index - 1);
      return;
    }

    if (e.key === "Enter") {
      submitIfPossible();
    }
  };

  const handlePaste = (e: ClipboardEvent): void => {
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

  const handleSubmit = (e: Event): void => {
    e.preventDefault();
    submitIfPossible();
  };

  useEffect(() => {
    if (pin.length !== PIN_INPUT_KEYS.length) {
      lastAutoSubmittedPinRef.current = null;
      return;
    }

    if (isSubmitting || lastAutoSubmittedPinRef.current === pin) {
      return;
    }

    lastAutoSubmittedPinRef.current = pin;
    void Promise.resolve(onSubmit(pin));
  }, [pin, isSubmitting, onSubmit]);

  return (
    <form action="" class={containerStyles} onSubmit={handleSubmit}>
      <p class={titleStyles}>6桁の番号を入力</p>

      <div class={pinContainerStyles}>
        {PIN_INPUT_KEYS.map((key, index) => (
          <input
            key={key}
            name={key}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
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

      {helperMessage && <p class={helperTextStyles}>{helperMessage}</p>}
      {errorMessage && <p class={errorStyles}>{errorMessage}</p>}
    </form>
  );
};
