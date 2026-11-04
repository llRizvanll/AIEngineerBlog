import kotlin.coroutines.cancellation.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class FeedPage<T>(val items: List<T>, val nextCursor: String?)

/**
 * Cursor-based infinite feed: one request at a time, prefetch before the bottom,
 * drop duplicates when new posts shift the feed, and ignore stale responses after a refresh.
 * Confined to the main thread: call it from viewModelScope.
 */
class FeedPaginator<T, ID>(
  private val idOf: (T) -> ID,
  private val fetch: suspend (cursor: String?) -> FeedPage<T>,
) {
  sealed interface State {
    data object Idle : State
    data object Loading : State
    data class Failed(val message: String) : State
    data object End : State
  }

  private val _items = MutableStateFlow<List<T>>(emptyList())
  val items: StateFlow<List<T>> = _items.asStateFlow()
  private val _state = MutableStateFlow<State>(State.Idle)
  val state: StateFlow<State> = _state.asStateFlow()

  private var cursor: String? = null
  private val seen = HashSet<ID>()
  private var generation = 0

  suspend fun loadNext() {
    when (_state.value) {
      State.Loading, State.End -> return               // single flight; nothing after the end
      State.Idle, is State.Failed -> Unit
    }
    _state.value = State.Loading
    val requestGeneration = generation
    try {
      val page = fetch(cursor)
      if (requestGeneration != generation) return      // a refresh happened meanwhile
      val fresh = page.items.filter { seen.add(idOf(it)) }
      _items.value += fresh
      cursor = page.nextCursor
      _state.value = if (page.nextCursor == null) State.End else State.Idle
    } catch (e: CancellationException) {
      throw e
    } catch (e: Exception) {
      if (requestGeneration == generation) _state.value = State.Failed(e.message ?: "Could not load")
    }
  }

  suspend fun refresh() {
    generation++
    _items.value = emptyList()
    seen.clear()
    cursor = null
    _state.value = State.Idle
    loadNext()
  }

  /** Call as each row is composed: start the next page when the user nears the end. */
  suspend fun onItemShown(index: Int, prefetchDistance: Int = 5) {
    if (index >= _items.value.size - prefetchDistance) loadNext()
  }
}
