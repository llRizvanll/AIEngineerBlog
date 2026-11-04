import Foundation

struct FeedPage<Item: Identifiable & Sendable>: Sendable where Item.ID: Sendable {
    let items: [Item]
    let nextCursor: String?
}

/// Cursor-based infinite feed: one request at a time, prefetch before the bottom,
/// drop duplicates when new posts shift the feed, and ignore stale responses after a refresh.
@MainActor
final class FeedPaginator<Item: Identifiable & Sendable> where Item.ID: Sendable {
    enum State: Equatable {
        case idle
        case loading
        case failed(String)
        case end
    }

    private(set) var items: [Item] = []
    private(set) var state: State = .idle

    private let fetch: @Sendable (String?) async throws -> FeedPage<Item>
    private var cursor: String?
    private var seen = Set<Item.ID>()
    private var generation = 0

    init(fetch: @escaping @Sendable (String?) async throws -> FeedPage<Item>) {
        self.fetch = fetch
    }

    func loadNext() async {
        switch state {
        case .loading, .end: return                         // single flight; nothing after the end
        case .idle, .failed: break
        }
        state = .loading
        let requestGeneration = generation

        do {
            let page = try await fetch(cursor)
            guard requestGeneration == generation else { return }   // a refresh happened meanwhile
            let fresh = page.items.filter { seen.insert($0.id).inserted }
            items.append(contentsOf: fresh)
            cursor = page.nextCursor
            state = page.nextCursor == nil ? .end : .idle
        } catch {
            guard requestGeneration == generation else { return }
            state = .failed(String(describing: error))
        }
    }

    func refresh() async {
        generation += 1
        items = []
        seen = []
        cursor = nil
        state = .idle
        await loadNext()
    }

    /// Call from each row's onAppear: start the next page when the user is near the end.
    func rowAppeared(_ item: Item, prefetchDistance: Int = 5) async {
        guard items.suffix(prefetchDistance).contains(where: { $0.id == item.id }) else { return }
        await loadNext()
    }
}
