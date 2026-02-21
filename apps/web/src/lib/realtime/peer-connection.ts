import type { SignalingClient } from "./signaling-client";

const getRTCConfig = (env: Cloudflare.Env): RTCConfiguration => ({
  iceServers: [
    { urls: "stun:stun.cloudflare.com:3478" },
    {
      urls: "turn:turn.cloudflare.com:3478?transport=udp",
      username: env.CF_TURN_USERNAME,
      credential: env.CF_TURN_TOKEN,
    },
    {
      urls: "turn:turn.cloudflare.com:3478?transport=tcp",
      username: env.CF_TURN_USERNAME,
      credential: env.CF_TURN_TOKEN,
    },
    {
      urls: "turns:turn.cloudflare.com:5349?transport=tcp",
      username: env.CF_TURN_USERNAME,
      credential: env.CF_TURN_TOKEN,
    },
  ],
});

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
  private readonly RTC_CONFIG: RTCConfiguration;

  constructor(
    private readonly signaling: SignalingClient,
    env: CloudflareBindings,
  ) {
    this.RTC_CONFIG = getRTCConfig(env);
    this.setupSignalingHandlers();
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
    if (this.pc) {
      this.cleanup();
    }
    this.pc = this.createPeerConnection();

    // オファー側がDataChannelを作成する
    this.dataChannel = this.pc.createDataChannel(DATA_CHANNEL_LABEL);
    this.setupDataChannel(this.dataChannel);

    this.makingOffer = true;
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      const sdp = this.pc.localDescription?.sdp;
      if (!sdp) {
        throw new Error("Failed to create local offer SDP");
      }
      this.signaling.send({ type: "offer", sdp });
    } catch (error) {
      this.cleanup();
      throw error;
    } finally {
      this.makingOffer = false;
    }
  }

  private async handleOffer(sdp: string): Promise<void> {
    // 既存の接続がある場合はクリーンアップしてからリソースリークを防ぐ
    if (this.pc) {
      this.cleanup();
    }
    this.pc = this.createPeerConnection();
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

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send({
          type: "candidate",
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(event.channel);
    };

    pc.onconnectionstatechange = () => {
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
