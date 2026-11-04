import Link from "next/link";
import type { Metadata } from "next";
import { DEEP } from "@/lib/content";
import { Footer } from "@/components/ui";

export const metadata: Metadata = { title: "Deep dives", description: "Low-level design pages for mobile components and an AI handbook." };

const GROUPS: [string, string, string][] = [
  ["mobile", "Mobile components · low-level design", "How the parts inside an offline-first app actually work, with production code."],
  ["ai", "AI handbook", "Internals, acceleration, retrieval, customisation, agents, integration and team adoption."],
];

export default function DeepIndex() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">Deep dives</div>
          <h1>
            Under the <span className="serif grad-text">hood.</span>
          </h1>
          <p>
            Panels push past the boxes on your diagram. These pages go one level down: what each component does in a real run, its internal parts
            and states, the code, the platform details, the technology choices and the questions you will be asked.
          </p>
        </section>
        {GROUPS.map(([g, title, sub]) => {
          const items = DEEP.filter((d) => d.group === g);
          return (
            <div key={g}>
              <div className="section-h">
                <h2>{title}</h2>
                <span>{items.length} pages</span>
              </div>
              <p className="grp-sub">{sub}</p>
              <div className="iv-grid stagger">
                {items.map((d) => (
                  <Link key={d.id} className="iv-card" href={`/deep/${d.id}`}>
                    <div className="iv-top">
                      <span className={"pill " + (d.group === "ai" ? "ai" : "")}>{d.group === "ai" ? "AI" : "Mobile"}</span>
                      <span className="mono">{d.kicker.split("·")[1] || ""}</span>
                    </div>
                    <h3>{d.title}</h3>
                    <p>{d.summary.length > 200 ? d.summary.slice(0, 197) + "…" : d.summary}</p>
                    <span className="iv-go">Read the deep dive →</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Footer>AI Engineer · deep dives</Footer>
    </main>
  );
}
