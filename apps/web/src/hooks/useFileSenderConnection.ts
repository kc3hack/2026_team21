import { useEffect, useRef, useState } from "hono/jsx";
import { fetchTurnIceServer, getSignalUrl } from "@/lib/realtime/client-utils";
import { sendFile } from "@/lib/realtime/file-transfer";
import { PeerConnectionManager } from "@/lib/realtime/peer-connection";
import { SignalingClient } from "@/lib/realtime/signaling-client";

/**
 * 送信側のルーム作成と WebRTC 接続状態を管理する。
 */
export const useFileSenderConnection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [url, setUrl] = useState("");
  const [wsStatus, setWsStatus] = useState("disconnected");
  const [peerStatus, setPeerStatus] = useState("idle");
  const [peerRole, setPeerRole] = useState("none");
  const [dataChannelStatus, setDataChannelStatus] = useState("closed");
  const [sendProgress, setSendProgress] = useState("0 / 0 bytes");
  const [lastSentFile, setLastSentFile] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    let isDisposed = false;
    let sending = false;
    let hasSent = false;
    const signaling = new SignalingClient(getSignalUrl(roomId));
    const peerManager = new PeerConnectionManager(signaling, { forceTurn: true });

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
        setSendProgress("0 / 0 bytes");
      });
    };

    setWsStatus("connecting");
    resetPeerState();
    setErrorMessage("");
    setLastSentFile("");

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

      if (sending || hasSent) {
        return;
      }

      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setStateIfActive(() => setErrorMessage("送信するファイルが見つかりません"));
        return;
      }

      sending = true;
      setStateIfActive(() => {
        setErrorMessage("");
        setSendProgress(`0 / ${file.size} bytes`);
      });

      void sendFile(channel, file, ({ sent, total }) => {
        setStateIfActive(() => setSendProgress(`${sent} / ${total} bytes`));
      })
        .then(() => {
          hasSent = true;
          setStateIfActive(() => {
            setLastSentFile(`${file.name} (${file.size} bytes)`);
            setSendProgress(`${file.size} / ${file.size} bytes`);
          });
        })
        .catch((error: unknown) => {
          setStateIfActive(() => setErrorMessage(`ファイル送信に失敗しました: ${String(error)}`));
        })
        .finally(() => {
          sending = false;
        });
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
  }, [roomId]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleCreateRoom = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage("送信するファイルを選択してください");
      return;
    }

    void (async () => {
      // 部屋番号を生成する
      const response = await fetch("/api/rooms", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }
      const payload = (await response.json()) as { id?: unknown };
      if (typeof payload.id !== "string" || payload.id.length === 0) {
        throw new Error("Invalid room id response");
      }

      // URL を作る
      const uri = `${location.origin}/r/${encodeURIComponent(payload.id)}`;

      setRoomId(payload.id);
      setErrorMessage("");

      // モーダルを開く
      setUrl(uri);
      setIsOpen(true);
    })().catch((error) => {
      console.error(error);
      setErrorMessage(String(error));
    });
  };

  return {
    isOpen,
    roomId,
    url,
    wsStatus,
    peerStatus,
    peerRole,
    dataChannelStatus,
    sendProgress,
    lastSentFile,
    errorMessage,
    fileInputRef,
    toggleOpen,
    handleCreateRoom,
  };
};
