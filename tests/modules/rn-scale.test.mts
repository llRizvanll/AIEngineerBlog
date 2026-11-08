/* Runs the React Native modules' code, including the anti-patterns, to prove the claims on the pages. */
import assert from "node:assert/strict";
import { firstUseCost, startup, type NativeModule } from "../../src/content/modules/code/startup-model.ts";
import { createStore, shallowEqualArray } from "../../src/content/modules/code/store-select.ts";
import { checkBoundaries, featureCycles, removalImpact, type SourceFile } from "../../src/content/modules/code/boundary-check.ts";
import { EventHub, judgeLeak, leakSlope, visitScreen } from "../../src/content/modules/code/leak-detector.ts";
import { LIMITS, place } from "../../src/content/modules/code/native-boundary.ts";
import { gate, median } from "../../src/content/modules/code/budget-gate.ts";
import { MemoryDb, MutationQueue, type Sender } from "../../src/content/modules/code/mutation-queue.ts";

import { RN_MODULES } from "../../src/content/modules/react-native.ts";
import { RN_CARDS } from "../../src/content/rn-cards.ts";
import { CODE, FILE_DOC } from "../../src/content/code-docs.ts";
import fs from "node:fs";

let passed = 0;
const failed: string[] = [];
async function t(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed++;
  } catch (e) {
    failed.push(`${name}: ${(e as Error).message}`);
  }
}

/* ---------- startup ---------- */
const mods: NativeModule[] = [
  { name: "storage", initMs: 40, needsFirstScreen: true },
  { name: "analytics", initMs: 120, needsFirstScreen: false },
  { name: "camera", initMs: 150, needsFirstScreen: false },
  { name: "calendar", initMs: 90, needsFirstScreen: false },
];
await t("eager init blocks on every module", () => assert.deepEqual(startup(mods, "eager"), { blockingMs: 400, deferredMs: 0 }));
await t("lazy init blocks only on the first screen's modules", () => assert.deepEqual(startup(mods, "lazy"), { blockingMs: 40, deferredMs: 360 }));
await t("lazy work moves to the first caller", () => {
  assert.equal(firstUseCost(mods, "lazy", "camera"), 150);
  assert.equal(firstUseCost(mods, "lazy", "storage"), 0);
  assert.equal(firstUseCost(mods, "eager", "camera"), 0);
  assert.throws(() => firstUseCost(mods, "lazy", "nfc"));
});

/* ---------- re-render storms ---------- */
const items = Array.from({ length: 50 }, (_, i) => ({ id: i, done: false }));
const withRenders = (selectorFor: (i: number) => (s: { items: typeof items; theme: string }) => unknown, equal?: (a: never, b: never) => boolean) => {
  const store = createStore({ items, theme: "light" });
  let renders = 0;
  for (let i = 0; i < 50; i++) store.subscribe(selectorFor(i) as (s: { items: typeof items; theme: string }) => unknown, () => renders++, equal as never);
  return { store, renders: () => renders };
};
await t("a broad selector re-renders every row for one change", () => {
  const { store, renders } = withRenders(() => (s) => s);
  store.set({ items: items.map((x) => (x.id === 7 ? { ...x, done: true } : x)) });
  assert.equal(renders(), 50);
});
await t("a narrow selector re-renders only the row that changed", () => {
  const { store, renders } = withRenders((i) => (s) => s.items[i]);
  store.set({ items: items.map((x) => (x.id === 7 ? { ...x, done: true } : x)) });
  assert.equal(renders(), 1);
});
await t("a selector that builds a new array re-renders on any change, even an unrelated one", () => {
  const { store, renders } = withRenders(() => (s) => s.items.filter((x) => x.done));
  store.set({ theme: "dark" });
  assert.equal(renders(), 50);
});
await t("comparing contents stops that", () => {
  const { store, renders } = withRenders(() => (s) => s.items.filter((x) => x.done), shallowEqualArray as never);
  store.set({ theme: "dark" });
  assert.equal(renders(), 0);
  store.set({ items: items.map((x) => (x.id === 7 ? { ...x, done: true } : x)) });
  assert.equal(renders(), 50);
});
await t("unsubscribing stops updates", () => {
  const store = createStore({ n: 0 });
  let calls = 0;
  const off = store.subscribe((s) => s.n, () => calls++);
  store.set({ n: 1 });
  off();
  store.set({ n: 2 });
  assert.equal(calls, 1);
});

