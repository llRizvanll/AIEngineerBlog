import { StudyWithAI } from "@/components/StudyWithAI";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { articleLd } from "@/lib/site";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PART_ONE, POSTS, SITE, getPost } from "@/lib/content";
import { Reading } from "@/components/Reading";
import { ArchSvg, Figure, SeqSvg } from "@/components/Diagrams";
import { Code, Faq, Footer, Section, Table } from "@/components/ui";
import { PostEnd, PostHeader } from "@/components/post/PostChrome";
import { CodeWalks } from "@/components/CodeWalk";
import { PAGE_CODE } from "@/content/code-docs";
import { PathLink } from "@/components/programme/PathLink";
import { postVars } from "@/lib/postStyle";
import { BgSyncInteractive } from "@/components/BgSyncInteractive";
import { editorHtml, guessLang } from "@/lib/highlight";

/** Turn the authored <pre> blocks of Part 1 into themed editor blocks. */
function withEditors(html: string): string {
  const decode = (s: string) =>
    s.replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  return html.replace(/<pre>([\s\S]*?)<\/pre>/g, (_m, body: string, offset: number) => {
    const before = html.slice(0, offset);
    const h = [...before.matchAll(/<h3>([\s\S]*?)<\/h3>/g)].pop();
    const title = h ? decode(h[1]) : "snippet";
    const src = decode(body).replace(/^\n/, "");
    return editorHtml(src, guessLang(src), title);
  });
}
import type { PostSection } from "@/content/types";

export const dynamicParams = false;
export function generateStaticParams() {
  return [{ slug: PART_ONE.id }, ...POSTS.map((p) => ({ slug: p.id }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === PART_ONE.id) return { title: PART_ONE.title, description: PART_ONE.dek };
  const p = getPost(slug);
  return p ? { title: p.title, description: p.dek } : {};
}

function SectionItems({ s, uid }: { s: PostSection; uid: string }) {
  const out: React.ReactNode[] = [];
  (Object.keys(s) as (keyof PostSection)[]).forEach((k) => {
    if (k === "h" || k === "figcap") return;
    const v = s[k];
    if ((k === "p" || k === "p2") && Array.isArray(v)) (v as string[]).forEach((t, i) => out.push(<p key={k + i}>{t}</p>));
    if (k === "list" && s.list)
      out.push(
        <ul key={k} className="bl">
          {s.list.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    if (k === "table" && s.table) out.push(<Table key={k} head={s.table.head} rows={s.table.rows} />);
    if ((k === "code" || k === "code2") && s[k]) out.push(<Code key={k} sample={s[k]!} />);
    if (k === "callout" && s.callout)
      out.push(
        <div key={k} className="callout">
          <b className="t">{s.callout[0]}</b>
          {s.callout[1]}
        </div>
      );
    if (k === "arch" && s.arch)
      out.push(
        <Figure key={k} caption={s.figcap || "Boxes are components; arrows show calls and data flow."}>
          <ArchSvg a={s.arch} uid={uid + "a"} />
        </Figure>
      );
    if (k === "seq" && s.seq)
      out.push(
        <Figure key={k} caption="Solid arrows are requests; dashed arrows are responses.">
          <SeqSvg s={s.seq} uid={uid + "s"} />
        </Figure>
      );
  });
  return <>{out}</>;
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === PART_ONE.id) {
    const html = withEditors(fs.readFileSync(path.join(process.cwd(), "src/content/background-sync.html"), "utf8"));
    return (
      <main className="medium" style={postVars(PART_ONE.id)}>
        <JsonLd data={articleLd({ title: PART_ONE.title, description: PART_ONE.dek, path: `/series/${PART_ONE.id}`, section: "Series" })} />
        <PostHeader m={PART_ONE} />
        <div className="m-meta">
          <PathLink href={`/series/${PART_ONE.id}`} />
          <StudyWithAI />
        </div>
        <BgSyncInteractive html={html} title={PART_ONE.title} />
        <div className="m-walk">
          <h2>Tested code, explained</h2>
          <CodeWalks ids={PAGE_CODE[`/series/${PART_ONE.id}`]} />
        </div>
        <PostEnd m={PART_ONE} />
        <Footer>AI Engineer · written by {SITE.author} · part 1 of 7</Footer>
      </main>
    );
  }

  const p = getPost(slug);
  if (!p) notFound();
  return (
    <main className="medium" style={postVars(p.id)}>
      <JsonLd data={articleLd({ title: p.title, description: p.dek, path: `/series/${p.id}`, section: "Series" })} />
      <PostHeader m={{ ...p, date: "Nov 4, 2026" }} />
      <div className="m-meta">
        <PathLink href={`/series/${p.id}`} />
        <StudyWithAI />
      </div>
      <Reading title={p.title} kind="Post" articleId="blog-article" railTitle="In this post">
        <div className="tldr">
          <h3>If you only read this</h3>
          <ol>
            {p.tldr.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>
        <div className="callout">
          <b className="t">The one rule</b>
          {p.rule}
        </div>
        {p.secs.map((s, i) => (
          <Section key={s.h} id={`bp-${i}`} n={i + 1} title={s.h}>
            <SectionItems s={s} uid={`${p.id}${i}`} />
          </Section>
        ))}
        {PAGE_CODE[`/series/${p.id}`] && (
          <Section id="bp-code" n={p.secs.length + 1} title="Tested code, explained">
            <CodeWalks ids={PAGE_CODE[`/series/${p.id}`]} />
          </Section>
        )}
        <Section id="bp-qa" n={p.secs.length + (PAGE_CODE[`/series/${p.id}`] ? 2 : 1)} title="Interview questions">
          <Faq items={p.qa} />
          <p className="go-h">Practise it:</p>
          <div className="golinks">
            <Link href="/interview">Interview room</Link>
            <Link href="/deep">Deep dives</Link>
            <Link href="/revise">Revise critical Q&amp;A</Link>
          </div>
        </Section>
      </Reading>
      <PostEnd m={{ ...p, date: "Nov 4, 2026" }} />
      <Footer>AI Engineer · written by {SITE.author} · part {Number(p.num)} of 7</Footer>
    </main>
  );
}
