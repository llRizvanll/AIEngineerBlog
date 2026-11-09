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
import { RN_PATH_TITLE, RN_PATH_DESCRIPTION } from "@/content/page-copy";
import { RN_PATH_HREF } from "@/config/constants";
import { RN_PATH_COPY } from "@/content/pages/paths-react-native";

export const metadata: Metadata = { title: RN_PATH_TITLE, description: RN_PATH_DESCRIPTION, keywords: ["React Native architecture", "React Native interview", "JSI Fabric TurboModules", "React Native offline sync", "React Native performance"] };

export default function ReactNativeHub() {
  const slideCount = Object.values(RN_SLIDES).reduce((n, s) => n + s.length, 0);
  const pages = RN_HUB.flatMap((g) => g.items);
  return (
    <main className="pg">
      <JsonLd data={courseLd({ title: RN_PATH_TITLE, description: RN_PATH_DESCRIPTION, path: RN_PATH_HREF, parts: pages.map(([href]) => ({ title: titleFor(href), path: href })) })} />
      <JsonLd data={breadcrumbLd([["Home", "/"], ["React Native", RN_PATH_HREF]])} />
      <div className="wrap">
        <section className="pg-hero">
          <div className="kicker">
            <Link href={RN_PATH_COPY.curriculum.href}>{RN_PATH_COPY.curriculum.label}</Link>{RN_PATH_COPY.kickerTail}
          </div>
          <h1>
            {RN_PATH_COPY.title.lead}<span className="serif grad-text">{RN_PATH_COPY.title.accent}</span>
          </h1>
          <p>
            {pages.length}
            {RN_PATH_COPY.intro.pagesTail}
            {RN_CARDS.length}
            {RN_PATH_COPY.intro.cardsTail}
            {slideCount}
            {RN_PATH_COPY.intro.slidesTail}
          </p>
          <StudyWithAI title={RN_PATH_TITLE} />
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
          <h2>{RN_PATH_COPY.recall.title}</h2>
          <span>{RN_CARDS.length}{RN_PATH_COPY.recall.blurbTail}</span>
        </div>
        <Link className="ip-basics" href={`/revise?card=${rnCardKey(0)}`}>
          <div>
            <h3>{RN_PATH_COPY.recall.heading}</h3>
            <p>{RN_PATH_COPY.recall.text}</p>
          </div>
          <span className="btn">{RN_PATH_COPY.recall.cta}</span>
        </Link>
      </div>
      <Footer>{RN_PATH_COPY.footer}</Footer>
    </main>
  );
}
