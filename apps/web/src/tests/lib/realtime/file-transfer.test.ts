import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileReceiver, sendFile } from "@/lib/realtime/file-transfer";
import type { FileTransferMessage } from "@/lib/realtime/types";

/* ── Mock RTCDataChannel ── */
function createMockChannel(options?: { bufferedAmount?: number }): RTCDataChannel {
  const channel = {
    bufferedAmount: options?.bufferedAmount ?? 0,
    readyState: "open" as RTCDataChannelState,
    binaryType: "arraybuffer" as BinaryType,
    send: vi.fn(),
    close: vi.fn(),
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    onbufferedamountlow: null,
  } as unknown as RTCDataChannel;
  return channel;
}

/* ── Mock File ── */
function createMockFile(name: string, content: Uint8Array<ArrayBuffer>, mimeType = "application/octet-stream"): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], name, { type: mimeType });
}

/* ── sendFile テスト ── */
describe("sendFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("メタデータ → チャンク → file-end の順に送信する", async () => {
    const channel = createMockChannel();
    const content = new Uint8Array(100).fill(42);
    const file = createMockFile("test.bin", content, "application/octet-stream");

    await sendFile(channel, file);

    const calls = (channel.send as ReturnType<typeof vi.fn>).mock.calls;

    // 最初のメッセージはメタデータ
    const meta: FileTransferMessage = JSON.parse(calls[0][0] as string);
    expect(meta).toEqual({
      type: "file-meta",
      name: "test.bin",
      size: 100,
      mimeType: "application/octet-stream",
    });

    // 最後のメッセージは file-end
    const endMsg: FileTransferMessage = JSON.parse(calls.at(-1)?.[0] as string);
    expect(endMsg).toEqual({ type: "file-end" });

    // メタとエンドの間にバイナリチャンクがある
    expect(calls.length).toBeGreaterThanOrEqual(3); // meta + at least 1 chunk + end
  });

  it("onProgress コールバックが呼ばれる", async () => {
    const channel = createMockChannel();
    const content = new Uint8Array(100).fill(1);
    const file = createMockFile("progress.bin", content);
    const onProgress = vi.fn();

    await sendFile(channel, file, onProgress);

    expect(onProgress).toHaveBeenCalled();
    // 最後の呼び出しで sent === total
    const lastCall = onProgress.mock.calls.at(-1)?.[0];
    expect(lastCall.sent).toBe(100);
    expect(lastCall.total).toBe(100);
  });

  it("ファイルサイズ 0 の場合はチャンクなしで meta + end のみ送信する", async () => {
    const channel = createMockChannel();
    const file = createMockFile("empty.txt", new Uint8Array(0), "text/plain");

    await sendFile(channel, file);

    const calls = (channel.send as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls).toHaveLength(2); // meta + end

    const meta: FileTransferMessage = JSON.parse(calls[0][0] as string);
    expect(meta.type).toBe("file-meta");

    const end: FileTransferMessage = JSON.parse(calls[1][0] as string);
    expect(end.type).toBe("file-end");
  });

  it("MIME タイプが空の場合は application/octet-stream になる", async () => {
    const channel = createMockChannel();
    // File の type を空にするために直接作成
    const blob = new Blob([new Uint8Array(10)], { type: "" });
    const file = new File([blob], "noext", { type: "" });

    await sendFile(channel, file);

    const meta: FileTransferMessage = JSON.parse((channel.send as ReturnType<typeof vi.fn>).mock.calls[0][0] as string);
    if (meta.type === "file-meta") {
      expect(meta.mimeType).toBe("application/octet-stream");
    }
  });

  it("大きなファイルを 16KB チャンクに分割して送信する", async () => {
    const channel = createMockChannel();
    const size = 16 * 1024 * 3 + 100; // 3チャンク + 残り
    const content = new Uint8Array(size).fill(7);
    const file = createMockFile("large.bin", content);

    await sendFile(channel, file);

    const calls = (channel.send as ReturnType<typeof vi.fn>).mock.calls;
    // meta(1) + chunks(4) + end(1) = 6
    expect(calls).toHaveLength(6);
  });
});

