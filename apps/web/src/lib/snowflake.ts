// Snowflake ID generator
// 64-bit IDs: 41 bits timestamp | 10 bits worker | 12 bits sequence
const EPOCH = 1740000000000n; // 2025-02-20T00:00:00.000Z (custom epoch)
const WORKER_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n;

let lastTimestamp = 0n;
let sequence = 0n;
const workerId = BigInt(Math.floor(Math.random() * 1024));

export function generateSnowflakeId(): string {
  let timestamp = BigInt(Date.now()) - EPOCH;

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & MAX_SEQUENCE;
    if (sequence === 0n) {
      // Move to the next logical millisecond instead of busy-waiting
      timestamp = lastTimestamp + 1n;
    }
  } else {
    sequence = 0n;
  }

  lastTimestamp = timestamp;

  const id =
    (timestamp << (WORKER_ID_BITS + SEQUENCE_BITS)) |
    (workerId << SEQUENCE_BITS) |
    sequence;

  return id.toString();
}
