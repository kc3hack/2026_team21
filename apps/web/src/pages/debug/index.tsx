import { Hono } from "hono";
import { Layout } from "@/pages/layout";

const app = new Hono();

app.get("/realtime", (c) => {
  const bindings = c.env as Record<string, unknown>;
  const turnUsername = typeof bindings.CF_TURN_USERNAME === "string" ? bindings.CF_TURN_USERNAME : "";
  const turnCredential = typeof bindings.CF_TURN_TOKEN === "string" ? bindings.CF_TURN_TOKEN : "";

  return c.render(
    <Layout>
      <section
        id="realtime-debug-page"
        class="realtime-debug-page"
        data-turn-username={turnUsername}
        data-turn-credential={turnCredential}
      >
        <h1>Realtime + File Transfer Debug</h1>
        <p>同じ roomId で 2 タブ接続すると、自動で WebRTC 接続しファイル送受信を試せます。</p>
        <ol class="realtime-debug-steps">
          <li>タブA/Bで同じ roomId を入力して Connect</li>
          <li>DataChannel Status が open になったら片方でファイルを選択して Send File</li>
          <li>もう片方で受信ファイルのダウンロードリンクが表示される</li>
        </ol>
        <div class="realtime-debug-grid">
          <div class="realtime-debug-panel">
            <h2>Connection</h2>
            <label class="realtime-debug-label" htmlFor="room-id">
              roomId
            </label>
            <input id="room-id" class="realtime-debug-input" value="debug-room" />
            <div class="realtime-debug-actions">
              <button type="button" id="connect-btn">
                Connect
              </button>
              <button type="button" id="disconnect-btn">
                Disconnect
              </button>
            </div>
            <p>
              WS Status: <strong id="ws-status">disconnected</strong>
            </p>
            <p>
              Peer Status: <strong id="peer-status">idle</strong>
            </p>
            <p>
              Role: <strong id="peer-role">none</strong>
            </p>
            <p>
              DataChannel Status: <strong id="dc-status">closed</strong>
            </p>
          </div>

          <div class="realtime-debug-panel">
            <h2>File Transfer</h2>
            <label class="realtime-debug-label" htmlFor="send-file">
              file
            </label>
            <input id="send-file" class="realtime-debug-input" type="file" />
            <div class="realtime-debug-actions">
              <button type="button" id="send-file-btn">
                Send File
              </button>
            </div>
            <p>
              Send Progress: <strong id="send-progress">0 / 0 bytes</strong>
            </p>
            <p>
              Receive Progress: <strong id="receive-progress">0 / 0 bytes</strong>
            </p>
            <h3>Received Files</h3>
            <ul id="received-files" class="realtime-debug-received-list" />
          </div>
        </div>

        <div class="realtime-debug-panel">
          <div class="realtime-debug-log-header">
            <h2>Event Log</h2>
            <button type="button" id="clear-log-btn">
              Clear
            </button>
          </div>
          <pre id="log-output" class="realtime-debug-log" />
        </div>
      </section>

      <style>{`
        .realtime-debug-page {
          max-width: 980px;
          margin: 2rem auto;
          padding: 0 1rem 2rem;
          color: #243226;
        }
        .realtime-debug-steps {
          margin: 0.75rem 0 1.2rem;
          padding-left: 1.1rem;
        }
        .realtime-debug-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        .realtime-debug-panel {
          background: #f1f7ee;
          border: 1px solid #b9cbb3;
          border-radius: 8px;
          padding: 1rem;
        }
        .realtime-debug-actions {
          display: flex;
          gap: 0.5rem;
          margin: 0.75rem 0;
        }
        .realtime-debug-label {
          display: block;
          margin: 0.75rem 0 0.25rem;
          font-weight: 700;
        }
        .realtime-debug-input,
        .realtime-debug-textarea {
          width: 100%;
          padding: 0.5rem 0.75rem;
          box-sizing: border-box;
          border: 1px solid #9cb294;
          border-radius: 6px;
          background: #fff;
          font-size: 0.95rem;
        }
        .realtime-debug-input[type="file"] {
          padding: 0.45rem;
        }
        .realtime-debug-textarea {
          resize: vertical;
          margin-bottom: 0.5rem;
        }
        .realtime-debug-received-list {
          margin: 0.5rem 0 0;
          padding-left: 1.1rem;
        }
        .realtime-debug-received-list li {
          margin-bottom: 0.4rem;
        }
        .realtime-debug-log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .realtime-debug-log {
          min-height: 240px;
          max-height: 460px;
          overflow: auto;
          margin: 0;
          padding: 0.75rem;
          border-radius: 6px;
          background: #1e2520;
          color: #d5ead4;
          font-size: 0.85rem;
          line-height: 1.5;
        }
        @media (min-width: 768px) {
          .realtime-debug-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <script type="module" src="/src/pages/debug/debug.client.ts"></script>
    </Layout>,
  );
});

export const DebugPage = app;
