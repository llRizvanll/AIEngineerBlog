import Foundation

/// The resumable state of one multipart upload. Persist it after every part:
/// it is all you need to continue after the app is killed.
struct UploadPlan: Codable, Equatable, Sendable {
    let fileID: String
    let size: Int
    let partSize: Int
    var completed: [Int: String] = [:]          // part number → ETag

    var partCount: Int { (size + partSize - 1) / partSize }
    var remaining: [Int] { (0..<partCount).filter { completed[$0] == nil } }
    var isComplete: Bool { completed.count == partCount }

    func byteRange(of part: Int) -> Range<Int> {
        (part * partSize)..<min(size, (part + 1) * partSize)
    }
}

protocol PartUploading: Sendable {
    func upload(fileID: String, part: Int, bytes: Data) async throws -> String   // returns ETag
}

protocol CheckpointStore: Sendable {
    func save(_ plan: UploadPlan) async
}

/// Uploads only the parts that are missing, a few at a time, checkpointing each one.
/// A kill or a failure loses at most the parts that were in flight.
struct ResumableUploader: Sendable {
    let uploader: any PartUploading
    let checkpoints: any CheckpointStore
    let maxConcurrent: Int

    func upload(_ file: Data, plan initial: UploadPlan) async throws -> UploadPlan {
        precondition(file.count == initial.size, "plan does not match the file")
        var plan = initial
        var pending = plan.remaining.makeIterator()

        let uploadPart: @Sendable (Int) async throws -> (Int, String) = { [uploader, layout = initial] part in
            let bytes = file.subdata(in: layout.byteRange(of: part))
            return (part, try await uploader.upload(fileID: layout.fileID, part: part, bytes: bytes))
        }

        try await withThrowingTaskGroup(of: (Int, String).self) { group in
            for _ in 0..<maxConcurrent {                         // fill the window
                guard let part = pending.next() else { break }
                group.addTask { try await uploadPart(part) }
            }
            while let (part, etag) = try await group.next() {     // one finishes → checkpoint → start one
                plan.completed[part] = etag
                await checkpoints.save(plan)
                if let next = pending.next() {
                    group.addTask { try await uploadPart(next) }
                }
            }
        }
        return plan
    }
}
