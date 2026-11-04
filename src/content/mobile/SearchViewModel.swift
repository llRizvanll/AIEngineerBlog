import Foundation

/// Search-as-you-type: debounce keystrokes, cancel stale requests, never show
/// results for a query the user has already changed.
@MainActor
final class SearchViewModel {
    private(set) var results: [String] = []
    private(set) var isLoading = false
    private(set) var errorMessage: String?

    private let search: @Sendable (String) async throws -> [String]
    private let debounce: Duration
    private let minLength: Int
    private var task: Task<Void, Never>?

    init(
        debounce: Duration = .milliseconds(300),
        minLength: Int = 2,
        search: @escaping @Sendable (String) async throws -> [String]
    ) {
        self.debounce = debounce
        self.minLength = minLength
        self.search = search
    }

    func queryChanged(_ text: String) {
        task?.cancel()                                   // latest keystroke wins
        let query = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard query.count >= minLength else {
            results = []
            isLoading = false
            return
        }

        task = Task { [weak self, debounce, search] in
            do {
                try await Task.sleep(for: debounce)      // throws if a newer keystroke cancelled us
                self?.isLoading = true
                let found = try await search(query)
                try Task.checkCancellation()             // the query changed while we waited
                self?.results = found
                self?.errorMessage = nil
                self?.isLoading = false
            } catch is CancellationError {
                return                                   // the newer task owns the UI state
            } catch {
                self?.errorMessage = "Search failed. Pull to retry."
                self?.isLoading = false
            }
        }
    }
}
