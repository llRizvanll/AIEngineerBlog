package programme

// region: sample
/** Decode a 4000 px photo for a 400 px row at 1/8 size: 64 times less memory, same look. */
fun inSampleSize(width: Int, height: Int, targetW: Int, targetH: Int): Int {
  var sample = 1
  while (width / (sample * 2) >= targetW && height / (sample * 2) >= targetH) sample *= 2
  return sample
}

fun bitmapBytes(width: Int, height: Int, sample: Int): Long =
  (width / sample).toLong() * (height / sample) * 4     // 4 bytes per pixel
// endregion

// region: page
data class Post(val id: String, val createdAtMs: Long)
data class Feed(val posts: List<Post> = emptyList(), val cursor: String? = null)

/** A post can slide onto two pages as new ones arrive, so duplicates are normal. Drop them by ID. */
fun Feed.append(page: List<Post>, next: String?): Feed {
  val seen = posts.mapTo(HashSet()) { it.id }
  return Feed(posts + page.filter { seen.add(it.id) }, next)
}

/** Fresh posts wait behind a pill unless the reader is at the top, so the list never jumps. */
fun Feed.onFresh(fresh: List<Post>, atTop: Boolean): Pair<Feed, Int> {
  val seen = posts.mapTo(HashSet()) { it.id }
  val new = fresh.filter { it.id !in seen }
  return if (atTop) copy(posts = new + posts) to 0 else this to new.size
}
// endregion

// region: startup
data class Phase(val name: String, val ms: Long)

/** Fails CI, and names the phases to look at first. */
class StartupBudget(private val totalMs: Long) {
  fun check(phases: List<Phase>): List<String> {
    if (phases.sumOf { it.ms } <= totalMs) return emptyList()
    return phases.sortedByDescending { it.ms }.take(2).map { "${it.name} took ${it.ms} ms" }
  }
}
// endregion
