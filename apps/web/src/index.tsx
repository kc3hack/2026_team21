import { Hono } from "hono";
import type { WorkerEnv } from "@/app";
import pages from "@/pages";
import api from "@/routes/api";

const app = new Hono<WorkerEnv>();

app.route("/api", api);
app.route("/", pages);

export { DoorMan } from "@/durable-objects/DoorMan";
export default app;
