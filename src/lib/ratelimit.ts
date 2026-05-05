import { Redis } from "@upstash/redis";

const HOUR_SECONDS = 60 * 60;
const DEFAULT_LIMIT_PER_HOUR = 5;

let cachedRedis: Redis | null = null;
function getRedis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
};

export async function checkRateLimit(
  ip: string,
  bucket: string,
  limit: number = DEFAULT_LIMIT_PER_HOUR,
): Promise<RateLimitResult> {
  const r = getRedis();
  // No Upstash configured → don't block local dev.
  if (!r) {
    return { allowed: true, limit, remaining: limit, resetSeconds: HOUR_SECONDS };
  }

  const windowStart = Math.floor(Date.now() / 1000 / HOUR_SECONDS);
  const key = `rl:${bucket}:${ip}:${windowStart}`;

  const count = await r.incr(key);
  if (count === 1) {
    await r.expire(key, HOUR_SECONDS);
  }

  const remaining = Math.max(0, limit - count);
  const resetSeconds = HOUR_SECONDS - (Math.floor(Date.now() / 1000) % HOUR_SECONDS);

  return {
    allowed: count <= limit,
    limit,
    remaining,
    resetSeconds,
  };
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}
