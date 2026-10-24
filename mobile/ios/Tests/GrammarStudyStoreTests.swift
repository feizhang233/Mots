import Foundation

@main
struct GrammarStudyStoreTests {
    @MainActor static func main() throws {
        let catalog = try JSONDecoder().decode([StudyDictionary].self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-grammar-tests-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: directory) }
        let stateURL = directory.appendingPathComponent("state.json")
        let store = StudyStore(catalog: catalog, persistenceURL: stateURL)
        store.dictionaryID = "grammar-fr"
        store.listMode = true
        precondition(store.currentDictionary.isGrammar && store.filteredWords.count == 6)
        let grammar = store.filteredWords[0]
        precondition(grammar.exampleTexts.count == 3 && !grammar.pattern.isEmpty && !grammar.explanation.isEmpty)
        store.search = grammar.exampleTexts[2]
        precondition(store.filteredWords.map(\.id) == [grammar.id], "Search includes later grammar examples")
        store.search = grammar.explanation
        precondition(store.filteredWords.contains { $0.id == grammar.id }, "Search includes explanations")
        store.search = ""
        store.rate(grammar, level: 2)
        store.dictionaryID = "fr"
        precondition(store.progress["fr"]?[grammar.id] == nil, "Grammar progress never leaks into vocabulary")
        store.dictionaryID = "grammar-fr"
        precondition(store.rating(grammar) == 2)
        let restored = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(restored.dictionaryID == "grammar-fr" && restored.rating(grammar) == 2 && restored.storageError == nil)
        let snapshot = try restored.syncSnapshot()
        precondition(snapshot.contains { $0.dictionaryID == "grammar-fr" && $0.wordID == grammar.id && $0.level == 2 })
        let paired = StudyStore(catalog: catalog, persistenceURL: nil)
        try paired.mergeSyncSnapshot(snapshot)
        paired.dictionaryID = "grammar-fr"
        precondition(paired.rating(grammar) == 2, "Grammar ratings use the shared sync identity")
        precondition(restored.deleteWord(grammar))
        precondition(!restored.availableWords.contains { $0.id == grammar.id })
        precondition(restored.restoreWord(grammar.id) && restored.rating(grammar) == 2)
        restored.startReview()
        let deck = restored.filteredWords.map(\.id)
        restored.rate(restored.currentWord!, level: 3)
        precondition(restored.filteredWords.map(\.id) == deck && restored.currentIndex == 1, "Grammar review keeps its captured queue")
        while !restored.completed { restored.next() }
        precondition(restored.reviewRatedCount == 1 && restored.reviewTotal == 6)

