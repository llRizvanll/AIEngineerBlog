import type { Metadata } from "next";
import Link from "next/link";
import { CardGrid } from "@/components/HubCards";
import { siteMap } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Learn",
  description: "Lessons on AI engineering, mobile engineering and system design, grouped by skill.",
  alternates: { canonical: "/learn" },
};

export default function Learn() {
  const groups = siteMap().filter((g) => ["ai", "mobile", "design"].includes(g.id));
  let n = 1;
  return (
    <main className="app-page">
      <div className="ap-head">
        <div>
          <h1>Learn</h1>
          <p>Lessons on AI and mobile engineering, from the basics up.</p>
        </div>
        <Link className="btn" href="/aiengine">
          Start with lesson 1
        </Link>
      </div>
      {groups.map((g) => {
        const start = n;
        n += g.items.length;
        return (
          <section key={g.id} aria-labelledby={`g-${g.id}`}>
            <h2 id={`g-${g.id}`} className="ap-h">
              {g.label}
            </h2>
            <p className="ap-sub">{g.blurb}</p>
            <CardGrid items={g.items} start={start} />
          </section>
        );
      })}
      <p className="ap-foot">
        Looking for something specific? <Link href="/explore">Browse every page</Link>
      </p>
    </main>
  );
}
