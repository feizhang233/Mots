import Foundation

/// A practical expanding-interval schedule; timestamps use the same milliseconds as Web backups.
struct MemoryRecord: Codable, Equatable {
    let stage: Int
    let dueAt: Double
    let updatedAt: Double

    // A manual reset also uses stage zero, with no interval before the next answer.
    var hasPendingLapse: Bool { stage == 0 && dueAt > updatedAt }

    static let intervals: [Double] = [24 * 60 * 60, 2 * 24 * 60 * 60, 4 * 24 * 60 * 60, 7 * 24 * 60 * 60]
    static let masteryStage = intervals.count + 1
    static let maxTimestamp: Double = 253_402_300_799_999
    static func milliseconds(_ date: Date) -> Double { (date.timeIntervalSince1970 * 1000).rounded(.down) }

    init(stage: Int, dueAt: Double, updatedAt: Double) {
        // Old nine-recall schedules used stages 5...8 for pending reviews and 9 for mastery.
        // Pending cards still require a real final answer; migration never masters them automatically.
        if (5...8).contains(stage), dueAt > 0, dueAt >= updatedAt {
            self.stage = Self.masteryStage - 1
        } else if stage == 9, dueAt == 0 {
            self.stage = Self.masteryStage
        } else { self.stage = stage }
        self.dueAt = dueAt; self.updatedAt = updatedAt
    }

    private struct Field: CodingKey {
        let stringValue: String
        var intValue: Int? { nil }
        init?(stringValue: String) { self.stringValue = stringValue }
        init?(intValue: Int) { return nil }
    }
    private enum CodingKeys: String, CodingKey { case stage, dueAt, updatedAt }
    init(from decoder: Decoder) throws {
        let fields = try decoder.container(keyedBy: Field.self)
        guard Set(fields.allKeys.map(\.stringValue)) == ["stage", "dueAt", "updatedAt"] else {
            throw StudyDataError("卡片記憶進度欄位不正確。")
        }
        let values = try decoder.container(keyedBy: CodingKeys.self)
        self.init(stage: try values.decode(Int.self, forKey: .stage),
                  dueAt: try values.decode(Double.self, forKey: .dueAt),
                  updatedAt: try values.decode(Double.self, forKey: .updatedAt))
        try validate()
    }

    func answering(remembered: Bool, at now: Double) throws -> MemoryRecord {
        let nextStage = remembered ? (stage >= Self.masteryStage ? 1 : stage + 1) : 0
        let interval = remembered && nextStage < Self.masteryStage
            ? Self.intervals[nextStage - 1] : remembered ? 0 : Self.intervals[0]
        let record = MemoryRecord(stage: nextStage, dueAt: nextStage == Self.masteryStage ? 0 : now + interval * 1000, updatedAt: now)
        try record.validate()
        return record
    }

    func validate() throws {
        guard (0...Self.masteryStage).contains(stage),
              dueAt.isFinite, updatedAt.isFinite,
              (0...Self.maxTimestamp).contains(dueAt),
              (0...Self.maxTimestamp).contains(updatedAt),
              dueAt.rounded() == dueAt, updatedAt.rounded() == updatedAt,
              stage == Self.masteryStage ? dueAt == 0 : dueAt >= updatedAt else {
            throw StudyDataError("卡片記憶進度格式不正確。")
        }
    }

    static func validate(_ records: [String: [String: MemoryRecord]]) throws {
        func validID(_ id: String) -> Bool {
            !id.isEmpty && id.utf16.count <= 500 && !StudyImport.unsafeKeys.contains(id)
        }
        guard records.values.reduce(0, { $0 + $1.count }) <= 100_000 else {
            throw StudyDataError("卡片記憶進度數量過多。")
        }
        for (dictionaryID, words) in records {
            guard validID(dictionaryID) else { throw StudyDataError("卡片記憶辭典代碼不正確。") }
            for (wordID, record) in words {
                guard validID(wordID) else { throw StudyDataError("卡片記憶單字代碼不正確。") }
                try record.validate()
            }
        }
    }
}

