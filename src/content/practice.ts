/* Practice problems with a checkable answer. Every answer below was worked out by hand and is re-computed
   by tests/modules/practice.test.mts, so a wrong answer fails the build. Numbers are for the examples given. */

export type Level = "new" | "basics" | "interview";

interface Base {
  id: string;
  level: Level;
  topic: string;
  title: string;
  prompt: string;
  /** an optional table shown under the prompt; the first row is the header */
  table?: string[][];
  hint: string;
  /** the worked answer, in plain words */
  solution: string;
  learn: { title: string; href: string };
}
export interface NumberProblem extends Base {
  kind: "number";
  answer: number;
  tolerance: number;
  unit?: string;
}
export interface ChoiceProblem extends Base {
  kind: "choice";
  options: string[];
  answer: number;
}
export type Problem = NumberProblem | ChoiceProblem;

export const LEVELS: { id: Level; title: string; blurb: string }[] = [
  { id: "new", title: "New to this", blurb: "Short questions that teach as you go, no background needed." },
  { id: "basics", title: "I know the basics", blurb: "Problems from the lessons, at a gentle level." },
  { id: "interview", title: "Interview level", blurb: "The harder versions, the way interviews ask them." },
];

export const PROBLEMS: Problem[] = [
  {
    id: "tokens-estimate", kind: "number", level: "new", topic: "AI · Tokens", title: "Estimating tokens",
    prompt: "English text averages about 4 characters per token. About how many tokens is a 6,000-character prompt?",
    answer: 1500, tolerance: 1, unit: "tokens",
    hint: "Divide the characters by the characters in one token.",
    solution: "6,000 characters ÷ 4 characters per token = 1,500 tokens. It is an estimate: code, numbers and other languages split into more tokens.",
    learn: { title: "Tokens and how models read text", href: "/deep/llm-internals" },
  },
  {
    id: "batch-requests", kind: "number", level: "new", topic: "Mobile · Sync", title: "Batching the outbox",
    prompt: "An app queued 37 offline edits. The sync engine sends at most 25 operations per request. How many requests does it need?",
    answer: 2, tolerance: 0, unit: "requests",
    hint: "Fill one request with 25, then see what is left.",
    solution: "37 = 25 + 12, so one full batch and one partial batch: 2 requests.",
    learn: { title: "The offline queue", href: "/modules/rn-offline-queue" },
  },
  {
    id: "context-turns", kind: "number", level: "new", topic: "AI · Context", title: "Turns that fit",
    prompt: "A chat has an 8,000-token window and an 800-token system prompt. Each turn adds 150 tokens from the user and 250 from the assistant. How many complete turns fit?",
    answer: 18, tolerance: 0, unit: "turns",
    hint: "Subtract the system prompt first, then divide by the size of one turn.",
    solution: "8,000 − 800 = 7,200 tokens left. One turn is 150 + 250 = 400 tokens. 7,200 ÷ 400 = 18 turns.",
    learn: { title: "Context windows and compression", href: "/modules/context-window-compression" },
  },
  {
    id: "precision-at-k", kind: "number", level: "new", topic: "AI · Search", title: "Precision at 5",
    prompt: "A retriever returns 5 passages. The relevant ones are at ranks 1, 2 and 4. What is precision@5?",
    answer: 0.6, tolerance: 0.01,
    hint: "Precision@5 is relevant results in the top 5, divided by 5.",
    solution: "3 of the 5 results are relevant, so precision@5 = 3 ÷ 5 = 0.6.",
    learn: { title: "Measuring retrieval with recall, MRR and NDCG", href: "/modules/ragas-retrieval-eval-metrics" },
  },
  {
    id: "token-cost", kind: "number", level: "basics", topic: "AI · Cost", title: "What one request costs",
    prompt: "A request sends 1,200 input tokens and receives 300 output tokens. Input costs $3 per million tokens and output costs $15 per million. What does one request cost, in dollars?",
    answer: 0.0081, tolerance: 0.0001, unit: "dollars",
    hint: "Work out input and output separately, then add them.",
    solution: "Input: 1,200 × $3 ÷ 1,000,000 = $0.0036. Output: 300 × $15 ÷ 1,000,000 = $0.0045. Total $0.0081.",
    learn: { title: "Integrating LLMs into products", href: "/deep/llm-integration" },
  },
  {
    id: "backoff-total", kind: "number", level: "basics", topic: "Mobile · Retries", title: "Total wait with backoff",
    prompt: "A client retries with exponential backoff: waits 1 s, then doubles each time, capped at 30 s. It makes 7 retries. How many seconds does it wait in total?",
    answer: 91, tolerance: 0, unit: "seconds",
    hint: "Write the seven waits: the doubling stops when the cap is reached.",
    solution: "The waits are 1, 2, 4, 8, 16, then 32 capped to 30, then 30. Sum = 1+2+4+8+16+30+30 = 91 seconds.",
    learn: { title: "The offline queue", href: "/modules/rn-offline-queue" },
  },
  {
    id: "cache-latency", kind: "number", level: "basics", topic: "AI · Serving", title: "Average latency with a cache",
    prompt: "A semantic cache answers 80% of requests in 20 ms. The other 20% miss and take 300 ms. What is the average latency in milliseconds?",
    answer: 76, tolerance: 0.5, unit: "ms",
    hint: "Weight each latency by how often it happens.",
    solution: "0.8 × 20 + 0.2 × 300 = 16 + 60 = 76 ms.",
    learn: { title: "Semantic caching", href: "/modules/semantic-cache-redis" },
  },
  {
    id: "mrr", kind: "number", level: "basics", topic: "AI · Search", title: "Mean reciprocal rank",
    prompt: "For 4 queries, the first relevant result appeared at ranks 1, 3, 2 and 5. What is the mean reciprocal rank?",
    answer: 0.508, tolerance: 0.01,
    hint: "Take 1 divided by each rank, then average the four numbers.",
    solution: "1/1 + 1/3 + 1/2 + 1/5 = 1 + 0.333 + 0.5 + 0.2 = 2.033. Divide by 4: 0.508.",
    learn: { title: "Measuring retrieval with recall, MRR and NDCG", href: "/modules/ragas-retrieval-eval-metrics" },
  },
  {
    id: "agent-slips", kind: "number", level: "basics", topic: "AI · Agents", title: "Small slips multiply",
    prompt: "An agent gets each step right 99% of the time. What fraction of 30-step runs come out clean? Give a decimal.",
    answer: 0.74, tolerance: 0.01,
    hint: "Multiply 0.99 by itself once for every step.",
    solution: "0.99 to the power of 30 is about 0.74. Even a 1% slip per step ruins about a quarter of long runs.",
    learn: { title: "Agents and MCP", href: "/deep/agents-mcp" },
  },
  {
    id: "stop-reason", kind: "choice", level: "basics", topic: "AI · Agents", title: "Reading a stop reason",
    prompt: "A model reply ends in the middle of a tool call. Which stop reason should your loop expect, and what should it do?",
    options: ["end_turn: show the reply", "tool_use: run the tool", "max_tokens: the call is cut off, so retry with a larger limit", "stop_sequence: ignore it"],
    answer: 2,
    hint: "The model did not choose to stop. Something cut it off.",
    solution: "A reply cut off by the token limit ends with max_tokens. A half-written tool call cannot run, so raise the limit and retry.",
    learn: { title: "Agents and MCP", href: "/deep/agents-mcp" },
  },
  {
    id: "recall-at-4", kind: "number", level: "interview", topic: "AI · Search", title: "Recall at 4",
    prompt: "Each row is one test question. The numbered columns are the retriever's top 5 results in order: ✓ marks a relevant passage. The last column is how many passages the test set marks as relevant in total, including any the retriever missed. What is the mean recall@4 over these 4 questions? Give a decimal.",
    table: [
      ["question", "1", "2", "3", "4", "5", "relevant in total"],
      ["data retention", "·", "✓", "·", "✓", "·", "3"],
      ["password reset", "✓", "✓", "✓", "✓", "✓", "5"],
      ["laptop policy", "·", "·", "·", "·", "✓", "2"],
      ["API quota", "✓", "·", "✓", "·", "·", "2"],
    ],
    answer: 0.617, tolerance: 0.01,
    hint: "Only the first four columns count. Recall@4 for one question is relevant results found in the top 4, divided by the relevant total.",
    solution: "data retention: 2 ÷ 3 = 0.667. password reset: 4 ÷ 5 = 0.8. laptop policy: 0 ÷ 2 = 0. API quota: 2 ÷ 2 = 1. The mean is (0.667 + 0.8 + 0 + 1) ÷ 4 = 0.617.",
    learn: { title: "Measuring retrieval with recall, MRR and NDCG", href: "/modules/ragas-retrieval-eval-metrics" },
  },
  {
    id: "kv-cache", kind: "number", level: "interview", topic: "AI · Serving", title: "Size of the KV cache",
    prompt: "A model has 32 layers, 8 key-value heads, a head size of 128, and stores values in 16-bit floats (2 bytes). How many MiB of KV cache does one 4,096-token sequence need? A MiB is 1,048,576 bytes.",
    answer: 512, tolerance: 0.5, unit: "MiB",
    hint: "Each token stores a key and a value (2 vectors) for every layer and every KV head.",
    solution: "Bytes per token = 2 × 32 layers × 8 heads × 128 × 2 bytes = 131,072. Times 4,096 tokens = 536,870,912 bytes = 512 MiB.",
    learn: { title: "Prefix caching in vLLM", href: "/modules/vllm-prefix-caching" },
  },
  {
    id: "agent-budget", kind: "number", level: "interview", topic: "AI · Agents", title: "Needed step reliability",
    prompt: "You need 90% of 30-step agent runs to finish clean. What per-step success rate do you need? Give a decimal to three places.",
    answer: 0.9965, tolerance: 0.0005,
    hint: "Solve p to the power of 30 = 0.9 for p, by taking the 30th root.",
    solution: "p = 0.9 to the power of 1/30 = about 0.9965. So each step must succeed 99.65% of the time.",
    learn: { title: "Agents and MCP", href: "/deep/agents-mcp" },
  },
];

export const problemsFor = (level: Level) => PROBLEMS.filter((p) => p.level === level);

export function check(p: Problem, input: string | number): boolean {
  if (p.kind === "choice") return Number(input) === p.answer;
  const n = Number(String(input).replace(/[, $%]/g, ""));
  return Number.isFinite(n) && Math.abs(n - p.answer) <= p.tolerance;
}
