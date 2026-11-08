import java.util.HashMap;
import java.util.Map;

/**
 * A least-recently-used cache with O(1) reads and writes and a total-cost limit,
 * for example decoded image bytes. Not thread-safe on its own: guard it with a lock (see ImageLoader).
 */
public final class LruCache<K, V> {
  private static final class Node<K, V> {
    final K key;
    V value;
    int cost;
    Node<K, V> prev;
    Node<K, V> next;

    Node(K key, V value, int cost) {
      this.key = key;
      this.value = value;
      this.cost = cost;
    }
  }

  private final Map<K, Node<K, V>> nodes = new HashMap<>();
  private final int costLimit;
  private Node<K, V> head;   // most recently used
  private Node<K, V> tail;   // least recently used
  private int totalCost;

  public LruCache(int costLimit) {
    if (costLimit <= 0) throw new IllegalArgumentException("costLimit must be positive");
    this.costLimit = costLimit;
  }

  public int size() { return nodes.size(); }

  public int totalCost() { return totalCost; }

  public V get(K key) {
    Node<K, V> node = nodes.get(key);
    if (node == null) return null;
    moveToFront(node);
    return node.value;
  }

  public void put(K key, V value) { put(key, value, 1); }

  public void put(K key, V value, int cost) {
    Node<K, V> node = nodes.get(key);
    if (node != null) {
      totalCost += cost - node.cost;
      node.value = value;
      node.cost = cost;
      moveToFront(node);
    } else {
      Node<K, V> fresh = new Node<>(key, value, cost);
      nodes.put(key, fresh);
      insertAtFront(fresh);
      totalCost += cost;
    }
    evictIfNeeded();
  }

  public void remove(K key) {
    Node<K, V> node = nodes.remove(key);
    if (node == null) return;
    unlink(node);
    totalCost -= node.cost;
  }

  public void clear() {
    nodes.clear();
    head = null;
    tail = null;
    totalCost = 0;
  }

  private void evictIfNeeded() {
    while (totalCost > costLimit && tail != null) remove(tail.key);
  }

  private void insertAtFront(Node<K, V> node) {
    node.prev = null;
    node.next = head;
    if (head != null) head.prev = node;
    head = node;
    if (tail == null) tail = node;
  }

  private void unlink(Node<K, V> node) {
    if (node.prev != null) node.prev.next = node.next;
    if (node.next != null) node.next.prev = node.prev;
    if (head == node) head = node.next;
    if (tail == node) tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  private void moveToFront(Node<K, V> node) {
    if (head == node) return;
    unlink(node);
    insertAtFront(node);
  }
}
