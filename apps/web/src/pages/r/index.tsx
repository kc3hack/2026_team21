import { Hono } from "hono";
import { css, keyframes, Style } from "hono/css";
import { useEffect, useState } from "hono/jsx";
import { ArrivingOrangeGhost } from "@/components/animations/ArrivingOrangeGhost";
import { TransferCompletePopup } from "@/components/animations/TransferCompletePopup";
import { PinInputBlock } from "@/components/button/PinInputBlock";
import { SendBackButton } from "@/components/button/SendBackButton";
import { LogoIcon } from "@/components/Logo";
import { type ReceiverEntryMethod, useWebRTCConnection } from "@/hooks/useWebRTCConnection";
import { Page } from "@/pages/router";

const responsiveWrapper = css`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  background: #fcf8e3;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1.2rem;

  & .logo-area {
    position: relative;
    top: 0;
  }

  @media (max-width: 600px) {
    min-height: 100dvh;
    padding: 0 0.8rem calc(7.1rem + env(safe-area-inset-bottom, 0px));
    box-sizing: border-box;
  }
`;

const topSectionClass = css`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 120;
`;

const centerSectionClass = css`
  z-index: 100;
  text-align: center;
  width: 100%;
  max-width: 34rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  margin: 1rem 0;
  box-sizing: border-box;

  @media (max-width: 600px) {
    max-width: 23rem;
    padding: 0 0.4rem;
    margin: 0.55rem 0;
  }
`;

const spacerClass = css`
  flex: 1;
  width: 100%;

  @media (max-width: 600px) {
    min-height: 6rem;
  }
`;

const receiveHeadingClass = css`
  color: #f6ad49;
  font-weight: 900;
  font-size: 2rem;
  margin: 0 0 2rem;

  @media (max-width: 600px) {
    font-size: 1.45rem;
    margin-bottom: 1.1rem;
  }
`;

const waitCardClass = css`
  width: min(90vw, 27rem);
  background: #fff;
  border: 5px solid #f6ad49;
  border-radius: 24px;
  padding: 1.6rem 1.25rem;
  box-sizing: border-box;
  text-align: center;

  .wait-title {
    margin: 0;
    color: #f6ad49;
    font-size: 1.4rem;
    font-weight: 900;
  }

  .wait-body {
    margin: 0.85rem 0 0;
    color: #5e7359;
    font-size: 1rem;
    font-weight: 800;
    line-height: 1.6;
  }

  .progress-shell {
    margin: 1.1rem auto 0;
    width: 100%;
    height: 0.95rem;
    border-radius: 9999px;
    border: 3px solid #5e7359;
    background: rgba(255, 255, 255, 0.86);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f6ad49 0%, #ffbf66 100%);
    transition: width 0.25s linear;
  }

  .progress-text {
    margin: 0.55rem 0 0;
    color: #5e7359;
    font-size: 0.95rem;
    font-weight: 900;
  }

  .file-text {
    margin: 0.55rem 0 0;
    color: #5e7359;
    font-size: 0.92rem;
    font-weight: 700;
    word-break: break-word;
  }

  .error-text {
    margin: 0.7rem 0 0;
    color: #d85f39;
    font-size: 0.92rem;
    font-weight: 800;
  }

  @media (max-width: 600px) {
    width: min(92vw, 20.5rem);
    border-radius: 18px;
    border-width: 4px;
    padding: 1.05rem 0.9rem;

    .wait-title {
      font-size: 1.1rem;
    }

    .wait-body {
      margin-top: 0.6rem;
      font-size: 0.88rem;
      line-height: 1.45;
    }

    .progress-shell {
      margin-top: 0.8rem;
      height: 0.8rem;
    }

    .progress-text {
      margin-top: 0.45rem;
      font-size: 0.82rem;
    }

    .file-text,
    .error-text {
      font-size: 0.8rem;
    }
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
`;

const waitDotsClass = css`
  margin: 0.9rem auto 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;

  .dot {
    width: 0.58rem;
    height: 0.58rem;
    border-radius: 9999px;
    background: #758e6f;
    animation: ${pulse} 0.9s ease-in-out infinite;
  }

  .dot-2 {
    animation-delay: 0.15s;
  }

  .dot-3 {
    animation-delay: 0.3s;
  }
`;

