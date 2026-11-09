import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Title } from "@/components/HubCards";
import { Reveal } from "@/components/Reveal";
import { toneClass } from "@/config/tones";
import { SECTION_IDS, type Heading, type LandingCard } from "@/content/landing";
import { renderArt } from "./art";
import { SectionHeading } from "./SectionHeading";

/** Two big cards with a framed picture: "Choose where to start". */
export function StartSection({ heading, cards }: { heading: Heading; cards: LandingCard[] }) {
  return (
    <section className="io-sec" aria-labelledby={SECTION_IDS.start}>
      <Reveal>
        <SectionHeading id={SECTION_IDS.start} heading={heading} />
      </Reveal>
      <div className="io-start">
        {cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 90}>
            <article className={`io-big ${toneClass(c.tone)}`}>
              <div className="io-art" aria-hidden>
                {renderArt(c.art)}
              </div>
              <div className="io-big-foot">
                <div>
                  <h3>
                    <Title text={c.title} />
                  </h3>
                  <p>{c.blurb}</p>
                </div>
                <Link className="btn" href={c.href}>
                  {c.cta} <Icon name="arrow" size={16} />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Cards with a picture on a pastel panel above the text: "More than lessons". */
export function FeatureSection({ heading, cards }: { heading: Heading; cards: LandingCard[] }) {
  return (
    <section className="io-sec" aria-labelledby={SECTION_IDS.more}>
      <Reveal>
        <SectionHeading id={SECTION_IDS.more} heading={heading} />
      </Reveal>
      <div className="io-more">
        {cards.map((c, i) => (
          <Reveal key={c.id} delay={i * 80}>
            <article className="io-card">
              <div className={`io-card-art ${toneClass(c.tone)}`} aria-hidden>
                {renderArt(c.art)}
              </div>
              <div className="io-card-body">
                <h3>
                  <Title text={c.title} />
                </h3>
                <p>{c.blurb}</p>
                <Link className="btn" href={c.href}>
                  {c.cta} <Icon name="arrow" size={16} />
                </Link>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
