import Link from "next/link";
import type { Metadata } from "next";
import { ALL_BEHAVIORAL as BEHAVIORAL, BEHAVIORAL_SOURCE, BEHAVIORAL_TIPS, STAR, THEMES } from "@/content/behavioral";
import { BehavioralList } from "@/components/prep/BehavioralList";
import { Footer } from "@/components/ui";
import { Icon } from "@/components/Icons";
import { PROBLEM_SOLVING_COPY, PROBLEM_SOLVING_META } from "@/content/pages/problem-solving";

export const metadata: Metadata = PROBLEM_SOLVING_META;

export default function ProblemSolvingPage() {
  return (
    <main className="prep-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">{PROBLEM_SOLVING_COPY.kicker} · {BEHAVIORAL.length} questions</div>
          <h1>
            {PROBLEM_SOLVING_COPY.title.lead}<span className="serif grad-text">{PROBLEM_SOLVING_COPY.title.accent}</span>
          </h1>
<p>{PROBLEM_SOLVING_COPY.intro}</p>
          <div className="btns">
            <Link className="btn" href={PROBLEM_SOLVING_COPY.actions.reels.href}>
              <Icon name="play" size={16} /> {PROBLEM_SOLVING_COPY.actions.reels.label}
            </Link>
            <Link className="btn ghost" href={PROBLEM_SOLVING_COPY.actions.star.href}>
              {PROBLEM_SOLVING_COPY.actions.star.label}
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
            <span className="eyebrow">{PROBLEM_SOLVING_COPY.habits.eyebrow}</span>
            <h2>{PROBLEM_SOLVING_COPY.habits.title}</h2>
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
          {PROBLEM_SOLVING_COPY.source.before}
          <a href={BEHAVIORAL_SOURCE.url} target="_blank" rel="noopener">
            {BEHAVIORAL_SOURCE.name}
          </a>
          {PROBLEM_SOLVING_COPY.source.after}
        </p>
      </div>
      <Footer>{PROBLEM_SOLVING_COPY.footer}</Footer>
    </main>
  );
}
