import fs from "node:fs";
import path from "node:path";

/** Reads a tested Swift solution at build time. Server-only. */
export function swiftSource(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), "src/content/mobile", `${file}.swift`), "utf8").replace(/\n+$/, "");
}

export function swiftLines(file: string): string[] {
  return swiftSource(file).split("\n");
}
