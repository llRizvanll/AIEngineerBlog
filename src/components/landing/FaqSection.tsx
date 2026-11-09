import { Reveal } from "@/components/Reveal";
import { FAQ, FAQ_HEADING, SECTION_IDS } from "@/content/landing";

export function FaqSection() {
  return (
    <section className="io-sec io-faq" aria-labelledby={SECTION_IDS.faq}>
      <Reveal>
        <h2 id={SECTION_IDS.faq}>{FAQ_HEADING}</h2>
      </Reveal>
      <Reveal>
        <div className="io-faq-list">
          {FAQ.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
