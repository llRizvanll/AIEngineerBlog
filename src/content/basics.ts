/* The basics layer for detail pages: the concepts a reader needs before the
   question and the detailed answer make sense. Plain words, one idea each. */

type Concept = [term: string, meaning: string];
type QA = [question: string, answer: string];

/** Key concepts for each system design round, keyed by case id. */
export const CASE_CONCEPTS: Record<string, Concept[]> = {
  "offline-field": [
    ["Offline-first", "The phone's local database is the source of truth for the screen. The app reads and writes locally and syncs in the background, so having no signal is a normal state, not an error."],
    ["Outbox", "A table of pending local changes, written in the same transaction as the data. A sync job sends them in order when the network returns, so nothing the technician did is lost."],
    ["Idempotency key", "An id the device attaches to each change. If a send is retried after a lost response, the server recognises the id and applies the change only once."],
    ["Multipart, resumable upload", "Large files are split into parts that upload independently. A dropped connection costs only the part in flight, and the upload resumes from the last finished part."],
    ["Conflict resolution", "Two people can edit the same job while offline. Merging field by field, and flagging true clashes for review, is safer than letting the last write silently win."],
    ["Background limits", "Android and iOS stop apps that work in the background for too long. Sync has to be scheduled with the OS (WorkManager, BGTaskScheduler) and be safe to stop at any moment."],
  ],
  chat: [
    ["Persistent connection", "A WebSocket keeps one open channel between phone and server, so new messages arrive in milliseconds instead of waiting for the app to ask."],
    ["Server sequence numbers", "Each conversation gets increasing numbers assigned by the server. Clients sort by them and notice gaps, which tells them a message is missing and must be fetched."],
    ["Delivery states", "Sent means the server stored it, delivered means the recipient's device received it, read means it was shown. Each is a separate acknowledgement."],
    ["Client message id", "The sender creates an id before sending. Retries reuse it, so a reconnect never produces a duplicate bubble."],
    ["Fan-out", "Copying a message into every member's inbox when it is sent (fan-out on write), or looking it up when each member reads. Small groups favour fan-out on write."],
    ["Push notifications", "When the app is closed, the server wakes the device through APNs or FCM. The payload should be a hint to sync, not the message text, so content never leaks."],
  ],
  feed: [
    ["Fan-out on write vs read", "Either build each user's timeline when a post is created (fast reads, costly for very popular accounts) or assemble it when the user opens the app (cheap writes, slower reads). Most feeds mix both."],
    ["Cursor pagination", "The server returns a page plus an opaque cursor for the next one. Unlike page numbers, cursors do not skip or repeat posts when new ones arrive at the top."],
    ["Right-sized images on a CDN", "Serve each image at the size it is displayed, in a modern format, from a CDN close to the user. Oversized images being decoded cause most feed jank."],
    ["List virtualisation", "Only the rows on screen exist as views, and they are recycled as you scroll. RecyclerView, LazyColumn, UICollectionView and FlashList all work this way."],
    ["Frame budget", "At 60 fps each frame has about 16 ms. Decoding, layout and data work must stay off the main thread to fit inside it."],
    ["Cache, then refresh", "Show the last saved feed instantly from disk, then fetch new items and merge them without moving what the user is looking at."],
  ],
  payments: [
    ["Idempotency", "Every payment attempt carries a key. Repeating the request with the same key returns the original result instead of charging again."],
    ["Payment state machine", "An order moves through explicit states: created, authorising, authorised, captured, failed, refunded. Every transition is recorded, so you always know what happened."],
    ["Authorise, then capture", "Authorisation reserves money on the card; capture actually takes it. Keeping them separate lets you cancel cleanly if stock runs out."],
    ["Unknown outcomes", "Banks often confirm minutes later. 'Pending' is a real state, settled from provider webhooks or by polling, never by guessing."],
    ["Double-entry ledger", "Every money movement is written as balanced debit and credit entries, so totals always reconcile and mistakes are visible."],
    ["Tokenised cards", "Card numbers never touch your servers: the provider's SDK turns them into tokens, which keeps most of your system out of PCI compliance scope."],
  ],
  booking: [
    ["Contention", "Thousands of patients try to take the same slot at 9 a.m. Exactly one may win, even when requests arrive in the same millisecond."],
    ["Conditional writes", "Book with an update that only succeeds if the slot is still free, or a unique constraint on the slot id. The database picks the winner atomically."],
    ["Short holds", "While the patient enters details, the slot is held for a few minutes, then released automatically if they give up."],
    ["Time zones", "Store times in UTC together with the clinic's IANA time zone, and display them in the clinic's local time. Otherwise daylight-saving changes move appointments."],
    ["Read model for search", "Availability search reads a copy built for fast queries. It may be seconds behind; the final booking check always runs on the source of truth."],
    ["Health data", "Appointment details are sensitive: encrypt them, limit who can see them, log every access and keep them out of notification text."],
  ],
  release: [
    ["Trunk-based development", "Everyone merges small changes to one main branch every day. Long-lived branches are what make releases painful."],
    ["Feature flags", "Unfinished or risky work ships switched off and is turned on remotely, for chosen groups of users, without a new app release."],
    ["Release train", "The app ships on a fixed schedule, for example weekly. A feature that is not ready waits for the next train instead of delaying everyone."],
    ["Staged rollout", "A new version goes to 1%, then 10%, then everyone, while crash and business metrics are watched. Problems stop the rollout early."],
    ["Modular builds and caching", "Splitting the app into modules and caching build outputs means a change rebuilds only what depends on it."],
    ["Platform metrics", "Build time, CI wait, release frequency and crash-free sessions show whether the platform is actually helping teams."],
  ],
  "ai-assistant": [
    ["Large language model", "A model that predicts text. It is strong at language but knows nothing live about your services or users unless you give it that context."],
    ["Tool calling", "The model can ask for functions you define, such as search, book or cancel. Your server runs them, checks permissions and returns results; the model never acts on its own."],
    ["Grounding with retrieval", "Answers about your catalogue are built from documents retrieved for each question and placed in the prompt, so the model quotes facts instead of inventing them."],
    ["Streaming", "Tokens are sent to the app as they are generated, so the user sees the answer start in under a second."],
    ["Guardrails", "Checks before and after the model: block unsafe requests, require the user to confirm bookings and cancellations, and filter what is shown."],
    ["Prompt injection", "Text inside a document or message that tries to give the model new instructions. Everything the model reads is untrusted input."],
  ],
  "on-device": [
    ["On-device model", "A small model that runs on the phone's NPU or GPU. It is private, free per request and works offline, but it is less capable and varies by device."],
    ["Cloud model", "A large model on servers: the most capable and consistent, but every call costs money, needs a network and sends data off the device."],
    ["Quantisation", "Storing a model's weights with fewer bits, for example 4-bit, so it fits in phone memory and runs faster, for a small loss in quality."],
    ["Hybrid routing", "A router decides per request: on device when the phone can, cloud as the fallback, and a simple non-AI answer when both fail."],
    ["Model delivery", "Models are hundreds of megabytes, so they download after install, on Wi-Fi, and update separately from the app."],
    ["Device fragmentation", "Android phones differ hugely in chips and memory. Capability checks plus remote rules decide which devices get which path."],
  ],
  rag: [
    ["Embeddings", "A vector that represents the meaning of a text. Texts with similar meaning have nearby vectors, which is how semantic search finds them."],
    ["Chunking", "Long documents are split into passages of a few hundred tokens, so retrieval returns the relevant paragraph rather than a whole manual."],
    ["Hybrid search", "Keyword search (exact terms, product codes) and vector search (meaning) run together, and their results are merged."],
    ["Reranking", "A slower, more accurate model reorders the top candidates by reading the question and each passage together."],
    ["Citations", "The answer points to the passages it used, so users can check them and you can measure whether each claim is supported."],
    ["Permission filtering", "Every chunk carries the access rules of its source document. Retrieval filters by the user's permissions before anything reaches the model."],
  ],
  "llm-serving": [
    ["Prefill and decode", "Prefill reads the whole prompt at once and is limited by compute; decode generates one token at a time and is limited by memory bandwidth. They scale differently."],
    ["KV cache", "While generating, the model keeps attention keys and values for every token so far. Its size, not the weights, usually limits how many requests fit on a GPU."],
    ["Continuous batching", "Requests join and leave a running batch token by token, so the GPU stays busy instead of waiting for the slowest request."],
    ["Tensor parallelism", "A 70B model does not fit on one GPU, so each layer's matrices are split across several GPUs that work in lockstep."],
    ["Quantisation", "Running weights in FP8 or INT4 halves or quarters memory and speeds up decode, at a small, measurable quality cost."],
    ["Latency metrics", "Time to first token (how fast the answer starts) and tokens per second (how fast it streams) matter more than average request time."],
  ],
  "ai-evals": [
    ["Evaluation set", "A fixed collection of realistic inputs with the properties a good answer must have. Every prompt or model change is scored against it before release."],
    ["Scoring methods", "Exact checks (format, citations, banned words) are cheap and reliable; an LLM judge scores fuzzier qualities; people review samples to keep the judge honest."],
    ["Guardrails", "Runtime checks on input and output that catch personal data, unsafe topics or prompt injection, and block or rewrite before the user sees anything."],
    ["Release gate", "A change ships only if its eval scores stay at or above the baseline, like a test suite for prompts."],
    ["Online monitoring", "In production, track thumbs-down, escalations, refusals, cost and latency per feature, and sample conversations for review."],
    ["Shared platform", "One service for evals, guardrails and monitoring that every team plugs into, instead of each team building its own."],
  ],
};

