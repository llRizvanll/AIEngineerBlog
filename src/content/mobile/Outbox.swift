import Foundation

/// One pending local change. `id` is generated on the device and doubles as the
/// idempotency key, so a retried push is applied by the server at most once.
struct PendingOp: Codable, Equatable, Sendable {
    let id: UUID
    let entity: String
    let payload: Data
    var attempts = 0
}

enum PushResult: Equatable, Sendable {
    case applied
    case duplicate                         // server already applied this id: treat as success
    case retryable(after: Duration?)       // 429 / 5xx
    case rejected(reason: String)          // 4xx validation: retrying will never help
}

protocol SyncTransport: Sendable {
    func push(_ op: PendingOp) async throws -> PushResult   // throws when offline
}

protocol OutboxStore: Sendable {
    func load() async -> [PendingOp]
    func save(_ ops: [PendingOp]) async
}

/// Durable, ordered queue of local writes. The UI enqueues and moves on; the sync
/// job drains it whenever the OS gives us time. Safe to kill at any line.
actor Outbox {
    enum DrainOutcome: Equatable, Sendable {
        case drained
        case offline
        case backoff(Duration)
        case alreadyRunning
    }

    private let store: any OutboxStore
    private let transport: any SyncTransport
    private let maxAttempts: Int
    private var queue: [PendingOp] = []
    private(set) var parked: [PendingOp] = []   // needs the user's attention
    private var loaded = false
    private var draining = false

    init(store: any OutboxStore, transport: any SyncTransport, maxAttempts: Int = 8) {
        self.store = store
        self.transport = transport
        self.maxAttempts = maxAttempts
    }

    var pendingCount: Int { queue.count }

    /// Persist first, then return: if the app dies a millisecond later, the intent survives.
    func enqueue(_ op: PendingOp) async {
        await loadIfNeeded()
        queue.append(op)
        await store.save(queue)
    }

    func drain() async -> DrainOutcome {
        guard !draining else { return .alreadyRunning }       // single flight
        draining = true
        defer { draining = false }
        await loadIfNeeded()

        while var op = queue.first {
            let result: PushResult
            do {
                result = try await transport.push(op)
            } catch {
                return .offline                                // keep everything; try again later
            }

            switch result {
            case .applied, .duplicate:
                queue.removeFirst()
            case .rejected:
                parked.append(queue.removeFirst())
            case .retryable(let after):
                op.attempts += 1
                if op.attempts >= maxAttempts {
                    queue.removeFirst()
                    parked.append(op)
                } else {
                    queue[0] = op
                    await store.save(queue)
                    return .backoff(after ?? Backoff.delay(attempt: op.attempts))
                }
            }
            await store.save(queue)                            // checkpoint after every op
        }
        return .drained
    }

    private func loadIfNeeded() async {
        guard !loaded else { return }
        queue = await store.load() + queue
        loaded = true
    }
}
