/**
 * ForgeIQ High-Performance Database Query Cache & In-Flight Request Deduplicator
 * Implements Section 10, 11, 12 & 13:
 * - In-flight promise sharing (request deduplication prevents duplicate simultaneous DB calls)
 * - Safe TTL caching with freshness tracking (created_at, expires_at)
 * - Tagged invalidation on mutations (orders, inventory, machines, jobs)
 */

interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
  tag: string;
}

const cacheStore = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export interface QueryCacheOptions {
  ttlMs?: number;
  tag?: 'orders' | 'inventory' | 'machines' | 'jobs' | 'customers' | 'quotations' | 'static';
  bypassCache?: boolean;
}

/**
 * Executes a database query with in-flight deduplication and short-lived TTL caching.
 */
export async function cachedDbQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: QueryCacheOptions = {}
): Promise<T> {
  const { ttlMs = 3000, tag = 'static', bypassCache = false } = options;
  const now = Date.now();

  // 1. Return from cache if fresh
  if (!bypassCache && cacheStore.has(key)) {
    const entry = cacheStore.get(key)!;
    if (now < entry.expiresAt) {
      return entry.data;
    }
    cacheStore.delete(key);
  }

  // 2. In-flight request deduplication: If identical query is already running, share the promise
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  // 3. Dispatch fresh query
  const queryPromise = queryFn()
    .then((result) => {
      if (ttlMs > 0 && result !== undefined && result !== null) {
        cacheStore.set(key, {
          data: result,
          createdAt: now,
          expiresAt: now + ttlMs,
          tag,
        });
      }
      return result;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, queryPromise);
  return queryPromise;
}

/**
 * Invalidates cached queries associated with a mutated entity tag.
 */
export function invalidateDbCache(tag: 'orders' | 'inventory' | 'machines' | 'jobs' | 'customers' | 'quotations' | 'all') {
  if (tag === 'all') {
    cacheStore.clear();
    return;
  }
  for (const [key, entry] of cacheStore.entries()) {
    if (entry.tag === tag) {
      cacheStore.delete(key);
    }
  }
}
