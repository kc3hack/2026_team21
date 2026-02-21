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
    max-width: 280px;   /* 横幅を絞る */
    padding: 1.2rem 1rem;
    gap: 0.5rem;
    border-width: 4px;  /* 枠線を少し細く */
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
    padding: 1.5rem 0.5rem;
    font-size: 1rem;    /* 文字を小さく */
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
      <div class={dropZoneStyles} onClick={onSelect}>
        <span style="font-size: 2.5rem; margin-bottom: 0.25rem;">📁</span>
        <span>ここにファイルをドロップ</span>
      </div>
      
      <span style="color: #fff; font-weight: bold; font-size: 1.1rem;">または</span>
      
      <div onClick={onSelect} style="cursor: pointer; width: 100%; display: flex; justify-content: center; transform: scale(0.8);">
        <GreenButton text="ファイルを選択" />
      </div>
    </div>
  );
};
