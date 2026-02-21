import { Hono } from "hono";
import { Layout } from "@/pages/layout";
import { RoomClient } from "./RoomClient";

const app = new Hono();

app.get("/:roomId", (c) => {
  const currentPath = c.req.path;
  const roomId = c.req.param("roomId");

  return c.render(
    <Layout>
      <RoomClient currentPath={currentPath} roomId={roomId} />
    </Layout>,
  );
});

export const RoomPage = app;
