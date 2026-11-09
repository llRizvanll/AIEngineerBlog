import Link from "next/link";
import { Fragment } from "react";
import { HeroLeft, HeroRight } from "@/components/HeroArt";
import { HERO } from "@/content/landing";

export function LandingHero() {
  return (
    <section className="io-hero">
      <div className="io-art-l" aria-hidden>
        <HeroLeft />
      </div>
      <div className="io-art-r" aria-hidden>
        <HeroRight />
      </div>
      <div className="io-hero-in">
        <h1>
          {HERO.headline.map((line, i) => (
            <Fragment key={line}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h1>
        <p className="io-lede">{HERO.lede}</p>
        <div className="btns">
          <Link className="btn" href={HERO.primary.href}>
            {HERO.primary.label}
          </Link>
          <a className="io-link" href={`#${HERO.secondary.anchor}`}>
            {HERO.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
