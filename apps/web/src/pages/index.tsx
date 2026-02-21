import { Hono } from "hono";
import { DebugPage } from "@/pages/debug";
import { Layout } from "@/pages/layout";
import { RoomPage } from "@/pages/r";
import { renderer } from "@/pages/renderer";
import { HomeClient } from "./HomeClient";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <Layout>
      <HomeClient />
    </Layout>,
  );
});

app.route("/r", RoomPage);
app.route("/debug", DebugPage);

export default app;
