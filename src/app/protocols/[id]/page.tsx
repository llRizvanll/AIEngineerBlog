import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROTOCOLS, getProtocol } from "@/lib/content";
import { DoneButton, DoneMark, PacketDecoder, PacketFlow, TrackSeen } from "@/components/protocols/ProtocolLesson";

export const dynamicParams = false;
export const generateStaticParams = () => PROTOCOLS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getProtocol((await params).id);
  return p ? { title: `${p.name} · ${p.full}`, description: p.tag } : {};
}

const LAYERS = ["Application", "Transport", "Internet"];

export default async function ProtocolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getProtocol(id);
  if (!d) notFound();
  const di = PROTOCOLS.indexOf(d);
  const prev = PROTOCOLS[(di + PROTOCOLS.length - 1) % PROTOCOLS.length];
  const next = PROTOCOLS[(di + 1) % PROTOCOLS.length];
  return (
    <main className="view pe pe-page" id="view-proto">
      <div className="pe-wrap pe-lesson">
        <aside className="pe-side">
          <Link className="all" href="/protocols">
            ← All protocols
          </Link>
          {LAYERS.map((l) => (
            <div key={l}>
              <h4>{l}</h4>
              {PROTOCOLS.filter((p) => p.layer === l).map((p) => (
                <Link key={p.id} href={`/protocols/${p.id}`} className={p.id === id ? "on" : undefined}>
                  {p.name}
                  <DoneMark id={p.id} inline />
                </Link>
              ))}
            </div>
          ))}
        </aside>
        <article>
          <TrackSeen title={`${d.name} · ${d.full}`} />
          <div className="pe-lh">
            <div className="pe-kick">
              {String(di + 1).padStart(2, "0")} · <span className={`lay l-${d.layer}`}>{d.layer}</span> · {d.port}
            </div>
            <h1>{d.name}</h1>
            <p className="full">{d.full}</p>
            <p className="tag">{d.tag}</p>
          </div>
          <section>
            <h2>How it works</h2>
            {d.intro.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </section>
          <section>
            <h2>Follow the packets</h2>
            <PacketFlow actors={d.actors} steps={d.steps} />
          </section>
          <section>
            <h2>Decode it byte by byte</h2>
            <p className="hint">Click any byte or row. Each colour is one field.</p>
            <PacketDecoder packets={d.packets} />
          </section>
          <section>
            <h2>Key ideas</h2>
            <div className="pe-ideas">
              {d.ideas.map(([h, p]) => (
                <div key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2>Watch out for</h2>
            <ul className="pe-watch">
              {d.gotchas.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Check yourself</h2>
            {d.qa.map(([q, a]) => (
              <details key={q} className="pe-q">
                <summary>{q}</summary>
                <div>{a}</div>
              </details>
            ))}
          </section>
          <div className="pe-nav">
            <Link href={`/protocols/${prev.id}`}>← {prev.name}</Link>
            <DoneButton id={d.id} />
            <Link href={`/protocols/${next.id}`}>{next.name} →</Link>
          </div>
        </article>
      </div>
      <footer className="pe-foot">AI Engineer · Protocol Explorer</footer>
    </main>
  );
}
