import Foundation

@main
struct StudyStoreTests {
    @MainActor static func main() throws {
        let resource = URL(fileURLWithPath: CommandLine.arguments[1])
        let catalog = try JSONDecoder().decode([StudyDictionary].self, from: Data(contentsOf: resource))
        precondition(catalog.map(\.words.count) == [3846, 12, 414, 6, 6, 141, 0, 0, 229], "Bundled source counts")
        let vocabulary = catalog.filter { $0.kind == .vocabulary }
        let grammar = catalog.filter { $0.isGrammar && !$0.isThematicGrammar }
        let thematic = catalog.filter(\.isThematicGrammar)
        precondition(vocabulary.flatMap(\.words).count == 4272, "Vocabulary keeps every existing entry")
        precondition(vocabulary.flatMap(\.words).allSatisfy { word in
            guard let audio = word.audio else { return false }
            return FileManager.default.fileExists(atPath: resource.deletingLastPathComponent().appendingPathComponent(audio).path)
        }, "Every bundled vocabulary entry has a local audio file")
        precondition(grammar.map(\.id) == ["grammar-fr", "grammar-de", "grammar-ja"], "Grammar books keep separate stable identities")
        precondition(grammar.filter { $0.language != "ja" }.allSatisfy { $0.words.count == 6 }, "French/German starter books retain six entries")
        precondition(grammar.first { $0.language == "ja" }!.words.count == 141, "Japanese ordinary lessons retain their independent entries")
        precondition(thematic.map(\.id) == ["grammar-theme-fr", "grammar-theme-de", "grammar-theme-ja"])
        precondition(thematic.filter { $0.language != "ja" }.allSatisfy { $0.words.isEmpty && $0.categories.isEmpty && $0.isBuiltIn },
            "Unsupplied French/German thematic books stay empty and independent")
        precondition(thematic.first { $0.language == "ja" }!.words.count == 229, "Japanese thematic lessons retain their own entries")
        precondition(Set(grammar.flatMap(\.words).map(\.id)).isDisjoint(with: Set(thematic.flatMap(\.words).map(\.id))),
            "Ordinary and thematic grammar never share entry identities")
        precondition(grammar.flatMap(\.words).allSatisfy { $0.audio == nil }, "Grammar uses device speech without vocabulary clips")
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-native-tests-\(UUID().uuidString)")
        let stateURL = directory.appendingPathComponent("state.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let store = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(store.filteredWords.count == 3846)
        let age = catalog[0].words[0]
        store.listMode = true
        store.search = "age"
        precondition(store.filteredWords.contains(where: { $0.id == age.id }), "Accent insensitive search")
        store.search = "年齡"
        let traditionalIDs = Set(store.filteredWords.map(\.id))
        store.search = "年龄"
        precondition(Set(store.filteredWords.map(\.id)) == traditionalIDs, "Both Chinese scripts are searchable")
        store.search = ""
        store.rate(age, level: 3)
        store.hideMastered = true
        precondition(!store.filteredWords.contains(where: { $0.id == age.id }))
        store.mode = .lookup
        precondition(store.filteredWords.contains(where: { $0.id == age.id }), "Lookup never hides mastered words")
        store.mode = .study
        store.categoryID = "1"
        store.subcategoryID = "1.01"
        store.next()
        let selectedID = store.currentWord!.id
        store.listMode.toggle()
        precondition(store.currentWord!.id == selectedID, "Layout toggles preserve selected card")
        let restored = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(restored.currentWord?.id == selectedID && restored.rating(age) == 3, "Selection and progress persist")
        precondition(restored.storageError == nil)

        // Study removes mastery immediately without double-advancing or changing randomized order.
        for autoAdvance in [false, true] {
            for listMode in [false, true] {
                let filtered = StudyStore(catalog: [catalog[1]], persistenceURL: nil)
                filtered.dictionaryID = "de"
                filtered.hideMastered = true; filtered.autoAdvance = autoAdvance; filtered.listMode = listMode
                filtered.randomOrder = true
                let original = filtered.filteredWords
                filtered.selectWord(original[1]); filtered.revealed = true
                filtered.rate(original[1], level: 3)
                precondition(filtered.filteredWords.map(\.id) == original.filter { $0.id != original[1].id }.map(\.id), "Mastered study word removed without reshuffling")
                precondition(filtered.currentWord?.id == original[2].id && !filtered.revealed, "Study selects immediate neighbour without skipping")
                filtered.selectWord(filtered.filteredWords.last!)
                let last = filtered.currentWord!
                let previous = filtered.filteredWords[filtered.filteredWords.count - 2]
                filtered.rate(last, level: 3)
                precondition(filtered.currentWord?.id == previous.id, "Removing final study word retains previous boundary")
                let selected = filtered.currentWord!.id
                filtered.rate(filtered.filteredWords[0], level: 3)
                precondition(filtered.currentWord?.id == selected, "Rating another list row preserves selected word")
            }
        }
        testScopedCardBehavior()

        // A custom French dictionary can reuse a source ID without sharing progress or audio.
        let importedData = try json(["id": "dict-collision", "language": "fr", "title": "自訂辭典", "words": [
            ["id": age.id, "term": "école", "meanings": ["en": "school"], "example": "Une école.", "part": "n. f."]]])
        let customID = try store.importDictionary(importedData)
        precondition(customID != "dict-collision" && store.currentDictionary.id == customID)
        let importedWord = store.currentDictionary.words[0]
        precondition(store.rating(importedWord) == 0 && importedWord.audio == nil)
        precondition(store.displayMeaning(for: importedWord).contains("尚無"), "Missing meaning is not invented")
        store.rate(importedWord, level: 1)
        store.dictionaryID = "fr"
        precondition(store.rating(age) == 3, "Custom progress remains isolated")
        store.dictionaryID = customID
        precondition(store.rating(importedWord) == 1)

        let customRestored = StudyStore(catalog: catalog, persistenceURL: stateURL)
        precondition(customRestored.currentDictionary.words[0].part == "n. f.", "Relaunch preserves part of speech")
        precondition(customRestored.displayMeaning(for: customRestored.currentDictionary.words[0]).contains("尚無"), "Disk restore preserves missing meanings")
        let backup = try store.exportBackup()
        let beforeInvalid = try normalized(store.exportBackup())
        let malformed = try json(["app": "mots", "version": 3, "progress": ["fr": [age.id: 0]], "dictionaries": [["id": "dict-bad", "language": "xx", "words": []]]])
        do { try store.importBackup(malformed); preconditionFailure("Invalid backup must reject") } catch {}
        let afterInvalid = try normalized(store.exportBackup())
        precondition(afterInvalid == beforeInvalid, "Invalid backup changes nothing")
        let fresh = StudyStore(catalog: catalog, persistenceURL: nil)
        let importedCount = try fresh.importBackup(backup)
        precondition(importedCount == 2 && fresh.currentDictionary.id == customID)
        precondition(fresh.rating(fresh.currentDictionary.words[0]) == 1)
        precondition(fresh.currentDictionary.words[0].part == "n. f.", "Backup export and import preserve part of speech")
        precondition(fresh.displayMeaning(for: fresh.currentDictionary.words[0]).contains("尚無"), "Backup preserves missing meanings")
        _ = try fresh.importBackup(json(["app": "mots", "version": 1, "ratings": [age.id: 2, "unknown": 3]]))
        fresh.dictionaryID = "fr"
        precondition(fresh.rating(age) == 2 && fresh.progress["fr"]?["unknown"] == nil)

        // Review ignores search and chapters, prioritizes seen words, and stays fixed after rating.
        fresh.search = "not-a-word"
        fresh.categoryID = "16"
        fresh.startReview()
        precondition(fresh.reviewTotal == 20 && Set(fresh.filteredWords.map(\.id)).count == 20)
        precondition(fresh.filteredWords.first?.id == age.id, "Previously seen words have priority")
        let captured = fresh.filteredWords.map(\.id)
        fresh.rate(fresh.currentWord!, level: 3)
        precondition(fresh.filteredWords.map(\.id) == captured, "Review queue is stable after mastery")
        precondition(fresh.currentIndex == 1 && fresh.reviewRatedCount == 1)
        for _ in 1..<20 { fresh.next() }
        precondition(fresh.completed && fresh.reviewRatedCount == 1, "Skipped cards are not counted as rated")
        fresh.startReview()
        precondition(!fresh.filteredWords.contains(where: { $0.id == age.id }), "Next review excludes newly mastered cards")

        let withExtension = try json(["app": "mots", "version": 2, "progress": ["de": ["custom-de-extra": 2]],
            "customBanks": ["de": [["id": "custom-de-extra", "term": "testen", "meanings": ["zh-Hant": "測試"], "category": "16", "subcategory": "16.01"]]]])
        _ = try fresh.importBackup(withExtension)
        fresh.dictionaryID = "de"
        precondition(fresh.currentDictionary.words.count == 13 && fresh.currentDictionary.categories.contains(where: { $0.id == "16" }), "Legacy extensions retain source category navigation")
        precondition(fresh.rating(fresh.currentDictionary.words.last!) == 2)
        fresh.mode = .study
        fresh.randomOrder = true
        let shuffled = fresh.filteredWords.map(\.id)
        fresh.listMode = true; fresh.listMode = false
        precondition(fresh.filteredWords.map(\.id) == shuffled, "Layout toggle preserves shuffled deck")
        fresh.randomOrder = false
        precondition(fresh.filteredWords.map(\.id) == fresh.currentDictionary.words.map(\.id), "Source order can be restored")

        // Export independent of current UI filters, with UTF-8 BOM and spreadsheet formula protection.
        fresh.dictionaryID = customID
        fresh.search = "no-match"
        let csv = try fresh.exportCSV()
        precondition(csv.starts(with: [0xEF, 0xBB, 0xBF]) && String(decoding: csv, as: UTF8.self).contains("école"))
        let formula = try json(["language": "fr", "title": "CSV", "words": [["term": "=SUM(1,2)", "meaning": "+danger", "example": "\"quoted\""]]])
        _ = try fresh.importDictionary(formula)
        let safeCSV = String(decoding: try fresh.exportCSV(), as: UTF8.self)
        precondition(safeCSV.contains("'=SUM(1,2)") && safeCSV.contains("'+danger") && safeCSV.contains("\"\"quoted\"\""))
        fresh.rate(fresh.currentDictionary.words[0], level: 3)
        do { _ = try fresh.exportCSV(); preconditionFailure("Empty unfamiliar export must reject") } catch {}

        let unusable = directory.appendingPathComponent("not-a-directory")
        try Data("blocked".utf8).write(to: unusable)
        let unsaved = StudyStore(catalog: catalog, persistenceURL: unusable.appendingPathComponent("state.json"))
        unsaved.rate(age, level: 1)
        precondition(unsaved.storageError != nil && unsaved.rating(age) == 1, "Persistence failure keeps in-memory progress")
        let arrayID = try fresh.importDictionary(json([["term": "bonjour", "meaning": "你好"]]), title: "陣列匯入", language: "fr")
        precondition(fresh.currentDictionary.id == arrayID && fresh.currentDictionary.words.count == 1, "Bare arrays use explicit language and title")
        let corruptURL = directory.appendingPathComponent("corrupt.json")
        try Data("not-json".utf8).write(to: corruptURL)
        let recovered = StudyStore(catalog: catalog, persistenceURL: corruptURL)
        precondition(recovered.storageError != nil && recovered.filteredWords.count == 3846, "Corrupt saved state does not hide bundled catalog")
        let recoveryURL = recovered.recoveryFileURL!
        recovered.search = "âge"
        recovered.rate(age, level: 1)
        let recoveryBytes = try Data(contentsOf: recoveryURL)
        precondition(recoveryBytes == Data("not-json".utf8), "Original corrupt bytes survive later navigation and ratings")
        precondition(recovered.storageError?.contains(recoveryURL.path) == true, "Recovery location remains visible after successful saves")
        let afterRecovery = StudyStore(catalog: catalog, persistenceURL: corruptURL)
        precondition(afterRecovery.rating(age) == 1 && afterRecovery.storageError == nil, "Fresh state saves after successful quarantine")
        print("PASS: content/audio counts; search; lookup visibility; selected-card persistence; scoped progress; unconditional card advancement and list selection; manual page navigation and unrated review completion; card/search isolation and boundary handling; dictionary identity; atomic backup merge; v1/v2/v3 compatibility; legacy extension navigation; source/random order; live mastery filters without skipping; POS preservation; stable review and skipped counts; independent safe CSV; array import; storage failure and quarantined corrupt-state recovery.")
    }

    @MainActor static func testScopedCardBehavior() {
        let words = [
            StudyWord(id: "a", term: "alpha", meaning: "甲", category: "1", subcategory: "1.01", language: "fr"),
            StudyWord(id: "b", term: "beta", meaning: "乙", category: "1", subcategory: "1.01", language: "fr"),
            StudyWord(id: "c", term: "gamma", meaning: "丙", category: "1", subcategory: "1.02", language: "fr"),
            StudyWord(id: "d", term: "delta", meaning: "丁", category: "2", subcategory: "2.01", language: "fr"),
            StudyWord(id: "e", term: "epsilon", meaning: "戊", category: "2", subcategory: "2.01", language: "fr")
        ]
        let dictionary = StudyDictionary(id: "fr", title: "Regression fixture", language: "fr", categories: [
            StudyCategory(id: "1", name: "First topic", subcategories: [
                StudySubcategory(id: "1.01", name: "First lesson"), StudySubcategory(id: "1.02", name: "Second lesson")]),
            StudyCategory(id: "2", name: "Second topic", subcategories: [StudySubcategory(id: "2.01", name: "Third lesson")])
        ], words: words)

        // A committed page turn selects only its target; browsing does not rate words.
        let pageDirectory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-page-tests-\(UUID().uuidString)")
        let pageStateURL = pageDirectory.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: pageDirectory) }
        let pages = StudyStore(catalog: [dictionary], persistenceURL: pageStateURL)
        pages.categoryID = "1"; pages.subcategoryID = "1.01"
        pages.previous()
        precondition(pages.currentWord?.id == words[0].id && pages.cardPosition == 1,
            "Previous at the first page remains within the selected unit")
        pages.revealed = true
        pages.selectWord(words[1])
        precondition(pages.currentWord?.id == words[1].id && pages.cardPosition == 2 && !pages.revealed,
            "A completed forward page turn updates position and hides the new answer")
        let restoredPage = StudyStore(catalog: [dictionary], persistenceURL: pageStateURL)
        precondition(restoredPage.currentWord?.id == words[1].id && restoredPage.cardPosition == 2 && !restoredPage.revealed,
            "Relaunch resumes the committed page with its answer hidden")
        precondition(restoredPage.categoryID == "1" && restoredPage.subcategoryID == "1.01" && restoredPage.filteredWords.count == 2,
            "Page selection persistence preserves the current unit")
        pages.next()
        precondition(pages.currentWord?.id == words[1].id && !pages.completed,
            "Next at the final study page does not wrap or complete a review")
        pages.revealed = true
        pages.selectWord(words[0])
        precondition(pages.currentWord?.id == words[0].id && pages.cardPosition == 1 && !pages.revealed,
            "A completed backward page turn hides the previous answer")
        precondition(pages.filteredWords.map(\.id) == ["a", "b"] && words.allSatisfy { pages.rating($0) == 0 },
            "Forward and backward browsing preserve the unit order and all familiarity levels")
        precondition(pages.storageError == nil && restoredPage.storageError == nil)

