import { Hono } from "hono";
import { HomePage } from "@/components/pages";
import { CounterPageRoute } from "@/pages/counter";
import { DebugPage } from "@/pages/debug";
import { Layout } from "@/pages/layout";
import { RoomPage } from "@/pages/r";
import { renderer } from "@/pages/renderer";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => {
  return c.render(
    <Layout>
      <HomePage />
    </Layout>,
  );
});

app.route("/r", RoomPage);
app.route("/debug", DebugPage);
app.route("/counter", CounterPageRoute);

export default app;
