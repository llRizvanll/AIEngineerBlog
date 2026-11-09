import { ALL_BEHAVIORAL, BEHAVIORAL_SOURCE } from "@/content/behavioral";
import { PATTERNS } from "@/content/coding";
import { MORE_PROBLEMS } from "@/content/coding-more";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";
import { AI_REELS, FLASHCARDS, MODULES } from "@/content/modules";
import { durationCategory, type AssetFormat, type CognitiveLevel, type ComplexityTier, type CurationMetadata, type Domain, type PortalAsset, type PortalMode } from "@/types/portal";
import { CASES, CRITICAL, DEEP, POSTS, PROTOCOLS, REELS, SERIES } from "./content";
import { validateAssets } from "./catalog-validate";
import { SECTION_NAME } from "@/content/ui-copy";
import { CASE_META, DEEP_META, COLLECTION_DOMAIN, COLLECTION_CURRICULUM, KIND_NOTE } from "@/content/catalog-meta";
import { SERIES_BLURBS } from "@/content/site";

/* One catalog of every learning asset, in the spec's metadata format. Built once at build time. */

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const plain = (s: string) => s.replace(/\*\*|`/g, "").replace(/\s+/g, " ").trim();
const firstSentence = (s: string) => plain(s).match(/^.*?[.!?](?=\s|$)/)?.[0] ?? plain(s);
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

interface Input {
  id: string;
  title: string;
  domain: Domain;
  mode: PortalMode;
  format: AssetFormat;
  level: CognitiveLevel;
  tier: ComplexityTier;
  minutes: number;
  curation: [CurationMetadata["curationStage"], CurationMetadata["pkmCycle"]];
  commentary: string;
  source?: string;
  topics: [string, string];
  href: string;
  curriculum?: number;
}

function asset(a: Input): PortalAsset {
  const minutes = Math.max(1, Math.round(a.minutes));
  const out: PortalAsset = {
    assetId: slug(a.id),
    title: clip(plain(a.title), 120),
    domain: a.domain,
    mode: a.mode,
    format: a.format,
    cognitiveLevel: a.level,
    complexityTier: a.tier,
    estimatedDuration: { category: durationCategory(minutes), minutes },
    curationMetadata: { curationStage: a.curation[0], pkmCycle: a.curation[1], contextualCommentary: clip(plain(a.commentary), 220) },
    compositeTags: [`domain:${a.domain}:${slug(a.topics[0]) || "general"}`, `mode:${a.mode}:${a.format}`, `tier:${a.tier}:${slug(a.topics[1]) || "general"}`],
    href: a.href,
  };
  if (a.source) out.curationMetadata.sourceAttribution = a.source;
  if (a.curriculum) out.curriculum = a.curriculum;
  return out;
}

const modeOf = (format: AssetFormat): PortalMode =>
  format === "long-read" || format === "deep-dive" || format === "protocol" ? "learn" : format === "flashcard" || format === "reel" ? "revise" : "practice";

const BEHAVIORAL_SOURCE_LABEL = "Question from " + BEHAVIORAL_SOURCE.name;

let cache: PortalAsset[] | null = null;

export function buildCatalog(): PortalAsset[] {
  if (cache) return cache;
  const out: PortalAsset[] = [];

  // Long reads
  for (const s of SERIES) {
    out.push(asset({ id: `series-${s.id}`, title: s.title, domain: "mobile-systems", mode: "learn", format: "long-read", level: "understand", tier: "tier1-epitome", minutes: s.mins, curation: ["conceptualize", "sense"], commentary: SERIES_BLURBS[s.id] ?? s.blurb, topics: ["offline-sync", s.id], href: s.href }));
  }
  // Deep dives
  for (const d of DEEP) {
    const meta = DEEP_META[d.id] ?? { domain: "mobile-systems" as Domain };
    out.push(asset({ id: `deep-${d.id}`, title: d.title, domain: meta.domain, curriculum: meta.curriculum, mode: "learn", format: "deep-dive", level: "analyze", tier: "tier2-intermediate", minutes: 20, curation: ["critique", "sense"], commentary: firstSentence(d.summary), topics: [d.id, "internals"], href: `/deep/${d.id}` }));
  }
  // Protocols
  for (const p of PROTOCOLS) {
    out.push(asset({ id: `protocol-${p.id}`, title: `${p.name}: ${p.full}`, domain: "infrastructure", mode: "learn", format: "protocol", level: "understand", tier: "tier2-intermediate", minutes: 10, curation: ["conceptualize", "seek"], commentary: p.tag, topics: [p.layer, p.id], href: `/protocols/${p.id}` }));
  }
  // Coding patterns and their extra problems
  for (const p of PATTERNS) {
    out.push(asset({ id: `pattern-${p.id}`, title: `${p.name} pattern`, domain: "core-engineering", mode: "practice", format: "coding-pattern", level: "apply", tier: "tier2-intermediate", minutes: 15, curation: ["categorize", "sense"], commentary: p.tagline, topics: [p.id, "template"], href: `/coding/${p.id}` }));
    (MORE_PROBLEMS[p.id] ?? []).forEach((m, k) => {
      const tier: ComplexityTier = m.level === "Easy" ? "tier1-epitome" : m.level === "Medium" ? "tier2-intermediate" : "tier3-edge-cases";
      out.push(asset({ id: `problem-${p.id}-${k}`, title: m.problem, domain: "core-engineering", mode: "practice", format: "coding-pattern", level: "apply", tier, minutes: 10, curation: ["categorize", "sense"], commentary: m.prompt, topics: [p.id, m.level], href: `/coding/${p.id}#more-${k}` }));
    });
  }
  // Machine coding
  for (const m of MOBILE_PROBLEMS) {
    out.push(asset({ id: `machine-${m.id}`, title: m.title, domain: "mobile-systems", mode: "practice", format: "machine-coding", level: "create", tier: m.level === "Hard" ? "tier3-edge-cases" : "tier2-intermediate", minutes: m.minutes, curation: ["circulate", "share"], commentary: m.tagline, source: "Tested in tests/mobile/MobileTests.kt", topics: [m.id, m.tags[0]], href: `/mobile-coding/${m.id}` }));
  }
  // System design rounds
  for (const c of CASES) {
    const meta = CASE_META[c.id] ?? { domain: "mobile-systems" as Domain };
    out.push(asset({ id: `round-${c.id}`, title: c.title, domain: meta.domain, curriculum: meta.curriculum, mode: "practice", format: "system-design", level: "create", tier: "tier3-edge-cases", minutes: c.minutes, curation: ["circulate", "share"], commentary: firstSentence(c.why), topics: [c.id, c.tags[0] ?? "design"], href: `/interview/${c.id}` }));
  }
  // Behavioral questions
  for (const b of ALL_BEHAVIORAL) {
    out.push(asset({ id: `behavioral-${b.id}`, title: b.q, domain: "core-engineering", mode: "practice", format: "behavioral", level: "evaluate", tier: "tier2-intermediate", minutes: 3, curation: ["critique", "share"], commentary: b.testing, source: b.source === "extra" ? undefined : BEHAVIORAL_SOURCE_LABEL, topics: [b.theme, "star"], href: `/problem-solving#bq-${b.id}` }));
  }
  // Flashcards from the rounds
  for (const c of CASES) {
    const meta = CASE_META[c.id] ?? { domain: "mobile-systems" as Domain };
    (CRITICAL[c.id] ?? []).forEach((q, i) => {
      const tier: ComplexityTier = q[1] === "Incident" ? "tier3-edge-cases" : "tier2-intermediate";
      out.push(asset({ id: `card-${c.id}-${i}`, title: q[2], domain: meta.domain, curriculum: meta.curriculum, mode: "revise", format: "flashcard", level: "remember", tier, minutes: 1, curation: ["categorize", "seek"], commentary: KIND_NOTE[q[1]] ?? "", source: `${c.title} · ${SECTION_NAME[q[0]] ?? q[0]}`, topics: [c.id, q[1]], href: `/revise?card=${c.id}:${i}` }));
    });
  }
  // Reels
  const aiReel = new Map(AI_REELS.map((r) => [r.reel.id, r]));
  const moduleReel = new Map(MODULES.map((m) => [`mod-${m.assetId}`, m]));
  for (const col of REELS) {
    for (const r of col.reels) {
      const spec = aiReel.get(r.id);
      const mod = moduleReel.get(r.id);
      const caseId = r.cta?.post?.startsWith("case-") ? r.cta.post.slice(5) : undefined;
      const domain: Domain = spec?.domain ?? mod?.domain ?? (caseId ? CASE_META[caseId]?.domain : undefined) ?? COLLECTION_DOMAIN[col.id] ?? "mobile-systems";
      const curriculum = spec?.curriculum ?? mod?.curriculum ?? (caseId ? CASE_META[caseId]?.curriculum : undefined) ?? COLLECTION_CURRICULUM[col.id];
      const minutes = r.template === "read" ? r.pages.length * 0.6 : 2;
      out.push(asset({ id: `reel-${r.id}`, title: r.title, domain, curriculum, mode: "revise", format: "reel", level: col.group === "quick" ? "remember" : "understand", tier: spec?.tier ?? (col.group === "quick" ? "tier1-epitome" : "tier2-intermediate"), minutes, curation: ["categorize", "seek"], commentary: spec?.commentary ?? mod?.commentary ?? col.blurb, source: spec?.source ?? mod?.source, topics: spec?.topics ?? [col.id, r.template], href: `/reels/${col.id}?r=${encodeURIComponent(r.id)}` }));
    }
  }
  // Spec modules and flashcards
  for (const m of MODULES) {
    out.push(asset({ id: m.assetId, title: m.title, domain: m.domain, curriculum: m.curriculum, mode: modeOf(m.format), format: m.format, level: m.cognitiveLevel, tier: m.complexityTier, minutes: m.minutes, curation: m.curation, commentary: m.commentary, source: m.source, topics: m.topics, href: `/modules/${m.assetId}` }));
  }
  for (const f of FLASHCARDS) {
    out.push(asset({ id: f.assetId, title: f.title, domain: f.domain, curriculum: f.curriculum, mode: "revise", format: "flashcard", level: "remember", tier: f.complexityTier, minutes: f.minutes, curation: ["categorize", "seek"], commentary: f.commentary, source: f.source, topics: f.topics, href: `/revise?card=${f.assetId}` }));
  }

  const errors = validateAssets(out);
  if (errors.length) throw new Error(`Invalid catalog assets:\n${errors.slice(0, 30).join("\n")}`);
  cache = out;
  return out;
}

