import { Hono } from "hono";
import { css, Style } from "hono/css";
import { useState } from "hono/jsx";
import { useQRCode } from "@/hooks/useQRCode";
import { Page } from "@/pages/router";
import { SlidingGhost } from "@/components/animations/SlidingGhost";
import { FileSelectArea } from "@/components/button/FileSelectArea";
import { LogoIcon } from "@/components/Logo";
import { ReceiveButton } from "@/components/button/ReceiveButton";

export const TopPageRoute = () => {
  const app = new Hono();
  app.get("/", (c) => c.render(<Page id="/" />));
  return app;
};

// 全体のレイアウトを管理するスタイル
const responsiveWrapper = css`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background: #fcf8e3;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* style.css の .logo-area や .logo-img の絶対配置をリセットし、
     LogoIconコンポーネント側での管理を優先させる */
  & .logo-area {
    position: relative;
    top: 0;
  }
`;

export const TopPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [url, setUrl] = useState("");
  const { ref: qrCodeRef } = useQRCode(url);

  // モーダルの開閉
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMoving(false); // 閉じるときにアニメーション状態もリセット
  };

  // 部屋作成（送信開始）処理
  const handleCreateRoom = () => {
    void (async () => {
      // お化けのアニメーションを開始
      setIsMoving(true);

      const response = await fetch("/api/rooms", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }
      
      const payload = (await response.json()) as { id?: string };
      if (!payload.id) {
        throw new Error("Invalid room id response");
      }

      const uri = `/r/${encodeURIComponent(payload.id)}`;

      // アニメーション完了（1.5秒）に合わせてQRコードを表示
      setTimeout(() => {
        setUrl(uri);
        setIsOpen(true);
      }, 1500);
    })().catch((error) => {
      console.error(error);
      setIsMoving(false);
    });
  };

  // 隠しinputを発火させる
  const handleClickSelect = () => {
    const input = document.getElementById("hidden-file-input");
    input?.click();
  };

  return (
    <div class={responsiveWrapper}>
      <Style />
      
      {/* 1. 上部エリア：ロゴ（スマホ時はLogoIcon内で自動的に小さくなる） */}
      <div style="flex: 1; width: 100%; display: flex; justify-content: center; align-items: flex-start; z-index: 120;">
        <LogoIcon />
      </div>

      {/* 2. 中央エリア：ファイル選択と受信ボタン（常に画面中央） */}
      <div style="z-index: 100; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; padding: 0 20px; margin: 1rem 0;">
        <FileSelectArea onSelect={handleClickSelect} />
        
        <ReceiveButton />
        
        <input 
          type="file" 
          id="hidden-file-input" 
          style="display: none;" 
          onChange={handleCreateRoom} 
        />
      </div>

      {/* 3. 下部エリア：上部と同じ比率のスペーサー */}
      <div style="flex: 1; width: 100%;"></div>

      {/* 緑のお化けアニメーション（右端から左へ移動） */}
      <SlidingGhost isMoving={isMoving} />

      {/* 送信後のQRコード表示モーダル */}
      {isOpen && (
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: white; padding: 2rem; border: 6px solid #333; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h2 style="font-weight: 900; margin-bottom: 1rem;">QRコード</h2>
          <div ref={qrCodeRef} />
          <button 
            type="button" 
            onClick={toggleOpen} 
            style="margin-top: 1.5rem; background: #758e6f; color: white; border: none; padding: 0.5rem 2rem; border-radius: 2rem; cursor: pointer; font-weight: bold;"
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
