import type { ClientMessage, ServerMessage } from "./types";

export type SignalingEventMap = {
  offer: (sdp: string) => void;
  answer: (sdp: string) => void;
  candidate: (candidate: RTCIceCandidateInit) => void;
  "peer-joined": () => void;
  "peer-left": () => void;
  "room-full": () => void;
  connected: () => void;
  disconnected: () => void;
  error: (error: Error) => void;
};

/* シグナリングクライアント */
export class SignalingClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<keyof SignalingEventMap, Set<(...args: never[]) => void>>();

  constructor(private readonly url: string) {}

  connect(): void {
    if (this.ws !== null) {
      this.disconnect();
    }
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      this.emit("connected");
    });

    this.ws.addEventListener("close", () => {
      this.emit("disconnected");
    });

    this.ws.addEventListener("message", (event) => {
      let message: ServerMessage;
      try {
        message = JSON.parse(event.data as string);
      } catch {
        this.emit("error", new Error(`Failed to parse signaling message: ${event.data}`));
        return;
      }
      switch (message.type) {
        case "offer":
          this.emit("offer", message.sdp);
          break;
        case "answer":
          this.emit("answer", message.sdp);
          break;
        case "candidate":
          this.emit("candidate", message.candidate);
          break;
        case "peer-joined":
          this.emit("peer-joined");
          break;
        case "peer-left":
          this.emit("peer-left");
          break;
        case "room-full":
          this.emit("room-full");
          break;
      }
    });
  }

  send(message: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  on<K extends keyof SignalingEventMap>(event: K, callback: SignalingEventMap[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as (...args: never[]) => void);
  }

  off<K extends keyof SignalingEventMap>(event: K, callback: SignalingEventMap[K]): void {
    this.listeners.get(event)?.delete(callback as (...args: never[]) => void);
  }

  private emit<K extends keyof SignalingEventMap>(event: K, ...args: Parameters<SignalingEventMap[K]>): void {
    for (const callback of this.listeners.get(event) ?? []) {
      // 型安全は emit のシグネチャで保証される
      const result = callback(...args);
      // emit() は Promise を扱わないため、async リスナーの reject を error イベントへ流す
      if (isPromise(result)) {
        result.catch((err: unknown) => {
          if (event === "error") {
            // error リスナー自体のエラーで無限ループしないようにする
            return;
          }
          const error = err instanceof Error ? err : new Error(String(err));
          this.emit("error", error);
        });
      }
    }
  }
}

function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as { then: unknown }).then === "function"
  );
}