/** Foundations for each mobile machine-coding problem, keyed by problem id. */
export const MOBILE_CONCEPTS: Record<string, Concept[]> = {
  "lru-cache": [
    ["Cache", "A fast store for results you will need again. Memory is the fastest place but it is small, so something must decide what to throw away."],
    ["LRU eviction", "Least recently used: when space runs out, drop the item nobody has touched for longest. A thumbnail viewed a moment ago is likely to be viewed again."],
    ["Hash map + doubly linked list", "The map finds an entry by key in O(1). The list keeps entries in recency order, and because each node knows both neighbours it can be moved or removed in O(1)."],
    ["A budget in bytes", "Limit total bytes, not item count: one 2 MB photo should weigh as much as a thousand 2 KB icons."],
  ],
  "image-loader": [
    ["Cache tiers", "Memory is fastest but lost when the app dies, disk survives restarts but is slower, and the network is slowest and can fail. Check them in that order and fill the faster tiers on the way back."],
    ["Request coalescing", "If fifty rows ask for the same URL at once, start one download and let all fifty wait for its result."],
    ["Coroutines and Deferred", "A coroutine is a lightweight task that can pause while it waits. async returns a Deferred: a handle to a future result that any number of callers can await."],
    ["Mutex", "A lock for coroutines. Only one coroutine at a time runs the code inside withLock; the others pause instead of blocking a thread."],
    ["Scopes and SupervisorJob", "Every coroutine belongs to a scope that can cancel it. With a SupervisorJob, one failed child does not cancel its siblings."],
  ],
  outbox: [
    ["Offline-first writes", "The app saves a change locally and returns at once. Sending it to the server happens later, in the background."],
    ["Outbox queue", "A durable, ordered list of changes waiting to be sent. It survives app kills because it lives in the database, not in memory."],
    ["Idempotency key", "A unique id per change. The server remembers the ids it has applied, so a retried send is answered with 'duplicate' instead of being applied twice."],
    ["Retryable vs permanent errors", "Timeouts and 5xx responses may succeed later; validation errors never will. Retrying the second kind only blocks the queue."],
  ],
  backoff: [
    ["Retry", "Trying a failed call again. It helps with temporary failures and hurts when every client does it at the same moment."],
    ["Exponential backoff", "Each retry waits twice as long as the previous one (0.5 s, 1 s, 2 s, 4 s…), up to a cap."],
    ["Jitter", "A random part of the wait, so a million clients spread their retries out instead of returning in the same second."],
    ["Retry-After", "A header the server sends with 429 or 503 saying exactly how long to wait. It overrides your own schedule."],
  ],
  "search-debounce": [
    ["Debounce", "Wait until the user pauses typing before acting. Typing 'kotlin' sends one request, not six."],
    ["Cancellation", "When the query changes, the work for the old query stops, so no network or CPU is spent on results nobody will see."],
    ["Stale responses", "Responses can arrive out of order. A slow answer for 'kot' must never replace the answer for 'kotlin'."],
    ["StateFlow and UI state", "A StateFlow holds the current screen state and notifies the UI when it changes. One immutable SearchUi object keeps results, spinner and error consistent."],
  ],
  "feed-pagination": [
    ["Pagination", "Loading a long list a page at a time instead of all at once."],
    ["Cursor vs offset", "An offset says 'skip 40 items'; a cursor says 'continue after this item'. When new posts arrive at the top, offsets skip or repeat items and cursors do not."],
    ["Prefetching", "Start loading the next page a few rows before the user reaches the end, so scrolling never stops at a spinner."],
    ["State machine", "The paginator is always in exactly one state: idle, loading, failed or end. Each action is allowed only in certain states, which prevents double loads."],
  ],
  "resumable-upload": [
    ["Multipart upload", "A big file is split into fixed-size parts that upload separately; the server joins them at the end."],
    ["ETag", "A fingerprint the server returns for each uploaded part. The final 'complete' call lists every part's ETag to prove they all arrived."],
    ["Checkpointing", "After each part, save which parts are done. After a crash, the app reads the checkpoint and uploads only what is missing."],
    ["Bounded concurrency", "Upload a few parts at once for throughput, but not all of them, which would exhaust memory and the connection."],
  ],
  "rate-limiter": [
    ["Rate limiting", "Capping how often something may happen, for example at most one refresh call per second."],
    ["Token bucket", "A bucket holds tokens; each call spends one; tokens refill at a steady rate up to a maximum. A full bucket allows a short burst."],
    ["Monotonic clock", "A clock that only moves forward and ignores changes to the device time. Elapsed-time maths must use it."],
    ["Wait or reject", "A limiter can make callers wait for a token or refuse them at once. User actions usually wait; background work can be dropped."],
  ],
  "list-diff": [
    ["Why diff at all", "Replacing the whole list makes it flash and loses the scroll position. Telling the list exactly what changed lets it animate only those rows."],
    ["Identity vs content", "The id says which item a row is; the fields say what it shows. The same id with new content is a reload, not a delete plus an insert."],
    ["Moves and the longest increasing subsequence", "Among items present in both lists, the largest group still in the same relative order can stay put. Everything else counts as moved."],
    ["Patience sorting", "A way to find that longest increasing subsequence in O(n log n), using a binary search over the smallest tail of each length."],
  ],
};

