package programme

// region: story
data class StoryResult(
  val firstRun: RunOutcome,
  val cursorAfterRun: Long,
  val ticks: Int,
  val amber: Int,
  val theirs: Theirs?,
  val writesBeforeRetry: Int,
  val writesAfterRetry: Int,
  val finalVersion: Int,
  val tabletSees: String?,
)

/** Priya's whole day, running against the real engine and the real server code. */
suspend fun priyasDay(): StoryResult {
  val server = SyncServer(startSeq = 88411)
  val jobIds = List(12) { "j-${73 + it}" }              // twelve jobs, including j-81 and j-84
  jobIds.forEach { server.seedJob(it, version = 4) }

  fun phone(prefix: String): Pair<LocalDb, JobRepository> {
    val db = LocalDb(cursor = 88411)
    db.transaction { jobs = jobIds.associateWith { Job(it, version = 4) } }
    var n = 0
    return db to JobRepository(db, { "$prefix-${++n}" }, by = prefix)
  }

  val (priya, priyaRepo) = phone("priya")
  val (tablet, devRepo) = phone("dev")
  val priyaSync = SyncEngine(priya, server)
  val devSync = SyncEngine(tablet, server)

  // 2:40 pm, underground. 37 edits, with no network involved at all.
  priyaRepo.setAnswer("j-84", "valve_3", "leaking")
  priyaRepo.setAnswer("j-81", "valve_3", "leaking")
  var edits = 2
  outer@ for (q in 1..4) for (job in jobIds - "j-84") {   // the other eleven jobs get the rest
    if (edits == 37) break@outer
    priyaRepo.setAnswer(job, "q$q", "ok")
    edits += 1
  }

  // 3:30 pm, in the office. Dev changes one field she also changed, and one she did not.
  devRepo.setAnswer("j-84", "valve_3", "replaced")
  devRepo.setAnswer("j-81", "instructions", "Use the east stairs")
  devSync.run()

  // Everyone else's work during those hours: 102 more changes in the log.
  val others = List(102) { Op("other-$it", "j-other", "q$it", "ok", baseVersion = 0) }
  server.push(others)

  // 4:12 pm. Signal returns and the worker runs.
  val firstRun = priyaSync.run()
  val rows = jobIds.map { priya.jobs.value.getValue(it) }
  val ticks = rows.count { it.syncState == SyncState.SYNCED }
  val amber = rows.count { it.syncState == SyncState.CONFLICT }
  val theirs = priya.jobs.value.getValue("j-84").theirs

  // A lost reply: the same ops arrive again, and nothing is written twice.
  val writesBeforeRetry = server.writes
  val sentAgain = List(12) { i -> Op("priya-${i + 2}", "j-81", "q", "ok", 4) }
  server.push(sentAgain)
  val writesAfterRetry = server.writes
  val cursorAfterRun = priya.cursor

  // 4:14 pm. She looks at both values and keeps her own.
  priyaRepo.resolve("j-84", "leaking")
  priyaSync.run()

  // 4:15 pm. The push told Dev's tablet to look, so it pulls after its own cursor.
  devSync.run()

  return StoryResult(
    firstRun, cursorAfterRun, ticks, amber, theirs, writesBeforeRetry, writesAfterRetry,
    finalVersion = priya.jobs.value.getValue("j-84").version,
    tabletSees = tablet.jobs.value.getValue("j-84").answers["valve_3"],
  )
}
// endregion