        let unratedReview = StudyStore(catalog: [dictionary], persistenceURL: pageDirectory.appendingPathComponent("review.json"))
        unratedReview.startReview()
        let reviewPages = unratedReview.filteredWords
        unratedReview.selectWord(reviewPages[1]); unratedReview.revealed = true
        unratedReview.selectWord(reviewPages[0])
        precondition(unratedReview.cardPosition == 1 && !unratedReview.revealed && !unratedReview.completed,
            "Review pages can turn backward without revealing the target or completing the round")
        for word in reviewPages.dropFirst() {
            unratedReview.revealed = true
            unratedReview.selectWord(word)
            precondition(!unratedReview.revealed && !unratedReview.completed,
                "Each committed review page turn hides the answer and keeps the round open")
        }
        unratedReview.next()
        precondition(unratedReview.completed && unratedReview.cardPosition == reviewPages.count && unratedReview.reviewRatedCount == 0,
            "Continuing past the final review page completes the round without rating skipped words")
        precondition(unratedReview.filteredWords.map(\.id) == reviewPages.map(\.id) && words.allSatisfy { unratedReview.rating($0) == 0 },
            "Completing an unrated review retains its captured queue and familiarity levels")
        let restoredReview = StudyStore(catalog: [dictionary], persistenceURL: pageDirectory.appendingPathComponent("review.json"))
        precondition(restoredReview.completed && restoredReview.reviewRatedCount == 0 && restoredReview.filteredWords.map(\.id) == reviewPages.map(\.id),
            "Relaunch preserves completion of an unrated review")

