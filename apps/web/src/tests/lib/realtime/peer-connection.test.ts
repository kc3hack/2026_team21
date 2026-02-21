import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PeerConnectionManager } from "@/lib/realtime/peer-connection";
import type { SignalingClient } from "@/lib/realtime/signaling-client";

/* ── Mock RTCDataChannel ── */
function createMockDataChannel(label = "file-transfer"): RTCDataChannel {
  return {
    label,
    binaryType: "blob" as BinaryType,
    bufferedAmount: 0,
    readyState: "open" as RTCDataChannelState,
    onopen: null as ((ev: Event) => void) | null,
    onclose: null as ((ev: Event) => void) | null,
    onmessage: null as ((ev: MessageEvent) => void) | null,
    onerror: null as ((ev: Event) => void) | null,
    send: vi.fn(),
    close: vi.fn(),
  } as unknown as RTCDataChannel;
}

function createMockEnv(): Cloudflare.Env {
  return {
    CF_TURN_USERNAME: "test-user",
    CF_TURN_TOKEN: "test-token",
  } as unknown as Cloudflare.Env;
}

/* ── Mock RTCPeerConnection (class 形式) ── */
let latestMockPc: InstanceType<typeof MockRTCPeerConnection>;

class MockRTCPeerConnection {
  localDescription: RTCSessionDescription | null = null;
  remoteDescription: RTCSessionDescription | null = null;
  connectionState: RTCPeerConnectionState = "new";
  signalingState: RTCSignalingState = "stable";
  onicecandidate: ((ev: RTCPeerConnectionIceEvent) => void) | null = null;
  ondatachannel: ((ev: RTCDataChannelEvent) => void) | null = null;
  onconnectionstatechange: ((ev: Event) => void) | null = null;
  _mockChannel = createMockDataChannel();

  createDataChannel = vi.fn((_label: string) => this._mockChannel);

  createOffer = vi.fn(async () => ({ type: "offer" as const, sdp: "offer-sdp" }));

  createAnswer = vi.fn(async () => ({ type: "answer" as const, sdp: "answer-sdp" }));

  setLocalDescription = vi.fn(async (desc: RTCSessionDescriptionInit) => {
    this.localDescription = {
      // biome-ignore lint/style/noNonNullAssertion: test mock
      type: desc.type!,
      sdp: desc.sdp ?? "offer-sdp",
    } as RTCSessionDescription;
    if (desc.type === "offer") {
      this.signalingState = "have-local-offer";
    } else if (desc.type === "answer") {
      this.signalingState = "stable";
    }
  });

  setRemoteDescription = vi.fn(async (desc: RTCSessionDescriptionInit) => {
    this.remoteDescription = {
      // biome-ignore lint/style/noNonNullAssertion: test mock
      type: desc.type!,
      sdp: desc.sdp ?? "",
    } as RTCSessionDescription;
    if (desc.type === "offer") {
      this.signalingState = "have-remote-offer";
    } else if (desc.type === "answer") {
      this.signalingState = "stable";
    }
  });

  addIceCandidate = vi.fn(async () => {});

  close = vi.fn();

  constructor(_config?: RTCConfiguration) {
    latestMockPc = this;
  }
}

/* ── Mock SignalingClient ── */
function createMockSignaling(): SignalingClient & {
  _handlers: Map<string, (...args: unknown[]) => void>;
  _trigger: (event: string, ...args: unknown[]) => Promise<void>;
} {
  const handlers = new Map<string, (...args: unknown[]) => void>();
  return {
    on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
      handlers.set(event, callback);
    }),
    off: vi.fn(),
    send: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    _handlers: handlers,
    async _trigger(event: string, ...args: unknown[]) {
      const result = handlers.get(event)?.(...args) as unknown;
      if (result instanceof Promise) await result;
    },
  } as unknown as SignalingClient & {
    _handlers: Map<string, (...args: unknown[]) => void>;
    _trigger: (event: string, ...args: unknown[]) => Promise<void>;
  };
}

