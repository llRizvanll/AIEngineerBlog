import fs from "node:fs";
import path from "node:path";

/** Reads a tested Kotlin solution at build time. Server-only. */
export function kotlinSource(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), "src/content/mobile", `${file}.kt`), "utf8").replace(/\n+$/, "");
}

export function kotlinLines(file: string): string[] {
  return kotlinSource(file).split("\n");
}

/** The same solution in another language, read at build time. Server-only. */
export function altSource(file: string, lang: "ts" | "java"): string {
  return fs.readFileSync(path.join(process.cwd(), "src/content/mobile-alt", lang, `${file}.${lang}`), "utf8").replace(/\n+$/, "");
}
