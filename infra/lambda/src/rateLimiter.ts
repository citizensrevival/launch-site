/**
 * Per-IP sliding-window limit, held in the execution environment's memory.
 *
 * This is deliberately not distributed. Lambda may run several containers at
 * once, so a determined attacker can exceed the limit by a factor of the
 * container count -- the real backstop against a flood is the function's
 * reserved concurrency, set at deploy time. This exists to stop the ordinary
 * case: one script hammering the endpoint on a warm container.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  public constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  /** True if the request is allowed; records it. False if the caller is over the limit. */
  public tryConsume(key: string, now: number): boolean {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

    if (recent.length >= this.maxRequests) {
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.prune(cutoff);
    return true;
  }

  /** Drop keys with no activity in the window so a long-lived container cannot grow without bound. */
  private prune(cutoff: number): void {
    for (const [key, timestamps] of this.hits) {
      if (timestamps.every((timestamp) => timestamp <= cutoff)) {
        this.hits.delete(key);
      }
    }
  }
}
