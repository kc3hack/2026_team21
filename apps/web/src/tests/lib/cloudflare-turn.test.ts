import { afterEach, describe, expect, it, vi } from "vitest";
import { generateCloudflareTurnCredentials } from "@/lib/cloudflare-turn";

const createMockEnv = (): Pick<CloudflareBindings, "CF_TURN_KEY_ID" | "CF_TURN_TOKEN"> => ({
  CF_TURN_KEY_ID: "turn-key-id",
  CF_TURN_TOKEN: "turn-api-token",
});

describe("generateCloudflareTurnCredentials", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Cloudflare API から TURN 資格情報を取得する", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          iceServers: {
            urls: [
              "turn:turn.cloudflare.com:3478?transport=udp",
              "turn:turn.cloudflare.com:3478?transport=tcp",
              "turns:turn.cloudflare.com:5349?transport=tcp",
            ],
            username: "generated-username",
            credential: "generated-credential",
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });

    const result = await generateCloudflareTurnCredentials(createMockEnv(), {
      ttl: 900,
      fetchImpl,
    });

    expect(result).toEqual({
      iceServers: {
        urls: [
          "turn:turn.cloudflare.com:3478?transport=udp",
          "turn:turn.cloudflare.com:3478?transport=tcp",
          "turns:turn.cloudflare.com:5349?transport=tcp",
        ],
        username: "generated-username",
        credential: "generated-credential",
      },
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://rtc.live.cloudflare.com/v1/turn/keys/turn-key-id/credentials/generate",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer turn-api-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: 900 }),
      }),
    );
  });

  it("ttl 未指定時はデフォルト 86400 を使う", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          iceServers: {
            urls: ["turn:turn.cloudflare.com:3478?transport=udp"],
            username: "generated-username",
            credential: "generated-credential",
          },
        }),
        { status: 200 },
      );
    });

    await generateCloudflareTurnCredentials(createMockEnv(), { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ ttl: 86_400 }),
      }),
    );
  });

  it("必要な binding が不足していたらエラー", async () => {
    await expect(
      generateCloudflareTurnCredentials(
        {
          CF_TURN_KEY_ID: "",
          CF_TURN_TOKEN: "",
        },
        { fetchImpl: vi.fn() },
      ),
    ).rejects.toThrow("Missing required TURN bindings: CF_TURN_KEY_ID / CF_TURN_TOKEN");
  });

  it("Cloudflare のレスポンスが不正ならエラー", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ bad: "response" }), { status: 200 });
    });

    await expect(generateCloudflareTurnCredentials(createMockEnv(), { fetchImpl })).rejects.toThrow(
      "Invalid TURN credentials response from Cloudflare",
    );
  });
});
