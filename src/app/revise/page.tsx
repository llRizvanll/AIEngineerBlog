import type { Metadata } from "next";
import { CASES, CRITICAL } from "@/lib/content";
import { Footer } from "@/components/ui";
import { Revise } from "@/components/interview/Revise";

export const metadata: Metadata = { title: "Revise critical Q&A", description: "Real incidents, hard probes and common traps for every round." };

export default function RevisePage() {
  return (
    <main>
      <div className="wrap">
        <section className="rv-hero">
          <div className="kicker">Revise</div>
          <h1>
            Critical Q&amp;A, by <span className="serif grad-text">use case.</span>
          </h1>
          <p>
            Real incidents, hard probes and common traps for every section of every round. Filter, shuffle and mark what you can already answer.
            Progress stays in this browser.
          </p>
        </section>
        <Revise cases={CASES.map((c) => ({ id: c.id, title: c.title }))} crit={CRITICAL} />
      </div>
      <Footer>AI Engineer · revise</Footer>
    </main>
  );
}
