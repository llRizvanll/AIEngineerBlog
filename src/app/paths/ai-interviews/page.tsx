import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Footer } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { PathContinue, type LessonRow } from "@/components/ai-paths/Progress";
import { PromptBuilder } from "@/components/ai-paths/PromptBuilder";
import { AI_PATHS, BASICS, BASIC_CARD_COUNT, LESSON_COUNT } from "@/content/ai-interviews";
import { AI_BASICS_HREF, AI_PATHS_HREF, aiPathHref } from "@/lib/routes";
import { breadcrumbLd, courseLd } from "@/lib/site";

const TITLE = "Crack AI interviews: hacks, rounds and a plan";
const DESCRIPTION = "Prepare for AI-enabled coding rounds and AI engineer interviews: tested AI interview hacks, every round explained, a study plan, critical basics to memorise, and a mock interviewer you can build.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["AI interview preparation", "AI-enabled coding interview", "AI engineer interview questions", "RAG interview", "agent design interview", "evals interview", "mock interview prompts"],
};

export default function AiInterviewsPage() {
  const all: LessonRow[] = AI_PATHS.flatMap((p) => p.lessons.map((l) => ({ path: p.id, slug: l.slug, stop: l.stop, title: l.title, question: l.question, minutes: l.minutes })));
  return (
    <main className="pg">
      <JsonLd data={courseLd({ title: TITLE, description: DESCRIPTION, path: AI_PATHS_HREF, parts: AI_PATHS.map((p) => ({ title: p.title, path: aiPathHref(p.id) })) })} />
      <JsonLd data={breadcrumbLd([["Home", "/"], [TITLE, AI_PATHS_HREF]])} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href="/aiengine">Curriculum</Link> · {LESSON_COUNT} lessons · {BASIC_CARD_COUNT} cards
          </div>
          <h1>
            Crack AI interviews, <span className="serif grad-text">the honest way.</span>
          </h1>
          <p>Interviews have changed. Some companies now put an AI assistant in the room and score how you use it, while AI teams have added rounds on retrieval, agents and evals. These four paths cover what to do about it, starting from the basics.</p>
          <PathContinue lessons={all} />
        </section>

        <div className="section-h">
          <h2>Pick a path</h2>
          <span>New here? Start with the rounds</span>
        </div>
        <div className="ip-paths">
          {AI_PATHS.map((p, i) => (
            <Link key={p.id} href={aiPathHref(p.id)} className="ip-path" style={{ "--c1": p.color[0], "--c2": p.color[1] } as CSSProperties}>
              <small>
                Path {i + 1} · {p.lessons.length} lessons
              </small>
              <h3>{p.title}</h3>
              <p>{p.blurb}</p>
            </Link>
          ))}
        </div>

        <div className="section-h">
          <h2>Critical basics</h2>
          <span>Read, memorise and practise in spare minutes</span>
        </div>
        <Link href={AI_BASICS_HREF} className="ip-basics">
          <div>
            <h3>{BASICS.length} skills, {BASIC_CARD_COUNT} cards, and a short drill for each</h3>
            <p>{BASICS.map((b) => b.title).join(" · ")}</p>
          </div>
          <span className="btn">Open the basics →</span>
        </Link>

        <div className="section-h">
          <h2>Build a mock interview prompt</h2>
          <span>Works with any assistant</span>
        </div>
        <PromptBuilder />

        <p className="ip-note">
          <b>How we source this.</b> Each lesson names who said what. Few companies publish their formats, so much of what&rsquo;s known comes from prep vendors and candidate reports, and formats change quickly. We couldn&rsquo;t read Reddit or X threads directly with our tools, so community ideas here come from public write-ups. Meera, who appears throughout, is a made-up example. Confirm your own loop with your recruiter.
        </p>
      </div>
      <Footer>AI Engineer · AI interview paths · progress stays in this browser</Footer>
    </main>
  );
}