export const assetByHref = (href: string) => buildCatalog().find((a) => a.href === href);

/** Backward design: the outcome this page promises, for pages without a hand-written one. */
export function outcomeFor(a: PortalAsset): string {
  const title = a.title.replace(/^The /, "");
  // Lowercase a leading word, but leave acronyms and product names alone (SQLite, HNSW, vLLM).
  const t = /^[A-Z][a-z]/.test(a.title) && !/^[A-Z][a-z]+[A-Z]/.test(a.title) ? a.title.charAt(0).toLowerCase() + a.title.slice(1) : a.title;
  switch (a.format) {
    case "system-design":
      return `Design ${t} in ${a.estimatedDuration.minutes} minutes, and defend each trade-off.`;
    case "machine-coding":
      return `Build ${t} in ${a.estimatedDuration.minutes} minutes, edge cases included.`;
    case "coding-pattern":
      return `Spot ${title.replace(/ pattern$/, "").toLowerCase()} from a problem statement, and code it from memory.`;
    case "protocol":
      return `Trace a ${title.split(":")[0]} exchange and decode it byte by byte.`;
    case "deep-dive":
      return `Explain ${t} and answer its interview questions.`;
    default:
      return `Explain ${t} end to end, and name how it fails.`;
  }
}

/** Backward design: the evidence. A practice asset that tests what this page teaches. */
export function evidenceFor(a: PortalAsset): PortalAsset | undefined {
  if (a.mode !== "learn") return undefined;
  const pool = buildCatalog().filter((x) => x.mode === "practice" && x.format !== "behavioral");
  return (
    (a.curriculum ? pool.find((x) => x.curriculum === a.curriculum && x.domain === a.domain && x.href.startsWith("/modules/")) : undefined) ??
    (a.curriculum ? pool.find((x) => x.curriculum === a.curriculum) : undefined) ??
    pool.find((x) => x.domain === a.domain && x.format === "system-design") ??
    pool.find((x) => x.domain === a.domain)
  );
}
