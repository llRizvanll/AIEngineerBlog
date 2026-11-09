import type { Metadata } from "next";
import Link from "next/link";
import { Runner } from "@/components/practice/Runner";
import { Book, Title } from "@/components/HubCards";
import { PROBLEMS } from "@/content/practice";
import { PRACTICE_COPY, PRACTICE_META } from "@/content/pages/practice";

export const metadata: Metadata = PRACTICE_META;

export default function PracticePage() {
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              {PRACTICE_COPY.title.lead}<em>{PRACTICE_COPY.title.accent}</em>
            </h1>
            <p>
              {PROBLEMS.length}{PRACTICE_COPY.introTail}
            </p>
          </div>
        </div>
        <Runner />
        <h2 className="ap-h">{PRACTICE_COPY.more}</h2>
        <div className="cb-grid">
          {PRACTICE_COPY.cards.map((c, i) => (
            <Link key={c.href} href={c.href} className={`cb pc-${[5, 6, 4][i]}`}>
              <Book icon={c.icon} label={c.t.split(" ")[0].toUpperCase().slice(0, 11)} />
              <span className="cb-tx">
                <small>{PRACTICE_COPY.cardTag}</small>
                <b>
                  <Title text={c.t} />
                </b>
                <span>{c.d}</span>
                <i>{PRACTICE_COPY.open}</i>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
