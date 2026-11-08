import Link from "next/link";
import { sourcesFor, type Source } from "@/content/further";
import { assetByHref, buildCatalog } from "@/lib/catalog";
import { trailFor } from "@/lib/trail";
import { Book, Title } from "./HubCards";

const TONES = [0, 1, 2, 3, 4, 5, 6, 7];

/** The next page in reading order: the explicit order when there is one, else the next page in the same section. */
function nextOf(href: string): { title: string; href: string; blurb: string } | null {
  const trail = trailFor(href);
  const seg = href.split("/")[1];
  const same = buildCatalog().filter((a) => a.href.split("/")[1] === seg && a.format !== "flashcard" && a.format !== "reel");
  const at = same.findIndex((a) => a.href === href);
  const explicit = trail?.order?.next;
  if (explicit) {
    const a = assetByHref(explicit.href);
    return { title: explicit.title, href: explicit.href, blurb: a?.curationMetadata.contextualCommentary ?? "" };
  }
  const n = same[at + 1];
  return n ? { title: n.title, href: n.href, blurb: n.curationMetadata.contextualCommentary } : null;
}

function List({ heading, items }: { heading: string; items: Source[] }) {
  if (!items.length) return null;
  return (
    <section className="end-list">
      <h2>{heading}</h2>
      <ul>
        {items.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.kind === "watch" && (
                <i className="end-play" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </i>
              )}
              <span>
                <b>{s.title}</b>
                <small>{s.by}</small>
                <em>{s.why}</em>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What comes after a page: talks to watch, public docs to read, and the next page to open. */
export function PageEnd({ href }: { href: string }) {
  const a = assetByHref(href);
  const { watch, read } = sourcesFor(href, `${a?.title ?? ""} ${a?.curationMetadata.contextualCommentary ?? ""}`, a?.domain);
  // Pages that already end with their own next control keep it; the rest get this card.
  const next = /^\/(interview|series)\//.test(href) ? nextOf(href) : null;
  const tone = TONES[(href.length + (a?.title.length ?? 0)) % TONES.length];
  if (!watch.length && !read.length && !next) return null;
  return (
    <aside className="page-end" aria-label="After this page">
      {(watch.length > 0 || read.length > 0) && (
        <div className="end-card">
          <List heading="Watch" items={watch} />
          <List heading="Read next" items={read} />
          <p className="end-note">These links open public pages outside this site. Check dates and versions before relying on a detail.</p>
        </div>
      )}
      {next && (
        <Link href={next.href} className={`end-next pc-${tone}`} data-md-skip>
          <Book icon="book" label="NEXT" />
          <span className="end-next-tx">
            <small>Next lesson</small>
            <b>
              <Title text={next.title} />
            </b>
            {next.blurb && <span>{next.blurb}</span>}
          </span>
          <span className="btn">Continue</span>
        </Link>
      )}
    </aside>
  );
}
