data class Variant(val name: String, val weight: Int)

data class Experiment(
  val key: String,
  val salt: String,
  val variants: List<Variant>,
  val rolloutPercent: Int = 100,
  val killed: Boolean = false,
)

/** Pure assignment: the same user and experiment always get the same variant, on any device. */
class FlagEvaluator(private val onExposure: (experiment: String, variant: String) -> Unit) {
  private val logged = HashSet<String>()

  fun variantFor(userId: String, exp: Experiment, default: String = "control"): String {
    if (exp.killed) return default                         // kill switch beats everything
    val bucket = bucketOf("${exp.salt}:$userId")
    if (bucket >= exp.rolloutPercent * 100) return default
    val total = exp.variants.sumOf { it.weight }
    var point = bucketOf("${exp.salt}:variant:$userId") % total
    val chosen = exp.variants.first { v -> (point < v.weight).also { if (!it) point -= v.weight } }.name
    // Log once per session, and only when the user actually reaches the feature.
    if (logged.add(exp.key)) onExposure(exp.key, chosen)
    return chosen
  }
}

/** FNV-1a into 0..9999: stable across platforms, unlike hashCode() between languages. */
fun bucketOf(s: String): Int {
  var h = 0x811C9DC5.toInt()
  for (b in s.encodeToByteArray()) {
    h = h xor (b.toInt() and 0xFF)
    h *= 16777619
  }
  return ((h.toLong() and 0xFFFFFFFFL) % 10_000).toInt()
}
