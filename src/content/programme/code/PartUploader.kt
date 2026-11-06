package programme

import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope

const val MIB = 1024L * 1024L

// region: plan
data class Part(val no: Int, val offset: Long, val length: Long)

fun planParts(size: Long, partSize: Long = 8 * MIB): List<Part> {
  val count = ((size + partSize - 1) / partSize).toInt()
  return List(count) { i ->
    val offset = i * partSize
    Part(i + 1, offset, minOf(partSize, size - offset))
  }
}
// endregion

/** The presigned URL ran out. Ask for fresh ones and carry on. */
class UrlExpired : Exception("url expired")

// region: upload
/**
 * Sends only what the table says is missing. [receipts] stands for the transfer_part
 * table: a part number maps to its ETag once that part succeeds.
 */
class PartUploader(
  private val parts: List<Part>,
  private val receipts: MutableMap<Int, String>,
  private val freshUrls: suspend (List<Part>) -> Map<Int, String>,
  private val send: suspend (Part, url: String) -> String,
  private val parallel: Int = 4,
) {
  val remaining: List<Part> get() = parts.filter { it.no !in receipts }

  suspend fun run() {
    var urls = freshUrls(remaining)
    while (remaining.isNotEmpty()) {
      val outcomes = coroutineScope {
        remaining.take(parallel).map { part ->
          async { part to runCatching { send(part, urls.getValue(part.no)) } }
        }.awaitAll()
      }
      // Save every success first, so a failure next to it costs nothing.
      outcomes.forEach { (part, r) -> r.onSuccess { etag -> receipts[part.no] = etag } }
      val failure = outcomes.firstNotNullOfOrNull { (_, r) -> r.exceptionOrNull() }
      when (failure) {
        null -> Unit
        is UrlExpired -> urls = freshUrls(remaining)    // only the parts still missing
        else -> throw failure
      }
    }
  }

  /** The body of POST /files/complete, in part order. */
  fun manifest(): List<Pair<Int, String>> = receipts.toSortedMap().map { (no, etag) -> no to etag }
}
// endregion
