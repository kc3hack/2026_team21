import { Hono } from "hono";
import { css, Style } from "hono/css";
import { useEffect, useRef, useState } from "hono/jsx";
import { SlidingGhost } from "@/components/animations/SlidingGhost";
import { TransferCompletePopup } from "@/components/animations/TransferCompletePopup";
import { TransferHandoverScene } from "@/components/animations/TransferHandoverScene";
import { TransferTruckProgress } from "@/components/animations/TransferTruckProgress";
import { FileSelectArea } from "@/components/button/FileSelectArea";
import { ReceiveButton } from "@/components/button/ReceiveButton";
import { LogoIcon } from "@/components/Logo";
import { useFileSenderConnection } from "@/hooks/useFileSenderConnection";
import { useQRCode } from "@/hooks/useQRCode";
import { Page } from "@/pages/router";

type SenderFlowStage = "idle" | "qr" | "transferring" | "handover" | "completed";

const parseProgressPercent = (progressText: string): number => {
  const match = progressText.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 0;
  }

  const sent = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(sent) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (sent / total) * 100));
};

export const TopPageRoute = () => {
  const app = new Hono();
  app.get("/", (c) => c.render(<Page id="/" />));
  return app;
};

const responsiveWrapper = css`
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  min-height: 100dvh;
  background: #fcf8e3;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 1rem calc(1.2rem + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  & .logo-area {
    position: relative;
    top: 0;
  }

  @media (max-width: 900px) {
    padding-right: 0.8rem;
    padding-left: 0.8rem;
  }

  @media (max-width: 640px) {
    padding: 0.3rem 0.8rem calc(2.6rem + env(safe-area-inset-bottom, 0px));
  }
`;

const topSectionClass = css`
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 120;

  @media (max-width: 900px) {
    flex: 0 0 auto;
    margin-top: 0.35rem;
  }

  @media (max-width: 640px) {
    flex: 0 0 auto;
    margin-top: 0.25rem;
  }
`;

const centerSectionClass = css`
  z-index: 100;
  text-align: center;
  width: 100%;
  max-width: 36rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0.8rem;
  margin: 1rem 0;
  box-sizing: border-box;

  @media (max-width: 900px) {
    max-width: 30rem;
    margin: 0.7rem 0;
  }

  @media (max-width: 640px) {
    max-width: 24rem;
    padding: 0 0.4rem;
    margin: 0.35rem 0;
  }
`;

const spacerClass = css`
  flex: 1;
  width: 100%;

  @media (max-width: 640px) {
    min-height: 1.8rem;
  }
`;

const stageTextClass = css`
  margin: 0.9rem 0 0;
  color: #5e7359;
  font-size: clamp(0.96rem, 2.3vw, 1.06rem);
  font-weight: 900;
  text-align: center;
  line-height: 1.55;

  @media (max-width: 640px) {
    margin-top: 0.7rem;
    font-size: 0.94rem;
    line-height: 1.45;
  }
`;

const errorTextClass = css`
  margin: 0.9rem 0 0;
  color: #d85f39;
  font-size: clamp(0.9rem, 2.2vw, 0.95rem);
  font-weight: 800;
  text-align: center;

  @media (max-width: 640px) {
    margin-top: 0.7rem;
    font-size: 0.86rem;
  }
`;

