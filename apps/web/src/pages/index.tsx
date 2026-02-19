import { Hono } from "hono";
import { generateSnowflakeId } from "@/lib/snowflake";
import { Layout } from "@/pages/layout";
import { RoomPage } from "@/pages/r";
import { renderer } from "@/pages/renderer";

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
