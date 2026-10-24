import Foundation
import CoreFoundation

struct ProgressSyncRecord: Codable, Equatable, Sendable {
    static let maximumClock: Int64 = 9_007_199_254_740_991
    let dictionaryID: String
    let wordID: String
    let level: Int
    let clock: Int64
    let deviceID: String

    // Swift String equality normalizes Unicode; wire identifiers use their exact UTF-8 bytes.
    var key: String { SyncRecordIdentity.key(dictionaryID: dictionaryID, wordID: wordID) }
    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.dictionaryID.utf8.elementsEqual(rhs.dictionaryID.utf8) && lhs.wordID.utf8.elementsEqual(rhs.wordID.utf8) &&
        lhs.level == rhs.level && lhs.clock == rhs.clock && lhs.deviceID == rhs.deviceID
    }
    func validate() throws {
        func identifier(_ value: String, maximum: Int) -> Bool {
            !value.isEmpty && value.unicodeScalars.count <= maximum &&
            !["__proto__", "constructor", "prototype"].contains(value) &&
            !value.unicodeScalars.contains(where: { $0.properties.generalCategory == .control })
        }
        let validDevice = deviceID.count == 32 && deviceID.utf8.allSatisfy { (48...57).contains($0) || (97...102).contains($0) }
        guard identifier(dictionaryID, maximum: 128), identifier(wordID, maximum: 256),
              (0...3).contains(level), (0...Self.maximumClock).contains(clock),
              validDevice || (clock == 0 && deviceID.isEmpty) else { throw ProgressSyncError.invalidResponse }
    }
    func wins(over other: Self) -> Bool {
        if clock != other.clock { return clock > other.clock }
        if deviceID != other.deviceID { return deviceID > other.deviceID }
        return level > other.level
    }
    static func wireInteger(_ value: Any?) -> Int64? {
        guard let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID(),
              !["f", "d"].contains(String(cString: number.objCType)) else { return nil }
        return number.int64Value
    }
    static func decodeEnvelope(_ data: Data) throws -> [Self] {
        guard let envelope = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              Set(envelope.keys) == ["version", "records"], wireInteger(envelope["version"]) == 1,
              let rawRecords = envelope["records"] as? [[String: Any]], rawRecords.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        let records = try rawRecords.map { raw -> Self in
            guard Set(raw.keys) == ["dictionaryID", "wordID", "level", "clock", "deviceID"],
                  let dictionaryID = raw["dictionaryID"] as? String, let wordID = raw["wordID"] as? String,
                  let level = wireInteger(raw["level"]), let clock = wireInteger(raw["clock"]),
                  let deviceID = raw["deviceID"] as? String, (0...3).contains(level) else { throw ProgressSyncError.invalidResponse }
            let record = Self(dictionaryID: dictionaryID, wordID: wordID, level: Int(level), clock: clock, deviceID: deviceID)
            try record.validate(); return record
        }
        return try canonical(records)
    }
    static func canonical(_ records: [Self]) throws -> [Self] {
        var result: [String: Self] = [:]
        for record in records {
            try record.validate()
            if result[record.key].map({ record.wins(over: $0) }) ?? true { result[record.key] = record }
        }
        guard result.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        return result.values.sorted {
            SyncRecordIdentity.precedes(dictionaryID: $0.dictionaryID, wordID: $0.wordID,
                                        otherDictionaryID: $1.dictionaryID, otherWordID: $1.wordID)
        }
    }
}

struct ProgressSyncMetadata: Codable, Equatable {
    var deviceID = UUID().uuidString.replacingOccurrences(of: "-", with: "").lowercased()
    var counter: Int64 = 0
    var records: [ProgressSyncRecord] = []

    mutating func validate() throws {
        try ProgressSyncRecord(dictionaryID: "metadata", wordID: "metadata", level: 0, clock: 1, deviceID: deviceID).validate()
        guard (0...ProgressSyncRecord.maximumClock).contains(counter) else { throw ProgressSyncError.invalidResponse }
        records = try ProgressSyncRecord.canonical(records)
        counter = max(counter, records.map(\.clock).max() ?? 0)
    }
    mutating func seed(_ progress: [String: [String: Int]]) throws {
        var known = Set(records.map(\.key))
        for (dictionaryID, values) in progress {
            for (wordID, level) in values where level > 0 {
                let record = ProgressSyncRecord(dictionaryID: dictionaryID, wordID: wordID, level: level, clock: 0, deviceID: "")
                if known.insert(record.key).inserted { try record.validate(); records.append(record) }
            }
        }
        records = try ProgressSyncRecord.canonical(records)
    }
    mutating func edit(dictionaryID: String, wordID: String, level: Int) throws {
        guard counter < ProgressSyncRecord.maximumClock else { throw ProgressSyncError.clockLimit }
        counter += 1
        let record = ProgressSyncRecord(dictionaryID: dictionaryID, wordID: wordID, level: level, clock: counter, deviceID: deviceID)
        try record.validate()
        records.removeAll { $0.key == record.key }; records.append(record)
        records = try ProgressSyncRecord.canonical(records)
    }
    mutating func merge(_ incoming: [ProgressSyncRecord]) throws {
        records = try ProgressSyncRecord.canonical(records + incoming)
        counter = max(counter, records.map(\.clock).max() ?? 0)
    }
}

enum ProgressSyncError: LocalizedError {
    case invalidResponse, invalidCode, unauthorized, server, storage, clockLimit, credentialStorage
    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "同步資料格式不正確，本機進度已保留。"
        case .invalidCode: return "請輸入完整的 Mots 配對碼。"
        case .unauthorized: return "配對碼無效，請檢查後重新配對。"
        case .server: return "同步服務暫時無法使用，稍後會自動重試。"
        case .storage: return "本機進度尚未安全儲存，儲存成功後才能同步。"
        case .clockLimit: return "同步版本已達上限，請先匯出備份。"
        case .credentialStorage: return "無法在鑰匙圈儲存配對碼，請再試一次。"
        }
    }
}
