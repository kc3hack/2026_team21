import { Hono } from "hono";
import type { WorkerEnv } from "@/app";
import { HomePage } from "@/components/pages";
import { DebugPage } from "@/pages/debug";
import { Layout } from "@/pages/layout";
import { RoomPage } from "@/pages/r";
import { renderer } from "@/pages/renderer";

const app = new Hono<WorkerEnv>();

app.use(renderer);

app.get("/ws/:roomId", (c) => {
  const roomId = c.req.param("roomId");
  const id = c.env.DOORMAN.idFromName(roomId);
  const stub = c.env.DOORMAN.get(id);
  return stub.fetch(c.req.raw);
});

app.get("/", (c) => {
  return c.render(
    <Layout>
      <HomePage />
    </Layout>,
  );
});

app.route("/r", RoomPage);
app.route("/debug", DebugPage);

export default app;
