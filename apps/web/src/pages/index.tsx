import { Hono } from "hono";
import { Layout } from "@/pages/layout";
import { generateSnowflakeId } from "@/lib/snowflake";
import { renderer } from "@/pages/renderer";
import { RoomPage } from "@/pages/r";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <Layout>
      <a href="/new">Create Room</a>
    </Layout>,
  );
});

app.get("/new", (c) => {
  const roomId = generateSnowflakeId();
  return c.redirect(`/r/${roomId}`, 302);
});

app.route("/r", RoomPage);

export default app;
