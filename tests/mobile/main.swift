import Foundation

// Tests for src/content/mobile/*.swift. Run: npm run test:swift
var failures = 0
@MainActor func check(_ ok: Bool, _ name: String, line: Int = #line) {
    if ok { print("  ✓ \(name)") } else { failures += 1; print("  ✗ \(name) (line \(line))") }
}

// MARK: LRUCache
print("LRUCache")
do {
    let c = LRUCache<String, Int>(costLimit: 3)
    c.set(1, for: "a"); c.set(2, for: "b"); c.set(3, for: "c")
    _ = c.value(for: "a")                 // a is now most recent
    c.set(4, for: "d")                    // evicts b (least recent)
    check(c.value(for: "b") == nil && c.value(for: "a") == 1 && c.count == 3, "evicts least recently used")
    c.set(9, for: "c", cost: 3)           // update grows cost → evicts others
    check(c.totalCost <= 3 && c.value(for: "c") == 9, "respects cost limit on update")
    c.removeValue(for: "c")
    check(c.count == 0 && c.totalCost == 0, "remove resets cost")
}

// MARK: ImageLoader
print("ImageLoader")
actor CountingFetcher: ImageFetching {
    private(set) var calls = 0
    func fetch(_ url: URL) async throws -> Data {
        calls += 1
        try await Task.sleep(for: .milliseconds(50))
        return Data(url.absoluteString.utf8)
    }
}
do {
    let fetcher = CountingFetcher()
    let loader = ImageLoader(fetcher: fetcher)
    let url = URL(string: "https://cdn.example.com/a.jpg")!
    let results = try await withThrowingTaskGroup(of: Data.self) { group in
        for _ in 0..<20 { group.addTask { try await loader.data(for: url) } }
        var out: [Data] = []
        for try await d in group { out.append(d) }
        return out
    }
    check(results.count == 20 && Set(results).count == 1, "20 concurrent callers get the same bytes")
    check(await fetcher.calls == 1, "coalesced into one download")
    _ = try await loader.data(for: url)
    check(await fetcher.calls == 1, "second request served from memory")
}

// MARK: Backoff
print("Backoff")
do {
    let maxD = Backoff.delay(attempt: 3, random: { $0.upperBound })
    check(maxD == .seconds(4), "attempt 3 caps at 0.5s · 8 = 4s")
    let capped = Backoff.delay(attempt: 30, random: { $0.upperBound })
    check(capped == .seconds(60), "never exceeds the cap")
    let zero = Backoff.delay(attempt: 5, random: { $0.lowerBound })
    check(zero == .zero, "full jitter can be zero")

    struct Flaky: RetryAfterProviding { var retryAfter: Duration? }
    var attempts = 0
    var slept: [Duration] = []
    let value = try await withRetry(maxAttempts: 4, sleep: { slept.append($0) }) {
        attempts += 1
        if attempts < 3 { throw Flaky(retryAfter: .seconds(2)) }
        return "ok"
    }
    check(value == "ok" && attempts == 3, "retries until success")
    check(slept == [.seconds(2), .seconds(2)], "honours Retry-After")
}

// MARK: Outbox
print("Outbox")
actor MemoryStore: OutboxStore {
    private(set) var saved: [PendingOp] = []
    func load() async -> [PendingOp] { saved }
    func save(_ ops: [PendingOp]) async { saved = ops }
}
actor ScriptedTransport: SyncTransport {
    var script: [Result<PushResult, any Error>]
    private(set) var pushed: [UUID] = []
    init(_ script: [Result<PushResult, any Error>]) { self.script = script }
    func push(_ op: PendingOp) async throws -> PushResult {
        pushed.append(op.id)
        return try script.removeFirst().get()
    }
}
struct Offline: Error {}
do {
    let store = MemoryStore()
    let ops = (0..<3).map { PendingOp(id: UUID(), entity: "note", payload: Data([UInt8($0)])) }
    let transport = ScriptedTransport([
        .success(.applied), .failure(Offline()),                        // first drain: 1 applied, then offline
        .success(.duplicate), .success(.rejected(reason: "bad")),         // second drain
    ])
    let outbox = Outbox(store: store, transport: transport)
    for op in ops { await outbox.enqueue(op) }
    check(await store.saved.count == 3, "enqueue persists before returning")
    check(await outbox.drain() == .offline, "stops when offline")
    check(await store.saved.map(\.id) == Array(ops.dropFirst()).map(\.id), "applied op removed, order kept")
    check(await outbox.drain() == .drained, "drains the rest")
    check(await outbox.parked.map(\.id) == [ops[2].id], "rejected op parked for the user")
    check(await transport.pushed == [ops[0].id, ops[1].id, ops[1].id, ops[2].id], "retries the same op id (idempotent)")

    let reloaded = Outbox(store: store, transport: ScriptedTransport([]))
    check(await reloaded.pendingCount == 0, "nothing left after a full drain")
}
do {
    let store = MemoryStore()
    let op = PendingOp(id: UUID(), entity: "job", payload: Data())
    let outbox = Outbox(store: store, transport: ScriptedTransport([.success(.retryable(after: .seconds(5)))]))
    await outbox.enqueue(op)
    check(await outbox.drain() == .backoff(.seconds(5)), "server Retry-After becomes the backoff")
    check(await store.saved.first?.attempts == 1, "attempt count is persisted")
}

