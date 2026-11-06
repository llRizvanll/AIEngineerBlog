package programme

// region: server
/** The server side of sync. Each op is one transaction: check, merge, number, log. */
class SyncServer(startSeq: Long, private val logFloor: Long = 0) : SyncApi {
  private class Row(val fields: MutableMap<String, Stored> = HashMap(), var version: Int = 0)

  private val rows = HashMap<String, Row>()
  private val applied = HashMap<String, OpResult>()     // op_id -> the answer we gave
  private val log = ArrayList<Change>()
  private var seq = startSeq

  /** Rows written, so a test can prove that a retry writes nothing. */
  var writes = 0
    private set
  var offline = false

  fun seedJob(jobId: String, version: Int) { rows[jobId] = Row(version = version) }

  override suspend fun push(ops: List<Op>): List<OpResult> {
    if (offline) throw TryLater()
    return synchronized(this) { ops.map(::applyOne) }
  }

  private fun applyOne(op: Op): OpResult {
    applied[op.opId]?.let { return it }                 // a retry: same answer, no write
    val row = rows.getOrPut(op.jobId) { Row() }
    val result = when (val m = merge(op.field, op.value, op.baseVersion, row.fields[op.field])) {
      is Merge.Refuse -> OpResult.Conflict(op.opId, Theirs(op.field, m.current.value, row.version, m.current.by))
      is Merge.Apply -> {
        row.version += 1
        row.fields[op.field] = Stored(m.value, row.version, op.by)
        seq += 1
        log += Change(seq, op.jobId, op.field, m.value, row.version)
        writes += 1
        OpResult.Applied(op.opId, seq)
      }
    }
    applied[op.opId] = result
    return result
  }
  // endregion

  // region: pull
  override suspend fun pull(cursor: Long, limit: Int): PullPage {
    if (offline) throw TryLater()
    if (cursor < logFloor) throw CursorTooOld("/snapshots/latest")
    return synchronized(this) {
      val after = log.filter { it.seq > cursor }
      val page = after.take(limit)
      PullPage(page, page.lastOrNull()?.seq ?: cursor, hasMore = after.size > limit)
    }
  }
  // endregion
}

// region: notifier
/** Push says "come and look". It carries no data, and one push covers many changes. */
class ChangeNotifier(private val sendPush: (device: String) -> Unit) {
  fun onCommitted(changes: List<Change>, devicesFor: (jobId: String) -> Set<String>, author: String) {
    changes.flatMap { devicesFor(it.jobId) }
      .toSet()
      .minus(author)
      .forEach(sendPush)
  }
}
// endregion
