/// A least-recently-used cache with O(1) reads and writes and a total-cost limit,
/// for example decoded image bytes. Not thread-safe on its own: own it from one
/// actor (see ImageLoader) or guard it with a lock.
final class LRUCache<Key: Hashable, Value> {
    private final class Node {
        let key: Key
        var value: Value
        var cost: Int
        weak var prev: Node?      // weak back-pointer: no retain cycles
        var next: Node?

        init(key: Key, value: Value, cost: Int) {
            self.key = key
            self.value = value
            self.cost = cost
        }
    }

    private var nodes: [Key: Node] = [:]
    private var head: Node?        // most recently used
    private var tail: Node?        // least recently used
    private(set) var totalCost = 0
    let costLimit: Int

    var count: Int { nodes.count }

    init(costLimit: Int) {
        precondition(costLimit > 0, "costLimit must be positive")
        self.costLimit = costLimit
    }

    func value(for key: Key) -> Value? {
        guard let node = nodes[key] else { return nil }
        moveToFront(node)
        return node.value
    }

    func set(_ value: Value, for key: Key, cost: Int = 1) {
        if let node = nodes[key] {
            totalCost += cost - node.cost
            node.value = value
            node.cost = cost
            moveToFront(node)
        } else {
            let node = Node(key: key, value: value, cost: cost)
            nodes[key] = node
            insertAtFront(node)
            totalCost += cost
        }
        evictIfNeeded()
    }

    func removeValue(for key: Key) {
        guard let node = nodes.removeValue(forKey: key) else { return }
        unlink(node)
        totalCost -= node.cost
    }

    func removeAll() {
        nodes.removeAll()
        head = nil
        tail = nil
        totalCost = 0
    }

    // MARK: - Linked list

    private func evictIfNeeded() {
        while totalCost > costLimit, let lru = tail {
            removeValue(for: lru.key)
        }
    }

    private func insertAtFront(_ node: Node) {
        node.prev = nil
        node.next = head
        head?.prev = node
        head = node
        if tail == nil { tail = node }
    }

    private func unlink(_ node: Node) {
        node.prev?.next = node.next
        node.next?.prev = node.prev
        if head === node { head = node.next }
        if tail === node { tail = node.prev }
        node.prev = nil
        node.next = nil
    }

    private func moveToFront(_ node: Node) {
        guard head !== node else { return }
        unlink(node)
        insertAtFront(node)
    }
}
