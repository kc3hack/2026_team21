import { Hono } from "hono";
import api from "@/routes/api";
import type { WorkerEnv } from "@/app";
import pages from "@/pages";

const app = new Hono<WorkerEnv>();

app.route("/api", api);
app.route("/", pages);

export { DoorMan } from "@/durable-objects/DoorMan";
export default app;