/* ---------- boundaries ---------- */
const files: SourceFile[] = [
  { path: "src/app/App.tsx", imports: ["src/features/auth/index.ts", "src/features/checkout/index.ts"] },
  { path: "src/features/auth/index.ts", imports: ["src/features/auth/domain/session.ts"] },
  { path: "src/features/auth/domain/session.ts", imports: ["src/shared/network/client.ts"] },
  { path: "src/features/checkout/index.ts", imports: ["src/features/checkout/ui/Cart.tsx"] },
  { path: "src/features/checkout/ui/Cart.tsx", imports: ["src/features/auth/index.ts"] },
  { path: "src/shared/network/client.ts", imports: [] },
];
await t("a clean graph has no violations", () => assert.deepEqual(checkBoundaries(files), []));
await t("importing another feature's private file is a violation", () => {
  const bad = [...files, { path: "src/features/checkout/ui/Pay.tsx", imports: ["src/features/auth/domain/session.ts"] }];
  assert.deepEqual(checkBoundaries(bad), [{ from: "src/features/checkout/ui/Pay.tsx", to: "src/features/auth/domain/session.ts", rule: "private-import" }]);
});
await t("shared code may not import a feature", () => {
  const bad = [...files, { path: "src/shared/ui/Button.tsx", imports: ["src/features/auth/index.ts"] }];
  assert.deepEqual(checkBoundaries(bad).map((v) => v.rule), ["shared-imports-feature"]);
});
await t("removing a feature touches only the files outside it that import it", () => {
  assert.deepEqual(removalImpact(files, "checkout"), ["src/app/App.tsx"]);
  assert.deepEqual(removalImpact(files, "auth"), ["src/app/App.tsx", "src/features/checkout/ui/Cart.tsx"]);
});
await t("two features that import each other form a cycle", () => {
  assert.deepEqual(featureCycles(files), []);
  const cyc = [...files, { path: "src/features/auth/ui/Gate.tsx", imports: ["src/features/checkout/index.ts"] }];
  assert.deepEqual(featureCycles(cyc), [["auth", "checkout"]]);
});

/* ---------- leaks ---------- */
await t("slope of a staircase is its step", () => assert.ok(Math.abs(leakSlope([100, 110, 120, 130, 140]) - 10) < 1e-9));
await t("a flat line has no slope", () => assert.equal(leakSlope([120, 120, 120, 120]), 0));
await t("a leak is found after warm-up", () => {
  const samples = [90, 130, ...Array.from({ length: 10 }, (_, i) => 135 + i * 1.2)];
  const r = judgeLeak(samples);
  assert.equal(r.leaking, true);
  assert.ok(Math.abs(r.slope - 1.2) < 1e-9);
});
await t("warm-up growth alone is not a leak", () => {
  const samples = [80, 120, ...Array.from({ length: 10 }, (_, i) => 150 + (i % 2) * 0.1)];
  assert.equal(judgeLeak(samples).leaking, false);
});
await t("too few visits gives no verdict", () => assert.match(judgeLeak([100, 101, 102]).verdict, /need 8 visits/));
await t("listeners pile up without cleanup, and stay at zero with it", () => {
  const leaky = new EventHub();
  for (let i = 0; i < 20; i++) visitScreen(leaky, false)();
  assert.equal(leaky.count("sync"), 20);
  const clean = new EventHub();
  for (let i = 0; i < 20; i++) visitScreen(clean, true)();
  assert.equal(clean.count("sync"), 0);
});

/* ---------- native or not ---------- */
const base = { name: "x", runsWhileAppClosed: false, needsPlatformApi: false, holdsKeyMaterial: false, longestBlockMs: 2, sustainedMBps: 0.1 };
await t("ordinary screens stay in React Native", () => assert.equal(place(base).placement, "react-native"));
await t("a sync worker belongs in a native engine", () => assert.equal(place({ ...base, runsWhileAppClosed: true }).placement, "native-engine"));
await t("key material, platform APIs, long blocks and heavy data each move code to a native module", () => {
  assert.equal(place({ ...base, holdsKeyMaterial: true }).placement, "native-module");
  assert.equal(place({ ...base, needsPlatformApi: true }).placement, "native-module");
  assert.equal(place({ ...base, longestBlockMs: LIMITS.blockMs + 1 }).placement, "native-module");
  assert.equal(place({ ...base, sustainedMBps: LIMITS.MBps + 1 }).placement, "native-module");
});
await t("the reasons are listed", () => {
  const r = place({ ...base, runsWhileAppClosed: true, holdsKeyMaterial: true, sustainedMBps: 5 });
  assert.equal(r.placement, "native-engine");
  assert.equal(r.reasons.length, 3);
});

