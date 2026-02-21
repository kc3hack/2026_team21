import { Hono } from "hono";
import { useEffect, useState } from "hono/jsx";
import { FileReceiver } from "@/lib/realtime/file-transfer";
import { PeerConnectionManager, type TurnIceServerConfig } from "@/lib/realtime/peer-connection";
import { SignalingClient } from "@/lib/realtime/signaling-client";
import { Page } from "@/pages/router";

export const RoomPageRoute = () => {
  const app = new Hono();

  app.get("/:roomId", (c) => {
    const roomId = c.req.param("roomId");

    return c.render(<Page id={"/room/:roomId"} roomId={roomId} />);
  });

  return app;
};

type Props = {
  roomId: string;
};

type TurnCredentialResponse = {
  iceServers: TurnIceServerConfig;
};

const getSignalUrl = (roomId: string): string => {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/api/ws/${encodeURIComponent(roomId)}`;
};

const isTurnCredentialResponse = (value: unknown): value is TurnCredentialResponse => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const iceServers = (value as { iceServers?: unknown }).iceServers;
  if (typeof iceServers !== "object" || iceServers === null) {
    return false;
  }

  const record = iceServers as {
    urls?: unknown;
    username?: unknown;
    credential?: unknown;
  };

  const urlsValid =
    (typeof record.urls === "string" && record.urls.length > 0) ||
    (Array.isArray(record.urls) && record.urls.every((url) => typeof url === "string"));

  return urlsValid && typeof record.username === "string" && typeof record.credential === "string";
};

const fetchTurnIceServer = async (): Promise<TurnIceServerConfig> => {
  const response = await fetch("/api/turn/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ttl: 86_400 }),
  });

  if (!response.ok) {
    throw new Error(`TURN credentials request failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  if (!isTurnCredentialResponse(payload)) {
    throw new Error("TURN credentials response is invalid");
  }

  return payload.iceServers;
};

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

export const RoomPage = (props: Props) => {
  const [wsStatus, setWsStatus] = useState("connecting");
  const [peerStatus, setPeerStatus] = useState("idle");
  const [peerRole, setPeerRole] = useState("none");
  const [dataChannelStatus, setDataChannelStatus] = useState("closed");
  const [receiveProgress, setReceiveProgress] = useState("0 / 0 bytes");
  const [lastReceivedFile, setLastReceivedFile] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isDisposed = false;
    const signaling = new SignalingClient(getSignalUrl(props.roomId));
    const peerManager = new PeerConnectionManager(signaling);
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

    peerManager.on("datachannel-open", () => {
      setStateIfActive(() => {
        setPeerStatus("connected");
        setDataChannelStatus("open");
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
        });
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
  }, [props.roomId]);

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
