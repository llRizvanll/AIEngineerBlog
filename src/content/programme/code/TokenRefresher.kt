package programme

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

// region: refresh
data class Tokens(val access: String, val refresh: String)

/** Ten requests can get a 401 at once. Only the first refreshes, and the rest wait for its result. */
class TokenRefresher(
  private var tokens: Tokens,
  private val callRefresh: suspend (refreshToken: String) -> Tokens,
) {
  private val lock = Mutex()
  private var inFlight: CompletableDeferred<Tokens>? = null

  val current: Tokens get() = tokens

  /** [stale] is the access token that just failed. */
  suspend fun refreshed(stale: String): Tokens {
    val mine = CompletableDeferred<Tokens>()
    val joined = lock.withLock {
      if (tokens.access != stale) return tokens       // someone already replaced it
      inFlight?.also { return@withLock it }
      inFlight = mine
      null
    }
    if (joined != null) return joined.await()
    try {
      val fresh = callRefresh(tokens.refresh)         // rotates the refresh token too
      lock.withLock {
        tokens = fresh
        inFlight = null
      }
      mine.complete(fresh)
      return fresh
    } catch (e: Exception) {
      lock.withLock { inFlight = null }
      mine.completeExceptionally(e)
      throw e
    }
  }
}
// endregion