        // Cards advance for every familiarity level, independently of the legacy preference.
        // Lists retain their selection even when that preference was saved as true.
        for legacyAdvance in [false, true] {
            for hideMastered in [false, true] {
                for level in 1...3 {
                    let cards = StudyStore(catalog: [dictionary], persistenceURL: nil)
                    cards.autoAdvance = legacyAdvance; cards.hideMastered = hideMastered
                    cards.selectWord(words[1]); cards.revealed = true
                    precondition(cards.showsCards && cards.cardPosition == 2)
                    cards.rate(words[1], level: level)
                    precondition(cards.rating(words[1]) == level && cards.currentWord?.id == words[2].id,
                        "Every card familiarity selection advances exactly once")
                    precondition(!cards.revealed, "The next card hides its answer")
                    let removesCurrent = hideMastered && level == 3
                    precondition(cards.filteredWords.count == (removesCurrent ? 4 : 5))
                    precondition(cards.cardPosition == (removesCurrent ? 2 : 3), "Position follows the visible deck")
                }
            }
            for level in 1...3 {
                let list = StudyStore(catalog: [dictionary], persistenceURL: nil)
                list.listMode = true; list.autoAdvance = legacyAdvance
                list.selectWord(words[1])
                list.rate(words[1], level: level)
                precondition(!list.showsCards && list.currentWord?.id == words[1].id,
                    "Rating a list row never automatically advances the selection")
                list.rate(words[1], level: level)
                precondition(list.rating(words[1]) == 0 && list.currentWord?.id == words[1].id,
                    "Repeating a list rating retains the existing clear-selection behavior")
            }
        }
        for level in 1...3 {
            let repeated = StudyStore(catalog: [dictionary], persistenceURL: nil)
            repeated.rate(words[0], level: level)
            repeated.previous(); repeated.revealed = true
            repeated.rate(words[0], level: level)
            precondition(repeated.rating(words[0]) == level && repeated.currentWord?.id == words[1].id && !repeated.revealed,
                "Repeating the same familiarity selection on a revisited card retains it and advances")
        }

