/* Words and lists that belong to whole pages: titles, descriptions, group headings and step lists. Not logic. */

export const DEEP_GROUPS: [string, string, string][] = [
  ["mobile", "Mobile components · low-level design", "How the parts inside an offline-first app actually work, with production code."],
  ["ai", "AI handbook", "Internals, acceleration, retrieval, customisation, agents, integration and team adoption."],
];

/** How a 45-minute round is usually split; the timer uses the same shares. */
export const TIME_PLAN: [string, number, string][] = [
  ["Clarify", 0.1, "Ask questions, agree on scope and write down assumptions."],
  ["Estimate", 0.1, "Rough numbers for users, data and traffic, and what they imply."],
  ["High-level design", 0.25, "Components, data flow and the key API on the board."],
  ["Deep dive", 0.35, "The two or three hardest parts, with real mechanisms."],
  ["Trade-offs and wrap-up", 0.2, "Decisions, failure modes, and what you would do next."],
];

export const CRIT_TOPIC: Record<string, string> = {
  simple: "The product",
  clarify: "Requirements",
  estimate: "Scale",
  arch: "Architecture",
  flow: "The key flow",
  fe: "Front end",
  api: "Data and APIs",
  deep: "The hard parts",
  trade: "Trade-offs",
  fail: "Failures",
  follow: "Follow-ups",
  level: "Seniority",
};

export const REVISE_WHY: Record<string, string> = {
  Incident: "Panels use incidents to test whether you stop the damage first.",
  Probe: "Probes test the mechanism behind the term, not just the term.",
  Trap: "Traps catch answers that sound right but fail in production.",
};

export const PROTOCOL_LAYERS: [string, string][] = [
  ["Application", "What programs say to each other"],
  ["Transport", "Ports, reliability and flow"],
  ["Internet", "Addresses and routing"],
];

export const PROTOCOL_JOURNEY: [string, string, string][] = [
  ["dhcp", "Get an address", "The laptop joins Wi-Fi and leases 192.168.1.50."],
  ["dns", "Find the server", "example.com becomes 93.184.216.34."],
  ["tcp", "Open a connection", "Three packets agree sequence numbers."],
  ["tls", "Secure it", "Keys are agreed; the certificate is checked."],
  ["http", "Ask for the page", "GET / and a 200 OK come back."],
];

export const RN_PATH_TITLE = "React Native in one place: architecture, state, sync and performance";

export const RN_PATH_DESCRIPTION = "Every React Native page on the site in reading order: the New Architecture, state and render storms, modular codebases, memory leaks, offline queues, native boundaries and performance budgets, with tested code, slides and flashcards.";

export const AI_PATHS_PAGE_TITLE = "Crack AI interviews: hacks, rounds and a plan";

export const AI_PATHS_PAGE_DESCRIPTION = "Prepare for AI-enabled coding rounds and AI engineer interviews: tested AI interview hacks, every round explained, a study plan, critical basics to memorise, and a mock interviewer you can build.";

export const AI_BASICS_PAGE_TITLE = "Critical basics for AI interviews";

export const AI_BASICS_PAGE_DESCRIPTION = "The essentials of prompting, code review, debugging, LLMs, RAG, agents and evals. Read them, memorise the cards with spaced repetition, and practise with short drills.";
