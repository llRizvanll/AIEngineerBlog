import { codeOf } from "@/lib/code-source";
import { AI_PATHS, BASICS } from "@/content/ai-interviews";
import { SOURCES } from "@/content/ai-interviews/sources";
import { CODE } from "@/content/code-docs";

import { aiLessonHref, aiPathHref } from "@/lib/routes";
import { buildSearchIndex, type SearchItem } from "@/lib/search";
import { absoluteUrl } from "@/lib/site";
import { LLMS_ABOUT, LLMS_SECTIONS, SITE } from "@/content/site";

const line = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note.replace(/\s+/g, " ").trim()}` : ""}`;

/** The short index, following the llms.txt convention. */
export function llmsIndex(): string {
  const items = buildSearchIndex();
  const out = [`# ${SITE.name}`, "", `> ${LLMS_ABOUT}`, "", `Full text of the AI interview paths: ${absoluteUrl("/llms-full.txt").replace(/\/$/, "")}`, "", "## Crack AI interviews", "", line("All paths", "/paths/ai-interviews", "Hacks, rounds, a study plan and a project."), line("Critical basics", "/paths/ai-interviews/basics", "Essentials to read, memorise and practise.")];
  for (const p of AI_PATHS) {
    out.push("", `## ${p.title}`, "", `${p.blurb}`, "");
    for (const l of p.lessons) out.push(line(l.title, aiLessonHref(p.id, l.slug), l.question));
  }
  for (const [kind, title] of LLMS_SECTIONS) {
    const rows = items.filter((i) => i.kind === kind && !/[?#]/.test(i.href));
    if (rows.length === 0) continue;
    out.push("", `## ${title}`, "");
    for (const r of rows) out.push(line(r.title, r.href, r.summary));
  }
  return out.join("\n") + "\n";
}

/** The complete text of the AI interview paths, for tools that want it all in one fetch. */
export function llmsFull(): string {
  const out = [`# ${SITE.name}: AI interview paths and critical basics`, "", `> ${LLMS_ABOUT}`, ""];
  out.push("## Critical basics", "");
  for (const s of BASICS) {
    out.push(`### ${s.title}`, "", s.why, "", ...s.read.flatMap((r) => [r, ""]));
    for (const c of s.memorise) out.push(`Q: ${c.q}`, `A: ${c.a}`, "");
  }
  for (const p of AI_PATHS) {
    out.push(`## ${p.title}`, "", `URL: ${absoluteUrl(aiPathHref(p.id))}`, "", p.blurb, "");
    for (const l of p.lessons) {
      out.push(`### ${l.title}`, "", `URL: ${absoluteUrl(aiLessonHref(p.id, l.slug))}`, "", `Question: ${l.question}`, "", ...l.plain.flatMap((x) => [x, ""]));
      for (const [t, x] of l.words) out.push(`- ${t}: ${x}`);
      out.push("", "Steps:", "");
      l.steps.forEach(([t, x], i) => out.push(`${i + 1}. ${t}. ${x}`));
      out.push("");
      for (const [h, ps] of l.idea) out.push(`${h}: ${ps.join(" ")}`, "");
      if (l.table) {
        out.push(`${l.table.title}${l.table.note ? ` (${l.table.note})` : ""}`, "", `| ${l.table.head.join(" | ")} |`, `| ${l.table.head.map(() => "---").join(" | ")} |`);
        for (const r of l.table.rows) out.push(`| ${r.join(" | ")} |`);
        out.push("");
      }
      for (const pr of l.prompts ?? []) out.push(`Prompt, ${pr.title}:`, "", "```", pr.text, "```", "");
      for (const id of l.code) {
        const d = CODE[id];
        out.push(`Code, ${d.title}. ${d.lead}`, "", "```ts", codeOf(d), "```", "");
        for (const [k, x] of d.points) out.push(`- \`${k}\`: ${x}`);
        out.push("");
      }
      for (const [t, x] of l.failures) out.push(`- Failure, ${t}: ${x}`);
      out.push("");
      for (const [q, a] of l.check) out.push(`Q: ${q}`, `A: ${a}`, "");
      if (l.sources.length) {
        out.push("Sources:", "");
        for (const k of l.sources) out.push(`- ${SOURCES[k].label} (${SOURCES[k].who}): ${SOURCES[k].url}`);
        out.push("");
      }
    }
  }
  return out.join("\n");
}
