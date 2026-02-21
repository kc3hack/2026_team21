import { FileReceiver, sendFile } from "@/lib/realtime/file-transfer";
import { PeerConnectionManager } from "@/lib/realtime/peer-connection";
import { SignalingClient } from "@/lib/realtime/signaling-client";

type DebugElements = {
  page: HTMLElement;
  roomInput: HTMLInputElement;
  connectBtn: HTMLButtonElement;
  disconnectBtn: HTMLButtonElement;
  sendFileBtn: HTMLButtonElement;
  sendFileInput: HTMLInputElement;
  clearLogBtn: HTMLButtonElement;
  wsStatus: HTMLElement;
  peerStatus: HTMLElement;
  peerRole: HTMLElement;
  dataChannelStatus: HTMLElement;
  sendProgress: HTMLElement;
  receiveProgress: HTMLElement;
  receivedFiles: HTMLUListElement;
  logOutput: HTMLElement;
};

const getElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing required debug element: #${id}`);
  }
  return element as T;
};

const getElements = (): DebugElements => ({
  page: getElement<HTMLElement>("realtime-debug-page"),
  roomInput: getElement<HTMLInputElement>("room-id"),
  connectBtn: getElement<HTMLButtonElement>("connect-btn"),
  disconnectBtn: getElement<HTMLButtonElement>("disconnect-btn"),
  sendFileBtn: getElement<HTMLButtonElement>("send-file-btn"),
  sendFileInput: getElement<HTMLInputElement>("send-file"),
  clearLogBtn: getElement<HTMLButtonElement>("clear-log-btn"),
  wsStatus: getElement<HTMLElement>("ws-status"),
  peerStatus: getElement<HTMLElement>("peer-status"),
  peerRole: getElement<HTMLElement>("peer-role"),
  dataChannelStatus: getElement<HTMLElement>("dc-status"),
  sendProgress: getElement<HTMLElement>("send-progress"),
  receiveProgress: getElement<HTMLElement>("receive-progress"),
  receivedFiles: getElement<HTMLUListElement>("received-files"),
  logOutput: getElement<HTMLElement>("log-output"),
});

const appendLog = (output: HTMLElement, label: string, payload?: unknown): void => {
  const now = new Date().toLocaleTimeString();
  const formattedPayload =
    payload === undefined ? "" : ` ${typeof payload === "string" ? payload : JSON.stringify(payload)}`;
  output.textContent += `[${now}] ${label}${formattedPayload}\n`;
  output.scrollTop = output.scrollHeight;
};

