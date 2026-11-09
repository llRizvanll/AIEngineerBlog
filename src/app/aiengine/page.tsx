import type { Metadata } from "next";
import { CASES, totalCritical } from "@/lib/content";
import { GLOSSARY, PATHS, PHASES, lessonTitle } from "@/lib/curriculum";
import { Footer } from "@/components/ui";
import { Curriculum } from "@/components/Curriculum";
import { DAYS, WEEKS } from "@/content/programme/mobile-principal";
import { AIENGINE_PAGE_META } from "@/content/pages/aiengine";

export const metadata: Metadata = AIENGINE_PAGE_META;

export default function AIEnginePage() {
  const paths = PATHS.map((p) => ({ ...p, items: p.steps.map(([h, why]) => ({ href: h, why, title: h === "/revise" ? "Revise cards" : lessonTitle(h) })) }));
  const programme = { days: DAYS.map((d) => ({ n: d.n, stop: d.stop })), blurb: `${WEEKS[1].blurb} ${WEEKS[2].blurb}` };
  return (
    <main>
      <Curriculum phases={PHASES} programme={programme} paths={paths} glossary={GLOSSARY} caseIds={CASES.map((c) => c.id)} totalCrit={totalCritical()} />
      <Footer>AI Engineer · AIEngine</Footer>
    </main>
  );
}