// MARK: SearchViewModel
print("SearchViewModel")
final class Calls: @unchecked Sendable {
    private let lock = NSLock()
    private var values: [String] = []
    func add(_ v: String) { lock.lock(); values.append(v); lock.unlock() }
    var all: [String] { lock.lock(); defer { lock.unlock() }; return values }
}
do {
    let calls = Calls()
    let vm = SearchViewModel(debounce: .milliseconds(60)) { q in
        calls.add(q)
        return ["\(q) result"]
    }
    vm.queryChanged("s")
    vm.queryChanged("sw")
    vm.queryChanged("swi")
    vm.queryChanged("swift")
    try await Task.sleep(for: .milliseconds(250))
    check(calls.all == ["swift"], "only the last keystroke hits the network")
    check(vm.results == ["swift result"] && !vm.isLoading, "shows results for the latest query")
    vm.queryChanged("a")
    check(vm.results.isEmpty, "short query clears results")
}

// MARK: FeedPaginator
print("FeedPaginator")
struct Post: Identifiable, Sendable, Equatable { let id: Int }
do {
    let pages: [String?: FeedPage<Post>] = [
        nil: FeedPage(items: [Post(id: 1), Post(id: 2)], nextCursor: "c1"),
        "c1": FeedPage(items: [Post(id: 2), Post(id: 3)], nextCursor: nil),   // id 2 shifted into page 2
    ]
    let feed = FeedPaginator<Post> { cursor in pages[cursor]! }
    await feed.loadNext()
    await feed.loadNext()
    check(feed.items.map(\.id) == [1, 2, 3], "duplicates from a shifted feed are dropped")
    check(feed.state == .end, "stops at the last page")
    await feed.loadNext()
    check(feed.items.count == 3, "no requests after the end")
    await feed.refresh()
    check(feed.items.map(\.id) == [1, 2] && feed.state == .idle, "refresh starts over")
}

// MARK: ResumableUploader
print("ResumableUploader")
actor FlakyParts: PartUploading {
    var failOnce: Set<Int>
    private(set) var uploaded: [Int] = []
    private(set) var maxInFlight = 0
    private var inFlight = 0
    init(failOnce: Set<Int>) { self.failOnce = failOnce }
    func upload(fileID: String, part: Int, bytes: Data) async throws -> String {
        inFlight += 1
        maxInFlight = max(maxInFlight, inFlight)
        defer { inFlight -= 1 }
        try await Task.sleep(for: .milliseconds(10))
        if failOnce.remove(part) != nil { throw Offline() }
        uploaded.append(part)
        return "etag-\(part)-\(bytes.count)"
    }
}
actor PlanStore: CheckpointStore {
    private(set) var last: UploadPlan?
    func save(_ plan: UploadPlan) async { last = plan }
}
do {
    let file = Data(repeating: 7, count: 10_000)
    let parts = FlakyParts(failOnce: [5])
    let store = PlanStore()
    let uploader = ResumableUploader(uploader: parts, checkpoints: store, maxConcurrent: 3)
    let plan = UploadPlan(fileID: "f1", size: file.count, partSize: 1_000)
    do {
        _ = try await uploader.upload(file, plan: plan)
        check(false, "first attempt should fail")
    } catch {
        let saved = await store.last!
        check(!saved.isComplete && saved.completed[5] == nil, "failure keeps a checkpoint without part 5")
        let before = await parts.uploaded.count
        let finished = try await uploader.upload(file, plan: saved)
        let after = await parts.uploaded.count
        check(finished.isComplete, "resume completes the upload")
        check(after - before == saved.remaining.count, "resume uploads only missing parts")
        check(await parts.maxInFlight <= 3, "never more than 3 parts in flight")
        check(finished.completed[9] == "etag-9-1000", "last part has the right size")
    }
}

// MARK: TokenBucket
print("TokenBucket")
do {
    let t0 = ContinuousClock.now
    var bucket = TokenBucket(capacity: 3, refillPerSecond: 1, now: t0)
    let burst = (0..<4).map { _ in bucket.tryConsume(now: t0) }
    check(burst == [true, true, true, false], "allows a burst of 3 then blocks")
    check(bucket.waitTime(now: t0) == .seconds(1), "knows how long to wait")
    check(bucket.tryConsume(now: t0.advanced(by: .seconds(1))), "refills over time")
    check(!bucket.tryConsume(now: t0.advanced(by: .seconds(1))), "but only at the refill rate")
}

// MARK: ListDiff
print("ListDiff")
struct Row: Identifiable, Equatable { let id: String; var title: String }
do {
    let old = ["A", "B", "C", "D"].map { Row(id: $0, title: $0) }
    var new = ["B", "A", "D", "E"].map { Row(id: $0, title: $0) }
    new[2].title = "D v2"
    let d = diff(old: old, new: new)
    check(d.deletes == [2], "C deleted")
    check(d.inserts == [3], "E inserted")
    check(d.moves.count == 1, "one move, not two")
    check(d.reloads == [2], "changed D reloaded")
    check(diff(old: old, new: old).isEmpty, "identical lists produce no changes")
    check(longestIncreasingSubsequence([3, 1, 2, 5, 4]).count == 3, "LIS length")
}

print(failures == 0 ? "\nALL SWIFT TESTS PASSED" : "\n\(failures) FAILED")
exit(failures == 0 ? 0 : 1)
