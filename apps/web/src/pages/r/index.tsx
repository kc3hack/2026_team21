import { Hono } from "hono";
import { useWebRTCConnection } from "@/hooks/useWebRTCConnection";
import { Page } from "@/pages/router";

export const RoomPageRoute = () => {
  const app = new Hono();

  app.get("/:roomId", (c) => {
    const roomId = c.req.param("roomId");

    return c.render(<Page id={"/room/:roomId"} roomId={roomId} />);
  });

  return app;
};

type Props = { roomId: string };

export const RoomPage = (props: Props) => {
  const { wsStatus, peerStatus, peerRole, dataChannelStatus, receiveProgress, lastReceivedFile, errorMessage } =
    useWebRTCConnection(props.roomId);

  return (
    <div>
      <h1>Room Page</h1>
      <p>ここにファイル送信のUIが入る予定</p>
      <p>Room ID: {props.roomId}</p>
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
        Receive Progress: <strong>{receiveProgress}</strong>
      </p>
      {lastReceivedFile && (
        <p>
          Last Downloaded: <strong>{lastReceivedFile}</strong>
        </p>
      )}
      {errorMessage && (
        <p>
          Error: <strong>{errorMessage}</strong>
        </p>
      )}
    </div>
  );
};
