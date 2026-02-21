import { Hono } from "hono";
import { ShortCodeForm } from "@/components/input";
import { useFileSenderConnection } from "@/hooks/useFileSenderConnection";
import { useQRCode } from "@/hooks/useQRCode";
import { apiClient } from "@/pages/api/index.client";
import { Page } from "@/pages/router";

export const TopPageRoute = () => {
  const app = new Hono();
  app.get("/", (c) => c.render(<Page id="/" />));
  return app;
};

/**
 * 送信するボタンを押すとルームを作成し、接続を開始する。
 * 受信側が入室して DataChannel が open になったら、選択済みファイルを自動送信する。
 */
export const TopPage = () => {
  const {
    isOpen,
    roomId,
    url,
    wsStatus,
    peerStatus,
    peerRole,
    dataChannelStatus,
    sendProgress,
    lastSentFile,
    errorMessage,
    fileInputRef,
    shortcode,
    toggleOpen,
    handleCreateRoom,
  } = useFileSenderConnection();
  const { ref: qrCodeRef } = useQRCode(url);

  const findRoomIdByShortCode = async (shortcode: string) => {
    const validate = await apiClient.rooms[":shortcode"].$get({ param: { shortcode } });
    if (validate.ok) {
      const { id, shortcode } = await validate.json();
      console.log("Found room", id, shortcode);
      return id;
    } else {
      throw new Error("Invalid shortcode");
    }
  };

  return (
    <div>
      <div>
        <h1>送りたいファイルを選ぶ</h1>
        <form>
          <input ref={fileInputRef} type="file" name="file" />
          <button type="button" onClick={handleCreateRoom}>
            送信する
          </button>
        </form>
        {roomId && (
          <p>
            Room ID: <strong>{roomId}</strong>
          </p>
        )}
        <p>
          WS Status: <strong>{wsStatus}</strong>
        </p>
        <p>
          Peer Status: <strong>{peerStatus}</strong>
        </p>
        <p>
          Role: <strong>{peerRole}</strong>
        </p>
        <p>
          DataChannel Status: <strong>{dataChannelStatus}</strong>
        </p>
        <p>
          Send Progress: <strong>{sendProgress}</strong>
        </p>
        {lastSentFile && (
          <p>
            Last Sent: <strong>{lastSentFile}</strong>
          </p>
        )}
        {errorMessage && (
          <p>
            Error: <strong>{errorMessage}</strong>
          </p>
        )}
      </div>

      {isOpen && (
        <div>
          <h2>QRコード</h2>
          <div ref={qrCodeRef} />
          <div>Shortcode: {shortcode}</div>
          <button type="button" onClick={toggleOpen}>
            閉じる
          </button>
        </div>
      )}

      <ShortCodeForm
        onSubmit={async (shortcode) => {
          try {
            const roomId = await findRoomIdByShortCode(shortcode);
            window.location.href = `${window.location.origin}/r/${encodeURIComponent(roomId)}`;
          } catch (error) {
            console.error(error);
            alert("無効なショートコードです");
          }
        }}
      />
    </div>
  );
};
