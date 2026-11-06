import java.io.IOException
import kotlin.random.Random
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.take
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.launch
import kotlinx.coroutines.yield
import programme.*

private class Swiped : IOException("swiped")

suspend fun programmeTests() {
  println("Programme: Priya's day, end to end")
  val s = priyasDay()
  val run = s.firstRun as RunOutcome.Finished
  check(run.pushed == 36 && run.conflicts == 1, "37 ops: 36 applied and 1 conflict")
  check(run.pulled == 140, "the pull returns 140 changes")
  check(s.cursorAfterRun == 88551L, "the cursor moves from c_88411 to c_88551")
  check(s.ticks == 11 && s.amber == 1, "eleven green ticks and one amber badge")
  check(s.theirs == Theirs("valve_3", "replaced", 5, "dev"), "the conflict carries Dev's value and version 5")
  check(s.writesBeforeRetry == s.writesAfterRetry, "a retried batch writes nothing")
  check(s.finalVersion == 6, "Priya's resolution reaches version 6")
  check(s.tabletSees == "leaking", "Dev's tablet ends up showing leaking")

  println("Programme: local database")
  run {
    val db = LocalDb()
    db.transaction { jobs = mapOf("j" to Job("j", version = 4)) }
    val repo = JobRepository(db, { "op-1" })
    runCatching { db.transaction { outbox = outbox + Op("x", "j", "f", "v", 0); error("crash") } }
    check(db.outbox.isEmpty(), "a crash inside a transaction leaves the outbox untouched")
    repo.setAnswer("j", "valve_3", "leaking")
    check(db.jobs.value.getValue("j").syncState == SyncState.PENDING && db.outbox.size == 1, "a save writes the row and the op together")
    check(db.outbox.single().baseVersion == 4, "the op records the version the user saw")
    val triggers = mutableListOf<Trigger>()
    val hooked = JobRepository(db, { "op-2" }, requestSync = { triggers += it })
    hooked.setAnswer("j", "q", "a")
    check(triggers == listOf(Trigger.EDIT), "a save requests a sync")
  }

  println("Programme: triggers and the worker")
  run {
    var queued = false
    val hub = TriggerHub { _, _ -> if (queued) false else { queued = true; true } }
    val started = Trigger.entries.count { hub.fire(it) }
    check(started == 1, "six triggers become one job")
  }
  val slowDb = LocalDb()
  slowDb.transaction { jobs = mapOf("j" to Job("j")); outbox = List(30) { Op("o$it", "j", "f$it", "v", 0) } }
  val server = SyncServer(0)
  var now = 0L
  val api = object : SyncApi {
    override suspend fun push(ops: List<Op>): List<OpResult> { now += 5 * 60_000; return server.push(ops) }
    override suspend fun pull(cursor: Long, limit: Int) = server.pull(cursor, limit)
  }
  var requeued = 0
  val work = SyncWork(SyncEngine(slowDb, api, batchSize = 10), TriggerHub { _, _ -> requeued += 1; true }, { now })
  val w = work.doWork() as WorkResult.Success
  check(w.morePending && requeued == 1 && slowDb.outbox.size == 10, "out of budget: stop cleanly, then queue a follow-up")

  println("Programme: sync engine failures")
  run {
    val db = LocalDb()
    db.transaction { jobs = mapOf("j" to Job("j")); outbox = listOf(Op("a", "j", "q", "v", 0)) }
    val srv = SyncServer(0).apply { offline = true }
    val engine = SyncEngine(db, srv)
    check(engine.run() is RunOutcome.RetryLater && db.outbox.size == 1, "offline: ops stay in the outbox")
    srv.offline = false
    check(engine.run() is RunOutcome.Finished && db.outbox.isEmpty() && db.cursor == 1L, "back online: ops go, cursor moves")
  }
  run {
    val gate = CompletableDeferred<Unit>()
    val db = LocalDb()
    val slow = object : SyncApi {
      override suspend fun push(ops: List<Op>) = emptyList<OpResult>()
      override suspend fun pull(cursor: Long, limit: Int): PullPage { gate.await(); return PullPage(emptyList(), cursor, false) }
    }
    val engine = SyncEngine(db, slow)
    coroutineScope {
      val first = launch { engine.run() }
      yield()
      delay(1)
      check(engine.run() == RunOutcome.AlreadyRunning, "a second run while one is active does nothing")
      gate.complete(Unit)
      first.join()
    }
  }
  run {
    val db = LocalDb(cursor = 5)
    val outcome = SyncEngine(db, SyncServer(100, logFloor = 50)).run()
    check(outcome == RunOutcome.RebuildNeeded("/snapshots/latest"), "a very old cursor gets 410 and a snapshot")
  }
  run {
    val db = LocalDb()
    db.transaction { jobs = mapOf("j" to Job("j")); outbox = listOf(Op("a", "j", "q", "local", 0)) }
    val page = object : SyncApi {
      override suspend fun push(ops: List<Op>) = throw TryLater(1_000)
      override suspend fun pull(cursor: Long, limit: Int) = PullPage(emptyList(), cursor, false)
    }
    check(SyncEngine(db, page).run() == RunOutcome.RetryLater(1_000), "Retry-After reaches the caller")
    val rnd = Random(7)
    val delays = List(200) { retryDelayMs(3, rnd) }
    check(delays.all { it in 0..8_000 } && delays.toSet().size > 50, "jitter spreads retries up to the cap")
    check(retryDelayMs(30, rnd) <= 300_000, "backoff never exceeds the cap")
  }

  run {
    val srv = SyncServer(0)
    srv.seedJob("j", 5)
    val db = LocalDb()
    db.transaction {
      jobs = mapOf("j" to Job("j", answers = mapOf("v" to "mine"), version = 4, syncState = SyncState.PENDING))
      outbox = listOf(Op("a", "j", "v", "mine", 4), Op("b", "j", "q", "ok", 4))
    }
    srv.push(listOf(Op("dev", "j", "v", "theirs", 5)))
    SyncEngine(db, srv).run()
    check(db.jobs.value.getValue("j").syncState == SyncState.CONFLICT, "a later success on a job keeps its conflict badge")
    check(db.jobs.value.getValue("j").answers["v"] == "mine", "a pull never overwrites a value in conflict")
  }

  println("Programme: field merge")
  check(merge("valve_3", "x", 4, Stored("y", 4, "dev")) == Merge.Apply("x"), "an untouched field applies")
  check(merge("valve_3", "x", 4, Stored("y", 5, "dev")) is Merge.Refuse, "a safety field that changed gets refused")
  check(merge("instructions", "x", 4, Stored("y", 5, "dev")) == Merge.Apply("x"), "last write wins where the table says so")
  check(merge("photos", "b", 4, Stored("a", 5, "dev")) == Merge.Apply("a,b"), "add-only keeps both")
  check(merge("brand_new", "x", 0, null) == Merge.Apply("x"), "a first write always applies")

  println("Programme: notifier")
  run {
    val pushed = mutableListOf<String>()
    ChangeNotifier { pushed += it }.onCommitted(
      List(5) { Change(it.toLong(), "j", "f", "v", it) }, { setOf("tablet", "phone") }, author = "phone",
    )
    check(pushed == listOf("tablet"), "five changes send one push, and never to the author")
  }

  println("Programme: uploads")
  val parts = planParts(412 * MIB)
  check(parts.size == 52 && parts.sumOf { it.length } == 412 * MIB, "412 MB makes 52 parts of 8 MB")
  run {
    val receipts = HashMap<Int, String>()
    var calls = 0
    fun uploader(failAt: Int?) = PartUploader(parts, receipts, { p -> p.associate { it.no to "url" } }, { p, _ ->
      calls += 1
      if (p.no == failAt) throw Swiped()
      "etag-${p.no}"
    }, parallel = 1)
    runCatching { uploader(38).run() }
    check(receipts.size == 37, "37 parts are recorded when the user swipes at part 38")
    calls = 0
    uploader(null).run()
    check(calls == 15 && receipts.size == 52, "the next open sends only the 15 missing parts")
    check(uploader(null).manifest().first() == (1 to "etag-1"), "the manifest lists parts in order")
  }
  run {
    val receipts = HashMap<Int, String>()
    val asked = mutableListOf<Int>()
    var expired = true
    PartUploader(parts.take(8), receipts, { p -> asked += p.size; p.associate { it.no to "u" } }, { p, _ ->
      if (p.no == 5 && expired) { expired = false; throw UrlExpired() }
      "e${p.no}"
    }, parallel = 1).run()
    check(asked == listOf(8, 4) && receipts.size == 8, "expired URLs: ask again only for what is missing")
  }

  println("Programme: screens")
  check(rowUi(Job("j")) == RowUi.Synced, "a synced row shows a tick")
  check(rowUi(Job("j", syncState = SyncState.PENDING)) == RowUi.Pending, "a pending row shows a clock")
  run {
    val t = Theirs("v", "replaced", 5, "dev")
    val j = Job("j", answers = mapOf("v" to "leaking"), syncState = SyncState.CONFLICT, theirs = t)
    check(rowUi(j) == RowUi.Conflict("leaking", t), "a conflict row carries both values")
    val a = listOf(JobRow("1", RowUi.Synced), JobRow("2", RowUi.Pending))
    val b = listOf(JobRow("1", RowUi.Synced), JobRow("2", RowUi.Synced), JobRow("3", RowUi.Synced))
    check(changedRows(a, b) == setOf("2", "3"), "only changed rows redraw")
  }
  run {
    val db = LocalDb()
    db.transaction { jobs = mapOf("a" to Job("a")) }
    val seen = coroutineScope {
      val collecting = async { jobList(db).take(2).toList() }
      delay(5)
      db.transaction { jobs = mapOf("a" to Job("a", syncState = SyncState.PENDING), "b" to Job("b")) }
      collecting.await()
    }
    check(seen.size == 2 && seen.last().rows.size == 2, "one transaction redraws the list once")
    check(jobList(db).first().ticks == 1, "the summary counts ticks")
  }

  println("Programme: chat")
  run {
    val log = ConversationLog()
    check(log.receive("m1") == 1L && log.receive("m1") == 1L && log.receive("m2") == 2L, "a resend keeps its sequence number")
    val t = ChatThread()
    t.sendLocal("m3", "running late")
    check(t.visible().single().state == MsgState.PENDING, "a sent message shows straight away")
    t.onServerMessage(Msg("m3", "running late", seq = 3))
    t.onServerMessage(Msg("x1", "first", seq = 1))
    check(t.visible().map { it.seq } == listOf(1L, 3L), "messages sort by sequence, whatever order they arrive")
    check(t.missingSeqs() == listOf(2L), "a gap is noticed and can be fetched")
    t.markRead(3); t.markRead(1)
    check(t.highestRead == 3L, "read state merges by taking the larger")
  }

  println("Programme: checkout")
  run {
    val svc = OrderService { 4999 }
    val a = svc.create("key", "k-19")
    check(svc.create("key", "k-19") == a, "a retry with the same key returns the same order")
    check(a.amount == 4999L, "the server sets the price")
    check(checkoutUi(null) == CheckoutUi.Confirming, "no answer means confirming, never failed")
    val paid = svc.onWebhook("e1", a.id, succeeded = true)
    check(paid.state == OrderState.PAID, "the webhook settles it, with the app long gone")
    check(svc.onWebhook("e1", a.id, succeeded = false).state == OrderState.PAID, "a repeated webhook changes nothing")
    check(svc.onWebhook("e2", a.id, succeeded = false).state == OrderState.PAID, "a paid order cannot move to failed")
    val b = svc.create("key2", "k-20")
    check(svc.reconcile(setOf(b.id)) == listOf(b.id), "reconciliation finds a missed webhook")
    svc.cancel(b.id)
    check(svc.onWebhook("e3", b.id, succeeded = true).state == OrderState.REFUND_DUE, "paid after cancelling means refund")
    check(checkoutUi(paid) == CheckoutUi.Done(a.id), "the screen shows the server's answer")
  }

  println("Programme: booking")
  run {
    val slot = Slot(capacity = 1)
    val b = SlotBooking(mapOf("s" to slot), holdMs = 100)
    val first = b.hold("r1", "s", 0)
    check(first != null && b.hold("r1", "s", 1) == first, "a retried hold returns the same hold")
    check(b.hold("r2", "s", 10) == null, "a full slot refuses a second patient")
    check(b.hold("r3", "s", 200) != null && slot.held == 1, "an expired hold frees the slot")
    check(!b.confirm("r1", 201), "an expired hold cannot be confirmed")
    check(b.confirm("r3", 210) && b.confirm("r3", 211) && slot.booked == 1, "confirming twice books once")
  }
  coroutineScope {
    val b = SlotBooking(mapOf("s" to Slot(capacity = 3)))
    val won = List(200) { i -> async { b.hold("q$i", "s", 0) } }.awaitAll().count { it != null }
    check(won == 3, "200 people racing for 3 places: exactly 3 win")
  }

  println("Programme: feed")
  check(inSampleSize(4000, 3000, 400, 300) == 8, "a large photo decodes at 1/8 size")
  check(bitmapBytes(4000, 3000, 8) * 64 == bitmapBytes(4000, 3000, 1), "1/8 size uses 64 times less memory")
  run {
    val f = Feed().append(listOf(Post("a", 3), Post("b", 2)), "c1").append(listOf(Post("b", 2), Post("c", 1)), "c2")
    check(f.posts.map { it.id } == listOf("a", "b", "c") && f.cursor == "c2", "a repeated post appears once")
    val (kept, pill) = f.onFresh(listOf(Post("n", 9)), atTop = false)
    check(kept == f && pill == 1, "fresh posts wait behind a pill while reading")
    check(f.onFresh(listOf(Post("n", 9)), atTop = true).first.posts.first().id == "n", "at the top they appear directly")
    val over = StartupBudget(1500).check(listOf(Phase("sdk", 900), Phase("db", 200), Phase("ui", 700)))
    check(over.first().startsWith("sdk"), "an exceeded budget names the worst phase")
    check(StartupBudget(1500).check(listOf(Phase("ui", 700))).isEmpty(), "within budget passes")
  }

  println("Programme: release")
  val old = Health(100_000, 0.998, 3)
  check(judge(Health(5_000, 0.90, 3), old) == Rollout.WAIT, "too few sessions: wait")
  check(judge(Health(30_000, 0.99, 3), old) == Rollout.HALT, "more crashes: halt")
  check(judge(Health(30_000, 0.998, 12), old) == Rollout.HALT, "a silent sync stall: halt")
  check(judge(Health(30_000, 0.998, 4), old) == Rollout.CONTINUE, "healthy: continue")
  check(nextStage(1) == 10 && nextStage(100) == 100, "stages go up to everyone")
  run {
    val buf = TelemetryBuffer(maxEvents = 2)
    buf.record(Event("1", "crash", critical = true))
    buf.record(Event("2", "scroll", critical = false))
    buf.record(Event("3", "crash", critical = true))
    check(buf.size == 2, "the buffer stays bounded")
    check(buf.flush { false } == 0 && buf.size == 2, "a failed upload loses nothing")
    var sent = emptyList<Event>()
    buf.flush { sent = it; true }
    check(sent.map { it.id } == listOf("1", "3"), "when full, routine events go first")
    val intake = EventIntake()
    check(intake.accept(sent).size == 2 && intake.accept(sent).isEmpty(), "a resend does not count twice")
  }

  println("Programme: location")
  run {
    val live = LiveStore()
    check(live.accept(DriverFix("d", 2, 1.0, 1.0)), "a new fix is accepted")
    check(!live.accept(DriverFix("d", 1, 0.0, 0.0)) && live.positionOf("d")?.seq == 2L, "a late fix does not move the dot back")
    check(writesPerSecond(500_000, 4) == 125_000L, "500,000 drivers every 4 seconds is 125,000 writes a second")
  }

  println("Programme: tokens")
  coroutineScope {
    var calls = 0
    val r = TokenRefresher(Tokens("a1", "r1"), { calls += 1; delay(5); Tokens("a2", "r2") })
    val got = List(10) { async { r.refreshed("a1") } }.awaitAll()
    check(calls == 1 && got.all { it.access == "a2" }, "ten 401s make one refresh call")
    check(r.refreshed("a1").access == "a2" && calls == 1, "a late 401 uses the token that already changed")
  }
  coroutineScope {
    val r = TokenRefresher(Tokens("a1", "r1"), { throw IOException("down") })
    check(runCatching { r.refreshed("a1") }.isFailure && r.current.access == "a1", "a failed refresh keeps the old tokens")
  }

  println("Programme: notifications")
  run {
    val router = NotifyRouter(maxBulkPerDay = 1)
    check(router.route(Notification("k1", "u", Lane.URGENT, 23)) == Routed.Queue(Lane.URGENT), "a passcode ignores quiet hours")
    check(router.route(Notification("k1", "u", Lane.URGENT, 23)) == Routed.Dropped("duplicate"), "a caller's retry sends nothing twice")
    check(router.route(Notification("k2", "u", Lane.BULK, 23)) == Routed.Dropped("quiet hours"), "bulk waits out quiet hours")
    check(router.route(Notification("k3", "u", Lane.BULK, 12)) == Routed.Queue(Lane.BULK), "bulk goes in its own lane")
    check(router.route(Notification("k4", "u", Lane.BULK, 12)) == Routed.Dropped("daily limit"), "per-user limits apply to every team")
  }
}
