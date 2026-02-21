import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignalingClient } from "@/lib/realtime/signaling-client";
import type { ServerMessage } from "@/lib/realtime/types";

/* ── MockWebSocket ── */
class MockWebSocket {
  static readonly OPEN = 1;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.OPEN;
  private eventListeners = new Map<string, Set<(ev: unknown) => void>>();

  url: string;
  sentMessages: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (ev: unknown) => void) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, new Set());
    }
    this.eventListeners.get(type)?.add(listener);
  }

  removeEventListener(type: string, listener: (ev: unknown) => void) {
    this.eventListeners.get(type)?.delete(listener);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.simulateEvent("close", {});
  }

  /* テストヘルパー */
  simulateEvent(type: string, detail: unknown) {
    for (const listener of this.eventListeners.get(type) ?? []) {
      listener(detail);
    }
  }

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.simulateEvent("open", {});
  }

  simulateMessage(msg: ServerMessage) {
    this.simulateEvent("message", { data: JSON.stringify(msg) });
  }
}

/* ── テスト ── */
describe("SignalingClient", () => {
  const TEST_URL = "wss://example.com/ws";

  beforeEach(() => {
    MockWebSocket.instances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function getLatestWs(): MockWebSocket {
    return MockWebSocket.instances.at(-1)!;
  }

  /* ── 接続 / 切断 ── */
  it("connect() で WebSocket を生成し、open 時に connected を発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onConnected = vi.fn();
    client.on("connected", onConnected);

    client.connect();
    const ws = getLatestWs();
    expect(ws.url).toBe(TEST_URL);

    ws.simulateOpen();
    expect(onConnected).toHaveBeenCalledOnce();
  });

  it("disconnect() で WebSocket を閉じ、disconnected を発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onDisconnected = vi.fn();
    client.on("disconnected", onDisconnected);

    client.connect();
    client.disconnect();
    expect(onDisconnected).toHaveBeenCalledOnce();
  });

  /* ── メッセージ送信 ── */
  it("send() で JSON シリアライズしたメッセージを送信する", () => {
    const client = new SignalingClient(TEST_URL);
    client.connect();
    const ws = getLatestWs();
    ws.simulateOpen();

    client.send({ type: "offer", sdp: "test-sdp" });
    expect(ws.sentMessages).toHaveLength(1);
    expect(JSON.parse(ws.sentMessages[0])).toEqual({
      type: "offer",
      sdp: "test-sdp",
    });
  });

  it("WebSocket が OPEN でなければ send() は何もしない", () => {
    const client = new SignalingClient(TEST_URL);
    client.connect();
    const ws = getLatestWs();
    ws.readyState = MockWebSocket.CLOSED;

    client.send({ type: "offer", sdp: "ignored" });
    expect(ws.sentMessages).toHaveLength(0);
  });

  /* ── サーバーメッセージの受信 ── */
  it("offer メッセージを受信すると offer イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onOffer = vi.fn();
    client.on("offer", onOffer);

    client.connect();
    const ws = getLatestWs();
    ws.simulateMessage({ type: "offer", sdp: "remote-sdp" });

    expect(onOffer).toHaveBeenCalledWith("remote-sdp");
  });

  it("answer メッセージを受信すると answer イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onAnswer = vi.fn();
    client.on("answer", onAnswer);

    client.connect();
    getLatestWs().simulateMessage({ type: "answer", sdp: "answer-sdp" });

    expect(onAnswer).toHaveBeenCalledWith("answer-sdp");
  });

  it("candidate メッセージを受信すると candidate イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onCandidate = vi.fn();
    client.on("candidate", onCandidate);

    const candidateInit: RTCIceCandidateInit = {
      candidate: "candidate:123",
      sdpMLineIndex: 0,
    };

    client.connect();
    getLatestWs().simulateMessage({ type: "candidate", candidate: candidateInit });

    expect(onCandidate).toHaveBeenCalledWith(candidateInit);
  });

  it("peer-joined メッセージを受信すると peer-joined イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onPeerJoined = vi.fn();
    client.on("peer-joined", onPeerJoined);

    client.connect();
    getLatestWs().simulateMessage({ type: "peer-joined" });

    expect(onPeerJoined).toHaveBeenCalledOnce();
  });

  it("peer-left メッセージを受信すると peer-left イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onPeerLeft = vi.fn();
    client.on("peer-left", onPeerLeft);

    client.connect();
    getLatestWs().simulateMessage({ type: "peer-left" });

    expect(onPeerLeft).toHaveBeenCalledOnce();
  });

  it("room-full メッセージを受信すると room-full イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onRoomFull = vi.fn();
    client.on("room-full", onRoomFull);

    client.connect();
    getLatestWs().simulateMessage({ type: "room-full" });

    expect(onRoomFull).toHaveBeenCalledOnce();
  });

  /* ── JSON パースエラー ── */
  it("不正な JSON を受信すると error イベントが発火する", () => {
    const client = new SignalingClient(TEST_URL);
    const onError = vi.fn();
    client.on("error", onError);

    client.connect();
    const ws = getLatestWs();
    ws.simulateEvent("message", { data: "not-json!!!" });

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0][0].message).toContain("Failed to parse signaling message");
  });

  it("不正な JSON を受信してもイベントハンドラーはクラッシュしない", () => {
    const client = new SignalingClient(TEST_URL);
    client.connect();
    const ws = getLatestWs();

    // error リスナー未登録でも例外にならない
    expect(() => {
      ws.simulateEvent("message", { data: "{invalid" });
    }).not.toThrow();
  });

  /* ── イベントリスナー管理 ── */
  it("on() で複数リスナーを登録でき、すべて呼ばれる", () => {
    const client = new SignalingClient(TEST_URL);
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    client.on("connected", cb1);
    client.on("connected", cb2);

    client.connect();
    getLatestWs().simulateOpen();

    expect(cb1).toHaveBeenCalledOnce();
    expect(cb2).toHaveBeenCalledOnce();
  });

  it("off() でリスナーを解除できる", () => {
    const client = new SignalingClient(TEST_URL);
    const cb = vi.fn();
    client.on("connected", cb);
    client.off("connected", cb);

    client.connect();
    getLatestWs().simulateOpen();

    expect(cb).not.toHaveBeenCalled();
  });
});
