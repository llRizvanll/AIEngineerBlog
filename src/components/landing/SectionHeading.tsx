import type { Heading } from "@/content/landing";

/** A section title with an optional italic ending, and a one-line subtitle under it. */
export function SectionHeading({ id, heading }: { id: string; heading: Heading }) {
  return (
    <>
      <h2 id={id}>
        {heading.em ? `${heading.text} ` : heading.text}
        {heading.em && <em>{heading.em}</em>}
      </h2>
      {heading.sub && <p className="io-sub">{heading.sub}</p>}
    </>
  );
}
