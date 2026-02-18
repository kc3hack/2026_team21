import { Hono } from "hono";
import { Layout } from "@/pages/layout";
import { renderer } from "@/pages/renderer";
import { RoomPage } from "@/pages/room";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <Layout>
      <button type="button">Create Room</button>
    </Layout>,
  );
});

app.route("/room", RoomPage);

export default app;
