package programme

// region: booking
data class Slot(val capacity: Int, var held: Int = 0, var booked: Int = 0)
data class Hold(val id: String, val slotId: String, val expiresAtMs: Long, var confirmed: Boolean = false)

/**
 * Each method stands for one conditional UPDATE, such as:
 * UPDATE slot SET held = held + 1 WHERE id = ? AND held + booked < capacity
 * The row is the lock, so there is nothing separate to forget to release.
 */
class SlotBooking(private val slots: Map<String, Slot>, private val holdMs: Long = 120_000) {
  private val holds = HashMap<String, Hold>()

  @Synchronized
  fun hold(requestId: String, slotId: String, nowMs: Long): Hold? {
    holds[requestId]?.let { return it }                 // a retry returns the same hold
    expire(nowMs)
    val slot = slots.getValue(slotId)
    if (slot.held + slot.booked >= slot.capacity) return null
    slot.held += 1
    return Hold(requestId, slotId, nowMs + holdMs).also { holds[requestId] = it }
  }

  @Synchronized
  fun confirm(holdId: String, nowMs: Long): Boolean {
    expire(nowMs)
    val h = holds[holdId] ?: return false
    if (h.confirmed) return true                        // confirming twice is fine
    val slot = slots.getValue(h.slotId)
    slot.held -= 1
    slot.booked += 1
    h.confirmed = true
    return true
  }

  private fun expire(nowMs: Long) {
    val dead = holds.values.filter { !it.confirmed && it.expiresAtMs <= nowMs }
    for (h in dead) {
      slots.getValue(h.slotId).held -= 1
      holds.remove(h.id)
    }
  }
}
// endregion
