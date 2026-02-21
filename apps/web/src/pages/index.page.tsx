import { Hono } from "hono";
import { css, Style } from "hono/css";
import { useState } from "hono/jsx";
import { SlidingGhost } from "@/components/animations/SlidingGhost";
import { FileSelectArea } from "@/components/button/FileSelectArea";
import { ReceiveButton } from "@/components/button/ReceiveButton";
import { LogoIcon } from "@/components/Logo";
import { useFileSenderConnection } from "@/hooks/useFileSenderConnection";
import { useQRCode } from "@/hooks/useQRCode";
import { Page } from "@/pages/router";

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

/**
 * 送信するボタンを押すとルームを作成し、接続を開始する。
 * 受信側が入室して DataChannel が open になったら、選択済みファイルを自動送信する。
 *
 * UIは animation-test の見た目を踏襲しつつ、ロジックは useFileSenderConnection に統合。
 */
export const TopPage = () => {
  const {
    isOpen,
    url,
    toggleOpen,
    handleCreateRoom,
    fileInputRef,
    // 必要ならデバッグ表示用に取り出して使える
    // roomId, wsStatus, peerStatus, peerRole, dataChannelStatus, sendProgress, lastSentFile, errorMessage,
  } = useFileSenderConnection();

  const [isMoving, setIsMoving] = useState(false); // お化けの左スライドアウト状態
  const { ref: qrCodeRef } = useQRCode(url);

  // ファイル選択ダイアログを開く
  const handleClickSelect = () => {
    fileInputRef.current?.click();
  };

  // ファイル選択時（= onChange）: アニメーション開始 → ルーム作成/送信開始
  const onFileSelected = () => {
    void (async () => {
      setIsMoving(true);
      await handleCreateRoom();
      // ここでモーダル表示タイミングを“アニメに合わせたい”なら遅延させる
      // ※ useFileSenderConnection 側がすでに isOpen を開く設計なら、この遅延は不要
      // setTimeout(() => toggleOpen(), 1500);
    })().catch((e) => {
      console.error(e);
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

  // QRモーダルを閉じる（閉じたらアニメも戻す）
  const closeModal = () => {
    toggleOpen();
    setIsMoving(false);
  };

  return (
    <div class={responsiveWrapper}>
      <Style />

      {/* 1. 上部エリア：ロゴ */}
      <div
        style="
          flex: 1;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          z-index: 120;
        "
      >
        <LogoIcon />
      </div>

      {/* 2. 中央エリア：メインボタン群 */}
      <div
        style="
          z-index: 100;
          text-align: center;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px;
          margin: 1rem 0;
        "
      >
        <FileSelectArea onSelect={handleClickSelect} />
        <ReceiveButton onClick={handleReceiveClick} />

        <input
          ref={fileInputRef}
          type="file"
          id="hidden-file-input"
          name="file"
          style="display: none;"
          onChange={onFileSelected}
        />
      </div>

      {/* 3. 下部エリア：スペーサー（中央配置を維持） */}
      <div style="flex: 1; width: 100%;"></div>

      {/* 緑のお化けアニメーション（isMoving で左へスライドアウト） */}
      <SlidingGhost isMoving={isMoving} />

      {/* QRコード表示モーダル（hookの isOpen/url を利用） */}
      {isOpen && (
        <div
          style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: white;
            padding: 2rem;
            border: 6px solid #333;
            border-radius: 24px;
          "
        >
          <h2 style="font-weight: 900; margin-bottom: 1rem;">QRコード</h2>
          <div ref={qrCodeRef} />
          <button
            type="button"
            onClick={closeModal}
            style="
              margin-top: 1.5rem;
              background: #758e6f;
              color: white;
              border: none;
              padding: 0.5rem 2rem;
              border-radius: 2rem;
              cursor: pointer;
              font-weight: bold;
            "
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
