import assert from "node:assert/strict";
import { PROBLEMS, check } from "../../src/content/practice.ts";

/* Re-derive every numeric answer from the numbers in the prompt, so a wrong answer fails the build. */
const near = (id: string, expected: number) => {
  const p = PROBLEMS.find((x) => x.id === id);
  assert.ok(p && p.kind === "number", id);
  assert.ok(Math.abs(p.answer - expected) <= p.tolerance, `${id}: stored ${p.answer}, derived ${expected}`);
  assert.ok(check(p, expected), `${id}: derived value should pass check()`);
  assert.ok(!check(p, expected + 10 * (p.tolerance || 1)), `${id}: a wrong value should fail check()`);
};
let n = 0;
const t = (id: string, v: number) => (near(id, v), n++);

t("tokens-estimate", 6000 / 4);
t("batch-requests", Math.ceil(37 / 25));
t("context-turns", Math.floor((8000 - 800) / (150 + 250)));
t("precision-at-k", 3 / 5);
t("token-cost", (1200 * 3) / 1e6 + (300 * 15) / 1e6);
let wait = 0, d = 1;
for (let i = 0; i < 7; i++) { wait += Math.min(d, 30); d *= 2; }
t("backoff-total", wait);
t("cache-latency", 0.8 * 20 + 0.2 * 300);
t("mrr", (1 / 1 + 1 / 3 + 1 / 2 + 1 / 5) / 4);
t("agent-slips", 0.99 ** 30);
const rows = [[2, 3], [4, 5], [0, 2], [2, 2]];
t("recall-at-4", rows.reduce((a, [h, tot]) => a + h / tot, 0) / rows.length);
t("kv-cache", (2 * 32 * 8 * 128 * 2 * 4096) / 1048576);
t("agent-budget", 0.9 ** (1 / 30));

const stop = PROBLEMS.find((x) => x.id === "stop-reason");
assert.ok(stop && stop.kind === "choice" && stop.options[stop.answer].startsWith("max_tokens"));
n++;

// the table in the recall problem agrees with the numbers used above
const rc = PROBLEMS.find((x) => x.id === "recall-at-4");
assert.ok(rc && rc.table);
rc.table.slice(1).forEach((r, i) => {
  const hits = r.slice(1, 5).filter((c) => c === "✓").length;
  assert.equal(hits, rows[i][0], `row ${r[0]}`);
  assert.equal(Number(r[6]), rows[i][1], `row ${r[0]} total`);
});
n++;
const ids = new Set(PROBLEMS.map((p) => p.id));
assert.equal(ids.size, PROBLEMS.length);
console.log(`${n + 1} practice checks passed`);
