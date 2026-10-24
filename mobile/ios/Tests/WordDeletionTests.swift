import Foundation

@main struct WordDeletionTests {
    static let device = String(repeating: "a", count: 32)
    static let remoteDevice = String(repeating: "f", count: 32)
    static let words = ["a", "b", "c", "d"].map { id in
        StudyWord(id: id, term: ["a": "alpha", "b": "beta", "c": "gamma", "d": "delta"][id]!, meaning: id, category: "1", subcategory: "1.01", language: "fr")
    }
    static let dictionary = StudyDictionary(id: "fr", title: "Deletion fixture", language: "fr", categories: [
        StudyCategory(id: "1", name: "Unit", subcategories: [StudySubcategory(id: "1.01", name: "Lesson")])], words: words)
    static let other = StudyDictionary(id: "de", title: "Other", language: "de", categories: dictionary.categories, words: words)
    static func record(_ id: String, _ deleted: Bool, _ clock: Int64, dictionaryID: String = "fr", deviceID: String = remoteDevice) -> WordDeletionRecord {
        WordDeletionRecord(dictionaryID: dictionaryID, wordID: id, deleted: deleted, clock: clock, deviceID: deviceID)
    }
    static func data(_ object: Any) throws -> Data { try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys]) }
    static func raw(_ records: [WordDeletionRecord]) throws -> Any { try JSONSerialization.jsonObject(with: JSONEncoder().encode(records)) }
    @MainActor static func main() throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-deletion-tests-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: directory) }
        let url = directory.appendingPathComponent("state.json")
        let store = StudyStore(catalog: [dictionary, other], persistenceURL: url)
        store.listMode = true; store.rate(words[0], level: 2); store.rate(words[3], level: 3)
        store.randomOrder = true; store.selectWord(words[1]); store.revealed = true
        let initialOrder = store.filteredWords.map(\.id)
        precondition(store.deleteWord(words[0]))
        precondition(store.currentDictionary.words == words && store.rating(words[0]) == 2 && store.deletedWords.map(\.id) == ["a"])
        precondition(store.currentWord?.id == "b" && store.revealed && store.filteredWords.map(\.id) == initialOrder.filter { $0 != "a" },
            "Deleting another row retains the selected word, reveal state and random order")
        precondition(store.availableWords.count == 3 && store.counts.values.reduce(0, +) == 3 && store.scopeWords.count == 3 && store.reviewCount == 2)
        let progress = store.syncMetadata
        store.rate(words[0], level: 3)
        precondition(store.rating(words[0]) == 2 && store.syncMetadata == progress, "A stale rating callback cannot edit a deleted word")
        precondition(!store.deleteWord(words[0]), "Repeated deletion is idempotent")
        let oldCounter = store.deletionMetadata!.counter
        let prior = store.filteredWords
        let index = store.currentIndex
        let expected = prior.indices.contains(index + 1) ? prior[index + 1].id : prior[max(0, index - 1)].id
        precondition(store.deleteWord(words[1]) && store.currentWord?.id == expected && !store.revealed,
            "Deleting the current row chooses its immediate neighbour with a valid index")
        precondition(store.deletionMetadata!.counter == oldCounter + 1)
        let selected = store.currentWord?.id
        precondition(store.restoreWord("a") && store.rating(words[0]) == 2 && store.currentWord?.id == selected)
        precondition(store.deletionMetadata!.records.first(where: { $0.wordID == "a" })?.deleted == false,
            "Undo is a durable newer restore record, retaining original familiarity")
        let restored = StudyStore(catalog: [dictionary, other], persistenceURL: url)
        precondition(restored.isDeleted("b") && !restored.isDeleted("a") && restored.rating(words[0]) == 2 && restored.deletionMetadata == store.deletionMetadata)
        restored.dictionaryID = "de"
        precondition(restored.availableWords.count == 4 && !restored.isDeleted("b"), "Visibility is isolated by dictionary identity")
        precondition(restored.restoreWord("b", dictionaryID: "fr") && !restored.isDeleted("b", dictionaryID: "fr"))

        // Old states have no deletion metadata and retain all original content/progress.
        var legacy = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as! [String: Any]
        legacy.removeValue(forKey: "deletionMetadata")
        try data(legacy).write(to: url)
        let migrated = StudyStore(catalog: [dictionary, other], persistenceURL: url)
        precondition(migrated.deletionMetadata == nil && migrated.deletedWords.isEmpty && migrated.availableWords.count == 4)
        migrated.dictionaryID = "fr"
        precondition(migrated.rating(words[0]) == 2)

        let lookup = StudyStore(catalog: [dictionary], persistenceURL: nil)
        lookup.mode = .lookup; lookup.search = "alpha"
        precondition(lookup.deleteWord(words[0]) && lookup.filteredWords.isEmpty && lookup.cardPosition == 0)
        precondition(lookup.restoreWord("a") && lookup.filteredWords.map(\.id) == ["a"])
        lookup.search = ""; lookup.listMode = true; lookup.rate(words[0], level: 2); lookup.rate(words[3], level: 3)
        precondition(lookup.deleteWord(words[0]))
        let csv = String(decoding: try lookup.exportCSV(), as: UTF8.self)
        precondition(!csv.contains("alpha") && !csv.contains("delta") && csv.contains("beta") && csv.contains("gamma"),
            "CSV excludes deleted and mastered entries while source content and familiarity remain")

        let review = StudyStore(catalog: [dictionary], persistenceURL: directory.appendingPathComponent("review.json"))
        review.startReview()
        let first = review.currentWord!
        review.rate(first, level: 1)
        let activeID = review.currentWord!.id
        let queue = review.filteredWords.map(\.id)
        precondition(review.deleteWord(first) && review.filteredWords.map(\.id) == queue.filter { $0 != first.id } && review.reviewRatedCount == 0 && review.currentWord?.id == activeID)
        precondition(review.restoreWord(first.id) && !review.filteredWords.contains(where: { $0.id == first.id }),
            "Restore never injects words into an already captured review round")
        let reviewReload = StudyStore(catalog: [dictionary], persistenceURL: directory.appendingPathComponent("review.json"))
        precondition(reviewReload.filteredWords.map(\.id) == review.filteredWords.map(\.id) && reviewReload.currentWord?.id == activeID)
        for word in review.filteredWords { precondition(review.deleteWord(word)) }
        precondition(review.filteredWords.isEmpty && review.currentWord == nil && review.reviewTotal == 0 && !review.completed)
        review.startReview()
        precondition(review.filteredWords.map(\.id) == [first.id], "A fresh round includes restored entries and excludes deleted entries")

        let remote = StudyStore(catalog: [dictionary], persistenceURL: directory.appendingPathComponent("remote.json"))
        remote.randomOrder = true; remote.selectWord(words[2]); remote.revealed = true
        let remoteOrder = remote.filteredWords.map(\.id)
        try remote.mergeDeletionSnapshot([record("a", true, 20), record("future", true, 40, dictionaryID: "dict-future")])
        precondition(remote.currentWord?.id == "c" && remote.revealed && remote.filteredWords.map(\.id) == remoteOrder.filter { $0 != "a" })
        precondition(remote.isDeleted("future", dictionaryID: "dict-future") && remote.deletionMetadata!.counter == 40)
        precondition(remote.deleteWord(words[1]) && remote.deletionMetadata!.counter == 41, "New local visibility edits follow every observed deletion clock")
        let remoteSaved = StudyStore(catalog: [dictionary], persistenceURL: directory.appendingPathComponent("remote.json"))
        precondition(remoteSaved.isDeleted("future", dictionaryID: "dict-future") && remoteSaved.deletionMetadata == remote.deletionMetadata,
            "Unknown deletions and stable local identity survive relaunch")
        let beforeInvalid = remote.deletionMetadata
        do { try remote.mergeDeletionSnapshot([record("c", true, 50), record("bad\n", true, 60)]); preconditionFailure("Invalid batch accepted") } catch {}
        precondition(remote.deletionMetadata == beforeInvalid && !remote.isDeleted("c"))
        try remote.mergeDeletionSnapshot([record("a", false, 50)])
        precondition(!remote.isDeleted("a") && remote.filteredWords.contains(where: { $0.id == "a" }))

        // v3 carries deletion state, but import restamps it as a new local operation; legacy backups preserve it.
        let backup = try remote.exportBackup()
        let exported = try JSONSerialization.jsonObject(with: backup) as! [String: Any]
        precondition(exported["version"] as? Int == 3 && (exported["deletions"] as? [[String: Any]])?.count == 3)
        let imported = StudyStore(catalog: [dictionary], persistenceURL: nil)
        _ = try imported.importBackup(backup)
        precondition(imported.isDeleted("b") && imported.isDeleted("future", dictionaryID: "dict-future") && !imported.isDeleted("a"))
        precondition(imported.deletionMetadata!.records.allSatisfy { $0.clock > 50 && $0.deviceID == imported.deletionMetadata!.deviceID })
        _ = try imported.importBackup(data(["app": "mots", "version": 1, "ratings": ["c": 2]]))
        precondition(imported.isDeleted("b"), "An older backup with no deletion field never restores deleted words implicitly")
        _ = try imported.importBackup(data(["app": "mots", "version": 3, "progress": [:], "deletions": raw([record("b", false, 100)])]))
        precondition(!imported.isDeleted("b") && imported.deletionMetadata!.records.first(where: { $0.wordID == "b" })!.clock > 100)
        let metadataBeforeBadBackup = imported.deletionMetadata, progressBeforeBadBackup = imported.progress
        do {
            _ = try imported.importBackup(data(["app": "mots", "version": 3, "progress": ["fr": ["a": 3]], "deletions": [[
                "dictionaryID": "fr", "wordID": "a", "deleted": 1, "clock": 101, "deviceID": device]]]))
            preconditionFailure("Numeric deletion Boolean accepted")
        } catch {}
        precondition(imported.deletionMetadata == metadataBeforeBadBackup && imported.progress == progressBeforeBadBackup,
            "Malformed deletion backups reject content/progress/deletions atomically")
        let tie = try WordDeletionRecord.canonical([record("x", false, 8, deviceID: device), record("x", true, 8, deviceID: device)])
        precondition(tie.count == 1 && tie[0].deleted)
        let restoreWins = try WordDeletionRecord.canonical(tie + [record("x", false, 9, deviceID: device)])
        precondition(!restoreWins[0].deleted)
        let deviceWins = try WordDeletionRecord.canonical([record("x", true, 9, deviceID: device), record("x", false, 9)])
        precondition(!deviceWins[0].deleted, "Device ID breaks concurrent versions before deleted/restore value")
        for invalid in [record("x", true, 0, deviceID: ""), record("x", true, -1), record("x", true, ProgressSyncRecord.maximumClock + 1)] {
            do { try invalid.validate(); preconditionFailure("Invalid deletion accepted") } catch {}
        }
        let blocked = directory.appendingPathComponent("blocked")
        try Data("file".utf8).write(to: blocked)
        let unsaved = StudyStore(catalog: [dictionary], persistenceURL: blocked.appendingPathComponent("state.json"))
        precondition(unsaved.deleteWord(words[0]) && unsaved.isDeleted("a") && unsaved.storageError != nil)
        do { _ = try unsaved.deletionSnapshot(); preconditionFailure("Unsaved deletion must not be uploaded") } catch {}
        print("PASS: deletion/undo/restore source and familiarity preservation; dictionary identity; stats/filter/lookup/CSV; current/last/empty neighbour boundaries; random order; stable review removal; relaunch/migration; unknown deletion records; observed counters and deterministic ties; v3 backup restamping/legacy preservation/atomic rejection; persistence failure blocks sync.")
    }
}
