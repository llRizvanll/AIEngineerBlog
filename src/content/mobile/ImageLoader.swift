import Foundation

protocol ImageFetching: Sendable {
    func fetch(_ url: URL) async throws -> Data
}

protocol DiskCaching: Sendable {
    func data(for key: String) async -> Data?
    func store(_ data: Data, for key: String) async
}

/// Memory → disk → network image loading with request coalescing:
/// fifty cells asking for the same URL trigger exactly one download.
actor ImageLoader {
    private let fetcher: any ImageFetching
    private let disk: (any DiskCaching)?
    private let memory: LRUCache<URL, Data>
    private var inFlight: [URL: Task<Data, any Error>] = [:]

    init(fetcher: any ImageFetching, disk: (any DiskCaching)? = nil, memoryLimit: Int = 50 * 1024 * 1024) {
        self.fetcher = fetcher
        self.disk = disk
        self.memory = LRUCache(costLimit: memoryLimit)
    }

    func data(for url: URL) async throws -> Data {
        if let hit = memory.value(for: url) { return hit }       // 1. memory
        if let running = inFlight[url] {                          // 2. join the request already running
            return try await running.value
        }

        let task = Task { [fetcher, disk] in
            let key = url.absoluteString
            if let cached = await disk?.data(for: key) { return cached }   // 3. disk
            let fresh = try await fetcher.fetch(url)                        // 4. network
            await disk?.store(fresh, for: key)
            return fresh
        }
        inFlight[url] = task
        defer { inFlight[url] = nil }

        let data = try await task.value
        memory.set(data, for: url, cost: data.count)
        return data
    }

    /// Call when a cell is reused before its image arrives and nobody else needs it.
    func cancel(_ url: URL) {
        inFlight[url]?.cancel()
        inFlight[url] = nil
    }

    func clearMemory() {
        memory.removeAll()
    }
}
