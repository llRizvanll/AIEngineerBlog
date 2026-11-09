import { ModuleShelf } from "@/components/ModuleShelf";
import type { Metadata } from "next";
import { CASES } from "@/lib/content";
import { Footer } from "@/components/ui";
import { CaseList } from "@/components/interview/CaseList";
import { INTERVIEW_ROOM_COPY, INTERVIEW_ROOM_META } from "@/content/pages/interview";

export const metadata: Metadata = INTERVIEW_ROOM_META;

export default function InterviewPage() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">{INTERVIEW_ROOM_COPY.kicker}</div>
          <h1>
            {INTERVIEW_ROOM_COPY.title.lead}<span className="serif grad-text">{INTERVIEW_ROOM_COPY.title.accent}</span>
          </h1>
<p>{INTERVIEW_ROOM_COPY.intro}</p>
        </section>
        <div className="iv-steps stagger">
          {INTERVIEW_ROOM_COPY.steps.map(([h, p], i) => (
            <div className="step" key={h}>
              <b>{i + 1}</b>
              <h4>{h}</h4>
              <p>{p}</p>
            </div>
          ))}
        </div>
        <CaseList
          cases={CASES.map((c) => ({ id: c.id, track: c.track, minutes: c.minutes, title: c.title, prompt: c.prompt, tags: c.tags }))}
        />
        <ModuleShelf format="system-design" title={INTERVIEW_ROOM_COPY.shelf.title} blurb={INTERVIEW_ROOM_COPY.shelf.blurb} />
      </div>
      <Footer>{INTERVIEW_ROOM_COPY.footer}</Footer>
    </main>
  );
}
