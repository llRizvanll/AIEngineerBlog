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
          <p>Pages you saved and everything you have opened, with how far you got. Stored only in this browser.</p>
        </section>
        <Library />
      </div>
      <Footer>AI Engineer · library</Footer>
    </main>
  );
}