/** Why each coding pattern works, and the questions interviewers ask about it. */
export const PATTERN_BASICS: Record<string, { why: string; qa: QA[] }> = {
  "two-pointers": {
    why: "In a sorted array, the pair at lo and hi bounds every pair still possible. If their sum is too small, no pair using nums[lo] with anything at or left of hi can reach the target, so lo can move right; if it is too large, hi moves left. Each step rules out a whole row of pairs, so one pass is enough.",
    qa: [
      ["Why must the array be sorted?", "Sorting is what makes 'too small, so move lo' safe. Without order, moving a pointer could skip the answer. If you need the original indices and cannot sort, use a hash map instead."],
      ["Two pointers or a hash map for Two Sum?", "A hash map is O(n) time on unsorted input but uses O(n) memory. Two pointers need sorted input and O(1) extra space. Say which constraint drives your choice."],
      ["How do you avoid duplicate triplets in 3Sum?", "Sort first, skip an anchor equal to the previous anchor, and after recording a triplet move lo past values equal to the one just used."],
    ],
  },
  "sliding-window": {
    why: "A window from left to right holds the current candidate. Moving right adds one element and moving left removes one, so counts are updated in O(1) instead of recomputing every subarray. Each index enters and leaves the window at most once, which gives O(n).",
    qa: [
      ["When does a sliding window fail?", "When shrinking the window does not reliably move it towards valid, for example sums with negative numbers. Use prefix sums with a hash map there."],
      ["Fixed or variable window?", "Fixed size k: move both ends together. Variable: grow right, and shrink left while the window breaks the rule (for the longest) or while it still satisfies it (for the shortest)."],
      ["How do you know every required character is covered in O(1)?", "Keep a count of how many required characters are still missing, and update it only when a character's count crosses zero."],
    ],
  },
  "fast-slow": {
    why: "If a list loops, a pointer moving two steps gains one step per move on a pointer moving one step, so inside the loop it must land on it. Without a loop, the fast pointer simply reaches the end. Floyd's second phase works because the distance from the head to the cycle's start equals the distance from the meeting point to the start, going round the loop.",
    qa: [
      ["Why not store visited nodes in a set?", "That works in O(n) time but needs O(n) memory. Fast and slow pointers use O(1) memory, which is usually what the question is testing."],
      ["How do you find the middle of a list?", "Move slow one step and fast two. When fast reaches the end, slow is at the middle."],
      ["Why is Find the Duplicate a cycle problem?", "Treat index → value as a next pointer. Two indices point at the duplicate value, so that node has two incoming arrows: the entrance of a cycle."],
    ],
  },
  "binary-search": {
    why: "Binary search works whenever a yes/no question flips exactly once across a sorted range: false, false, …, true, true. Checking the middle tells you which half holds the first true, so every step halves the range and about log₂ n steps are enough. 'Binary search on the answer' applies the same idea to a range of possible answers instead of an array.",
    qa: [
      ["How do you avoid infinite loops?", "Pick one convention and keep it: with lo < hi, set hi = mid when mid works and lo = mid + 1 otherwise. The range then always shrinks."],
      ["How do you spot 'binary search on the answer'?", "The question asks for a minimum or maximum value, and checking 'does value x work?' is easier than computing the answer directly."],
      ["Why write mid as lo + (hi − lo) / 2?", "With fixed-size integers, lo + hi can overflow. TypeScript numbers are doubles, so it is safe there, but it is worth saying."],
    ],
  },
  "prefix-hash": {
    why: "The sum of nums[i..j] equals prefix[j] minus prefix[i − 1]. So 'some subarray ending here sums to k' becomes 'some earlier prefix equals prefix − k', which a hash map answers in O(1). Hashing in general turns 'have I seen this before?' from a scan into a lookup.",
    qa: [
      ["Why start the map with {0: 1}?", "It stands for the empty prefix, so subarrays that start at index 0 are counted too."],
      ["Why does this handle negative numbers when a sliding window cannot?", "It never shrinks a window; it only looks up exact prefix values, so the signs of the numbers do not matter."],
      ["What makes a good hash key?", "Something compared by value, such as a number or a string. In TypeScript, arrays are compared by reference, so join them into a string first."],
    ],
  },
  "monotonic-stack": {
    why: "The stack holds indices still waiting for an answer, with values decreasing from bottom to top. When a bigger value arrives, it is the first greater element for everything smaller on the stack, so those are popped and answered. Each index is pushed and popped once, so the scan is O(n).",
    qa: [
      ["Increasing or decreasing stack?", "For 'next greater', keep a decreasing stack; for 'next smaller', an increasing one. Ask what event resolves a waiting element."],
      ["Why store indices instead of values?", "An index gives you the value and the distance, which many answers need: days to wait, or the width of a rectangle."],
      ["Where else does this appear?", "Stock spans, the largest rectangle in a histogram, trapping rain water, and removing digits to make the smallest number."],
    ],
  },
  heap: {
    why: "A heap keeps the smallest (or largest) item at the top and restores its order in O(log n) after each push or pop. To keep the k largest of a stream, hold a min-heap of size k: its top is the weakest of the current top k, so it is the one to evict when something bigger arrives.",
    qa: [
      ["Why a min-heap for the k largest?", "You need instant access to the smallest of the k you are keeping, because that is the one to throw out. The total cost is O(n log k)."],
      ["Heap or sort?", "Sorting is O(n log n) and needs all the data up front. A size-k heap is O(n log k) and works on a stream."],
      ["How do you get a max-heap?", "Flip the comparator. Where only a min-heap is built in, push negated values."],
    ],
  },
  intervals: {
    why: "Once intervals are sorted by start, an interval can only overlap the last one in the merged list, so a single pass decides 'merge' or 'append'. For counting rooms, sorting by start and watching the earliest end time tells you whether a room has freed up.",
    qa: [
      ["Sort by start or by end?", "By start to merge or count overlaps; by end for greedy selection, such as keeping the most non-overlapping intervals."],
      ["Do touching intervals overlap?", "Ask. [1, 2] and [2, 3] may or may not clash depending on whether a meeting can start the minute another ends. State your assumption."],
      ["Is there another way to count rooms?", "A sweep line: +1 at every start, −1 at every end, processed in time order with ends before starts at equal times. The highest running total is the answer."],
    ],
  },
  graphs: {
    why: "BFS explores in layers: everything one step away, then two steps, and so on, so the first time it reaches a node is along a shortest path in an unweighted graph. DFS goes deep first and is the simpler choice for 'visit everything connected', such as counting islands.",
    qa: [
      ["BFS or DFS?", "BFS for the fewest steps in an unweighted graph; DFS for connectivity, components and cycle detection. Both are O(V + E)."],
      ["When do you mark a node as visited?", "When you add it to the queue, not when you take it out; otherwise the same node is queued many times."],
      ["What if the edges have weights?", "Use Dijkstra with a priority queue for non-negative weights, or 0-1 BFS with a deque when weights are only 0 or 1."],
    ],
  },
  "topo-sort": {
    why: "A node with no remaining prerequisites can safely go next. Kahn's algorithm keeps taking such nodes and removing their outgoing edges, which may free more nodes. Any node that never reaches zero prerequisites is stuck in, or behind, a cycle.",
    qa: [
      ["How do you detect a cycle?", "If the order has fewer nodes than the graph, the missing nodes are in a cycle or depend on one."],
      ["Kahn's algorithm or DFS?", "Kahn's gives cycle detection and a natural order for free; reversed DFS post-order also works and is handy when you are already doing DFS."],
      ["Is the order unique?", "Only if exactly one node is ready at every step. Otherwise many valid orders exist."],
    ],
  },
  "union-find": {
    why: "Each group is a tree whose root names the group. find walks up to the root; union hangs one root under the other. Path halving and union by size keep the trees almost flat, so each operation is close to O(1) in practice.",
    qa: [
      ["Union-find or BFS for connectivity?", "Union-find shines when edges arrive over time and you keep asking 'are these connected?'. BFS is simpler for one question on a fixed graph."],
      ["Why union by size?", "Hanging the smaller tree under the bigger one keeps the depth logarithmic, even without path compression."],
      ["Can it handle deleting edges?", "Not efficiently. If edges are removed, process the operations in reverse as additions, or use a different structure."],
    ],
  },
  backtracking: {
    why: "Backtracking builds a solution one choice at a time, explores everything that choice allows, then undoes it and tries the next choice. It is a depth-first walk of the decision tree; pruning cuts off branches that cannot lead to a valid answer.",
    qa: [
      ["Why copy the path before saving it?", "path is one array that keeps changing. Saving it directly stores a reference that ends up empty when the recursion unwinds."],
      ["How do you avoid duplicate combinations?", "Sort, pass a start index so each element is only chosen after earlier ones, and skip equal neighbours at the same depth."],
      ["What is the complexity?", "Exponential: 2ⁿ subsets, n! permutations. Say so, then explain how pruning helps in practice."],
    ],
  },
  "dynamic-programming": {
    why: "Dynamic programming applies when an answer is built from answers to smaller versions of the same question, and those smaller questions repeat. Define the state, write the recurrence, and compute each state once: top-down with a memo, or bottom-up with a table.",
    qa: [
      ["How do you find the state?", "Ask what you must know to decide the rest of the problem: usually an index, sometimes plus a remaining amount or a flag."],
      ["Top-down or bottom-up?", "Top-down mirrors the recurrence and computes only the states it needs; bottom-up avoids deep recursion and makes saving memory easy."],
      ["How do you reduce memory?", "If each row depends only on the previous row, keep two rows, or one row updated in the right direction."],
    ],
  },
  trie: {
    why: "A trie stores words character by character along shared paths, so all words with the same prefix share the same first nodes. Looking up a prefix costs its length, however many words are stored.",
    qa: [
      ["Trie or hash set?", "A hash set answers 'is this exact word present?'. A trie also answers prefix questions and can list the completions."],
      ["How much memory does it use?", "One node per distinct prefix. A Map per node stays compact for large alphabets; a 26-slot array per node is faster for lowercase letters."],
      ["How do you return the top suggestions quickly?", "Keep a small sorted list or counts at each node, or sort the words once and binary search, as the worked problem does."],
    ],
  },
  greedy: {
    why: "A greedy algorithm makes the locally best choice and never revisits it. That is only correct when you can argue that some optimal answer starts with that choice (an exchange argument), so always explain why the greedy step is safe.",
    qa: [
      ["How do you know greedy is correct?", "Show that you can swap the greedy choice into any optimal solution without making it worse. If you cannot argue that, consider dynamic programming."],
      ["Why does Gas Station restart after the tank goes negative?", "Any start between the old start and this point would arrive here with even less fuel, so none of them can work."],
      ["Greedy or DP for coin change?", "Greedy works for coin systems like 1, 5, 10, 25 but fails for [1, 3, 4] with amount 6. Dynamic programming is always correct."],
    ],
  },
};