        let custom: [String: Any] = ["title": "自訂語法", "language": "fr", "kind": "grammar", "words": [[
            "id": grammar.id, "term": "test + infinitif", "meaning": "測試用法", "example": "Premier exemple.",
            "examples": [["text": "Deuxième exemple.", "translations": ["zh-Hant": "第二例"]]],
            "pattern": "主詞 + 動詞", "explanation": "只用於測試資料相容。"
        ]]]
        let importedID = try store.importDictionary(json(custom))
        let imported = store.currentDictionary.words[0]
        precondition(store.currentDictionary.isGrammar && store.rating(imported) == 0 && imported.audio == nil)
        store.rate(imported, level: 1)
        let saved = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(saved.currentDictionary.kind == .grammar && saved.currentDictionary.words[0] == imported, "Persist custom rich grammar fields")
        let backup = try store.exportBackup()
        let fromBackup = StudyStore(catalog: catalog, persistenceURL: nil)
        try fromBackup.importBackup(backup)
        precondition(fromBackup.dictionaryID == importedID && fromBackup.currentDictionary.kind == .grammar)
        precondition(fromBackup.currentDictionary.words[0] == imported && fromBackup.rating(imported) == 1, "Backup round trip retains examples, translations, pattern and explanation")
        let invalid = try json(["app": "mots", "version": 3, "progress": [:], "dictionaries": [[
            "id": "dict-invalid", "title": "bad", "kind": "grammar", "language": "fr", "words": [["term": "x", "meaning": "x", "examples": 42]]
        ]]])
        let before = fromBackup.dictionaries
        do { try fromBackup.importBackup(invalid); preconditionFailure("Invalid rich fields must reject") } catch {}
        precondition(fromBackup.dictionaries == before && fromBackup.rating(imported) == 1, "Invalid grammar import remains atomic")
        let csv = String(data: try fromBackup.exportCSV(), encoding: .utf8)!
        precondition(csv.contains("語法") && csv.contains("Deuxième exemple."))
        let extended = StudyStore(catalog: catalog, persistenceURL: stateURL)
        let extensionID = "custom-grammar-fr-extra"
        let extensionBackup = try json(["app": "mots", "version": 3,
            "progress": ["grammar-fr": [extensionID: 2]], "settings": ["dictionaryId": "grammar-fr"],
            "customBanks": ["grammar-fr": [["id": extensionID, "term": "encore + exemple", "meaning": "補充語法",
                "category": grammar.category, "subcategory": grammar.subcategory, "examples": ["Un exemple en plus."],
                "pattern": "測試接續", "explanation": "從 Web 備份匯入的擴充語法。"]]]])
        try extended.importBackup(extensionBackup)
        precondition(extended.currentDictionary.isGrammar && extended.currentDictionary.words.count == 7)
        let extra = extended.currentDictionary.words.first { $0.id == extensionID }!
        precondition(extended.rating(extra) == 2 && extra.exampleTexts == ["Un exemple en plus."])
        let extensionRestart = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(extensionRestart.currentDictionary.isGrammar && extensionRestart.currentDictionary.words.contains(extra))
        let extensionRoundTrip = StudyStore(catalog: catalog, persistenceURL: nil)
        try extensionRoundTrip.importBackup(extended.exportBackup())
        precondition(extensionRoundTrip.currentDictionary.words.contains(extra) && extensionRoundTrip.rating(extra) == 2,
            "Web grammar extensions and their progress survive backup and restart")

        let ordinaryURL = directory.appendingPathComponent("ordinary-state.json")
        let ordinary = StudyStore(catalog: catalog, persistenceURL: ordinaryURL)
        ordinary.dictionaryID = "grammar-fr"
        ordinary.listMode = true
        ordinary.categoryID = grammar.category
        ordinary.subcategoryID = grammar.subcategory
        ordinary.rate(grammar, level: 2)
        var legacyState = try JSONSerialization.jsonObject(with: Data(contentsOf: ordinaryURL)) as! [String: Any]
        legacyState["grammarGrouping"] = ["grammar-fr": true]
        try json(legacyState).write(to: ordinaryURL)
        let restoredOrdinary = StudyStore(catalog: catalog, persistenceURL: ordinaryURL)
        precondition(!restoredOrdinary.currentDictionary.isThematicGrammar && restoredOrdinary.subcategoryID == grammar.subcategory,
            "Ordinary grammar keeps its second-level selection despite obsolete grouping preferences")
        precondition(restoredOrdinary.rating(grammar) == 2 && restoredOrdinary.storageError == nil)
        var legacyBackup = try JSONSerialization.jsonObject(with: ordinary.exportBackup()) as! [String: Any]
        var legacySettings = legacyBackup["settings"] as! [String: Any]
        legacySettings["grammarGrouping"] = ["grammar-fr": true]
        legacyBackup["settings"] = legacySettings
        let oldBackup = StudyStore(catalog: catalog, persistenceURL: nil)
        try oldBackup.importBackup(json(legacyBackup))
        precondition(!oldBackup.currentDictionary.isThematicGrammar && oldBackup.rating(grammar) == 2,
            "Legacy grouping setting cannot convert ordinary grammar into a thematic book")

