import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CASES, DEEP, getDeep } from "@/lib/content";
import { ArchSvg, Figure, SeqSvg } from "@/components/Diagrams";
import { Code, Faq, Footer, Section, Table } from "@/components/ui";
import { Reading } from "@/components/Reading";

export const dynamicParams = false;
export const generateStaticParams = () => DEEP.map((d) => ({ id: d.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = getDeep((await params).id);
  return d ? { title: d.title, description: d.summary } : {};
}

export default async function DeepPage({ params }: { params: Promise<{ id: string }> }) {
  const d = getDeep((await params).id);
  if (!d) notFound();
  const L = {
    does: "Its job", doesnt: "Not its job", scenario: "A real-life run", arch: "Anatomy", states: "States", seq: "The run loop", code: "Code",
    platforms: "Platform implementation", tech: "Technology choices", real: "How real products do it", metrics: "Metrics to emit",
    edges: "Edge cases", interview: "Interview questions",
    ...(d.labels as Record<string, string> | undefined),
  };
  const secs: [string, string, ReactNode][] = [];
  secs.push([
    "ov",
    "Overview",
    <>
      <p className="lead">{d.summary}</p>
      <div className="dd2">
        <div>
          <b className="lab">{L.does}</b>
          <ul>{d.does.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
        <div>
          <b className="lab">{L.doesnt}</b>
          <ul>{d.doesnt.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </>,
  ]);
  if (d.scenario) secs.push(["sc", L.scenario, <div className="story">{d.scenario.map((p) => <p key={p}>{p}</p>)}</div>]);
  if (d.arch)
    secs.push([
      "ar",
      L.arch,
      <>
        <Figure caption="Boxes are components; arrows show calls and data flow.">
          <ArchSvg a={d.arch} uid={d.id + "a"} />
        </Figure>
        <dl className="notes">{d.archNotes.map(([t, x]) => [<dt key={t + "t"}>{t}</dt>, <dd key={t + "d"}>{x}</dd>])}</dl>
      </>,
    ]);
  if (d.states) secs.push(["st", L.states, <Table head={[d.group === "ai" ? "Term" : "State", "Meaning"]} rows={d.states} />]);
  if (d.seq)
    secs.push([
      "sq",
      L.seq,
      <>
        <Figure caption="Solid arrows are calls; dashed arrows are responses.">
          <SeqSvg s={d.seq} uid={d.id + "s"} />
        </Figure>
        <ol className="flow-notes">{d.seqNotes.map((t) => <li key={t}>{t}</li>)}</ol>
      </>,
    ]);
  if (d.code) secs.push(["cd", L.code, <>{d.code.map((k) => <Code key={k[0]} sample={k} />)}</>]);
  if (d.platforms)
    secs.push([
      "pl",
      L.platforms,
      <div className="plat">
        {d.platforms.map(([h, items]) => (
          <div key={h}>
            <h4>{h}</h4>
            <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </div>,
    ]);
  if (d.tech) secs.push(["tc", L.tech, <Table head={["Need", "Options", "When to pick"]} rows={d.tech} />]);
  if (d.real && d.real.length)
    secs.push([
      "rl",
      L.real,
      <>
        <p className="note">Summaries of what these teams and projects have described publicly. Check their own write-ups for detail.</p>
        <Table head={["Who", "What they describe"]} rows={d.real} />
      </>,
    ]);
  if (d.metrics) secs.push(["mt", L.metrics, <Table head={["Metric", "Why it matters"]} rows={d.metrics} />]);
  if (d.edges) secs.push(["ed", L.edges, <Table head={["Case", "How it is handled"]} rows={d.edges} />]);
  if (d.interview) secs.push(["iq", L.interview, <Faq items={d.interview} />]);

  const same = DEEP.filter((x) => x.group === d.group);
  const next = same[(same.indexOf(d) + 1) % same.length];
  const rounds = CASES.filter((c) => (d.group === "ai") === (c.track === "AI"));

  return (
    <main>
      <div className="post-head">
        <div className="kicker">
          <Link href="/deep">Deep dives</Link> · {d.kicker}
        </div>
        <h1>{d.title}</h1>
      </div>
      <Reading title={d.title} kind="Deep dive" articleId="deep-article">
        {secs.map(([id, title, node], i) => (
          <Section key={id} id={`dd-${id}`} n={i + 1} title={title}>
            {node}
          </Section>
        ))}
        <Section id="dd-rel" n={secs.length + 1} title="Practise it in a round">
          <div className="golinks">
            {rounds.map((c) => (
              <Link key={c.id} href={`/interview/${c.id}`}>
                {c.title}
              </Link>
            ))}
          </div>
        </Section>
        <div className="next">
          <div>
            <div className="kicker">Next deep dive</div>
            <b>{next.title}</b>
          </div>
          <div className="btns">
            <Link className="btn ghost" href="/deep">
              All deep dives
            </Link>
            <Link className="btn" href={`/deep/${next.id}`}>
              Next →
            </Link>
          </div>
        </div>
      </Reading>
      <Footer>AI Engineer · {d.title}</Footer>
    </main>
  );
}
