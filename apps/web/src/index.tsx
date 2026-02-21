import { Hono } from "hono";
import type { WorkerEnv } from "@/app";
import pages from "@/pages";
import { AnimationTestPage } from "@/pages/test";
import api from "@/routes/api";

const app = new Hono<WorkerEnv>();

app.route("/api", api);
app.route("/test", AnimationTestPage);
app.route("/", pages);

export { DoorMan } from "@/durable-objects/DoorMan";
export default app;
