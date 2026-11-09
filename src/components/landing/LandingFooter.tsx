import Link from "next/link";
import { FOOTER } from "@/content/landing";

import type { NavGroup } from "@/lib/nav-types";
import { SITE } from "@/content/site";

/** The footer lists every group of the site map, so a new section appears here without any edit. */
export function LandingFooter({ groups }: { groups: NavGroup[] }) {
  return (
    <footer className="io-foot">
      <div className="io-foot-top">
        <div>
          <span className="lp-brand">
            <span className="logo-mark sm">AI</span> {SITE.name}
          </span>
          <p>
            {SITE.tagline}. Written by {SITE.author}.
          </p>
        </div>
        <nav aria-label="Footer" className="lp-foot-cols">
          {groups.map((g) => (
            <div key={g.id}>
              <h4>{g.label}</h4>
              {g.items.map((it) => (
                <Link key={it.href} href={it.href}>
                  {it.title}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>
      <p className="lp-foot-end">
        {FOOTER.note} <Link href={FOOTER.link.href}>{FOOTER.link.label}</Link>
      </p>
    </footer>
  );
}
