import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

/**
 * The resumable state of one multipart upload. Persist it after every part:
 * it is all you need to continue after the process is killed.
 */
data class UploadPlan(
  val fileId: String,
  val size: Int,
  val partSize: Int,
  val completed: Map<Int, String> = emptyMap(),        // part number → ETag
) {
  val partCount: Int get() = (size + partSize - 1) / partSize
  val remaining: List<Int> get() = (0 until partCount).filter { it !in completed }
  val isComplete: Boolean get() = completed.size == partCount
  fun byteRange(part: Int): IntRange = part * partSize until minOf(size, (part + 1) * partSize)
}

fun interface PartUploader {
  suspend fun upload(fileId: String, part: Int, bytes: ByteArray): String   // returns the ETag
}

fun interface CheckpointStore {
  suspend fun save(plan: UploadPlan)
}

/**
 * Uploads only the parts that are missing, at most [maxConcurrent] at a time, checkpointing
 * each one. A kill or a failure loses at most the parts that were in flight.
 */
class ResumableUploader(
  private val uploader: PartUploader,
  private val checkpoints: CheckpointStore,
  private val maxConcurrent: Int,
) {
  suspend fun upload(file: ByteArray, initial: UploadPlan): UploadPlan {
    require(file.size == initial.size) { "plan does not match the file" }
    var plan = initial
    val lock = Mutex()
    val parts = Channel<Int>(Channel.UNLIMITED)
    initial.remaining.forEach { parts.trySend(it) }
    parts.close()
    coroutineScope {                                   // one failing part cancels the others
      repeat(maxConcurrent) {                          // N workers share one queue of parts
        launch {
          for (part in parts) {
            val range = initial.byteRange(part)
            val bytes = file.copyOfRange(range.first, range.last + 1)
            val etag = uploader.upload(initial.fileId, part, bytes)
            lock.withLock {
              plan = plan.copy(completed = plan.completed + (part to etag))
              checkpoints.save(plan)                   // durable before this worker takes another part
            }
          }
        }
      }
    }
    return plan
  }
}
