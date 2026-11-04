import { CASES, DEEP, POSTS, PROTOCOLS, REELS, PART_ONE, totalCritical } from "./content";
import { PATTERNS } from "@/content/coding";
import { MOBILE_PROBLEMS } from "@/content/mobile-coding";

export interface Lesson {
  href: string;
  title: string;
  kind: "Post" | "Round" | "Deep dive" | "Reels" | "Revise" | "Protocol" | "Pattern" | "Behavioral";
  meta: string;
}

const post = (id: string): Lesson | null => {
  const p = POSTS.find((x) => x.id === id);
  return p ? { href: `/series/${id}`, title: `Part ${Number(p.num)} · ${p.title}`, kind: "Post", meta: `${p.mins} min` } : null;
};
const partOne: Lesson = { href: `/series/${PART_ONE.id}`, title: `Part 1 · ${PART_ONE.title}`, kind: "Post", meta: `${PART_ONE.mins} min` };
const round = (id: string): Lesson | null => {
  const c = CASES.find((x) => x.id === id);
  return c ? { href: `/interview/${id}`, title: c.title, kind: "Round", meta: `${c.minutes} min` } : null;
};
const deep = (id: string): Lesson | null => {
  const d = DEEP.find((x) => x.id === id);
  return d ? { href: `/deep/${id}`, title: d.title, kind: "Deep dive", meta: "" } : null;
};
const reels = (id: string): Lesson | null => {
  const c = REELS.find((x) => x.id === id);
  return c ? { href: `/reels/${id}`, title: c.title, kind: "Reels", meta: "course" } : null;
};
const revise: Lesson = { href: "/revise", title: `Revise critical Q&A (${totalCritical()} cards)`, kind: "Revise", meta: "" };

export interface Phase {
  num: string;
  title: string;
  blurb: string;
  lessons: Lesson[];
}

const raw: [string, string, string, (Lesson | null)[]][] = [
  ["00", "Foundations", "What the OS does to your app and why offline-first is the answer.", [partOne, reels("c-found")]],
  ["01", "Local data and the sync protocol", "SQLite, the outbox, cursors, idempotency and conflicts.", [post("sqlite"), post("conflicts"), deep("sync-engine"), reels("c-data"), reels("c-proto")]],
  ["02", "Files and background execution", "Resumable transfers and what Android and iOS allow in the background.", [post("uploads"), deep("transfer-manager"), deep("background-layer"), reels("c-files"), reels("c-android"), reels("c-ios")]],
  ["03", "Front end and React Native", "UI architecture, sync-aware screens and the native split.", [post("rn"), deep("frontend-arch"), reels("c-rn")]],
  ["04", "Backend at scale", "Change logs, CDC, snapshots, fan-out and protecting the API.", [post("backend"), deep("server-sync"), reels("c-scale"), reels("c-rel")]],
  ["05", "Mobile system design rounds", "Six full rounds: offline, chat, feed, payments, booking, release.", ["offline-field", "chat", "feed", "payments", "booking", "release"].map(round)],
  ["06", "AI foundations", "LLM internals, inference acceleration, embeddings, adaptation.", [deep("llm-internals"), deep("inference-accel"), deep("embeddings"), deep("adapt-models"), reels("c-aihb")]],
  ["07", "AI systems", "Agents and MCP, integration, team acceleration, and five AI rounds.", [deep("agents-mcp"), deep("llm-integration"), deep("ai-dev-accel"), ...["ai-assistant", "on-device", "rag", "llm-serving", "ai-evals"].map(round)]],
  ["08", "Interview mastery", "How panels score, decision stories, rapid revision.", [post("interview"), revise, reels("c-interview"), reels("c-cases")]],
  ["09", "Coding round", "Fifteen patterns, 45 worked problems, mobile machine coding in Swift, and the hacks that save minutes.", [
    { href: "/coding", title: "Coding method, cheat sheets and hacks", kind: "Pattern", meta: "start here" },
    ...PATTERNS.map((p) => ({ href: `/coding/${p.id}`, title: p.name, kind: "Pattern" as const, meta: "" })),
    reels("c-patterns"), reels("q-coding-hacks"),
    { href: "/mobile-coding", title: "Mobile machine coding (Swift)", kind: "Pattern", meta: `${MOBILE_PROBLEMS.length} problems` },
    ...MOBILE_PROBLEMS.map((m) => ({ href: `/mobile-coding/${m.id}`, title: m.title, kind: "Pattern" as const, meta: `${m.minutes} min` })),
    reels("c-mobile"),
  ]],
  ["10", "Behavioral round", "Problem-solving questions answered in STAR form, with probes and red flags.", [
    { href: "/problem-solving", title: "33 problem-solving questions with model answers", kind: "Behavioral", meta: "33 Q&A" },
    reels("c-behavioral"), reels("q-star"),
  ]],
  ["11", "Protocol Explorer", "Fourteen protocols decoded packet by packet: DHCP to SSH.", PROTOCOLS.map((d) => ({ href: `/protocols/${d.id}`, title: `${d.name} · ${d.full}`, kind: "Protocol" as const, meta: "" }))],
];

