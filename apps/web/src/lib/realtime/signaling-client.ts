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
};

/* シグナリングクライアント */
export class SignalingClient {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  constructor(private readonly url: string) {}

  connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", () => {
      this.emit("connected");
    });

    this.ws.addEventListener("close", () => {
      this.emit("disconnected");
    });

    this.ws.addEventListener("message", (event) => {
      const message: ServerMessage = JSON.parse(event.data as string);
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
    this.listeners.get(event)?.add(callback as (...args: unknown[]) => void);
  }

  off<K extends keyof SignalingEventMap>(event: K, callback: SignalingEventMap[K]): void {
    this.listeners.get(event)?.delete(callback as (...args: unknown[]) => void);
  }

  private emit(event: string, ...args: unknown[]): void {
    for (const callback of this.listeners.get(event) ?? []) {
      callback(...args);
    }
  }
}
