/* Finding leaks the way the profiler shows them: memory that climbs one step per screen visit. */

// region: slope
/** Least-squares slope of memory against visit number, in MB per visit. */
export function leakSlope(samplesMb: number[]): number {
  const n = samplesMb.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = samplesMb.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  samplesMb.forEach((y, x) => {
    num += (x - meanX) * (y - meanY);
    den += (x - meanX) ** 2;
  });
  return num / den;
}

/**
 * Samples are taken after forcing a garbage collection, once per visit. The first visits are warm-up:
 * caches fill and then stop growing, so they are skipped.
 */
export function judgeLeak(samplesMb: number[], opts = { warmup: 2, minVisits: 8, maxMbPerVisit: 0.5 }) {
  const usable = samplesMb.slice(opts.warmup);
  if (usable.length < opts.minVisits) return { leaking: false, slope: 0, verdict: `need ${opts.minVisits} visits after warm-up, got ${usable.length}` };
  const slope = leakSlope(usable);
  const leaking = slope > opts.maxMbPerVisit;
  return { leaking, slope, verdict: leaking ? `grows ${slope.toFixed(2)} MB per visit` : "flat" };
}
// endregion

// region: hub
/** A stand-in for DeviceEventEmitter, so the listener count can be read. */
export class EventHub {
  private listeners = new Map<string, Set<(data: unknown) => void>>();
  on(event: string, fn: (data: unknown) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return { remove: () => this.listeners.get(event)?.delete(fn) };
  }
  emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach((fn) => fn(data));
  }
  count(event: string) {
    return this.listeners.get(event)?.size ?? 0;
  }
}

/** One visit to a screen. Without cleanup, each visit leaves a listener, and its closure, behind. */
export function visitScreen(hub: EventHub, withCleanup: boolean): () => void {
  const subscription = hub.on("sync", () => {});
  return () => {
    if (withCleanup) subscription.remove();
  };
}
// endregion
