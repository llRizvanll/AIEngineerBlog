import Link from "next/link";
import type { Metadata } from "next";
import { ALL_BEHAVIORAL as BEHAVIORAL, BEHAVIORAL_SOURCE, BEHAVIORAL_TIPS, STAR, THEMES } from "@/content/behavioral";
import { BehavioralList } from "@/components/prep/BehavioralList";
import { Footer } from "@/components/ui";
import { Icon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Problem-solving interview questions",
  description: "33 behavioral problem-solving questions with STAR model answers, probes and red flags.",
};

export default function ProblemSolvingPage() {
  return (
    <main className="prep-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">Behavioral round · {BEHAVIORAL.length} questions</div>
          <h1>
            Problem-solving, <span className="serif grad-text">answered.</span>
          </h1>
          <p>
            Competency questions test how you think. Each has a STAR model answer, what the panel really tests, the follow-up probe and the red flags.
          </p>
          <div className="btns">
            <Link className="btn" href="/reels/c-behavioral">
              <Icon name="play" size={16} /> Read as reels
            </Link>
            <Link className="btn ghost" href="/reels/q-star">
              STAR in 60 seconds
            </Link>
          </div>
        </section>

        <div className="star-strip">
          {STAR.map(([h, p], i) => (
            <div key={h} className="star-step" style={{ ["--i" as string]: i }}>
              <b>{h[0]}</b>
              <div>
                <h4>{h}</h4>
                <p>{p}</p>
              </div>
            </div>
          ))}
        </div>

        <BehavioralList questions={BEHAVIORAL} themes={THEMES} />

        <div className="section-h">
          <div>
            <span className="eyebrow">Habits</span>
            <h2>What makes an answer land</h2>
          </div>
        </div>
        <div className="tip-grid stagger">
          {BEHAVIORAL_TIPS.map(([t, p]) => (
            <div key={t}>
              <b>{t}</b>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <p className="source-note">
          Question list from{" "}
          <a href={BEHAVIORAL_SOURCE.url} target="_blank" rel="noopener">
            {BEHAVIORAL_SOURCE.name}
          </a>
          (questions 1–25). Questions marked “Engineering” are added for software roles. All model answers, probes and red flags are original.
        </p>
      </div>
      <Footer>AI Engineer · problem-solving round</Footer>
    </main>
  );
}
