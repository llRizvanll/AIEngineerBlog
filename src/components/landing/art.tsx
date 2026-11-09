import type { ReactNode } from "react";
import type { LandingArt } from "@/content/landing";
import { ArtAIBig, ArtBuild, ArtInterview, ArtMobileBig, ArtPractice } from "@/components/HeroArt";

/** Maps the illustration names used in content/landing.ts to the drawings. Adding a picture means one line here. */
const ART: Record<LandingArt, () => ReactNode> = {
  ai: () => <ArtAIBig />,
  mobile: () => <ArtMobileBig />,
  practice: () => <ArtPractice />,
  build: () => <ArtBuild />,
  interview: () => <ArtInterview />,
};

export const renderArt = (art: LandingArt) => ART[art]();
