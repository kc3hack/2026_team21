/**
 * Room ID（Snowflake ID）と6桁の数字を相互変換するユーティリティ
 * Cloudflare KVを使って15分間の短期マッピングを管理
 */

const SHORTCODE_TTL = 10 * 60; // 15分（秒単位）
const MAX_RETRIES = 10; // 重複時の最大リトライ回数

/**
 * 6桁のランダムな数字を生成。
 * 生成時点では衝突の可能性があることに注意すること。
 * Math.random() で偏りがあるが、用途が短期間かつリトライがあるので許容する。
 */
function generateSixDigitCode(): string {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Snowflake IDから6桁の数字を生成してKVに保存
 * 重複が発生した場合は別の数字で再試行
 */
export async function createShortcodeForRoom(kv: KVNamespace, snowflakeId: string): Promise<string> {
  // 既存のマッピングがあればそれを返す
  const existingShortcode = await kv.get(`snowflake:${snowflakeId}`);
  if (existingShortcode) {
    return existingShortcode;
  }

  // 新しい6桁コードを生成（重複チェック付き）
  for (let i = 0; i < MAX_RETRIES; i++) {
    const shortcode = generateSixDigitCode();

    // 既に使用されているかチェック
    const existingSnowflake = await kv.get(`shortcode:${shortcode}`);
    if (existingSnowflake) {
      // 重複している場合は次のループでリトライ
      continue;
    }

    // 双方向マッピングを保存
    await Promise.all([
      kv.put(`snowflake:${snowflakeId}`, shortcode, { expirationTtl: SHORTCODE_TTL }),
      kv.put(`shortcode:${shortcode}`, snowflakeId, { expirationTtl: SHORTCODE_TTL }),
    ]);

    return shortcode;
  }

  throw new Error(`Failed to generate unique shortcode after ${MAX_RETRIES} retries`);
}

export async function touchShortcode(kv: KVNamespace, snowflakeId: string): Promise<void> {
  const shortcode = await getShortcodeFromSnowflakeId(kv, snowflakeId);
  if (shortcode) {
    // 既存のマッピングを更新してTTLをリセット
    await Promise.all([
      kv.put(`snowflake:${snowflakeId}`, shortcode, { expirationTtl: SHORTCODE_TTL }),
      kv.put(`shortcode:${shortcode}`, snowflakeId, { expirationTtl: SHORTCODE_TTL }),
    ]);
  }
}

/**
 * 6桁の数字からSnowflake IDを取得
 */
export async function getSnowflakeIdFromShortcode(kv: KVNamespace, shortcode: string): Promise<string | null> {
  return await kv.get(`shortcode:${shortcode}`);
}

/**
 * Snowflake IDから6桁の数字を取得
 */
export async function getShortcodeFromSnowflakeId(kv: KVNamespace, snowflakeId: string): Promise<string | null> {
  return await kv.get(`snowflake:${snowflakeId}`);
}
