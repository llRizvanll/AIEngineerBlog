package programme

// region: gate
data class Health(val sessions: Int, val crashFree: Double, val outboxP90: Int)

enum class Rollout { CONTINUE, WAIT, HALT }

/** Compare new with old on the same devices over the same hours. */
fun judge(new: Health, old: Health, minSessions: Int = 20_000): Rollout {
  if (new.sessions < minSessions) return Rollout.WAIT    // too little data to judge
  val moreCrashes = new.crashFree < old.crashFree - 0.002
  val syncStalled = new.outboxP90 > old.outboxP90 * 2    // a stall shows no crash at all
  return if (moreCrashes || syncStalled) Rollout.HALT else Rollout.CONTINUE
}

private val STAGES = listOf(1, 10, 50, 100)

fun nextStage(percent: Int): Int = STAGES.firstOrNull { it > percent } ?: 100
// endregion

// region: telemetry
data class Event(val id: String, val name: String, val critical: Boolean)

/** An outbox for measurements. It keeps crashes when full, and drops routine events first. */
class TelemetryBuffer(private val maxEvents: Int = 500) {
  private val queue = ArrayDeque<Event>()
  val size: Int get() = queue.size

  fun record(e: Event) {
    if (queue.size >= maxEvents) {
      val victim = queue.firstOrNull { !it.critical } ?: queue.first()
      queue.remove(victim)
    }
    queue.addLast(e)
  }

  /** Removes a batch only after [upload] succeeds, so a failed upload loses nothing. */
  suspend fun flush(batch: Int = 50, upload: suspend (List<Event>) -> Boolean): Int {
    val events = queue.take(batch)
    if (events.isEmpty() || !upload(events)) return 0
    repeat(events.size) { queue.removeFirst() }
    return events.size
  }
}

/** Server side. A resend must not inflate the crash rate. */
class EventIntake {
  private val seen = HashSet<String>()
  fun accept(batch: List<Event>): List<Event> = batch.filter { seen.add(it.id) }
}
// endregion
