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

// 全体のレイアウト管理
const responsiveWrapper = css`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background: #fcf8e3;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* グローバルな絶対配置指定をコンポーネント側の管理で上書き */
  & .logo-area {
    position: relative;
    top: 0;
  }
`;

export const TopPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoving, setIsMoving] = useState(false); // お化けの左スライドアウト状態
  const [url, setUrl] = useState("");
  const { ref: qrCodeRef } = useQRCode(url);

  // QRコードモーダルの切り替え
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setIsMoving(false); // 閉じるときにアニメーションをリセット
  };

  // 送信処理（ファイル選択時）：左へスライドアウト
  const handleCreateRoom = () => {
    void (async () => {
      setIsMoving(true);

      const response = await fetch("/api/rooms", { method: "POST" });
      if (!response.ok) throw new Error(`Failed to create room: ${response.status}`);
      
      const payload = (await response.json()) as { id?: string };
      if (!payload.id) throw new Error("Invalid room id response");

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

  // 受信ボタンクリック時：左へスライドアウトしてから遷移
  const handleReceiveClick = () => {
    setIsMoving(true);
    setTimeout(() => {
      window.location.href = "/r";
    }, 1500);
  };

  const handleClickSelect = () => {
    const input = document.getElementById("hidden-file-input");
    input?.click();
  };

  return (
    <div class={responsiveWrapper}>
      <Style />
      
      {/* 1. 上部エリア：ロゴ */}
      <div style="flex: 1; width: 100%; display: flex; justify-content: center; align-items: flex-start; z-index: 120;">
        <LogoIcon />
      </div>

      {/* 2. 中央エリア：メインボタン群 */}
      <div style="z-index: 100; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; padding: 0 20px; margin: 1rem 0;">
        <FileSelectArea onSelect={handleClickSelect} />
        
        <ReceiveButton onClick={handleReceiveClick} />
        
        <input 
          type="file" 
          id="hidden-file-input" 
          style="display: none;" 
          onChange={handleCreateRoom} 
        />
      </div>

      {/* 3. 下部エリア：スペーサー（中央配置を維持） */}
      <div style="flex: 1; width: 100%;"></div>

      {/* 緑のお化けアニメーション（isMoving で左へスライドアウト） */}
      <SlidingGhost isMoving={isMoving} />

      {/* QRコード表示モーダル */}
      {isOpen && (
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: white; padding: 2rem; border: 6px solid #333; border-radius: 24px;">
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
