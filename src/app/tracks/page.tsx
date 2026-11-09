import type { Metadata } from "next";
import Link from "next/link";
import { Book, Title } from "@/components/HubCards";
import { siteMap } from "@/lib/sections";
import { TRACKS_COPY, TRACKS_META } from "@/content/pages/tracks";

export const metadata: Metadata = TRACKS_META;

export default function Tracks() {
  const map = siteMap();
  const ai = map.find((g) => g.id === "ai")!.items[0];
  const mobile = map.find((g) => g.id === "mobile")!.items;
  const iv = map.find((g) => g.id === "interview")!.items[0];
  const entries = [ai, mobile[0], mobile[1], iv];
  const tracks = TRACKS_COPY.tracks.map((t, i) => ({ ...t, it: entries[i] }));
  return (
    <main className="app-page">
      <div className="ap-head">
        <div>
          <h1>
            {TRACKS_COPY.title.lead}<em>{TRACKS_COPY.title.accent}</em>
          </h1>
          <p>{TRACKS_COPY.intro}</p>
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
                  {TRACKS_COPY.start}
                </Link>
                <Link className="tk-link" href={t.it.href}>
                  {TRACKS_COPY.whole}
                </Link>
              </div>
            </div>
            <Link href={t.it.href} className={`tk-up pc-${[0, 3, 1, 4][i]}`}>
              <Book icon={t.it.icon} label={t.name.split(" ")[0].toUpperCase().slice(0, 11)} />
              <span>
                <small>{TRACKS_COPY.upNext}</small>
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