/* ---------- budgets ---------- */
await t("median ignores one bad run", () => assert.equal(median([100, 101, 99, 102, 900]), 101));
await t("median of an even count averages the middle two", () => assert.equal(median([1, 2, 3, 4]), 2.5));
const budgets = [{ metric: "ttiMs", limit: 2000 }, { metric: "fps", limit: 58, higherIsBetter: true }];
await t("a single noisy run does not fail the gate", () => {
  const r = gate({ ttiMs: [1800, 1850, 1790, 4000, 1820], fps: [59, 60, 59, 59, 60] }, budgets);
  assert.equal(r.pass, true);
});
await t("too few runs fails, because the number can't be trusted", () => {
  const r = gate({ ttiMs: [1800, 1800], fps: [60, 60, 60, 60, 60] }, budgets);
  assert.equal(r.pass, false);
  assert.match(r.rows[0].why, /only 2 runs/);
});
await t("breaking the limit fails, in both directions", () => {
  const r = gate({ ttiMs: [2100, 2200, 2100, 2150, 2100], fps: [50, 51, 50, 52, 50] }, budgets);
  assert.deepEqual(r.rows.map((x) => x.pass), [false, false]);
});
await t("a regression against the baseline fails even inside the limit", () => {
  const runs = { ttiMs: [1900, 1910, 1895, 1905, 1900], fps: [60, 60, 60, 60, 60] };
  assert.equal(gate(runs, budgets, { ttiMs: 1700 }).pass, false);
  assert.equal(gate(runs, budgets, { ttiMs: 1850 }).pass, true);
  assert.equal(gate({ ...runs, fps: [57.9, 58, 58, 58, 58] }, [budgets[1]], { fps: 62 }).pass, false);
});

/* ---------- the offline queue ---------- */
const clock = () => {
  let n = 1000;
  const f = () => n;
  f.add = (d: number) => void (n += d);
  return f;
};
const opts = (now: () => number) => ({ now, baseDelayMs: 1000, maxAttempts: 3 });
const mut = (id: string) => ({ id, method: "PATCH" as const, endpoint: `/jobs/${id}`, body: `{"id":"${id}"}` });
const setup = (replies: (number | "offline")[], now = clock()) => {
  const db = new MemoryDb();
  const sent: { endpoint: string; key: string }[] = [];
  const q = [...replies];
  const send: Sender = async (r) => {
    sent.push({ endpoint: r.endpoint, key: r.idempotencyKey });
    const reply = q.length > 1 ? q.shift()! : q[0];
    if (reply === "offline") throw new Error("offline");
    return { status: reply };
  };
  return { db, queue: new MutationQueue(db, send, opts(now)), sent, now };
};

await t("the local row and the queue row commit together", () => {
  const { db, queue } = setup([200]);
  queue.enqueue(mut("a"), (rows) => rows.set("a", { saved: true }));
  assert.equal(db.rows.has("a"), true);
  assert.equal(db.queue.length, 1);
});
await t("a failed local write leaves no queue row", () => {
  const { db, queue } = setup([200]);
  assert.throws(() => queue.enqueue(mut("a"), () => { throw new Error("disk full"); }));
  assert.equal(db.queue.length, 0);
});
await t("a success removes the row, in order", async () => {
  const { db, queue, sent } = setup([200]);
  for (const id of ["a", "b", "c"]) { queue.enqueue(mut(id), (r) => r.set(id, 1)); }
  await queue.drain();
  assert.deepEqual(sent.map((s) => s.endpoint), ["/jobs/a", "/jobs/b", "/jobs/c"]);
  assert.equal(db.queue.length, 0);
});
await t("losing the network stops the drain, so nothing overtakes the first change", async () => {
  const { db, queue, sent, now } = setup(["offline"]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1)); now.add(1);
  queue.enqueue(mut("b"), (r) => r.set("b", 1));
  await queue.drain();
  assert.equal(sent.length, 1);
  assert.deepEqual(db.queue.map((m) => [m.id, m.status]), [["a", "PENDING"], ["b", "PENDING"]]);
});
await t("a 409 keeps the row as a conflict, and later changes still go", async () => {
  const { db, queue, sent, now } = setup([409, 200]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1)); now.add(1);
  queue.enqueue(mut("b"), (r) => r.set("b", 1));
  await queue.drain();
  assert.deepEqual(db.queue.map((m) => [m.id, m.status]), [["a", "CONFLICT"]]);
  assert.equal(sent.length, 2);
});
await t("another 4xx is kept as failed, not deleted", async () => {
  const { db, queue } = setup([422]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1));
  await queue.drain();
  assert.deepEqual(db.queue.map((m) => [m.status, m.lastError]), [["FAILED", "HTTP 422"]]);
});
await t("a 503 waits with backoff, then retries, then gives up", async () => {
  const { db, queue, sent, now } = setup([503]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1));
  await queue.drain();
  assert.equal(sent.length, 1);
  assert.equal(db.queue[0].nextAt, now() + 1000);
  await queue.drain();
  assert.equal(sent.length, 1, "too early to retry");
  now.add(1000);
  await queue.drain();
  assert.equal(db.queue[0].attempts, 2);
  assert.equal(db.queue[0].nextAt, now() + 2000, "the wait doubles");
  now.add(2000);
  await queue.drain();
  assert.deepEqual([db.queue[0].status, db.queue[0].attempts], ["FAILED", 3]);
});
await t("every retry carries the same idempotency key", async () => {
  const { queue, sent, now } = setup([503, 503, 200]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1));
  await queue.drain(); now.add(1000);
  await queue.drain(); now.add(2000);
  await queue.drain();
  assert.deepEqual(sent.map((s) => s.key), ["a", "a", "a"]);
});
await t("after a crash, in-flight rows go back to pending", () => {
  const { db, queue } = setup([200]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1));
  db.queue[0].status = "IN_FLIGHT";
  queue.recover();
  assert.equal(db.queue[0].status, "PENDING");
});
await t("two drains at once share one run", async () => {
  const { queue, sent } = setup([200]);
  queue.enqueue(mut("a"), (r) => r.set("a", 1));
  await Promise.all([queue.drain(), queue.drain()]);
  assert.equal(sent.length, 1);
});

