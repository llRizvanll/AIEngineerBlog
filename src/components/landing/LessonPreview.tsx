import Link from "next/link";
import { Icon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { LESSON_PREVIEW as L, SECTION_IDS } from "@/content/landing";
import { SectionHeading } from "./SectionHeading";

/** A worked example from a real lesson, in the same format the lessons use. */
export function LessonPreview() {
  return (
    <section className="io-sec" aria-labelledby={SECTION_IDS.lesson}>
      <Reveal>
        <SectionHeading id={SECTION_IDS.lesson} heading={L.heading} />
      </Reveal>
      <Reveal>
        <div className="io-lesson">
          <div className="io-lesson-top">
            <span>{L.topic}</span>
            <span>{L.example}</span>
          </div>
          <h3>{L.title}</h3>
          <p className="io-lesson-q">{L.question}</p>
          <ol>
            {L.steps.map((step, i) => (
              <li key={step.title}>
                <i>{i + 1}</i>
                <div>
                  <b>{step.title}</b>
                  <code>{step.code}</code>
                  <span>{step.note}</span>
                </div>
              </li>
            ))}
          </ol>
          <div className="io-answer">
            <b>Answer</b> {L.answer}
          </div>
          <Link className="io-go" href={L.link.href}>
            {L.link.label} <Icon name="arrow" size={15} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
