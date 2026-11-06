/* Every explained code sample on the site. Code stays in real files, so the tests run exactly
   what a page shows; this file only says why it exists and how it works. */

export type CodeDir = "programme" | "modules" | "protocols" | "interview";

export interface CodeDoc {
  dir: CodeDir;
  file: string;
  /** a named part of the file, between "// region: name" and "// endregion" */
  region?: string;
  title: string;
  /** why this code exists, in plain words */
  lead: string;
  /** [the thing in the code, what it does and why] */
  points: [string, string][];
  /** closes a block the region leaves open */
  tail?: string;
}

const kt = (file: string, region: string, title: string, lead: string, points: [string, string][], tail?: string): CodeDoc => ({ dir: "programme", file, region, title, lead, points, tail });
const mod = (file: string, title: string, lead: string, points: [string, string][]): CodeDoc => ({ dir: "modules", file, title, lead, points });
const proto = (file: string, title: string, lead: string, points: [string, string][]): CodeDoc => ({ dir: "protocols", file, title, lead, points });

const iv = (file: string, region: string | undefined, title: string, lead: string, points: [string, string][]): CodeDoc => ({ dir: "interview", file, region, title, lead, points });

export const CODE: Record<string, CodeDoc> = {
  /* ---------- the sync system behind the programme ---------- */
  rows: kt("LocalDb.kt", "rows", "The rows Priya's edit creates", "Two tables hold everything the phone must remember: the job as the user sees it, and the changes the server hasn't confirmed.", [
    ["val version: Int", "The server version this phone last saw. It becomes the base version of the next edit."],
    ["val theirs: Theirs?", "Empty until a conflict. Then it holds the other person's value, so the screen can show both."],
    ["val opId: String", "Created on the device before the first send, so a retry can be recognised."],
    ["val baseVersion: Int", "What the user was looking at. The server uses it to spot a change made behind their back."],
  ]),
  transaction: kt("LocalDb.kt", "transaction", "A transaction, all or nothing", "SQLite gives you this guarantee. The class below behaves the same way, so the tests can crash mid-write and check that nothing changed.", [
    ["val tx = Tx(...)", "Works on a scratch copy of the tables, not the real ones."],
    ["tx.block()", "Runs your writes. If it throws, the function ends here and the real tables never change."],
    ["jobTable.value = tx.jobs", "Publishes once at the end, so a transaction touching 140 rows redraws the screen once."],
    ["val jobs: StateFlow", "This is what a screen subscribes to. On Android, a Room or SQLDelight query plays this role."],
  ]),
  save: kt("LocalDb.kt", "save", "The save, and the conflict resolution", "This is the code behind the tap. It's the only way a screen changes data, and it has no network call in it.", [
    ["db.transaction { ... }", "The job row and the outbox row commit together. A crash can't leave one without the other."],
    ["SyncState.PENDING", "Makes the row show its clock. The screen reacts by itself, because it watches this table."],
    ["job.version", "Copied into the op as its base version: 4 in Priya's case."],
    ["requestSync(Trigger.EDIT)", "Runs after the commit, so even if scheduling fails, the edit is already safe."],
    ["fun resolve", "Choosing a value in the conflict screen creates a new edit, based on the version the user just saw. Nothing gets patched in place."],
  ]),
  hub: kt("SyncTriggers.kt", "hub", "Every trigger becomes one job", "Edits, pushes, timers and reconnects all want a sync. Without this funnel, a busy minute would start five of them.", [
    ["fun interface JobScheduler", "The one WorkManager feature this code needs. Hiding it behind an interface lets a plain test run this code."],
    ["enqueueUnique(\"sync\", ...)", "On Android this is enqueueUniqueWork with KEEP: if a job named sync already waits, nothing new is added."],
    ["requiresNetwork = true", "The condition the OS waits for. Your code doesn't watch the network at all."],
  ]),
  worker: kt("SyncTriggers.kt", "worker", "The worker, and its time budget", "The OS gives you a few minutes. This code spends them, and leaves things tidy if it runs out.", [
    ["deadline = clockMs() + budgetMs", "Eight minutes, a little under what Android allows, so the code stops itself before the OS stops it."],
    ["hasTime = { ... }", "The engine checks this between batches, so it always stops at a safe point."],
    ["if (out.morePending) hub.fire(...)", "Leftover work gets a follow-up job, so nothing depends on one run finishing."],
    ["RetryLater -> WorkResult.Retry", "Tells the OS to apply its own backoff. The ops are still in the outbox."],
  ]),
  contract: kt("SyncEngine.kt", "contract", "The contract between phone and server", "Write this on the board early. These few types decide how the whole system behaves when things fail.", [
    ["OpResult", "Three answers per op: applied, conflict or rejected. One batch can contain all three."],
    ["val seq: Long", "The line number in the server's log. The cursor is simply the last number the phone has read."],
    ["TryLater", "429, 5xx or no network. A separate type means retry code can't confuse this with a bad request."],
    ["CursorTooOld", "The server's 410. The phone must rebuild from a snapshot, because some deletes may be gone from the log."],
  ]),
  "sync-run": kt("SyncEngine.kt", "run", "One sync run", "This is the 2.1 seconds at 4:12 pm. Read it top to bottom: lock, push until empty, pull until caught up, report.", [
    ["lock.tryLock()", "Single flight. If a run is already active, this one returns at once, because that run will see any new ops."],
    ["db.outbox.take(batchSize)", "Takes 25 at a time, and reads them fresh each loop, so edits made during the run go out too."],
    ["api.push(...)", "If this throws, nothing was removed locally. The ops wait for the next run."],
    ["while (more && hasTime())", "Keeps pulling pages until the server has no more, or the budget ends."],
    ["finally { lock.unlock() }", "Runs even after a failure, so one bad run can't block sync forever."],
  ], "  // applyResults and applyPage follow\n}"),
  "sync-results": kt("SyncEngine.kt", "results", "Applying the server's answers", "The push came back. One transaction records every outcome, so the outbox and the job states always agree.", [
    ["outbox = outbox - op", "A finished op leaves the queue. Applied, conflict and rejected ops all stop being retried."],
    ["job.syncState == SyncState.PENDING", "Priya's story found this bug: a later success on the same job used to clear its amber badge. Only a pending job may turn synced."],
    ["outbox.none { it.jobId == op.jobId }", "A job only shows a tick once all its ops are done."],
    ["OpResult.Conflict", "Stores the other person's value next to hers, ready for the conflict screen."],
  ]),
  "sync-page": kt("SyncEngine.kt", "page", "Applying a pulled page", "Changes and the new cursor commit together. That one choice removes a whole family of sync bugs.", [
    ["unsent || inConflict", "Never overwrite something the user changed and the server hasn't settled. This is what keeps leaking on Priya's screen."],
    ["maxOf(job.version, c.version)", "The version still moves forward, so her eventual choice is based on version 5."],
    ["cursor = page.next", "Saved in the same transaction. If the phone dies, both the changes and the bookmark roll back, and the pull simply repeats."],
  ]),
  backoff: kt("SyncEngine.kt", "backoff", "When to try again", "After an outage, every phone wants to retry. This spreads them out.", [
    ["baseMs shl attempt", "Doubles the wait each attempt: 1, 2, 4, 8 seconds and so on."],
    ["minOf(exponential, capMs)", "Stops growing at five minutes, so a phone never waits for hours."],
    ["random.nextLong(...)", "Full jitter picks anywhere from zero up to that limit. Without it, phones that failed together retry together."],
  ]),
  "field-merge": kt("FieldMerge.kt", "merge", "The decision for each field", "This small function decides what happens when two people edit offline. The product team's table becomes code you can test.", [
    ["policyFor(field)", "The policy table. Anything not listed asks the user, the safe choice for a new field."],
    ["current.version <= baseVersion", "Nobody changed this field since the user read it, so apply it. That's why j-81 merged with no conflict."],
    ["Policy.ADD_ONLY", "Photos: both people's additions are kept, because they never disagree."],
    ["Merge.Refuse(current)", "Valve 3 on j-84 lands here. The server applies nothing, and returns what it holds."],
  ]),
  "server-apply": kt("SyncServer.kt", "server", "Applying one op on the server", "Each op must apply exactly once, however many times it arrives. In production this is one Postgres transaction per op.", [
    ["applied[op.opId]?.let { return it }", "The first line. A retry returns the saved answer and writes nothing. A conflict counts too, so a retry can't turn it into a success."],
    ["merge(op.field, ...)", "The same function as the merge lesson."],
    ["seq += 1", "The next line number in the log. In production a per-customer row lock keeps these in commit order."],
    ["log += Change(...)", "Every change goes here. Other devices read only this."],
  ], "  // pull follows\n}"),
  "server-pull": kt("SyncServer.kt", "pull", "Serving a pull", "A device says where it got to, and gets what comes after.", [
    ["cursor < logFloor", "This device is older than the log keeps, so answer 410 and send it to a snapshot."],
    ["it.seq > cursor", "Only what this device hasn't read. Asking twice is harmless."],
    ["hasMore = after.size > limit", "Tells the phone to keep pulling. Large catch-ups arrive in safe pieces."],
  ]),
  notifier: kt("SyncServer.kt", "notifier", "Telling other devices to look", "A push doesn't carry the change. It just says something changed, so Dev's tablet pulls by cursor like any other device.", [
    ["flatMap { devicesFor(it.jobId) }", "Finds who cares about each change."],
    [".toSet()", "Five changes for one tablet still mean one push, which saves battery and provider quota."],
    [".minus(author)", "The phone that made the change doesn't need telling."],
  ]),
  "parts-plan": kt("PartUploader.kt", "plan", "Cutting a file into parts", "This is simple arithmetic, and getting the last part wrong corrupts uploads.", [
    ["(size + partSize - 1) / partSize", "Rounds up, so 412 MB makes 52 parts of 8 MB."],
    ["minOf(partSize, size - offset)", "The last part is usually shorter."],
    ["Part(i + 1, ...)", "Object stores number parts from 1."],
  ]),
  "parts-upload": kt("PartUploader.kt", "upload", "Sending parts that survive being killed", "Arjun's upload. The receipts map stands for a table on disk, so a killed app loses almost nothing.", [
    ["parts.filter { it.no !in receipts }", "What is left. This one line is why resuming needs no special case: a fresh start and a resume run the same code."],
    ["runCatching { send(...) }", "One failed part doesn't cancel the others in flight."],
    ["outcomes.forEach { ... receipts[...] = etag }", "Saves every success before looking at failures, so finished work always counts."],
    ["is UrlExpired -> urls = freshUrls(remaining)", "Fetches new URLs only for the parts still missing, then carries on."],
    ["else -> throw failure", "Anything else ends this run. The next run picks up from the receipts."],
  ]),
  "row-states": kt("RowUi.kt", "states", "Every state a row can show", "Name the states before you build the screen. The compiler then makes sure no screen forgets one.", [
    ["sealed interface RowUi", "A closed list. Adding a state breaks the build wherever it isn't handled."],
    ["fun rowUi(job: Job)", "A pure function, with no network or clock involved, so a test needs only a row."],
    ["RowUi.Conflict(job.answers...", "Carries both values, so the resolver screen has what it needs."],
  ]),
  "row-flow": kt("RowUi.kt", "flow", "A screen as one mapping", "The whole list is a transformation of one database query. That's why the screen needs no sync logic.", [
    ["db.jobs.map { ... }", "Each commit produces one new screen state, whoever made the change."],
    ["distinctUntilChanged()", "If a sync changed nothing visible, nothing redraws."],
    ["val ticks: Int", "The eleven green ticks and one amber badge are simply counts of this list."],
  ]),
  "row-diff": kt("RowUi.kt", "diff", "Redrawing only what changed", "140 pulled changes may touch three rows on screen. Compose and RecyclerView do this for you, and this is the idea underneath.", [
    ["old.associateBy { it.id }", "Looks up each row's previous state in constant time."],
    ["before[it.id] != it", "Data classes compare by value, so an unchanged row doesn't redraw."],
  ]),
  "chat-log": kt("ChatThread.kt", "server", "One conversation's order", "A resent message must keep its place. This is the server's op_id check, applied to chat.", [
    ["byClientId.getOrPut(...)", "The first arrival takes the next number. A resend returns the same one."],
    ["@Synchronized", "One owner per conversation. Consistent hashing routes each chat to one instance, so no global lock is needed."],
  ]),
  "chat-thread": kt("ChatThread.kt", "client", "The phone's copy of a chat", "Socket, push and catch-up all feed one method, so ordering logic lives in one place.", [
    ["sendLocal", "Shows the message straight away, with no signal needed."],
    ["sortedMapOf<Long, Msg>()", "Keyed by sequence, so arrival order stops mattering."],
    ["missingSeqs()", "A gap in the numbers means a message was missed. After a reconnect, the client asks for these."],
    ["maxOf(highestRead, seq)", "One number covers many messages, and two devices merge by taking the larger."],
  ]),
  "order-states": kt("Checkout.kt", "states", "The moves an order can make", "List the allowed moves, and impossible states stop being possible.", [
    ["ALLOWED", "Anything not listed gets ignored. A late failed webhook can't undo a paid order."],
    ["OrderState.CANCELLED to setOf(OrderState.REFUND_DUE)", "Money arrived after the customer cancelled. It's a named case, not an exception."],
  ]),
  "order-service": kt("Checkout.kt", "service", "Taking payment exactly once", "The phone can retry as much as it likes. These methods make that harmless.", [
    ["byKey.getOrPut(idempotencyKey)", "A repeat returns the stored order. In production, a unique constraint does this."],
    ["priceOf(cartId)", "The server works out the price. Whatever the phone claims is never read."],
    ["seenEvents.add(eventId)", "Providers resend webhooks, so each event counts once."],
    ["reconcile(...)", "Runs daily, and finds charges whose webhook never arrived."],
  ]),
  "order-screen": kt("Checkout.kt", "screen", "What the customer sees", "The phone never decides what happened. It just shows the last answer it got.", [
    ["null, OrderState.PAYMENT_PENDING -> CheckoutUi.Confirming", "No answer means confirming, never failed. Telling someone a payment failed when it succeeded makes them pay twice."],
  ]),
  "slot-booking": kt("SlotBooking.kt", "booking", "Holding a popular slot", "At 9 am thousands of people want the same slot. One conditional update solves this without a lock service.", [
    ["slot.held + slot.booked >= slot.capacity", "The condition in the UPDATE. The database applies it atomically, so two people can't both take the last place."],
    ["holds[requestId]?.let { return it }", "A retried hold returns the same hold, so a flaky network can't take two places."],
    ["expire(nowMs)", "An abandoned hold frees its place automatically."],
    ["if (h.confirmed) return true", "Confirming twice is fine, and books once."],
  ]),
  "feed-sample": kt("FeedCache.kt", "sample", "Decoding images at the right size", "Memory is the first thing a feed runs out of. Decoding at screen size is the biggest single saving.", [
    ["sample *= 2", "Android's decoder works in powers of two."],
    ["bitmapBytes", "Width times height times 4 bytes. A 12-megapixel photo costs 48 MB decoded, whatever its file size."],
  ]),
  "feed-page": kt("FeedCache.kt", "page", "Merging pages without jumps", "New posts shift the feed while someone scrolls, so the same post can land on two pages.", [
    ["page.filter { seen.add(it.id) }", "add returns false for a repeat, so duplicates simply drop out."],
    ["fun Feed.onFresh", "Fresh posts wait behind a pill while reading, so the list never moves under the reader's thumb."],
  ]),
  "startup-budget": kt("FeedCache.kt", "startup", "A startup budget that fails the build", "Every team adds a little to startup. Only an automatic check stops it creeping up.", [
    ["phases.sumOf { it.ms } <= totalMs", "Within budget: nothing to report."],
    ["sortedByDescending { it.ms }.take(2)", "When over budget, it names the two slowest phases, so the failure tells you where to look."],
  ]),
  "release-gate": kt("ReleaseGate.kt", "gate", "Deciding whether a rollout continues", "This would have stopped version 8.2 at 1%. It compares like with like, and waits for enough data.", [
    ["new.sessions < minSessions", "Too little data proves nothing. Wait, rather than react to noise."],
    ["old.crashFree - 0.002", "A small allowance, so normal variation doesn't halt every release."],
    ["new.outboxP90 > old.outboxP90 * 2", "Catches a sync stall, which shows up in no crash report. Domain health needs its own signal."],
  ]),
  telemetry: kt("ReleaseGate.kt", "telemetry", "Telemetry that survives being offline", "It's an outbox for measurements, so a crash in a basement still gets reported.", [
    ["queue.firstOrNull { !it.critical }", "When full, routine events go first. Crash reports are the last to be dropped."],
    ["if (events.isEmpty() || !upload(events))", "Events leave the queue only after a successful upload."],
    ["class EventIntake", "The server removes repeats, so a resend can't inflate the crash rate."],
  ]),
  "live-store": kt("LiveStore.kt", "live", "The latest position, and nothing older", "Fixes from a tunnel arrive late. The rider's dot must not jump backwards.", [
    ["current.seq >= fix.seq", "The cursor idea again: a number decides what's newer, not arrival time."],
    ["writesPerSecond", "The first number to say out loud: 500,000 drivers every 4 seconds is 125,000 writes a second."],
  ]),
  "token-refresh": kt("TokenRefresher.kt", "refresh", "Refreshing a token only once", "When a token expires, ten requests can fail together. If each one refreshes, rotation treats the repeats as theft and logs the user out.", [
    ["if (tokens.access != stale) return tokens", "Someone already replaced this token, so use the new one."],
    ["inFlight?.also { return@withLock it }", "A refresh is running, so join it rather than starting another."],
    ["callRefresh(tokens.refresh)", "Runs outside the lock, so waiting requests never block on the network while holding it."],
    ["completeExceptionally(e)", "If the refresh fails, everyone waiting finds out, and the old tokens stay."],
  ]),
  "notify-route": kt("NotifyRouter.kt", "route", "One set of rules for every team", "Thirty teams send through this. Urgent messages skip the limits, and bulk ones never delay them.", [
    ["seenKeys.add(n.key)", "A caller's retry sends nothing twice."],
    ["Lane.URGENT", "Returns before any limit applies, because a passcode can't wait for quiet hours to end."],
    ["bulkToday", "Per-user limits protect people from the sum of every team's campaigns."],
  ]),
  "priyas-day": kt("PriyasDay.kt", "story", "Priya's whole day, as a program", "This runs the real engine against the real server code. The numbers in the story are what this function produces, and a test checks them.", [
    ["SyncServer(startSeq = 88411)", "The log starts where her cursor is, c_88411."],
    ["priyaRepo.setAnswer(...)", "37 edits underground. Nothing here talks to a network."],
    ["devSync.run()", "Dev's 3:30 pm edit reaches the server first, which sets up the conflict."],
    ["server.push(others)", "102 changes from other people, which brings the pull to 140."],
    ["priyaSync.run()", "The 4:12 pm run. A test asserts 36 applied, 1 conflict, 140 pulled and cursor c_88551."],
    ["priyaRepo.resolve(...)", "Her choice is a new edit based on version 5, and it reaches version 6."],
  ]),
  "location-batcher": { dir: "modules", file: "LocationBatcher.kt", title: "Filtering and batching GPS fixes", lead: "This keeps the phone's radio asleep as long as possible, without losing the route.", points: [
    ["if (!moved && !silent) return", "Drops a fix unless the phone really moved, or 30 seconds have passed, so a parked car stays visible but quiet."],
    ["buffer.removeFirst()", "A very long tunnel drops the oldest points, not the newest."],
    ["buffer.size < maxBatch && ...", "Waits to fill a batch, because each radio wake-up costs far more than a few extra bytes."],
    ["metersBetween", "A flat-earth approximation that is accurate at these distances and cheap on battery."],
  ] },
  "flag-evaluator": { dir: "modules", file: "FlagEvaluator.kt", title: "Stable variant assignment", lead: "The same user must get the same variant on any device, offline, with no server call.", points: [
    ["if (exp.killed) return default", "The kill switch wins over everything."],
    ["bucketOf(\"${exp.salt}:$userId\")", "A new salt gives each experiment an independent split."],
    ["logged.add(exp.key)", "Logs exposure once, when the feature is reached, so unexposed users don't dilute results."],
    ["FNV-1a", "hashCode differs between languages. A hash written out by hand gives Android and iOS the same answer."],
  ] },

  /* ---------- AI systems ---------- */
  "kv-size": mod("kv-size.ts", "How much memory one token costs", "This arithmetic sets how many requests a GPU can serve at once. Weights are fixed, and the KV cache grows with every token.", [
    ["2 * m.layers * ...", "A key and a value, for each layer, each head and each dimension."],
    ["freeGiB", "What's left after loading the weights. Divide by the cost of a whole request, and you have your concurrency limit."],
  ]),
  "paged-blocks": mod("paged-blocks.ts", "Managing the KV cache in blocks", "A sequence's final length is unknown, so reserving contiguous memory wastes most of it. Blocks work like virtual memory pages.", [
    ["s.tokens % this.blockTokens === 0", "A new block is needed only when the last one is full, so waste is under one block per sequence."],
    ["return false", "No free block. The scheduler must preempt something, which is why this returns a value rather than throwing."],
    ["this.refs[last] > 1", "Copy on write: forked sequences share blocks until one of them writes."],
    ["--this.refs[b] === 0", "A shared block returns to the free list only when its last user finishes."],
  ]),
  "continuous-batching": mod("continuous-batching.ts", "Static versus continuous batching", "One long request shouldn't hold up everyone else. Run both functions on the same jobs, and the difference is plain.", [
    ["t += Math.max(...)", "Static batching: everyone waits for the longest request in the batch."],
    ["running.delete(i)", "Continuous batching: a finished request leaves after any step."],
    ["running.add(queue[next++])", "A waiting request joins at the very next step, which is where the throughput gain comes from."],
  ]),
  "ring-allreduce": mod("ring-allreduce.ts", "Ring all-reduce", "Every GPU must end with the sum of all gradients. A ring keeps each link equally busy, which suits large vectors.", [
    ["2(p - 1) steps", "Reduce-scatter, then all-gather."],
    ["chunks[m.to][m.c][i] += x", "Each chunk travels the ring, adding each rank's values."],
    ["sentPerRank", "Each rank sends about twice the vector in total, however many GPUs there are. That's why it scales well."],
  ]),
  "speculative-accept": mod("speculative-accept.ts", "Accepting a speculative token", "A small model guesses tokens, and the big model checks them. This rule keeps the output distribution exactly the big model's.", [
    ["Math.min(1, p[x] / q[x])", "Accept the draft's token in proportion to how much the target agrees with it."],
    ["Math.max(0, pi - q[i])", "On rejection, sample from what the draft under-weighted. This makes the maths come out exact."],
    ["acceptRate", "The overlap of the two distributions, which predicts your speed-up."],
  ]),
  "prefix-cache": mod("prefix-cache.ts", "Reusing a shared prompt prefix", "Many requests start with the same system prompt, so its KV entries can be reused.", [
    ["parent = `${parent}|...`", "Each block's key includes its parent's, so a match means the whole prefix matches."],
    ["salt", "Keeps tenants apart, because shared prefixes can otherwise leak through timing."],
    ["if (!this.blocks.has(key)) break", "Stops at the first miss. Later blocks are useless without the earlier ones."],
    ["tokens.length - 1", "At least one token must run through the model to produce the next one."],
  ]),
  hnsw: mod("hnsw.ts", "Nearest-neighbour search with HNSW", "Comparing against every vector is too slow. HNSW walks a graph: long jumps near the top, fine steps at the bottom.", [
    ["-Math.log(...) / Math.log(this.M)", "A random level, so few nodes reach the top layers. That creates the long jumps."],
    ["for (let l = this.top; l > 0; l--)", "Descends greedily, using each layer's best match as the next layer's start."],
    ["ef", "How many candidates to keep. Raising it improves recall and costs time, and it's the main dial you tune."],
    ["list.length = limit", "Trims each node's links, keeping memory bounded."],
  ]),
  rrf: mod("rrf.ts", "Merging rankings with RRF", "Keyword and vector scores aren't comparable. Ranks are.", [
    ["/ (k + i + 1)", "Only position counts. An item near the top of both lists beats one at the top of just one."],
    ["k = 60", "Softens the gap between top ranks. 60 is the value from the original paper."],
  ]),
  "parent-child": mod("parent-child.ts", "Search small, read large", "Small chunks match queries precisely, and large ones give the model enough context. This keeps both.", [
    ["children", "Only these get embedded and searched."],
    ["best.set(child.parentId, Math.max(...))", "Several children of one parent collapse into one result, at its best score."],
  ]),
  "graph-communities": mod("graph-communities.ts", "Finding communities for GraphRAG", "A global question needs summaries of groups of entities. This finds the groups.", [
    ["this.triples.set(...)", "Lowercases and dedupes, since the extractor repeats itself."],
    ["k - (total.get(c)! * degree(n)) / twoM", "The modularity gain: links into a community, minus what chance would give."],
    ["factsFor(community: string[])", "The facts to give the summariser for one group."],
  ]),
  "semantic-cache": mod("semantic-cache.ts", "A cache keyed by meaning", "Similar questions can share an answer, if you're careful about who shares with whom.", [
    ["threshold ?? 0.92", "Set this too low, and one question gets the answer to a different one. Tune it on real data."],
    ["this.entries.get(tenant)", "Tenants never share entries, because an answer may contain private data."],
    ["e.expires > this.now()", "Answers go stale, so everything has a time limit."],
  ]),
  bm25: mod("bm25.ts", "Keyword ranking with BM25", "Exact terms such as error codes are where vectors do worst and BM25 does best.", [
    ["Math.log(1 + (N - postings.length + 0.5) / ...)", "Inverse document frequency: rare terms count for more."],
    ["tf * (this.k1 + 1)", "Repeats help, but saturate, so stuffing a term doesn't win."],
    ["this.lengths[doc]) / avg", "Long documents get discounted, since they match more by chance."],
  ]),
  "rerank-pipeline": mod("rerank-pipeline.ts", "Retrieve widely, rerank precisely", "A cross-encoder is accurate but slow, so it only sees the top candidates, and it's allowed to fail.", [
    ["candidates = 100", "Cast the net wide first, because reranking can't recover what retrieval missed."],
    ["Promise.race([rerank(...), timeout])", "Puts a limit on latency."],
    ["reranked: false", "On failure, fall back to retrieval order and say so, rather than failing the request."],
  ]),
  "context-budget": mod("context-budget.ts", "Fitting context into a budget", "Retrieval usually returns more than fits. This keeps the best sentences, in the order they were written.", [
    ["sort((a, b) => b.score - a.score)", "Picks by relevance."],
    ["continue", "Skips one that doesn't fit and tries smaller ones, instead of stopping."],
    ["sort((a, b) => a.i - b.i)", "Restores reading order, because shuffled sentences confuse a model."],
  ]),
  "lora-params": mod("lora-params.ts", "How few weights LoRA trains", "This is the whole reason LoRA is cheap, in one formula.", [
    ["r * (dIn + dOut)", "Two thin matrices, rather than one of dIn by dOut. For 4096 by 4096 at rank 16, that's 131,072 weights instead of about 16.8 million."],
  ]),
  "lora-linear": mod("lora_linear.py", "A LoRA layer from scratch", "The layer behind PEFT, written out in full.", [
    ["requires_grad_(False)", "The original weights stay frozen."],
    ["torch.zeros(...)", "B starts at zero, so training begins from exactly the base model."],
    ["alpha / r", "Scaling that keeps the learning rate stable when you change the rank."],
    ["def merge", "Bakes the update into the weights, so inference has no extra cost."],
  ]),
  "nf4-memory": mod("nf4-memory.ts", "What 4-bit loading actually saves", "The weights shrink, and the constants needed to decode them cost a little extra.", [
    ["32 / 64", "One 32-bit constant per 64 weights."],
    ["8 / 64 + 32 / (64 * 256)", "Double quantisation also compresses those constants."],
  ]),
  "dpo-loss": mod("dpo-loss.ts", "The DPO loss", "It trains on pairs of answers, with no separate reward model.", [
    ["p.chosen - p.refChosen", "How much the model has moved towards the good answer, compared with the frozen reference."],
    ["Math.log1p(Math.exp(-logits))", "A numerically stable form of minus log sigmoid."],
    ["beta", "Controls how far the model may drift from the reference."],
  ]),
  "zero-memory": mod("zero-memory.ts", "What each ZeRO stage saves", "Each stage shards one more thing across GPUs.", [
    ["stage >= 1", "Optimiser state goes first, because it's the largest part at 12 bytes per weight."],
    ["stage >= 3", "Weights go last, and that's what lets a model larger than one GPU fit at all."],
  ]),
  "fsdp-train": mod("fsdp_train.py", "Sharded training with FSDP", "PyTorch's native alternative to ZeRO stage 3.", [
    ["transformer_auto_wrap_policy", "Shards per transformer block, so a block gathers its weights only while it runs."],
    ["model.clip_grad_norm_(1.0)", "Use FSDP's version. Gradients live on different ranks, so the usual helper gets the norm wrong."],
  ]),
  "merge-adapter": mod("merge-adapter.ts", "Merging an adapter", "For serving, you bake the adapter in. For switching, you keep it separate.", [
    ["(alpha / r) * B @ A", "The update LoRA learned, added to the weights."],
    ["unmergeAdapter", "Subtracts it again, up to floating-point error. Keep the original weights if you need them exact."],
  ]),
  "judge-calibration": mod("judge-calibration.ts", "Checking an LLM judge", "A judge you haven't measured is an opinion. These two functions make it a measurement.", [
    ["cohenKappa", "Agreement with human labels, beyond what chance would give."],
    ["Promise.all([judge(a, b), judge(b, a)])", "Judges favour one position, so ask both ways and count only agreement."],
  ]),
  "moderation-gate": mod("moderation-gate.ts", "A safety gate before the model", "It runs before the expensive model, and has to decide what happens if it fails.", [
    ["parseGuardOutput", "Llama Guard replies safe, or unsafe plus category codes."],
    ["allowed", "A medical product may accept a category that a children's product blocks."],
    ["failOpen = false", "If the classifier errors, products that take actions should refuse."],
  ]),
  "ragas-metrics": mod("ragas-metrics.ts", "Scoring retrieval and answers", "Together these separate a retrieval failure from a generation failure.", [
    ["faithfulness", "Did the answer stick to the context?"],
    ["contextRecall", "Did retrieval find what was needed?"],
    ["contextPrecision", "Were the useful chunks ranked high?"],
    ["answerRelevance", "Does the answer address the question?"],
  ]),
  "output-guard": mod("output-guard.ts", "Never trust model output", "Treat a model's reply as untrusted input. Validate it, and re-ask with the exact errors.", [
    ["validate(parsed, schema)", "Checks type, range and allowed values, including for tool arguments."],
    ["ask = `${prompt}...`", "Sends the exact errors back, which fixes most replies in one retry."],
    ["ok: false", "After the retry limit, return a failure. Never pass bad output downstream."],
  ]),
  "image-dependence": mod("image-dependence.ts", "Does the model really use the image?", "Many vision questions can be answered from the text alone, which inflates scores.", [
    ["blankImage", "The control: the same question with a blank image."],
    ["visualLift", "The real value the image adds."],
  ]),
  "red-team": mod("red-team-loop.ts", "Red-teaming as a test suite", "Attacks found once should fail in CI forever after.", [
    ["mutate(probe.prompt)", "Each attack runs in many variations, since models that block one phrasing often miss another."],
    ["failures.push(...)", "Each success becomes tomorrow's regression test."],
    ["passesGate", "The build fails if any category gets worse than its baseline."],
  ]),
  "async-checkpoint": mod("async-checkpoint.ts", "Saving without stopping training", "Writing a large checkpoint can take minutes. Training should only pause for the copy.", [
    ["JSON.stringify(state)", "The copy. It stands for moving tensors to host memory, and this is the only part that blocks."],
    ["this.inFlight.then(...)", "Writes one at a time, so a slow disk can't pile up saves."],
    ["COMMIT", "Written last. A checkpoint without it is half-written and gets ignored on restart."],
  ]),
  "prompt-builder": mod("prompt-builder.ts", "Assembling a prompt", "A prompt is a program with a structure. Keep it in code, so you can test and version it.", [
    ["parts = [opts.task]", "Rules first."],
    ["opts.schema", "States the output format, which later gets checked by the guard."],
    ["Input: ... Output:", "The real input goes last, in the same shape as the examples."],
  ]),
  "clip-loss": mod("clip-loss.ts", "CLIP's training loss", "It teaches images and captions to share one vector space.", [
    ["normalise", "Compares direction only, not length."],
    ["temperature", "Sharpens the distribution, and 0.07 is CLIP's starting value."],
    ["crossEntropy(transpose)", "Symmetric: each image finds its caption, and each caption its image."],
  ]),
  "paged-scores": mod("paged_scores_kernel.py", "Attention over paged memory", "A Triton kernel that follows the block table rather than assuming contiguous memory.", [
    ["tl.load(table_ptr + logical)", "The indirection that paging adds."],
    ["physical * BLOCK_TOKENS * HEAD_DIM", "Turns a block number into an offset in the pool."],
  ]),
  "triton-softmax": mod("triton_softmax.py", "A fused softmax in Triton", "You write one block of work, and Triton compiles it for the GPU.", [
    ["tl.program_id(0)", "Each parallel program handles one row."],
    ["x - tl.max(x, axis=0)", "Max, exp and sum run in one pass, with no extra trips to memory. That's the point of fusion."],
    ["mask", "Handles rows that don't fill a power-of-two block."],
  ]),
  "ray-serve": mod("ray_serve_app.py", "Serving with Ray Serve", "This scales replicas with load and restarts unhealthy ones.", [
    ["target_ongoing_requests", "Ray adds replicas when each one holds more than this."],
    ["max_ongoing_requests", "Back-pressure: beyond this, requests queue rather than run out of GPU memory."],
    ["check_health", "Generates one token, which proves the GPU works, and not merely the process."],
  ]),
  "train-sbatch": mod("train.sbatch", "A training job that survives preemption", "Long jobs outlive their time limit. This one saves and goes back in the queue.", [
    ["--signal=B:USR1@300", "Warns the script 5 minutes before the time limit."],
    ["trap 'scontrol requeue ...'", "On the warning, it requeues, then stops training cleanly."],
    ["--resume-from-latest", "The next run continues from the last complete checkpoint."],
  ]),

  /* ---------- protocols ---------- */
  "p-dhcp": proto("dhcp.ts", "Decoding a DHCP packet", "A test runs this against the Discover packet on this page.", [
    ["b.subarray(28, 28 + b[2])", "The hardware address. Byte 2 says how long it is: 6 for Ethernet."],
    ["0x63825363", "The magic cookie that separates DHCP from older BOOTP."],
    ["options.set(b[i], ...)", "Type, length, value. Option 53 holds the message type."],
  ]),
  "p-ip": proto("ip.ts", "Decoding an IPv4 header, and forwarding it", "This reads the page's header, verifies its checksum, then does what a router does.", [
    ["(b[0] & 0x0f) * 4", "The low four bits count 32-bit words, so 5 means 20 bytes."],
    ["(flags & 0x1fff) * 8", "The fragment offset is stored in units of 8 bytes."],
    ["internetChecksum(...) === 0", "A correct header sums to zero, checksum included."],
    ["function forward", "Lowers TTL, and must then recompute the checksum. TTL is what stops packets looping forever."],
  ]),
  "p-icmp": proto("icmp.ts", "Building and reading ping", "Ping is this one packet, sent and echoed back.", [
    ["p[0] = 8", "Type 8 is a request, and the reply is type 0."],
    ["view.setUint16(2, internetChecksum(p))", "The checksum is computed while its own field is zero."],
    ["isTimeExceeded", "Traceroute sends TTL 1, 2, 3 and reads who replies with this."],
  ]),
  "p-udp": proto("udp.ts", "Decoding a UDP datagram", "The whole header is 8 bytes, and it includes no delivery guarantee. Reliability is the application's job.", [
    ["length < 8", "Never trust a length field from the network."],
    ["queryWithRetry", "What a DNS client does: resend until answered, then give up."],
  ]),
  "p-dns": proto("dns.ts", "Encoding and decoding DNS", "This parses the Query and Response on this page, including the compression pointer.", [
    ["out.push(label.length, ...)", "Names go on the wire as length-prefixed labels, with no dots."],
    ["(len & 0xc0) === 0xc0", "Two high bits mark a pointer to a name earlier in the packet."],
    ["next === -1", "The record continues after the first pointer, not after the place it points to."],
    ["jumps < 32", "A hostile packet can point at itself. Without this limit, the parser would hang."],
  ]),
  "p-tcp": proto("tcp.ts", "Decoding a TCP header", "This reads the SYN on this page, including its options.", [
    ["(b[12] >> 4) * 4", "The data offset says where options end."],
    ["kind === 1", "NOP is one byte with no length. Every other option has a length byte."],
    ["nextSeq", "SYN and FIN each use a sequence number, which is why the SYN-ACK acknowledges seq + 1."],
    [">>> 0", "Sequence numbers wrap at 2^32."],
  ]),
  "p-tls": proto("tls.ts", "Reading the server name from a ClientHello", "Load balancers route on this without decrypting anything. It's also why the name is visible on the network.", [
    ["5 + 4 + 2 + 32", "Skips the record header, handshake header, version and random."],
    ["i += 1 + b[i]", "Variable-length fields start with their own length, so you walk them one by one."],
    ["type === 0", "Extension 0 is the server name, and 43 lists supported versions."],
  ]),
  "p-http": proto("http.ts", "Parsing an HTTP/1.1 request", "HTTP/1.1 is plain text, and this parses the request on this page.", [
    ["text.indexOf(\"\\r\\n\\r\\n\")", "A blank line ends the headers."],
    ["toLowerCase()", "Header names ignore case, and a parser that forgets this breaks in strange ways."],
    ["content-length", "Says exactly where the body ends, which allows several requests on one connection."],
  ]),
  "p-https": proto("https.ts", "What an observer sees in HTTPS", "An encrypted record has a small visible header, then opaque bytes.", [
    ["body.subarray(-16)", "The AEAD tag. A changed byte makes decryption fail."],
    ["recordNonce", "XORs a counter into the IV, so a nonce never repeats. Reusing one would break the encryption."],
  ]),
  "p-smtp": proto("smtp.ts", "Parsing SMTP replies", "Mail servers talk in numbered lines, and the first digit says what to do.", [
    ["last[3] === \" \"", "A hyphen means more lines follow, and a space means this is the last."],
    ["code >= 400 && code < 500", "Temporary, so queue and retry. 5xx is permanent."],
    ["dotStuff", "A lone dot ends a message, so body lines starting with a dot get escaped."],
  ]),
  "p-pop3": proto("pop3.ts", "Reading POP3", "It's one of the simplest protocols on the internet, and its delete rule is worth copying.", [
    ["line.startsWith(\"+OK\")", "Only two possible statuses."],
    ["quit()", "Deletes apply only at QUIT, so a dropped connection deletes nothing."],
  ]),
  "p-imap": proto("imap.ts", "Matching IMAP replies to commands", "Tags let several commands run at once on one connection.", [
    ["tag === \"*\"", "Untagged lines are data, and they can arrive at any time."],
    ["\"a\" + String(this.next++)", "Each command gets a unique tag."],
    ["this.untagged = []", "The tagged reply ends that command, and collects the data that came with it."],
  ]),
  "p-ftp": proto("ftp.ts", "Decoding FTP's passive reply", "FTP uses a second connection for data, and the address travels as text.", [
    ["p1 * 256 + p2", "The port needs two bytes, so it's written as two numbers."],
    ["replyClass", "The first digit: 1xx means the transfer has only started."],
  ]),
  "p-ssh": proto("ssh.ts", "Reading SSH framing", "After a text banner, everything is framed binary, encrypted once keys are agreed.", [
    ["parseBanner", "Both sides send this first, and it's the only plain-text part."],
    ["4 + packetLength - padding", "Locates the payload inside the frame."],
    ["paddingFor", "Hides the exact message length, and keeps the packet aligned to the cipher's blocks."],
  ]),
  /* ---------- the AI interview paths ---------- */
  "ai-hint-climb": iv("HintLadder.ts", "climb", "The rule that keeps you honest", "This is the whole ladder as code. It answers one question: have you earned the next hint?", [
    ["tried.length < 40", "A rough test that you wrote something real. 'help' doesn't pass."],
    ["tried === state.lastAttempt", "Asking again without changing anything earns nothing."],
    ["state.level >= HINT_LEVELS.length - 1", "The ladder ends. After this, you read a solution and rebuild it tomorrow."],
  ]),
  "ai-hint-prompt": iv("HintLadder.ts", "prompt", "The prompt it builds", "The same rules, as text you can send to any assistant.", [
    ["Never write the solution", "Goes in every request, because long chats drift away from earlier rules."],
    ["state.lastAttempt", "Hints depend on context. Without your attempt, the model can only guess where you're stuck."],
    ["HINT_LEVELS[state.level]", "Asks for one level of help and no more."],
  ]),
  "ai-plant": iv("BugPlanter.ts", "plant", "Planting the bugs", "Finds the places a small change is possible, then picks a few using a repeatable random order.", [
    ["function seeded(seed: number)", "A tiny random generator. Math.random can't be repeated, and this can."],
    ["text.trim().startsWith(\"//\")", "Skips comments, because changing a comment plants no bug."],
    ["planted.some((p) => p.line === pick.line + 1)", "At most one bug per line, which makes scoring fair."],
    ["planted.sort", "The answer key comes out in line order."],
  ]),
  "ai-plant-score": iv("BugPlanter.ts", "score", "Scoring your review", "Three numbers tell you more than a pass or fail.", [
    ["falseAlarms", "Lines you flagged that were fine. In a live round, these burn time."],
    ["missed", "The bugs that would have reached production."],
  ]),
  "ai-talk": iv("TalkTrack.ts", "measure", "Measuring a recording", "Takes transcript segments and works out what an interviewer would feel.", [
    ["const REASONS", "Words that signal why. It's a rough marker, but it shows a real pattern across a whole round."],
    ["s.start - segments[i - 1].end", "The gap between segments is your silence."],
    ["if (gap > 3) runStart = s.start", "A pause of over 3 seconds ends a monologue. That's the interviewer's chance to step in."],
    ["segments.length === 0", "An empty transcript means a recording problem, so it stops with a clear error."],
  ]),
  "ai-talk-advice": iv("TalkTrack.ts", "advice", "Turning numbers into advice", "Each number maps to one thing you can do in the next round.", [
    ["r.longSilences > 0", "Long silences are fine if you announce them first."],
    ["r.reasonsPerMinute < 1", "The most common gap: saying what you do, but not why."],
  ]),
  "ai-job-map": iv("JobPostMap.ts", "map", "Counting what the post asks for", "A word count with care taken over word edges, so 'rag' doesn't match 'fragrance' or 'storage'.", [
    ["(^|[^a-z0-9])", "The match must start at a word edge."],
    ["(?![a-z0-9])", "And must end at one."],
    ["escape(k)", "Keeps a keyword such as 'c++' from being read as a regular expression."],
  ]),
  "ai-job-gaps": iv("JobPostMap.ts", "gaps", "From demand to a study order", "Combines what they want with what you lack.", [
    ["hits * (5 - (myScores[skill] ?? 1))", "A skill you haven't scored counts as weak, since not knowing is a reason to look."],
    [".filter((x) => x.priority > 0)", "A skill at 5 of 5 drops off the list, however often it's mentioned."],
  ]),
  "ai-ledger-weakest": iv("MistakeLedger.ts", "weakest", "What the ledger tells you", "Two views of the same rows: which topic is weak now, and which habit keeps coming back.", [
    ["0.5 ** (ageDays / halfLifeDays)", "A miss loses half its weight every 7 days. A miss from today counts 1, and one from two weeks ago counts 0.25."],
    ["repeatedCauses", "Counts causes without any decay, since a habit that keeps showing up matters however old the first case is."],
  ]),
  "ai-ledger-anki": iv("MistakeLedger.ts", "anki", "Exporting to flashcards", "Anki imports tab-separated text, one card per line.", [
    ["replace(/[\\t\\r\\n]+/g, \" \")", "A stray tab or line break inside a field would split the row and scramble the card."],
  ]),
  "ai-log-bug": iv("LogTriage.ts", "bug", "Stage 1: the code you inherit", "A parser with a real bug. Read it before you scroll on.", [
    ["line.split(\"|\")", "Splits on every separator, but the message itself may contain one."],
    ["const [at, level, service, message]", "Takes four parts and silently drops the rest. No error appears, and the data is just wrong."],
    ["Number(at)", "A bad timestamp becomes NaN, which sails through."],
  ]),
  "ai-log-fix": iv("LogTriage.ts", "fix", "Stage 1: the fix", "Fixed by hand. A bug this small is quicker to fix than to explain to an assistant.", [
    ["parts.slice(3).join(\"|\")", "Puts the message back together, separators included."],
    ["Number.isFinite(at)", "Rejects NaN and Infinity, so a bad line can't poison later sorting."],
  ]),
  "ai-log-draft": iv("LogTriage.ts", "draft", "Stage 2: the assistant's first draft", "It's short, clean and passes the obvious test. It also has two bugs. Our tests prove both.", [
    ["const counts: Record<string, number> = {}", "A plain object inherits keys. A service named 'constructor' finds a function there, so the count becomes a string."],
    ["counts[e.service] || 0", "This is where it happens: the inherited function is truthy, so it never falls back to 0."],
    ["sort((a, b) => b[1] - a[1])", "Equal counts keep input order, so the same data in a different order gives a different answer."],
  ]),
  "ai-log-reviewed": iv("LogTriage.ts", "reviewed", "Stage 2: after your review", "A small change, and the kind interviewers want to see you catch.", [
    ["new Map<string, number>()", "A Map starts empty, with no inherited keys."],
    ["b[1] - a[1] || a[0].localeCompare(b[0])", "A tie-break makes the output repeatable, which also makes it testable."],
    ["entries: Iterable<LogEntry>", "Accepts a list or a stream, which sets up stage 3."],
  ]),
  "ai-log-fast": iv("LogTriage.ts", "fast", "Stage 3: when the big file arrives", "With m services, sorting costs O(m log m). A heap of size k costs O(m log k), which matters when m is large and k is small.", [
    ["lines: Iterable<string>", "Reads one line at a time, so a huge file never has to fit in memory. Only the counts do."],
    ["ranksLater", "Puts the worst of the current top k at the root, ready to be replaced."],
    ["ranksLater(heap[0], item)", "A new item enters only if it beats the worst one kept."],
    ["heap.sort(byCountThenName)", "A heap isn't sorted, so the k winners get a final sort."],
  ]),
  "ai-cache-inherited": iv("TtlCache.ts", "inherited", "The file you're handed", "Meant to be an LRU cache with expiry. Find three bugs before reading the notes. Nothing crashes, which is what makes them hard.", [
    ["item.expires <= this.now()", "Returns undefined, but leaves the dead item in the map, where it keeps taking space."],
    ["return item.value", "Doesn't mark the key as recently used, so this is really first-in, first-out."],
    ["this.items.size >= this.max", "Also runs when overwriting an existing key, evicting an innocent key though the size wouldn't grow."],
  ]),
  "ai-cache-fixed": iv("TtlCache.ts", "fixed", "The fixed version", "All three fixes come from one fact: a Map remembers insertion order.", [
    ["this.items.delete(key)", "Delete then set moves a key to the newest position. It also handles expired items and overwrites."],
    ["this.items.keys().next().value", "The first key in the Map is the least recently used one."],
  ]),
  "ai-fit": iv("TokenBudget.ts", "fit", "Fitting a prompt into the context", "Your prompt, the retrieved text and the model's reply all share one limit.", [
    ["text.length / 4", "The usual English rule of thumb. Fine for planning, but use a real token counter before sending."],
    ["contextLimit - replyTokens - estimateTokens(fixedText)", "Reserve the reply first. Forgetting this is a classic cause of cut-off answers."],
    ["dropped.push(c.id)", "Records what got left out, so a bad answer can be traced back to it."],
  ]),
  "ai-cost": iv("TokenBudget.ts", "cost", "The cost of a request", "The sum every LLM screen expects you to do in your head.", [
    ["inputTokens - cachedTokens", "Cached tokens are billed at their own lower rate, so split them out first."],
    ["/ 1_000_000", "Prices are quoted per million tokens."],
    ["costPerRequest * requestsPerDay * 30", "Monthly cost is what makes a design decision real."],
  ]),
  "ai-chunk": iv("Retrieval.ts", "chunk", "Splitting documents", "Search finds chunks rather than whole documents. Too big blurs the meaning, and too small loses the context.", [
    ["i += size - overlap", "Each chunk starts a little before the last one ended."],
    ["overlap >= size", "This would never move forward, so it's refused up front."],
    ["i + size >= words.length", "Stops once the last word is covered, so no tiny leftover chunk appears."],
  ]),
  "ai-cosine": iv("Retrieval.ts", "cosine", "Cosine similarity", "The basic measure for comparing two embeddings.", [
    ["dot / Math.sqrt(na * nb)", "Dividing by both lengths leaves only the angle between the vectors."],
    ["na && nb", "An all-zero vector has no direction, so it returns 0 instead of NaN."],
  ]),
  "ai-rrf": iv("Retrieval.ts", "rrf", "Hybrid search with rank fusion", "Keyword search finds exact terms like error codes, and vectors find meaning. You usually want both.", [
    ["1 / (k + rank + 1)", "Uses only position, so the two scoring scales never have to be compared."],
    ["k = 60", "The constant commonly used for this method. It stops first place from dominating."],
    ["a[0].localeCompare(b[0])", "Ties break by id, so the result is repeatable."],
  ]),
  "ai-metrics": iv("Retrieval.ts", "metrics", "Measuring retrieval", "Measure this before you look at answers. If the right text never arrives, no prompt can help.", [
    ["r.retrieved.slice(0, k)", "Only what actually reaches the prompt counts."],
    ["r.relevant.length", "Recall needs labelled answers, so you need a labelled set."],
    ["1 / (at + 1)", "First place scores 1, second 0.5, and a miss 0."],
  ]),
  "ai-agent-loop": iv("AgentLoop.ts", "loop", "The agent loop", "Ask the model, run the tool it picks, add the result, repeat. The safety lives here, in plain code.", [
    ["step < limits.maxSteps", "A hard stop. Without it, a confused agent loops and spends money all night."],
    ["repeats > limits.maxRepeats", "Catches a common failure: the same call, with the same arguments, again and again."],
    ["trace.push(call)", "Every action is recorded, because you can't debug or evaluate what you can't see."],
  ]),
  "ai-agent-tool": iv("AgentLoop.ts", "tool", "Calling a tool safely", "Everything between what the model wants and what actually happens.", [
    ["tools.find((t) => t.name === name)", "An allow list. A model can ask for any tool, and only listed ones exist."],
    ["tool.write && !(await limits.approve(name, args))", "Anything that changes the world needs approval from outside the model."],
    ["const key = ", "The same call gets the same key, so a retry can't refund a customer twice. The tool must honour it."],
    ["error: ${(e as Error).message}", "An error becomes text the model can read and react to, and the run carries on."],
  ]),
  "ai-eval-run": iv("EvalHarness.ts", "run", "Running an eval", "A loop over labelled cases, counting passes per slice.", [
    ["report.byTag[c.tag]", "Results per slice are the point. One overall number hides too much."],
    ["ok = false; // a crash", "One bad case shouldn't end the run. It counts as a failure and you move on."],
    ["report.failures.push(c.id)", "Keep the ids. Reading failures is where the real learning happens."],
  ]),
  "ai-eval-gate": iv("EvalHarness.ts", "gate", "The release gate", "Decides whether a new version may ship, and it checks each slice.", [
    ["rate(next) < rate(base) - maxDrop", "The overall check, with a little room for noise."],
    ["for (const [tag, b] of Object.entries(base.byTag))", "A slice check. In our test, the average rises from 90% to 93% while billing falls from 90% to 50%, and this blocks it."],
    ["cases missing", "Deleting the hard cases must not count as a pass."],
  ]),
  "ai-eval-wilson": iv("EvalHarness.ts", "wilson", "How sure can you be?", "A small eval set gives a wide range. This says how wide.", [
    ["z = 1.96", "The value for a 95% interval."],
    ["(z * z) / (2 * total)", "Pulls the estimate toward the middle, which keeps small samples honest."],
  ]),
  "ai-eval-kappa": iv("EvalHarness.ts", "kappa", "Checking an LLM judge", "Raw agreement flatters a judge when most answers are good. Kappa takes out the agreement you'd get by luck.", [
    ["const chance", "How often two graders would agree just from how often each says yes."],
    ["(agree - chance) / (1 - chance)", "0 means no better than luck, and 1 means perfect."],
  ]),
  "ai-trace-diagnose": iv("TraceTriage.ts", "diagnose", "From complaint to cause", "Walks the stages in order, and reports the first one that failed.", [
    ["t.toolErrors.length > 0", "Check the plumbing first. A failed tool explains everything after it."],
    ["!t.neededDocs.some", "The right text never arrived, so no prompt change will help."],
    ["t.citedDocs.some", "It cites something it never retrieved, which means it made up the citation."],
    ["!t.answerUsedNeededDoc", "The text was there and the model ignored it. Now the prompt is worth changing."],
  ]),
  "ai-trace-count": iv("TraceTriage.ts", "count", "From one complaint to a priority", "Run the same check across many traces to see what to fix first.", [
    ["counts.set(f, (counts.get(f) ?? 0) + 1)", "One customer's story becomes a measurement across all of them."],
  ]),
  "ai-plan-split": iv("StudyPlan.ts", "split", "Sharing out your days", "Time goes where a round counts most and you're weakest.", [
    ["g.weight * Math.max(6 - g.score, 1)", "Even a strong round gets some time, so it never drops to zero need."],
    ["b.exact - b.whole", "Largest remainder: leftover days go to the rounds that lost the most to rounding."],
  ]),
  "ai-plan-plan": iv("StudyPlan.ts", "plan", "Building the schedule", "Baseline, training, a stretch with AI off, then rest.", [
    ["Math.round(days * 0.25)", "The last quarter runs with AI off, to prove that the skill stuck."],
    ["i % 4 === 3", "Every fourth training day is a full mock."],
    ["queue.push(queue.splice", "Rotates rounds, so you don't do five days of one thing."],
  ]),
  "ai-gate": iv("MockGate.ts", "gate", "Are you ready?", "Scores with AI can flatter you. This compares them with your scores without it.", [
    ["aiOff.length < 3", "One good day proves little. It needs three AI-off mocks."],
    ["v < 3", "One very weak skill can sink a round even when the average looks fine."],
    ["gap > 0.5", "If you score much higher with AI, the AI is doing the work."],
  ]),
  "ai-session-step": iv("CoachSession.ts", "step", "The interview as a state machine", "Your code decides where the interview is. The model only writes the words.", [
    ["export function step(s: Session, e: CoachEvent): Session", "A pure function, so the tests can replay a full interview with no model at all."],
    ["probes >= MAX_PROBES", "Ends the probing after three questions, rather than trusting the model to stop."],
    ["secondsLeft === 0", "When time runs out, it moves to scoring, like a real interviewer."],
    ["s.phase === \"solve\" ? { ...s, hints: s.hints + 1 } : s", "Hints only count while solving."],
  ]),
  "ai-prompt-system": iv("CoachPrompt.ts", "system", "The interviewer's rules", "Short rules, plus one task per phase.", [
    ["Never give the solution", "Models want to help. Unless told otherwise, they'll hand over the answer."],
    ["inside <candidate> tags", "The candidate's text is data. Saying so makes it harder for them to rewrite the rules."],
    ["PHASE_TASK", "The phase comes from your state machine, not from the model's memory."],
  ]),
  "ai-prompt-build": iv("CoachPrompt.ts", "build", "Building the request", "Decides what the model can see, and leaves the answer key out.", [
    ["replaceAll(\"<\", \"&lt;\")", "Stops a candidate closing the tag and posing as the system."],
    ["question.prompt", "Only the question goes in. If the key were here, a clever candidate could talk the model into revealing it."],
  ]),
  "ai-score-parse": iv("Scorer.ts", "parse", "Checking the score", "Never trust a model's structured output until you've checked it.", [
    ["JSON.parse(raw)", "The first check: is it JSON at all?"],
    ["Number.isInteger(line.score)", "Keeps scores to whole numbers from 1 to 5."],
    ["transcript.includes(line.evidence)", "The most useful line here. Evidence must be real words from the transcript, so a model can't invent a reason for a score."],
  ]),
  "ai-score-retry": iv("Scorer.ts", "retry", "One retry, then nothing", "Give the model one chance to fix it, and tell it what was wrong.", [
    ["attempt < 2", "A strict limit. Endless retries cost money and rarely help."],
    ["Your last reply was rejected", "Sending the reason back gives the retry something to fix."],
    ["return null", "Showing no score is better than showing a made-up one."],
  ]),
  "ai-coach-agree": iv("CoachEval.ts", "agree", "Does it score like a person?", "Score some of your mocks by hand, then compare.", [
    ["Math.abs(r.human - r.model) <= 1", "People don't agree exactly either, so one point apart is a fair test."],
    ["bias", "The average difference, with its sign. Positive means it's too kind."],
  ]),
  "ai-coach-gate": iv("CoachEval.ts", "gate", "When to trust your coach", "The same idea as a release gate, for a project of your own.", [
    ["rows.length < 20", "Too few labels can't tell you much."],
    ["a.bias > 0.5", "A flattering coach sends you to the interview overconfident, so it gets its own limit."],
  ]),
};

