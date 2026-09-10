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

  // 1. Return from cache if fresh, or serve stale while revalidating in background
  if (!bypassCache && cacheStore.has(key)) {
    const entry = cacheStore.get(key)!;
    if (now < entry.expiresAt) {
      return entry.data;
    }

    // Stale-While-Revalidate: serve cached data immediately, refresh asynchronously
    if (!inFlightRequests.has(key)) {
      const backgroundRefresh = queryFn()
        .then((result) => {
          if (ttlMs > 0 && result !== undefined && result !== null) {
            cacheStore.set(key, {
              data: result,
              createdAt: Date.now(),
              expiresAt: Date.now() + ttlMs,
              tag,
            });
          }
          return result;
        })
        .catch((err) => {
          console.warn(`[SWR Cache] Background revalidation failed for ${key}:`, err?.message);
          return entry.data;
        })
        .finally(() => {
          inFlightRequests.delete(key);
        });
      inFlightRequests.set(key, backgroundRefresh);
    }
    return entry.data;
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
 * Write-Through cache update: immediately updates cached orders list with newly created order
 */
export function appendOrderToCache(order: any) {
  const key = 'api:orders:list';
  const entry = cacheStore.get(key);
  const now = Date.now();
  if (entry && Array.isArray(entry.data)) {
    // Prepend order if not already present
    if (!entry.data.some((o: any) => o.id === order.id || o.orderNumber === order.orderNumber)) {
      entry.data = [order, ...entry.data];
    }
    entry.expiresAt = Math.max(entry.expiresAt, now + 5000);
  } else {
    cacheStore.set(key, {
      data: [order],
      createdAt: now,
      expiresAt: now + 5000,
      tag: 'orders',
    });
  }
}

// Invalidation throttles to prevent stampedes under continuous write streams
const lastInvalidationTime = new Map<string, number>();

/**
 * Invalidates cached queries associated with a mutated entity tag with stampede throttling.
 */
export function invalidateDbCache(
  tag: 'orders' | 'inventory' | 'machines' | 'jobs' | 'customers' | 'quotations' | 'all',
  force = false
) {
  if (tag === 'all') {
    cacheStore.clear();
    return;
  }

  const now = Date.now();
  const lastTime = lastInvalidationTime.get(tag) || 0;
  // Under concurrent write bursts, allow at most one invalidation every 2.5 seconds
  if (!force && now - lastTime < 2500) {
    return;
  }
  lastInvalidationTime.set(tag, now);

  for (const [, entry] of cacheStore.entries()) {
    if (entry.tag === tag) {
      entry.expiresAt = now; // Soft invalidation: trigger background refresh while continuing to serve readers instantly
    }
  }
}
