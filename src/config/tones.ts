/* The pastel tones used for cards, covers and notebooks. The colours themselves live in the stylesheet
   (styles/tokens.css, --tone-0 ... --tone-7) so light and dark can share them; this file only says how many
   there are and how a list position picks one. */

export const TONE_COUNT = 8;

/** The class that applies tone number `n` (wraps around), for an element's position in a list. */
export const toneClass = (n: number) => `pc-${((n % TONE_COUNT) + TONE_COUNT) % TONE_COUNT}`;
