import type { Metadata } from "next";
import { CASES } from "@/lib/content";
import { Footer } from "@/components/ui";
import { CaseList } from "@/components/interview/CaseList";

export const metadata: Metadata = { title: "Interview room", description: "Real-world system design rounds with a clock, practice mode and a whiteboard." };

export default function InterviewPage() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">Interview room</div>
          <h1>
            Eleven rounds. One <span className="serif grad-text">whiteboard.</span>
          </h1>
          <p>
            Each round is a real-world system design question asked the way a principal-engineer panel asks it. Turn on practice mode to write
            your answer before revealing the model answer, start the 45-minute clock, and draw on the built-in whiteboard.
          </p>
        </section>
        <div className="iv-steps stagger">
          {[
            ["Clarify", "Ask about users, scale, constraints. State assumptions."],
            ["Estimate", "Do the arithmetic that decides the design."],
            ["Draw", "Components, data stores and arrows. Then one flow."],
            ["Go deep", "Pick the hardest part and explain the mechanism."],
            ["Defend", "Trade-offs, failures, rollout and how the team builds it."],
          ].map(([h, p], i) => (
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
      </div>
      <Footer>AI Engineer · interview room</Footer>
    </main>
  );
}
