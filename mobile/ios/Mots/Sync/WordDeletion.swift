import Foundation
import CoreFoundation

/// Visibility is independent of familiarity: restoring a word retains its original rating.
struct WordDeletionRecord: Codable, Equatable, Sendable {
    let dictionaryID: String
    let wordID: String
    let deleted: Bool
    let clock: Int64
    let deviceID: String

    var key: String { Self.key(dictionaryID: dictionaryID, wordID: wordID) }
    static func key(dictionaryID: String, wordID: String) -> String {
        SyncRecordIdentity.key(dictionaryID: dictionaryID, wordID: wordID)
    }
    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.dictionaryID.utf8.elementsEqual(rhs.dictionaryID.utf8) && lhs.wordID.utf8.elementsEqual(rhs.wordID.utf8) &&
        lhs.deleted == rhs.deleted && lhs.clock == rhs.clock && lhs.deviceID == rhs.deviceID
    }
    func validate() throws {
        guard !deviceID.isEmpty else { throw ProgressSyncError.invalidResponse }
        try ProgressSyncRecord(dictionaryID: dictionaryID, wordID: wordID, level: 0, clock: clock, deviceID: deviceID).validate()
    }
    func wins(over other: Self) -> Bool {
        if clock != other.clock { return clock > other.clock }
        if deviceID != other.deviceID { return deviceID > other.deviceID }
        return deleted && !other.deleted
    }
    static func canonical(_ input: [Self]) throws -> [Self] {
        var winners: [String: Self] = [:]
        for record in input {
            try record.validate()
            if winners[record.key].map({ record.wins(over: $0) }) ?? true { winners[record.key] = record }
        }
        guard winners.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        return winners.values.sorted {
            SyncRecordIdentity.precedes(dictionaryID: $0.dictionaryID, wordID: $0.wordID,
                                        otherDictionaryID: $1.dictionaryID, otherWordID: $1.wordID)
        }
    }
    static func decodeRecords(_ value: Any) throws -> [Self] {
        guard let records = value as? [[String: Any]], records.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        return try canonical(records.map { raw in
            guard Set(raw.keys) == ["dictionaryID", "wordID", "deleted", "clock", "deviceID"],
                  let dictionaryID = raw["dictionaryID"] as? String, let wordID = raw["wordID"] as? String,
                  let deleted = raw["deleted"] as? NSNumber, CFGetTypeID(deleted) == CFBooleanGetTypeID(),
                  let clock = ProgressSyncRecord.wireInteger(raw["clock"]), let deviceID = raw["deviceID"] as? String else {
                throw ProgressSyncError.invalidResponse
            }
            let record = Self(dictionaryID: dictionaryID, wordID: wordID, deleted: deleted.boolValue, clock: clock, deviceID: deviceID)
            try record.validate(); return record
        })
    }
    static func decodeEnvelope(_ data: Data) throws -> [Self] {
        guard let envelope = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              Set(envelope.keys) == ["version", "records"], ProgressSyncRecord.wireInteger(envelope["version"]) == 1,
              let records = envelope["records"] else { throw ProgressSyncError.invalidResponse }
        return try decodeRecords(records)
    }
}

struct WordDeletionMetadata: Codable, Equatable {
    var deviceID = UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased()
    var counter: Int64 = 0
    var records: [WordDeletionRecord] = []

    mutating func validate() throws {
        try WordDeletionRecord(dictionaryID: "metadata", wordID: "metadata", deleted: false, clock: counter, deviceID: deviceID).validate()
        records = try WordDeletionRecord.canonical(records)
        counter = max(counter, records.map(\.clock).max() ?? 0)
    }
    mutating func edit(dictionaryID: String, wordID: String, deleted: Bool) throws {
        guard counter < ProgressSyncRecord.maximumClock else { throw ProgressSyncError.clockLimit }
        counter += 1
        let record = WordDeletionRecord(dictionaryID: dictionaryID, wordID: wordID, deleted: deleted, clock: counter, deviceID: deviceID)
        try record.validate()
        records.removeAll { $0.key == record.key }; records.append(record)
        records = try WordDeletionRecord.canonical(records)
    }
    mutating func merge(_ incoming: [WordDeletionRecord]) throws {
        records = try WordDeletionRecord.canonical(records + incoming)
        counter = max(counter, records.map(\.clock).max() ?? 0)
    }
    mutating func importAsLocalEdits(_ incoming: [WordDeletionRecord]) throws {
        let incoming = try WordDeletionRecord.canonical(incoming)
        counter = max(counter, incoming.map(\.clock).max() ?? 0)
        for record in incoming {
            try edit(dictionaryID: record.dictionaryID, wordID: record.wordID, deleted: record.deleted)
        }
    }
}
