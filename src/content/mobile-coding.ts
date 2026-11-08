/* Mobile machine-coding (low-level design) problems.
   The code for each lives in src/content/mobile/<file>.kt and is compiled and
   tested by tests/mobile/MobileTests.kt (npm run test:mobile). Line numbers below
   are 0-based and refer to those files. */

export interface MobileStep {
  /** inclusive 0-based line range in the Kotlin file */
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
  /** how the same design maps onto iOS */
  ios: [string, string][];
  related: string[];
}

export const MOBILE_PROBLEMS: MobileProblem[] = [
  {
    id: "lru-cache",
    file: "LruCache",
    title: "LRU cache with a memory budget",
    tagline: "O(1) get and put, evicting the least recently used item when bytes exceed a limit.",
    level: "Medium",
    minutes: 30,
    color: ["#ff5a1f", "#0ea5e9"],
    tags: ["caching", "data structures", "memory"],
    prompt:
      "Our feed shows thousands of thumbnails. Build the in-memory cache: get and put in O(1), and when the total size passes a budget, evict whatever was used least recently.",
    requirements: ["get(key) and put(key, value, cost) in O(1)", "Total cost never exceeds the limit after a put", "Reading an item makes it most recently used", "Updating a key adjusts the total cost"],
    clarify: [
      ["Is the limit item count or bytes?", "Bytes. Images vary from 2 KB to 2 MB, so a count limit is meaningless."],
      ["Thread safety?", "Assume one owner. Callers confine it to one coroutine or wrap it in a Mutex."],
      ["What about memory pressure?", "Expose clear() so the app can purge it from onTrimMemory."],
    ],
    design: [
      ["Hash map + doubly linked list", "The map finds a node in O(1); the list keeps recency order so moving or evicting is O(1)."],
      ["Head is newest, tail is oldest", "Every read moves a node to the head; eviction always takes the tail."],
      ["Plain prev and next pointers", "The JVM's garbage collector frees cycles, so unlink only has to null the pointers. No weak references needed."],
      ["Cost, not count", "Each entry carries its own cost; eviction loops until the total fits."],
    ],
    core: [22, 61],
    steps: [
      { lines: [6, 9], title: "A node per entry", note: "Each node holds key, value and cost, plus pointers to its neighbours in recency order." },
      { lines: [11, 15], title: "Map plus list", note: "The HashMap gives O(1) lookup; head and tail mark the most and least recently used ends. totalCost is read-only outside." },
      { lines: [22, 26], title: "Reads refresh recency", note: "operator get lets callers write cache[key]. A hit moves the node to the head, so popular thumbnails survive eviction." },
      { lines: [28, 42], title: "Writes insert or update", note: "Updating adjusts the running total by the cost difference; new nodes go to the head. Then evict." },
      { lines: [57, 61], title: "Evict from the tail", note: "While over budget, drop the least recently used node. One oversized item can evict many small ones, including itself." },
      { lines: [63, 84], title: "O(1) list surgery", note: "insertAtFront, unlink and moveToFront only touch neighbours, never walk the list." },
    ],
    complexity: "O(1) per get, put and remove; O(n) memory",
    edgeCases: ["Putting an item larger than the whole budget evicts everything, including itself", "Updating an existing key with a bigger cost", "Reading a missing key must not change order", "clear() during onTrimMemory"],
    followups: [
      ["How do you make it thread-safe?", "Own it behind a Mutex (as ImageLoader does) or confine it to one dispatcher. Never share it across threads unprotected."],
      ["Why not android.util.LruCache?", "Use it in production: override sizeOf() to return bitmap.byteCount. Writing it yourself shows you know the map + list structure underneath, which is what the round tests."],
      ["How would you add a disk tier?", "Put a disk cache behind the memory cache: read memory, then disk, then network, and write back to both. See the image loader problem."],
    ],
    ios: [
      ["Built-in", "NSCache with totalCostLimit; thread-safe and purges on memory warnings, but the eviction order is undocumented."],
      ["From scratch", "The same map + doubly linked list in Swift, with a weak prev pointer to avoid retain cycles under ARC."],
      ["Memory warnings", "UIApplication.didReceiveMemoryWarningNotification → removeAll()."],
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
      "Design and implement the image loader behind a scrolling feed. Many rows ask for the same URL at once; rows get recycled while images load; the app must work from disk when offline.",
    requirements: ["Serve from memory, then disk, then network", "Concurrent requests for one URL share a single download", "Cancel work when a row is recycled", "Safe to call from any coroutine"],
    clarify: [
      ["Decode in the loader or the view?", "The loader returns bytes here; decode and downsample off the main thread (Dispatchers.Default) before display."],
      ["How big is the disk cache?", "A few hundred MB with LRU eviction; out of scope for this round, injected as an interface."],
      ["Do we need priorities?", "Nice to have: visible rows first. Mention it, implement if time allows."],
    ],
    design: [
      ["A Mutex owns the state", "The memory cache and the in-flight map are only touched while holding the lock: no data races."],
      ["In-flight map of Deferreds", "The first caller starts an async download; later callers await the same Deferred. That is request coalescing."],
      ["Downloads live in the app scope", "The Deferred runs in an injected scope with a SupervisorJob, so one caller leaving does not cancel it for the others, and one failure does not cancel the scope."],
      ["Interfaces for I/O", "Fetcher and disk cache are interfaces, so tests inject fakes and count network calls."],
    ],
    core: [33, 46],
    steps: [
      { lines: [27, 29], title: "State behind a Mutex", note: "The memory cache and the in-flight map are only read or written inside lock.withLock." },
      { lines: [33, 33], title: "1. Memory hit", note: "Cheapest path first: return the cached bytes and refresh their recency. return exits load() straight from the inline lambda." },
      { lines: [34, 34], title: "2. Join a running download", note: "If this URL is already downloading, reuse its Deferred. Fifty rows, one download." },
      { lines: [35, 36], title: "3–4. Disk, then network", note: "The async block checks disk, fetches if needed and writes back to disk for offline use." },
      { lines: [37, 37], title: "Register before awaiting", note: "Store the Deferred while still holding the lock, so the next caller finds it." },
      { lines: [40, 42], title: "Await outside the lock, then cache", note: "Never suspend on the network while holding the lock. Cache with cost = byte count, so the LRU budget is in bytes." },
      { lines: [44, 46], title: "Always clean up", note: "finally removes the entry even if this caller was cancelled. NonCancellable lets the cleanup take the lock; the identity check avoids removing a newer download." },
      { lines: [51, 53], title: "Cancel on recycle", note: "When a row scrolls away and nobody else needs the URL, cancel the download." },
    ],
    complexity: "O(1) locked work per request; one network call per unique URL",
    edgeCases: ["A download fails: every joiner gets the same exception and the URL can be retried", "Cancelling a URL another visible row still needs (keep a reference count before cancelling)", "onTrimMemory: clearMemory(), keep disk", "Very large images: downsample before caching"],
    followups: [
      ["How would you add priorities?", "Keep a queue of pending URLs with priority; visible rows bump priority, off-screen ones lower it; limit concurrent downloads with a Semaphore."],
      ["Why a scope parameter instead of coroutineScope?", "A download started by one row must survive that row being recycled while another row waits on it. Structured concurrency inside load() would tie it to the first caller."],
      ["How do you test it?", "Inject a counting fake fetcher, fire 20 concurrent loads and assert one network call. That test ships with this code."],
    ],
    ios: [
      ["In production", "Kingfisher or Nuke: memory and disk caches plus request coalescing out of the box."],
      ["From scratch", "An actor holding [URL: Task<Data, Error>]; callers await the same Task's value."],
      ["Cancellation", "Cancel in prepareForReuse(), or tie the Task to the SwiftUI view with .task(id:)."],
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
    color: ["#8b5cf6", "#c2410c"],
    tags: ["offline-first", "sync", "reliability"],
    prompt:
      "Field technicians edit jobs with no signal. Implement the client side of the outbox: changes must never be lost, must reach the server in order, and must not be applied twice when we retry.",
    requirements: ["Enqueue persists before returning", "Drain in order; stop when offline", "Retry with backoff, honouring server hints", "Park permanently failing ops for the user", "Only one drain at a time"],
    clarify: [
      ["Does the server support idempotency keys?", "Yes: it stores processed op ids and returns 'duplicate' for repeats."],
      ["What if one op is permanently invalid?", "Park it so the queue keeps moving, and show it to the user."],
      ["Who triggers drain?", "A unique WorkManager job, app start and connectivity changes."],
    ],
    design: [
      ["Op id = idempotency key", "Generated on the device before the first send, so a retry after a lost response is harmless."],
      ["Persist on every transition", "Enqueue, success and retry all save, so a kill at any line loses nothing."],
      ["Typed results", "A sealed interface of Applied, Duplicate, Retryable and Rejected makes the policy explicit, and when is checked to be exhaustive."],
      ["Two locks, two jobs", "One Mutex guards the queue; a second, taken with tryLock, keeps drain single-flight. The network call holds neither."],
    ],
    core: [66, 91],
    steps: [
      { lines: [10, 15], title: "The op carries its own key", note: "A UUID created on the device. The server dedupes by it, so retries are safe." },
      { lines: [17, 22], title: "Every server answer has a policy", note: "Duplicate counts as success; 429/5xx is retryable; 4xx validation is rejected for good." },
      { lines: [59, 63], title: "Persist before returning", note: "The UI gets control back only after the intent is on disk." },
      { lines: [66, 67], title: "Single flight", note: "tryLock fails if a drain is already running, so a second trigger returns at once instead of sending twice." },
      { lines: [69, 74], title: "Push in order; offline stops", note: "Peek under the lock, push without it. An IOException means no network: keep everything and wait for the next trigger." },
      { lines: [76, 78], title: "Success or permanent failure", note: "Remove applied and duplicate ops; park rejected ones so the queue keeps moving." },
      { lines: [79, 89], title: "Retry with backoff", note: "Count the attempt, persist it, and return the server's Retry-After or a jittered backoff. Too many attempts → park." },
      { lines: [91, 91], title: "Checkpoint after each op", note: "A kill now replays at most one op, and the server ignores the duplicate." },
    ],
    complexity: "O(1) per op plus one store write; the queue is FIFO",
    edgeCases: ["Killed between the server applying an op and us saving: the retry returns 'duplicate'", "An op that fails validation forever", "Two triggers arrive at once", "The queue grows large offline: batch pushes and compact edits to the same record"],
    followups: [
      ["How would you batch?", "Send up to N ops per request; the server returns a result per op id and the client applies the same policy to each."],
      ["What about ordering across entities?", "One queue keeps global order. If entities are independent you can run one queue per entity type for parallelism."],
      ["How does the UI show pending state?", "Each local row has a sync-status column updated in the same Room transaction as the outbox."],
    ],
    ios: [
      ["Storage", "A GRDB or SwiftData table, written in the same transaction as the entity change."],
      ["Scheduling", "BGProcessingTask with requiresNetworkConnectivity, plus a drain on launch and on NWPathMonitor changes."],
      ["Concurrency", "An actor with a draining flag; actors are re-entrant at await, so the flag is still needed."],
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
      ["Shift with a clamp", "1 shl attempt.coerceIn(0, 16) avoids overflow and negative shifts."],
      ["Inject randomness and sleep", "Tests pass a fixed random function and a recording sleep: no flaky timing."],
      ["Never retry cancellation", "CancellationException is rethrown first, so a closed screen stops retrying immediately."],
    ],
    core: [19, 46],
    steps: [
      { lines: [19, 20], title: "Exponential, capped", note: "base · 2^attempt with the shift clamped to 0–16, then capped at 60 seconds. Duration does the unit maths." },
      { lines: [21, 21], title: "Full jitter", note: "A random wait in [0, ceiling]: clients spread out instead of returning in lockstep." },
      { lines: [26, 28], title: "Server hints", note: "Exceptions that know the server's Retry-After expose it through an interface." },
      { lines: [39, 40], title: "Try the operation", note: "Return on the first success." },
      { lines: [41, 45], title: "Give up when it is pointless", note: "Rethrow cancellation untouched; stop after maxAttempts or on non-retryable errors." },
      { lines: [46, 46], title: "Wait the right amount", note: "Use Retry-After if the server sent one, otherwise the jittered backoff. sleep defaults to delay(), which is cancellable." },
    ],
    complexity: "O(attempts) calls; waits grow to the cap",
    edgeCases: ["attempt = 0 or negative", "Huge attempt counts (overflow)", "Cancellation during the wait", "Retry-After larger than the cap (respect the server)"],
    followups: [
      ["Why not a fixed delay?", "Every client retries at the same moment, recreating the spike that caused the outage."],
      ["What else protects the server?", "A circuit breaker that stops calls for a while after repeated failures, and a client-side rate limiter."],
      ["Retry POSTs?", "Only with an idempotency key, otherwise a lost response leads to duplicate writes."],
    ],
    ios: [
      ["Background jobs", "BGTaskScheduler has no backoff policy: reschedule with earliestBeginDate set to your own jittered delay."],
      ["async/await", "The same loop with Task.sleep(for:); check Task.isCancelled before retrying."],
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
      ["Which scope?", "viewModelScope, so everything cancels when the screen goes away."],
    ],
    design: [
      ["collectLatest is the whole trick", "A new query cancels the block still running for the old one, whether it is waiting, searching or about to publish."],
      ["delay() is the debounce", "The block sleeps first; typing again cancels the sleep, so only a pause reaches the network."],
      ["One immutable UI state", "SearchUi in a StateFlow: the screen renders results, a spinner or an error from a single value."],
    ],
    core: [38, 53],
    steps: [
      { lines: [38, 38], title: "Latest keystroke wins", note: "Trim, skip repeats, and collectLatest: each new query cancels the previous block." },
      { lines: [39, 42], title: "Ignore tiny queries", note: "Under two characters: clear results and stop. No request." },
      { lines: [43, 43], title: "The debounce", note: "delay throws CancellationException if another keystroke arrives first, so only pauses trigger a search." },
      { lines: [44, 46], title: "Search with a spinner", note: "Keep the old results visible while loading; the injected search function makes the network call." },
      { lines: [47, 48], title: "Drop stale responses", note: "ensureActive() throws if the query changed while the search ran, even if the search itself ignored cancellation." },
      { lines: [49, 53], title: "Cancellation is not an error", note: "Rethrow CancellationException so the newer query owns the UI; real failures show a message." },
    ],
    complexity: "At most one request per debounce window",
    edgeCases: ["Typing, then deleting back to one character", "Network error, then typing again", "Screen closed mid-request (viewModelScope cancels it)", "Identical consecutive queries (distinctUntilChanged skips them)"],
    followups: [
      ["How would you test timing?", "Inject a short debounce and a recording search function; type four keystrokes quickly and assert one call. That test ships with this code. With kotlinx-coroutines-test, use virtual time instead."],
      ["Why not debounce() + mapLatest()?", "That works too. collectLatest with delay keeps the short-query rule, the debounce and the stale-response guard in one readable block."],
    ],
    ios: [
      ["Combine", "$query.debounce(for: .milliseconds(300), scheduler: RunLoop.main).removeDuplicates() then switchToLatest over the search publisher."],
      ["async/await", "Cancel the previous Task on each keystroke; Task.sleep(for:) is the debounce and Task.checkCancellation() drops stale results."],
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
    color: ["#f97316", "#c2410c"],
    tags: ["pagination", "UI state", "networking"],
    prompt:
      "Implement the paging logic for a social feed. Users scroll fast, new posts arrive at the top while they read, and pull-to-refresh can happen mid-load.",
    requirements: ["Load the next page by cursor", "Never two loads at once", "Prefetch a few rows before the end", "Drop duplicate items", "Ignore responses that arrive after a refresh"],
    clarify: [
      ["Offset or cursor?", "Cursor. Offsets skip or repeat items when new posts are inserted."],
      ["Page size?", "Server decides; around 20."],
      ["Where are items stored?", "In memory here; in the offline app they go to Room and the UI observes it."],
    ],
    design: [
      ["Explicit state machine", "A sealed State of Idle, Loading, Failed and End: easy to render and easy to test."],
      ["Seen-ID set", "Items that shift across page boundaries are filtered out in O(1)."],
      ["Generation counter", "Refresh bumps it; responses from an older generation are ignored."],
      ["StateFlow out", "items and state are StateFlows, so Compose collects them and recomposes only on change."],
    ],
    core: [33, 65],
    steps: [
      { lines: [16, 21], title: "State the UI can render", note: "Spinner, error with retry, or end-of-feed come straight from this sealed interface." },
      { lines: [33, 36], title: "Single flight", note: "Loading or at the end? Do nothing. Failed or idle? Go. when over a sealed type is exhaustive." },
      { lines: [37, 41], title: "Remember the generation", note: "If a refresh happens while we wait, this response belongs to the old feed and is dropped." },
      { lines: [42, 45], title: "De-duplicate and advance", note: "HashSet.add returns false for ids already seen; append only new items; a null cursor means the end." },
      { lines: [53, 60], title: "Refresh starts over", note: "Bump the generation, clear state, load page one." },
      { lines: [63, 65], title: "Prefetch near the bottom", note: "Rows report their index as they compose; within five of the end, load the next page before the user gets there." },
    ],
    complexity: "O(page size) per load; O(1) duplicate checks",
    edgeCases: ["Server returns an empty page with a cursor", "Pull-to-refresh during a load", "Same post appears on two pages", "Error, then retry from the same cursor"],
    followups: [
      ["How do you keep scroll position after refresh?", "Insert new items above and keep LazyListState's first visible item, or show a 'new posts' pill instead of jumping."],
      ["How would this work offline-first?", "Pages are written to Room and the list observes the database; the paginator only drives fetching (Paging 3's RemoteMediator)."],
    ],
    ios: [
      ["SwiftUI", "List rows call .onAppear; an @Observable paginator on the main actor holds the same state machine."],
      ["Cancellation", "Store the load Task and cancel it on refresh, in addition to the generation check."],
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
      ["Which storage API?", "S3-style multipart: a presigned URL per part, and the server returns an ETag per part."],
      ["Part size?", "8 MB: big enough for throughput, small enough to lose little on a kill."],
      ["Background?", "Run it from a WorkManager worker with setForeground, or a user-initiated data transfer job on Android 14+."],
    ],
    design: [
      ["The plan is the state", "UploadPlan records completed parts and ETags; persist it and you can resume anywhere."],
      ["N workers, one channel", "Remaining parts go into a closed Channel; N coroutines read from it. Concurrency can never exceed N."],
      ["Fail fast, resume cheaply", "A failing part cancels its siblings through coroutineScope; the saved plan means the retry skips everything already done."],
    ],
    core: [43, 56],
    steps: [
      { lines: [10, 20], title: "A plan you can persist", note: "Part count, remaining parts and byte ranges are all derived from size, part size and completed ETags." },
      { lines: [43, 45], title: "Only what is missing", note: "Queue the remaining parts and close the channel: on resume, finished parts are never queued." },
      { lines: [46, 49], title: "N workers", note: "coroutineScope waits for all workers and cancels the rest if one throws. for (part in parts) ends when the channel is empty." },
      { lines: [50, 52], title: "One part, one request", note: "Copy this part's byte range and upload it; the server returns its ETag." },
      { lines: [53, 56], title: "Checkpoint, then take the next", note: "Record the ETag and save the plan under a Mutex before this worker takes another part." },
    ],
    complexity: "O(parts) requests; at most N concurrent; one checkpoint per part",
    edgeCases: ["Last part is smaller than partSize", "File changed between attempts (verify size and hash)", "Presigned URLs expire on a long resume", "Zero-byte file"],
    followups: [
      ["How does the server assemble it?", "A complete-multipart call with the ordered ETags; verify a SHA-256 of the whole file."],
      ["Adaptive concurrency?", "Measure throughput per part; grow N on fast Wi-Fi, shrink on cellular."],
      ["Real files are too big for a ByteArray", "Stream each part from disk with RandomAccessFile and an OkHttp RequestBody, as in the transfer-manager deep dive."],
    ],
    ios: [
      ["Background", "A background URLSession uploadTask(fromFile:) per part, so uploads continue after the app is suspended."],
      ["Concurrency", "withThrowingTaskGroup: start N parts, and each completion starts the next."],
      ["Checkpoint", "Store part ETags in SQLite after each part."],
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
      ["Injectable monotonic clock", "TimeSource.Monotonic ignores changes to the device time; tests pass a TestTimeSource and move it by hand."],
      ["Plain class + Mutex", "The bucket is simple and easy to test; RateLimiter shares one behind a Mutex and sleeps outside the lock."],
    ],
    core: [18, 57],
    steps: [
      { lines: [18, 19], title: "Start full", note: "Tokens start at capacity, which allows an initial burst." },
      { lines: [21, 26], title: "Consume if available", note: "Refill first, then take tokens or refuse." },
      { lines: [29, 33], title: "How long to wait", note: "Missing tokens divided by the refill rate, as a Duration." },
      { lines: [35, 40], title: "Lazy refill", note: "Add elapsed × rate, capped at capacity. A monotonic clock avoids time-change bugs." },
      { lines: [48, 57], title: "Callers wait their turn", note: "Check under the lock; if tokens run short, delay exactly as long as needed outside the lock, then try again." },
    ],
    complexity: "O(1) per call, no background timers",
    edgeCases: ["Cost bigger than capacity never succeeds (rejected up front)", "Clock going backwards (clamped to zero)", "Many waiters wake together (they retry and most wait again)"],
    followups: [
      ["Leaky bucket vs token bucket?", "Leaky bucket smooths output to a constant rate; token bucket allows bursts, which suits user actions."],
      ["Server-side too?", "Always. The client limiter protects against your own bugs; the server enforces the contract."],
    ],
    ios: [
      ["Swift", "The same bucket as a struct (value type, easy to test) shared through an actor."],
      ["Clock", "ContinuousClock, which is monotonic and injectable for tests."],
    ],
    related: ["backoff", "search-debounce"],
  },
  {
    id: "list-diff",
    file: "ListDiff",
    title: "List diffing for animated UI updates",
    tagline: "Turn old and new lists into deletes, inserts, moves and reloads, in O(n log n).",
    level: "Hard",
    minutes: 40,
    color: ["#a855f7", "#f43f5e"],
    tags: ["algorithms", "UI", "performance"],
    prompt:
      "When the feed refreshes, we reload the whole list and the UI flashes. Compute the minimal batch update between the old and new lists so the list can animate.",
    requirements: ["Match items by identity", "Report deletions by old index and insertions by new index", "Report moves, but as few as possible", "Report content changes as reloads"],
    clarify: [
      ["Are ids unique?", "Yes, within one list."],
      ["Do moves matter?", "Yes: moving every row looks broken. Keep the most rows still."],
    ],
    design: [
      ["Identity map", "Old id → index makes every lookup O(1). The caller passes idOf, so any type works."],
      ["LIS keeps rows still", "Among surviving items, the longest increasing run of old indices is the largest set that keeps order; everything else moved."],
      ["Patience sorting", "LIS in O(n log n) with a predecessor array to rebuild the sequence."],
    ],
    core: [20, 63],
    steps: [
      { lines: [20, 23], title: "Index the old list", note: "Map old ids to positions; anything whose id is not in the new list is a delete." },
      { lines: [25, 36], title: "Walk the new list", note: "Unknown ids are inserts; known ids are survivors, and changed content (data class equality) means a reload." },
      { lines: [38, 40], title: "Moves are what LIS leaves out", note: "Survivors on the longest increasing run of old indices stay; the rest are moves." },
      { lines: [45, 56], title: "Patience sorting", note: "Binary search the first tail ≥ value; track predecessors to rebuild the sequence." },
      { lines: [57, 63], title: "Rebuild the sequence", note: "Follow predecessors back from the last tail, adding to the front of an ArrayDeque." },
    ],
    complexity: "O(n log n) time, O(n) space",
    edgeCases: ["Identical lists produce an empty diff", "Everything replaced", "Pure reorder", "Duplicate ids (reject or dedupe first)"],
    followups: [
      ["Why not Myers' diff?", "Myers minimises edits for sequences without identity; with stable ids, the map plus LIS is simpler and faster. DiffUtil uses Myers plus move detection."],
      ["What does the platform give you?", "DiffUtil / ListAdapter on Android and diffable data sources on iOS do this for you; this is how they work underneath."],
    ],
    ios: [
      ["Diffable data sources", "Apply an NSDiffableDataSourceSnapshot of item identifiers; reconfigureItems for content changes."],
      ["SwiftUI", "ForEach over Identifiable items animates inserts, deletes and moves by id."],
    ],
    related: ["feed-pagination", "lru-cache"],
  },
];
