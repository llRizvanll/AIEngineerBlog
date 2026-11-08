import type { Metadata } from "next";
import Link from "next/link";
import { Runner } from "@/components/practice/Runner";
import { Book, Title } from "@/components/HubCards";
import { PROBLEMS } from "@/content/practice";

export const metadata: Metadata = {
  title: "Practice",
  description: "Short problems with a checkable answer, at three levels, with the working shown. Plus flashcards and critical basics.",
  alternates: { canonical: "/practice" },
};

export default function PracticePage() {
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              Practice that <em>sticks</em>
            </h1>
            <p>
              {PROBLEMS.length} problems with answers checked for you, then flashcards that come back on schedule.
            </p>
          </div>
        </div>
        <Runner />
        <h2 className="ap-h">Keep it fresh</h2>
        <div className="cb-grid">
          {[
            { href: "/revise", icon: "cards", t: "Flashcards", d: "Spaced recall: hard cards return soon, easy ones wait." },
            { href: "/paths/ai-interviews/basics", icon: "bolt", t: "Critical basics", d: "Read, memorise and practise the AI interview essentials." },
            { href: "/reels", icon: "play", t: "Reels", d: "One idea at a time, built for a phone and a spare minute." },
          ].map((c, i) => (
            <Link key={c.href} href={c.href} className={`cb pc-${[5, 6, 4][i]}`}>
              <Book icon={c.icon} label={c.t.split(" ")[0].toUpperCase().slice(0, 11)} />
              <span className="cb-tx">
                <small>Practice</small>
                <b>
                  <Title text={c.t} />
                </b>
                <span>{c.d}</span>
                <i>Open</i>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
