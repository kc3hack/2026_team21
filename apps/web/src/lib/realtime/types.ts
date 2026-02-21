/** クライアントからシグナリングサーバーへ送信するメッセージ */
export type ClientMessage =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "candidate"; candidate: RTCIceCandidateInit };

/** シグナリングサーバーからクライアントへ送信するメッセージ */
export type ServerMessage =
  | { type: "offer"; sdp: string }
  | { type: "answer"; sdp: string }
  | { type: "candidate"; candidate: RTCIceCandidateInit }
  | { type: "room-full" }
  | { type: "peer-joined" }
  | { type: "peer-left" };

/** DataChannel上のファイル転送制御メッセージ */
export type FileTransferMessage =
  | { type: "file-meta"; name: string; size: number; mimeType: string }
  | { type: "file-end" };
