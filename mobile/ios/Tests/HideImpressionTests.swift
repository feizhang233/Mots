import Foundation

@main
struct HideImpressionTests {
    static let words = ["first", "partial", "next", "known", "weak", "last"].map {
        StudyWord(id: $0, term: $0, meaning: "釋義 \($0)", category: "1", subcategory: "1.01", language: "fr")
    }
    static let categories = [StudyCategory(id: "1", name: "第一章", subcategories: [.init(id: "1.01", name: "單字")])]
    static var catalog: [StudyDictionary] {
        [StudyDictionary(id: "fr", title: "Français Mots", language: "fr", categories: categories, words: words)]
    }
    static func json(_ value: Any) throws -> Data { try JSONSerialization.data(withJSONObject: value) }
    @MainActor static func ids(_ store: StudyStore) -> [String] { store.filteredWords.map(\.id) }
    @MainActor static func seeded(listMode: Bool = true, persistenceURL: URL? = nil) -> StudyStore {
        let store = StudyStore(catalog: catalog, persistenceURL: persistenceURL)
        store.listMode = true
        store.rate(words[1], level: 2)
        store.rate(words[3], level: 3)
        store.rate(words[4], level: 1)
        store.listMode = listMode
        return store
    }

    @MainActor static func main() throws {
        let fresh = StudyStore(catalog: catalog, persistenceURL: nil)
        precondition(!fresh.hideImpression && ids(fresh) == words.map(\.id), "Partial-recall hiding defaults off")

        for listMode in [false, true] {
            let store = seeded(listMode: listMode)
            store.hideImpression = true
            precondition(ids(store) == ["first", "next", "known", "weak", "last"], "Both study cards and lists hide only familiarity two")
            store.hideMastered = true
            precondition(ids(store) == ["first", "next", "weak", "last"], "Partial recall and mastery filters can be combined")
            store.hideImpression = false
            precondition(ids(store) == ["first", "partial", "next", "weak", "last"], "Removing one filter preserves the other")
            store.hideMastered = false
            precondition(ids(store) == words.map(\.id), "Disabling both filters restores all active entries")
        }

        // A filtered rating must leave the immediate neighbour selected once, preserving captured random order.
        for listMode in [false, true] {
            for randomOrder in [false, true] {
                let store = StudyStore(catalog: catalog, persistenceURL: nil)
                store.listMode = listMode
                store.hideImpression = true
                store.randomOrder = randomOrder
                let original = store.filteredWords
                store.selectWord(original[1])
                store.revealed = true
                store.rate(original[1], level: 2)
                precondition(ids(store) == original.filter { $0.id != original[1].id }.map(\.id), "Rating two removes a word without reshuffling")
                precondition(store.currentWord?.id == original[2].id && !store.revealed, "Removing the current partial-recall word does not skip its neighbour")
                let selectedID = store.currentWord?.id
                store.rate(original[1], level: 1)
                precondition(ids(store).contains(original[1].id) && store.currentWord?.id == selectedID, "Downgrading a hidden word to unfamiliar restores it without moving the current selection")
                store.selectWord(store.filteredWords.last!)
                let previous = store.filteredWords[store.filteredWords.count - 2]
                store.rate(store.currentWord!, level: 2)
                precondition(store.currentWord?.id == previous.id && !store.completed, "Removing the final card keeps its previous neighbour")
            }
        }

        let scopes = seeded(listMode: false)
        scopes.hideImpression = true
        scopes.mode = .lookup
        precondition(ids(scopes).contains("partial") && ids(scopes).contains("known"), "Dictionary lookup keeps partial-recall definitions available")
        scopes.startReview()
        precondition(ids(scopes).contains("partial") && !ids(scopes).contains("known"), "Random review keeps its existing nonmastered capture policy")
        scopes.openMemory()
        scopes.selectMemoryChapters(["1"])
        scopes.startMemoryRound()
        precondition(scopes.memorySessionActive && ids(scopes) == ["partial"], "Card memory can still study partial-recall words while the study filter is enabled")

        let remote = seeded(listMode: false)
        remote.hideImpression = true
        remote.selectWord(words[2])
        remote.revealed = true
        let remoteDevice = String(repeating: "f", count: 32)
        try remote.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: words[2].id, level: 2,
            clock: (remote.syncMetadata?.counter ?? 0) + 10, deviceID: remoteDevice)])
        precondition(ids(remote) == ["first", "known", "weak", "last"], "A synced partial-recall rating removes the current word")
        precondition(remote.currentWord?.id == "known" && !remote.revealed,
                     "Remote removal selects the immediate neighbour once and conceals its answer")
        remote.revealed = true
        try remote.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: words[1].id, level: 1,
            clock: (remote.syncMetadata?.counter ?? 0) + 10, deviceID: remoteDevice)])
        precondition(ids(remote) == ["first", "partial", "known", "weak", "last"], "A synced unfamiliar rating restores the hidden word")
        precondition(remote.currentWord?.id == "known" && remote.revealed,
                     "Restoring a different hidden word preserves the current card and answer visibility")

        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-hide-impression-tests-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: directory) }
        let stateURL = directory.appendingPathComponent("state.json")
        let persisted = seeded(persistenceURL: stateURL)
        persisted.hideImpression = true
        let relaunched = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(relaunched.storageError == nil && relaunched.hideImpression && !ids(relaunched).contains("partial"), "The filter and its saved progress survive relaunch")
        var saved = try JSONSerialization.jsonObject(with: Data(contentsOf: stateURL)) as! [String: Any]
        precondition(saved["hideImpression"] as? Bool == true)
        saved.removeValue(forKey: "hideImpression")
        let legacyURL = directory.appendingPathComponent("legacy.json")
        try json(saved).write(to: legacyURL)
        let legacy = StudyStore(catalog: catalog, persistenceURL: legacyURL)
        precondition(legacy.storageError == nil && !legacy.hideImpression && ids(legacy).contains("partial"), "Old saved state without the preference opens with the off default")

        let backup = try persisted.exportBackup()
        var payload = try JSONSerialization.jsonObject(with: backup) as! [String: Any]
        let settings = payload["settings"] as! [String: Any]
        precondition(settings["hideImpression"] as? Bool == true)
        let visibility = settings["visibility"] as! [String: [Int]]
        precondition(visibility["fr"]?.contains(2) == true, "Native backup exposes partial-recall hiding to Web through visibility")
        let restored = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try restored.importBackup(backup)
        precondition(restored.hideImpression && !ids(restored).contains("partial"), "Backup transfer preserves the filter")

        payload["settings"] = ["dictionaryId": "fr", "visibility": ["fr": [2]]]
        let fromWeb = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try fromWeb.importBackup(json(payload))
        precondition(fromWeb.hideImpression && !ids(fromWeb).contains("partial"), "Web familiarity visibility restores the native partial-recall filter")
        payload["settings"] = ["dictionaryId": "fr", "hideImpression": false, "visibility": ["fr": [2]]]
        _ = try fromWeb.importBackup(json(payload))
        precondition(!fromWeb.hideImpression && ids(fromWeb).contains("partial"), "An explicit native preference takes precedence over visibility")
        payload["settings"] = ["dictionaryId": "fr", "hideImpression": true, "visibility": ["fr": []]]
        _ = try fromWeb.importBackup(json(payload))
        precondition(fromWeb.hideImpression, "An explicit enabled preference also takes precedence")
        payload["settings"] = ["dictionaryId": "fr", "visibility": ["fr": []]]
        _ = try fromWeb.importBackup(json(payload))
        precondition(!fromWeb.hideImpression, "An explicit Web show-all choice disables partial-recall hiding")
        fromWeb.hideImpression = true
        payload["settings"] = ["dictionaryId": "fr"]
        _ = try fromWeb.importBackup(json(payload))
        precondition(fromWeb.hideImpression, "An older backup cannot overwrite a preference it never stored")
        let oldBackupFresh = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try oldBackupFresh.importBackup(json(payload))
        precondition(!oldBackupFresh.hideImpression, "Old backups retain the off default on a fresh install")

        let pagingStore = StudyStore(catalog: catalog, persistenceURL: nil)
        var paging = CardPagingState()
        let initialDeck = ids(pagingStore)
        paging.begin(in: pagingStore.cardPagingContext)
        pagingStore.hideImpression = true
        precondition(ids(pagingStore) == initialDeck, "This gesture test changes the filter without changing membership")
        precondition(paging.finish(in: pagingStore.cardPagingContext, visibleID: words[1].id, completed: true) == nil,
                     "A swipe begun before the filter change cannot replace the newer card state")
        precondition(!paging.isTurning && pagingStore.currentWord?.id == words[0].id)
        print("PASS: partial-recall hiding for study cards/lists; combined filters; rating and synced neighbour stability; lookup/review/memory isolation; relaunch and legacy state; native/Web backup compatibility; stale-swipe invalidation.")
    }
}
