import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROTOCOLS, getProtocol } from "@/lib/content";
import { DoneButton, DoneMark, PacketDecoder, PacketFlow, TrackSeen } from "@/components/protocols/ProtocolLesson";
import { CodeWalk } from "@/components/CodeWalk";
import { AssetMeta } from "@/components/AssetMeta";
import { PartHead, QuestionList, Roadmap, SectionHead, type PartKey } from "@/components/Chapters";

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
  const parts: { key: PartKey; sections: string[] }[] = [
    { key: "basics", sections: ["What it does", "Key ideas"] },
    { key: "question", sections: ["Target questions"] },
    { key: "detail", sections: ["Follow the packets", "Decode it byte by byte", "Decode it in code"] },
    { key: "qa", sections: ["Check yourself"] },
    { key: "more", sections: ["Watch out for"] },
  ];
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
            <AssetMeta href={`/protocols/${d.id}`} />
          </div>
          <Roadmap parts={parts.map((x) => ({ key: x.key, sections: x.sections.map((t) => ({ title: t })) }))} />
          <PartHead part="basics" n={1} total={5} lead="What the protocol is for, and the ideas it is built on." />
          <section id="pr-how">
            <SectionHead num="1.1" title="What it does" intro="The protocol in plain words, before any bytes." />
            {d.intro.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </section>
          <section id="pr-ideas">
            <SectionHead num="1.2" title="Key ideas" intro="The handful of ideas everything else follows from." />
            <div className="pe-ideas">
              {d.ideas.map(([h, p]) => (
                <div key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </section>
          <PartHead part="question" n={2} total={5} lead="What this lesson prepares you to answer. Keep these in mind while you watch the packets." />
          <section id="pr-qs">
            <SectionHead num="2.1" title="Target questions" />
            <QuestionList items={d.qa.map(([q]) => q)} note="The answers are in part 4." />
          </section>
          <PartHead part="detail" n={3} total={5} lead="Watch a real exchange step by step, then take each message apart field by field." />
          <section id="pr-flow">
            <SectionHead num="3.1" title="Follow the packets" intro="Step through the exchange between the two sides." />
            <PacketFlow actors={d.actors} steps={d.steps} />
          </section>
          <section id="pr-bytes">
            <SectionHead num="3.2" title="Decode it byte by byte" intro="Click any byte or row. Each colour is one field." />
            <PacketDecoder packets={d.packets} />
          </section>
          <section id="pr-code">
            <SectionHead num="3.3" title="Decode it in code" intro="A small decoder, tested against the exact bytes shown above." />
            <CodeWalk id={`p-${d.id}`} />
          </section>
          <PartHead part="qa" n={4} total={5} lead="Check your understanding. Answer out loud, then open." />
          <section id="pr-qa">
            <SectionHead num="4.1" title="Check yourself" />
            {d.qa.map(([q, a]) => (
              <details key={q} className="pe-q">
                <summary>{q}</summary>
                <div>{a}</div>
              </details>
            ))}
          </section>
          <PartHead part="more" n={5} total={5} lead="The mistakes people make with this protocol in real systems." />
          <section id="pr-watch">
            <SectionHead num="5.1" title="Watch out for" />
            <ul className="pe-watch">
              {d.gotchas.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
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
