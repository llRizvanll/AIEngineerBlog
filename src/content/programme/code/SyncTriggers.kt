package programme

enum class Trigger { EDIT, APP_BACKGROUND, NETWORK_BACK, PUSH, PERIODIC, APP_OPEN }

// region: hub
/** The part of WorkManager this code needs. Returns false when a job with this name already waits. */
fun interface JobScheduler {
  fun enqueueUnique(name: String, requiresNetwork: Boolean): Boolean
}

/** Every reason to sync comes through here, and they all become the same one job. */
class TriggerHub(private val scheduler: JobScheduler) {
  var lastTrigger: Trigger? = null
    private set

  fun fire(trigger: Trigger): Boolean {
    lastTrigger = trigger
    return scheduler.enqueueUnique("sync", requiresNetwork = true)
  }
}
// endregion

// region: worker
sealed interface WorkResult {
  /** Done. The worker enqueues a follow-up job when [morePending] is true. */
  data class Success(val morePending: Boolean) : WorkResult
  data object Retry : WorkResult
}

/** What the Android worker does, with no Android types, so a plain test can run it. */
class SyncWork(
  private val engine: SyncEngine,
  private val hub: TriggerHub,
  private val clockMs: () -> Long,
  private val budgetMs: Long = 8 * 60_000,
) {
  suspend fun doWork(): WorkResult {
    val deadline = clockMs() + budgetMs
    return when (val out = engine.run(hasTime = { clockMs() < deadline })) {
      is RunOutcome.Finished -> {
        if (out.morePending) hub.fire(Trigger.PERIODIC)
        WorkResult.Success(out.morePending)
      }
      is RunOutcome.RetryLater -> WorkResult.Retry       // the OS applies its own backoff
      RunOutcome.AlreadyRunning -> WorkResult.Success(morePending = false)
      is RunOutcome.RebuildNeeded -> WorkResult.Success(morePending = false)
    }
  }
}
// endregion
