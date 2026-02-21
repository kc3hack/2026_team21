import type { SignalingClient } from "./signaling-client";

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
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
  private listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  private makingOffer = false;

  constructor(private readonly signaling: SignalingClient) {
    this.setupSignalingHandlers();
  }

  private setupSignalingHandlers(): void {
    this.signaling.on("offer", async (sdp: string) => {
      await this.handleOffer(sdp);
    });

    this.signaling.on("answer", async (sdp: string) => {
      await this.handleAnswer(sdp);
    });

    this.signaling.on("candidate", async (candidate: RTCIceCandidateInit) => {
      await this.handleCandidate(candidate);
    });

    this.signaling.on("peer-left", () => {
      this.cleanup();
      this.emit("disconnected");
    });
  }

  /** ピアが参加した時にオファーを作成する（最初に接続した側が呼ぶ） */
  async createOffer(): Promise<void> {
    this.pc = this.createPeerConnection();

    // オファー側がDataChannelを作成する
    this.dataChannel = this.pc.createDataChannel(DATA_CHANNEL_LABEL);
    this.setupDataChannel(this.dataChannel);

    this.makingOffer = true;
    try {
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      const sdp = this.pc.localDescription?.sdp;
      if (sdp) {
        this.signaling.send({ type: "offer", sdp });
      }
    } finally {
      this.makingOffer = false;
    }
  }

  private async handleOffer(sdp: string): Promise<void> {
    this.pc = this.createPeerConnection();
    await this.pc.setRemoteDescription({ type: "offer", sdp });
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    const answerSdp = this.pc.localDescription?.sdp;
    if (answerSdp) {
      this.signaling.send({ type: "answer", sdp: answerSdp });
    }
  }

  private async handleAnswer(sdp: string): Promise<void> {
    if (!this.pc) return;
    await this.pc.setRemoteDescription({ type: "answer", sdp });
  }

  private async handleCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.pc) return;
    try {
      await this.pc.addIceCandidate(candidate);
    } catch (e) {
      // オファー作成中のcandidate追加エラーは無視する
      if (!this.makingOffer) {
        throw e;
      }
    }
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);

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
    this.dataChannel?.close();
    this.dataChannel = null;
    this.pc?.close();
    this.pc = null;
  }

  on<K extends keyof PeerEventMap>(event: K, callback: PeerEventMap[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as (...args: unknown[]) => void);
  }

  off<K extends keyof PeerEventMap>(event: K, callback: PeerEventMap[K]): void {
    this.listeners.get(event)?.delete(callback as (...args: unknown[]) => void);
  }

  private emit(event: string, ...args: unknown[]): void {
    for (const callback of this.listeners.get(event) ?? []) {
      callback(...args);
    }
  }
}