        let themeFixture = StudyDictionary(id: "grammar-theme-fr", title: "Theme test fixture", language: "fr",
            categories: catalog.first { $0.id == "grammar-fr" }!.categories, words: [grammar], kind: .grammar, grammarMode: .thematic)
        let themeCatalog = catalog.filter { $0.id != themeFixture.id } + [themeFixture]
        let themeURL = directory.appendingPathComponent("thematic-state.json")
        let thematic = StudyStore(catalog: themeCatalog, persistenceURL: themeURL)
        thematic.dictionaryID = themeFixture.id
        thematic.listMode = true
        precondition(thematic.currentDictionary.isThematicGrammar && thematic.currentDictionary.isBuiltIn)
        thematic.rate(grammar, level: 1)
        thematic.dictionaryID = "grammar-fr"
        precondition(thematic.rating(grammar) == 0, "Thematic and ordinary books never share progress even with identical entry IDs")
        thematic.dictionaryID = themeFixture.id
        let expandedGroupID = themeFixture.id + ":" + grammar.category + ":" + grammar.subcategory
        thematic.expandedGrammarGroupIDs.insert(expandedGroupID)
        thematic.listMode = false
        thematic.listMode = true
        precondition(thematic.expandedGrammarGroupIDs.contains(expandedGroupID), "Thematic card/list swaps preserve disclosure state")
        thematic.search = "test"
        thematic.search = ""
        precondition(thematic.expandedGrammarGroupIDs == [expandedGroupID], "Thematic search does not change remembered disclosure state")
        let themeRestart = StudyStore(catalog: themeCatalog, persistenceURL: themeURL)
        precondition(themeRestart.currentDictionary.isThematicGrammar && themeRestart.rating(grammar) == 1 && themeRestart.storageError == nil)
        precondition(themeRestart.expandedGrammarGroupIDs.isEmpty, "Disclosure state stays transient")
        thematic.startReview()
        let captured = thematic.filteredWords.map(\.id)
        precondition(captured == [grammar.id] && thematic.showsCards, "Thematic review uses individual cards")

        var themedImport = custom
        themedImport["grammarMode"] = "thematic"
        let themeImportID = try thematic.importDictionary(json(themedImport))
        precondition(thematic.currentDictionary.isThematicGrammar && themeImportID != importedID)
        let themeBackup = StudyStore(catalog: catalog, persistenceURL: nil)
        try themeBackup.importBackup(thematic.exportBackup())
        precondition(themeBackup.dictionaryID == themeImportID && themeBackup.currentDictionary.isThematicGrammar,
            "Custom thematic book identity and grammar mode survive backup")
        var changedTypeBackup = try JSONSerialization.jsonObject(with: thematic.exportBackup()) as! [String: Any]
        var changedLibrary = changedTypeBackup["dictionaries"] as! [[String: Any]]
        let changedIndex = changedLibrary.firstIndex { $0["id"] as? String == themeImportID }!
        changedLibrary[changedIndex]["grammarMode"] = "standard"
        changedTypeBackup["dictionaries"] = changedLibrary
        let beforeTypeChange = themeBackup.dictionaries
        do { try themeBackup.importBackup(json(changedTypeBackup)); preconditionFailure("A book cannot change its grammar type in place") } catch {}
        precondition(themeBackup.dictionaries == beforeTypeChange && themeBackup.currentDictionary.isThematicGrammar,
            "Backup rejects an in-place grammar-mode change atomically")
        let defaultThemeID = try thematic.importDictionary(json(["title": "Theme fallback", "words": custom["words"]!]))
        precondition(thematic.currentDictionary.isThematicGrammar && thematic.dictionaryID == defaultThemeID,
            "New imports inherit the selected thematic book type when unspecified")
        thematic.dictionaryID = "grammar-fr"
        _ = try thematic.importDictionary(json(["title": "Ordinary fallback", "words": custom["words"]!]))
        precondition(!thematic.currentDictionary.isThematicGrammar && thematic.currentDictionary.isGrammar,
            "New ordinary imports remain ordinary without grammarMode")
        let reexport = try JSONSerialization.jsonObject(with: thematic.exportBackup()) as! [String: Any]
        precondition((reexport["settings"] as! [String: Any])["grammarGrouping"] == nil,
            "Obsolete grouping preference is no longer exported")
        print("PASS: native grammar selection, search, persistence, sync, review, deletion, rich imports, backups and independent thematic grammar books")
    }

    static func json(_ value: Any) throws -> Data { try JSONSerialization.data(withJSONObject: value) }
}
