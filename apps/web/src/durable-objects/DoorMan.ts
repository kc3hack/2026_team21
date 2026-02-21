import { DurableObject } from "cloudflare:workers";
import type { WorkerEnv } from "@/app";

export class DoorMan extends DurableObject<WorkerEnv["Env"]> {}
