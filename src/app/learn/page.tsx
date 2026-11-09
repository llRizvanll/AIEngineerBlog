import type { Metadata } from "next";
import Link from "next/link";
import { CardGrid } from "@/components/HubCards";
import { siteMap } from "@/lib/sections";
import { LEARN_COPY, LEARN_META } from "@/content/pages/learn";

export const metadata: Metadata = LEARN_META;

export default function Learn() {
  const groups = siteMap().filter((g) => ["ai", "mobile", "design"].includes(g.id));
  let n = 1;
  return (
    <main className="app-page">
      <div className="ap-head">
        <div>
          <h1>{LEARN_COPY.title}</h1>
          <p>{LEARN_COPY.intro}</p>
        </div>
        <Link className="btn" href={LEARN_COPY.start.href}>
          {LEARN_COPY.start.label}
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
        {LEARN_COPY.foot.text}<Link href={LEARN_COPY.foot.href}>{LEARN_COPY.foot.link}</Link>
      </p>
    </main>
  );
}
