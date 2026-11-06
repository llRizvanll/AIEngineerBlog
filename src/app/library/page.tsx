import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { Library } from "@/components/Library";

export const metadata: Metadata = { title: "My library", description: "Saved pages and reading progress." };

export default function LibraryPage() {
  return (
    <main>
      <div className="wrap">
        <section className="iv-hero">
          <div className="kicker">My library</div>
          <h1>
            Your reading, <span className="serif grad-text">kept.</span>
          </h1>
          <p>Saved pages, your notes and reading progress. This browser keeps them, and nothing leaves it.</p>
        </section>
        <Library />
      </div>
      <Footer>AI Engineer · library</Footer>
    </main>
  );
}
