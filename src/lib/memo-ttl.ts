/**
 * Keeps one async result in module memory for `ttlMs`, shared by every
 * request a warm server instance handles (D-048). Used for lists that barely
 * change (terms, departments) so a page render doesn't refetch them.
 *
 * - Not Next's data cache: entries there count as ISR writes (D-044).
 * - Concurrent callers share one in-flight promise.
 * - Failures are not kept; the next call tries again.
 */
export function memoTtl<T>(
  load: () => Promise<T>,
  ttlMs: number,
  now: () => number = Date.now,
): () => Promise<T> {
  let value: { data: T; expires: number } | null = null;
  let pending: Promise<T> | null = null;

  return () => {
    if (value && now() < value.expires) return Promise.resolve(value.data);
    if (pending) return pending;
    pending = load().then(
      (data) => {
        value = { data, expires: now() + ttlMs };
        pending = null;
        return data;
      },
      (err: unknown) => {
        pending = null;
        throw err;
      },
    );
    return pending;
  };
}