/* ── テスト ── */
describe("PeerConnectionManager", () => {
  beforeEach(() => {
    vi.stubGlobal("RTCPeerConnection", MockRTCPeerConnection);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("コンストラクタ", () => {
    it("シグナリングハンドラを登録する", () => {
      const signaling = createMockSignaling();
      new PeerConnectionManager(signaling, createMockEnv());

      expect(signaling.on).toHaveBeenCalledWith("offer", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("answer", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("candidate", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("peer-left", expect.any(Function));
      expect(signaling.on).toHaveBeenCalledWith("disconnected", expect.any(Function));
    });
  });

  describe("createOffer", () => {
    it("PeerConnection を作成し、DataChannel を生成し、offer を送信する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());

      await manager.createOffer();
      const pc = latestMockPc;

      expect(pc.createDataChannel).toHaveBeenCalledWith("file-transfer");
      expect(pc.createOffer).toHaveBeenCalled();
      expect(pc.setLocalDescription).toHaveBeenCalled();
      expect(signaling.send).toHaveBeenCalledWith({
        type: "offer",
        sdp: "offer-sdp",
      });
    });

    it("既存の PeerConnection がある場合はクリーンアップしてから作り直す", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());

      await manager.createOffer();
      const firstPc = latestMockPc;

      await manager.createOffer();

      expect(firstPc.close).toHaveBeenCalled();
    });

    it("offer 作成に失敗したらクリーンアップする", async () => {
      class FailingOfferRTCPeerConnection extends MockRTCPeerConnection {
        setLocalDescription = vi.fn(async () => {
          throw new Error("setLocalDescription failed");
        });
      }
      vi.stubGlobal("RTCPeerConnection", FailingOfferRTCPeerConnection);

      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());

      await expect(manager.createOffer()).rejects.toThrow("setLocalDescription failed");
      const failedPc = latestMockPc;
      expect(failedPc.close).toHaveBeenCalled();
      expect(manager.getDataChannel()).toBeNull();
    });
  });

  describe("handleOffer (via signaling)", () => {
    it("offer 受信時に answer を返す", async () => {
      const signaling = createMockSignaling();
      new PeerConnectionManager(signaling, createMockEnv());

      await signaling._trigger("offer", "remote-offer-sdp");
      const pc = latestMockPc;

      expect(pc.setRemoteDescription).toHaveBeenCalledWith({
        type: "offer",
        sdp: "remote-offer-sdp",
      });
      expect(pc.createAnswer).toHaveBeenCalled();
      expect(pc.setLocalDescription).toHaveBeenCalled();
      expect(signaling.send).toHaveBeenCalledWith({
        type: "answer",
        sdp: "answer-sdp",
      });
    });

    it("offer 処理に失敗したらクリーンアップする", async () => {
      class FailingAnswerRTCPeerConnection extends MockRTCPeerConnection {
        setRemoteDescription = vi.fn(async () => {
          throw new Error("setRemoteDescription failed");
        });
      }
      vi.stubGlobal("RTCPeerConnection", FailingAnswerRTCPeerConnection);

      const signaling = createMockSignaling();
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      new PeerConnectionManager(signaling, createMockEnv());

      await signaling._trigger("offer", "broken-offer");

      const pc = latestMockPc;
      expect(pc.close).toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalled();
    });
  });

  describe("handleAnswer (via signaling)", () => {
    it("answer 受信時に remoteDescription をセットする", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      await manager.createOffer();
      const pc = latestMockPc;

      await signaling._trigger("answer", "remote-answer-sdp");

      expect(pc.setRemoteDescription).toHaveBeenCalledWith({
        type: "answer",
        sdp: "remote-answer-sdp",
      });
    });

    it("PeerConnection がない場合は何もしない", async () => {
      const signaling = createMockSignaling();
      new PeerConnectionManager(signaling, createMockEnv());

      // pc が null のまま answer を受信 → エラーにならないこと
      await signaling._trigger("answer", "sdp");
    });

    it("have-local-offer 以外の状態で受信した answer は無視する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      await manager.createOffer();
      const pc = latestMockPc;
      pc.signalingState = "stable";

      await signaling._trigger("answer", "stale-answer-sdp");

      expect(pc.setRemoteDescription).not.toHaveBeenCalledWith({
        type: "answer",
        sdp: "stale-answer-sdp",
      });
    });
  });

  describe("handleCandidate (via signaling)", () => {
    it("candidate を受信して addIceCandidate を呼ぶ", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      await manager.createOffer();
      const pc = latestMockPc;

      const candidate: RTCIceCandidateInit = {
        candidate: "candidate:123",
        sdpMLineIndex: 0,
      };
      await signaling._trigger("candidate", candidate);

      expect(pc.addIceCandidate).toHaveBeenCalledWith(candidate);
    });

    it("PeerConnection がない場合は何もしない", async () => {
      const signaling = createMockSignaling();
      new PeerConnectionManager(signaling, createMockEnv());

      await signaling._trigger("candidate", { candidate: "test" });
    });
  });

  describe("peer-left", () => {
    it("peer-left 受信時にクリーンアップして disconnected を発火する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onDisconnected = vi.fn();
      manager.on("disconnected", onDisconnected);

      await manager.createOffer();
      const pc = latestMockPc;

      await signaling._trigger("peer-left");

      expect(pc.close).toHaveBeenCalled();
      expect(onDisconnected).toHaveBeenCalledOnce();
    });
  });

  describe("signaling disconnected", () => {
    it("disconnected 受信時にクリーンアップして disconnected を発火する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onDisconnected = vi.fn();
      manager.on("disconnected", onDisconnected);

      await manager.createOffer();
      const pc = latestMockPc;

      await signaling._trigger("disconnected");

      expect(pc.close).toHaveBeenCalled();
      expect(onDisconnected).toHaveBeenCalledOnce();
    });
  });

  describe("DataChannel イベント", () => {
    it("ondatachannel で受信した channel の open イベントを伝播する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onOpen = vi.fn();
      manager.on("datachannel-open", onOpen);

      await signaling._trigger("offer", "remote-sdp");
      const pc = latestMockPc;

      const incomingChannel = createMockDataChannel();
      pc.ondatachannel?.({
        channel: incomingChannel,
      } as unknown as RTCDataChannelEvent);

      incomingChannel.onopen?.({} as Event);
      expect(onOpen).toHaveBeenCalledWith(incomingChannel);
    });

    it("datachannel-message イベントを伝播する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onMessage = vi.fn();
      manager.on("datachannel-message", onMessage);

      await signaling._trigger("offer", "remote-sdp");
      const pc = latestMockPc;

      const incomingChannel = createMockDataChannel();
      pc.ondatachannel?.({
        channel: incomingChannel,
      } as unknown as RTCDataChannelEvent);

      incomingChannel.onmessage?.({ data: "hello" } as MessageEvent);
      expect(onMessage).toHaveBeenCalledWith("hello");
    });

    it("datachannel-close イベントを伝播する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onClose = vi.fn();
      manager.on("datachannel-close", onClose);

      await signaling._trigger("offer", "remote-sdp");
      const pc = latestMockPc;

      const incomingChannel = createMockDataChannel();
      pc.ondatachannel?.({
        channel: incomingChannel,
      } as unknown as RTCDataChannelEvent);

      incomingChannel.onclose?.({} as Event);
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("ICE candidate 送信", () => {
    it("onicecandidate で candidate をシグナリングに送信する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      await manager.createOffer();
      const pc = latestMockPc;

      const mockCandidate = {
        candidate: "candidate:456",
        toJSON: () => ({ candidate: "candidate:456", sdpMLineIndex: 0 }),
      };
      pc.onicecandidate?.({
        candidate: mockCandidate,
      } as unknown as RTCPeerConnectionIceEvent);

      expect(signaling.send).toHaveBeenCalledWith({
        type: "candidate",
        candidate: { candidate: "candidate:456", sdpMLineIndex: 0 },
      });
    });

    it("candidate が null の場合は送信しない", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      await manager.createOffer();
      const pc = latestMockPc;

      (signaling.send as ReturnType<typeof vi.fn>).mockClear();

      pc.onicecandidate?.({
        candidate: null,
      } as unknown as RTCPeerConnectionIceEvent);

      expect(signaling.send).not.toHaveBeenCalled();
    });
  });

  describe("connectionState 変化", () => {
    it("disconnected 状態になると disconnected イベントを発火する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onDisconnected = vi.fn();
      manager.on("disconnected", onDisconnected);

      await manager.createOffer();
      const pc = latestMockPc;
      pc.connectionState = "disconnected";
      pc.onconnectionstatechange?.({} as Event);

      expect(onDisconnected).toHaveBeenCalledOnce();
      expect(pc.close).toHaveBeenCalled();
    });

    it("failed 状態になると disconnected イベントを発火する", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const onDisconnected = vi.fn();
      manager.on("disconnected", onDisconnected);

      await manager.createOffer();
      const pc = latestMockPc;
      pc.connectionState = "failed";
      pc.onconnectionstatechange?.({} as Event);

      expect(onDisconnected).toHaveBeenCalledOnce();
      expect(pc.close).toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("DataChannel と PeerConnection を閉じる", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      await manager.createOffer();
      const pc = latestMockPc;

      const channel = manager.getDataChannel();
      manager.cleanup();

      expect(channel?.close).toHaveBeenCalled();
      expect(pc.close).toHaveBeenCalled();
      expect(manager.getDataChannel()).toBeNull();
    });
  });

  describe("on / off", () => {
    it("off() でリスナーを解除できる", async () => {
      const signaling = createMockSignaling();
      const manager = new PeerConnectionManager(signaling, createMockEnv());
      const cb = vi.fn();
      manager.on("disconnected", cb);
      manager.off("disconnected", cb);

      await manager.createOffer();
      const pc = latestMockPc;
      pc.connectionState = "disconnected";
      pc.onconnectionstatechange?.({} as Event);

      expect(cb).not.toHaveBeenCalled();
    });
  });
});
