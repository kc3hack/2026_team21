import type { FileTransferMessage } from "./types";

/** ファイルチャンクサイズ (16KB) */
const CHUNK_SIZE = 16 * 1024;

/** バッファ上限超過時の待機閾値 */
const BUFFER_HIGH_WATERMARK = CHUNK_SIZE * 8;
const BUFFER_LOW_WATERMARK = CHUNK_SIZE * 2;

export type FileSendProgress = {
  sent: number;
  total: number;
};

export type FileReceiveResult = {
  name: string;
  size: number;
  mimeType: string;
  data: Blob;
};

/* DateChannelでファイルを送信する */
export async function sendFile(
  channel: RTCDataChannel,
  file: File,
  onProgress?: (progress: FileSendProgress) => void,
): Promise<void> {
  // メタデータを前もって送信しておく
  const meta: FileTransferMessage = {
    type: "file-meta",
    name: file.name,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
  };
  channel.send(JSON.stringify(meta));

  // ファイルをチャンクに分割して送信
  let offset = 0;
  while (offset < file.size) {
    // バッファが溜まりすぎたら drain を待つ
    if (channel.bufferedAmount > BUFFER_HIGH_WATERMARK) {
      await waitForBufferDrain(channel);
    }

    const end = Math.min(offset + CHUNK_SIZE, file.size);
    const chunk = await file.slice(offset, end).arrayBuffer();
    channel.send(chunk);
    offset = end;
    onProgress?.({ sent: offset, total: file.size });
  }

  // 転送終了
  const endMsg: FileTransferMessage = { type: "file-end" };
  channel.send(JSON.stringify(endMsg));
}

function waitForBufferDrain(channel: RTCDataChannel): Promise<void> {
  if (channel.bufferedAmount <= BUFFER_LOW_WATERMARK) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const prev = channel.bufferedAmountLowThreshold;
    channel.bufferedAmountLowThreshold = BUFFER_LOW_WATERMARK;

    const onDrain = () => {
      channel.removeEventListener("bufferedamountlow", onDrain);
      channel.bufferedAmountLowThreshold = prev;
      resolve();
    };
    channel.addEventListener("bufferedamountlow", onDrain);
  });
}

/* DataChannelからのファイル受信を管理するクラス */
export class FileReceiver {
  private currentFile: {
    name: string;
    size: number;
    mimeType: string;
    chunks: ArrayBuffer[];
    received: number;
  } | null = null;

  private onFileCallback?: (result: FileReceiveResult) => void;
  private onProgressCallback?: (progress: { received: number; total: number }) => void;

  /** ファイル受信完了時のコールバック */
  onFile(callback: (result: FileReceiveResult) => void): void {
    this.onFileCallback = callback;
  }

  /** 受信進捗コールバック*/
  onProgress(callback: (progress: { received: number; total: number }) => void): void {
    this.onProgressCallback = callback;
  }

  /** DataChannelの onmessage から呼ばれるハンドラー */
  handleMessage(data: string | ArrayBuffer): void {
    if (typeof data === "string") {
      const msg: FileTransferMessage = JSON.parse(data);
      switch (msg.type) {
        case "file-meta":
          this.currentFile = {
            name: msg.name,
            size: msg.size,
            mimeType: msg.mimeType,
            chunks: [],
            received: 0,
          };
          break;
        case "file-end":
          if (this.currentFile) {
            const blob = new Blob(this.currentFile.chunks, {
              type: this.currentFile.mimeType,
            });
            this.onFileCallback?.({
              name: this.currentFile.name,
              size: this.currentFile.size,
              mimeType: this.currentFile.mimeType,
              data: blob,
            });
            this.currentFile = null;
          }
          break;
      }
    } else if (data instanceof ArrayBuffer) {
      if (this.currentFile) {
        this.currentFile.chunks.push(data);
        this.currentFile.received += data.byteLength;
        this.onProgressCallback?.({
          received: this.currentFile.received,
          total: this.currentFile.size,
        });
      }
    }
  }
}
