import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { BasicsStudy } from "@/components/ai-paths/BasicsStudy";
import { BASICS } from "@/content/ai-interviews";
import { basicCards } from "@/lib/ai-basics-cards";
import { AI_BASICS_HREF, AI_PATHS_HREF } from "@/lib/routes";
import { articleLd, faqLd } from "@/lib/site";

const TITLE = "Critical basics for AI interviews";
const DESCRIPTION = "The essentials of prompting, code review, debugging, LLMs, RAG, agents and evals. Read them, memorise the cards with spaced repetition, and practise with short drills.";

export const metadata: Metadata = { title: TITLE, description: DESCRIPTION };

function basicsMarkdown(): string {
  return BASICS.map((b) => [`## ${b.title}`, b.why, ...b.read, "### Remember", ...b.memorise.map((c) => `- **${c.q}** ${c.a}`), `### Drill: ${b.drill.title} (${b.drill.minutes} min)`, ...b.drill.steps.map((x, i) => `${i + 1}. ${x}`)].join("\n\n")).join("\n\n");
}

export default function BasicsPage() {
  return (
    <main className="pg">
      <JsonLd data={articleLd({ title: TITLE, description: DESCRIPTION, path: AI_BASICS_HREF, section: "AI interview preparation" })} />
      <JsonLd data={faqLd(BASICS.flatMap((b) => b.memorise.map((c): [string, string] => [c.q, c.a])))} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href={AI_PATHS_HREF}>AI interview paths</Link> · Critical basics
          </div>
          <h1>
            Know these <span className="serif grad-text">cold.</span>
          </h1>
          <p>
            {BASICS.length} skills that AI interviews lean on. Read each one once, memorise its cards, then keep it sharp with a short drill whenever you have a few minutes.
          </p>
          <StudyWithAI title={TITLE} markdown={basicsMarkdown()} />
        </section>
        <BasicsStudy skills={BASICS} cards={basicCards(true)} />
      </div>
      <Footer>AI Engineer · critical basics · progress stays in this browser</Footer>
    </main>
  );
}
