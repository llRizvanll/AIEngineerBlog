/* Run after build:static. Follows links from the menu destinations, ignoring the menu, tab bar and footer that appear on
   every page, and reports pages that need three or more clicks, or can't be reached by links at all. Usage: npm run check:reach */
import fs from "node:fs";
import path from "node:path";

const OUT = "out";
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(OUT).filter((f) => f.endsWith("index.html"));
const routeOf = (f) => ("/" + path.relative(OUT, path.dirname(f)).replace(/\\/g, "/") + "/").replace(/^\/\/$/, "/");
const norm = (h) => {
  const p = h.split("#")[0].split("?")[0];
  return p.endsWith("/") ? p : p + "/";
};
const strip = (html) =>
  html
    .replace(/<header class="mast[\s\S]*?<\/header>/, "")
    .replace(/<nav class="tabbar[\s\S]*?<\/nav>/, "")
    .replace(/<footer[\s\S]*?<\/footer>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "");

const pages = new Map();
for (const f of files) {
  const html = fs.readFileSync(f, "utf8");
  const links = new Set([...strip(html).matchAll(/<a [^>]*href="(\/[^"#?]*)[^"]*"/g)].map((m) => norm(m[1])));
  pages.set(routeOf(f), links);
}
// The menu: the skill groups on the home page, which list the same items as the menu.
const home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
const menu = new Set([...(home.match(/<header class="mast[\s\S]*?<\/header>/)?.[0] ?? "").matchAll(/href="(\/[^"#?]*)"/g)].map((m) => norm(m[1])));
const skills = home;
const sheetish = [...skills.matchAll(/href="(\/[^"#?]*)/g)].map((m) => norm(m[1]));
sheetish.forEach((h) => menu.add(h));
menu.delete("/");

const depth = new Map();
let frontier = [...menu].filter((m) => pages.has(m));
frontier.forEach((m) => depth.set(m, 0));
while (frontier.length) {
  const next = [];
  for (const p of frontier) for (const l of pages.get(p) ?? []) if (pages.has(l) && !depth.has(l)) (depth.set(l, depth.get(p) + 1), next.push(l));
  frontier = next;
}
const needTrail = /^\/(deep|interview|modules|coding|mobile-coding|protocols|series)\/[^/]+\/$/;
const noTrail = [...pages.keys()].filter((r) => needTrail.test(r) && !fs.readFileSync(path.join(OUT, r, "index.html"), "utf8").includes('class="trail"'));
const all = [...pages.keys()].filter((r) => !/404|_not-found/.test(r) && r !== "/");
const lost = all.filter((r) => !depth.has(r));
const deep = all.filter((r) => (depth.get(r) ?? 0) >= 3);
const by = {};
for (const r of all) by[depth.get(r) ?? "unreachable"] = (by[depth.get(r) ?? "unreachable"] ?? 0) + 1;
console.log("pages by clicks from a menu page:", by);
if (lost.length) console.log("UNREACHABLE by links:\n  " + lost.join("\n  "));
if (deep.length) console.log("3+ clicks:\n  " + deep.join("\n  "));
if (noTrail.length) console.log("NO TRAIL (no menu group or hub shown):\n  " + noTrail.join("\n  "));
process.exit(lost.length || noTrail.length ? 1 : 0);
