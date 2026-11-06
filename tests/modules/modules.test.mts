/* Tests for src/content/modules/code/*.ts. Run: npm run test:modules */
import { kvBytesPerToken, concurrentRequests } from "../../src/content/modules/code/kv-size.ts";
import { BlockManager } from "../../src/content/modules/code/paged-blocks.ts";
import { staticBatching, continuousBatching } from "../../src/content/modules/code/continuous-batching.ts";
import { ringAllReduce } from "../../src/content/modules/code/ring-allreduce.ts";
import { speculativeStep, acceptRate } from "../../src/content/modules/code/speculative-accept.ts";
import { PrefixCache } from "../../src/content/modules/code/prefix-cache.ts";
import { Hnsw } from "../../src/content/modules/code/hnsw.ts";
import { rrf } from "../../src/content/modules/code/rrf.ts";
import { splitDocument, toParents } from "../../src/content/modules/code/parent-child.ts";
import { KnowledgeGraph } from "../../src/content/modules/code/graph-communities.ts";
import { SemanticCache } from "../../src/content/modules/code/semantic-cache.ts";
import { Bm25 } from "../../src/content/modules/code/bm25.ts";
import { retrieveAndRerank } from "../../src/content/modules/code/rerank-pipeline.ts";
import { fitContext } from "../../src/content/modules/code/context-budget.ts";
import { loraTrainable } from "../../src/content/modules/code/lora-params.ts";
import { constantBits, baseModelGiB } from "../../src/content/modules/code/nf4-memory.ts";
import { dpoLoss } from "../../src/content/modules/code/dpo-loss.ts";
import { zeroGbPerGpu } from "../../src/content/modules/code/zero-memory.ts";
import { mergeAdapter, unmergeAdapter, applyUnmerged } from "../../src/content/modules/code/merge-adapter.ts";
import { cohenKappa, debiasedVerdict } from "../../src/content/modules/code/judge-calibration.ts";
import { parseGuardOutput, gate } from "../../src/content/modules/code/moderation-gate.ts";
import { faithfulness, contextRecall, contextPrecision, answerRelevance } from "../../src/content/modules/code/ragas-metrics.ts";
import { validate, guardedCall } from "../../src/content/modules/code/output-guard.ts";
import { visionReport } from "../../src/content/modules/code/image-dependence.ts";
import { runSuite, passesGate } from "../../src/content/modules/code/red-team-loop.ts";
import { AsyncCheckpointer } from "../../src/content/modules/code/async-checkpoint.ts";
import { buildPrompt } from "../../src/content/modules/code/prompt-builder.ts";
import { clipLoss } from "../../src/content/modules/code/clip-loss.ts";

let pass = 0;
let fail = 0;
const ok = (cond: boolean, name: string) => {
  if (cond) pass++;
  else {
    fail++;
    console.error("FAIL", name);
  }
};
const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const seeded = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

// KV cache sizing
const perToken = kvBytesPerToken({ layers: 80, kvHeads: 8, headDim: 128, bytesPerValue: 2 });
ok(perToken === 327_680, "70B KV bytes per token");
ok(concurrentRequests(24, 2300, perToken) === 34, "requests that fit in 24 GiB");

// Paged blocks and copy-on-write
{
  const m = new BlockManager(4, 16);
  for (let i = 0; i < 17; i++) ok(m.addToken("a"), "add token");
  ok(m.table("a").length === 2 && m.freeBlocks === 2, "17 tokens take 2 blocks");
  m.fork("a", "b");
  ok(eq(m.table("a"), m.table("b")) && m.freeBlocks === 2, "fork shares blocks");
  m.addToken("b");
  ok(m.table("b")[1] !== m.table("a")[1] && m.table("b")[0] === m.table("a")[0] && m.freeBlocks === 1, "write copies only the last block");
  m.release("a");
  ok(m.freeBlocks === 2, "shared block stays until its last owner leaves");
  m.release("b");
  ok(m.freeBlocks === 4, "all blocks return");
  const tiny = new BlockManager(1, 2);
  tiny.addToken("x");
  tiny.addToken("x");
  ok(!tiny.addToken("x"), "out of blocks asks the scheduler to preempt");
  let threw = false;
  try {
    tiny.fork("nope", "y");
  } catch {
    threw = true;
  }
  ok(threw, "forking an unknown sequence throws");
}

