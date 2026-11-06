package programme

// region: route
enum class Lane { URGENT, BULK }

data class Notification(val key: String, val userId: String, val lane: Lane, val hourLocal: Int)

sealed interface Routed {
  data class Queue(val lane: Lane) : Routed
  data class Dropped(val why: String) : Routed
}

/** Every team's sends pass through one set of rules. */
class NotifyRouter(private val maxBulkPerDay: Int = 3, private val quiet: IntRange = 22..23) {
  private val seenKeys = HashSet<String>()
  private val bulkToday = HashMap<String, Int>()

  fun route(n: Notification): Routed {
    if (!seenKeys.add(n.key)) return Routed.Dropped("duplicate")     // the caller retried
    if (n.lane == Lane.URGENT) return Routed.Queue(Lane.URGENT)      // passcodes skip the limits
    if (n.hourLocal in quiet || n.hourLocal < 7) return Routed.Dropped("quiet hours")
    val sent = bulkToday.getOrDefault(n.userId, 0)
    if (sent >= maxBulkPerDay) return Routed.Dropped("daily limit")
    bulkToday[n.userId] = sent + 1
    return Routed.Queue(Lane.BULK)
  }
}
// endregion
