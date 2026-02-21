import { Hono } from "hono";
import { useState } from "hono/jsx";
import { useQRCode } from "@/hooks/useQRCode";
import { Page } from "@/pages/router";

export const TopPageRoute = () => {
  const app = new Hono();
  app.get("/", (c) => c.render(<Page id="/" />));
  return app;
};

/**
 * 送信するボタンを押すと、QRコードを表示するモーダルが表示される。
 * この時データはまだ送信されない。
 */
export const TopPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const { ref: qrCodeRef } = useQRCode(url);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleCreateRoom = () => {
    void (async () => {
      // 部屋番号を生成する
      const response = await fetch("/api/rooms", { method: "POST" });
      if (!response.ok) {
        throw new Error(`Failed to create room: ${response.status}`);
      }
      const payload = (await response.json()) as { id?: unknown };
      if (typeof payload.id !== "string" || payload.id.length === 0) {
        throw new Error("Invalid room id response");
      }

      // URL を作る
      const uri = `${location.origin}/r/${encodeURIComponent(payload.id)}`;

      // モーダルを開く
      setUrl(uri);
      setIsOpen(true);
    })().catch((error) => {
      console.error(error);
    });
  };

  return (
    <div>
      <div>
        <h1>送りたいファイルを選ぶ</h1>
        <form>
          <input type="file" name="file" />
          <button type="button" onClick={handleCreateRoom}>
            送信する
          </button>
        </form>
      </div>

      {isOpen && (
        <div>
          <h2>QRコード</h2>
          <div ref={qrCodeRef} />
          <button type="button" onClick={toggleOpen}>
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
