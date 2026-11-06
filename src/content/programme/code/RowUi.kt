package programme

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map

// region: states
/** Everything one row can show. The compiler makes every screen handle all of them. */
sealed interface RowUi {
  data object Synced : RowUi
  data object Pending : RowUi
  data class Conflict(val mine: String, val theirs: Theirs) : RowUi
  data class Failed(val reason: String) : RowUi
}

/** A pure function: the same row always draws the same way, so it needs no network to test. */
fun rowUi(job: Job): RowUi = when (job.syncState) {
  SyncState.SYNCED -> RowUi.Synced
  SyncState.PENDING -> RowUi.Pending
  SyncState.CONFLICT -> {
    val theirs = checkNotNull(job.theirs)
    RowUi.Conflict(job.answers[theirs.field].orEmpty(), theirs)
  }
  SyncState.FAILED -> RowUi.Failed(job.error ?: "Could not save")
}
// endregion

// region: flow
data class JobRow(val id: String, val ui: RowUi)
data class ListSummary(val rows: List<JobRow>, val ticks: Int, val needsReview: Int)

/** The whole screen is one mapping over the database query. It never mentions the network. */
fun jobList(db: LocalDb): Flow<ListSummary> = db.jobs
  .map { jobs ->
    val rows = jobs.values.sortedBy { it.id }.map { JobRow(it.id, rowUi(it)) }
    ListSummary(rows, rows.count { it.ui is RowUi.Synced }, rows.count { it.ui is RowUi.Conflict })
  }
  .distinctUntilChanged()
// endregion

// region: diff
/** Which rows must redraw. 140 pulled changes may touch only a few rows on screen. */
fun changedRows(old: List<JobRow>, new: List<JobRow>): Set<String> {
  val before = old.associateBy { it.id }
  return new.filter { before[it.id] != it }.map { it.id }.toSet()
}
// endregion
