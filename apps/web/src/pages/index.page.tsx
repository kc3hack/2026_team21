import { Hono } from "hono";
import { css, Style } from "hono/css";
import { useEffect, useState } from "hono/jsx";
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
  background: #fcf8e3;
  display: flex;
  flex-direction: column;
  align-items: center;

  & .logo-area {
    position: relative;
    top: 0;
  }
`;

const stageTextClass = css`
  margin: 1rem 0 0;
  color: #5e7359;
  font-size: 1.08rem;
  font-weight: 900;
  text-align: center;
  line-height: 1.55;
`;

const errorTextClass = css`
  margin: 1rem 0 0;
  color: #d85f39;
  font-size: 0.95rem;
  font-weight: 800;
  text-align: center;
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
  width: min(90vw, 26rem);
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
    padding: 0.55rem 1.4rem;
    cursor: pointer;
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("from") !== "complete") {
      return;
    }

    setIsEnteringFromRight(true);
    const timer = setTimeout(() => {
      setIsEnteringFromRight(false);
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
  }, [dataChannelStatus, flowStage]);

  useEffect(() => {
    if (flowStage !== "transferring" || !lastSentFile) {
      return;
    }

    setFlowStage("handover");
    const timer = setTimeout(() => {
      setFlowStage("completed");
    }, 2200);

    return () => clearTimeout(timer);
  }, [flowStage, lastSentFile]);

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

  const handleCompleteOk = () => {
    window.location.href = "/?from=complete";
  };

  const sendProgressPercent = lastSentFile ? 100 : parseProgressPercent(sendProgress);
  const showSenderGhost = !isNavigatingToReceive && flowStage !== "handover" && flowStage !== "completed";
  const showTruck = flowStage === "transferring" || flowStage === "handover";
  const ghostIsSleeping = flowStage === "qr";
  const ghostIsMoving = flowStage === "transferring" || isNavigatingToReceive;
  const showGhostNotes = flowStage === "idle" && !isNavigatingToReceive;
  const stageText =
    flowStage === "transferring"
      ? "ファイル転送中..."
      : flowStage === "handover" || flowStage === "completed"
        ? "転送完了の演出中..."
        : flowStage === "qr"
          ? "相手にQRコードまたは6桁番号を共有してください"
          : "";

  return (
    <div class={responsiveWrapper}>
      <Style />

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
        {flowStage === "idle" && (
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

      <div style="flex: 1; width: 100%;"></div>

      {showSenderGhost && (
        <SlidingGhost
          isMoving={ghostIsMoving}
          isSleeping={ghostIsSleeping}
          showNotes={showGhostNotes}
          enteringFromRight={isEnteringFromRight}
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
        title="転送が完了しました。"
        message="ファイルの送信が正常に完了しました。"
        showInviteText={receiverJoinMethod === "qr"}
        onOk={handleCompleteOk}
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
