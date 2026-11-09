import fs from "node:fs";
import path from "node:path";
import type { CodeDoc } from "@/content/code-docs";
import { CODE_DIRS } from "@/config/constants";

/** Reads the code the tests run, cut to one region when the doc names one. Server-only. */
export function codeOf(d: CodeDoc): string {
  const text = fs.readFileSync(path.join(process.cwd(), CODE_DIRS[d.dir], d.file), "utf8");
  let lines = text.split("\n");
  if (d.region) {
    const start = lines.findIndex((l) => l.trim() === `// region: ${d.region}`);
    if (start === -1) throw new Error(`${d.file} has no region ${d.region}`);
    const end = lines.findIndex((l, i) => i > start && l.trim() === "// endregion");
    lines = lines.slice(start + 1, end);
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length));
    lines = lines.map((l) => l.slice(indent));
  }
  const body = lines.filter((l) => !/^\s*\/\/ (region: .*|endregion)$/.test(l)).join("\n").replace(/\n+$/, "");
  return d.tail ? `${body}\n${d.tail}` : body;
}
