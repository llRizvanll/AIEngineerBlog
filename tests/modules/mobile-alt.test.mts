/* Runs the TypeScript versions of the nine mobile machine-coding solutions and checks the behaviour each page promises.
   The Java versions are compiled and run by tests/modules/mobile-alt-java.test.mts. */
import assert from "node:assert/strict";
import { LruCache } from "../../src/content/mobile-alt/ts/LruCache.ts";
import { Backoff, withRetry } from "../../src/content/mobile-alt/ts/Backoff.ts";
import { RateLimiter, TokenBucket } from "../../src/content/mobile-alt/ts/RateLimiter.ts";
import { diff, isEmpty, longestIncreasingSubsequence } from "../../src/content/mobile-alt/ts/ListDiff.ts";
import { SearchViewModel } from "../../src/content/mobile-alt/ts/SearchViewModel.ts";
import { FeedPaginator } from "../../src/content/mobile-alt/ts/FeedPaginator.ts";
import { OfflineError, Outbox, newOp, type OutboxStore, type PendingOp, type PushResult } from "../../src/content/mobile-alt/ts/Outbox.ts";
import { ImageLoader } from "../../src/content/mobile-alt/ts/ImageLoader.ts";
import { ResumableUploader, byteRange, isComplete, remaining, type UploadPlan } from "../../src/content/mobile-alt/ts/ResumableUploader.ts";

let checks = 0;
const ok = (cond: unknown, msg: string) => {
  assert.ok(cond, msg);
  checks++;
};
const eq = (a: unknown, b: unknown, msg?: string) => {
  assert.deepEqual(a, b, msg);
  checks++;
};
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---- LruCache
{
  const c = new LruCache<string, number>(3);
  c.put("a", 1); c.put("b", 2); c.put("c", 3);
  eq(c.get("a"), 1);                                   // a is now the most recent
  c.put("d", 4);                                       // evicts b, the least recent
  eq([c.get("b"), c.get("a"), c.get("c"), c.get("d")], [undefined, 1, 3, 4]);
  eq(c.totalCost, 3);
  const w = new LruCache<string, string>(10);
  w.put("big", "x", 6); w.put("small", "y", 3); w.put("mid", "z", 4);   // 13 > 10: evict big
  eq([w.get("big"), w.size, w.totalCost], [undefined, 2, 7]);
  w.put("small", "y2", 1);                             // replacing updates the cost
  eq(w.totalCost, 5);
  w.remove("mid"); eq(w.totalCost, 1);
  w.clear(); eq([w.size, w.totalCost], [0, 0]);
  assert.throws(() => new LruCache(0)); checks++;
}

// ---- Backoff and withRetry
{
  eq(Backoff.delay(3, 500, 60_000, () => 1), 4000);    // 500 * 2^3
  eq(Backoff.delay(30, 500, 60_000, () => 1), 60_000); // capped
  eq(Backoff.delay(2, 500, 60_000, () => 0), 0);       // full jitter reaches zero
  const waits: number[] = [];
  let calls = 0;
  const v = await withRetry(async () => { if (++calls < 3) throw new Error("boom"); return "ok"; }, { sleep: async (ms) => { waits.push(ms); } });
  eq([v, calls, waits.length], ["ok", 3, 2]);
  calls = 0;
  await assert.rejects(withRetry(async () => { calls++; throw new Error("always"); }, { maxAttempts: 3, sleep: async () => {} })); checks++;
  eq(calls, 3);
  calls = 0;
  await assert.rejects(withRetry(async () => { calls++; throw new Error("4xx"); }, { isRetryable: () => false })); checks++;
  eq(calls, 1);
  const hinted: number[] = [];
  calls = 0;
  await withRetry(async () => { if (++calls < 2) throw Object.assign(new Error("429"), { retryAfterMs: 1234 }); return 1; }, { sleep: async (ms) => { hinted.push(ms); } });
  eq(hinted, [1234]);                                  // the server's hint wins over our own backoff
  calls = 0;
  const abort = Object.assign(new Error("cancelled"), { name: "AbortError" });
  await assert.rejects(withRetry(async () => { calls++; throw abort; })); checks++;
  eq(calls, 1);                                        // a cancelled caller is never retried
}

// ---- Token bucket and rate limiter
{
  let now = 0;
  const b = new TokenBucket(3, 1, () => now);
  eq([b.tryConsume(), b.tryConsume(), b.tryConsume(), b.tryConsume()], [true, true, true, false]);   // a burst of 3, then empty
  eq(b.waitTime(), 1000);
  now = 1500;
  eq(b.tryConsume(), true);                            // 1.5 tokens refilled
  now = 100_000;
  eq(b.waitTime(3), 0);                                // never above capacity
  let clock = 0;
  const slept: number[] = [];
  const lim = new RateLimiter(1, 2, () => clock, async (ms) => { slept.push(ms); clock += ms; });
  await lim.acquire(); await lim.acquire();            // the second one waits 500 ms
  eq(slept, [500]);
  await assert.rejects(lim.acquire(5)); checks++;
}