// Batching
{
  const jobs = [100, 10, 10, 10].map((tokens) => ({ arrival: 0, tokens }));
  const mean = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length;
  ok(eq(staticBatching(jobs, 2), [100, 100, 110, 110]), "static waits for the longest");
  ok(eq(continuousBatching(jobs, 2), [100, 10, 20, 30]), "continuous admits at once");
  ok(mean(continuousBatching(jobs, 2)) < mean(staticBatching(jobs, 2)) / 2, "continuous cuts mean latency");
  ok(eq(continuousBatching([{ arrival: 5, tokens: 1 }], 2), [6]), "idle engine waits for the next arrival");
}

// Ring all-reduce
{
  const vs = [0, 1, 2, 3].map((r) => Array.from({ length: 8 }, (_, i) => r * 10 + i));
  const expected = Array.from({ length: 8 }, (_, i) => vs.reduce((s, v) => s + v[i], 0));
  const { result, sentPerRank } = ringAllReduce(vs);
  ok(result.every((r) => eq(r, expected)), "all ranks hold the sum");
  ok(sentPerRank === (2 * 3 * 8) / 4, "sends 2(p-1)/p of the vector");
}

// Speculative decoding keeps the target distribution
{
  const p = [0.5, 0.3, 0.15, 0.05];
  const q = [0.25, 0.25, 0.25, 0.25];
  const rand = seeded(7);
  const counts = [0, 0, 0, 0];
  let accepted = 0;
  const N = 200_000;
  for (let i = 0; i < N; i++) {
    const s = speculativeStep(p, q, rand);
    counts[s.token]++;
    if (s.accepted) accepted++;
  }
  ok(counts.every((c, i) => Math.abs(c / N - p[i]) < 0.01), "output follows p");
  ok(close(acceptRate(p, q), 0.25 + 0.25 + 0.15 + 0.05) && Math.abs(accepted / N - acceptRate(p, q)) < 0.01, "accept rate is the overlap");
  ok(speculativeStep(p, p, () => 0).accepted, "identical distributions always accept");
}

// Prefix cache
{
  const c = new PrefixCache(4, 8);
  const sys = Array.from({ length: 12 }, (_, i) => i);
  c.insert([...sys, 100]);
  ok(c.lookup([...sys, 200]) === 12, "shared prefix hits whole blocks");
  ok(c.lookup([999, ...sys, 200]) === 0, "a different first token misses everything");
  ok(c.lookup([...sys, 200], "tenant-b") === 0, "a salt isolates tenants");
  ok(c.lookup(sys) === 8, "the last token always runs");
  const small = new PrefixCache(1, 2);
  small.insert([1, 2, 3, 4]);
  ok(small.lookup([1, 2, 3, 4]) === 0, "evicted blocks break the chain");
}

// HNSW recall against brute force
{
  const rand = seeded(42);
  const vec = () => Array.from({ length: 16 }, () => rand());
  const data = Array.from({ length: 1500 }, vec);
  const index = new Hnsw(16, 80, rand);
  data.forEach((v) => index.insert(v));
  const d = (a: number[], b: number[]) => a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0);
  let hits = 0;
  const Q = 40;
  for (let i = 0; i < Q; i++) {
    const q = vec();
    const truth = data.map((v, id) => [d(q, v), id] as const).sort((a, b) => a[0] - b[0]).slice(0, 10).map((x) => x[1]);
    const found = new Set(index.search(q, 10, 80));
    hits += truth.filter((id) => found.has(id)).length;
  }
  ok(hits / (Q * 10) > 0.9, `HNSW recall@10 ${hits / (Q * 10)}`);
}

