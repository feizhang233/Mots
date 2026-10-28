import Foundation
import Observation

@main
struct CardPagingTests {
    @MainActor static func main() throws {
        let examples = [StudyExample(text: "Bonjour.", translations: ["zh-Hant": "你好。", "en": "Hello."]),
                        StudyExample(text: "À demain.")]
        let words = (0..<40).map { index in
            StudyWord(id: "word-\(index)", term: "mot \(index)", meaning: "單字 \(index)", category: "1",
                      subcategory: "1.01", language: "fr", examples: examples)
        }
        let category = StudyCategory(id: "1", name: "單元", subcategories: [.init(id: "1.01", name: "主題")])
        let catalog = [StudyDictionary(id: "fr", title: "Français Mots", language: "fr", categories: [category], words: words),
                       StudyDictionary(id: "grammar-fr", title: "Français Grammaire", language: "fr", categories: [category], words: words, kind: .grammar)]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-card-tests-\(UUID().uuidString)")
        let stateURL = directory.appendingPathComponent("state.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let store = StudyStore(catalog: catalog, persistenceURL: stateURL)
        var paging = CardPagingState()
        func context() -> CardPagingState.Context { store.cardPagingContext }
        func endSwipe(to id: String?, completed: Bool) {
            if let selected = paging.finish(in: context(), visibleID: id, completed: completed),
               let word = store.filteredWords.first(where: { $0.id == selected }) { store.selectWord(word) }
            precondition(!paging.isTurning, "Every finished/cancelled gesture releases the pager")
        }

        // Match the representable's eager argument evaluation during an active curl.
        // An early return before reading the store used to drop its Observation
        // dependencies, so later buttons advanced the footer without updating the card.
        let observedStore = StudyStore(catalog: catalog, persistenceURL: nil)
        var blockedPaging = CardPagingState()
        blockedPaging.begin(in: observedStore.cardPagingContext)
        func applyWhenIdle(_ requested: CardPagingState.Context) {
            guard !blockedPaging.isTurning else { return }
            preconditionFailure("This regression must exercise an update blocked by a gesture")
        }
        let selectionChanged = DispatchSemaphore(value: 0)
        withObservationTracking {
            applyWhenIdle(observedStore.cardPagingContext)
        } onChange: { selectionChanged.signal() }
        observedStore.next()
        precondition(selectionChanged.wait(timeout: .now()) == .success,
                     "A blocked pager update must still observe the next selected card")
        precondition(blockedPaging.isTurning && observedStore.currentWord?.id == words[1].id)

        let deckChanged = DispatchSemaphore(value: 0)
        withObservationTracking {
            applyWhenIdle(observedStore.cardPagingContext)
        } onChange: { deckChanged.signal() }
        precondition(observedStore.deleteWord(words[3]))
        precondition(deckChanged.wait(timeout: .now()) == .success,
                     "A blocked pager update must observe deck membership changes")
        precondition(observedStore.currentWord?.id == words[1].id,
                     "The deck observation regression must preserve the selected card")

        let scopeChanged = DispatchSemaphore(value: 0)
        let oldDeck = observedStore.filteredWords
        withObservationTracking {
            applyWhenIdle(observedStore.cardPagingContext)
        } onChange: { scopeChanged.signal() }
        observedStore.hideMastered = true
        precondition(scopeChanged.wait(timeout: .now()) == .success,
                     "A blocked pager update must observe filters even when membership is unchanged")
        precondition(observedStore.filteredWords == oldDeck && blockedPaging.isTurning)

        // Repeated forward/backward swipes and cancellations must never strand the deck.
        for _ in 0..<10 {
            for word in words.dropFirst() {
                paging.begin(in: context())
                endSwipe(to: word.id, completed: true)
                precondition(store.currentWord?.id == word.id)
                paging.begin(in: context())
                endSwipe(to: words[0].id, completed: false)
                precondition(store.currentWord?.id == word.id, "Cancelling preserves selection")
            }
            for word in words.dropLast().reversed() {
                paging.begin(in: context())
                endSwipe(to: word.id, completed: true)
                precondition(store.currentWord?.id == word.id)
            }
        }
        paging.begin(in: context())
        store.next(); store.next(); store.next()
        endSwipe(to: words[1].id, completed: true)
        precondition(store.currentWord?.id == words[3].id, "Rapid next buttons during a swipe keep the latest requested card")
        paging.begin(in: context())
        store.rate(words[3], level: 2)
        endSwipe(to: words[2].id, completed: true)
        precondition(store.currentWord?.id == words[4].id && store.rating(words[3]) == 2, "A stale swipe cannot undo rating auto-advance")
        store.hideMastered = true
        store.selectWord(words[4])
        paging.begin(in: context())
        store.rate(words[4], level: 3)
        endSwipe(to: words[4].id, completed: true)
        precondition(store.currentWord?.id == words[5].id, "A filtered-out card cannot replace its next neighbour")
        paging.begin(in: context())
        store.dictionaryID = "grammar-fr"
        endSwipe(to: words[6].id, completed: true)
        precondition(store.currentWord?.id == words[0].id, "A completed old-book swipe cannot select the same ID in another book")
        paging.begin(in: context())
        endSwipe(to: "missing", completed: true)
        precondition(store.currentWord?.id == words[0].id, "Unavailable controller identities are ignored")
        paging.begin(in: context())
        store.categoryID = "1"
        endSwipe(to: words[1].id, completed: true)
        precondition(store.currentWord?.id == words[0].id, "Selecting a new scope invalidates the swipe even with identical deck membership")
        paging.begin(in: context())
        store.listMode = true
        endSwipe(to: words[1].id, completed: true)
        precondition(store.currentWord?.id == words[0].id, "A detached card pager cannot alter list selection")
        store.listMode = false
        store.startReview()
        store.selectWord(store.filteredWords.last!)
        let lastReviewID = store.currentWord!.id
        paging.begin(in: context())
        store.next()
        endSwipe(to: store.filteredWords.first!.id, completed: true)
        precondition(store.completed && store.currentWord?.id == lastReviewID,
                     "A late swipe cannot reopen a completed review round")
        store.mode = .study

        precondition(store.showExampleTranslations && store.cardExampleTranslation(for: examples[0]) == "你好。", "Example translations default on")
        precondition(store.cardExampleTranslation(for: examples[1]) == nil, "Missing translations never invent content")
        store.meaningLanguage = "en"
        precondition(store.cardExampleTranslation(for: examples[0]) == "Hello.")
        store.meaningLanguage = "de"
        precondition(store.cardExampleTranslation(for: examples[0]) == nil, "Translation uses the selected meaning language")
        store.meaningLanguage = "fr"
        precondition(store.cardExampleTranslation(for: .init(text: "Bonjour.", translations: ["fr": "Salut."])) == nil,
                     "Selecting the source language does not add a redundant same-language line")
        store.meaningLanguage = "zh-Hant"
        store.revealed = true
        let selectedID = store.currentWord?.id
        store.showExampleTranslations = false
        precondition(store.cardExampleTranslation(for: examples[0]) == nil && store.currentWord?.id == selectedID && store.revealed,
                     "Changing translation display never advances or hides the current answer")
        let relaunched = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(!relaunched.showExampleTranslations && relaunched.storageError == nil)
        let backup = try store.exportBackup()
        let restored = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try restored.importBackup(backup)
        precondition(!restored.showExampleTranslations, "The off preference survives backup transfer")
        var saved = try JSONSerialization.jsonObject(with: Data(contentsOf: stateURL)) as! [String: Any]
        saved.removeValue(forKey: "showExampleTranslations")
        let legacyURL = directory.appendingPathComponent("legacy.json")
        try JSONSerialization.data(withJSONObject: saved).write(to: legacyURL)
        let legacy = StudyStore(catalog: catalog, persistenceURL: legacyURL)
        precondition(legacy.showExampleTranslations && legacy.storageError == nil, "Old saved state opens with the enabled default")
        var olderBackup = try JSONSerialization.jsonObject(with: backup) as! [String: Any]
        var settings = olderBackup["settings"] as! [String: Any]
        settings.removeValue(forKey: "showExampleTranslations")
        olderBackup["settings"] = settings
        _ = try restored.importBackup(JSONSerialization.data(withJSONObject: olderBackup))
        precondition(!restored.showExampleTranslations, "An older backup preserves an existing explicit preference")
        let fresh = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try fresh.importBackup(JSONSerialization.data(withJSONObject: olderBackup))
        precondition(fresh.showExampleTranslations, "An older backup on a fresh install retains the enabled default")
        print("PASS: repeated/cancelled card swipes; queued button/rating/filter/book changes; default-on example translations; language/missing data; persistent preference and backup compatibility.")
    }
}
