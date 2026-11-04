/* Mobile machine-coding (low-level design) problems.
   The code for each lives in src/content/mobile/<file>.swift and is compiled and
   tested by tests/mobile/main.swift (npm run test:swift). Line numbers below are
   0-based and refer to those files. */

export interface MobileStep {
  /** inclusive 0-based line range in the Swift file */
  lines: [number, number];
  title: string;
  note: string;
}

export interface MobileProblem {
  id: string;
  file: string;
  title: string;
  tagline: string;
  level: "Medium" | "Hard";
  minutes: number;
  color: [string, string];
  tags: string[];
  prompt: string;
  requirements: string[];
  clarify: [string, string][];
  design: [string, string][];
  /** lines shown in the reel, inclusive */
  core: [number, number];
  steps: MobileStep[];
  complexity: string;
  edgeCases: string[];
  followups: [string, string][];
  android: [string, string][];
  related: string[];
}

export const MOBILE_PROBLEMS: MobileProblem[] = [
  {
    id: "lru-cache",
    file: "LRUCache",
    title: "LRU cache with a memory budget",
    tagline: "O(1) get and set, evicting the least recently used item when bytes exceed a limit.",
    level: "Medium",
    minutes: 30,
    color: ["#6c47ff", "#0ea5e9"],
    tags: ["caching", "data structures", "memory"],
    prompt:
      "Our feed shows thousands of thumbnails. Build the in-memory cache: get and set in O(1), and when the total size passes a budget, evict whatever was used least recently.",
    requirements: ["get(key) and set(key, value, cost) in O(1)", "Total cost never exceeds the limit after a set", "Reading an item makes it most recently used", "Updating a key adjusts the total cost"],
    clarify: [
      ["Is the limit item count or bytes?", "Bytes. Images vary from 2 KB to 2 MB, so a count limit is meaningless."],
      ["Thread safety?", "Assume one owner. Callers can wrap it in an actor or a lock."],
      ["What about memory warnings?", "Expose removeAll so the app can purge on a memory warning."],
    ],
    design: [
      ["Hash map + doubly linked list", "The map finds a node in O(1); the list keeps recency order so moving or evicting is O(1)."],
      ["Head is newest, tail is oldest", "Every read moves a node to the head; eviction always takes the tail."],
      ["Weak back-pointers", "prev is weak, so removed nodes and the cache itself are freed with no retain cycles."],
      ["Cost, not count", "Each entry carries its own cost; eviction loops until the total fits."],
    ],
    core: [31, 71],
    steps: [
      { lines: [4, 16], title: "A node per entry", note: "Each node holds key, value and cost. prev is weak so the list never forms a retain cycle." },
      { lines: [18, 22], title: "Map plus list", note: "The dictionary gives O(1) lookup; head and tail mark the most and least recently used ends." },
      { lines: [31, 35], title: "Reads refresh recency", note: "A hit moves the node to the head, so popular thumbnails survive eviction." },
      { lines: [37, 50], title: "Writes insert or update", note: "Updating adjusts the running total by the cost difference; new nodes go to the head. Then evict." },
      { lines: [67, 71], title: "Evict from the tail", note: "While over budget, drop the least recently used node. One oversized item can evict many small ones." },
      { lines: [73, 94], title: "O(1) list surgery", note: "insertAtFront, unlink and moveToFront only touch neighbours, never walk the list." },
    ],
    complexity: "O(1) per get, set and remove; O(n) memory",
    edgeCases: ["Setting an item larger than the whole budget evicts everything, including itself", "Updating an existing key with a bigger cost", "Reading a missing key must not change order", "removeAll during a memory warning"],
    followups: [
      ["How do you make it thread-safe?", "Own it inside an actor (as ImageLoader does) or guard every call with a lock. Never share it across threads unprotected."],
      ["Why not NSCache?", "NSCache is thread-safe and auto-purges, but eviction order is undocumented and you cannot inspect it. A custom LRU gives predictable behaviour and testability."],
      ["How would you add a disk tier?", "Put a disk cache behind the memory cache: read memory, then disk, then network, and write back to both. See the image loader problem."],
    ],
    android: [
      ["Built-in", "android.util.LruCache with sizeOf() overridden to return bitmap.byteCount."],
      ["From scratch", "LinkedHashMap(capacity, 0.75f, accessOrder = true) and override removeEldestEntry for a count limit."],
      ["Memory warnings", "ComponentCallbacks2.onTrimMemory → evictAll() or trimToSize()."],
    ],
    related: ["image-loader", "list-diff"],
  },
  {
    id: "image-loader",
    file: "ImageLoader",
    title: "Image loader with coalescing and two cache tiers",
    tagline: "Memory, then disk, then network, and fifty identical requests become one download.",
    level: "Hard",
    minutes: 45,
    color: ["#0ea5e9", "#10b981"],
    tags: ["networking", "caching", "concurrency"],
    prompt:
      "Design and implement the image loader behind a scrolling feed. Many cells ask for the same URL at once; cells get reused while images load; the app must work from disk when offline.",
    requirements: ["Serve from memory, then disk, then network", "Concurrent requests for one URL share a single download", "Cancel work when a cell is reused", "Thread-safe for callers on any thread"],
    clarify: [
      ["Decode on the loader or the view?", "The loader returns bytes here; decode off the main thread before display (preparingForDisplay on iOS)."],
      ["How big is the disk cache?", "A few hundred MB with LRU eviction; out of scope for this round, injected as a protocol."],
      ["Do we need priorities?", "Nice to have: visible cells first. Mention it, implement if time allows."],
    ],
    design: [
      ["An actor owns the state", "The memory cache and the in-flight map are only touched inside the actor: no locks, no data races."],
      ["In-flight map of Tasks", "The first caller creates a Task; later callers await the same Task. That is request coalescing."],
      ["Tiers inside the Task", "Disk and network run in the Task, so joiners also benefit from a disk hit."],
      ["Protocols for I/O", "Fetcher and disk cache are protocols, so tests inject fakes and count network calls."],
    ],
    core: [25, 44],
    steps: [
      { lines: [13, 17], title: "State behind an actor", note: "Memory cache and inFlight dictionary are actor-isolated, so concurrent callers can never corrupt them." },
      { lines: [26, 26], title: "1. Memory hit", note: "Cheapest path first: return the cached bytes and refresh their recency." },
      { lines: [27, 29], title: "2. Join a running request", note: "If this URL is already downloading, await the same Task. Fifty cells, one download." },
      { lines: [31, 37], title: "3–4. Disk, then network", note: "The Task checks disk, fetches if needed and writes back to disk for offline use." },
      { lines: [38, 39], title: "Register, then always clean up", note: "Store the Task before awaiting; defer removes it whether the load succeeds or throws." },
      { lines: [41, 43], title: "Populate memory", note: "Cache with cost = byte count, so the LRU budget is measured in bytes." },
      { lines: [47, 50], title: "Cancel on cell reuse", note: "When a cell scrolls away and nobody else needs the URL, cancel the download." },
    ],
    complexity: "O(1) actor work per request; one network call per unique URL",
    edgeCases: ["A request fails: every joiner receives the same error and the URL can be retried", "Cancelling a URL another visible cell still needs (track a reference count before cancelling)", "Memory warning: clearMemory, keep disk", "Very large images: downsample before caching"],
    followups: [
      ["How would you add priorities?", "Keep a queue of pending URLs with priority; visible cells bump priority, off-screen ones lower it; limit concurrent downloads."],
      ["Where does decoding happen?", "Off the main actor. Decode and downsample to the display size, then cache the decoded image in memory and the bytes on disk."],
      ["How do you test it?", "Inject a counting fake fetcher, fire 20 concurrent loads and assert one network call. That test ships with this code."],
    ],
    android: [
      ["In production", "Coil or Glide: memory LruCache + disk cache + request coalescing out of the box."],
      ["From scratch", "A Mutex-guarded map of URL → Deferred<ByteArray>; callers await() the same Deferred."],
      ["Cancellation", "Tie the request to the view's lifecycle scope so it cancels when the view is recycled."],
    ],
    related: ["lru-cache", "backoff"],
  },
  {
    id: "outbox",
    file: "Outbox",
    title: "Offline outbox with idempotent sync",
    tagline: "Writes persist first, sync later, survive kills, and are never applied twice.",
    level: "Hard",
    minutes: 45,
    color: ["#8b5cf6", "#ec4899"],
    tags: ["offline-first", "sync", "reliability"],
    prompt:
      "Field technicians edit jobs with no signal. Implement the client side of the outbox: changes must never be lost, must reach the server in order, and must not be applied twice when we retry.",
    requirements: ["Enqueue persists before returning", "Drain in order; stop when offline", "Retry with backoff, honouring server hints", "Park permanently failing ops for the user", "Only one drain at a time"],
    clarify: [
      ["Does the server support idempotency keys?", "Yes: it stores processed op ids and returns 'duplicate' for repeats."],
      ["What if one op is permanently invalid?", "Park it so the queue keeps moving, and show it to the user."],
      ["Who triggers drain?", "WorkManager / BGTaskScheduler jobs, app launch and connectivity changes."],
    ],
    design: [
      ["Op id = idempotency key", "Generated on the device before the first send, so a retry after a lost response is harmless."],
      ["Persist on every transition", "Enqueue, success and retry all save, so a kill at any line loses nothing."],
      ["Typed results", "applied / duplicate / retryable / rejected make the policy explicit and testable."],
      ["Single flight", "A flag stops two drains interleaving and double-sending."],
    ],
    core: [60, 93],
    steps: [
      { lines: [4, 9], title: "The op carries its own key", note: "UUID created on the device. The server dedupes by it, so retries are safe." },
      { lines: [11, 16], title: "Every server answer has a policy", note: "Duplicate counts as success; 429/5xx is retryable; 4xx validation is rejected for good." },
      { lines: [54, 58], title: "Persist before returning", note: "The UI gets control back only after the intent is on disk." },
      { lines: [60, 64], title: "Single flight", note: "A second trigger while draining returns immediately instead of sending twice." },
      { lines: [66, 72], title: "Push in order; offline stops", note: "A thrown error means no network: keep everything and wait for the next trigger." },
      { lines: [74, 78], title: "Success or permanent failure", note: "Remove applied and duplicate ops; park rejected ones so the queue keeps moving." },
      { lines: [79, 88], title: "Retry with backoff", note: "Count attempts, persist them, and return the server's Retry-After or a jittered backoff. Too many attempts → park." },
      { lines: [90, 90], title: "Checkpoint after each op", note: "A kill now replays at most one op, and the server ignores the duplicate." },
    ],
    complexity: "O(1) per op plus one store write; the queue is FIFO",
    edgeCases: ["Killed between the server applying an op and us saving: the retry returns 'duplicate'", "An op that fails validation forever", "Two triggers arrive at once", "The queue grows large offline: batch pushes and compact edits to the same record"],
    followups: [
      ["How would you batch?", "Send up to N ops per request; the server returns a result per op id and the client applies the same policy to each."],
      ["What about ordering across entities?", "One queue keeps global order. If entities are independent you can run one queue per entity type for parallelism."],
      ["How does the UI show pending state?", "Each local row has a sync status column updated in the same transaction as the outbox."],
    ],
    android: [
      ["Storage", "A Room table for the outbox, written in the same transaction as the entity change."],
      ["Scheduling", "A unique WorkManager job with a network constraint and exponential backoff policy."],
      ["Concurrency", "A Mutex around drain(), or rely on WorkManager's unique work to keep it single-flight."],
    ],
    related: ["backoff", "resumable-upload"],
  },
  {
    id: "backoff",
    file: "Backoff",
    title: "Retry with exponential backoff and jitter",
    tagline: "Retries that recover calmly instead of stampeding a struggling server.",
    level: "Medium",
    minutes: 25,
    color: ["#f43f5e", "#f59e0b"],
    tags: ["networking", "reliability"],
    prompt:
      "After an outage, five million phones reconnect at once and knock the API over again. Write the client retry helper so recovery is calm.",
    requirements: ["Exponential growth with a cap", "Full jitter to spread clients out", "Honour Retry-After from 429 / 503", "Stop on non-retryable errors or cancellation", "Testable without real sleeping"],
    clarify: [
      ["Which errors are retryable?", "Timeouts, connection loss, 429 and 5xx. Not 4xx validation errors."],
      ["Do we have a server hint?", "Yes, Retry-After on 429 and 503. It wins over our own schedule."],
      ["What is the cap?", "60 seconds per wait, 5 attempts for user-facing calls."],
    ],
    design: [
      ["Full jitter", "Wait a random time between zero and the exponential ceiling; it beats equal or decorrelated jitter for spreading load."],
      ["Shift with a clamp", "1 << min(attempt, 16) avoids overflow on huge attempt counts."],
      ["Inject randomness and sleep", "Tests pass a fixed random function and a recording sleep: no flaky timing."],
    ],
    core: [5, 40],
    steps: [
      { lines: [11, 12], title: "Exponential, capped", note: "base · 2^attempt, clamped so the shift can never overflow, then capped at 60 seconds." },
      { lines: [13, 13], title: "Full jitter", note: "A random wait in [0, ceiling]: clients spread out instead of returning in lockstep." },
      { lines: [18, 20], title: "Server hints", note: "Errors that know the server's Retry-After expose it through a protocol." },
      { lines: [30, 32], title: "Try the operation", note: "Return on the first success." },
      { lines: [34, 35], title: "Give up when it is pointless", note: "Stop after maxAttempts, on non-retryable errors, or when the task was cancelled." },
      { lines: [36, 37], title: "Wait the right amount", note: "Use Retry-After if the server sent one, otherwise the jittered backoff." },
    ],
    complexity: "O(attempts) calls; waits grow to the cap",
    edgeCases: ["attempt = 0 or negative", "Huge attempt counts (overflow)", "Cancellation during sleep", "Retry-After larger than the cap (respect the server)"],
    followups: [
      ["Why not a fixed delay?", "Every client retries at the same moment, recreating the spike that caused the outage."],
      ["What else protects the server?", "A circuit breaker that stops calls for a while after repeated failures, and a client-side rate limiter."],
      ["Retry POSTs?", "Only with an idempotency key, otherwise a lost response leads to duplicate writes."],
    ],
    android: [
      ["WorkManager", "setBackoffCriteria(BackoffPolicy.EXPONENTIAL, …) for background jobs."],
      ["Coroutines", "A retry loop with delay(); OkHttp interceptors can read Retry-After."],
    ],
    related: ["outbox", "rate-limiter"],
  },
  {
    id: "search-debounce",
    file: "SearchViewModel",
    title: "Search-as-you-type with debounce and cancellation",
    tagline: "One request per pause in typing, and never a stale result on screen.",
    level: "Medium",
    minutes: 30,
    color: ["#14b8a6", "#6366f1"],
    tags: ["UI state", "concurrency", "networking"],
    prompt:
      "Build the view model for a search box that queries the server as the user types. Do not hit the API on every keystroke, and never show results for an old query.",
    requirements: ["Debounce keystrokes", "Cancel in-flight work when the query changes", "Ignore queries shorter than two characters", "Expose loading and error state for the UI"],
    clarify: [
      ["How long a debounce?", "About 300 ms: long enough to skip mid-word requests, short enough to feel instant."],
      ["Cache results?", "A small in-memory cache keyed by query is a good follow-up."],
      ["Main thread?", "The view model is @MainActor; the network call runs off it."],
    ],
    design: [
      ["Cancel the previous Task", "Each keystroke cancels the last Task. Task.sleep throws on cancellation, which is the debounce."],
      ["Check cancellation after the await", "The response can arrive after the user typed again; checkCancellation drops it."],
      ["Weak self", "The Task does not keep a dismissed screen alive."],
    ],
    core: [25, 50],
    steps: [
      { lines: [26, 26], title: "Latest keystroke wins", note: "Cancel whatever the previous keystroke started." },
      { lines: [27, 32], title: "Ignore tiny queries", note: "Under two characters: clear results and stop. No request." },
      { lines: [36, 36], title: "The debounce", note: "Sleep throws CancellationError if another keystroke arrives first, so only pauses trigger a search." },
      { lines: [37, 38], title: "Search off the main actor", note: "The injected search function runs the network call; the UI shows a spinner." },
      { lines: [39, 42], title: "Drop stale responses", note: "If the query changed while we waited, checkCancellation throws and nothing is shown." },
      { lines: [43, 48], title: "Cancellation is not an error", note: "A cancelled task leaves the UI to the newer task; real errors show a message." },
    ],
    complexity: "At most one request per debounce window",
    edgeCases: ["Typing, deleting back to one character", "Network error, then typing again", "Screen dismissed mid-request", "Identical consecutive queries (skip if unchanged)"],
    followups: [
      ["How would you test timing?", "Inject a short debounce and a recording search function; type four keystrokes quickly and assert one call. That test ships with this code."],
      ["What about Combine?", "debounce + removeDuplicates + switchToLatest on the text publisher gives the same behaviour."],
    ],
    android: [
      ["Flow", "queryFlow.debounce(300).filter { it.length >= 2 }.distinctUntilChanged().mapLatest { api.search(it) }"],
      ["Scope", "Collect in viewModelScope so it cancels with the screen."],
    ],
    related: ["feed-pagination", "rate-limiter"],
  },
  {
    id: "feed-pagination",
    file: "FeedPaginator",
    title: "Cursor-based infinite feed",
    tagline: "Prefetch before the bottom, one request at a time, no duplicates, no stale pages.",
    level: "Medium",
    minutes: 35,
    color: ["#f97316", "#ec4899"],
    tags: ["pagination", "UI state", "networking"],
    prompt:
      "Implement the paging logic for a social feed. Users scroll fast, new posts arrive at the top while they read, and pull-to-refresh can happen mid-load.",
    requirements: ["Load the next page by cursor", "Never two loads at once", "Prefetch a few rows before the end", "Drop duplicate items", "Ignore responses that arrive after a refresh"],
    clarify: [
      ["Offset or cursor?", "Cursor. Offsets skip or repeat items when new posts are inserted."],
      ["Page size?", "Server decides; around 20."],
      ["Where are items stored?", "In memory here; in the offline app they go to the local DB and the UI observes it."],
    ],
    design: [
      ["Explicit state machine", "idle, loading, failed, end: easy to render and easy to test."],
      ["Seen-ID set", "Items that shift across page boundaries are filtered out in O(1)."],
      ["Generation counter", "Refresh bumps it; responses from an older generation are ignored."],
    ],
    core: [30, 64],
    steps: [
      { lines: [11, 16], title: "State the UI can render", note: "Spinner, error with retry, or end-of-feed come straight from this enum." },
      { lines: [31, 34], title: "Single flight", note: "Loading or at the end? Do nothing. Failed or idle? Go." },
      { lines: [36, 40], title: "Remember the generation", note: "If a refresh happens while we wait, this response belongs to the old feed and is dropped." },
      { lines: [41, 44], title: "De-duplicate and advance", note: "Insert ids into the seen set; append only new ones; a nil cursor means the end." },
      { lines: [51, 58], title: "Refresh starts over", note: "Bump the generation, clear state, load page one." },
      { lines: [61, 64], title: "Prefetch near the bottom", note: "Rows report onAppear; within five of the end, load the next page before the user gets there." },
    ],
    complexity: "O(page size) per load; O(1) duplicate checks",
    edgeCases: ["Server returns an empty page with a cursor", "Pull-to-refresh during a load", "Same post appears on two pages", "Error, then retry from the same cursor"],
    followups: [
      ["How do you keep scroll position after refresh?", "Insert new items above and adjust the content offset, or show a 'new posts' pill instead of jumping."],
      ["How would this work offline-first?", "Pages are written to SQLite and the list observes the DB; the paginator only drives fetching."],
    ],
    android: [
      ["Paging 3", "PagingSource with a cursor key and RemoteMediator for the DB-backed version."],
      ["Compose", "LazyColumn + collectAsLazyPagingItems(); prefetchDistance in PagingConfig."],
    ],
    related: ["list-diff", "search-debounce"],
  },
  {
    id: "resumable-upload",
    file: "ResumableUploader",
    title: "Resumable multipart uploader",
    tagline: "Upload a 4 GB video in parts, a few at a time, and resume after a kill.",
    level: "Hard",
    minutes: 45,
    color: ["#10b981", "#0ea5e9"],
    tags: ["uploads", "concurrency", "offline-first"],
    prompt:
      "Users upload long inspection videos on weak networks and the OS can kill the app at any time. Implement the uploader: parallel parts, limited concurrency, and resume without re-sending finished parts.",
    requirements: ["Split into fixed-size parts", "At most N parts in flight", "Checkpoint each finished part", "Resume uploads only missing parts", "A failure loses only in-flight parts"],
    clarify: [
      ["Which storage API?", "S3-style multipart: presigned URL per part, the server returns an ETag per part."],
      ["Part size?", "8 MB: big enough for throughput, small enough to lose little on a kill."],
      ["Background?", "On iOS, run each part as a background URLSession upload task from a file; here the transport is a protocol."],
    ],
    design: [
      ["The plan is the state", "UploadPlan records completed parts and ETags; persist it and you can resume anywhere."],
      ["Sliding window with a task group", "Start N parts; each completion checkpoints and starts the next."],
      ["Fail fast, resume cheaply", "A failing part cancels the group; the saved plan means the retry skips everything already done."],
    ],
    core: [34, 58],
    steps: [
      { lines: [4, 16], title: "A plan you can persist", note: "Part count, remaining parts and byte ranges are all derived from size, part size and completed ETags." },
      { lines: [36, 37], title: "Only what is missing", note: "Iterate over remaining parts: on resume, finished parts are skipped automatically." },
      { lines: [39, 42], title: "One part, one request", note: "Slice the bytes for this part and upload them; returns the ETag." },
      { lines: [45, 48], title: "Fill the window", note: "Start up to maxConcurrent parts." },
      { lines: [49, 55], title: "Finish one, start one", note: "Record the ETag, checkpoint the plan, then start the next part. In-flight never exceeds the limit." },
    ],
    complexity: "O(parts) requests; at most N concurrent; one checkpoint per part",
    edgeCases: ["Last part is smaller than partSize", "File changed between attempts (verify size and hash)", "Presigned URLs expire on a long resume", "Zero-byte file"],
    followups: [
      ["How does the server assemble it?", "A complete-multipart call with the ordered ETags; verify a SHA-256 of the whole file."],
      ["Adaptive concurrency?", "Measure throughput per part; grow N on fast Wi-Fi, shrink on cellular."],
      ["How do you dedupe uploads?", "Hash the file first; if the server already has it, skip the upload entirely."],
    ],
    android: [
      ["Background", "A user-initiated data transfer job (Android 14+) or a foreground WorkManager worker."],
      ["Concurrency", "Semaphore(n) + async/awaitAll over parts in a coroutineScope."],
      ["Checkpoint", "Store part ETags in Room after each part."],
    ],
    related: ["outbox", "backoff"],
  },
  {
    id: "rate-limiter",
    file: "RateLimiter",
    title: "Client-side token bucket rate limiter",
    tagline: "Allow bursts, then a steady rate, so your app cannot DDoS your own API.",
    level: "Medium",
    minutes: 25,
    color: ["#eab308", "#ef4444"],
    tags: ["networking", "reliability"],
    prompt:
      "A bug made the app call /refresh in a tight loop on a million devices. Add a client-side limiter: allow small bursts, then at most one call per second, and make callers wait instead of failing.",
    requirements: ["Burst up to a capacity", "Steady refill rate", "Know how long to wait", "Shared safely across callers", "Testable with a fake clock"],
    clarify: [
      ["Per endpoint or global?", "Per endpoint group; create one limiter each."],
      ["Wait or fail?", "User-initiated calls wait; background calls can drop."],
    ],
    design: [
      ["Lazy refill", "No timers: compute tokens from elapsed time whenever someone asks."],
      ["Monotonic clock", "ContinuousClock is unaffected by the user changing the device time."],
      ["Value type + actor", "The bucket is a pure struct (easy to test); the actor shares one bucket safely."],
    ],
    core: [4, 51],
    steps: [
      { lines: [7, 14], title: "Start full", note: "Tokens start at capacity, which allows an initial burst." },
      { lines: [17, 22], title: "Consume if available", note: "Refill first, then take tokens or refuse." },
      { lines: [25, 29], title: "How long to wait", note: "Missing tokens divided by the refill rate." },
      { lines: [31, 35], title: "Lazy refill", note: "Add elapsed × rate, capped at capacity. A monotonic clock avoids time-change bugs." },
      { lines: [46, 50], title: "Callers wait their turn", note: "The actor sleeps exactly as long as needed, then tries again." },
    ],
    complexity: "O(1) per call, no background timers",
    edgeCases: ["Cost bigger than capacity never succeeds (validate)", "Clock going backwards (clamped to zero)", "Many waiters wake together (they retry and most sleep again)"],
    followups: [
      ["Leaky bucket vs token bucket?", "Leaky bucket smooths output to a constant rate; token bucket allows bursts, which suits user actions."],
      ["Server-side too?", "Always. The client limiter protects against your own bugs; the server enforces the contract."],
    ],
    android: [
      ["Kotlin", "The same bucket as a data class; share it via a Mutex-protected object."],
      ["Guava", "RateLimiter.create(permitsPerSecond) on the JVM."],
    ],
    related: ["backoff", "search-debounce"],
  },
  {
    id: "list-diff",
    file: "ListDiff",
    title: "List diffing for animated UI updates",
    tagline: "Turn old and new arrays into deletes, inserts, moves and reloads, in O(n log n).",
    level: "Hard",
    minutes: 40,
    color: ["#a855f7", "#f43f5e"],
    tags: ["algorithms", "UI", "performance"],
    prompt:
      "When the feed refreshes, we reload the whole list and the UI flashes. Compute the minimal batch update between the old and new arrays so the list can animate.",
    requirements: ["Match items by identity", "Report deletions by old index and insertions by new index", "Report moves, but as few as possible", "Report content changes as reloads"],
    clarify: [
      ["Are ids unique?", "Yes, within one list."],
      ["Do moves matter?", "Yes: moving every row looks broken. Keep the most rows still."],
    ],
    design: [
      ["Identity map", "Old id → index makes every lookup O(1)."],
      ["LIS keeps rows still", "Among surviving items, the longest increasing run of old indices is the largest set that keeps order; everything else moved."],
      ["Patience sorting", "LIS in O(n log n) with a predecessor array to rebuild the sequence."],
    ],
    core: [17, 63],
    steps: [
      { lines: [19, 23], title: "Index the old list", note: "Map old ids to positions; anything whose id is not in the new list is a delete." },
      { lines: [26, 34], title: "Walk the new list", note: "Unknown ids are inserts; known ids are survivors, and changed content means a reload." },
      { lines: [36, 39], title: "Moves are what LIS leaves out", note: "Survivors on the longest increasing run of old indices stay; the rest are moves." },
      { lines: [45, 55], title: "Patience sorting", note: "Binary search the first tail ≥ value; track predecessors to rebuild the sequence." },
      { lines: [56, 62], title: "Rebuild the sequence", note: "Follow predecessors back from the last tail, then reverse." },
    ],
    complexity: "O(n log n) time, O(n) space",
    edgeCases: ["Identical lists produce an empty diff", "Everything replaced", "Pure reorder", "Duplicate ids (reject or dedupe first)"],
    followups: [
      ["Why not Myers' diff?", "Myers minimises edits for sequences without identity; with stable ids, the map plus LIS is simpler and faster."],
      ["What does the platform give you?", "Diffable data sources on iOS and DiffUtil / ListAdapter on Android do this for you; this is how they work underneath."],
    ],
    android: [
      ["DiffUtil", "Implement areItemsTheSame by id and areContentsTheSame by equality; ListAdapter runs it off the main thread."],
      ["Compose", "LazyColumn with stable keys animates moves via Modifier.animateItem()."],
    ],
    related: ["feed-pagination", "lru-cache"],
  },
];
