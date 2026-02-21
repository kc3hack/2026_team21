import { Hono } from "hono";
import { CounterPageRoute } from "@/pages/counter";
import { DebugPage } from "@/pages/debug";
import { RoomPage } from "@/pages/r";
import { renderer } from "@/pages/renderer";
import { Page } from "@/pages/router";

const app = new Hono();

app.use(renderer);

app.get("/", (c) => c.render(<Page id="/" />));
app.route("/r", RoomPage);
app.route("/debug", DebugPage);
app.route("/counter", CounterPageRoute);

export default app;
