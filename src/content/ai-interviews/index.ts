import { BASICS } from "./basics";
import { BUILD } from "./build";
import { HACKS } from "./hacks";
import { PLAYBOOK } from "./playbook";
import { ROUNDS } from "./rounds";
import type { InterviewPath, Lesson } from "./types";

export const AI_PATHS: InterviewPath[] = [
  { id: "hacks", title: "AI interview hacks", short: "Hacks", blurb: "The most useful ideas people share, tested and turned into drills: hint ladders, planted bugs, recorded mocks, and more. Plus where the line sits.", color: ["#f43f5e", "#f59e0b"], lessons: HACKS },
  { id: "rounds", title: "AI interview rounds", short: "Rounds", blurb: "Every round you may meet now, from coding beside an assistant to RAG, agents, evals and a customer role-play. What each tests, with code you can run.", color: ["#ff5a1f", "#0ea5e9"], lessons: ROUNDS },
  { id: "playbook", title: "Crack it with AI, the best way", short: "Playbook", blurb: "A plan that works from any starting point: an honest baseline, a daily loop, and a final stretch with AI off to prove the skill is yours.", color: ["#10b981", "#0ea5e9"], lessons: PLAYBOOK },
  { id: "build", title: "Build your own AI interviewer", short: "Build", blurb: "Our pick. Build a mock interviewer that you'll really use, and walk away with a true project story, with real measurements behind it.", color: ["#a855f7", "#c2410c"], lessons: BUILD },
];

export const getPath = (id: string) => AI_PATHS.find((p) => p.id === id);
export const allLessons = (): { path: InterviewPath; lesson: Lesson }[] => AI_PATHS.flatMap((path) => path.lessons.map((lesson) => ({ path, lesson })));
export const BASIC_CARD_COUNT = BASICS.reduce((n, s) => n + s.memorise.length, 0);
export const LESSON_COUNT = AI_PATHS.reduce((n, p) => n + p.lessons.length, 0);
export { BASICS };
