data class Fix(val lat: Double, val lng: Double, val atMs: Long, val speedMps: Double)

/**
 * Decides which GPS fixes are worth keeping, and when to send them.
 * Moving fast: keep more points. Standing still: keep almost none. Offline: buffer, then flush.
 */
class LocationBatcher(
  private val minMeters: Double = 25.0,
  private val maxSilenceMs: Long = 30_000,
  private val maxBatch: Int = 20,
  private val flushEveryMs: Long = 15_000,
  private val maxBuffered: Int = 2_000,
) {
  private val buffer = ArrayDeque<Fix>()
  private var lastKept: Fix? = null
  private var lastFlushMs = 0L

  val pending: Int get() = buffer.size

  fun offer(fix: Fix) {
    val last = lastKept
    val moved = last == null || metersBetween(last, fix) >= minMeters
    val silent = last == null || fix.atMs - last.atMs >= maxSilenceMs
    if (!moved && !silent) return
    buffer.addLast(fix)
    lastKept = fix
    if (buffer.size > maxBuffered) buffer.removeFirst()   // a long tunnel: drop the oldest
  }

  /** Returns a batch to send now, or nothing. Call it on a timer and when the network returns. */
  fun drain(nowMs: Long, online: Boolean): List<Fix> {
    if (!online || buffer.isEmpty()) return emptyList()
    if (buffer.size < maxBatch && nowMs - lastFlushMs < flushEveryMs) return emptyList()
    lastFlushMs = nowMs
    return List(minOf(maxBatch, buffer.size)) { buffer.removeFirst() }
  }
}

/** Equirectangular distance: accurate enough at these short ranges, and cheap on battery. */
fun metersBetween(a: Fix, b: Fix): Double {
  val r = 6_371_000.0
  val lat = Math.toRadians((a.lat + b.lat) / 2)
  val x = Math.toRadians(b.lng - a.lng) * Math.cos(lat)
  val y = Math.toRadians(b.lat - a.lat)
  return Math.hypot(x, y) * r
}
