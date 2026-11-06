package programme

// region: server
/** Owns one conversation's order. The client's ID makes a resend harmless. */
class ConversationLog {
  private val byClientId = HashMap<String, Long>()
  private var nextSeq = 0L

  @Synchronized
  fun receive(clientMsgId: String): Long =
    byClientId.getOrPut(clientMsgId) { nextSeq += 1; nextSeq }
}
// endregion

enum class MsgState { PENDING, SENT }

data class Msg(val clientMsgId: String, val text: String, val seq: Long? = null, val state: MsgState = MsgState.PENDING)

// region: client
/** The phone's copy of one chat. Socket, push and catch-up all end up in [onServerMessage]. */
class ChatThread {
  private val bySeq = sortedMapOf<Long, Msg>()
  private val pending = LinkedHashMap<String, Msg>()
  var highestRead = 0L
    private set

  fun sendLocal(id: String, text: String) { pending[id] = Msg(id, text) }

  /** Our own message came back with its place in the order. */
  fun onServerMessage(m: Msg) {
    val seq = checkNotNull(m.seq)
    pending.remove(m.clientMsgId)
    bySeq[seq] = m.copy(state = MsgState.SENT)
  }

  /** Confirmed messages in order, then the ones still waiting. */
  fun visible(): List<Msg> = bySeq.values + pending.values

  /** Holes to ask the server for after a reconnect. */
  fun missingSeqs(): List<Long> {
    val last = bySeq.keys.lastOrNull() ?: return emptyList()
    return (1..last).filter { it !in bySeq }
  }

  /** One number stands for many messages, and two devices merge by taking the larger. */
  fun markRead(seq: Long) { highestRead = maxOf(highestRead, seq) }
}
// endregion
