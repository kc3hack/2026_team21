// apps/web/src/pages/r/index.tsx
import { Hono } from "hono";
import { css, Style } from "hono/css";
import { useState } from "hono/jsx";
import { ArrivingOrangeGhost } from "@/components/animations/ArrivingOrangeGhost";
import { PinInputBlock } from "@/components/button/PinInputBlock";
import { SendBackButton } from "@/components/button/SendBackButton";
import { LogoIcon } from "@/components/Logo";
import { useWebRTCConnection } from "@/hooks/useWebRTCConnection";
import { Page } from "@/pages/router";

export const RoomPageRoute = () => {
  const app = new Hono();

  // /r 直下にアクセスされたら ReceivePage を表示
  app.get("/", (c) => {
    return c.render(<Page id={"/r"} />);
  });

  // 各ルームの個別ページ ( /r/:roomId )
  app.get("/:roomId", (c) => {
    const roomId = c.req.param("roomId");
    return c.render(<Page id={"/room/:roomId"} roomId={roomId} />);
  });

  return app;
};

type Props = { roomId: string };

export const RoomPage = (props: Props) => {
  const { wsStatus, peerStatus, peerRole, dataChannelStatus, receiveProgress, lastReceivedFile, errorMessage } =
    useWebRTCConnection(props.roomId);

  return (
    <div>
      <h1>Room Page</h1>
      <p>ここにファイル送信のUIが入る予定</p>
      <p>Room ID: {props.roomId}</p>
      <p>
        WS Status: <strong>{wsStatus}</strong>
      </p>
      <p>
        Peer Status: <strong>{peerStatus}</strong>
      </p>
      <p>
        Role: <strong>{peerRole}</strong>
      </p>
      <p>
        DataChannel Status: <strong>{dataChannelStatus}</strong>
      </p>
      <p>
        Receive Progress: <strong>{receiveProgress}</strong>
      </p>
      {lastReceivedFile && (
        <p>
          Last Downloaded: <strong>{lastReceivedFile}</strong>
        </p>
      )}
      {errorMessage && (
        <p>
          Error: <strong>{errorMessage}</strong>
        </p>
      )}
    </div>
  );
};

// ==========================================
// 追加：受信トップページ ( /r )
// ==========================================
export const ReceivePage = () => {
  const [isMoving, setIsMoving] = useState(false); // オレンジお化けの退場状態

  const handleSendClick = () => {
    setIsMoving(true); // 左へスライドアウト開始
    setTimeout(() => {
      window.location.href = "/"; // アニメーション後にトップへ遷移
    }, 1500);
  };

  const responsiveWrapper = css`
    position: relative; 
    overflow: hidden; 
    min-height: 100vh; 
    background: #fcf8e3;
    display: flex; 
    flex-direction: column; 
    align-items: center;

    & .logo-area { 
      position: relative; 
      top: 0; 
    }
  `;

  return (
    <div class={responsiveWrapper}>
      <Style />

      {/* 1. 上部：ロゴ */}
      <div style="flex: 1; width: 100%; display: flex; justify-content: center; align-items: flex-start; z-index: 120;">
        <LogoIcon />
      </div>

      {/* 2. 中央：UIエリア */}
      <div style="z-index: 100; text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; padding: 0 20px;">
        <h1 style="color: #f6ad49; font-weight: 900; font-size: 2rem; margin-bottom: 2rem;">ファイルを受け取る</h1>

        {/* PIN入力ブロック */}
        <PinInputBlock />

        {/* 送信へ戻るボタン (オレンジ縁) */}
        <SendBackButton onClick={handleSendClick} />

        <p style="color: #5e7359; font-weight: bold; margin-top: 2rem;">
          送信側で発行された6桁の番号を
          <br />
          入力してください
        </p>
      </div>

      {/* 3. 下部：スペーサー */}
      <div style="flex: 1; width: 100%;"></div>

      {/* オレンジのお化け（isMovingプロップスを渡す） */}
      <ArrivingOrangeGhost isMoving={isMoving} />
    </div>
  );
};
