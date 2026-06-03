/**
 * Tiny dependency-free in-memory sliding-window rate limiter.
 *
 * Scope & limitations: state lives in the function instance's memory, so it is
 * per-instance and resets on cold start. On Vercel (Fluid Compute) a burst of
 * requests to the same endpoint largely lands on the same warm instance(s),
 * so this is effective against scripted bursts — its purpose here is to stop a
 * single client from minting unlimited Stripe coupons via /api/newsletter.
 * It is NOT a substitute for a durable, cross-instance limiter.
 *
 * TODO(durable): move to Upstash Redis (@upstash/ratelimit) once provisioned
 * so limits hold across instances and a distributed/slow-drip attack is also
 * covered.
 */

interface Bucket {
  /** Hit timestamps (ms) within the current window, oldest first. */
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  /** Remaining allowed hits in the current window (0 when blocked). */
  remaining: number;
  /** ms until the window frees up at least one slot (0 when not blocked). */
  retryAfterMs: number;
}

/**
 * Records a hit for `key` and reports whether it is within `limit` per
 * `windowMs`. Call once per request.
 *
 * @param now  current time in ms — passed in so callers stay testable and so
 *             this module never calls Date.now() at import time.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number,
): RateLimitResult {
  const windowStart = now - windowMs;
  const bucket = buckets.get(key) ?? { hits: [] };

  // Drop hits that have aged out of the window.
  bucket.hits = bucket.hits.filter((t) => t > windowStart);

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0];
    return { ok: false, remaining: 0, retryAfterMs: Math.max(0, oldest + windowMs - now) };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);

  // Opportunistic cleanup so the Map doesn't grow unbounded on a long-lived
  // instance: prune empty buckets when we've accumulated a lot of keys.
  if (buckets.size > 5000) {
    buckets.forEach((b, k) => {
      if (b.hits.length === 0 || b.hits[b.hits.length - 1] <= windowStart) buckets.delete(k);
    });
  }

  return { ok: true, remaining: limit - bucket.hits.length, retryAfterMs: 0 };
}

/**
 * Best-effort client IP from proxy headers. Vercel sets `x-forwarded-for`
 * (client is the first entry). Falls back to a constant so the limiter still
 * applies a shared global bucket when no IP is available.
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