        let boundary = StudyStore(catalog: [dictionary], persistenceURL: nil)
        boundary.selectWord(words.last!)
        boundary.rate(words.last!, level: 2)
        precondition(boundary.currentWord?.id == words.last!.id && boundary.cardPosition == words.count,
            "Rating the final study card does not wrap or leave an invalid position")
        let sole = StudyStore(catalog: [dictionary], persistenceURL: nil)
        sole.categoryID = "1"; sole.subcategoryID = "1.02"; sole.hideMastered = true
        sole.rate(words[2], level: 3)
        precondition(sole.filteredWords.isEmpty && sole.currentWord == nil && sole.cardPosition == 0,
            "Mastering the sole visible card leaves a valid empty deck")
        precondition(sole.scopeWords.count == 1 && sole.scopeMasteredCount == 1,
            "An empty visible deck retains completed unit progress")

        let layout = StudyStore(catalog: [dictionary], persistenceURL: nil)
        layout.randomOrder = true
        let shuffledIDs = layout.filteredWords.map(\.id)
        layout.selectWord(layout.filteredWords[2])
        let selectedID = layout.currentWord!.id
        layout.listMode = true; layout.listMode = false
        precondition(layout.filteredWords.map(\.id) == shuffledIDs && layout.currentWord?.id == selectedID,
            "Switching layouts preserves randomized order and the selected card")
        layout.listMode = true; layout.search = "beta"
        precondition(layout.filteredWords.map(\.id) == ["b"])
        layout.listMode = false
        precondition(layout.filteredWords.map(\.id) == shuffledIDs && layout.currentWord?.id == selectedID,
            "Leaving a searched list restores the prior card and its complete randomized order")
        let resume = StudyStore(catalog: [dictionary], persistenceURL: nil)
        resume.mode = .lookup; resume.listMode = true; resume.mode = .study
        resume.selectWord(words[1]); resume.rate(words[1], level: 2)
        resume.listMode = false
        precondition(resume.currentWord?.id == words[2].id,
            "Entering cards without a prior card position starts at the first unstudied word from the list selection")

