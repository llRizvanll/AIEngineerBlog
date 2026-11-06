/* Paramedic-method copy linter (Lanham). Run: npm run lint:copy
   Reports "to be" verbs, wind-up phrases and sentence length per content file. It flags; people rewrite. */
import fs from "node:fs";
import path from "node:path";

const ROOT = "src/content";
const TO_BE = /\b(is|are|was|were|be|been|being)\b/gi;
const PASSIVE = /\b(is|are|was|were|be|been|being)\s+(\w+ly\s+)?\w+(ed|en)\b/gi;
const WINDUPS = /\b(it is important to|in order to|there (is|are)|the fact that|it should be noted|due to the fact|a number of|at this point in time|is able to|has the ability to|make use of|in terms of)\b/gi;
const SKIP = /code\/|\.swift$|\.kt$|\.html$|schema/;

function strings(file: string): string[] {
  const raw = fs.readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    const out: string[] = [];
    const walk = (v: unknown) => {
      if (typeof v === "string") {
        if (!v.includes("\n") && /\s/.test(v)) out.push(v);
      } else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    walk(JSON.parse(raw));
    return out;
  }
  return [...raw.matchAll(/"((?:[^"\\\n]|\\.){20,})"/g)].map((m) => m[1]);
}

function walkDir(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walkDir(p) : /\.(ts|json)$/.test(p) && !SKIP.test(p) ? [p] : [];
  });
}

const rows = walkDir(ROOT).map((file) => {
  const text = strings(file).join(" ");
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = Math.max(text.split(/[.!?]+\s/).length, 1);
  const toBe = (text.match(TO_BE) ?? []).length;
  const windups = (text.match(WINDUPS) ?? []).length;
  const passives = (text.match(PASSIVE) ?? []).length;
  return { file: file.replace(`${ROOT}/`, ""), words, perSentence: +(words / sentences).toFixed(1), toBePer100: +((100 * toBe) / Math.max(words, 1)).toFixed(1), passives, windups };
});
console.table(rows.filter((r) => r.words > 100).sort((a, b) => b.toBePer100 - a.toBePer100));