const parseProgressPercent = (progressText: string): number => {
  const match = progressText.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 0;
  }

  const received = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(received) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (received / total) * 100));
};

const resolveEntryMethodFromQuery = (): ReceiverEntryMethod => {
  const source = new URLSearchParams(window.location.search).get("source");
  return source === "code" ? "code" : "qr";
};

export const RoomPageRoute = () => {
  const app = new Hono();

  app.get("/", (c) => {
    return c.render(<Page id="/r" />);
  });

  app.get("/:roomId", (c) => {
    const roomId = c.req.param("roomId");
    return c.render(<Page id="/room/:roomId" roomId={roomId} />);
  });

  return app;
};

type Props = { roomId: string };

export const RoomPage = ({ roomId }: Props) => {
  const entryMethod = resolveEntryMethodFromQuery();
  const { receiveProgress, lastReceivedFile, errorMessage } = useWebRTCConnection(roomId, entryMethod);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  useEffect(() => {
    if (lastReceivedFile) {
      setIsCompleteOpen(true);
    }
  }, [lastReceivedFile]);

  const receivePercent = lastReceivedFile ? 100 : parseProgressPercent(receiveProgress);

  const handleCompleteOk = () => {
    window.location.href = "/";
  };

  return (
    <div class={responsiveWrapper}>
      <Style />

      <div class={topSectionClass}>
        <LogoIcon />
      </div>

      <div class={centerSectionClass}>
        <div class={waitCardClass}>
          <h1 class="wait-title">ファイルを受け取っています</h1>
          <p class="wait-body">送信側からの転送完了まで、このままお待ちください。</p>

          <div class={waitDotsClass}>
            <span class="dot dot-1" />
            <span class="dot dot-2" />
            <span class="dot dot-3" />
          </div>

          <div class="progress-shell">
            <div class="progress-fill" style={`width: ${receivePercent}%;`} />
          </div>
          <p class="progress-text">{Math.round(receivePercent)}%</p>

          {lastReceivedFile && <p class="file-text">{lastReceivedFile}</p>}
          {errorMessage && <p class="error-text">{errorMessage}</p>}
        </div>
      </div>

      <div class={spacerClass} />

      <ArrivingOrangeGhost isMoving={false} />

      <TransferCompletePopup
        open={isCompleteOpen}
        title="転送が完了しました。"
        message="ファイルの受信が完了しました。"
        onOk={handleCompleteOk}
      />
    </div>
  );
};

export const ReceivePage = () => {
  const [isMoving, setIsMoving] = useState(false);
  const [isResolvingPin, setIsResolvingPin] = useState(false);
  const [pinError, setPinError] = useState("");

  const handleSendClick = () => {
    setIsMoving(true);
    setTimeout(() => {
      window.location.href = "/?from=receive-back";
    }, 1500);
  };

  const handleSubmitPin = async (pin: string) => {
    if (isResolvingPin) {
      return;
    }

    setIsResolvingPin(true);
    setPinError("");

    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(pin)}`);
      if (!response.ok) {
        throw new Error(`Room lookup failed: ${response.status}`);
      }

      const payload = (await response.json()) as { id?: unknown };
      if (typeof payload.id !== "string" || payload.id.length === 0) {
        throw new Error("Invalid room id response");
      }

      window.location.href = `/r/${encodeURIComponent(payload.id)}?source=code`;
    } catch (error) {
      console.error(error);
      setPinError("6桁の番号が見つかりませんでした。番号を再確認してください。");
    } finally {
      setIsResolvingPin(false);
    }
  };

  return (
    <div class={responsiveWrapper}>
      <Style />

      <div class={topSectionClass}>
        <LogoIcon />
      </div>

      <div class={centerSectionClass}>
        <h1 class={receiveHeadingClass}>ファイルを受け取る</h1>

        <PinInputBlock
          onSubmit={handleSubmitPin}
          isSubmitting={isResolvingPin}
          errorMessage={pinError}
          helperMessage={"送信側で発行された6桁の番号を\n入力してください"}
        />

        <SendBackButton onClick={handleSendClick} />
      </div>

      <div class={spacerClass} />

      <ArrivingOrangeGhost isMoving={isMoving} moveOutDirection="right" />
    </div>
  );
};
