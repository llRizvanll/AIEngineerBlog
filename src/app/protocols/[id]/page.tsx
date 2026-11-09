import { PROTOCOL_LAYERS } from "@/content/page-copy";
import { PageTrail } from "@/components/PageTrail";
import { PageEnd } from "@/components/PageEnd";
import { StudyWithAI } from "@/components/StudyWithAI";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleLd } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROTOCOLS, getProtocol } from "@/lib/content";
import { DoneButton, DoneMark, PacketDecoder, PacketFlow, TrackSeen } from "@/components/protocols/ProtocolLesson";
import { CodeWalk } from "@/components/CodeWalk";
import { AssetMeta } from "@/components/AssetMeta";
import { PartHead, QuestionList, Roadmap, SectionHead, type PartKey } from "@/components/Chapters";
import { PROTOCOL_DETAIL_COPY, ROADMAP } from "@/content/pages/protocols-detail";

export const dynamicParams = false;
export const generateStaticParams = () => PROTOCOLS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getProtocol((await params).id);
  return p ? { title: `${p.name} · ${p.full}`, description: `How ${p.name} (${p.full}) works, decoded packet by packet: ${p.tag}` } : {};
}

export default async function ProtocolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = getProtocol(id);
  if (!d) notFound();
  const di = PROTOCOLS.indexOf(d);
  const prev = PROTOCOLS[(di + PROTOCOLS.length - 1) % PROTOCOLS.length];
  const next = PROTOCOLS[(di + 1) % PROTOCOLS.length];
  const parts: { key: PartKey; sections: string[] }[] = ROADMAP.map(([key, nums]) => ({ key, sections: nums.map((n) => PROTOCOL_DETAIL_COPY.sections[n].title) }));
  return (
    <main className="view pe pe-page" id="view-proto">
      <JsonLd data={articleLd({ title: `${d.name}: ${d.full}`, description: d.tag, path: `/protocols/${d.id}`, section: "Protocols" })} />
      <div className="pe-wrap pe-lesson">
        <aside className="pe-side">
          <Link className="all" href="/protocols">
            {PROTOCOL_DETAIL_COPY.all}
          </Link>
          {PROTOCOL_LAYERS.map(([l]) => (
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
            <PageTrail href={`/protocols/${d.id}`} />
            <StudyWithAI root="main article" title={`${d.name}: ${d.full}`} />
          </div>
          <Roadmap parts={parts.map((x) => ({ key: x.key, sections: x.sections.map((t) => ({ title: t })) }))} />
          <PartHead part="basics" n={1} total={5} lead={PROTOCOL_DETAIL_COPY.parts.basics} />
          <section id="pr-how">
            <SectionHead num="1.1" title={PROTOCOL_DETAIL_COPY.sections["1.1"].title} intro={PROTOCOL_DETAIL_COPY.sections["1.1"].intro} />
            {d.intro.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </section>
          <section id="pr-ideas">
            <SectionHead num="1.2" title={PROTOCOL_DETAIL_COPY.sections["1.2"].title} intro={PROTOCOL_DETAIL_COPY.sections["1.2"].intro} />
            <div className="pe-ideas">
              {d.ideas.map(([h, p]) => (
                <div key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </section>
          <PartHead part="question" n={2} total={5} lead={PROTOCOL_DETAIL_COPY.parts.question} />
          <section id="pr-qs">
            <SectionHead num="2.1" title={PROTOCOL_DETAIL_COPY.sections["2.1"].title} />
            <QuestionList items={d.qa.map(([q]) => q)} note={PROTOCOL_DETAIL_COPY.notes.answers} />
          </section>
          <PartHead part="detail" n={3} total={5} lead={PROTOCOL_DETAIL_COPY.parts.detail} />
          <section id="pr-flow">
            <SectionHead num="3.1" title={PROTOCOL_DETAIL_COPY.sections["3.1"].title} intro={PROTOCOL_DETAIL_COPY.sections["3.1"].intro} />
            <PacketFlow actors={d.actors} steps={d.steps} />
          </section>
          <section id="pr-bytes">
            <SectionHead num="3.2" title={PROTOCOL_DETAIL_COPY.sections["3.2"].title} intro={PROTOCOL_DETAIL_COPY.sections["3.2"].intro} />
            <PacketDecoder packets={d.packets} />
          </section>
          <section id="pr-code">
            <SectionHead num="3.3" title={PROTOCOL_DETAIL_COPY.sections["3.3"].title} intro={PROTOCOL_DETAIL_COPY.sections["3.3"].intro} />
            <CodeWalk id={`p-${d.id}`} />
          </section>
          <PartHead part="qa" n={4} total={5} lead={PROTOCOL_DETAIL_COPY.parts.qa} />
          <section id="pr-qa">
            <SectionHead num="4.1" title={PROTOCOL_DETAIL_COPY.sections["4.1"].title} />
            {d.qa.map(([q, a]) => (
              <details key={q} className="pe-q">
                <summary>{q}</summary>
                <div>{a}</div>
              </details>
            ))}
          </section>
          <PartHead part="more" n={5} total={5} lead={PROTOCOL_DETAIL_COPY.parts.more} />
          <section id="pr-watch">
            <SectionHead num="5.1" title={PROTOCOL_DETAIL_COPY.sections["5.1"].title} />
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
      <PageEnd href={`/protocols/${d.id}`} />
      <footer className="pe-foot">{PROTOCOL_DETAIL_COPY.footer}</footer>
    </main>
  );
}
