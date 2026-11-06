import fs from "node:fs";
import path from "node:path";

/** Reads a tested code sample at build time. Server-only. */
export function moduleCode(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), "src/content/modules/code", file), "utf8").replace(/\n+$/, "");
}