const getSignalUrl = (roomId: string): string => {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${location.host}/ws/${encodeURIComponent(roomId)}`;
};

const addReceivedFile = (list: HTMLUListElement, name: string, file: Blob): void => {
  const url = URL.createObjectURL(file);
  const item = document.createElement("li");
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.textContent = `${name} (${file.size} bytes)`;
  item.appendChild(anchor);
  list.insertBefore(item, list.firstChild);
};

const init = (): void => {
  const elements = getElements();
  const { page } = elements;
  const turnUsername = page.dataset.turnUsername ?? "";
  const turnCredential = page.dataset.turnCredential ?? "";
  const rtcEnv = {
    CF_TURN_USERNAME: turnUsername,
    CF_TURN_TOKEN: turnCredential,
  } as unknown as CloudflareBindings;

  let signaling: SignalingClient | null = null;
  let peerManager: PeerConnectionManager | null = null;
  let fileReceiver: FileReceiver | null = null;
  let sending = false;

  const setWsStatus = (next: string): void => {
    elements.wsStatus.textContent = next;
  };

  const setPeerStatus = (next: string): void => {
    elements.peerStatus.textContent = next;
  };

  const setPeerRole = (next: string): void => {
    elements.peerRole.textContent = next;
  };

  const setDataChannelStatus = (next: string): void => {
    elements.dataChannelStatus.textContent = next;
  };

  const resetProgress = (): void => {
    elements.sendProgress.textContent = "0 / 0 bytes";
    elements.receiveProgress.textContent = "0 / 0 bytes";
  };

  const resetPeerState = (): void => {
    sending = false;
    fileReceiver = null;
    peerManager?.cleanup();
    peerManager = null;
    setPeerStatus("idle");
    setPeerRole("none");
    setDataChannelStatus("closed");
    resetProgress();
  };

  const disconnect = (): void => {
    signaling?.disconnect();
    signaling = null;
    setWsStatus("disconnected");
    resetPeerState();
  };

  const setupFileReceiver = (): void => {
    const receiver = new FileReceiver();
    receiver.onProgress(({ received, total }) => {
      elements.receiveProgress.textContent = `${received} / ${total} bytes`;
    });
    receiver.onFile(({ name, data }) => {
      addReceivedFile(elements.receivedFiles, name, data);
      appendLog(elements.logOutput, "file-complete", { name, size: data.size });
    });
    receiver.onError((error) => {
      appendLog(elements.logOutput, "file-receive-error", error.message);
    });
    fileReceiver = receiver;
  };

  const connect = (): void => {
    const roomId = elements.roomInput.value.trim();
    if (!roomId) {
      appendLog(elements.logOutput, "connect-failed", "roomId is required");
      return;
    }

    disconnect();

    const signalUrl = getSignalUrl(roomId);
    const client = new SignalingClient(signalUrl);
    const manager = new PeerConnectionManager(client, rtcEnv);

    client.on("connected", () => {
      setWsStatus("connected");
      appendLog(elements.logOutput, "connected", signalUrl);
    });

    client.on("disconnected", () => {
      setWsStatus("disconnected");
      appendLog(elements.logOutput, "disconnected");
      resetPeerState();
    });

    client.on("peer-joined", () => {
      setPeerRole("offerer");
      setPeerStatus("connecting");
      appendLog(elements.logOutput, "peer-joined");
      void manager.createOffer().catch((error: unknown) => {
        appendLog(elements.logOutput, "offer-error", String(error));
        resetPeerState();
      });
    });

    client.on("offer", () => {
      setPeerRole("answerer");
      setPeerStatus("connecting");
      appendLog(elements.logOutput, "offer-received");
    });

    client.on("answer", () => {
      appendLog(elements.logOutput, "answer-received");
    });

    client.on("candidate", () => {
      appendLog(elements.logOutput, "candidate-received");
    });

    client.on("peer-left", () => {
      appendLog(elements.logOutput, "peer-left");
      resetPeerState();
      setPeerStatus("peer-left");
    });

    client.on("room-full", () => {
      appendLog(elements.logOutput, "room-full");
    });

    client.on("error", (error) => {
      appendLog(elements.logOutput, "signal-error", error.message);
    });

    manager.on("datachannel-open", (channel) => {
      setPeerStatus("connected");
      setDataChannelStatus("open");
      appendLog(elements.logOutput, "datachannel-open", channel.label);
      setupFileReceiver();
      channel.addEventListener("error", () => {
        appendLog(elements.logOutput, "datachannel-error");
      });
    });

    manager.on("datachannel-close", () => {
      setDataChannelStatus("closed");
      appendLog(elements.logOutput, "datachannel-close");
    });

    manager.on("datachannel-message", (data) => {
      if (!fileReceiver) {
        appendLog(elements.logOutput, "binary-ignored", "file receiver is not ready");
        return;
      }
      void fileReceiver.handleMessage(data).catch((error: unknown) => {
        appendLog(elements.logOutput, "data-message-error", String(error));
      });
    });

    manager.on("disconnected", () => {
      appendLog(elements.logOutput, "peer-disconnected");
      resetPeerState();
    });

    signaling = client;
    peerManager = manager;
    setWsStatus("connecting");
    appendLog(elements.logOutput, "connecting", signalUrl);
    client.connect();
  };

  const sendSelectedFile = async (): Promise<void> => {
    if (sending) {
      appendLog(elements.logOutput, "send-skipped", "already sending");
      return;
    }

    const channel = peerManager?.getDataChannel();
    if (!channel || channel.readyState !== "open") {
      appendLog(elements.logOutput, "send-skipped", "datachannel is not open");
      return;
    }

    const file = elements.sendFileInput.files?.[0];
    if (!file) {
      appendLog(elements.logOutput, "send-skipped", "select a file");
      return;
    }

    sending = true;
    try {
      await sendFile(channel, file, ({ sent, total }) => {
        elements.sendProgress.textContent = `${sent} / ${total} bytes`;
      });
      appendLog(elements.logOutput, "file-sent", { name: file.name, size: file.size });
    } catch (error) {
      appendLog(elements.logOutput, "send-file-error", String(error));
    } finally {
      sending = false;
    }
  };

  elements.connectBtn.addEventListener("click", connect);
  elements.disconnectBtn.addEventListener("click", disconnect);
  elements.sendFileBtn.addEventListener("click", () => {
    void sendSelectedFile();
  });
  elements.clearLogBtn.addEventListener("click", () => {
    elements.logOutput.textContent = "";
  });

  const roomFromQuery = new URLSearchParams(location.search).get("room");
  if (roomFromQuery) {
    elements.roomInput.value = roomFromQuery;
  }

  if (!turnUsername || !turnCredential) {
    appendLog(elements.logOutput, "turn-config-missing", "CF_TURN_USERNAME / CF_TURN_TOKEN");
  }

  setWsStatus("disconnected");
  resetPeerState();
  appendLog(elements.logOutput, "client-ready");
};

const boot = (): void => {
  try {
    init();
    (window as Window & { __realtimeDebugLoaded?: boolean }).__realtimeDebugLoaded = true;
  } catch (error) {
    console.error("Failed to initialize realtime debug client:", error);
    const output = document.getElementById("log-output");
    if (output) {
      appendLog(output, "client-init-error", String(error));
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
