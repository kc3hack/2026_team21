import { Hono } from "hono";
import { Page } from "@/pages/router";

export const RoomPageRoute = () => {
  const app = new Hono();

  app.get("/:roomId", (c) => {
    const roomId = c.req.param("roomId");

    return c.render(<Page id={"/room/:roomId"} roomId={roomId} />);
  });

  return app;
};

type Props = {
  roomId: string;
};

export const RoomPage = (props: Props) => {
  return (
    <div>
      <h1>Room Page</h1>
      <p>ここにファイル送信のUIが入る予定</p>
      <p>Room ID: {props.roomId}</p>
    </div>
  );
};