// RRF
ok(eq(rrf([["a", "b", "c"], ["b", "c", "a"], ["b", "a"]]).map((x) => x.id), ["b", "a", "c"]), "rrf order");
ok(rrf([["a"], ["b"]], { weights: [2, 1] })[0].id === "a", "rrf weights");
ok(rrf([["a", "b", "c"]], { top: 2 }).length === 2, "rrf top");

// Parent-child
{
  const words = Array.from({ length: 25 }, (_, i) => `w${i}`);
  const { parents, children } = splitDocument("d", words, 10, 4);
  ok(parents.size === 3 && children.length === 3 + 3 + 2, "split sizes");
  const hits = [{ child: children[0], score: 0.5 }, { child: children[1], score: 0.9 }, { child: children[3], score: 0.7 }];
  const out = toParents(hits, parents, 5);
  ok(out.length === 2 && out[0].id === "d#0" && out[0].score === 0.9 && out[0].text.startsWith("w0"), "dedupes by parent at best score");
}

// GraphRAG communities
{
  const g = new KnowledgeGraph();
  for (const [s, o] of [["A", "B"], ["B", "C"], ["A", "C"], ["X", "Y"], ["Y", "Z"], ["X", "Z"], ["C", "X"]]) g.add({ subject: s, relation: "links", object: o });
  g.add({ subject: "a ", relation: "links", object: "b" });
  const communities = g.communities();
  ok(communities.length === 2 && communities[0].length === 3, `two communities ${JSON.stringify(communities)}`);
  ok(g.factsFor(communities.find((c) => c.includes("a"))!).length === 3, "facts stay inside a community and dedupe");
}

// Semantic cache
{
  let now = 0;
  const embed = async (t: string) => (t.includes("refund") ? [1, 0.01] : [0, 1]);
  const c = new SemanticCache<string>(embed, { threshold: 0.9, ttlMs: 100, now: () => now });
  await c.put("t1", "refund policy", "30 days");
  ok((await c.get("t1", "what is the refund rule")) === "30 days", "similar question hits");
  ok((await c.get("t1", "opening hours")) === null, "different question misses");
  ok((await c.get("t2", "refund policy")) === null, "tenants stay isolated");
  now = 200;
  ok((await c.get("t1", "refund policy")) === null, "entries expire");
}

// BM25
{
  const b = new Bm25();
  b.add("rare", "kv cache eviction");
  b.add("common1", "the cache the cache");
  b.add("common2", "the cache and more words about the cache layer in general terms");
  ok(b.search("eviction")[0].id === "rare", "rare term finds its document");
  const r = b.search("cache");
  ok(r[r.length - 1].id === "common2", "long documents are normalised down");
  ok(b.search("zzz").length === 0, "unknown term returns nothing");
}

// Rerank pipeline
{
  const docs = ["a", "b", "c"].map((id) => ({ id, text: id }));
  const retrieve = async () => docs;
  const good = await retrieveAndRerank("q", retrieve, async () => [0.1, 0.9, 0.5], { top: 2 });
  ok(good.reranked && eq(good.results.map((d) => d.id), ["b", "c"]), "rerank reorders");
  const late = await retrieveAndRerank("q", retrieve, () => new Promise((r) => setTimeout(() => r([1, 2, 3]), 200)), { top: 2, timeoutMs: 10 });
  ok(!late.reranked && eq(late.results.map((d) => d.id), ["a", "b"]), "timeout keeps retrieval order");
  const broken = await retrieveAndRerank("q", retrieve, async () => { throw new Error("x"); }, { top: 1 });
  ok(!broken.reranked && broken.results.length === 1, "errors keep retrieval order");
}

// Context budget
{
  const s = [{ text: "aa bb", score: 0.2 }, { text: "cc", score: 0.9 }, { text: "dd ee ff", score: 0.5 }];
  const words = (t: string) => t.split(" ").length;
  ok(eq(fitContext(s, 4, words), ["cc", "dd ee ff"]), "keeps the best, in reading order");
  ok(eq(fitContext(s, 0, words), []), "zero budget keeps nothing");
}