        // Browsing or rating the list does not replace the paused card, even when it was already rated.
        for randomized in [false, true] {
            for level in 0...3 {
                let paused = StudyStore(catalog: [dictionary], persistenceURL: nil)
                paused.randomOrder = randomized
                paused.rate(words[2], level: level)
                paused.selectWord(words[2]); paused.revealed = true
                let pausedOrder = paused.filteredWords.map(\.id)
                let pausedPosition = paused.cardPosition
                paused.listMode = true
                paused.selectWord(words[4])
                paused.rate(words[0], level: 1)
                let savedRatings = words.map { paused.rating($0) }
                paused.listMode = false
                precondition(paused.currentWord?.id == words[2].id && paused.cardPosition == pausedPosition,
                    "Card/list/card resumes the exact card rather than the list page or next unstudied word")
                precondition(paused.filteredWords.map(\.id) == pausedOrder && words.map { paused.rating($0) } == savedRatings,
                    "Layout switching preserves randomized order and familiarity without rating or reshuffling")
                precondition(!paused.revealed && !paused.completed, "The resumed card starts with its answer hidden")
            }
        }

        let hiddenResume = StudyStore(catalog: [dictionary], persistenceURL: nil)
        hiddenResume.selectWord(words[2]); hiddenResume.listMode = true
        hiddenResume.hideMastered = true
        hiddenResume.rate(words[2], level: 3)
        hiddenResume.listMode = false
        precondition(hiddenResume.currentWord?.id == words[3].id && hiddenResume.filteredWords.count == 4,
            "Hiding the paused card selects the nearest surviving card, preferring the next on a tie")

