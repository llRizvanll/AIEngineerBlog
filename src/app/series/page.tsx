import { ModuleShelf } from "@/components/ModuleShelf";
import Link from "next/link";
import type { Metadata } from "next";
import { SERIES } from "@/lib/content";
import { postVars } from "@/lib/postStyle";
import { PostCover } from "@/components/post/PostCover";
import { Avatar, baseClaps } from "@/components/post/PostChrome";
import { Footer } from "@/components/ui";
import { SITE } from "@/content/site";
import { SERIES_PAGE_COPY, SERIES_PAGE_META } from "@/content/pages/series";

export const metadata: Metadata = SERIES_PAGE_META;

export default function SeriesIndex() {
  const [lead, ...rest] = SERIES;
  return (
    <main className="feed-page">
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">{SERIES_PAGE_COPY.kicker} · {SERIES.length} parts</div>
          <h1>
            {SERIES_PAGE_COPY.title.lead}<span className="serif grad-text">{SERIES_PAGE_COPY.title.accent}</span>
          </h1>
          <p>
            {SERIES_PAGE_COPY.intro}
            <Link href={SERIES_PAGE_COPY.introLink.href}>{SERIES_PAGE_COPY.introLink.label}</Link>
            {SERIES_PAGE_COPY.introTail}
          </p>
        </section>

        <Link href={lead.href} className="feed-lead" style={postVars(lead.id)}>
          <PostCover id={lead.id} num={lead.num} />
          <div>
            <div className="m-card-by">
              <Avatar size={26} /> {SITE.author} <span>{SERIES_PAGE_COPY.startHere}</span>
            </div>
            <h2>{lead.title}</h2>
            <p>{lead.blurb}</p>
            <span className="m-card-meta">
              {SERIES_PAGE_COPY.partOne} · {lead.mins} {SERIES_PAGE_COPY.minRead} · 👏 {baseClaps(lead.id).toLocaleString()}
            </span>
          </div>
        </Link>

        <div className="feed">
          {rest.map((s) => (
            <Link key={s.id} href={s.href} className="feed-row" style={postVars(s.id)}>
              <div className="feed-txt">
                <div className="m-card-by">
                  <Avatar size={22} /> {SITE.author} <span>· {SERIES_PAGE_COPY.part} {Number(s.num)}</span>
                </div>
                <h3>{s.title}</h3>
                <p>{s.blurb}</p>
                <span className="m-card-meta">
                  {s.mins} {SERIES_PAGE_COPY.minRead} · 👏 {baseClaps(s.id).toLocaleString()}
                </span>
              </div>
              <div className="feed-thumb">
                <PostCover id={s.id} num={s.num} compact />
              </div>
            </Link>
          ))}
        </div>
        <ModuleShelf format="long-read" title={SERIES_PAGE_COPY.shelf.title} blurb={SERIES_PAGE_COPY.shelf.blurb} />
      </div>
      <Footer>{SERIES_PAGE_COPY.footer}</Footer>
    </main>
  );
}
