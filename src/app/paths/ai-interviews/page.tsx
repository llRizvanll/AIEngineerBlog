import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Footer } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { PathContinue, type LessonRow } from "@/components/ai-paths/Progress";
import { PromptBuilder } from "@/components/ai-paths/PromptBuilder";
import { AI_PATHS, BASICS, BASIC_CARD_COUNT, LESSON_COUNT } from "@/content/ai-interviews";
import { aiPathHref } from "@/lib/routes";
import { breadcrumbLd, courseLd } from "@/lib/site";
import { AI_BASICS_HREF, AI_PATHS_HREF } from "@/config/constants";
import { AI_PATHS_PAGE_TITLE, AI_PATHS_PAGE_DESCRIPTION } from "@/content/page-copy";
import { AI_PATHS_COPY } from "@/content/pages/paths-ai-interviews";

export const metadata: Metadata = {
  title: AI_PATHS_PAGE_TITLE,
  description: AI_PATHS_PAGE_DESCRIPTION,
  keywords: ["AI interview preparation", "AI-enabled coding interview", "AI engineer interview questions", "RAG interview", "agent design interview", "evals interview", "mock interview prompts"],
};

export default function AiInterviewsPage() {
  const all: LessonRow[] = AI_PATHS.flatMap((p) => p.lessons.map((l) => ({ path: p.id, slug: l.slug, stop: l.stop, title: l.title, question: l.question, minutes: l.minutes })));
  return (
    <main className="pg">
      <JsonLd data={courseLd({ title: AI_PATHS_PAGE_TITLE, description: AI_PATHS_PAGE_DESCRIPTION, path: AI_PATHS_HREF, parts: AI_PATHS.map((p) => ({ title: p.title, path: aiPathHref(p.id) })) })} />
      <JsonLd data={breadcrumbLd([["Home", "/"], [AI_PATHS_PAGE_TITLE, AI_PATHS_HREF]])} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href={AI_PATHS_COPY.curriculum.href}>{AI_PATHS_COPY.curriculum.label}</Link> · {LESSON_COUNT} lessons · {BASIC_CARD_COUNT} cards
          </div>
          <h1>
            {AI_PATHS_COPY.title.lead}<span className="serif grad-text">{AI_PATHS_COPY.title.accent}</span>
          </h1>
          <p>{AI_PATHS_COPY.intro}</p>
          <StudyWithAI title={AI_PATHS_COPY.studyTitle} />
          <PathContinue lessons={all} />
        </section>

        <div className="section-h">
          <h2>{AI_PATHS_COPY.paths.title}</h2>
          <span>{AI_PATHS_COPY.paths.blurb}</span>
        </div>
        <div className="ip-paths">
          {AI_PATHS.map((p, i) => (
            <Link key={p.id} href={aiPathHref(p.id)} className="ip-path" style={{ "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties}>
              <small>
                {AI_PATHS_COPY.paths.tag} {i + 1} · {p.lessons.length} {AI_PATHS_COPY.paths.lessons}
              </small>
              <h3>{p.title}</h3>
              <p>{p.blurb}</p>
            </Link>
          ))}
        </div>

        <div className="section-h">
          <h2>{AI_PATHS_COPY.basics.title}</h2>
          <span>{AI_PATHS_COPY.basics.blurb}</span>
        </div>
        <Link href={AI_BASICS_HREF} className="ip-basics">
          <div>
            <h3>{BASICS.length} skills, {BASIC_CARD_COUNT} cards, and a short drill for each</h3>
            <p>{BASICS.map((b) => b.title).join(" · ")}</p>
          </div>
          <span className="btn">{AI_PATHS_COPY.basics.cta}</span>
        </Link>

        <div className="section-h">
          <h2>{AI_PATHS_COPY.mock.title}</h2>
          <span>{AI_PATHS_COPY.mock.blurb}</span>
        </div>
        <PromptBuilder />

        <p className="ip-note">
          <b>{AI_PATHS_COPY.note.lead}</b>
          {AI_PATHS_COPY.note.text}
        </p>
      </div>
      <Footer>{AI_PATHS_COPY.footer}</Footer>
    </main>
  );
}