        let deletedResume = StudyStore(catalog: [dictionary], persistenceURL: nil)
        deletedResume.selectWord(words[3]); deletedResume.listMode = true
        precondition(deletedResume.deleteWord(words[3]) && deletedResume.deleteWord(words[4]))
        deletedResume.listMode = false
        precondition(deletedResume.currentWord?.id == words[2].id && deletedResume.cardPosition == 3,
            "Deleting the paused card and its next neighbor resumes the nearest surviving prior card")

        let scopedResume = StudyStore(catalog: [dictionary], persistenceURL: nil)
        scopedResume.selectWord(words[4]); scopedResume.listMode = true
        scopedResume.categoryID = "1"
        scopedResume.selectWord(words[1]); scopedResume.rate(words[1], level: 2)
        scopedResume.listMode = false
        precondition(scopedResume.currentWord?.id == words[2].id && scopedResume.filteredWords.allSatisfy { $0.category == "1" },
            "A changed topic invalidates the old paused card and keeps initial list-to-card behavior in the new scope")

        let alternate = StudyDictionary(id: "dict-alternate", title: "Other dictionary", language: "fr", categories: dictionary.categories, words: words)
        let dictionaryResume = StudyStore(catalog: [dictionary, alternate], persistenceURL: nil)
        dictionaryResume.selectWord(words[4]); dictionaryResume.listMode = true
        dictionaryResume.dictionaryID = alternate.id
        dictionaryResume.selectWord(words[1]); dictionaryResume.rate(words[1], level: 2)
        dictionaryResume.listMode = false
        precondition(dictionaryResume.currentWord?.id == words[2].id && dictionaryResume.rating(words[1]) == 2,
            "A dictionary switch never reuses a paused card from another dictionary with the same word IDs")

