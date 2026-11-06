package programme

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

enum class SyncState { SYNCED, PENDING, CONFLICT, FAILED }

// region: rows
/** What the supervisor's copy said when the server refused an edit. */
data class Theirs(val field: String, val value: String, val version: Int, val by: String)

/** One row of the job table. */
data class Job(
  val id: String,
  val answers: Map<String, String> = emptyMap(),
  val version: Int = 0,
  val syncState: SyncState = SyncState.SYNCED,
  val theirs: Theirs? = null,
  val error: String? = null,
)

/** One row of the outbox: a change the server has not confirmed yet. */
data class Op(
  val opId: String,
  val jobId: String,
  val field: String,
  val value: String,
  val baseVersion: Int,
  val by: String = "device",
)
// endregion

/** The tables one transaction can change. */
class Tx(var jobs: Map<String, Job>, var outbox: List<Op>, var cursor: Long)

// region: transaction
/**
 * Behaves like SQLite for this lesson: a transaction commits whole or not at all,
 * and observers hear about it once, after it commits.
 */
class LocalDb(cursor: Long = 0) {
  private val lock = Any()
  private var committedOutbox: List<Op> = emptyList()
  private var committedCursor = cursor
  private val jobTable = MutableStateFlow<Map<String, Job>>(emptyMap())

  /** The query a screen subscribes to. */
  val jobs: StateFlow<Map<String, Job>> = jobTable.asStateFlow()
  val outbox: List<Op> get() = synchronized(lock) { committedOutbox }
  val cursor: Long get() = synchronized(lock) { committedCursor }

  fun <T> transaction(block: Tx.() -> T): T = synchronized(lock) {
    val tx = Tx(jobTable.value, committedOutbox, committedCursor)
    val result = tx.block()              // a throw here leaves every table untouched
    committedOutbox = tx.outbox
    committedCursor = tx.cursor
    jobTable.value = tx.jobs             // one emission, however many rows changed
    result
  }
}
// endregion

// region: save
/** The only way a screen changes data. Nothing here touches the network. */
class JobRepository(
  private val db: LocalDb,
  private val newOpId: () -> String,
  private val by: String = "device",
  private val requestSync: (Trigger) -> Unit = {},
) {
  fun setAnswer(jobId: String, field: String, value: String) {
    db.transaction {
      val job = jobs.getValue(jobId)
      jobs = jobs + (jobId to job.copy(
        answers = job.answers + (field to value),
        syncState = SyncState.PENDING,
      ))
      outbox = outbox + Op(newOpId(), jobId, field, value, job.version, by)
    }
    requestSync(Trigger.EDIT)            // only after the commit: the edit is already safe
  }

  /** The user chose a value in the conflict screen. It is a new edit, based on what they just saw. */
  fun resolve(jobId: String, value: String) {
    db.transaction {
      val job = jobs.getValue(jobId)
      val theirs = checkNotNull(job.theirs) { "$jobId has no conflict" }
      jobs = jobs + (jobId to job.copy(
        answers = job.answers + (theirs.field to value),
        syncState = SyncState.PENDING,
        theirs = null,
      ))
      outbox = outbox + Op(newOpId(), jobId, theirs.field, value, theirs.version, by)
    }
    requestSync(Trigger.EDIT)
  }
}
// endregion
