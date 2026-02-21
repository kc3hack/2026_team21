import { useEffect, useState } from "hono/jsx";
import { fetchTurnIceServer, getSignalUrl } from "@/lib/realtime/client-utils";
import { FileReceiver } from "@/lib/realtime/file-transfer";
import { PeerConnectionManager } from "@/lib/realtime/peer-connection";
import { SignalingClient } from "@/lib/realtime/signaling-client";

export type ReceiverEntryMethod = "qr" | "code";

const downloadReceivedFile = (name: string, data: Blob): void => {
  const url = URL.createObjectURL(data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 30_000);
};

export const useWebRTCConnection = (roomId: string, entryMethod: ReceiverEntryMethod = "qr") => {
  const [wsStatus, setWsStatus] = useState("connecting");
  const [peerStatus, setPeerStatus] = useState("idle");
  const [peerRole, setPeerRole] = useState("none");
  const [dataChannelStatus, setDataChannelStatus] = useState("closed");
  const [receiveProgress, setReceiveProgress] = useState("0 / 0 bytes");
  const [lastReceivedFile, setLastReceivedFile] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isDisposed = false;
    let hasSharedEntryMeta = false;
    const signaling = new SignalingClient(getSignalUrl(roomId));
    const peerManager = new PeerConnectionManager(signaling, { forceTurn: true });
    const fileReceiver = new FileReceiver();

    const setStateIfActive = (update: () => void): void => {
      if (isDisposed) {
        return;
      }
      update();
    };

    const resetPeerState = (): void => {
      setStateIfActive(() => {
        setPeerStatus("idle");
        setPeerRole("none");
        setDataChannelStatus("closed");
        setReceiveProgress("0 / 0 bytes");
      });
    };

    setWsStatus("connecting");
    resetPeerState();
    setLastReceivedFile("");
    setErrorMessage("");

    fileReceiver.onProgress(({ received, total }) => {
      setStateIfActive(() => {
        setReceiveProgress(`${received} / ${total} bytes`);
      });
    });

    fileReceiver.onFile(({ name, data }) => {
      setStateIfActive(() => {
        setLastReceivedFile(`${name} (${data.size} bytes)`);
        setReceiveProgress(`${data.size} / ${data.size} bytes`);
      });
      downloadReceivedFile(name, data);
    });

    fileReceiver.onError((error) => {
      setStateIfActive(() => setErrorMessage(`受信エラー: ${error.message}`));
    });

    signaling.on("connected", () => {
      setStateIfActive(() => setWsStatus("connected"));
    });

    signaling.on("disconnected", () => {
      setStateIfActive(() => {
        setWsStatus("disconnected");
        resetPeerState();
      });
    });

    signaling.on("peer-joined", () => {
      setStateIfActive(() => {
        setPeerRole("offerer");
        setPeerStatus("connecting");
      });
      void peerManager.createOffer().catch((error: unknown) => {
        setStateIfActive(() => {
          setPeerStatus("idle");
          setErrorMessage(`Offerの作成に失敗しました: ${String(error)}`);
        });
      });
    });

    signaling.on("offer", () => {
      setStateIfActive(() => {
        setPeerRole("answerer");
        setPeerStatus("connecting");
      });
    });

    signaling.on("peer-left", () => {
      setStateIfActive(() => {
        resetPeerState();
        setPeerStatus("peer-left");
      });
    });

    signaling.on("room-full", () => {
      setStateIfActive(() => setErrorMessage("このルームは満員です"));
    });

    signaling.on("error", (error) => {
      setStateIfActive(() => setErrorMessage(error.message));
    });

    peerManager.on("datachannel-open", (channel) => {
      setStateIfActive(() => {
        setPeerStatus("connected");
        setDataChannelStatus("open");
      });

      if (!hasSharedEntryMeta && channel.readyState === "open") {
        hasSharedEntryMeta = true;
        try {
          channel.send(
            JSON.stringify({
              type: "receiver-join-meta",
              joinMethod: entryMethod,
            }),
          );
        } catch {
          // 送信失敗時もファイル受信は継続
        }
      }
    });

    peerManager.on("datachannel-close", () => {
      setStateIfActive(() => {
        setDataChannelStatus("closed");
      });
    });

    peerManager.on("disconnected", () => {
      setStateIfActive(() => {
        resetPeerState();
        setPeerStatus("disconnected");
      });
    });

    peerManager.on("datachannel-message", (data) => {
      void fileReceiver.handleMessage(data).catch((error: unknown) => {
        setStateIfActive(() => setErrorMessage(`受信メッセージ処理エラー: ${String(error)}`));
      });
    });

    void (async () => {
      try {
        const turnIceServer = await fetchTurnIceServer();
        if (isDisposed) {
          return;
        }
        peerManager.setTurnIceServer(turnIceServer);
      } catch (error) {
        setStateIfActive(() => {
          setErrorMessage(`TURN資格情報の取得に失敗しました: ${String(error)}`);
          setWsStatus("disconnected");
        });
        return;
      }

      if (isDisposed) {
        return;
      }

      signaling.connect();
    })();

    return () => {
      isDisposed = true;
      signaling.disconnect();
      peerManager.cleanup();
    };
  }, [roomId, entryMethod]);

  return {
    wsStatus,
    peerStatus,
    peerRole,
    dataChannelStatus,
    receiveProgress,
    lastReceivedFile,
    errorMessage,
  };
};
