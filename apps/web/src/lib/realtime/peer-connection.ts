import type { SignalingClient } from "./signaling-client";

type IceTransportMode = "stun" | "turn";

const DEFAULT_STUN_SERVER: RTCIceServer = { urls: "stun:stun.cloudflare.com:3478" };

export type TurnIceServerConfig = {
  urls: string | string[];
  username: string;
  credential: string;
};

export type PeerConnectionManagerOptions = {
  turnIceServer?: TurnIceServerConfig | null;
  forceTurn?: boolean;
};

const TURN_URL_PREFIXES = ["turn:", "turns:"];
const STUN_URL_PREFIXES = ["stun:", "stuns:"];

const isTurnUrl = (url: string): boolean => TURN_URL_PREFIXES.some((prefix) => url.startsWith(prefix));

const isStunUrl = (url: string): boolean => STUN_URL_PREFIXES.some((prefix) => url.startsWith(prefix));

const normalizeUrls = (urls: string | string[]): string[] => (Array.isArray(urls) ? [...urls] : [urls]);

const toRtcIceServerUrls = (urls: string[]): string | string[] => (urls.length === 1 ? urls[0] : urls);

const getRTCConfig = (
  mode: IceTransportMode,
  stunIceServer: RTCIceServer,
  turnIceServer: RTCIceServer | null,
): RTCConfiguration => {
  if (mode !== "turn" || !turnIceServer) {
    return { iceServers: [stunIceServer] };
  }
  return {
    iceServers: [turnIceServer],
    iceTransportPolicy: "relay",
  };
};

const DATA_CHANNEL_LABEL = "file-transfer";

export type PeerEventMap = {
  "datachannel-open": (channel: RTCDataChannel) => void;
  "datachannel-close": () => void;
  "datachannel-message": (data: string | ArrayBuffer) => void;
  disconnected: () => void;
};

/* WebRTC PeerConnection の管理クラス */
export class PeerConnectionManager {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private listeners = new Map<keyof PeerEventMap, Set<(...args: never[]) => void>>();
  private makingOffer = false;
  private pendingRemoteCandidates: RTCIceCandidateInit[] = [];
  private stunIceServer: RTCIceServer = DEFAULT_STUN_SERVER;
  private turnIceServer: RTCIceServer | null = null;
  private forceTurn = false;
  private currentIceTransportMode: IceTransportMode = "stun";
  private hasTurnRetryAttempted = false;
  private isOfferer = false;

  constructor(
    private readonly signaling: SignalingClient,
    options: PeerConnectionManagerOptions = {},
  ) {
    this.setTurnIceServer(options.turnIceServer ?? null);
    this.setForceTurn(options.forceTurn ?? false);
    this.setupSignalingHandlers();
  }

  setTurnIceServer(turnIceServer: TurnIceServerConfig | null): void {
    if (!turnIceServer) {
      this.stunIceServer = DEFAULT_STUN_SERVER;
      this.turnIceServer = null;
      return;
    }

    const urls = normalizeUrls(turnIceServer.urls);
    const stunUrls = urls.filter(isStunUrl);
    const turnUrls = urls.filter(isTurnUrl);

    this.stunIceServer = stunUrls.length > 0 ? { urls: toRtcIceServerUrls(stunUrls) } : DEFAULT_STUN_SERVER;
    this.turnIceServer =
      turnUrls.length > 0
        ? {
            urls: toRtcIceServerUrls(turnUrls),
            username: turnIceServer.username,
            credential: turnIceServer.credential,
          }
        : null;
  }

  setForceTurn(forceTurn: boolean): void {
    this.forceTurn = forceTurn;
  }

  private setupSignalingHandlers(): void {
    this.signaling.on("offer", async (sdp: string) => {
      await this.handleOffer(sdp).catch((error) => {
        console.error("Failed to handle offer:", error);
      });
    });

    this.signaling.on("answer", async (sdp: string) => {
      await this.handleAnswer(sdp).catch((error) => {
        console.error("Failed to handle answer:", error);
      });
    });

    this.signaling.on("candidate", async (candidate: RTCIceCandidateInit) => {
      await this.handleCandidate(candidate).catch((error) => {
        console.error("Failed to handle ICE candidate:", error);
      });
    });

    this.signaling.on("peer-left", () => {
      this.cleanup();
      this.emit("disconnected");
    });

    this.signaling.on("disconnected", () => {
      this.cleanup();
      this.emit("disconnected");
    });
  }

  /** ピアが参加した時にオファーを作成する（最初に接続した側が呼ぶ） */
  async createOffer(): Promise<void> {
    this.currentIceTransportMode = this.getInitialIceTransportMode();
    this.hasTurnRetryAttempted = false;
    this.isOfferer = true;
    await this.createOfferWithCurrentTransport();
  }

