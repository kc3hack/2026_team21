import { afterEach, describe, expect, it, vi } from "vitest";
import { createShortcodeForRoom, getShortcodeFromSnowflakeId, getSnowflakeIdFromShortcode } from "@/lib/room-shortcode";
import { generateSnowflakeId } from "@/lib/snowflake";

type KvState = Record<string, string>;

function createMockKv(initialState: KvState = {}) {
  const store = new Map<string, string>(Object.entries(initialState));

  const get = vi.fn(async (key: string) => {
    return store.get(key) ?? null;
  });

  const put = vi.fn(async (key: string, value: string) => {
    store.set(key, value);
  });

  const kv = {
    get,
    put,
  } as unknown as KVNamespace;

  return { kv, get, put, store };
}

function mockRandomUint32Values(values: number[]) {
  return vi.spyOn(globalThis.crypto, "getRandomValues").mockImplementation((array) => {
    if (!(array instanceof Uint32Array)) {
      throw new Error("Expected Uint32Array");
    }
    array[0] = values.shift() ?? 0;
    return array;
  });
}

describe("room-shortcode", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("6桁の short code を生成する", async () => {
    const { kv } = createMockKv();
    const snowflakeId = generateSnowflakeId();

    const shortcode = await createShortcodeForRoom(kv, snowflakeId);
    expect(shortcode).toMatch(/^\d{6}$/);
  });

  it("既存マッピングがあればその short code を返す", async () => {
    const snowflakeId = "1234567890123";
    const { kv, put } = createMockKv({
      [`snowflake:${snowflakeId}`]: "654321",
    });

    const shortcode = await createShortcodeForRoom(kv, snowflakeId);

    expect(shortcode).toBe("654321");
    expect(put).not.toHaveBeenCalled();
  });

  it("新規作成時は双方向マッピングを TTL 付きで保存する", async () => {
    const snowflakeId = "9876543210000";
    const randomSpy = mockRandomUint32Values([0]);
    const { kv, put, store } = createMockKv();

    const shortcode = await createShortcodeForRoom(kv, snowflakeId);

    expect(shortcode).toBe("100000");
    expect(randomSpy).toHaveBeenCalledTimes(1);
    expect(put).toHaveBeenCalledTimes(2);
    expect(put).toHaveBeenCalledWith(`snowflake:${snowflakeId}`, "100000", { expirationTtl: 600 });
    expect(put).toHaveBeenCalledWith("shortcode:100000", snowflakeId, { expirationTtl: 600 });
    expect(store.get(`snowflake:${snowflakeId}`)).toBe("100000");
    expect(store.get("shortcode:100000")).toBe(snowflakeId);
  });

  it("short code が重複した場合は再試行して別コードを採用する", async () => {
    const snowflakeId = "2222222222222";
    mockRandomUint32Values([0, 0x80000000]);
    const { kv } = createMockKv({
      "shortcode:100000": "already-used-room",
    });

    const shortcode = await createShortcodeForRoom(kv, snowflakeId);

    expect(shortcode).toBe("550000");
  });

  it("重複が続いて上限回数に達したらエラー", async () => {
    const snowflakeId = "3333333333333";
    mockRandomUint32Values(new Array<number>(10).fill(0));
    const { kv } = createMockKv({
      "shortcode:100000": "always-collide",
    });

    await expect(createShortcodeForRoom(kv, snowflakeId)).rejects.toThrow(
      "Failed to generate unique shortcode after 10 retries",
    );
  });

  it("short code から snowflake ID を取得できる", async () => {
    const { kv } = createMockKv({
      "shortcode:123456": "4444444444444",
    });

    await expect(getSnowflakeIdFromShortcode(kv, "123456")).resolves.toBe("4444444444444");
    await expect(getSnowflakeIdFromShortcode(kv, "999999")).resolves.toBeNull();
  });

  it("snowflake ID から short code を取得できる", async () => {
    const { kv } = createMockKv({
      "snowflake:5555555555555": "246810",
    });

    await expect(getShortcodeFromSnowflakeId(kv, "5555555555555")).resolves.toBe("246810");
    await expect(getShortcodeFromSnowflakeId(kv, "0000000000000")).resolves.toBeNull();
  });
});
