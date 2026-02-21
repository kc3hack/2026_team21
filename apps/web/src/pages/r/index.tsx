import { Hono } from "hono";
import { RoomClient } from "./RoomClient";

const app = new Hono();

app.get("/:roomId", (c) => {
  const currentPath = c.req.path;
  const roomId = c.req.param("roomId");

  return c.render(<RoomClient currentPath={currentPath} roomId={roomId} />);
});

export const RoomPage = app;
