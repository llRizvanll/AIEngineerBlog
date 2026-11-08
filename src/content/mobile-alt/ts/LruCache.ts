/**
 * A least-recently-used cache with O(1) reads and writes and a total-cost limit,
 * for example decoded image bytes. JavaScript runs one task at a time, so no lock is needed.
 */
class Node<K, V> {
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;
  key: K;
  value: V;
  cost: number;
  constructor(key: K, value: V, cost: number) {
    this.key = key;
    this.value = value;
    this.cost = cost;
  }
}

export class LruCache<K, V> {
  readonly costLimit: number;
  totalCost = 0;
  private nodes = new Map<K, Node<K, V>>();
  private head: Node<K, V> | null = null;   // most recently used
  private tail: Node<K, V> | null = null;   // least recently used

  constructor(costLimit: number) {
    if (!(costLimit > 0)) throw new Error("costLimit must be positive");
    this.costLimit = costLimit;
  }

  get size(): number {
    return this.nodes.size;
  }

  get(key: K): V | undefined {
    const node = this.nodes.get(key);
    if (!node) return undefined;
    this.moveToFront(node);
    return node.value;
  }

  put(key: K, value: V, cost = 1): void {
    const node = this.nodes.get(key);
    if (node) {
      this.totalCost += cost - node.cost;
      node.value = value;
      node.cost = cost;
      this.moveToFront(node);
    } else {
      const fresh = new Node(key, value, cost);
      this.nodes.set(key, fresh);
      this.insertAtFront(fresh);
      this.totalCost += cost;
    }
    this.evictIfNeeded();
  }

  remove(key: K): void {
    const node = this.nodes.get(key);
    if (!node) return;
    this.nodes.delete(key);
    this.unlink(node);
    this.totalCost -= node.cost;
  }

  clear(): void {
    this.nodes.clear();
    this.head = null;
    this.tail = null;
    this.totalCost = 0;
  }

  private evictIfNeeded(): void {
    while (this.totalCost > this.costLimit && this.tail) this.remove(this.tail.key);
  }

  private insertAtFront(node: Node<K, V>): void {
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private unlink(node: Node<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (this.head === node) this.head = node.next;
    if (this.tail === node) this.tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  private moveToFront(node: Node<K, V>): void {
    if (this.head === node) return;
    this.unlink(node);
    this.insertAtFront(node);
  }
}
