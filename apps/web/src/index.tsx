import { Hono } from "hono";
import type { WorkerEnv } from "@/app";
import pages from "@/pages";
import api from "@/routes/api";
import { AnimationTestPage } from "@/pages/test";

const app = new Hono<WorkerEnv>();

app.route("/api", api);
app.route("/test", AnimationTestPage);
app.route("/", pages);


export { DoorMan } from "@/durable-objects/DoorMan";
export default app;
