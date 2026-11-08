/* Where to go after a page: talks to watch and public docs, papers and standards to read.
   Every link here was opened and checked before it was added. Matched by topic, so a new page picks up sources
   without being listed one by one. Add a topic here and every page that mentions it gets the links. */

export interface Source {
  title: string;
  by: string;
  url: string;
  why: string;
  kind: "watch" | "read";
}

const w = (title: string, by: string, url: string, why: string): Source => ({ title, by, url, why, kind: "watch" });
const r = (title: string, by: string, url: string, why: string): Source => ({ title, by, url, why, kind: "read" });

const YT = "https://www.youtube.com/watch?v=";

const S = {
  introLlm: w("[1hr Talk] Intro to Large Language Models", "Andrej Karpathy, on YouTube", YT + "zjkBMFhNj_g", "A one-hour tour of how a model is trained and used, including how it calls tools."),
  tokenizer: w("Let's build the GPT Tokenizer", "Andrej Karpathy, on YouTube", YT + "zduSFxRajkE", "Builds a tokenizer from scratch and shows why odd tokenization causes odd behaviour."),
  buildGpt: w("Let's build GPT: from scratch, in code", "Andrej Karpathy, on YouTube", YT + "kCc8FmEb1nY", "Writes a small transformer line by line, so attention stops being abstract."),
  deepDive: w("Deep Dive into LLMs like ChatGPT", "Andrej Karpathy, on YouTube", YT + "7xTGNNLPyMI", "Pre-training, fine-tuning and what the model is doing when it answers."),
  transformers: w("Transformers, the tech behind LLMs", "3Blue1Brown, on YouTube", YT + "wjZofJX0v4M", "A visual walk through how text becomes vectors and a next-word guess."),
  attention: w("Attention in transformers, step-by-step", "3Blue1Brown, on YouTube", YT + "eMlx5fFNoYc", "The attention step drawn out, one query and key at a time."),

  attnPaper: r("Attention Is All You Need", "Vaswani and others, 2017", "https://arxiv.org/abs/1706.03762", "The paper that introduced the transformer."),
  chatTemplates: r("Chat templates", "Hugging Face Transformers docs", "https://huggingface.co/docs/transformers/main/en/chat_templating", "How a conversation becomes the exact token string a model reads."),
  pagedAttention: r("Efficient memory management for LLM serving with PagedAttention", "Kwon and others, 2023", "https://arxiv.org/abs/2309.06180", "The idea behind vLLM: manage the KV cache like virtual memory."),
  vllm: r("vLLM", "vLLM project on GitHub", "https://github.com/vllm-project/vllm", "An open-source serving engine to read, run and benchmark against."),
  caching: r("Prompt caching", "Anthropic docs", "https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching", "What gets cached, for how long, and how it changes cost and latency."),
  ragPaper: r("Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", "Lewis and others, 2020", "https://arxiv.org/abs/2005.11401", "The paper that named retrieval-augmented generation."),
  contextual: r("Introducing Contextual Retrieval", "Anthropic", "https://www.anthropic.com/news/contextual-retrieval", "Adding context to chunks before indexing, and what it did to retrieval failures."),
  lostMiddle: r("Lost in the Middle", "Liu and others, 2023", "https://arxiv.org/abs/2307.03172", "Why models use facts at the start and end of a long context better than the middle."),
  agents: r("Building effective agents", "Anthropic", "https://www.anthropic.com/engineering/building-effective-agents", "When a fixed workflow beats an agent, and the patterns that work."),
  react: r("ReAct: Synergizing Reasoning and Acting in Language Models", "Yao and others, 2022", "https://arxiv.org/abs/2210.03629", "The paper that put reasoning and tool calls in one loop."),
  toolUse: r("Tool use with Claude", "Anthropic docs", "https://docs.anthropic.com/en/docs/build-with-claude/tool-use", "The tool_use and tool_result round trip in full."),
  fnCalling: r("Function calling", "OpenAI API docs", "https://platform.openai.com/docs/guides/function-calling", "The same round trip in OpenAI's API."),
  evals: r("Your AI product needs evals", "Hamel Husain", "https://hamel.dev/blog/posts/evals/", "A practical way to build evals from real failures, not from a guess."),
  lora: r("LoRA: Low-Rank Adaptation of Large Language Models", "Hu and others, 2021", "https://arxiv.org/abs/2106.09685", "Adapting a model by training small low-rank matrices instead of every weight."),

  rnArch: r("React Native architecture overview", "React Native docs", "https://reactnative.dev/architecture/landing-page", "The threading model, Fabric, TurboModules and the move away from the bridge."),
  rnPerf: r("Performance overview", "React Native docs", "https://reactnative.dev/docs/performance", "What to measure first, and the common causes of dropped frames."),
  workManager: r("Getting started with WorkManager", "Android Developers", "https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started", "Persistent background work that survives the app being killed."),
  bgTasks: r("BackgroundTasks", "Apple developer docs", "https://developer.apple.com/documentation/backgroundtasks", "How iOS schedules refresh and processing work, and what it will not promise."),
  offlineFirst: r("Build an offline-first app", "Android Developers", "https://developer.android.com/topic/architecture/data-layer/offline-first", "The local database as the source of truth, with sync behind it."),
  wal: r("Write-ahead logging", "SQLite docs", "https://www.sqlite.org/wal.html", "How SQLite lets readers and a writer work at once, and what a checkpoint does."),
  atomic: r("Atomic commit in SQLite", "SQLite docs", "https://www.sqlite.org/atomiccommit.html", "How a transaction survives a crash or a power cut."),
  optimistic: r("Optimistic updates", "TanStack Query docs", "https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates", "Showing the result first and rolling back if the server says no."),

  tcp: r("RFC 9293: Transmission Control Protocol", "IETF", "https://www.rfc-editor.org/rfc/rfc9293", "The current TCP specification."),
  http: r("RFC 9110: HTTP semantics", "IETF", "https://www.rfc-editor.org/rfc/rfc9110", "Methods, status codes and headers as the standard defines them."),
  dhcp: r("RFC 2131: Dynamic Host Configuration Protocol", "IETF", "https://www.rfc-editor.org/rfc/rfc2131", "The messages a device and a server exchange to get an address."),
  mdnHttp: r("An overview of HTTP", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", "A readable tour of requests, responses and connections."),
  neetcode: r("The roadmap of patterns", "NeetCode", "https://neetcode.io/roadmap", "Problems grouped by pattern, in a sensible order."),
};

interface Topic {
  test: RegExp;
  watch: Source[];
  read: Source[];
}

/* Checked in order. A page takes sources from its first two matching topics. */
const TOPICS: Topic[] = [
  { test: /\b(sync|offline|workmanager|background|outbox|queue|upload|retry|retries)\b/, watch: [], read: [S.workManager, S.offlineFirst, S.wal, S.atomic, S.bgTasks, S.optimistic] },
  { test: /(react native|\brn\b|rn-|hermes|jsi|fabric|turbomodule|reanimated)/, watch: [], read: [S.rnArch, S.rnPerf] },
  { test: /\b(ai agents?|agents? loop|mcp|tool use|function call)/, watch: [S.introLlm], read: [S.agents, S.react, S.toolUse, S.fnCalling] },
  { test: /(\brag\b|retriev|embedding|vector|chunk)/, watch: [S.transformers], read: [S.ragPaper, S.contextual, S.lostMiddle] },
  { test: /(\beval|guardrail|judge)/, watch: [], read: [S.evals] },
  { test: /(fine-tun|lora|adapt)/, watch: [S.deepDive], read: [S.lora] },
  { test: /(model serving|llm serving|inference|kv cache|vllm|quantiz|speculative decoding)/, watch: [S.deepDive], read: [S.pagedAttention, S.vllm, S.caching] },
  { test: /(\bllms?\b|language model|transformer|tokeniz|self-attention|attention is all|prompt engineering|system prompt|context window)/, watch: [S.introLlm, S.tokenizer, S.transformers, S.attention, S.buildGpt], read: [S.attnPaper, S.chatTemplates] },
];

const PROTOCOL: [RegExp, Source][] = [
  [/tcp/, S.tcp],
  [/dhcp/, S.dhcp],
  [/http|rest|api/, S.http],
];

export function sourcesFor(href: string, text: string, domain?: string): { watch: Source[]; read: Source[] } {
  const hay = `${href} ${text}`.toLowerCase();
  // Mobile-systems pages only ever get mobile sources, so a word like "token" cannot pull in LLM talks.
  const mobile = domain === "mobile-systems" || href.startsWith("/series/") || href.startsWith("/mobile-coding");
  const watch: Source[] = [];
  const read: Source[] = [];
  const add = (into: Source[], list: Source[]) => list.forEach((s) => into.every((x) => x.url !== s.url) && into.push(s));

  if (href.startsWith("/protocols/")) {
    const hit = PROTOCOL.find(([re]) => re.test(href));
    add(read, [hit ? hit[1] : S.mdnHttp, S.mdnHttp]);
  } else if (href.startsWith("/coding/") || href.startsWith("/mobile-coding/")) {
    add(read, [S.neetcode]);
  }
  (mobile ? TOPICS.slice(0, 2) : TOPICS).filter((t) => t.test.test(hay))
    .slice(0, 2)
    .forEach((t) => {
      add(watch, t.watch);
      add(read, t.read);
    });
  if (mobile && !read.length) add(read, [S.offlineFirst, S.workManager, S.rnArch]);
  return { watch: watch.slice(0, 3), read: read.slice(0, 4) };
}
