import type { Metadata } from "next";
import { Footer } from "@/components/ui";
import { KeepReading } from "@/components/KeepReading";
import { Library } from "@/components/Library";
import { LIBRARY_PAGE_META } from "@/content/pages/library";

export const metadata: Metadata = LIBRARY_PAGE_META;

export default function LibraryPage() {
  return (
    <main className="app-page">
      <div>
        <div className="ap-head">
          <div>
            <h1>
              Your <em>progress</em>
            </h1>
            <p>Saved pages, your notes and where you left off. This browser keeps them, and nothing leaves it.</p>
          </div>
        </div>
        <KeepReading />
        <section className="ap-card">
          <Library />
        </section>
      </div>
      <Footer>AI Engineer · progress</Footer>
    </main>
  );
}