const qrModalClass = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background: white;
  padding: 1.8rem 1.6rem;
  border: 6px solid #333;
  border-radius: 24px;
  width: min(92vw, 27rem);
  text-align: center;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);

  .qr-title {
    margin: 0;
    color: #f6ad49;
    font-size: 1.3rem;
    font-weight: 900;
  }

  .qr-help {
    margin: 0.9rem 0 0.7rem;
    color: #5e7359;
    font-size: 0.94rem;
    font-weight: 700;
    line-height: 1.5;
  }

  .shortcode {
    margin: 0.85rem auto 0;
    width: fit-content;
    min-width: 9rem;
    padding: 0.45rem 1.1rem;
    border-radius: 9999px;
    background: #fff7e5;
    border: 3px solid #f6ad49;
    font-size: 1.55rem;
    font-weight: 900;
    letter-spacing: 0.14em;
    color: #5e7359;
  }

  .close-btn {
    margin-top: 1rem;
    border: none;
    border-radius: 9999px;
    background: #758e6f;
    color: #fff;
    font-size: 0.95rem;
    font-weight: 900;
    min-height: 3rem;
    padding: 0.55rem 1.45rem;
    cursor: pointer;
  }

  .close-btn:focus-visible {
    outline: 3px solid rgba(117, 142, 111, 0.3);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    width: min(92vw, 20rem);
    padding: 1.2rem 1rem;
    border-width: 5px;
    border-radius: 18px;

    .qr-title {
      font-size: 1.08rem;
    }

    .qr-help {
      font-size: 0.84rem;
      margin: 0.65rem 0 0.55rem;
      line-height: 1.45;
    }

    .shortcode {
      font-size: 1.28rem;
      min-width: 7.4rem;
      padding: 0.35rem 0.9rem;
      margin-top: 0.65rem;
    }

    .close-btn {
      min-height: 3.1rem;
      width: 100%;
      margin-top: 0.9rem;
    }
  }
