// apps/web/src/components/button/FileSelectArea.tsx
import { css } from "hono/css";
import { GreenButton } from "./index";

const containerStyles = css`
  background-color: #f6ad49;
  border-radius: 32px;
  padding: clamp(1.1rem, 3vw, 1.9rem) clamp(1rem, 3.8vw, 1.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  max-width: 26.5rem;
  margin: 0 auto;

  @media (max-width: 768px) {
    width: min(95vw, 23rem);
    max-width: 23rem;
    border-radius: 26px;
  }

  @media (max-width: 640px) {
    width: min(95vw, 22rem);
    max-width: 22rem;
    padding: 1.2rem 0.95rem;
    gap: 0.7rem;
    border-radius: 22px;
  }
`;

const dropZoneStyles = css`
  width: 100%;
  background-color: #fff;
  border: 4px dotted #758e6f;
  border-radius: 20px;
  padding: clamp(1.2rem, 4vw, 2.2rem) 1rem;
  min-height: 9.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #000;
  font-weight: 900;
  font-size: clamp(1rem, 2.8vw, 1.15rem);
  line-height: 1.4;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-sizing: border-box;
  text-align: center;

  &:focus-visible {
    outline: 3px solid rgba(117, 142, 111, 0.32);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    min-height: 8.6rem;
    border-radius: 18px;
    padding: 1.35rem 0.7rem;
    font-size: 1rem;
  }

  &:hover {
    background-color: #fef4e8;
  }
  &:active {
    transform: scale(0.98);
  }
`;

const iconStyles = css`
  font-size: clamp(2rem, 6vw, 2.4rem);
  margin-bottom: 0.1rem;
`;

const separatorStyles = css`
  color: #fff;
  font-weight: 900;
  font-size: clamp(0.98rem, 2.6vw, 1.08rem);
`;

const buttonShellStyles = css`
  width: 100%;
  display: flex;
  justify-content: center;
`;

type Props = {
  onSelect: () => void;
};

export const FileSelectArea = ({ onSelect }: Props) => {
  return (
    <div class={containerStyles}>
      <button type="button" class={dropZoneStyles} onClick={onSelect}>
        <span class={iconStyles}>📁</span>
        <span>ここにファイルをドロップ</span>
      </button>

      <span class={separatorStyles}>または</span>

      <div class={buttonShellStyles}>
        <GreenButton text="ファイルを選択" onClick={onSelect} fullWidth />
      </div>
    </div>
  );
};
