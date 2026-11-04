/// The changes a list view needs to animate from `old` to `new`:
/// deletions (old indices), insertions (new indices), moves and in-place reloads.
struct ListDiff: Equatable {
    struct Move: Equatable {
        let from: Int
        let to: Int
    }
    var deletes: [Int] = []
    var inserts: [Int] = []
    var moves: [Move] = []
    var reloads: [Int] = []          // new indices whose content changed

    var isEmpty: Bool { deletes.isEmpty && inserts.isEmpty && moves.isEmpty && reloads.isEmpty }
}

/// O(n log n) diff keyed by identity. Items that keep their relative order stay put
/// (the longest increasing subsequence); only the others are reported as moves.
func diff<T: Identifiable & Equatable>(old: [T], new: [T]) -> ListDiff {
    var result = ListDiff()
    var oldIndex: [T.ID: Int] = [:]
    for (i, item) in old.enumerated() { oldIndex[item.id] = i }
    let newIDs = Set(new.map(\.id))

    result.deletes = old.indices.filter { !newIDs.contains(old[$0].id) }

    // Old positions of the surviving items, in their new order.
    var survivors: [(old: Int, new: Int)] = []
    for (j, item) in new.enumerated() {
        if let i = oldIndex[item.id] {
            survivors.append((i, j))
            if old[i] != item { result.reloads.append(j) }
        } else {
            result.inserts.append(j)
        }
    }

    let stay = Set(longestIncreasingSubsequence(survivors.map(\.old)))
    for (k, pair) in survivors.enumerated() where !stay.contains(k) {
        result.moves.append(.init(from: pair.old, to: pair.new))
    }
    return result
}

/// Indices (into `values`) of one longest strictly increasing subsequence. Patience sorting.
func longestIncreasingSubsequence(_ values: [Int]) -> [Int] {
    var tails: [Int] = []                        // index of the smallest tail for each length
    var previous = Array(repeating: -1, count: values.count)
    for (i, v) in values.enumerated() {
        var lo = 0, hi = tails.count
        while lo < hi {                          // first tail ≥ v
            let mid = (lo + hi) / 2
            if values[tails[mid]] < v { lo = mid + 1 } else { hi = mid }
        }
        if lo > 0 { previous[i] = tails[lo - 1] }
        if lo == tails.count { tails.append(i) } else { tails[lo] = i }
    }
    var out: [Int] = []
    var k = tails.last ?? -1
    while k >= 0 {
        out.append(k)
        k = previous[k]
    }
    return out.reversed()
}
