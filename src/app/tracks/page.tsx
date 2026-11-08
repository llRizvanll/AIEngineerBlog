import type { Metadata } from "next";
import Link from "next/link";
import { Book, Title } from "@/components/HubCards";
import { siteMap } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Tracks",
  description: "The order to learn each subject in: AI engineering, React Native, the two-week mobile path and AI interviews.",
  alternates: { canonical: "/tracks" },
};

export default function Tracks() {
  const map = siteMap();
  const ai = map.find((g) => g.id === "ai")!.items[0];
  const mobile = map.find((g) => g.id === "mobile")!.items;
  const iv = map.find((g) => g.id === "interview")!.items[0];
  const tracks = [
    { it: ai, name: "AI engineering", blurb: "For developers building products on language models.", next: "Start at phase 1" },
    { it: mobile[0], name: "React Native", blurb: "Architecture, state, memory, offline and budgets, in reading order.", next: "How it runs" },
    { it: mobile[1], name: "Mobile principal", blurb: "Fourteen days: one edit, followed end to end, then reused.", next: "Day 1" },
    { it: iv, name: "AI interviews", blurb: "The hacks, the new rounds, a plan and a project.", next: "Never ask AI for the answer" },
  ];
  return (
    <main className="app-page">
      <div className="ap-head">
        <div>
          <h1>
            Know what to learn <em>next</em>
          </h1>
          <p>The order we would learn each subject in.</p>
        </div>
      </div>
      <div className="tk-list">
        {tracks.map((t, i) => (
          <section key={t.name} className="tk">
            <div>
              <h2>
                <Title text={t.name} />
              </h2>
              <p>{t.blurb}</p>
              <div className="tk-act">
                <Link className="btn" href={t.it.href}>
                  Start
                </Link>
                <Link className="tk-link" href={t.it.href}>
                  See the whole track
                </Link>
              </div>
            </div>
            <Link href={t.it.href} className={`tk-up pc-${[0, 3, 1, 4][i]}`}>
              <Book icon={t.it.icon} label={t.name.split(" ")[0].toUpperCase().slice(0, 11)} />
              <span>
                <small>Up next</small>
                <b>{t.next}</b>
                <em>{t.it.count}</em>
              </span>
            </Link>
          </section>
        ))}
      </div>
    </main>
  );
}