// LoRA numbers
ok(loraTrainable(32, [[4096, 4096], [4096, 1024], [4096, 1024], [4096, 4096]], 16) === 13_631_488, "LoRA 8B r=16");

// QLoRA memory
ok(close(constantBits(false), 0.5) && close(constantBits(true), 0.126953125), "constant bits match the paper");
ok(Math.abs(baseModelGiB(7e9, 4, true) - 3.36) < 0.02, "7B base model size");

// DPO
{
  const same = { chosen: -5, rejected: -5, refChosen: -5, refRejected: -5 };
  ok(close(dpoLoss(same), Math.log(2)), "no preference costs ln 2");
  ok(dpoLoss({ ...same, chosen: -3 }) < Math.log(2), "preferring chosen lowers the loss");
  ok(dpoLoss({ ...same, rejected: -3 }) > Math.log(2), "preferring rejected raises the loss");
}

// ZeRO memory
ok(zeroGbPerGpu(70e9, 8, 0) === 1120 && zeroGbPerGpu(70e9, 8, 1) === 385 && zeroGbPerGpu(70e9, 8, 2) === 262.5 && zeroGbPerGpu(70e9, 8, 3) === 140, "ZeRO stages");

// Adapter merge
{
  const W = [[1, 2, 3], [4, 5, 6]];
  const A = [[0.5, -1, 2]];
  const B = [[1], [-2]];
  const x = [1, 2, 3];
  const merged = mergeAdapter(W, A, B, 2);
  const direct = merged.map((row) => row.reduce((s, v, i) => s + v * x[i], 0));
  ok(applyUnmerged(W, A, B, 2, x).every((v, i) => close(v, direct[i])), "merged output equals unmerged");
  ok(unmergeAdapter(merged, A, B, 2).every((row, i) => row.every((v, j) => close(v, W[i][j]))), "unmerge restores the weights");
}

// Judge calibration
{
  ok(close(cohenKappa(["y", "y", "n", "n"], ["y", "y", "n", "n"]), 1), "perfect kappa");
  ok(close(cohenKappa(["y", "y", "n", "n"], ["y", "n", "y", "n"]), 0), "chance kappa");
  const biased = async () => "first" as const;
  ok((await debiasedVerdict(biased, "a", "b")) === "tie", "position bias becomes a tie");
  const fair = async (x: string) => (x === "good" ? ("first" as const) : ("second" as const));
  ok((await debiasedVerdict(fair, "good", "bad")) === "a" && (await debiasedVerdict(fair, "bad", "good")) === "b", "real preference survives the swap");
}

// Moderation gate
{
  ok(eq(parseGuardOutput("unsafe\nS1,S10"), { safe: false, categories: ["S1", "S10"] }), "parses categories");
  ok(parseGuardOutput(" safe ").safe, "parses safe");
  ok((await gate("x", async () => "safe")).allow, "safe passes");
  const v = await gate("x", async () => "unsafe\nS2", []);
  ok(!v.allow && eq(v.categories, ["S2"]), "unsafe blocks");
  ok((await gate("x", async () => "unsafe\nS6", ["S6"])).allow, "allowed category passes");
  ok(!(await gate("x", async () => { throw new Error("down"); })).allow, "errors fail closed");
  ok((await gate("x", async () => { throw new Error("down"); }, [], true)).allow, "read-only may fail open");
}

// RAGAS metrics
ok(close(faithfulness([true, true, false, true]), 0.75), "faithfulness");
ok(close(contextRecall([true, false]), 0.5), "context recall");
ok(close(contextPrecision([true, false, true]), (1 + 2 / 3) / 2), "context precision");
ok(close(answerRelevance([1, 0], [[1, 0], [0, 1]]), 0.5), "answer relevance");
ok(contextPrecision([false, false]) === 0, "no relevant chunk scores zero");