`;

export const TopPage = () => {
  const {
    isOpen,
    url,
    dataChannelStatus,
    sendProgress,
    lastSentFile,
    errorMessage,
    fileInputRef,
    shortcode,
    receiverJoinMethod,
    closeModal,
    handleCreateRoom,
  } = useFileSenderConnection();
  const { ref: qrCodeRef } = useQRCode(url);

  const [flowStage, setFlowStage] = useState<SenderFlowStage>("idle");
  const [isNavigatingToReceive, setIsNavigatingToReceive] = useState(false);
  const [isEnteringFromRight, setIsEnteringFromRight] = useState(false);
  const [isEnteringFromLeft, setIsEnteringFromLeft] = useState(false);

  const handoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (!from) {
      return;
    }

    if (from === "complete") {
      setIsEnteringFromRight(true);
    } else if (from === "receive-back") {
      setIsEnteringFromLeft(true);
    } else {
      return;
    }

    const timer = setTimeout(() => {
      setIsEnteringFromRight(false);
      setIsEnteringFromLeft(false);
    }, 1300);

    params.delete("from");
    const nextSearch = params.toString();
    const nextUrl = nextSearch ? `${window.location.pathname}?${nextSearch}` : window.location.pathname;
    window.history.replaceState({}, "", nextUrl);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (flowStage === "qr" && dataChannelStatus === "open") {
      closeModal();
      setFlowStage("transferring");
    }
  }, [dataChannelStatus, flowStage, closeModal]);

  useEffect(() => {
    // Don't interfere with handover→completed transition
    if (flowStage === "handover") {
      return;
    }

    // Clear any existing timer when flow stage changes
    if (handoverTimerRef.current) {
      clearTimeout(handoverTimerRef.current);
      handoverTimerRef.current = null;
    }

    if (!lastSentFile || flowStage !== "transferring") {
      return;
    }

    setFlowStage("completed");
    handoverTimerRef.current = null;

    return () => {
      if (handoverTimerRef.current) {
        clearTimeout(handoverTimerRef.current);
        handoverTimerRef.current = null;
      }
    };
  }, [lastSentFile, flowStage]);

  const handleClickSelect = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = () => {
    if (!fileInputRef.current?.files?.[0]) {
      return;
    }

    void (async () => {
      setFlowStage("qr");
      const created = await handleCreateRoom();
      if (!created) {
        setFlowStage("idle");
      }
    })();
  };

  const handleReceiveClick = () => {
    setIsNavigatingToReceive(true);
    setTimeout(() => {
      window.location.href = "/r";
    }, 1400);
  };

  const handleCloseQrModal = () => {
    closeModal();
    setFlowStage("idle");
  };

  const handleSendSameFileAgain = () => {
    if (!fileInputRef.current?.files?.[0]) {
      window.location.href = "/";
      return;
    }

    setFlowStage("qr");
    void (async () => {
      const created = await handleCreateRoom();
      if (!created) {
        setFlowStage("idle");
      }
    })();
  };

  const handleSendDifferentFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFlowStage("idle");
  };

  const handleBackToTop = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    window.location.href = "/";
  };

  const sendProgressPercent = lastSentFile ? 100 : parseProgressPercent(sendProgress);
  const showSenderGhost = flowStage !== "handover" && flowStage !== "completed";
  const showTruck = flowStage === "transferring" || flowStage === "handover";
  const ghostIsSleeping = flowStage === "qr";
  const ghostIsMoving = flowStage === "transferring" || isNavigatingToReceive;
  const showGhostNotes = flowStage === "idle" && !isNavigatingToReceive;
  const useWakeEyesOnMove = flowStage === "transferring";
  const stageText =
    flowStage === "transferring"
      ? "ファイル転送中..."
      : flowStage === "qr"
        ? "相手にQRコードまたは6桁番号を共有してください"
        : "";

  return (
    <div class={responsiveWrapper}>
      <Style />

      <div class={topSectionClass}>
        <LogoIcon />
      </div>

      <div class={centerSectionClass}>
        {flowStage === "idle" && !isNavigatingToReceive && (
          <>
            <FileSelectArea onSelect={handleClickSelect} />
            <ReceiveButton onClick={handleReceiveClick} />
          </>
        )}

        {stageText && <p class={stageTextClass}>{stageText}</p>}
        {errorMessage && <p class={errorTextClass}>{errorMessage}</p>}

        <input
          ref={fileInputRef}
          type="file"
          id="hidden-file-input"
          name="file"
          style="display: none;"
          onChange={onFileSelected}
        />
      </div>

      <div class={spacerClass} />

      {showSenderGhost && (
        <SlidingGhost
          isMoving={ghostIsMoving}
          isSleeping={ghostIsSleeping}
          showNotes={showGhostNotes}
          enteringFromRight={isEnteringFromRight}
          enteringFromLeft={isEnteringFromLeft}
          wakeEyesOnMove={useWakeEyesOnMove}
          slowMove={flowStage === "transferring"}
          mobilePlacement={flowStage === "idle" && !isNavigatingToReceive ? "button" : "bottom"}
        />
      )}

      {showTruck && (
        <TransferTruckProgress
          progressPercent={flowStage === "handover" ? 100 : sendProgressPercent}
          active={flowStage === "transferring"}
          exiting={flowStage === "handover"}
          showProgressBar={flowStage === "transferring"}
        />
      )}

      <TransferHandoverScene active={flowStage === "handover" || flowStage === "completed"} />

      <TransferCompletePopup
        open={flowStage === "completed"}
        title="送信完了しました"
        message="ファイルの送信が正常に完了しました。"
        showInviteText={receiverJoinMethod === "qr"}
        actions={[
          {
            label: "同じファイルをもう一度送る",
            onClick: handleSendSameFileAgain,
            variant: "primary",
          },
          {
            label: "別のファイルを送信する",
            onClick: handleSendDifferentFile,
            variant: "secondary",
          },
          {
            label: "トップに戻る",
            onClick: handleBackToTop,
            variant: "tertiary",
          },
        ]}
      />

      {isOpen && flowStage === "qr" && (
        <div class={qrModalClass}>
          <h2 class="qr-title">QRコード</h2>
          <p class="qr-help">
            読み取りに失敗した場合は、
            <br />
            下の6桁番号を相手に入力してもらってください
          </p>
          <div ref={qrCodeRef} style="display: flex; justify-content: center;" />
          <div class="shortcode">{shortcode}</div>
          <button type="button" class="close-btn" onClick={handleCloseQrModal}>
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
