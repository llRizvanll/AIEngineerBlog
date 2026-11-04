import kotlin.coroutines.cancellation.CancellationException
import kotlin.time.Duration
import kotlin.time.Duration.Companion.milliseconds
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class SearchUi(val results: List<String> = emptyList(), val loading: Boolean = false, val error: String? = null)

/**
 * Search-as-you-type: debounce keystrokes, cancel stale requests, never show
 * results for a query the user has already changed. In an Android ViewModel, pass viewModelScope.
 */
class SearchViewModel(
  scope: CoroutineScope,
  private val debounce: Duration = 300.milliseconds,
  private val minLength: Int = 2,
  private val search: suspend (String) -> List<String>,
) {
  private val query = MutableStateFlow("")
  private val _ui = MutableStateFlow(SearchUi())
  val ui: StateFlow<SearchUi> = _ui.asStateFlow()

  fun onQueryChanged(text: String) {
    query.value = text
  }

  init {
    scope.launch {
      query.map { it.trim() }.distinctUntilChanged().collectLatest { q ->   // a new keystroke cancels this block
        if (q.length < minLength) {
          _ui.value = SearchUi()
          return@collectLatest
        }
        delay(debounce)                                // the debounce: cancelled if typing continues
        _ui.update { it.copy(loading = true) }
        try {
          val found = search(q)
          currentCoroutineContext().ensureActive()     // the query changed while we waited: drop it
          _ui.value = SearchUi(results = found)
        } catch (e: CancellationException) {
          throw e                                      // the newer query owns the UI state
        } catch (e: Exception) {
          _ui.value = SearchUi(error = "Search failed. Pull to retry.")
        }
      }
    }
  }
}
