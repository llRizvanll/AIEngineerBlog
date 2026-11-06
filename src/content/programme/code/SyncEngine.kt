package programme

import java.io.IOException
import kotlin.random.Random
import kotlinx.coroutines.sync.Mutex

// region: contract
sealed interface OpResult {
  val opId: String
  data class Applied(override val opId: String, val seq: Long) : OpResult
  data class Conflict(override val opId: String, val theirs: Theirs) : OpResult
  data class Rejected(override val opId: String, val reason: String) : OpResult
}

/** One line of the server's change log. */
data class Change(val seq: Long, val jobId: String, val field: String, val value: String, val version: Int)
data class PullPage(val changes: List<Change>, val next: Long, val hasMore: Boolean)

/** 429 or 5xx, or no network at all. Keep the ops and try again later. */
class TryLater(val afterMs: Long? = null) : IOException("try later")

/** 410: this device's cursor is older than the log keeps. */
class CursorTooOld(val snapshotUrl: String) : IOException("cursor too old")

interface SyncApi {
  suspend fun push(ops: List<Op>): List<OpResult>
  suspend fun pull(cursor: Long, limit: Int): PullPage
}
// endregion

sealed interface RunOutcome {
  data class Finished(val pushed: Int, val conflicts: Int, val pulled: Int, val morePending: Boolean) : RunOutcome
  data class RetryLater(val afterMs: Long?) : RunOutcome
  data class RebuildNeeded(val snapshotUrl: String) : RunOutcome
  data object AlreadyRunning : RunOutcome
}

// region: run
class SyncEngine(
  private val db: LocalDb,
  private val api: SyncApi,
  private val batchSize: Int = 25,
  private val pageSize: Int = 500,
) {
  private val lock = Mutex()

  suspend fun run(hasTime: () -> Boolean = { true }): RunOutcome {
    if (!lock.tryLock()) return RunOutcome.AlreadyRunning     // single flight
    var applied = 0
    var conflicts = 0
    var pulled = 0
    try {
      while (db.outbox.isNotEmpty() && hasTime()) {
        val results = api.push(db.outbox.take(batchSize))     // may throw: ops stay queued
        applyResults(results)
        applied += results.count { it is OpResult.Applied }
        conflicts += results.count { it is OpResult.Conflict }
      }
      var more = true
      while (more && hasTime()) {
        val page = api.pull(db.cursor, pageSize)
        applyPage(page)
        pulled += page.changes.size
        more = page.hasMore
      }
      return RunOutcome.Finished(applied, conflicts, pulled, morePending = db.outbox.isNotEmpty() || more)
    } catch (e: TryLater) {
      return RunOutcome.RetryLater(e.afterMs)
    } catch (e: CursorTooOld) {
      return RunOutcome.RebuildNeeded(e.snapshotUrl)
    } finally {
      lock.unlock()
    }
  }
  // endregion

  // region: results
  /** One transaction: finished ops leave the outbox together with their job's new state. */
  private fun applyResults(results: List<OpResult>) = db.transaction {
    for (r in results) {
      val op = outbox.first { it.opId == r.opId }
      outbox = outbox - op
      val job = jobs.getValue(op.jobId)
      val updated = when (r) {
        // A later success on this job must not clear a conflict or a failure.
        is OpResult.Applied ->
          if (job.syncState == SyncState.PENDING && outbox.none { it.jobId == op.jobId }) {
            job.copy(syncState = SyncState.SYNCED)
          } else job
        is OpResult.Conflict -> job.copy(syncState = SyncState.CONFLICT, theirs = r.theirs)
        is OpResult.Rejected -> job.copy(syncState = SyncState.FAILED, error = r.reason)
      }
      jobs = jobs + (op.jobId to updated)
    }
  }
  // endregion

  // region: page
  /** One transaction: the data and the cursor can never disagree. */
  private fun applyPage(page: PullPage) = db.transaction {
    for (c in page.changes) {
      val job = jobs[c.jobId] ?: Job(c.jobId)
      val unsent = outbox.any { it.jobId == c.jobId && it.field == c.field }
      val inConflict = job.theirs?.field == c.field
      jobs = jobs + (c.jobId to job.copy(
        // Never overwrite something the user changed and the server has not settled.
        answers = if (unsent || inConflict) job.answers else job.answers + (c.field to c.value),
        version = maxOf(job.version, c.version),
      ))
    }
    cursor = page.next
  }
  // endregion
}

// region: backoff
/** Full jitter: anywhere from zero up to the exponential cap, so phones spread out after an outage. */
fun retryDelayMs(attempt: Int, random: Random, baseMs: Long = 1_000, capMs: Long = 300_000): Long {
  val exponential = baseMs shl attempt.coerceIn(0, 20)
  return random.nextLong(minOf(exponential, capMs) + 1)
}
// endregion
