import type { FileTransferMessage } from "./types";

/** ファイルチャンクサイズ (16KB) */
const CHUNK_SIZE = 16 * 1024;

/** バッファ上限超過時の待機閾値 */
const BUFFER_HIGH_WATERMARK = CHUNK_SIZE * 8;
const BUFFER_LOW_WATERMARK = CHUNK_SIZE * 2;

/** バッファ drain 待機のタイムアウト (ms) */
const DRAIN_TIMEOUT_MS = 30_000;

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

/**
 * DataChannel でファイルを送信する。
 *
 * @throws {Error} `channel.readyState` が `"open"` でない場合
 */
export async function sendFile(
  channel: RTCDataChannel,
  file: File,
  onProgress?: (progress: FileSendProgress) => void,
): Promise<void> {
  if (channel.readyState !== "open") {
    throw new Error(
      `Cannot send file: DataChannel is "${channel.readyState}", expected "open"`,
    );
  }

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

  return new Promise((resolve, reject) => {
    const prev = channel.bufferedAmountLowThreshold;
    channel.bufferedAmountLowThreshold = BUFFER_LOW_WATERMARK;

    const cleanup = () => {
      clearTimeout(timer);
      channel.removeEventListener("bufferedamountlow", onDrain);
      channel.removeEventListener("close", onClose);
      channel.removeEventListener("error", onError);
      channel.bufferedAmountLowThreshold = prev;
    };

    const onDrain = () => {
      cleanup();
      resolve();
    };

    const onClose = () => {
      cleanup();
      reject(new Error("DataChannel closed while waiting for buffer drain"));
    };

    const onError = (ev: Event) => {
      cleanup();
      const errorEvent = ev as RTCErrorEvent;
      reject(errorEvent.error ?? new Error("DataChannel error while waiting for buffer drain"));
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Buffer drain timed out after ${DRAIN_TIMEOUT_MS}ms`));
    }, DRAIN_TIMEOUT_MS);

    channel.addEventListener("bufferedamountlow", onDrain);
    channel.addEventListener("close", onClose);
    channel.addEventListener("error", onError);
  });
}

/**
 * Blob / ArrayBufferView / ArrayBuffer を一律 ArrayBuffer に変換する。
 * ブラウザによって DataChannel の binaryType 設定や
 * MessageEvent.data の型が異なるケースを吸収する。
 */
async function toArrayBuffer(data: ArrayBuffer | Blob | ArrayBufferView): Promise<ArrayBuffer> {
  if (data instanceof ArrayBuffer) {
    return data;
  }
  if (data instanceof Blob) {
    return await data.arrayBuffer();
  }
  if (ArrayBuffer.isView(data)) {
    // TypedArray / DataView ─ 基底バッファの一部だけを参照している場合があるのでコピー
    // .buffer は SharedArrayBuffer の可能性があるため、新しい ArrayBuffer へコピーする
    const copy = new ArrayBuffer(data.byteLength);
    new Uint8Array(copy).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    return copy;
  }
  throw new TypeError(`Unexpected binary data type: ${typeof data}`);
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
  private onErrorCallback?: (error: Error) => void;

  /** ファイル受信完了時のコールバック */
  onFile(callback: (result: FileReceiveResult) => void): void {
    this.onFileCallback = callback;
  }

  /** 受信進捗コールバック*/
  onProgress(callback: (progress: { received: number; total: number }) => void): void {
    this.onProgressCallback = callback;
  }

  /** エラー発生時のコールバック */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }

  /** DataChannelの onmessage から呼ばれるハンドラー */
  async handleMessage(data: string | ArrayBuffer | Blob | ArrayBufferView): Promise<void> {
    try {
      if (typeof data === "string") {
        this.handleStringMessage(data);
      } else {
        const buffer = await toArrayBuffer(data);
        this.handleBinaryMessage(buffer);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.onErrorCallback?.(error);
    }
  }

  private handleStringMessage(data: string): void {
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
  }

  private handleBinaryMessage(buffer: ArrayBuffer): void {
    if (this.currentFile) {
      this.currentFile.chunks.push(buffer);
      this.currentFile.received += buffer.byteLength;
      this.onProgressCallback?.({
        received: this.currentFile.received,
        total: this.currentFile.size,
      });
    }
  }
}
