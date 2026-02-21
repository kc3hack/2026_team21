import { Layout } from "@/pages/layout";
import { RoomPage } from "@/pages/r";
import { renderer } from "@/pages/renderer";
import { Hono } from "hono";
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

app.route("/room", RoomPage);

export default app;
