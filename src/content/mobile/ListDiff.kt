/**
 * The changes a list needs to animate from old to new: deletions (old indices),
 * insertions (new indices), moves and in-place reloads.
 */
data class ListDiff(
  val deletes: List<Int> = emptyList(),
  val inserts: List<Int> = emptyList(),
  val moves: List<Move> = emptyList(),
  val reloads: List<Int> = emptyList(),                // new indices whose content changed
) {
  data class Move(val from: Int, val to: Int)

  val isEmpty: Boolean get() = deletes.isEmpty() && inserts.isEmpty() && moves.isEmpty() && reloads.isEmpty()
}

/**
 * O(n log n) diff keyed by identity. Items that keep their relative order stay put
 * (the longest increasing subsequence); only the others are reported as moves.
 */
fun <T, ID> diff(old: List<T>, new: List<T>, idOf: (T) -> ID): ListDiff {
  val oldIndex = HashMap<ID, Int>()
  old.forEachIndexed { i, item -> oldIndex[idOf(item)] = i }
  val newIds = new.mapTo(HashSet(), idOf)
  val deletes = old.indices.filter { idOf(old[it]) !in newIds }

  val inserts = mutableListOf<Int>()
  val reloads = mutableListOf<Int>()
  val survivors = mutableListOf<Pair<Int, Int>>()      // (old index, new index) in new order
  new.forEachIndexed { j, item ->
    val i = oldIndex[idOf(item)]
    if (i == null) {
      inserts += j
    } else {
      survivors += i to j
      if (old[i] != item) reloads += j
    }
  }

  val stay = longestIncreasingSubsequence(survivors.map { it.first }).toHashSet()
  val moves = survivors.filterIndexed { k, _ -> k !in stay }.map { (from, to) -> ListDiff.Move(from, to) }
  return ListDiff(deletes, inserts, moves, reloads)
}

/** Indices (into [values]) of one longest strictly increasing subsequence. Patience sorting. */
fun longestIncreasingSubsequence(values: List<Int>): List<Int> {
  val tails = mutableListOf<Int>()                     // index of the smallest tail for each length
  val previous = IntArray(values.size) { -1 }
  values.forEachIndexed { i, v ->
    var lo = 0
    var hi = tails.size
    while (lo < hi) {                                  // first tail >= v
      val mid = (lo + hi) ushr 1
      if (values[tails[mid]] < v) lo = mid + 1 else hi = mid
    }
    if (lo > 0) previous[i] = tails[lo - 1]
    if (lo == tails.size) tails += i else tails[lo] = i
  }
  val out = ArrayDeque<Int>()
  var k = tails.lastOrNull() ?: -1
  while (k >= 0) {
    out.addFirst(k)
    k = previous[k]
  }
  return out
}
