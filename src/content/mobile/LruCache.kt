/**
 * A least-recently-used cache with O(1) reads and writes and a total-cost limit,
 * for example decoded image bytes. Not thread-safe on its own: confine it to one
 * coroutine or guard it with a Mutex (see ImageLoader).
 */
class LruCache<K : Any, V : Any>(val costLimit: Int) {
  private class Node<K, V>(val key: K, var value: V, var cost: Int) {
    var prev: Node<K, V>? = null
    var next: Node<K, V>? = null
  }

  private val nodes = HashMap<K, Node<K, V>>()
  private var head: Node<K, V>? = null   // most recently used
  private var tail: Node<K, V>? = null   // least recently used
  var totalCost = 0
    private set
  val size: Int get() = nodes.size

  init {
    require(costLimit > 0) { "costLimit must be positive" }
  }

  operator fun get(key: K): V? {
    val node = nodes[key] ?: return null
    moveToFront(node)
    return node.value
  }

  fun put(key: K, value: V, cost: Int = 1) {
    val node = nodes[key]
    if (node != null) {
      totalCost += cost - node.cost
      node.value = value
      node.cost = cost
      moveToFront(node)
    } else {
      val fresh = Node(key, value, cost)
      nodes[key] = fresh
      insertAtFront(fresh)
      totalCost += cost
    }
    evictIfNeeded()
  }

  fun remove(key: K) {
    val node = nodes.remove(key) ?: return
    unlink(node)
    totalCost -= node.cost
  }

  fun clear() {
    nodes.clear()
    head = null
    tail = null
    totalCost = 0
  }

  private fun evictIfNeeded() {
    while (totalCost > costLimit) {
      remove(tail?.key ?: return)
    }
  }

  private fun insertAtFront(node: Node<K, V>) {
    node.prev = null
    node.next = head
    head?.prev = node
    head = node
    if (tail == null) tail = node
  }

  private fun unlink(node: Node<K, V>) {
    node.prev?.next = node.next
    node.next?.prev = node.prev
    if (head === node) head = node.next
    if (tail === node) tail = node.prev
    node.prev = null
    node.next = null
  }

  private fun moveToFront(node: Node<K, V>) {
    if (head === node) return
    unlink(node)
    insertAtFront(node)
  }
}
