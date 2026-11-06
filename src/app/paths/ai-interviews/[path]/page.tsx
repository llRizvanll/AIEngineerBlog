import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { PathContinue, PathLessons, type LessonRow } from "@/components/ai-paths/Progress";
import { AI_PATHS, getPath } from "@/content/ai-interviews";
import { AI_BASICS_HREF, AI_PATHS_HREF, aiLessonHref, aiPathHref } from "@/lib/routes";
import { breadcrumbLd, courseLd } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => AI_PATHS.map((p) => ({ path: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ path: string }> }): Promise<Metadata> {
  const p = getPath((await params).path);
  return p ? { title: p.title, description: p.blurb } : {};
}

export default async function PathPage({ params }: { params: Promise<{ path: string }> }) {
  const p = getPath((await params).path);
  if (!p) notFound();
  const rows: LessonRow[] = p.lessons.map((l) => ({ path: p.id, slug: l.slug, stop: l.stop, title: l.title, question: l.question, minutes: l.minutes }));
  const i = AI_PATHS.indexOf(p);
  const next = AI_PATHS[i + 1];
  return (
    <main className="pg">
      <JsonLd data={courseLd({ title: p.title, description: p.blurb, path: aiPathHref(p.id), parts: p.lessons.map((l) => ({ title: l.title, path: aiLessonHref(p.id, l.slug) })) })} />
      <JsonLd data={breadcrumbLd([["Home", "/"], ["AI interview paths", AI_PATHS_HREF], [p.title, aiPathHref(p.id)]])} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href={AI_PATHS_HREF}>AI interview paths</Link> · Path {i + 1} of {AI_PATHS.length}
          </div>
          <h1>{p.title}</h1>
          <p>{p.blurb}</p>
          <PathContinue lessons={rows} />
        </section>
        <div className="section-h">
          <h2>The lessons</h2>
          <span>Each one stands alone, and leads to the next</span>
        </div>
        <PathLessons lessons={rows} />
        <div className="ip-after">
          <Link className="btn ghost" href={AI_BASICS_HREF}>
            Critical basics
          </Link>
          {next && (
            <Link className="btn ghost" href={aiPathHref(next.id)}>
              Next path: {next.title} →
            </Link>
          )}
        </div>
      </div>
      <Footer>AI Engineer · {p.title}</Footer>
    </main>
  );
}