/* ── FileReceiver テスト ── */
describe("FileReceiver", () => {
  it("file-meta → バイナリチャンク → file-end の順で受信するとファイルが組み立てられる", async () => {
    const receiver = new FileReceiver();
    const onFile = vi.fn();
    receiver.onFile(onFile);

    // meta
    const meta: FileTransferMessage = {
      type: "file-meta",
      name: "received.txt",
      size: 11,
      mimeType: "text/plain",
    };
    await receiver.handleMessage(JSON.stringify(meta));

    // chunks
    const encoder = new TextEncoder();
    const chunk = encoder.encode("hello world").buffer;
    await receiver.handleMessage(chunk as ArrayBuffer);

    // end
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    expect(onFile).toHaveBeenCalledOnce();
    const result = onFile.mock.calls[0][0];
    expect(result.name).toBe("received.txt");
    expect(result.size).toBe(11);
    expect(result.mimeType).toBe("text/plain");
    expect(result.data).toBeInstanceOf(Blob);
  });

  it("受信進捗コールバックが呼ばれる", async () => {
    const receiver = new FileReceiver();
    const onProgress = vi.fn();
    receiver.onProgress(onProgress);

    const meta: FileTransferMessage = {
      type: "file-meta",
      name: "p.bin",
      size: 200,
      mimeType: "application/octet-stream",
    };
    await receiver.handleMessage(JSON.stringify(meta));

    const chunk1 = new ArrayBuffer(100);
    await receiver.handleMessage(chunk1);
    expect(onProgress).toHaveBeenCalledWith({ received: 100, total: 200 });

    const chunk2 = new ArrayBuffer(100);
    await receiver.handleMessage(chunk2);
    expect(onProgress).toHaveBeenCalledWith({ received: 200, total: 200 });
  });

  it("file-meta を受信する前のバイナリデータは無視される", async () => {
    const receiver = new FileReceiver();
    const onFile = vi.fn();
    receiver.onFile(onFile);

    // meta なしで chunk を送る
    await receiver.handleMessage(new ArrayBuffer(10));

    // file-end しても何も起きない
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    expect(onFile).not.toHaveBeenCalled();
  });

  it("file-end 後に新しいファイルを受信できる", async () => {
    const receiver = new FileReceiver();
    const onFile = vi.fn();
    receiver.onFile(onFile);

    // 1つ目のファイル
    await receiver.handleMessage(
      JSON.stringify({
        type: "file-meta",
        name: "first.bin",
        size: 5,
        mimeType: "application/octet-stream",
      }),
    );
    await receiver.handleMessage(new ArrayBuffer(5));
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    // 2つ目のファイル
    await receiver.handleMessage(
      JSON.stringify({
        type: "file-meta",
        name: "second.bin",
        size: 3,
        mimeType: "application/octet-stream",
      }),
    );
    await receiver.handleMessage(new ArrayBuffer(3));
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    expect(onFile).toHaveBeenCalledTimes(2);
    expect(onFile.mock.calls[0][0].name).toBe("first.bin");
    expect(onFile.mock.calls[1][0].name).toBe("second.bin");
  });

  it("複数チャンクを正しく結合する", async () => {
    const receiver = new FileReceiver();
    const onFile = vi.fn();
    receiver.onFile(onFile);

    await receiver.handleMessage(
      JSON.stringify({
        type: "file-meta",
        name: "multi.bin",
        size: 30,
        mimeType: "application/octet-stream",
      }),
    );

    await receiver.handleMessage(new ArrayBuffer(10));
    await receiver.handleMessage(new ArrayBuffer(10));
    await receiver.handleMessage(new ArrayBuffer(10));
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    expect(onFile).toHaveBeenCalledOnce();
    const result = onFile.mock.calls[0][0];
    expect(result.data.size).toBe(30);
  });

  /* ── Blob / ArrayBufferView 対応テスト ── */

  it("Blob をバイナリチャンクとして受信できる", async () => {
    const receiver = new FileReceiver();
    const onFile = vi.fn();
    receiver.onFile(onFile);

    await receiver.handleMessage(
      JSON.stringify({ type: "file-meta", name: "blob.bin", size: 6, mimeType: "application/octet-stream" }),
    );
    const blob = new Blob([new Uint8Array([1, 2, 3, 4, 5, 6])]);
    await receiver.handleMessage(blob);
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    expect(onFile).toHaveBeenCalledOnce();
    expect(onFile.mock.calls[0][0].data.size).toBe(6);
  });

  it("Uint8Array (ArrayBufferView) をバイナリチャンクとして受信できる", async () => {
    const receiver = new FileReceiver();
    const onFile = vi.fn();
    receiver.onFile(onFile);

    await receiver.handleMessage(
      JSON.stringify({ type: "file-meta", name: "view.bin", size: 4, mimeType: "application/octet-stream" }),
    );
    const view = new Uint8Array([10, 20, 30, 40]);
    await receiver.handleMessage(view);
    await receiver.handleMessage(JSON.stringify({ type: "file-end" }));

    expect(onFile).toHaveBeenCalledOnce();
    expect(onFile.mock.calls[0][0].data.size).toBe(4);
  });

  it("ArrayBufferView のサブレンジ（byteOffset 付き）でも正しく処理される", async () => {
    const receiver = new FileReceiver();
    const onProgress = vi.fn();
    receiver.onProgress(onProgress);

    await receiver.handleMessage(
      JSON.stringify({ type: "file-meta", name: "sub.bin", size: 3, mimeType: "application/octet-stream" }),
    );

    // 大きなバッファの途中だけを参照する TypedArray
    const base = new Uint8Array([0, 0, 10, 20, 30, 0, 0]);
    const sub = base.subarray(2, 5); // byteOffset=2, byteLength=3
    await receiver.handleMessage(sub);

    expect(onProgress).toHaveBeenCalledWith({ received: 3, total: 3 });
  });

  it("不正な JSON 文字列を受信すると onError が呼ばれる", async () => {
    const receiver = new FileReceiver();
    const onError = vi.fn();
    receiver.onError(onError);

    await receiver.handleMessage("this is not json{{{");

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(SyntaxError);
  });

  it("onError が未設定でも不正データで例外が外に漏れない", async () => {
    const receiver = new FileReceiver();
    // onError 未登録 ─ Promise が reject しないことを確認
    await expect(receiver.handleMessage("bad json")).resolves.toBeUndefined();
  });
});
