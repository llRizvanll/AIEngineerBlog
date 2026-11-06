import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import { SERIES, SITE } from "@/lib/content";
import { postVars } from "@/lib/postStyle";
import { PostCover } from "@/components/post/PostCover";
import { Avatar, baseClaps } from "@/components/post/PostChrome";
import { Footer } from "@/components/ui";

export const metadata: Metadata = { title: "Mobile systems at scale", description: "A 7-part series on offline-first mobile systems." };

export default function SeriesIndex() {
  const [lead, ...rest] = SERIES;
  return (
    <main className="feed-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">The series · {SERIES.length} parts</div>
          <h1>
            Mobile systems <span className="serif grad-text">at scale.</span>
          </h1>
          <p>Reference articles, for looking up detail later. To learn this material from the basics, <Link href="/paths/mobile-principal">start the two-week programme</Link>.</p>
        </section>

        <Link href={lead.href} className="feed-lead" style={postVars(lead.id)}>
          <PostCover id={lead.id} num={lead.num} />
          <div>
            <div className="m-card-by">
              <Avatar size={26} /> {SITE.author} <span>· Start here</span>
            </div>
            <h2>{lead.title}</h2>
            <p>{lead.blurb}</p>
            <span className="m-card-meta">
              Part 1 · {lead.mins} min read · 👏 {baseClaps(lead.id).toLocaleString()}
            </span>
          </div>
        </Link>

        <div className="feed">
          {rest.map((s) => (
            <Link key={s.id} href={s.href} className="feed-row" style={postVars(s.id)}>
              <div className="feed-txt">
                <div className="m-card-by">
                  <Avatar size={22} /> {SITE.author} <span>· Part {Number(s.num)}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                <span className="m-card-meta">
                  {s.mins} min read · 👏 {baseClaps(s.id).toLocaleString()}
                </span>
              </div>
              <div className="feed-thumb">
                <PostCover id={s.id} num={s.num} compact />
              </div>
            </Link>
          ))}
        </div>
        <ModuleShelf format="long-read" title="AI systems long reads" blurb="Whole systems, start to finish" />
      </div>
      <Footer>AI Engineer · Mobile systems at scale</Footer>
    </main>
  );
}
