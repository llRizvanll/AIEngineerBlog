package programme

// region: merge
enum class Policy { LAST_WRITE_WINS, ADD_ONLY, ASK_USER }

/** A field on the server, and the job version at which it last changed. */
data class Stored(val value: String, val version: Int, val by: String)

sealed interface Merge {
  data class Apply(val value: String) : Merge
  data class Refuse(val current: Stored) : Merge
}

/** The product team's table, written down as code. */
fun policyFor(field: String): Policy = when {
  field.startsWith("photos") -> Policy.ADD_ONLY
  field == "instructions" || field == "read_marker" -> Policy.LAST_WRITE_WINS
  else -> Policy.ASK_USER                 // the safe default for anything new
}

fun merge(field: String, incoming: String, baseVersion: Int, current: Stored?): Merge {
  // Nobody touched this field since the user read it: j-81 takes this path.
  if (current == null || current.version <= baseVersion) return Merge.Apply(incoming)

  return when (policyFor(field)) {
    Policy.LAST_WRITE_WINS -> Merge.Apply(incoming)
    Policy.ADD_ONLY -> Merge.Apply("${current.value},$incoming")
    Policy.ASK_USER -> Merge.Refuse(current)            // j-84 takes this path
  }
}
// endregion