// Output guard
{
  const schema = { intent: { type: "string", required: true, oneOf: ["book", "cancel"] }, seats: { type: "number", min: 1, max: 4 } } as const;
  ok(eq(validate({ intent: "book", seats: 2 }, schema), []), "valid object");
  ok(validate({ intent: "fly", seats: 9 }, schema).length === 2, "reports every error");
  ok(validate(null, schema).length === 1 && validate({}, schema).length === 1, "null and missing");
  const replies = ["not json", '{"intent":"fly"}', '{"intent":"book"}'];
  const asks: string[] = [];
  const out = await guardedCall("Q", async (p) => (asks.push(p), replies.shift()!), schema);
  ok(out.ok && out.attempts === 3 && asks[2].includes("intent must be one of"), "re-asks with the errors");
  const never = await guardedCall("Q", async () => "nope", schema, 1);
  ok(!never.ok && never.attempts === 2, "gives up after the retries");
}

// Vision control run
{
  const r = visionReport([
    { id: "a", withImage: true, blankImage: true },
    { id: "b", withImage: true, blankImage: false },
    { id: "c", withImage: false, blankImage: false },
    { id: "d", withImage: true, blankImage: false },
  ]);
  ok(close(r.accuracy, 0.75) && close(r.blankAccuracy, 0.25) && close(r.visualLift, 0.5), "lift");
  ok(close(r.trueVisualAccuracy, 2 / 3) && eq(r.imageBlindItems, ["a"]), "excludes image-blind items");
}

// Red-team suite
{
  const res = await runSuite(
    [{ category: "c1", prompt: "p" }, { category: "c2", prompt: "q" }],
    (p) => [`${p}!`],
    async (p) => p,
    async (c, reply) => c === "c1" && reply.endsWith("!")
  );
  ok(res.attackSuccessRate.get("c1") === 0.5 && res.attackSuccessRate.get("c2") === 0 && res.failures.length === 1, "per-category rates");
  ok(passesGate(res.attackSuccessRate, { c1: 0.5, c2: 0 }) && !passesGate(res.attackSuccessRate, { c1: 0.1, c2: 0 }), "CI gate");
}

// Async checkpoint
{
  const files = new Map<string, string>();
  let failNext = false;
  const storage = {
    write: async (p: string, d: string) => {
      if (failNext && p.endsWith("COMMIT")) throw new Error("disk");
      await new Promise((r) => setTimeout(r, 1));
      files.set(p, d);
    },
    list: async () => [...files.keys()],
  };
  const c = new AsyncCheckpointer<{ w: number }>(storage);
  const state = { w: 1 };
  const saving = c.save(10, 0, state);
  state.w = 999; // training moves on
  await saving;
  ok(JSON.parse(files.get("ckpt-10/rank-0.json")!).w === 1 && (await c.latest()) === 10, "saves the snapshot, not later values");
  failNext = true;
  await c.save(20, 0, state).catch(() => {});
  ok(files.has("ckpt-20/rank-0.json") && (await c.latest()) === 10, "no commit marker: the loader keeps the old checkpoint");
  ok((await new AsyncCheckpointer(storage).latest()) === 10, "a fresh process finds the same checkpoint");
}

// Prompt builder
{
  const p = buildPrompt({ task: "Classify.", reason: true, schema: { type: "object" }, examples: [{ input: "a", output: "b" }], input: "z" });
  ok(p.indexOf("Classify.") < p.indexOf("step by step") && p.indexOf("Input: a") < p.indexOf("Input: z") && p.endsWith("Output:"), "order");
  ok(!buildPrompt({ task: "T", input: "z" }).includes("JSON"), "optional parts stay out");
}

// CLIP loss
{
  const I = [[1, 0], [0, 1]];
  ok(clipLoss(I, I) < clipLoss(I, [[0, 1], [1, 0]]), "matched pairs score lower than swapped pairs");
}

console.log(`${pass} checks passed${fail ? `, ${fail} FAILED` : ""}`);
if (fail) process.exit(1);
