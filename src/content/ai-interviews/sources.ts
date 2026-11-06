import type { Source } from "./types";

export const CHECKED = "November 2026";

export const SOURCES: Record<string, Source> = {
  canva: { label: "Yes, you can use AI in our interviews", url: "https://www.canva.dev/blog/engineering/yes-you-can-use-ai-in-our-interviews/", who: "The company", date: "June 2025" },
  register: { label: "Canva now requires use of AI during developer job interviews", url: "https://theregister.com/2025/06/11/canva_coding_assistant_job_interviews", who: "Press", date: "June 2025" },
  hello: { label: "Meta's AI-enabled coding round", url: "https://www.hellointerview.com/blog/meta-ai-enabled-coding", who: "Prep vendor" },
  iio: { label: "How to use AI in Meta's AI-assisted coding interview", url: "https://interviewing.io/blog/how-to-use-ai-in-meta-s-ai-assisted-coding-interview-with-real-prompts-and-examples", who: "Prep vendor" },
  coditioning: { label: "Meta AI-enabled coding interview guide", url: "https://www.coditioning.com/blog/13/meta-ai-enabled-coding-interview-guide", who: "Prep vendor", date: "November 2026" },
  google: { label: "Google is testing a new rule for job interviews", url: "https://www.entrepreneur.com/business-news/google-is-testing-a-new-rule-transform-job-interviews", who: "Press", date: "May 2026" },
  ticoding: { label: "What Meta and Google's AI-enabled rounds test", url: "https://www.techinterview.org/post/3233477234/meta-google-ai-enabled-coding-interview/", who: "Individual", date: "August 2026" },
  tiloop: { label: "What applied-AI engineer interviews test", url: "https://www.techinterview.org/post/3233476824/ai-engineer-interview-rag-agents-evals/", who: "Individual", date: "July 2026" },
  tievals: { label: "Interviewing for AI eval engineering roles", url: "https://www.techinterview.org/post/3233475313/interviewing-ai-eval-engineering-roles-2026/", who: "Individual", date: "June 2026" },
  tianpan: { label: "Stop testing implementation, start probing eval design", url: "https://tianpan.co/blog/2026-04-27-ai-engineer-interview-eval-design", who: "Individual", date: "April 2026" },
  promptlayer: { label: "The agentic system design interview", url: "https://blog.promptlayer.com/the-agentic-system-design-interview-how-to-evaluate-ai-engineers/", who: "Individual", date: "July 2025" },
  builtin: { label: "The debate over AI in job interviews", url: "https://builtin.com/articles/ai-job-interview-cheating-debate", who: "Press", date: "February 2026" },
  cnbc: { label: "Meet the 21-year-old helping coders use AI to cheat", url: "https://www.nbcnewyork.com/news/business/money-report/meet-the-21-year-old-helping-coders-use-ai-to-cheat-in-google-and-other-tech-job-interviews/6178911/", who: "Press", date: "2025" },
  kapwing: { label: "What it's like to interview a software engineer preparing with AI", url: "https://kapwing.com/blog/what-its-like-to-interview-a-software-engineer-preparing-with-ai", who: "Individual", date: "April 2025" },
  epps: { label: "The best AI prompts for coding interview practice", url: "https://paulepps.substack.com/p/the-best-ai-prompts-for-coding-interview", who: "Individual", date: "October 2026" },
  karuha: { label: "How I used AI to practice for my Meta interview", url: "https://dev.to/karuha/how-i-used-ai-to-practice-for-my-meta-interview-and-got-the-offer-543n", who: "Individual" },
};