  private async createOfferWithCurrentTransport(): Promise<void> {
    if (this.pc) {
      this.cleanup();
    }
    this.pc = this.createPeerConnection(this.currentIceTransportMode);
    const pc = this.pc;

    // オファー側がDataChannelを作成する
    this.dataChannel = pc.createDataChannel(DATA_CHANNEL_LABEL);
    this.setupDataChannel(this.dataChannel);

    this.makingOffer = true;
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (this.pc !== pc) {
        return;
      }
      const sdp = pc.localDescription?.sdp;
      if (!sdp) {
        throw new Error("Failed to create local offer SDP");
      }
      this.signaling.send({ type: "offer", sdp });
    } catch (error) {
      if (this.pc === pc) {
        this.cleanup();
      }
      throw error;
    } finally {
      this.makingOffer = false;
    }
  }

  private async handleOffer(sdp: string): Promise<void> {
    this.isOfferer = false;
    this.currentIceTransportMode = this.getInitialIceTransportMode();
    this.hasTurnRetryAttempted = false;
    // 既存の接続がある場合はクリーンアップしてからリソースリークを防ぐ
    if (this.pc) {
      this.cleanup();
    }
    this.pc = this.createPeerConnection(this.currentIceTransportMode);
    try {
      await this.pc.setRemoteDescription({ type: "offer", sdp });
      await this.flushPendingRemoteCandidates();
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      const answerSdp = this.pc.localDescription?.sdp;
      if (!answerSdp) {
        throw new Error("Failed to create local answer SDP");
      }
      this.signaling.send({ type: "answer", sdp: answerSdp });
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  private getInitialIceTransportMode(): IceTransportMode {
    if (this.forceTurn && this.turnIceServer) {
      return "turn";
    }
    return "stun";
  }

  private async handleAnswer(sdp: string): Promise<void> {
    if (!this.pc) return;
    if (this.pc.signalingState !== "have-local-offer") {
      // 既に stable の場合など、古い answer が遅延到着したケースは無視する
      return;
    }
    await this.pc.setRemoteDescription({ type: "answer", sdp });
    await this.flushPendingRemoteCandidates();
  }

  private async handleCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) {
      this.pendingRemoteCandidates.push(candidate);
      return;
    }
    if (!this.pc.remoteDescription) {
      this.pendingRemoteCandidates.push(candidate);
      return;
    }
    try {
      await this.pc.addIceCandidate(candidate);
    } catch (e) {
      // オファー作成中のcandidate追加エラーは無視する
      if (!this.makingOffer) {
        throw e;
      }
    }
  }

  private async flushPendingRemoteCandidates(): Promise<void> {
    if (!this.pc || !this.pc.remoteDescription || this.pendingRemoteCandidates.length === 0) {
      return;
    }

    const queued = this.pendingRemoteCandidates;
    this.pendingRemoteCandidates = [];
    for (const candidate of queued) {
      await this.pc.addIceCandidate(candidate);
    }
  }

  private shouldRetryWithTurn(pc: RTCPeerConnection): boolean {
    return (
      this.pc === pc &&
      this.isOfferer &&
      this.currentIceTransportMode === "stun" &&
      !this.hasTurnRetryAttempted &&
      this.turnIceServer !== null
    );
  }

  private async retryOfferWithTurn(): Promise<void> {
    this.hasTurnRetryAttempted = true;
    this.currentIceTransportMode = "turn";
    try {
      await this.createOfferWithCurrentTransport();
    } catch (error) {
      console.error("Failed to retry WebRTC offer with TURN:", error);
      this.cleanup();
      this.emit("disconnected");
    }
  }

  private createPeerConnection(mode: IceTransportMode): RTCPeerConnection {
    const pc = new RTCPeerConnection(getRTCConfig(mode, this.stunIceServer, this.turnIceServer));

    pc.onicecandidate = (event) => {
      if (this.pc !== pc) return;
      if (event.candidate) {
        this.signaling.send({
          type: "candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ondatachannel = (event) => {
      if (this.pc !== pc) return;
      this.dataChannel = event.channel;
      this.setupDataChannel(event.channel);
    };

    pc.onconnectionstatechange = () => {
      if (this.pc !== pc) return;
      if (pc.connectionState === "failed" && this.shouldRetryWithTurn(pc)) {
        void this.retryOfferWithTurn();
        return;
      }
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        this.cleanup();
        this.emit("disconnected");
      }
    };

    return pc;
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    channel.binaryType = "arraybuffer";

    channel.onopen = () => {
      this.emit("datachannel-open", channel);
    };

    channel.onclose = () => {
      this.emit("datachannel-close");
    };

    channel.onmessage = (event) => {
      this.emit("datachannel-message", event.data);
    };
  }

  getDataChannel(): RTCDataChannel | null {
    return this.dataChannel;
  }

  cleanup(): void {
    this.pendingRemoteCandidates = [];
    this.dataChannel?.close();
    this.dataChannel = null;
    this.pc?.close();
    this.pc = null;
  }

  on<K extends keyof PeerEventMap>(event: K, callback: PeerEventMap[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as (...args: never[]) => void);
  }

  off<K extends keyof PeerEventMap>(event: K, callback: PeerEventMap[K]): void {
    this.listeners.get(event)?.delete(callback as (...args: never[]) => void);
  }

  private emit<K extends keyof PeerEventMap>(event: K, ...args: Parameters<PeerEventMap[K]>): void {
    for (const callback of this.listeners.get(event) ?? []) {
      // biome-ignore lint/suspicious/noExplicitAny: 型安全は emit のシグネチャで保証される
      (callback as (...a: any[]) => void)(...args);
    }
  }
}
