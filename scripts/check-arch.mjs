#!/usr/bin/env node
/* Architecture guard. Maps every import under src/ and checks four things:
     1. layering    - code only imports from its own layer or the layers below it
     2. cycles      - no circular imports
     3. dead files  - every module is imported by something (route files and entry points excepted)
     4. size        - files stay small enough to read
   Layers, lowest first:  types < config < content < lib < hooks < components < app
   Run:  node scripts/check-arch.mjs [--report]   (--report prints findings without failing) */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");
const LAYERS = ["types", "config", "content", "lib", "hooks", "components", "app"];
const MAX_LINES = Number(process.env.ARCH_MAX_LINES ?? 1100);
/** Data files are long on purpose; they only hold content, so the size limit is looser. */
const DATA_DIRS = ["content/"];
const ENTRY = /(^|\/)(page|layout|route|template|not-found|robots|sitemap|opengraph-image|icon)\.(tsx?|mts)$/;
const REPORT = process.argv.includes("--report");

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|mts)$/.test(e.name)) files.push(p);
  }
})(SRC);

const rel = (p) => path.relative(SRC, p).replace(/\\/g, "/");
const layerOf = (r) => LAYERS.find((l) => r.startsWith(l + "/"));

function resolve(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [base, base + ".ts", base + ".tsx", base + ".mts", path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

const graph = new Map();
const IMPORT = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\sfrom\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g;
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  const deps = new Set();
  for (const m of text.matchAll(IMPORT)) {
    const t = resolve(f, m[1] ?? m[2]);
    if (t) deps.add(t);
  }
  graph.set(f, deps);
}

const problems = [];

// 1. layering
for (const [f, deps] of graph) {
  const lf = layerOf(rel(f));
  for (const d of deps) {
    const ld = layerOf(rel(d));
    if (lf && ld && LAYERS.indexOf(ld) > LAYERS.indexOf(lf)) problems.push(`layering: ${rel(f)} (${lf}) imports ${rel(d)} (${ld})`);
  }
}

// 2. cycles
const state = new Map();
const stack = [];
const seenCycles = new Set();
function visit(f) {
  state.set(f, 1);
  stack.push(f);
  for (const d of graph.get(f) ?? []) {
    if (state.get(d) === 1) {
      const cyc = stack.slice(stack.indexOf(d)).map(rel);
      const key = [...cyc].sort().join("|");
      if (!seenCycles.has(key)) {
        seenCycles.add(key);
        problems.push(`cycle: ${[...cyc, rel(d)].join(" -> ")}`);
      }
    } else if (!state.get(d)) visit(d);
  }
  stack.pop();
  state.set(f, 2);
}
for (const f of graph.keys()) if (!state.get(f)) visit(f);

// 3. dead files
const imported = new Set([...graph.values()].flatMap((s) => [...s]));
const tests = fs.existsSync(path.join(process.cwd(), "tests")) ? fs.readdirSync(path.join(process.cwd(), "tests"), { recursive: true }).filter((f) => /\.mts$/.test(f)).map((f) => fs.readFileSync(path.join(process.cwd(), "tests", f), "utf8")).join("\n") : "";
const scripts = fs.readdirSync(path.join(process.cwd(), "scripts")).map((f) => fs.readFileSync(path.join(process.cwd(), "scripts", f), "utf8")).join("\n");
for (const f of files) {
  const r = rel(f);
  if (ENTRY.test(r) || imported.has(f)) continue;
  const usedByTool = tests.includes(r) || scripts.includes(r) || tests.includes(path.basename(r)) || scripts.includes(path.basename(r));
  if (!usedByTool) problems.push(`dead: ${r} is not imported anywhere`);
}

// 4. size
for (const f of files) {
  const n = fs.readFileSync(f, "utf8").split("\n").length;
  const r = rel(f);
  const limit = DATA_DIRS.some((d) => r.startsWith(d)) ? MAX_LINES * 2 : MAX_LINES / 2;
  if (n > limit) problems.push(`size: ${r} has ${n} lines (limit ${limit})`);
}

console.log(`${files.length} modules, ${[...graph.values()].reduce((a, s) => a + s.size, 0)} imports checked`);
if (problems.length) {
  console.log(problems.map((p) => "  " + p).join("\n"));
  console.log(`${problems.length} finding(s)`);
  if (!REPORT) process.exit(1);
} else console.log("architecture OK");
