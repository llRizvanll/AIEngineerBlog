import Link from "next/link";
import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { StudyWithAI } from "@/components/StudyWithAI";
import { RN_HUB } from "@/content/rn-hub";
import { RN_CARDS } from "@/content/rn-cards";
import { RN_SLIDES } from "@/content/rn-slides";
import { titleFor } from "@/lib/programme";
import { rnCardKey } from "@/lib/rn-cards";
import { courseLd, breadcrumbLd } from "@/lib/site";

const PATH = "/paths/react-native";
const TITLE = "React Native in one place: architecture, state, sync and performance";
const DESCRIPTION = "Every React Native page on the site in reading order: the New Architecture, state and render storms, modular codebases, memory leaks, offline queues, native boundaries and performance budgets, with tested code, slides and flashcards.";

export const metadata: Metadata = { title: TITLE, description: DESCRIPTION, keywords: ["React Native architecture", "React Native interview", "JSI Fabric TurboModules", "React Native offline sync", "React Native performance"] };

export default function ReactNativeHub() {
  const slideCount = Object.values(RN_SLIDES).reduce((n, s) => n + s.length, 0);
  const pages = RN_HUB.flatMap((g) => g.items);
  return (
    <main className="pg">
      <JsonLd data={courseLd({ title: TITLE, description: DESCRIPTION, path: PATH, parts: pages.map(([href]) => ({ title: titleFor(href), path: href })) })} />
      <JsonLd data={breadcrumbLd([["Home", "/"], ["React Native", PATH]])} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href="/aiengine">Curriculum</Link> · React Native
          </div>
          <h1>
            React Native, <span className="serif grad-text">in one place.</span>
          </h1>
          <p>
            {pages.length} pages in reading order, from how the runtime works to offline queues and CI budgets. {RN_CARDS.length} flashcards and {slideCount} slides come with them. Read top to bottom, or jump to the part you need.
          </p>
          <StudyWithAI title={TITLE} />
        </section>

        {RN_HUB.map((g) => (
          <section key={g.title}>
            <div className="section-h">
              <h2>{g.title}</h2>
              <span>{g.blurb}</span>
            </div>
            <ol className="pg-days rh-list">
              {g.items.map(([href, why]) => (
                <li key={href}>
                  <Link href={href}>
                    <span className="pg-tx">
                      <b>{titleFor(href)}</b>
                      <span>{why}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <div className="section-h">
          <h2>Recall</h2>
          <span>{RN_CARDS.length} cards on the Revise page</span>
        </div>
        <Link className="ip-basics" href={`/revise?card=${rnCardKey(0)}`}>
          <div>
            <h3>React Native at scale flashcards</h3>
            <p>Spaced recall for every module above. Filter by "React Native at scale" on the Revise page.</p>
          </div>
          <span className="btn">Start recalling →</span>
        </Link>
      </div>
      <Footer>AI Engineer · React Native in one place</Footer>
    </main>
  );
}
