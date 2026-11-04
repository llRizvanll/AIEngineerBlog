import type { Metadata } from "next";
import { CASES, totalCritical } from "@/lib/content";
import { GLOSSARY, PATHS, PHASES, lessonTitle } from "@/lib/curriculum";
import { Footer } from "@/components/ui";
import { Curriculum } from "@/components/Curriculum";

export const metadata: Metadata = { title: "AIEngine", description: "One curriculum for the principal engineer loop with AI." };

export default function AIEnginePage() {
  const paths = PATHS.map((p) => ({ ...p, items: p.hrefs.map((h) => ({ href: h, title: lessonTitle(h) })) }));
  return (
    <main>
      <Curriculum phases={PHASES} paths={paths} glossary={GLOSSARY} caseIds={CASES.map((c) => c.id)} totalCrit={totalCritical()} />
      <Footer>AI Engineer · AIEngine</Footer>
    </main>
  );
}