        let emptyResume = StudyStore(catalog: [dictionary], persistenceURL: nil)
        emptyResume.categoryID = "1"; emptyResume.subcategoryID = "1.02"
        emptyResume.listMode = true
        precondition(emptyResume.deleteWord(words[2]))
        emptyResume.listMode = false
        precondition(emptyResume.filteredWords.isEmpty && emptyResume.currentIndex == 0 && emptyResume.currentWord == nil,
            "Removing the sole paused card leaves a valid empty card deck")

        let scoped = StudyStore(catalog: [dictionary], persistenceURL: nil)
        scoped.rate(words[0], level: 3); scoped.rate(words[3], level: 3)
        precondition(scoped.scopeWords.count == 5 && scoped.scopeMasteredCount == 2)
        scoped.categoryID = "1"
        precondition(scoped.scopeWords.map(\.id) == ["a", "b", "c"] && scoped.scopeMasteredCount == 1)
        precondition(scoped.currentScopeTitle == "First topic", "Parent progress describes the chosen topic")
        scoped.subcategoryID = "1.01"
        precondition(scoped.scopeWords.map(\.id) == ["a", "b"] && scoped.scopeMasteredCount == 1)
        precondition(scoped.currentScopeTitle == "First lesson", "Child progress describes the chosen lesson")
        scoped.hideMastered = true
        precondition(scoped.filteredWords.map(\.id) == ["b"] && scoped.scopeWords.count == 2,
            "Hiding mastered words does not shrink the unit progress denominator")
        scoped.listMode = true; scoped.search = "no-match"
        precondition(scoped.filteredWords.isEmpty && scoped.scopeWords.count == 2 && scoped.scopeMasteredCount == 1,
            "Search affects results without changing unit progress")
        scoped.listMode = false
        precondition(scoped.filteredWords.map(\.id) == ["b"] && scoped.cardPosition == 1,
            "A hidden list search never filters the cards")
        scoped.listMode = true
        precondition(scoped.filteredWords.isEmpty, "Returning to the list restores its search")
        scoped.search = ""; scoped.categoryID = "2"
        precondition(scoped.subcategoryID == nil && scoped.scopeWords.map(\.id) == ["d", "e"] && scoped.scopeMasteredCount == 1,
            "Changing topic clears the child scope and recomputes progress")
        scoped.mode = .lookup
        precondition(!scoped.showsCards && scoped.scopeWords.count == 5 && scoped.scopeMasteredCount == 2,
            "Lookup progress includes the whole dictionary")

        // Review progress belongs to its captured round, including newly mastered cards.
        scoped.search = "no-match"; scoped.startReview()
        let captured = scoped.filteredWords.map(\.id)
        precondition(scoped.showsCards && captured.count == 3 && scoped.scopeWords.map(\.id) == captured)
        for rated in 1...captured.count {
            scoped.rate(scoped.currentWord!, level: 3)
            precondition(scoped.filteredWords.map(\.id) == captured && scoped.scopeWords.count == captured.count,
                "Review membership and progress denominator remain fixed after rating")
            precondition(scoped.reviewRatedCount == rated && scoped.scopeMasteredCount == rated)
        }
        precondition(scoped.completed && scoped.cardPosition == captured.count,
            "Rating the last review card completes the captured round")
    }
    static func json(_ object: Any) throws -> Data { try JSONSerialization.data(withJSONObject: object, options: [.sortedKeys]) }
    static func normalized(_ data: Data) throws -> Data {
        var object = try JSONSerialization.jsonObject(with: data) as! [String: Any]
        object.removeValue(forKey: "exportedAt")
        return try json(object)
    }
}
