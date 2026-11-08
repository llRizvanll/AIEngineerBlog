import Link from "next/link";
import { trailFor } from "@/lib/trail";

/** One quiet line: skill, then the hub that lists this page, then the next page in the reading order. */
export function PageTrail({ href }: { href: string }) {
  const t = trailFor(href);
  if (!t) return null;
  return (
    <p className="trail" data-md-skip>
      <span>{t.skill}</span>
      <i aria-hidden>›</i>
      <Link href={t.hub.href}>{t.hub.title}</Link>
      {t.order && (
        <>
          <span className="trail-n">
            {t.order.n} of {t.order.total}
          </span>
          {t.order.next && (
            <Link className="trail-next" href={t.order.next.href}>
              Next: {t.order.next.title} →
            </Link>
          )}
        </>
      )}
    </p>
  );
}