// ---- List diff
{
  const ident = (x: { id: number; v: string }) => x.id;
  const a = [{ id: 1, v: "a" }, { id: 2, v: "b" }, { id: 3, v: "c" }, { id: 4, v: "d" }];
  const d1 = diff(a, [{ id: 1, v: "a" }, { id: 3, v: "C" }, { id: 5, v: "e" }, { id: 4, v: "d" }], ident);
  eq([d1.deletes, d1.inserts, d1.reloads, d1.moves], [[1], [2], [1], []]);
  const d2 = diff([1, 2, 3, 4, 5].map((id) => ({ id, v: "" })), [2, 3, 4, 5, 1].map((id) => ({ id, v: "" })), ident);
  eq(d2.moves, [{ from: 0, to: 4 }]);                  // one item moved; the rest stay put
  ok(isEmpty(diff(a, a, ident)), "no change is empty");
  eq(longestIncreasingSubsequence([3, 1, 2, 5, 4, 6]).length, 4);
  eq(longestIncreasingSubsequence([]), []);
}

// ---- Search view model
{
  const calls: string[] = [];
  const vm = new SearchViewModel(async (q) => { calls.push(q); await sleep(q === "slow" ? 60 : 5); return [`r:${q}`]; }, { debounceMs: 30 });
  vm.onQueryChanged("a"); await sleep(50);
  eq(calls, []);                                       // below the minimum length: no request
  vm.onQueryChanged("ab"); vm.onQueryChanged("abc"); vm.onQueryChanged("abcd");
  await sleep(120);
  eq([calls, vm.ui.results], [["abcd"], ["r:abcd"]]);  // three keystrokes, one request
  vm.onQueryChanged("slow"); await sleep(45);          // the slow request is in flight
  vm.onQueryChanged("fast"); await sleep(150);
  eq(vm.ui.results, ["r:fast"]);                       // the stale answer for "slow" never shows
  const bad = new SearchViewModel(async () => { throw new Error("x"); }, { debounceMs: 5 });
  bad.onQueryChanged("zz"); await sleep(30);
  eq(bad.ui.error, "Search failed. Pull to retry.");
}

// ---- Feed paginator
{
  const pages: Record<string, { items: { id: number }[]; nextCursor: string | null }> = {
    start: { items: [{ id: 1 }, { id: 2 }], nextCursor: "p2" },
    p2: { items: [{ id: 2 }, { id: 3 }], nextCursor: "p3" },   // id 2 shifted onto this page: a duplicate
    p3: { items: [{ id: 4 }], nextCursor: null },
  };
  let fetches = 0;
  const feed = new FeedPaginator((x: { id: number }) => x.id, async (cursor) => { fetches++; await sleep(5); return pages[cursor ?? "start"]; });
  await Promise.all([feed.loadNext(), feed.loadNext()]);
  eq(fetches, 1);                                      // single flight
  await feed.loadNext(); await feed.loadNext();
  eq([feed.items.map((x) => x.id), feed.state.kind], [[1, 2, 3, 4], "end"]);
  await feed.loadNext(); eq(fetches, 3);               // nothing after the end
  // a refresh that lands while an older request is in flight wins
  let slow = true;
  const f2 = new FeedPaginator((x: { id: number }) => x.id, async () => { if (slow) { slow = false; await sleep(40); return { items: [{ id: 99 }], nextCursor: null }; } return { items: [{ id: 1 }], nextCursor: null }; });
  const old = f2.loadNext(); await sleep(5); await f2.refresh(); await old;
  eq(f2.items.map((x) => x.id), [1]);
  const f3 = new FeedPaginator((x: { id: number }) => x.id, async () => { throw new Error("offline"); });
  await f3.loadNext(); eq(f3.state, { kind: "failed", message: "offline" });
  let prefetched = 0;
  const f4 = new FeedPaginator((x: { id: number }) => x.id, async () => { prefetched++; return { items: Array.from({ length: 20 }, (_, i) => ({ id: i })), nextCursor: "n" }; });
  await f4.loadNext(); await f4.onItemShown(3); eq(prefetched, 1); await f4.onItemShown(16); eq(prefetched, 2);
}

