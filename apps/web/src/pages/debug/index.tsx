import { Hono } from "hono";
import { Layout } from "@/pages/layout";

const app = new Hono();

app.get("/realtime", (c) => {
  const bindings = c.env as Record<string, unknown>;
  const turnUsername =
    typeof bindings.CF_TURN_USERNAME === "string" ? bindings.CF_TURN_USERNAME : "";
  const turnCredential = typeof bindings.CF_TURN_TOKEN === "string" ? bindings.CF_TURN_TOKEN : "";

  return c.render(
    <Layout>
      <section class="realtime-debug-page">
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

      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for client side debug tool
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const CHUNK_SIZE = 16 * 1024;
              const turnUsername = ${JSON.stringify(turnUsername)};
              const turnCredential = ${JSON.stringify(turnCredential)};
              const iceServers = [{ urls: "stun:stun.cloudflare.com:3478" }];

              if (turnUsername && turnCredential) {
                iceServers.push(
                  {
                    urls: "turn:turn.cloudflare.com:3478?transport=udp",
                    username: turnUsername,
                    credential: turnCredential,
                  },
                  {
                    urls: "turn:turn.cloudflare.com:3478?transport=tcp",
                    username: turnUsername,
                    credential: turnCredential,
                  },
                  {
                    urls: "turns:turn.cloudflare.com:5349?transport=tcp",
                    username: turnUsername,
                    credential: turnCredential,
                  }
                );
              }

              const roomInput = document.getElementById("room-id");
              const connectBtn = document.getElementById("connect-btn");
              const disconnectBtn = document.getElementById("disconnect-btn");
              const sendFileBtn = document.getElementById("send-file-btn");
              const sendFileInput = document.getElementById("send-file");
              const clearLogBtn = document.getElementById("clear-log-btn");
              const wsStatus = document.getElementById("ws-status");
              const peerStatus = document.getElementById("peer-status");
              const peerRole = document.getElementById("peer-role");
              const dcStatus = document.getElementById("dc-status");
              const sendProgress = document.getElementById("send-progress");
              const receiveProgress = document.getElementById("receive-progress");
              const receivedFiles = document.getElementById("received-files");
              const logOutput = document.getElementById("log-output");

              let ws = null;
              let pc = null;
              let dataChannel = null;
              let sending = false;
              let incomingFile = null;

              const appendLog = (label, payload) => {
                const now = new Date().toLocaleTimeString();
                const formattedPayload =
                  payload === undefined
                    ? ""
                    : " " + (typeof payload === "string" ? payload : JSON.stringify(payload));
                const line = "[" + now + "] " + label + formattedPayload;
                logOutput.textContent += line + "\\n";
                logOutput.scrollTop = logOutput.scrollHeight;
              };

              const setWsStatus = (next) => {
                wsStatus.textContent = next;
              };

              const setPeerStatus = (next) => {
                peerStatus.textContent = next;
              };

              const setPeerRole = (next) => {
                peerRole.textContent = next;
              };

              const setDataChannelStatus = (next) => {
                dcStatus.textContent = next;
              };

              const resetProgress = () => {
                sendProgress.textContent = "0 / 0 bytes";
                receiveProgress.textContent = "0 / 0 bytes";
              };

              const getSignalUrl = (roomId) => {
                const protocol = location.protocol === "https:" ? "wss:" : "ws:";
                return protocol + "//" + location.host + "/ws/" + encodeURIComponent(roomId);
              };

              const sendSignal = (message) => {
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                  appendLog("signal-send-skipped", "websocket is not open");
                  return;
                }
                ws.send(JSON.stringify(message));
                appendLog("signal-send", message);
              };

              const createPeerConnection = () => {
                if (pc) {
                  pc.close();
                }
                pc = new RTCPeerConnection({
                  iceServers,
                });
                appendLog("ice-servers", iceServers.map((server) => server.urls));
                if (!turnUsername || !turnCredential) {
                  appendLog("turn-config-missing", "CF_TURN_USERNAME / CF_TURN_TOKEN");
                }

                pc.onicecandidate = (event) => {
                  if (event.candidate) {
                    sendSignal({
                      type: "candidate",
                      candidate: event.candidate.toJSON(),
                    });
                  }
                };
                pc.onicecandidateerror = (event) => {
                  appendLog("ice-candidate-error", {
                    address: event.address,
                    url: event.url,
                    errorCode: event.errorCode,
                    errorText: event.errorText,
                  });
                };
                pc.oniceconnectionstatechange = () => {
                  appendLog("ice-state", pc.iceConnectionState);
                };
                pc.onicegatheringstatechange = () => {
                  appendLog("ice-gathering", pc.iceGatheringState);
                };

                pc.ondatachannel = (event) => {
                  appendLog("datachannel-received", event.channel.label);
                  bindDataChannel(event.channel);
                };

                pc.onconnectionstatechange = () => {
                  setPeerStatus(pc.connectionState);
                  appendLog("peer-state", pc.connectionState);
                  if (pc.connectionState === "failed" || pc.connectionState === "disconnected" || pc.connectionState === "closed") {
                    cleanupPeerConnection();
                  }
                };

                setPeerStatus("connecting");
                return pc;
              };

              const bindDataChannel = (channel) => {
                dataChannel = channel;
                dataChannel.binaryType = "arraybuffer";
                setDataChannelStatus(dataChannel.readyState);

                dataChannel.onopen = () => {
                  setDataChannelStatus("open");
                  appendLog("datachannel-open");
                };

                dataChannel.onclose = () => {
                  setDataChannelStatus("closed");
                  appendLog("datachannel-close");
                };

                dataChannel.onerror = () => {
                  appendLog("datachannel-error");
                };

                dataChannel.onmessage = (event) => {
                  void handleDataMessage(event.data);
                };
              };

              const cleanupPeerConnection = () => {
                if (dataChannel) {
                  try {
                    dataChannel.close();
                  } catch {
                    // noop
                  }
                }
                dataChannel = null;
                if (pc) {
                  try {
                    pc.close();
                  } catch {
                    // noop
                  }
                }
                pc = null;
                incomingFile = null;
                setPeerStatus("idle");
                setPeerRole("none");
                setDataChannelStatus("closed");
                resetProgress();
              };

              const createOffer = async () => {
                try {
                  const peer = createPeerConnection();
                  setPeerRole("offerer");
                  const channel = peer.createDataChannel("file-transfer");
                  bindDataChannel(channel);

                  const offer = await peer.createOffer();
                  await peer.setLocalDescription(offer);
                  if (!peer.localDescription || !peer.localDescription.sdp) {
                    throw new Error("failed to create offer");
                  }
                  sendSignal({ type: "offer", sdp: peer.localDescription.sdp });
                  appendLog("offer-sent");
                } catch (error) {
                  appendLog("offer-error", String(error));
                  cleanupPeerConnection();
                }
              };

              const handleOffer = async (sdp) => {
                try {
                  const peer = createPeerConnection();
                  setPeerRole("answerer");
                  await peer.setRemoteDescription({ type: "offer", sdp: sdp });

                  const answer = await peer.createAnswer();
                  await peer.setLocalDescription(answer);
                  if (!peer.localDescription || !peer.localDescription.sdp) {
                    throw new Error("failed to create answer");
                  }
                  sendSignal({ type: "answer", sdp: peer.localDescription.sdp });
                  appendLog("answer-sent");
                } catch (error) {
                  appendLog("handle-offer-error", String(error));
                  cleanupPeerConnection();
                }
              };

              const handleAnswer = async (sdp) => {
                if (!pc) {
                  appendLog("answer-skipped", "peer connection does not exist");
                  return;
                }
                try {
                  await pc.setRemoteDescription({ type: "answer", sdp: sdp });
                  appendLog("answer-applied");
                } catch (error) {
                  appendLog("handle-answer-error", String(error));
                }
              };

              const handleCandidate = async (candidate) => {
                if (!pc) {
                  appendLog("candidate-skipped", "peer connection does not exist");
                  return;
                }
                try {
                  await pc.addIceCandidate(candidate);
                } catch (error) {
                  appendLog("candidate-error", String(error));
                }
              };

              const toArrayBuffer = async (data) => {
                if (data instanceof ArrayBuffer) {
                  return data;
                }
                if (data instanceof Blob) {
                  return await data.arrayBuffer();
                }
                if (ArrayBuffer.isView(data)) {
                  const copy = new ArrayBuffer(data.byteLength);
                  new Uint8Array(copy).set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
                  return copy;
                }
                throw new Error("unexpected binary data");
              };

              const addReceivedFile = (name, blob) => {
                const url = URL.createObjectURL(blob);
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = url;
                a.download = name;
                a.textContent = name + " (" + blob.size + " bytes)";
                li.appendChild(a);
                receivedFiles.prepend(li);
              };

              const handleDataMessage = async (data) => {
                if (typeof data === "string") {
                  let message;
                  try {
                    message = JSON.parse(data);
                  } catch {
                    appendLog("data-text", data);
                    return;
                  }

                  if (message.type === "file-meta") {
                    incomingFile = {
                      name: message.name,
                      size: message.size,
                      mimeType: message.mimeType || "application/octet-stream",
                      chunks: [],
                      received: 0,
                    };
                    receiveProgress.textContent = "0 / " + message.size + " bytes";
                    appendLog("file-meta-recv", { name: message.name, size: message.size });
                    return;
                  }

                  if (message.type === "file-end") {
                    if (!incomingFile) {
                      appendLog("file-end-ignored", "no current file");
                      return;
                    }
                    const blob = new Blob(incomingFile.chunks, { type: incomingFile.mimeType });
                    addReceivedFile(incomingFile.name, blob);
                    appendLog("file-complete", { name: incomingFile.name, size: blob.size });
                    incomingFile = null;
                    return;
                  }

                  appendLog("data-message", message);
                  return;
                }

                if (!incomingFile) {
                  appendLog("binary-ignored", "file-meta not received yet");
                  return;
                }

                const buffer = await toArrayBuffer(data);
                incomingFile.chunks.push(buffer);
                incomingFile.received += buffer.byteLength;
                receiveProgress.textContent = incomingFile.received + " / " + incomingFile.size + " bytes";
              };

              const sendSelectedFile = async () => {
                if (sending) {
                  appendLog("send-skipped", "already sending");
                  return;
                }
                if (!dataChannel || dataChannel.readyState !== "open") {
                  appendLog("send-skipped", "datachannel is not open");
                  return;
                }
                const file = sendFileInput.files && sendFileInput.files[0];
                if (!file) {
                  appendLog("send-skipped", "select a file");
                  return;
                }

                sending = true;
                try {
                  dataChannel.send(JSON.stringify({
                    type: "file-meta",
                    name: file.name,
                    size: file.size,
                    mimeType: file.type || "application/octet-stream",
                  }));

                  let offset = 0;
                  while (offset < file.size) {
                    const end = Math.min(offset + CHUNK_SIZE, file.size);
                    const chunk = await file.slice(offset, end).arrayBuffer();
                    dataChannel.send(chunk);
                    offset = end;
                    sendProgress.textContent = offset + " / " + file.size + " bytes";
                  }

                  dataChannel.send(JSON.stringify({ type: "file-end" }));
                  appendLog("file-sent", { name: file.name, size: file.size });
                } catch (error) {
                  appendLog("send-file-error", String(error));
                } finally {
                  sending = false;
                }
              };

              const connect = () => {
                const roomId = (roomInput.value || "").trim();
                if (!roomId) {
                  appendLog("connect-failed", "roomId is required");
                  return;
                }

                if (ws) {
                  ws.close(1000, "reconnect");
                  ws = null;
                }
                cleanupPeerConnection();

                const url = getSignalUrl(roomId);
                ws = new WebSocket(url);
                setWsStatus("connecting");
                appendLog("connecting", url);

                ws.addEventListener("open", () => {
                  setWsStatus("connected");
                  appendLog("connected");
                });

                ws.addEventListener("message", (event) => {
                  let message = event.data;
                  try {
                    message = JSON.parse(event.data);
                  } catch {
                    appendLog("signal-parse-error", event.data);
                    return;
                  }

                  appendLog("signal-recv", message);
                  switch (message.type) {
                    case "peer-joined":
                      void createOffer();
                      break;
                    case "offer":
                      void handleOffer(message.sdp);
                      break;
                    case "answer":
                      void handleAnswer(message.sdp);
                      break;
                    case "candidate":
                      void handleCandidate(message.candidate);
                      break;
                    case "peer-left":
                      cleanupPeerConnection();
                      setPeerStatus("peer-left");
                      break;
                    case "room-full":
                      appendLog("room-full");
                      break;
                  }
                });

                ws.addEventListener("close", (event) => {
                  appendLog("closed", { code: event.code, reason: event.reason, wasClean: event.wasClean });
                  setWsStatus("disconnected");
                  ws = null;
                  cleanupPeerConnection();
                });

                ws.addEventListener("error", () => {
                  appendLog("error");
                });
              };

              const disconnect = () => {
                if (!ws) {
                  appendLog("disconnect-skipped", "no connection");
                  return;
                }
                ws.close(1000, "manual disconnect");
              };

              connectBtn.addEventListener("click", connect);
              disconnectBtn.addEventListener("click", disconnect);
              sendFileBtn.addEventListener("click", () => {
                void sendSelectedFile();
              });

              clearLogBtn.addEventListener("click", () => {
                logOutput.textContent = "";
              });

              const params = new URLSearchParams(location.search);
              const roomFromQuery = params.get("room");
              if (roomFromQuery) {
                roomInput.value = roomFromQuery;
              }

              resetProgress();
            })();
          `,
        }}
      />
    </Layout>,
  );
});

export const DebugPage = app;
