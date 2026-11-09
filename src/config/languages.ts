/* The languages a code sample can be shown in. The first entry of a sample is its default;
   the reader's choice is remembered and applies to every sample that offers it. */

export const LANGUAGES = [
  { id: "ts", label: "TypeScript", highlight: "ts", extension: "ts" },
  { id: "kotlin", label: "Kotlin", highlight: "kotlin", extension: "kt" },
  { id: "java", label: "Java", highlight: "java", extension: "java" },
] as const;

export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const languageById = (id: string) => LANGUAGES.find((l) => l.id === id);

/** The same code sample in another language. `id` picks the tab; the file name defaults from the sample's title. */
export interface CodeVariant {
  id: LanguageId;
  src: string;
  fileName?: string;
}
