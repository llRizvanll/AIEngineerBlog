import java.io.IOException
import java.util.Collections
import java.util.concurrent.atomic.AtomicInteger
import kotlin.system.exitProcess
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.Duration.Companion.seconds
import kotlin.time.TestTimeSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.cancel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

// Tests for src/content/mobile/*.kt. Run: npm run test:mobile
var failures = 0
fun check(ok: Boolean, name: String) {
  if (ok) println("  ✓ $name") else { failures++; println("  ✗ $name") }
}

class Offline : IOException("offline")

fun main(): Unit = runBlocking {
  // ───────────── LruCache
  println("LruCache")
  run {
    val c = LruCache<String, Int>(costLimit = 3)
    c.put("a", 1); c.put("b", 2); c.put("c", 3)
    c["a"]                                              // a is now the most recent
    c.put("d", 4)                                       // evicts b, the least recent
    check(c["b"] == null && c["a"] == 1 && c.size == 3, "evicts least recently used")
    c.put("c", 9, cost = 3)                             // update grows cost → evicts others
    check(c.totalCost <= 3 && c["c"] == 9, "respects cost limit on update")
    c.remove("c")
    check(c.size == 0 && c.totalCost == 0, "remove resets cost")
    c.put("big", 1, cost = 10)
    check(c.size == 0 && c.totalCost == 0, "an item bigger than the budget evicts itself")
    c.put("x", 1); c.clear()
    check(c.size == 0 && c["x"] == null, "clear empties everything")
  }

  // ───────────── ImageLoader
  println("ImageLoader")
  run {
    val calls = AtomicInteger()
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    val loader = ImageLoader(fetcher = { url -> calls.incrementAndGet(); delay(50); url.toByteArray() }, scope = scope)
    val url = "https://cdn.example.com/a.jpg"
    val results = coroutineScope { (1..20).map { async(Dispatchers.Default) { loader.load(url) } }.awaitAll() }
    check(results.size == 20 && results.map { String(it) }.toSet() == setOf(url), "20 concurrent callers get the same bytes")
    check(calls.get() == 1, "coalesced into one download")
    loader.load(url)
    check(calls.get() == 1, "second request served from memory")

    val failing = AtomicInteger()
    val flaky = ImageLoader(fetcher = { if (failing.incrementAndGet() == 1) throw IOException("boom") else byteArrayOf(1) }, scope = scope)
    val first = runCatching { flaky.load("u") }
    check(first.exceptionOrNull() is IOException, "a failed download reaches the caller")
    check(runCatching { flaky.load("u") }.getOrNull()?.size == 1, "the URL can be retried after a failure")

    val disk = object : DiskCache {
      val map = HashMap<String, ByteArray>()
      override suspend fun get(key: String) = map[key]
      override suspend fun put(key: String, bytes: ByteArray) { map[key] = bytes }
    }
    val net = AtomicInteger()
    val withDisk = ImageLoader(fetcher = { net.incrementAndGet(); byteArrayOf(9) }, scope = scope, disk = disk)
    withDisk.load("d"); withDisk.clearMemory(); withDisk.load("d")
    check(net.get() == 1 && disk.map.containsKey("d"), "after clearing memory, disk serves the image")
    scope.cancel()
  }

  // ───────────── Backoff
  println("Backoff")
  run {
    check(Backoff.delay(3, random = { it.endInclusive }) == 4.seconds, "attempt 3 caps at 0.5s · 8 = 4s")
    check(Backoff.delay(30, random = { it.endInclusive }) == 60.seconds, "never exceeds the cap")
    check(Backoff.delay(5, random = { it.start }) == Duration.ZERO, "full jitter can be zero")
    check(Backoff.delay(-4, random = { it.endInclusive }) == 500.milliseconds, "negative attempts are clamped")

    class Flaky(override val retryAfter: Duration?) : Exception(), RetryAfterProviding
    var attempts = 0
    val slept = mutableListOf<Duration>()
    val value = withRetry(maxAttempts = 4, sleep = { slept += it }) {
      attempts++
      if (attempts < 3) throw Flaky(2.seconds)
      "ok"
    }
    check(value == "ok" && attempts == 3, "retries until success")
    check(slept == listOf(2.seconds, 2.seconds), "honours Retry-After")

    var tries = 0
    val fatal = runCatching { withRetry(isRetryable = { false }, sleep = {}) { tries++; error("400") } }
    check(fatal.isFailure && tries == 1, "non-retryable errors fail immediately")
  }

  // ───────────── Outbox
  println("Outbox")
  class MemoryStore : OutboxStore {
    var saved: List<PendingOp> = emptyList()
    override suspend fun load() = saved
    override suspend fun save(ops: List<PendingOp>) { saved = ops }
  }
  class ScriptedTransport(script: List<Result<PushResult>> = emptyList()) : SyncTransport {
    private val script = ArrayDeque(script)
    val pushed = mutableListOf<String>()
    override suspend fun push(op: PendingOp): PushResult {
      pushed += op.id
      return script.removeFirst().getOrThrow()
    }
  }
  run {
    val store = MemoryStore()
    val ops = (0 until 3).map { PendingOp(entity = "note", payload = "v$it") }
    val transport = ScriptedTransport(listOf(
      Result.success(PushResult.Applied), Result.failure(Offline()),                   // first drain
      Result.success(PushResult.Duplicate), Result.success(PushResult.Rejected("bad")), // second drain
    ))
    val outbox = Outbox(store, transport)
    ops.forEach { outbox.enqueue(it) }
    check(store.saved.size == 3, "enqueue persists before returning")
    check(outbox.drain() == Outbox.DrainOutcome.Offline, "stops when offline")
    check(store.saved.map { it.id } == ops.drop(1).map { it.id }, "applied op removed, order kept")
    check(outbox.drain() == Outbox.DrainOutcome.Drained, "drains the rest")
    check(outbox.parkedOps().map { it.id } == listOf(ops[2].id), "rejected op parked for the user")
    check(transport.pushed == listOf(ops[0].id, ops[1].id, ops[1].id, ops[2].id), "retries the same op id (idempotent)")
    check(Outbox(store, ScriptedTransport()).pendingCount() == 0, "nothing left after a full drain")
  }
  run {
    val store = MemoryStore()
    val outbox = Outbox(store, ScriptedTransport(listOf(Result.success(PushResult.Retryable(5.seconds)))))
    outbox.enqueue(PendingOp(entity = "job", payload = "{}"))
    check(outbox.drain() == Outbox.DrainOutcome.Backoff(5.seconds), "server Retry-After becomes the backoff")
    check(store.saved.first().attempts == 1, "attempt count is persisted")
  }
  run {
    val store = MemoryStore()
    val outbox = Outbox(store, ScriptedTransport(listOf(Result.success(PushResult.Retryable(null)))), maxAttempts = 1)
    outbox.enqueue(PendingOp(entity = "job", payload = "{}"))
    check(outbox.drain() == Outbox.DrainOutcome.Drained && outbox.parkedOps().size == 1, "too many attempts parks the op")
  }
  run {
    val gate = Mutex(locked = true)
    val slow = SyncTransport { gate.withLock { PushResult.Applied } }
    val outbox = Outbox(MemoryStore(), slow)
    outbox.enqueue(PendingOp(entity = "a", payload = ""))
    val first = async(Dispatchers.Default) { outbox.drain() }
    delay(50)
    check(outbox.drain() == Outbox.DrainOutcome.AlreadyRunning, "a second drain is refused (single flight)")
    gate.unlock()
    check(first.await() == Outbox.DrainOutcome.Drained, "the first drain completes")
  }
  run {
    val store = MemoryStore().apply { saved = listOf(PendingOp(entity = "old", payload = "")) }
    val outbox = Outbox(store, ScriptedTransport())
    outbox.enqueue(PendingOp(entity = "new", payload = ""))
    check(store.saved.map { it.entity } == listOf("old", "new"), "ops from before a restart come first")
  }

  // ───────────── SearchViewModel
  println("SearchViewModel")
  run {
    val calls = Collections.synchronizedList(mutableListOf<String>())
    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    val vm = SearchViewModel(scope, debounce = 60.milliseconds) { q -> calls += q; listOf("$q result") }
    for (q in listOf("s", "sw", "swi", "kotlin")) { vm.onQueryChanged(q); delay(5) }
    delay(250)
    check(calls == listOf("kotlin"), "only the last keystroke hits the network")
    check(vm.ui.value.results == listOf("kotlin result") && !vm.ui.value.loading, "shows results for the latest query")
    vm.onQueryChanged("a"); delay(30)
    check(vm.ui.value.results.isEmpty(), "short query clears results")

    val slowCalls = AtomicInteger()
    val slow = SearchViewModel(scope, debounce = 10.milliseconds) { q -> slowCalls.incrementAndGet(); delay(if (q == "old") 200 else 10); listOf(q) }
    slow.onQueryChanged("old"); delay(60)               // "old" is in flight
    slow.onQueryChanged("new"); delay(300)
    check(slow.ui.value.results == listOf("new") && slowCalls.get() == 2, "a stale response never overwrites a newer one")

    val broken = SearchViewModel(scope, debounce = 10.milliseconds) { throw IOException("down") }
    broken.onQueryChanged("query"); delay(100)
    check(broken.ui.value.error != null && !broken.ui.value.loading, "errors show a message")
    scope.cancel()
  }

  // ───────────── FeedPaginator
  println("FeedPaginator")
  data class Post(val id: Int)
  run {
    val pages = mapOf(
      null to FeedPage(listOf(Post(1), Post(2)), "c1"),
      "c1" to FeedPage(listOf(Post(2), Post(3)), null),   // id 2 shifted into page 2
    )
    val fetches = AtomicInteger()
    val feed = FeedPaginator<Post, Int>(idOf = { it.id }) { cursor -> fetches.incrementAndGet(); pages.getValue(cursor) }
    feed.loadNext(); feed.loadNext()
    check(feed.items.value.map { it.id } == listOf(1, 2, 3), "duplicates from a shifted feed are dropped")
    check(feed.state.value == FeedPaginator.State.End, "stops at the last page")
    feed.loadNext()
    check(feed.items.value.size == 3 && fetches.get() == 2, "no requests after the end")
    feed.refresh()
    check(feed.items.value.map { it.id } == listOf(1, 2) && feed.state.value == FeedPaginator.State.Idle, "refresh starts over")
    feed.onItemShown(0, prefetchDistance = 1)
    check(fetches.get() == 3, "rows far from the end do not prefetch")
    feed.onItemShown(1, prefetchDistance = 1)
    check(feed.items.value.size == 3, "a row near the end loads the next page")
  }
  run {
    var calls = 0
    val feed = FeedPaginator<Post, Int>(idOf = { it.id }) {
      calls++
      if (calls == 1) throw IOException("offline")
      FeedPage(listOf(Post(7)), null)
    }
    feed.loadNext()
    check(feed.state.value is FeedPaginator.State.Failed, "a failure is shown with a retry")
    feed.loadNext()
    check(feed.items.value == listOf(Post(7)), "retry loads from the same cursor")
  }

  // ───────────── ResumableUploader
  println("ResumableUploader")
  run {
    val lock = Mutex()
    val failOnce = mutableSetOf(5)
    val uploaded = mutableListOf<Int>()
    val inFlight = AtomicInteger()
    var maxInFlight = 0
    val parts = PartUploader { _, part, bytes ->
      val now = inFlight.incrementAndGet()
      lock.withLock { maxInFlight = maxOf(maxInFlight, now) }
      try {
        delay(10)
        if (lock.withLock { failOnce.remove(part) }) throw Offline()
        lock.withLock { uploaded += part }
        "etag-$part-${bytes.size}"
      } finally {
        inFlight.decrementAndGet()
      }
    }
    var last: UploadPlan? = null
    val uploader = ResumableUploader(parts, { last = it }, maxConcurrent = 3)
    val file = ByteArray(10_000) { 7 }
    val plan = UploadPlan(fileId = "f1", size = file.size, partSize = 1_000)
    val first = runCatching { uploader.upload(file, plan) }
    check(first.isFailure, "first attempt fails on part 5")
    val saved = last!!
    check(!saved.isComplete && 5 !in saved.completed, "failure keeps a checkpoint without part 5")
    val before = uploaded.size
    val finished = uploader.upload(file, saved)
    check(finished.isComplete, "resume completes the upload")
    check(uploaded.size - before == saved.remaining.size, "resume uploads only missing parts")
    check(maxInFlight <= 3, "never more than 3 parts in flight")
    check(finished.completed[9] == "etag-9-1000", "last part has the right size")
    val odd = UploadPlan("f2", size = 2_500, partSize = 1_000)
    check(odd.partCount == 3 && odd.byteRange(2) == 2_000 until 2_500, "the last part can be shorter")
    check(UploadPlan("f3", size = 0, partSize = 1_000).isComplete, "a zero-byte file has nothing to upload")
  }

  // ───────────── TokenBucket and RateLimiter
  println("TokenBucket")
  run {
    val clock = TestTimeSource()
    val bucket = TokenBucket(capacity = 3.0, refillPerSecond = 1.0, clock = clock)
    val burst = (0 until 4).map { bucket.tryConsume() }
    check(burst == listOf(true, true, true, false), "allows a burst of 3 then blocks")
    check(bucket.waitTime() == 1.seconds, "knows how long to wait")
    clock += 1.seconds
    check(bucket.tryConsume(), "refills over time")
    check(!bucket.tryConsume(), "but only at the refill rate")
    clock += 1.seconds * 100
    check((0 until 4).count { bucket.tryConsume() } == 3, "never refills past capacity")
  }
  run {
    val limiter = RateLimiter(capacity = 2.0, refillPerSecond = 20.0)
    val start = System.nanoTime()
    repeat(4) { limiter.acquire() }                     // 2 immediately, then 2 more at 20/s
    val ms = (System.nanoTime() - start) / 1_000_000
    check(ms in 80..400, "callers wait their turn instead of failing ($ms ms)")
    check(runCatching { limiter.acquire(5.0) }.isFailure, "a cost above capacity is rejected")
  }

  // ───────────── ListDiff
  println("ListDiff")
  data class Row(val id: String, val title: String)
  run {
    val old = listOf("A", "B", "C", "D").map { Row(it, it) }
    val new = listOf("B", "A", "D", "E").map { Row(it, if (it == "D") "D v2" else it) }
    val d = diff(old, new) { it.id }
    check(d.deletes == listOf(2), "C deleted")
    check(d.inserts == listOf(3), "E inserted")
    check(d.moves.size == 1, "one move, not two")
    check(d.reloads == listOf(2), "changed D reloaded")
    check(diff(old, old) { it.id }.isEmpty, "identical lists produce no changes")
    check(longestIncreasingSubsequence(listOf(3, 1, 2, 5, 4)).size == 3, "LIS length")
    check(longestIncreasingSubsequence(emptyList()).isEmpty(), "LIS of nothing is empty")
    val rev = diff(old, old.reversed()) { it.id }
    check(rev.moves.size == 3 && rev.deletes.isEmpty() && rev.inserts.isEmpty(), "a full reversal keeps one row still")
  }

  println(if (failures == 0) "\nALL KOTLIN MOBILE TESTS PASSED" else "\n$failures FAILED")
  if (failures > 0) exitProcess(1)
}