/* ---------- the pages themselves ---------- */
await t("each module's code files exist and have an explanation", () => {
  for (const m of RN_MODULES) for (const c of m.code ?? []) {
    assert.ok(fs.existsSync(`src/content/modules/code/${c.file}`), c.file);
    assert.ok(FILE_DOC[c.file] && CODE[FILE_DOC[c.file]], `no notes for ${c.file}`);
  }
});
await t("every code file is used by a module", () => {
  const used = new Set(RN_MODULES.flatMap((m) => (m.code ?? []).map((c) => c.file)));
  for (const f of ["startup-model.ts", "store-select.ts", "boundary-check.ts", "leak-detector.ts", "native-boundary.ts", "budget-gate.ts", "mutation-queue.ts"]) assert.ok(used.has(f), f);
});
await t("module ids are unique and their steps and answers exist", () => {
  assert.equal(new Set(RN_MODULES.map((m) => m.assetId)).size, RN_MODULES.length);
  for (const m of RN_MODULES) assert.ok(m.steps.length >= 5 && m.qa.length >= 4 && m.concepts.length >= 5, m.assetId);
});
await t("every card points at a real module", () => {
  const ids = new Set(RN_MODULES.map((m) => m.assetId));
  for (const [, , , id] of RN_CARDS) assert.ok(ids.has(id), id);
  for (const id of ids) assert.ok(RN_CARDS.some((c) => c[3] === id), `${id} has no card`);
});

import { RN_HUB } from "../../src/content/rn-hub.ts";
import { RN_SLIDES } from "../../src/content/rn-slides.ts";
await t("every slide file exists and every module with slides is real", () => {
  const ids = new Set(RN_MODULES.map((m) => m.assetId));
  for (const [id, list] of Object.entries(RN_SLIDES)) {
    assert.ok(ids.has(id), id);
    for (const sl of list) {
      assert.ok(fs.existsSync(`public/slides/rn/${sl.file}.jpg`), sl.file);
      assert.ok(sl.alt.length > 20 && sl.caption.length > 10, sl.file);
    }
  }
  const files = fs.readdirSync("public/slides/rn").map((f) => f.replace(".jpg", ""));
  const used = new Set(Object.values(RN_SLIDES).flat().map((s) => s.file));
  assert.deepEqual(files.filter((f) => !used.has(f)), []);
});
await t("every hub link points at a page that exists", () => {
  const modules = new Set(RN_MODULES.map((m) => `/modules/${m.assetId}`));
  for (const g of RN_HUB) for (const [href] of g.items) {
    if (href.startsWith("/modules/rn-")) assert.ok(modules.has(href), href);
    assert.ok(href.startsWith("/"), href);
  }
  const all = RN_HUB.flatMap((g) => g.items.map(([h]) => h));
  assert.equal(new Set(all).size, all.length, "a page is listed twice");
});

import { SYNC_SLIDES } from "../../src/content/sync-slides.ts";
await t("every sync slide file exists, in order, and none is left over", () => {
  for (const sl of SYNC_SLIDES) assert.ok(fs.existsSync(`public/slides/sync/${sl.file}.jpg`), sl.file);
  const files = fs.readdirSync("public/slides/sync").map((f) => f.replace(".jpg", "")).sort();
  assert.deepEqual(files, SYNC_SLIDES.map((s) => s.file));
  assert.deepEqual(SYNC_SLIDES.map((s) => s.file), [...SYNC_SLIDES.map((s) => s.file)].sort());
});

if (failed.length) {
  failed.forEach((f) => console.log("  FAILED", f));
  process.exit(1);
}
console.log(`${passed} React Native module code checks passed`);
