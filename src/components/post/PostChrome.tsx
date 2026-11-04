import Link from "next/link";
import { SERIES, SITE } from "@/lib/content";
import { hashNum, postVars } from "@/lib/postStyle";
import { ActionBar } from "./ActionBar";
import { PostCover } from "./PostCover";

interface Meta {
  id: string;
  num: string;
  title: string;
  dek: string;
  mins: number;
  tags: string;
  date: string;
}

export const baseClaps = (id: string) => 240 + (hashNum(id) % 1900);

export function Avatar({ size = 44 }: { size?: number }) {
  return (
    <span className="m-avatar" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden>
      R
    </span>
  );
}

export function PostHeader({ m }: { m: Meta }) {
  return (
    <header className="m-head">
      <Link href="/series" className="m-series">
        <span className="m-series-dot" />
        Mobile systems at scale <b>· Part {Number(m.num)} of {SERIES.length}</b>
      </Link>
      <h1>{m.title}</h1>
      <p className="m-dek">{m.dek}</p>
      <div className="m-byline">
        <Avatar />
        <div>
          <div className="m-author">
            {SITE.author} <span className="m-role">Mobile + AI systems engineer</span>
          </div>
          <div className="m-sub">
            {m.mins} min read <i>·</i> {m.date}
          </div>
        </div>
      </div>
      <ActionBar id={m.id} title={m.title} baseClaps={baseClaps(m.id)} />
      <figure className="m-cover">
        <PostCover id={m.id} num={m.num} label={`Cover for ${m.title}`} />
        <figcaption>
          {m.tags.split("·").map((t) => (
            <span key={t}>{t.trim()}</span>
          ))}
        </figcaption>
      </figure>
    </header>
  );
}

export function PostEnd({ m }: { m: Meta }) {
  const idx = SERIES.findIndex((s) => s.id === m.id);
  const more = [1, 2, 3].map((k) => SERIES[(idx + k) % SERIES.length]);
  return (
    <section className="m-end">
      <div className="m-end-inner">
        <div className="m-tags">
          {m.tags.split("·").map((t) => (
            <span key={t}>{t.trim()}</span>
          ))}
        </div>
        <ActionBar id={m.id} title={m.title} baseClaps={baseClaps(m.id)} />
        <div className="m-authorcard">
          <Avatar size={64} />
          <div>
            <span className="eyebrow">Written by</span>
            <h3>{SITE.author}</h3>
            <p>
              Builds mobile and AI systems at scale and writes the series he wished existed before his own principal loop: one rule, one analogy,
              something to break, and the interview kit.
            </p>
          </div>
          <Link href="/series" className="btn ghost">
            All {SERIES.length} parts
          </Link>
        </div>
      </div>
      <div className="m-more">
        <h3>
          More from <span className="grad-text">Mobile systems at scale</span>
        </h3>
        <div className="m-more-g">
          {more.map((s) => (
            <Link key={s.id} href={s.href} className="m-card" style={postVars(s.id)}>
              <PostCover id={s.id} num={s.num} compact />
              <div className="m-card-b">
                <div className="m-card-by">
                  <Avatar size={22} /> {SITE.author}
                </div>
                <h4>{s.title}</h4>
                <p>{s.blurb}</p>
                <span className="m-card-meta">
                  Part {Number(s.num)} · {s.mins} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
