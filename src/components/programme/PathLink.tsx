import Link from "next/link";
import { CONNECTS, dayOf } from "@/content/programme/mobile-principal";
import { dayHref } from "@/lib/routes";

/** One quiet line: where this page sits in the two-week story, and the lesson that teaches it from the basics. */
export function PathLink({ href }: { href: string }) {
  const c = CONNECTS[href];
  const day = dayOf(href);
  if (!c || !day) return null;
  return (
    <p className="pl">
      {c.role} <Link href={dayHref(day.n)}>Start from the basics in Day {day.n} →</Link>
    </p>
  );
}
