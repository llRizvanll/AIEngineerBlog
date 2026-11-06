/* The practice problem for the AI-enabled coding round: three stages, as candidates describe that format. */
export interface LogEntry {
  at: number;
  level: string;
  service: string;
  message: string;
}

// region: bug
/** Stage 1, the code you inherit. A message may contain "|", and this drops everything after it. */
export function parseLineBuggy(line: string): LogEntry | null {
  const [at, level, service, message] = line.split("|");
  if (!message) return null;
  return { at: Number(at), level, service, message };
}
// endregion

// region: fix
/** Split only the first three separators, and reject a timestamp that isn't a number. */
export function parseLine(line: string): LogEntry | null {
  const parts = line.split("|");
  if (parts.length < 4) return null;
  const at = Number(parts[0]);
  if (!Number.isFinite(at)) return null;
  return { at, level: parts[1], service: parts[2], message: parts.slice(3).join("|") };
}
// endregion

// region: draft
/** Stage 2, what an assistant writes first. It looks right and passes a happy-path test. */
export function topErrorsDraft(entries: LogEntry[], k: number): [string, number][] {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    if (e.level === "ERROR") counts[e.service] = (counts[e.service] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, k);
}
// endregion

// region: reviewed
/** After review: a Map has no inherited keys, and the tie-break makes the output repeatable. */
const byCountThenName = (a: [string, number], b: [string, number]) => b[1] - a[1] || a[0].localeCompare(b[0]);

export function topErrors(entries: Iterable<LogEntry>, k: number): [string, number][] {
  const counts = new Map<string, number>();
  for (const e of entries) {
    if (e.level === "ERROR") counts.set(e.service, (counts.get(e.service) ?? 0) + 1);
  }
  return [...counts].sort(byCountThenName).slice(0, k);
}
// endregion

// region: fast
/** Stage 3, for millions of lines: read a stream, and keep only k candidates in a min-heap. */
export function topErrorsFast(lines: Iterable<string>, k: number): [string, number][] {
  const counts = new Map<string, number>();
  for (const line of lines) {
    const e = parseLine(line);
    if (e?.level === "ERROR") counts.set(e.service, (counts.get(e.service) ?? 0) + 1);
  }
  if (k <= 0) return [];
  const heap: [string, number][] = [];
  // The root is the entry that ranks last, so it is the one to replace.
  const ranksLater = (a: [string, number], b: [string, number]) => byCountThenName(a, b) > 0;
  const up = (start: number) => {
    let i = start;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!ranksLater(heap[i], heap[p])) break;
      [heap[i], heap[p]] = [heap[p], heap[i]];
      i = p;
    }
  };
  const down = () => {
    let i = 0;
    for (;;) {
      let top = i;
      for (const c of [2 * i + 1, 2 * i + 2]) if (c < heap.length && ranksLater(heap[c], heap[top])) top = c;
      if (top === i) return;
      [heap[i], heap[top]] = [heap[top], heap[i]];
      i = top;
    }
  };
  for (const item of counts) {
    if (heap.length < k) {
      heap.push(item);
      up(heap.length - 1);
    } else if (ranksLater(heap[0], item)) {
      heap[0] = item;
      down();
    }
  }
  return heap.sort(byCountThenName);
}
// endregion
