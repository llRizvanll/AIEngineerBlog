/* Run after build:static. Checks what a crawler sees in the static HTML. Usage: npm run check:seo */
import fs from "node:fs";
import path from "node:path";

const OUT = "out";
const errors = [];
const warnings = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const pages = walk(OUT).filter((f) => f.endsWith("index.html") && !f.includes("_not-found") && !f.includes("404"));
const sitemap = fs.readFileSync(`${OUT}/sitemap.xml`, "utf8");
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const origin = new URL(locs[0]).origin;
const toFile = (u) => path.join(OUT, new URL(u).pathname, "index.html");
const inSitemap = new Set(locs.map(toFile));
const titles = new Map();
const NOT_LISTED = new Set([path.join(OUT, "library", "index.html")]);

for (const u of locs) if (!fs.existsSync(toFile(u))) errors.push(`sitemap points to a missing page: ${u}`);

for (const f of pages) {
  const html = fs.readFileSync(f, "utf8");
  const route = `/${path.relative(OUT, path.dirname(f))}`.replace(/\/$/, "/") ;
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  if (!title) errors.push(`${route}: no title`);
  if (!desc) errors.push(`${route}: no description`);
  else if (desc.length < 40) warnings.push(`${route}: short description (${desc.length})`);
  if (!canonical) errors.push(`${route}: no canonical`);
  else if (new URL(canonical).pathname.replace(/\/$/, "") !== route.replace(/\/$/, "") ) errors.push(`${route}: canonical is ${canonical}`);
  if (h1s === 0) warnings.push(`${route}: no h1`);
  if (h1s > 1) warnings.push(`${route}: ${h1s} h1 tags`);
  if (!html.includes('property="og:image"')) errors.push(`${route}: no og:image`);
  if (html.includes("http://localhost")) errors.push(`${route}: mentions localhost`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      JSON.parse(m[1]);
    } catch {
      errors.push(`${route}: invalid JSON-LD`);
    }
  }
  if (title) titles.set(title, [...(titles.get(title) ?? []), route]);
  if (!inSitemap.has(f) && !NOT_LISTED.has(f)) warnings.push(`${route}: not in the sitemap`);
}
for (const [t, rs] of titles) if (rs.length > 1) warnings.push(`duplicate title "${t}": ${rs.join(", ")}`);

for (const f of ["robots.txt", "llms.txt", "llms-full.txt", "og.png"]) if (!fs.existsSync(path.join(OUT, f))) errors.push(`missing ${f}`);
const robots = fs.readFileSync(`${OUT}/robots.txt`, "utf8");
if (!robots.includes(`Sitemap: ${origin}/sitemap.xml`)) errors.push("robots.txt has no sitemap line");
if (/Disallow: \/\s*$/m.test(robots)) errors.push("robots.txt blocks the site");

warnings.forEach((w) => console.log("  warn", w));
errors.forEach((e) => console.log("  FAILED", e));
console.log(`${pages.length} pages, ${locs.length} in the sitemap, ${warnings.length} warnings, ${errors.length} errors`);
process.exit(errors.length ? 1 : 0);
