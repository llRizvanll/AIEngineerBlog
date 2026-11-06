/* Keeps explanations honest: each note must name something that exists in the code it explains. */
import fs from "node:fs";
import { CODE, LESSON_CODE, PAGE_CODE } from "../../src/content/code-docs.ts";

const DIRS = { programme: "src/content/programme/code", modules: "src/content/modules/code", protocols: "src/content/protocol-code" } as const;
const failed: string[] = [];
let checked = 0;

const squash = (s: string) => s.replace(/\s+/g, "");
const regionOf = (text: string, region?: string) => {
  if (!region) return text;
  const start = text.indexOf(`// region: ${region}\n`);
  if (start === -1) return "";
  return text.slice(start, text.indexOf("// endregion", start));
};

for (const [id, d] of Object.entries(CODE)) {
  const path = `${DIRS[d.dir]}/${d.file}`;
  if (!fs.existsSync(path)) { failed.push(`${id}: missing file ${path}`); continue; }
  const code = squash(regionOf(fs.readFileSync(path, "utf8"), d.region));
  if (!code) failed.push(`${id}: missing region ${d.region}`);
  for (const [key] of d.points) {
    checked++;
    // "x(...)" and "x { ... }" abbreviate arguments, so compare the parts around each ellipsis.
    const pieces = squash(key).split("...").filter(Boolean);
    if (!pieces.every((p) => code.includes(p))) failed.push(`${id}: "${key}" is not in ${d.file}`);
  }
}
for (const ids of [...Object.values(LESSON_CODE), ...Object.values(PAGE_CODE)]) {
  for (const id of ids) if (!CODE[id]) failed.push(`unknown code doc ${id}`);
}
if (failed.length) {
  failed.forEach((f) => console.log("  FAILED", f));
  process.exit(1);
}
console.log(`${checked} code notes match their code`);