export const PHASES: Phase[] = raw.map(([num, title, blurb, lessons]) => ({
  num,
  title,
  blurb,
  lessons: lessons.filter((l): l is Lesson => !!l),
}));

const allLessons = PHASES.flatMap((p) => p.lessons);
export const lessonTitle = (href: string) => allLessons.find((l) => l.href === href)?.title ?? href;

export const PATHS: { title: string; blurb: string; hrefs: string[] }[] = [
  { title: "Mobile principal in two weeks", blurb: "Everything for a mobile-led loop.", hrefs: ["/series/background-sync", "/series/sqlite", "/series/conflicts", "/series/uploads", "/series/rn", "/series/backend", "/interview/offline-field", "/interview/chat", "/interview/payments", "/series/interview"] },
  { title: "AI engineering track", blurb: "From internals to shipping LLM features.", hrefs: ["/deep/llm-internals", "/deep/inference-accel", "/deep/embeddings", "/deep/adapt-models", "/deep/agents-mcp", "/deep/llm-integration", "/interview/rag", "/interview/llm-serving", "/interview/ai-evals"] },
  { title: "Three-day interview crunch", blurb: "Highest value per hour.", hrefs: ["/series/interview", "/interview/offline-field", "/interview/ai-assistant", "/revise"] },
  { title: "Offline-first deep dive", blurb: "The one topic panels love most.", hrefs: ["/series/background-sync", "/series/sqlite", "/series/conflicts", "/deep/sync-engine", "/deep/transfer-manager", "/series/uploads"] },
];

export const GLOSSARY: [string, string][] = [
  ["Outbox", "Table of pending local writes, committed in the same transaction as the data, drained by the sync engine."],
  ["Idempotency key", "A client-generated ID (op_id) that makes a retried request safe because the server applies it once."],
  ["Cursor", "The last server sequence number a client has seen; pulls ask for changes after it."],
  ["Tombstone", "A marker row that records a deletion so other devices can delete too."],
  ["410 Gone rebuild", "Server answer when a cursor is older than the retained log, telling the client to reload from a snapshot."],
  ["WAL", "Write-ahead log mode in SQLite: readers do not block the single writer."],
  ["Keyset paging", "Paging by the last seen key instead of OFFSET, so every page costs the same."],
  ["FTS5", "SQLite full-text search extension using an inverted index."],
  ["HLC", "Hybrid logical clock: wall time plus counter that never goes backwards and tracks real time."],
  ["CRDT", "Data type whose replicas always converge, whatever order updates arrive in."],
  ["Optimistic concurrency", "Send the version you edited from; the server rejects with 409 if it is stale."],
  ["Multipart upload", "Splitting a file into independently uploaded and retriable parts, assembled by the store."],
  ["Presigned URL", "A time-limited URL that lets a client talk to object storage directly."],
  ["Range request", "HTTP request for part of a file; the basis of resumable downloads."],
  ["WorkManager", "Android library for deferrable, guaranteed background work."],
  ["BGTaskScheduler", "iOS framework that runs background tasks at times the system chooses."],
  ["Background URLSession", "iOS transfer session performed by a system daemon and surviving app termination."],
  ["Turbo Module", "React Native native module using JSI with a typed spec."],
  ["KMP", "Kotlin Multiplatform: share Kotlin logic between Android and iOS."],
  ["CDC", "Change data capture: streaming committed database changes from the log into a queue."],
  ["Thundering herd", "Many clients retrying at once after an outage; answered with jitter and Retry-After."],
  ["KV cache", "Stored attention keys and values per token during generation; it limits concurrent requests per GPU."],
  ["Continuous batching", "Serving technique that adds and removes requests from a running batch every step."],
  ["PagedAttention", "Managing the KV cache in blocks to cut memory waste."],
  ["Quantisation", "Storing weights or activations at lower precision to save memory and speed up inference."],
  ["Embedding", "A vector representing meaning so similar items are close together."],
  ["RAG", "Retrieval-augmented generation: fetch relevant documents and give them to the model."],
  ["Reranker", "A model that reads query and candidate together to order results precisely."],
  ["LoRA", "Fine-tuning by training small adapter matrices instead of all weights."],
  ["MCP", "Model Context Protocol: a standard for exposing tools and data to AI applications."],
  ["Prompt injection", "Instructions hidden in content that try to steer a model into unintended actions."],
  ["Eval gate", "An automated quality check that a prompt or model change must pass before release."],
];
