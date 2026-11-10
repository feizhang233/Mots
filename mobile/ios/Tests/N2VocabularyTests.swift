import Foundation

@main struct N2VocabularyTests {
    static func rejects(_ action: () throws -> Void) {
        do { try action() } catch { return }
        preconditionFailure("Malformed reading must be rejected")
    }
    @MainActor static func main() throws {
        let data = try Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1]))
        let catalog = try JSONDecoder().decode([StudyDictionary].self, from: data)
        let book = catalog.first { $0.id == "vocab-ja-n2-hongbao" }!
        precondition(book.isBuiltIn && !book.isGrammar && book.words.count == 3136)
        precondition(book.categories.map(\.id) == ["1", "2", "3"])
        precondition(book.words.allSatisfy { !$0.reading.isEmpty && !$0.examples[0].furigana.isEmpty &&
            $0.examples[0].furigana.map(\.text).joined() == $0.example })
        let empty = book.words.first { $0.id == "hb-n2-0dada549a204" }!
        precondition(empty.displayTerm == "空（から）" && empty.speechText == "から")
        precondition(empty.examples[0].annotatedText.contains("空（から）"))
        let law = book.words.first { $0.term == "憲法" }!
        precondition(law.reading == "けんぽう" && law.speechText == "けんぽう")
        precondition(book.words.first { $0.term == "カーブ" }!.displayTerm == "カーブ")
        precondition(book.words.first { $0.term == "不平" }!.reading == "ふへい")
        let roundTrip = try JSONDecoder().decode(StudyDictionary.self, from: JSONEncoder().encode(book))
        precondition(roundTrip == book,
                     "Headword and example readings survive native Codable")

        let dir = FileManager.default.temporaryDirectory.appendingPathComponent("mots-n2-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: dir) }
        let url = dir.appendingPathComponent("state.json")
        let old = StudyStore(catalog: catalog.filter { $0.id != book.id }, persistenceURL: url)
        let french = catalog.first { $0.id == "fr" }!.words[0]
        old.listMode = true; old.rate(french, level: 3)
        let rating = ProgressSyncRecord(dictionaryID: book.id, wordID: empty.id, level: 2,
            clock: 42, deviceID: String(repeating: "a", count: 32))
        let schedule = MemorySyncRecord(dictionaryID: book.id, wordID: empty.id, stage: 2,
            dueAt: 259201000, updatedAt: 1000)
        try old.mergeSyncSnapshot([rating]); try old.mergeMemorySnapshot([schedule])
        let updated = StudyStore(catalog: catalog, persistenceURL: url)
        precondition(updated.storageError == nil && updated.rating(french) == 3)
        updated.dictionaryID = book.id
        updated.mode = .lookup; updated.listMode = true; updated.search = "けんぽう"
        precondition(updated.filteredWords.contains { $0.id == law.id }, "N2 lookup accepts the explicit kana reading")
        updated.search = ""
        precondition(updated.rating(empty) == 2 && updated.memory[book.id]?[empty.id]?.stage == 2)
        precondition(updated.memory[book.id]?[empty.id]?.dueAt == schedule.dueAt)
        let restarted = StudyStore(catalog: catalog, persistenceURL: url)
        precondition(restarted.storageError == nil && restarted.dictionaries.count == 10)
        precondition(restarted.currentDictionary.id == book.id && restarted.rating(empty) == 2)
        let ratings = try restarted.syncSnapshot(), schedules = try restarted.memorySnapshot()
        precondition(ratings.contains(rating))
        precondition(schedules.contains(schedule))
        let backup = try JSONSerialization.jsonObject(with: restarted.exportBackup()) as! [String: Any]
        precondition((backup["dictionaries"] as! [[String: Any]]).allSatisfy { $0["id"] as? String != book.id },
                     "N2 must never be persisted as an invalid custom dictionary")
        let imported = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try imported.importBackup(restarted.exportBackup())
        imported.dictionaryID = book.id
        precondition(imported.rating(empty) == 2 && imported.memory[book.id]?[empty.id]?.stage == 2)

        let customSource: [String: Any] = ["language":"ja", "words":[[
            "id":"word-1", "term":empty.term, "reading":empty.reading, "meaning":empty.meaning,
            "examples":empty.examples.map(\.importJSON)]]]
        let custom = try StudyImport.dictionary(customSource, id: "dict-reading-test")
        precondition(custom.words[0].reading == "から" && custom.words[0].examples == empty.examples)
        let sample = try StudyImport.object(StudyImport.dictionaryTemplate(for: custom, meaningLanguage: "zh-Hant"), limit: 2_000_000)
        let sampleBook = try StudyImport.dictionary(sample, id: "dict-reading-roundtrip")
        precondition(sampleBook.words[0].examples == empty.examples && sampleBook.words[0].reading == "から")
        rejects { _ = try StudyWord.checkedReading("そら<script>") }
        rejects { _ = try StudyExample.checkedAnnotations([StudyReadingSegment(text:"別",reading:"べつ")],text:"空") }
        rejects { _ = try StudyExample.checkedAnnotations([StudyReadingSegment(text:"空",reading:"sora")],text:"空") }
        print("N2 native: all 3136 readings, annotated examples, speech, built-in identity, upgrade, VPS progress keys, schedules, restart and backup passed.")
    }
}
