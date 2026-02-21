import { Hono } from "hono";
import type { WorkerEnv } from "@/app";
import { generateCloudflareTurnCredentials } from "@/lib/cloudflare-turn";
import { generateSnowflakeId } from "@/lib/snowflake";
import { createShortcodeForRoom, getSnowflakeIdFromShortcode } from "@/lib/room-shortcode";

const app = new Hono<WorkerEnv>();

app.get("/ws/:roomId", (c) => {
  const roomId = c.req.param("roomId");
  const id = c.env.DOORMAN.idFromName(roomId);
  const stub = c.env.DOORMAN.get(id);
  return stub.fetch(c.req.raw);
});

app.post("/rooms", async (c) => {
  const id = generateSnowflakeId();
  const shortcode = await createShortcodeForRoom(c.env.ROOM_MAPPING_KV, id);
  return c.json({ id, shortcode });
});

app.get("/rooms/:shortcode", async (c) => {
  const shortcode = c.req.param("shortcode");

  // 6桁の数字かチェック
  if (!/^\d{6}$/.test(shortcode)) {
    return c.json({ error: "Invalid shortcode format" }, 400);
  }

  const snowflakeId = await getSnowflakeIdFromShortcode(c.env.ROOM_MAPPING_KV, shortcode);

  if (!snowflakeId) {
    return c.json({ error: "Room not found or expired" }, 404);
  }

  return c.json({ id: snowflakeId, shortcode });
});

app.post("/turn/credentials", async (c) => {
  let ttl: number | undefined;
  const body = await c.req.json<{ ttl?: unknown }>().catch(() => null);
  if (typeof body?.ttl === "number" && Number.isFinite(body.ttl) && body.ttl > 0) {
    ttl = body.ttl;
  }

  try {
    const credentials = await generateCloudflareTurnCredentials(c.env, { ttl });
    return c.json(credentials);
  } catch (error) {
    console.error("Failed to generate TURN credentials:", error);
    return c.json({ error: "Failed to generate TURN credentials" }, 500);
  }
});

app.post("/rooms/:roomId/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const backTo = formData.get("back_to");
  const roomId = c.req.param("roomId");

  if (file instanceof File) {
    console.log(file);
  }

  return c.redirect(backTo?.toString() || `/r/${encodeURIComponent(roomId)}`);
});

export default app;
