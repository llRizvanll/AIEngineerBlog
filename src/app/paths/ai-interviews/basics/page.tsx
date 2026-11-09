import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { BasicsStudy } from "@/components/ai-paths/BasicsStudy";
import { BASICS } from "@/content/ai-interviews";
import { basicCards } from "@/lib/ai-basics-cards";

import { articleLd, faqLd } from "@/lib/site";
import { AI_BASICS_HREF, AI_PATHS_HREF } from "@/config/constants";
import { AI_BASICS_PAGE_TITLE, AI_BASICS_PAGE_DESCRIPTION } from "@/content/page-copy";
import { AI_BASICS_COPY } from "@/content/pages/paths-ai-interviews-basics";

export const metadata: Metadata = { title: AI_BASICS_PAGE_TITLE, description: AI_BASICS_PAGE_DESCRIPTION };

function basicsMarkdown(): string {
  return BASICS.map((b) => [`## ${b.title}`, b.why, ...b.read, "### Remember", ...b.memorise.map((c) => `- **${c.q}** ${c.a}`), `### Drill: ${b.drill.title} (${b.drill.minutes} min)`, ...b.drill.steps.map((x, i) => `${i + 1}. ${x}`)].join("\n\n")).join("\n\n");
}

export default function BasicsPage() {
  return (
    <main className="pg">
      <JsonLd data={articleLd({ title: AI_BASICS_PAGE_TITLE, description: AI_BASICS_PAGE_DESCRIPTION, path: AI_BASICS_HREF, section: "AI interview preparation" })} />
      <JsonLd data={faqLd(BASICS.flatMap((b) => b.memorise.map((c): [string, string] => [c.q, c.a])))} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href={AI_PATHS_HREF}>{AI_BASICS_COPY.parent.label}</Link>{AI_BASICS_COPY.kickerTail}
          </div>
          <h1>
            {AI_BASICS_COPY.title.lead}<span className="serif grad-text">{AI_BASICS_COPY.title.accent}</span>
          </h1>
          <p>
            {BASICS.length}
            {AI_BASICS_COPY.introTail}
          </p>
          <StudyWithAI title={AI_BASICS_PAGE_TITLE} markdown={basicsMarkdown()} />
        </section>
        <BasicsStudy skills={BASICS} cards={basicCards(true)} />
      </div>
      <Footer>{AI_BASICS_COPY.footer}</Footer>
    </main>
  );
}
