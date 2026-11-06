import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REELS, getCollection } from "@/lib/content";
import { ReelsPlayer } from "@/components/reels/ReelsPlayer";
import { summarize } from "@/lib/reel-summary";

export const dynamicParams = false;
export const generateStaticParams = () => REELS.map((c) => ({ collection: c.id }));

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }): Promise<Metadata> {
  const c = getCollection((await params).collection);
  return c ? { title: `${c.title} · Reels`, description: `Short swipeable lessons on ${c.title}. ${c.blurb}` } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const c = getCollection(collection);
  if (!c) notFound();
  return (
    <>
      <h1 className="sr-only">{c.title} reels</h1>
      <ReelsPlayer collections={[c]} summaries={REELS.map(summarize)} filter={collection} />
    </>
  );
}
