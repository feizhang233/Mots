import Foundation

@main
struct ListMeaningTests {
    @MainActor static func main() throws {
        let first = StudyWord(id: "same", term: "bonjour", meaning: "你好", category: "1", subcategory: "1.01", language: "fr")
        let second = StudyWord(id: "second", term: "demain", meaning: "明天", category: "1", subcategory: "1.01", language: "fr")
        let alternate = StudyWord(id: "same", term: "hallo", meaning: "你好", category: "1", subcategory: "1.01", language: "de")
        let grammarWord = StudyWord(id: "same", term: "ne … pas", meaning: "否定", category: "1", subcategory: "1.01", language: "fr")
        let categories = [StudyCategory(id: "1", name: "日常", subcategories: [StudySubcategory(id: "1.01", name: "問候")])]
        let catalog = [
            StudyDictionary(id: "fr", title: "Français Mots", language: "fr", categories: categories, words: [first, second]),
            StudyDictionary(id: "de", title: "Deutsch Wörter", language: "de", categories: categories, words: [alternate]),
            StudyDictionary(id: "grammar-fr", title: "Français Grammaire", language: "fr", categories: categories, words: [grammarWord], kind: .grammar)
        ]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-meaning-tests-\(UUID().uuidString)")
        let stateURL = directory.appendingPathComponent("state.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let store = StudyStore(catalog: catalog, persistenceURL: stateURL)
        store.listMode = true
        precondition(!store.hideListMeanings && store.isListMeaningVisible(for: first), "Existing lists start with translations visible")

        store.hideListMeanings = true
        precondition(!store.isListMeaningVisible(for: first) && !store.isListMeaningVisible(for: second))
        let selectedID = store.currentWord?.id
        store.revealed = true
        store.revealListMeaning(for: first)
        precondition(store.isListMeaningVisible(for: first) && !store.isListMeaningVisible(for: second), "A tap reveals only that word")
        precondition(store.currentWord?.id == selectedID && store.rating(first) == 0 && store.revealed,
            "List reveals never rate, advance or change card answer state")
        store.revealListMeaning(for: second)
        precondition(store.isListMeaningVisible(for: first) && store.isListMeaningVisible(for: second), "Revealing another word keeps current-page answers")

        store.hideListMeanings = false
        precondition(store.isListMeaningVisible(for: first) && store.isListMeaningVisible(for: second))
        store.hideListMeanings = true
        precondition(!store.isListMeaningVisible(for: first), "Enabling concealment begins a fresh attempt")

        let resetActions: [() -> Void] = [
            { store.resetListMeaningReveals() },
            { store.categoryID = "1" },
            { store.subcategoryID = "1.01" },
            { store.search = "bonjour" },
            { store.search = "" },
            { store.meaningLanguage = "zh-Hans" },
            { store.pageSize = 10 },
            { store.randomOrder = true },
            { store.mode = .lookup },
            { store.mode = .study },
            { store.listMode = false },
            { store.listMode = true }
        ]
        for reset in resetActions {
            store.revealListMeaning(for: first)
            precondition(store.isListMeaningVisible(for: first))
            reset()
            precondition(!store.isListMeaningVisible(for: first), "Changed list context hides prior answers")
        }
        store.meaningLanguage = "zh-Hant"
        store.revealListMeaning(for: first)
        store.dictionaryID = "de"
        precondition(!store.isListMeaningVisible(for: alternate), "Matching IDs in another book never inherit a reveal")
        store.revealListMeaning(for: alternate)
        precondition(store.isListMeaningVisible(for: alternate))
        store.dictionaryID = "fr"
        precondition(!store.isListMeaningVisible(for: first), "Returning to a book starts with hidden translations")
        store.dictionaryID = "grammar-fr"
        precondition(store.isListMeaningVisible(for: grammarWord), "Grammar retains its established reading layout")
        store.dictionaryID = "fr"

        store.revealListMeaning(for: first)
        store.revealListMeaning(for: second)
        precondition(store.deleteWord(first))
        store.revealListMeaning(for: first)
        precondition(!store.isListMeaningVisible(for: first), "Deleted words cannot retain or gain a reveal")
        precondition(store.isListMeaningVisible(for: second), "Deletion keeps other current-page reveals")
        precondition(store.restoreWord(first.id))
        precondition(!store.isListMeaningVisible(for: first), "Restored words start concealed")

        store.revealListMeaning(for: first)
        let relaunched = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(relaunched.hideListMeanings && !relaunched.isListMeaningVisible(for: first),
            "The preference persists, but per-word reveals do not")
        let saved = try JSONSerialization.jsonObject(with: Data(contentsOf: stateURL)) as! [String: Any]
        precondition(saved["hideListMeanings"] as? Bool == true)
        precondition(saved["revealedListMeanings"] == nil, "Reveals never enter local saved state")
        var legacyState = saved
        legacyState.removeValue(forKey: "hideListMeanings")
        let legacyURL = directory.appendingPathComponent("legacy.json")
        try JSONSerialization.data(withJSONObject: legacyState).write(to: legacyURL)
        let legacy = StudyStore(catalog: catalog, persistenceURL: legacyURL)
        precondition(legacy.storageError == nil && !legacy.hideListMeanings && legacy.isListMeaningVisible(for: first),
            "Existing saved states remain readable with visible translations")

        let backup = try store.exportBackup()
        var backupObject = try JSONSerialization.jsonObject(with: backup) as! [String: Any]
        let settings = backupObject["settings"] as! [String: Any]
        precondition(settings["hideListMeanings"] as? Bool == true)
        precondition(backupObject["revealedListMeanings"] == nil)
        let restored = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try restored.importBackup(backup)
        precondition(restored.hideListMeanings && !restored.isListMeaningVisible(for: first),
            "Backup restore preserves concealment but starts with hidden answers")
        var olderSettings = settings
        olderSettings.removeValue(forKey: "hideListMeanings")
        backupObject["settings"] = olderSettings
        let olderBackup = try JSONSerialization.data(withJSONObject: backupObject)
        _ = try restored.importBackup(olderBackup)
        precondition(restored.hideListMeanings, "An older backup does not overwrite a preference it never stored")
        let fresh = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try fresh.importBackup(olderBackup)
        precondition(!fresh.hideListMeanings, "An older backup on a fresh install retains the visible default")
        print("PASS: list translation concealment; independent per-word reveal; no rating or card-state mutation; context resets; dictionary identity; grammar compatibility; deletion/restore; persisted preference with transient reveals; legacy saved-state and backup compatibility.")
    }
}
