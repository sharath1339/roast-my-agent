import { Redis } from "@upstash/redis";
import type { Roast } from "./claude";

export type StoredRoast = {
  id: string;
  roast: Roast;
  language?: string;
  preview: string;
  createdAt: number;
};

let cachedRedis: Redis | null = null;
function getRedis(): Redis | null {
  if (cachedRedis) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  cachedRedis = new Redis({ url, token });
  return cachedRedis;
}

// Per-process fallback so local dev works without Upstash.
const memory = new Map<string, StoredRoast>();
const TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export async function saveRoast(stored: StoredRoast): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(`roast:${stored.id}`, stored, { ex: TTL_SECONDS });
    return;
  }
  memory.set(stored.id, stored);
}

export async function getRoast(id: string): Promise<StoredRoast | null> {
  const r = getRedis();
  if (r) {
    return (await r.get<StoredRoast>(`roast:${id}`)) ?? null;
  }
  return memory.get(id) ?? null;
}

export function newId(): string {
  // ~10 chars, URL-safe. Plenty of entropy at this scale.
  return crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}