/// Exact local practice context. Deliberately excluded from portable progress backups.
struct MemorySession: Codable, Equatable {
    // Data-validation guard shared with imported vocabulary capacity; not a practice-round limit.
    static let maximumWords = 100_000
    let deckIDs: [String]
    let currentWordID: String?
    let currentIndex: Int
    let answeredIDs: [String]
    let answeredCount: Int
    let masteredCount: Int
    let revealed: Bool
    let completed: Bool
    let paused: Bool
    let feedback: String?

    var isValid: Bool {
        func identifier(_ value: String) -> Bool {
            !value.isEmpty && value.utf16.count <= 500 && !StudyImport.unsafeKeys.contains(value)
        }
        return deckIDs.count <= Self.maximumWords && Set(deckIDs).count == deckIDs.count && deckIDs.allSatisfy(identifier) &&
            answeredIDs.count <= Self.maximumWords && Set(answeredIDs).count == answeredIDs.count && answeredIDs.allSatisfy(identifier) &&
            currentIndex >= 0 && currentIndex <= deckIDs.count && (currentWordID.map(identifier) ?? true) &&
            answeredCount == answeredIDs.count && (0...answeredCount).contains(masteredCount) &&
            (feedback?.count ?? 0) <= 200
    }
}

/// Ignore damaged session entries without discarding the user's dictionaries or progress.
struct MemorySessionLibrary: Codable {
    var sessions: [String: MemorySession] = [:]
    init(sessions: [String: MemorySession] = [:]) { self.sessions = sessions }

    private struct Key: CodingKey {
        let stringValue: String
        var intValue: Int? { nil }
        init?(stringValue: String) { self.stringValue = stringValue }
        init?(intValue: Int) { nil }
    }
    init(from decoder: Decoder) throws {
        guard let values = try? decoder.container(keyedBy: Key.self) else { return }
        for key in values.allKeys.prefix(100) where !key.stringValue.isEmpty && key.stringValue.utf16.count <= 500 && !StudyImport.unsafeKeys.contains(key.stringValue) {
            if let session = try? values.decode(MemorySession.self, forKey: key), session.isValid {
                sessions[key.stringValue] = session
            }
        }
    }
    func encode(to encoder: Encoder) throws {
        var values = encoder.container(keyedBy: Key.self)
        for (id, session) in sessions {
            if let key = Key(stringValue: id) { try values.encode(session, forKey: key) }
        }
    }
}


/// Wire schedule registers share the conservative backup conflict rule across all clients.
struct MemorySyncRecord: Codable, Equatable {
    let dictionaryID: String
    let wordID: String
    let stage: Int
    let dueAt: Double
    let updatedAt: Double
    var record: MemoryRecord { MemoryRecord(stage: stage, dueAt: dueAt, updatedAt: updatedAt) }

    func validate() throws {
        try ProgressSyncRecord(dictionaryID: dictionaryID, wordID: wordID, level: 0, clock: 0, deviceID: "").validate()
        guard (0...MemoryRecord.masteryStage).contains(stage), record.stage == stage else {
            throw ProgressSyncError.invalidResponse
        }
        try record.validate()
    }
    static func decodeEnvelope(_ data: Data) throws -> [MemorySyncRecord] {
        guard let value = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              Set(value.keys) == ["version", "records"], ProgressSyncRecord.wireInteger(value["version"]) == 1,
              let rows = value["records"] as? [[String: Any]], rows.count <= 100_000 else {
            throw ProgressSyncError.invalidResponse
        }
        for row in rows {
            guard Set(row.keys) == ["dictionaryID", "wordID", "stage", "dueAt", "updatedAt"],
                  ProgressSyncRecord.wireInteger(row["stage"]) != nil,
                  ProgressSyncRecord.wireInteger(row["dueAt"]) != nil,
                  ProgressSyncRecord.wireInteger(row["updatedAt"]) != nil else { throw ProgressSyncError.invalidResponse }
        }
        let records = try JSONDecoder().decode([MemorySyncRecord].self, from: JSONSerialization.data(withJSONObject: rows))
        for record in records { try record.validate() }
        return records
    }
    static func wins(_ incoming: MemoryRecord, over current: MemoryRecord) -> Bool {
        incoming.updatedAt > current.updatedAt || (incoming.updatedAt == current.updatedAt &&
            (incoming.stage < current.stage || (incoming.stage == current.stage && incoming.dueAt > current.dueAt)))
    }
}
