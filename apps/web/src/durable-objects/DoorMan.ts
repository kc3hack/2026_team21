import { DurableObject } from "cloudflare:workers";
import type { WorkerEnv } from "@/app";
import type { ClientMessage, ServerMessage } from "@/lib/realtime/types";

type PendingSignals = {
  offer: string | null;
  answer: string | null;
  candidates: RTCIceCandidateInit[];
};

const MAX_PEERS = 2;
const PENDING_SIGNALS_KEY = "pending-signals";
const MAX_CANDIDATES = 128;

export class DoorMan extends DurableObject<WorkerEnv["Env"]> {
  async fetch(request: Request): Promise<Response> {
    if (!isWebSocketUpgrade(request)) {
      return new Response("Expected Upgrade: websocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const peers = this.ctx.getWebSockets();

    if (peers.length >= MAX_PEERS) {
      server.accept();
      this.send(server, { type: "room-full" });
      server.close(1008, "Room is full");
      return new Response(null, { status: 101, webSocket: client });
    }

    this.ctx.acceptWebSocket(server);

    if (peers.length === 1) {
      this.send(peers[0], { type: "peer-joined" });
      await this.flushPendingSignals(server);
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    const parsed = parseClientMessage(message);
    if (!parsed) {
      return;
    }

    const peers = this.ctx.getWebSockets().filter((socket) => socket !== ws);

    if (peers.length === 0) {
      await this.storePendingSignal(parsed);
      return;
    }

    this.send(peers[0], parsed);
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const peers = this.ctx.getWebSockets().filter((socket) => socket !== ws);
    for (const peer of peers) {
      this.send(peer, { type: "peer-left" });
    }
    await this.resetPendingSignals();
  }

  webSocketError(ws: WebSocket, error: unknown): void {
    console.error("WebSocket error in DoorMan:", error);
    ws.close(1011, "WebSocket error");
  }

  private async flushPendingSignals(target: WebSocket): Promise<void> {
    const pending = await this.getPendingSignals();

    if (pending.offer) {
      this.send(target, { type: "offer", sdp: pending.offer });
    }
    if (pending.answer) {
      this.send(target, { type: "answer", sdp: pending.answer });
    }
    for (const candidate of pending.candidates) {
      this.send(target, { type: "candidate", candidate });
    }

    await this.resetPendingSignals();
  }

  private async storePendingSignal(message: ClientMessage): Promise<void> {
    const pending = await this.getPendingSignals();

    switch (message.type) {
      case "offer":
        pending.offer = message.sdp;
        pending.answer = null;
        pending.candidates = [];
        break;
      case "answer":
        pending.answer = message.sdp;
        break;
      case "candidate":
        pending.candidates.push(message.candidate);
        if (pending.candidates.length > MAX_CANDIDATES) {
          pending.candidates = pending.candidates.slice(-MAX_CANDIDATES);
        }
        break;
    }

    await this.ctx.storage.put(PENDING_SIGNALS_KEY, pending);
  }

  private async getPendingSignals(): Promise<PendingSignals> {
    const pending = await this.ctx.storage.get<PendingSignals>(PENDING_SIGNALS_KEY);
    return pending ?? { offer: null, answer: null, candidates: [] };
  }

  private async resetPendingSignals(): Promise<void> {
    await this.ctx.storage.put(PENDING_SIGNALS_KEY, {
      offer: null,
      answer: null,
      candidates: [],
    } satisfies PendingSignals);
  }

  private send(socket: WebSocket, message: ServerMessage): void {
    if (socket.readyState !== WebSocket.OPEN) {
      return;
    }
    socket.send(JSON.stringify(message));
  }
}

function isWebSocketUpgrade(request: Request): boolean {
  return request.headers.get("Upgrade")?.toLowerCase() === "websocket";
}

function parseClientMessage(message: string | ArrayBuffer): ClientMessage | null {
  if (typeof message !== "string") {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(message);
  } catch {
    return null;
  }

  return isClientMessage(parsed) ? parsed : null;
}

function isClientMessage(value: unknown): value is ClientMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<ClientMessage> & { type?: unknown };
  if (message.type === "offer" || message.type === "answer") {
    return typeof message.sdp === "string";
  }

  if (message.type === "candidate") {
    return typeof message.candidate === "object" && message.candidate !== null;
  }

  return false;
}
