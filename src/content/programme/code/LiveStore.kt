package programme

// region: live
data class DriverFix(val driverId: String, val seq: Long, val lat: Double, val lng: Double)

/** Keeps only the latest fix per driver. A late fix from a tunnel must not move the dot back. */
class LiveStore {
  private val latest = HashMap<String, DriverFix>()

  fun accept(fix: DriverFix): Boolean {
    val current = latest[fix.driverId]
    if (current != null && current.seq >= fix.seq) return false
    latest[fix.driverId] = fix
    return true
  }

  fun positionOf(driverId: String): DriverFix? = latest[driverId]
}

/** The first number to say out loud. */
fun writesPerSecond(drivers: Long, everySeconds: Long): Long = drivers / everySeconds
// endregion
