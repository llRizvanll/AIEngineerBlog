import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Deferred
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.async
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

fun interface ImageFetcher {
  suspend fun fetch(url: String): ByteArray
}

interface DiskCache {
  suspend fun get(key: String): ByteArray?
  suspend fun put(key: String, bytes: ByteArray)
}

/**
 * Memory → disk → network image loading with request coalescing:
 * fifty rows asking for the same URL trigger exactly one download.
 */
class ImageLoader(
  private val fetcher: ImageFetcher,
  private val scope: CoroutineScope,   // app scope with a SupervisorJob: downloads outlive one caller
  private val disk: DiskCache? = null,
  memoryLimit: Int = 50 * 1024 * 1024,
) {
  private val lock = Mutex()
  private val memory = LruCache<String, ByteArray>(memoryLimit)
  private val inFlight = HashMap<String, Deferred<ByteArray>>()

  suspend fun load(url: String): ByteArray {
    val download = lock.withLock {
      memory[url]?.let { return it }                     // 1. memory
      inFlight[url] ?: scope.async {                     // 2. or join the download already running
        disk?.get(url)?.let { return@async it }          // 3. disk
        fetcher.fetch(url).also { disk?.put(url, it) }   // 4. network, written back to disk
      }.also { inFlight[url] = it }
    }
    try {
      val bytes = download.await()
      lock.withLock { memory.put(url, bytes, cost = bytes.size) }
      return bytes
    } finally {
      withContext(NonCancellable) {                      // clean up even if this caller was cancelled
        lock.withLock { if (inFlight[url] === download) inFlight.remove(url) }
      }
    }
  }

  /** Call when a row is recycled before its image arrives and nobody else needs it. */
  suspend fun cancel(url: String) = lock.withLock {
    inFlight.remove(url)?.cancel()
  }

  suspend fun clearMemory() = lock.withLock { memory.clear() }
}
