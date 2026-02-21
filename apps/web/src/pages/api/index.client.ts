import { hc } from "hono/client";
import type app from "@/pages/api";

const client = hc<typeof app>("/api");

export const apiClient = client;