// ---- Outbox
{
  const mem = (initial: PendingOp[] = []): OutboxStore & { saved: PendingOp[][] } => ({ saved: [], load: async () => initial, async save(ops) { this.saved.push(ops); } });
  const results: (PushResult | "offline")[] = [{ kind: "applied" }, { kind: "duplicate" }, { kind: "rejected", reason: "bad" }];
  const store = mem();
  const pushed: string[] = [];
  const ob = new Outbox(store, { push: async (op) => { pushed.push(op.entity); const r = results.shift()!; if (r === "offline") throw new OfflineError(); return r; } });
  await ob.enqueue(newOp("a", "1")); await ob.enqueue(newOp("b", "2")); await ob.enqueue(newOp("c", "3"));
  eq(store.saved.at(-1)!.length, 3);                   // persisted before enqueue returned
  eq(await ob.drain(), { kind: "drained" });
  eq([pushed, await ob.pendingCount(), (await ob.parkedOps()).map((o) => o.entity)], [["a", "b", "c"], 0, ["c"]]);
  // offline keeps everything
  const store2 = mem();
  const off = new Outbox(store2, { push: async () => { throw new OfflineError(); } });
  await off.enqueue(newOp("x", "1"));
  eq(await off.drain(), { kind: "offline" }); eq(await off.pendingCount(), 1);
  // retryable: attempts rise, the op stays first, and the server's hint is used
  const store3 = mem();
  const retry = new Outbox(store3, { push: async () => ({ kind: "retryable", afterMs: 777 }) }, 2);
  await retry.enqueue(newOp("y", "1"));
  eq(await retry.drain(), { kind: "backoff", delayMs: 777 });
  eq(store3.saved.at(-1)![0].attempts, 1);             // the new attempt count is on disk
  await retry.drain();                                 // second attempt reaches maxAttempts: parked
  eq([await retry.pendingCount(), (await retry.parkedOps()).length], [0, 1]);
  // a restart reloads the saved queue, and a second drain at the same time does nothing
  const survivor = newOp("z", "1");
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const reopened = new Outbox(mem([survivor]), { push: async () => { await gate; return { kind: "applied" }; } });
  const first = reopened.drain();
  await sleep(5);
  eq(await reopened.drain(), { kind: "alreadyRunning" });
  release(); eq(await first, { kind: "drained" });
}

// ---- Image loader
{
  let fetches = 0;
  const loader = new ImageLoader({ fetch: async (url) => { fetches++; await sleep(10); return new Uint8Array([url.length]); } });
  const [a, b, c] = await Promise.all([loader.load("http://x/1"), loader.load("http://x/1"), loader.load("http://x/1")]);
  eq([fetches, a, b, c], [1, a, a, a]);                // fifty rows, one download
  await loader.load("http://x/1"); eq(fetches, 1);     // now from memory
  loader.clearMemory(); await loader.load("http://x/1"); eq(fetches, 2);
  const store = new Map<string, Uint8Array>([["http://x/disk", new Uint8Array([9, 9])]]);
  const withDisk = new ImageLoader({ fetch: async () => { throw new Error("no network"); } }, { get: async (k) => store.get(k), put: async (k, v) => void store.set(k, v) });
  eq(Array.from(await withDisk.load("http://x/disk")), [9, 9]);   // disk hit, network never touched
  let attempts = 0;
  const flaky = new ImageLoader({ fetch: async () => { if (++attempts === 1) throw new Error("once"); return new Uint8Array([1]); } });
  await assert.rejects(flaky.load("u")); checks++;
  eq(Array.from(await flaky.load("u")), [1]);          // a failed download does not stay stuck in flight
  let aborted = false;
  const slow = new ImageLoader({ fetch: (_u, signal) => new Promise((_, reject) => signal.addEventListener("abort", () => { aborted = true; reject(new Error("aborted")); })) });
  const pending = slow.load("u").catch(() => "gone");
  await sleep(5); slow.cancel("u");
  eq([await pending, aborted], ["gone", true]);
}

// ---- Resumable uploader
{
  const bytes = Uint8Array.from({ length: 37 }, (_, i) => i);
  const plan: UploadPlan = { fileId: "f", size: 37, partSize: 4, completed: {} };
  eq([remaining(plan).length, byteRange(plan, 9)], [10, [36, 37]]);   // the last part is short
  let active = 0, peak = 0;
  const seen = new Map<number, Uint8Array>();
  const saves: number[] = [];
  const up = new ResumableUploader(
    { upload: async (_id, part, data) => { active++; peak = Math.max(peak, active); await sleep(5); active--; seen.set(part, data); return `etag-${part}`; } },
    { save: async (p) => void saves.push(Object.keys(p.completed).length) },
    3,
  );
  const done = await up.upload(bytes, plan);
  ok(isComplete(done), "all parts done");
  eq([peak <= 3, peak > 1, saves, seen.size], [true, true, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10]);
  eq(Array.from(seen.get(9)!), [36]);
  // resume: the finished parts are not sent again
  const sent: number[] = [];
  const resumed = await new ResumableUploader({ upload: async (_i, part) => { sent.push(part); return "e"; } }, { save: async () => {} }, 2).upload(bytes, { ...plan, completed: { 0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g" } });
  eq([sent.sort(), isComplete(resumed)], [[7, 8, 9], true]);
  // a failing part rejects, and the checkpoints already written are kept
  let last = 0;
  await assert.rejects(new ResumableUploader({ upload: async (_i, part) => { if (part === 5) throw new Error("boom"); await sleep(2); return "e"; } }, { save: async (p) => void (last = Object.keys(p.completed).length) }, 2).upload(bytes, plan), /boom/); checks++;
  ok(last >= 1 && last < 10, "some parts were checkpointed before the failure");
  await assert.rejects(up.upload(new Uint8Array(3), plan)); checks++;
}

console.log(`${checks} TypeScript mobile checks passed`);