/** Code per lesson day, in reading order. */
export const LESSON_CODE: Record<number, string[]> = {
  1: ["save"],
  2: ["rows", "transaction", "save"],
  3: ["hub", "worker"],
  4: ["contract", "sync-run", "sync-results", "sync-page", "backoff"],
  5: ["field-merge", "sync-page"],
  6: ["server-apply", "server-pull", "notifier"],
  7: ["parts-plan", "parts-upload"],
  8: ["priyas-day"],
  9: ["row-states", "row-flow", "row-diff"],
  10: ["chat-log", "chat-thread"],
  11: ["order-states", "order-service", "order-screen", "token-refresh"],
  12: ["feed-sample", "feed-page", "startup-budget"],
  13: ["release-gate", "telemetry", "flag-evaluator"],
  14: ["location-batcher", "live-store", "priyas-day"],
};

/** Extra explained code for other pages. */
export const PAGE_CODE: Record<string, string[]> = {
  "/series/background-sync": ["save", "hub", "worker"],
  "/series/sqlite": ["rows", "transaction"],
  "/series/conflicts": ["field-merge", "sync-page"],
  "/series/uploads": ["parts-plan", "parts-upload"],
  "/series/rn": ["row-flow", "worker"],
  "/series/backend": ["server-apply", "server-pull", "notifier", "backoff"],
  "/series/interview": ["contract", "priyas-day"],
  "/deep/frontend-arch": ["row-states", "row-flow", "row-diff"],
  "/deep/sync-engine": ["contract", "sync-run", "sync-results", "sync-page", "backoff"],
  "/deep/transfer-manager": ["parts-plan", "parts-upload"],
  "/deep/background-layer": ["hub", "worker"],
  "/deep/server-sync": ["server-apply", "field-merge", "server-pull", "notifier"],
  "/deep/llm-internals": ["kv-size", "paged-blocks"],
  "/deep/inference-accel": ["continuous-batching", "speculative-accept", "prefix-cache"],
  "/deep/embeddings": ["hnsw", "bm25", "rrf"],
  "/deep/adapt-models": ["lora-params", "lora-linear", "merge-adapter", "dpo-loss"],
  "/deep/agents-mcp": ["output-guard", "moderation-gate"],
  "/deep/llm-integration": ["prompt-builder", "context-budget", "output-guard"],
  "/deep/ai-dev-accel": ["judge-calibration", "red-team"],
  "/interview/offline-field": ["priyas-day", "save", "sync-run", "field-merge", "parts-upload"],
  "/interview/chat": ["chat-log", "chat-thread", "notifier"],
  "/interview/feed": ["feed-page", "feed-sample", "row-diff"],
  "/interview/payments": ["order-states", "order-service", "order-screen"],
  "/interview/booking": ["slot-booking"],
  "/interview/release": ["release-gate", "telemetry", "flag-evaluator", "startup-budget"],
  "/interview/ai-assistant": ["prompt-builder", "output-guard", "moderation-gate"],
  "/interview/on-device": ["nf4-memory", "kv-size"],
  "/interview/rag": ["rrf", "rerank-pipeline", "parent-child", "context-budget"],
  "/interview/llm-serving": ["kv-size", "continuous-batching", "prefix-cache", "ray-serve"],
  "/interview/ai-evals": ["ragas-metrics", "judge-calibration", "red-team"],
  "/modules/mobile-startup-performance": ["startup-budget", "row-flow"],
  "/modules/mobile-observability-rollouts": ["release-gate", "telemetry"],
  "/modules/mobile-security-tokens": ["token-refresh"],
  "/modules/notification-platform-mobile": ["notify-route", "notifier"],
  "/modules/live-location-tracking": ["live-store"],
  "/modules/unsloth-fast-gradient": ["lora-params"],
  "/modules/triton-compiler-internals": ["triton-softmax"],
  "/modules/nccl-socket-transport": ["ring-allreduce"],
};

/** A module's existing sample → its explanation. */
export const FILE_DOC: Record<string, string> = Object.fromEntries(
  Object.entries(CODE).filter(([, d]) => d.dir === "modules").map(([id, d]) => [d.file, id])
);
