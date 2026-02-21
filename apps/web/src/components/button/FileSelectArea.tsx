// apps/web/src/components/button/FileSelectArea.tsx
import { css } from "hono/css";
import { GreenButton } from "./index";

const containerStyles = css`
  background-color: #f6ad49;
  border-radius: 32px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;

  /* モバイル対応：さらにコンパクトに */
  @media (max-width: 600px) {
    width: min(94vw, 21rem);
    max-width: 21rem;
    padding: 1.45rem 1.1rem;
    gap: 0.65rem;
    border-width: 4px;
  }
`;

const dropZoneStyles = css`
  width: 100%;
  background-color: #fff;
  border: 4px dotted #758e6f; 
  border-radius: 20px;
  padding: 2.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #000;
  font-weight: 900;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 1.7rem 0.7rem;
    font-size: 1.08rem;
  }

  &:hover {
    background-color: #fef4e8;
  }
  &:active {
    transform: scale(0.98);
  }
`;

type Props = {
  onSelect: () => void;
};

export const FileSelectArea = ({ onSelect }: Props) => {
  return (
    <div class={containerStyles}>
      <button type="button" class={dropZoneStyles} onClick={onSelect}>
        <span style="font-size: 2.5rem; margin-bottom: 0.25rem;">📁</span>
        <span>ここにファイルをドロップ</span>
      </button>

      <span style="color: #fff; font-weight: bold; font-size: 1.1rem;">または</span>

      <div style="width: 100%; display: flex; justify-content: center; transform: scale(0.8);" class="file-select-btn">
        <GreenButton text="ファイルを選択" onClick={onSelect} />
      </div>
    </div>
  );
};
