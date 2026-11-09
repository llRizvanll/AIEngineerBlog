#!/usr/bin/env node
/* Fingerprints every built page, so a refactor can prove which pages changed and which did not.
   Usage:
     node scripts/snapshot-pages.mjs save <file>       record the pages in out/
     node scripts/snapshot-pages.mjs compare <file>    list pages that differ from a recorded snapshot
   Build hashes, scripts, links and styles are stripped; only the page's own markup and text are compared. */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "_next") continue;
      yield* walk(p);
    } else if (e.name === "index.html") yield p;
  }
}

/** Optional: SNAPSHOT_STRIP="<regex>" removes matching markup from both sides, for a refactor that deliberately deletes an element. */
const STRIP = process.env.SNAPSHOT_STRIP ? new RegExp(process.env.SNAPSHOT_STRIP, "g") : null;

const normalise = (html) =>
  (STRIP ? html.replace(STRIP, "") : html)
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<link[^>]*>/g, "")
    .replace(/<meta name="next-size-adjust"[^>]*>/g, "")   // framework tag whose position in <head> varies
    .replace(/<!-- -->/g, "")                              // React's marker between adjacent text pieces: invisible
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/\/_next\/static\/[^"')\s]+/g, "/_next/static/*")
    .replace(/\s+/g, " ")
    .trim();

function snapshot() {
  const out = {};
  for (const file of walk(OUT)) {
    const route = "/" + path.relative(OUT, path.dirname(file)).replace(/\\/g, "/");
    out[route === "/." ? "/" : route] = createHash("sha1").update(normalise(fs.readFileSync(file, "utf8"))).digest("hex").slice(0, 12);
  }
  return out;
}

const [mode, file] = process.argv.slice(2);
if (!file || !["save", "compare"].includes(mode)) {
  console.error("usage: snapshot-pages.mjs save|compare <file>");
  process.exit(2);
}
const now = snapshot();
if (mode === "save") {
  fs.writeFileSync(file, JSON.stringify(now, null, 1));
  console.log(`saved ${Object.keys(now).length} pages to ${file}`);
} else {
  const before = JSON.parse(fs.readFileSync(file, "utf8"));
  const changed = Object.keys(now).filter((r) => before[r] && before[r] !== now[r]);
  const added = Object.keys(now).filter((r) => !before[r]);
  const removed = Object.keys(before).filter((r) => !now[r]);
  console.log(`${Object.keys(now).length} pages: ${changed.length} changed, ${added.length} added, ${removed.length} removed`);
  if (changed.length) console.log("changed:", changed.slice(0, 30).join(" "));
  if (added.length) console.log("added:", added.join(" "));
  if (removed.length) console.log("removed:", removed.join(" "));
  process.exit(changed.length + removed.length ? 1 : 0);
}
