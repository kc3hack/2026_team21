import { Hono } from "hono";
import api from "@/pages/api";
import { CounterPageRoute } from "@/pages/counter";
import { DebugPage } from "@/pages/debug";
import { TopPageRoute } from "@/pages/index.page";
import { RoomPageRoute } from "@/pages/r";
import { renderer } from "@/pages/renderer";
import { AnimationTestPage } from "@/pages/test";

const app = new Hono();

app.use(renderer);

app.route("/", TopPageRoute());
app.route("/api", api);
app.route("/r", RoomPageRoute());
app.route("/debug", DebugPage);
app.route("/counter", CounterPageRoute);
app.route("/test", AnimationTestPage);

export default app;
