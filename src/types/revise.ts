/** One flashcard in the revision deck, whatever its source (interview rounds, AI basics, React Native, modules). */
export interface ReviseCard {
  key: string;
  /** what a deep link uses: round:index, or the flashcard's asset id */
  link: string;
  group: string;
  groupLabel: string;
  kind: string;
  q: string;
  a: string;
  why: string;
  source: string;
}
