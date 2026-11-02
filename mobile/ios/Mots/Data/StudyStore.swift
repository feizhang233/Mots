import Foundation
import CoreFoundation
import Observation

@MainActor @Observable
final class StudyStore {
    private(set) var dictionaries: [StudyDictionary]
    var dictionaryID: String = "fr" { didSet { if dictionaryID != oldValue { dictionaryChanged(from: oldValue) } } }
    var mode: StudyMode = .study { didSet { if mode != oldValue { modeChanged(from: oldValue) } } }
    var search = "" { didSet { if search != oldValue { filtersChanged(preservingCardPosition: mode == .study && listMode) } } }
    var categoryID: String? { didSet { if categoryID != oldValue { if !restoring { subcategoryID = nil }; filtersChanged() } } }
    var subcategoryID: String? { didSet { if subcategoryID != oldValue { filtersChanged() } } }
    var listMode = false { didSet {
        if oldValue != listMode { resetListMeaningReveals() }
        if !restoring && oldValue != listMode && mode == .study { layoutChanged() }
        persist()
    } }
    var randomOrder = false { didSet { if randomOrder != oldValue { filtersChanged() } } }
    var hideMastered = false { didSet { if hideMastered != oldValue { filtersChanged(preservingCardPosition: true) } } }
    var hideImpression = false { didSet { if hideImpression != oldValue { filtersChanged(preservingCardPosition: true) } } }
    var hideListMeanings = false { didSet {
        if hideListMeanings != oldValue { resetListMeaningReveals() }
        persist()
    } }
    var showExampleTranslations = true { didSet { persist() } }
    var appearance: StudyAppearance = .system { didSet { persist() } }
    var meaningLanguage = "zh-Hant" { didSet {
        if meaningLanguage != oldValue { resetListMeaningReveals() }
        persist()
    } }
    var speechRate = 0.45 { didSet { persist() } }
    // Retain the legacy saved preference for compatibility; cards always advance.
    var autoAdvance = false { didSet { persist() } }
    var pageSize = 20 { didSet {
        if pageSize != oldValue { resetListMeaningReveals() }
        persist()
    } }
    var currentIndex = 0 { didSet { persist() } }
    var revealed = false { didSet { if mode == .memory && revealed != oldValue { persist() } } }
    // Presentation state survives card/list swaps, but never enters backups or progress sync.
    var expandedGrammarGroupIDs = Set<String>()
    private struct ListMeaningKey: Hashable {
        let dictionaryID: String
        let wordID: String
    }
    private var revealedListMeaning: ListMeaningKey?
    private(set) var filteredWords: [StudyWord] = []
    private(set) var completed = false
    private(set) var storageError: String?
    private(set) var recoveryFileURL: URL?
    private(set) var loadError: String?
    private(set) var progress: [String: [String: Int]] = [:]
    private(set) var memory: [String: [String: MemoryRecord]] = [:]
    private var memoryChapters: [String: [String]] = [:]
    private(set) var memorySessionActive = false
    private(set) var memoryAnsweredCount = 0
    private(set) var memoryMasteredCount = 0
    private(set) var memoryFeedback: String?
    private var memoryAnsweredIDs = Set<String>()
    private var memorySessions = MemorySessionLibrary()
    private(set) var syncMetadata: ProgressSyncMetadata?
    private(set) var deletionMetadata: WordDeletionMetadata?
    private var deletionFlags: [String: Bool] = [:]
    @ObservationIgnored private var syncInstance: ProgressSyncController?
    var syncController: ProgressSyncController {
        if let syncInstance { return syncInstance }
        let instance = ProgressSyncController(store: self)
        syncInstance = instance
        return instance
    }
    private var reviewRatedIDs = Set<String>()
    private struct CardResumePosition {
        let wordID: String
        let index: Int
        let deckIDs: [String]
    }
    private var cardResumePosition: CardResumePosition?
    @ObservationIgnored private let persistenceURL: URL?
    @ObservationIgnored private let bundledDictionaries: [StudyDictionary]
    @ObservationIgnored private let memoryRoundOrder: ([StudyWord]) -> [StudyWord]
    @ObservationIgnored private var restoring = true
    @ObservationIgnored private var recoveryNotice: String?
    @ObservationIgnored private var persistenceBlocked = false

    nonisolated static var defaultPersistenceURL: URL? {
        FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first?
            .appendingPathComponent("Mots", isDirectory: true).appendingPathComponent("study-state.json")
    }

    init(catalog: [StudyDictionary]? = nil, persistenceURL: URL? = StudyStore.defaultPersistenceURL,
         memoryRoundOrder: @escaping ([StudyWord]) -> [StudyWord] = { $0.shuffled() }) {
        self.persistenceURL = persistenceURL
        self.memoryRoundOrder = memoryRoundOrder
        var catalogError: String?
        var loaded: [StudyDictionary]
        if let catalog { loaded = catalog }
        else {
            do {
                guard let base = Bundle.main.resourceURL else { throw StudyDataError("找不到 App 資源。") }
                let nested = base.appendingPathComponent("Resources/catalog.json")
                let url = FileManager.default.fileExists(atPath: nested.path) ? nested : base.appendingPathComponent("catalog.json")
                loaded = try JSONDecoder().decode([StudyDictionary].self, from: Data(contentsOf: url))
                guard !loaded.isEmpty else { throw StudyDataError("內建詞庫是空的。") }
            } catch { loaded = []; catalogError = "無法載入內建詞庫：\(error.localizedDescription)" }
        }
        dictionaries = loaded
        bundledDictionaries = loaded
        loadError = catalogError
        if let persistenceURL, FileManager.default.fileExists(atPath: persistenceURL.path) {
            do {
                let state = try JSONDecoder().decode(SavedState.self, from: Data(contentsOf: persistenceURL))
                // Persisted content is our own Codable output. Revalidate its identity and references.
                let custom = try state.dictionaries.map { dictionary -> StudyDictionary in
                    let json = Self.dictionaryJSON(dictionary)
                    return try StudyImport.dictionary(json, id: dictionary.id)
                }
                guard custom.count <= 20, Set(custom.map(\.id)).count == custom.count else { throw StudyDataError("儲存的辭典數量或 ID 不正確。") }
                dictionaries = loaded + custom
                for (id, extras) in state.extensions {
                    guard let index = dictionaries.firstIndex(where: { $0.id == id && $0.isBuiltIn }) else { continue }
                    let known = Set(dictionaries[index].words.map(\.id))
                    dictionaries[index] = addingExtensions(extras.filter { !known.contains($0.id) }, to: dictionaries[index])
                }
                progress = cleanedProgress(state.progress, dictionaries: dictionaries)
                let savedMemory = state.memory ?? [:]
                try MemoryRecord.validate(savedMemory)
                memory = savedMemory
                memoryChapters = state.memoryChapters ?? [:]
                memorySessions = state.memorySessions ?? MemorySessionLibrary()
                if var metadata = state.syncMetadata {
                    try metadata.validate()
                    syncMetadata = metadata
                    applySyncRecordsToKnownWords()
                }
                if var deletions = state.deletionMetadata {
                    try deletions.validate()
                    setDeletionMetadata(deletions)
                }
                dictionaryID = dictionaries.contains(where: { $0.id == state.dictionaryID }) ? state.dictionaryID : dictionaries.first?.id ?? "fr"
                mode = state.mode == .memory && currentDictionary.isGrammar ? .study : state.mode
                search = state.search; categoryID = state.categoryID; subcategoryID = state.subcategoryID
                if currentDictionary.isThematicGrammar { subcategoryID = nil }
                listMode = state.listMode; hideMastered = state.hideMastered; randomOrder = state.randomOrder ?? false
                hideImpression = state.hideImpression ?? false
                hideListMeanings = state.hideListMeanings ?? false
                showExampleTranslations = state.showExampleTranslations ?? true
                appearance = state.appearance.flatMap(StudyAppearance.init(rawValue:)) ?? .system
                meaningLanguage = StudyImport.meaningLanguages.contains(state.meaningLanguage) ? state.meaningLanguage : "zh-Hant"
                speechRate = min(0.6, max(0.25, state.speechRate)); autoAdvance = state.autoAdvance
                pageSize = [10, 20, 50, 100].contains(state.pageSize) ? state.pageSize : 20
                if state.memorySessions == nil, mode == .memory, !state.deckIDs.isEmpty,
                   state.deckIDs.count <= MemorySession.maximumWords, Set(state.deckIDs).count == state.deckIDs.count,
                   state.deckIDs.indices.contains(state.currentIndex) {
                    // Build 4 saved the sequential deck/index, but not reveal or answer bookkeeping.
                    let index = state.currentIndex
                    let answered = state.completed ? state.deckIDs : Array(state.deckIDs.prefix(index))
                    let session = MemorySession(deckIDs: state.deckIDs, currentWordID: state.deckIDs[index],
                        currentIndex: index, answeredIDs: answered, answeredCount: answered.count,
                        masteredCount: answered.filter { memory[dictionaryID]?[$0]?.stage == MemoryRecord.masteryStage && progress[dictionaryID]?[$0] == 3 }.count,
                        revealed: false, completed: state.completed, paused: false, feedback: nil)
                    if session.isValid { memorySessions.sessions[dictionaryID] = session }
                }
                if mode == .review {
                    let byID = Dictionary(uniqueKeysWithValues: availableWords.map { ($0.id, $0) })
                    filteredWords = state.deckIDs.compactMap { byID[$0] }
                    reviewRatedIDs = Set(state.reviewRatedIDs).intersection(Set(filteredWords.map(\.id)))
                } else {
                    rebuildDeck()
                    if randomOrder && mode == .study {
                        let byID = Dictionary(uniqueKeysWithValues: filteredWords.map { ($0.id, $0) })
                        let restoredDeck = state.deckIDs.compactMap { byID[$0] }
                        if restoredDeck.count == filteredWords.count && Set(state.deckIDs).count == restoredDeck.count { filteredWords = restoredDeck }
                    }
                }
                if mode != .memory {
                    currentIndex = min(max(0, state.currentIndex), max(0, filteredWords.count - 1))
                    completed = state.completed && !filteredWords.isEmpty
                }
            } catch {
                // Quarantine original bytes before later navigation or ratings can save new state.
                dictionaries = loaded
                syncMetadata = nil; deletionMetadata = nil; deletionFlags = [:]; progress = [:]; memory = [:]; memoryChapters = [:]
                memorySessions = MemorySessionLibrary(); memorySessionActive = false; dictionaryID = loaded.first?.id ?? "fr"
                mode = .study; search = ""; categoryID = nil; subcategoryID = nil
                rebuildDeck()
                let recoveryURL = persistenceURL.deletingLastPathComponent().appendingPathComponent(
                    "\(persistenceURL.deletingPathExtension().lastPathComponent).recovery-\(UUID().uuidString).json")
                do {
                    try FileManager.default.copyItem(at: persistenceURL, to: recoveryURL)
                    recoveryFileURL = recoveryURL
                    recoveryNotice = "上次狀態無法讀取；原始檔案已保留於 \(recoveryURL.path)。新進度可正常儲存。"
                    storageError = recoveryNotice
                } catch {
                    persistenceBlocked = true
                    storageError = "上次狀態無法讀取，且無法建立復原副本。為保護原檔，新的進度目前僅在記憶體中；請匯出備份。\(error.localizedDescription)"
                }
            }
        } else { rebuildDeck() }
        restoring = false
    }

    var currentDictionary: StudyDictionary { dictionaries.first(where: { $0.id == dictionaryID }) ?? dictionaries.first ?? .empty }
    var currentWord: StudyWord? { filteredWords.indices.contains(currentIndex) ? filteredWords[currentIndex] : nil }
    var availableWords: [StudyWord] { currentDictionary.words.filter { !isDeleted($0.id) } }
    var availableCategories: [StudyCategory] {
        let used = Set(availableWords.map(\.category))
        return currentDictionary.categories.filter { used.contains($0.id) }
    }
    func availableSubcategories(in category: StudyCategory) -> [StudySubcategory] {
        let used = Set(availableWords.filter { $0.category == category.id }.map(\.subcategory))
        return category.subcategories.filter { used.contains($0.id) }
    }
    var deletedWords: [StudyWord] { currentDictionary.words.filter { isDeleted($0.id) } }
    func isDeleted(_ wordID: String, dictionaryID: String? = nil) -> Bool {
        deletionFlags[WordDeletionRecord.key(dictionaryID: dictionaryID ?? self.dictionaryID, wordID: wordID)] == true
    }
    var counts: [Int: Int] {
        var result = [0: 0, 1: 0, 2: 0, 3: 0]
        for word in availableWords { result[rating(word), default: 0] += 1 }
        return result
    }
    var reviewCount: Int { availableWords.filter { rating($0) < 3 }.count }
    var reviewRatedCount: Int { reviewRatedIDs.count }
    var reviewTotal: Int { mode == .review ? filteredWords.count : 0 }
    var masteredCount: Int { counts[3, default: 0] }
    var showsCards: Bool { mode == .review || mode == .memory || (mode == .study && !listMode) }
    // Unit statistics include mastered words and ignore transient list filters.
    var scopeWords: [StudyWord] {
        if mode == .review { return filteredWords }
        guard mode == .study else { return availableWords }
        return availableWords.filter {
            (categoryID == nil || $0.category == categoryID) &&
            (subcategoryID == nil || $0.subcategory == subcategoryID)
        }
    }
    var scopeMasteredCount: Int { scopeWords.filter { rating($0) == 3 }.count }
    var currentScopeTitle: String {
        guard mode == .study,
              let category = currentDictionary.categories.first(where: { $0.id == categoryID }) else {
            return currentDictionary.displayTitle
        }
        return category.subcategories.first(where: { $0.id == subcategoryID })?.name ?? category.name
    }
    var cardPosition: Int { filteredWords.isEmpty ? 0 : min(currentIndex + 1, filteredWords.count) }

    func rating(_ word: StudyWord) -> Int { progress[dictionaryID]?[word.id] ?? 0 }
    func displayMeaning(for word: StudyWord) -> String {
        word.meanings[meaningLanguage] ?? "此\(currentDictionary.isGrammar ? "語法" : "詞")尚無\(Self.meaningLanguageName(meaningLanguage))釋義"
    }
    func cardExampleTranslation(for example: StudyExample) -> String? {
        guard showExampleTranslations, meaningLanguage != currentDictionary.language,
              let translation = example.translations[meaningLanguage],
              !translation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              translation != example.text else { return nil }
        return translation
    }
    func compactGrammarMeaning(for word: StudyWord) -> String {
        let text = displayMeaning(for: word)
        guard currentDictionary.isGrammar, ["zh-Hant", "zh-Hans"].contains(meaningLanguage),
              word.meanings[meaningLanguage] != nil else { return text }
        let senses: [String]
        if text.range(of: #"^\s*[①-⑳]"#, options: .regularExpression) != nil {
            let expression = try! NSRegularExpression(pattern: "[①-⑳][^①-⑳]*")
            let source = text as NSString
            senses = expression.matches(in: text, range: NSRange(location: 0, length: source.length))
                .map { source.substring(with: $0.range) }
        } else { senses = [text] }
        let summary = senses.map {
            $0.components(separatedBy: "。").first!.trimmingCharacters(in: .whitespacesAndNewlines)
        }.joined(separator: "\n")
        return summary.isEmpty ? text : summary
    }
    func isListMeaningVisible(for word: StudyWord) -> Bool {
        !hideListMeanings || mode != .study || currentDictionary.isGrammar ||
            revealedListMeaning == ListMeaningKey(dictionaryID: dictionaryID, wordID: word.id)
    }
    func revealListMeaning(for word: StudyWord) {
        guard hideListMeanings, mode == .study, !currentDictionary.isGrammar, !isDeleted(word.id),
              currentDictionary.words.contains(where: { $0.id == word.id }) else { return }
        revealedListMeaning = ListMeaningKey(dictionaryID: dictionaryID, wordID: word.id)
    }
    // Reveals are temporary: list pagination calls this without changing progress or selection.
    func resetListMeaningReveals() { revealedListMeaning = nil }
    static func meaningLanguageName(_ code: String) -> String {
        ["zh-Hant": "繁體中文", "zh-Hans": "簡體中文", "en": "英文", "fr": "法語", "de": "德語", "ja": "日語"][code] ?? code
    }
    func categoryName(for word: StudyWord) -> String { currentDictionary.categories.first(where: { $0.id == word.category })?.name ?? word.category }
    func subcategoryName(for word: StudyWord) -> String { currentDictionary.categories.flatMap(\.subcategories).first(where: { $0.id == word.subcategory })?.name ?? word.subcategory }

    func rate(_ word: StudyWord, level: Int) {
        guard (0...3).contains(level), !isDeleted(word.id), currentDictionary.words.contains(where: { $0.id == word.id }) else { return }
        let selectedID = currentWord?.id
        let previousIndex = currentIndex
        let oldLevel = rating(word)
        let newLevel = !showsCards && oldLevel == level ? 0 : level
        do {
            var metadata = try preparedSyncMetadata()
            try metadata.edit(dictionaryID: dictionaryID, wordID: word.id, level: newLevel)
            syncMetadata = metadata
        } catch { storageError = error.localizedDescription; return }
        progress[dictionaryID, default: [:]][word.id] = newLevel
        if newLevel != oldLevel { resetMemoryProgress(word.id, dictionaryID: dictionaryID) }
        if mode == .review {
            // Only review captures a round whose membership and order remain fixed while rating.
            reviewRatedIDs.insert(word.id)
            if selectedID == word.id { next() }
        } else if mode == .study && (hideMastered || hideImpression) {
            let matching = matchingWords()
            let eligibleIDs = Set(matching.map(\.id))
            let previousIDs = Set(filteredWords.map(\.id))
            filteredWords = randomOrder
                ? filteredWords.filter { eligibleIDs.contains($0.id) } + matching.filter { !previousIDs.contains($0.id) }
                : matching
            if let selectedID, let index = filteredWords.firstIndex(where: { $0.id == selectedID }) {
                currentIndex = index
                if showsCards && selectedID == word.id { next() }
            } else {
                // Removing the current word leaves its next neighbour at the same index.
                // At the end, use the preceding word; do not auto-advance a second time.
                currentIndex = min(previousIndex, max(0, filteredWords.count - 1))
            }
            revealed = false; completed = false
        } else if showsCards && selectedID == word.id { next() }
        persist()
        syncInstance?.localDidChange()
    }
    func next() {
        guard !filteredWords.isEmpty else { return }
        if currentIndex < filteredWords.count - 1 { currentIndex += 1; revealed = false; completed = false }
        else if mode == .review { revealed = false; completed = true }
        persist()
    }
    func previous() {
        guard currentIndex > 0 else { return }
        currentIndex -= 1; revealed = false; completed = false; persist()
    }
    func selectWord(_ word: StudyWord) {
        guard let index = filteredWords.firstIndex(where: { $0.id == word.id }) else { return }
        currentIndex = index; revealed = false; completed = false; persist()
    }
    func reshuffle() {
        guard mode == .study else { return }
        if !randomOrder { randomOrder = true }
        else { rebuildDeck(); persist() }
    }
    func resetSession() {
        if mode == .review { captureReview() } else { rebuildDeck() }
        persist()
    }
    func startReview() {
        if mode != .review { mode = .review } else { captureReview(); persist() }
    }

    private func dictionaryChanged(from previousID: String) {
        guard !restoring else { return }
        if mode == .memory { captureMemorySession(for: previousID) }
        memorySessionActive = false
        cardResumePosition = nil
        restoring = true
        search = ""; categoryID = nil; subcategoryID = nil
        if mode == .memory && currentDictionary.isGrammar { mode = .study }
        restoring = false
        if mode == .review { captureReview() } else { rebuildDeck() }
        persist()
    }
    private func modeChanged(from previousMode: StudyMode) {
        guard !restoring else { return }
        if previousMode == .memory { captureMemorySession(for: dictionaryID) }
        memorySessionActive = false
        cardResumePosition = nil
        if mode == .review { captureReview() } else { rebuildDeck() }
        persist()
    }
    private func filtersChanged(preservingCardPosition: Bool = false) {
        guard !restoring else { return }
        if mode != .review { rebuildDeck(preservingCardPosition: preservingCardPosition) }
        persist()
    }
    private func matchingWords() -> [StudyWord] {
        let query = folded(search.trimmingCharacters(in: .whitespacesAndNewlines))
        return availableWords.filter { word in
            (mode == .lookup || categoryID == nil || categoryID == word.category) &&
            (mode == .lookup || subcategoryID == nil || subcategoryID == word.subcategory) &&
            (mode == .lookup || !hideMastered || rating(word) < 3) &&
            (mode != .study || !hideImpression || rating(word) != 2) &&
            (showsCards || query.isEmpty || folded([word.term, word.pattern, word.explanation]
                + word.exampleTexts + Array(word.meanings.values)
                + word.examples.flatMap { Array($0.translations.values) }).contains(query))
        }
    }
    private func layoutChanged() {
        let selectedID = currentWord?.id
        if listMode {
            cardResumePosition = selectedID.map {
                CardResumePosition(wordID: $0, index: currentIndex, deckIDs: filteredWords.map(\.id))
            }
        }
        let matching = matchingWords()
        let priorIDs = !listMode ? cardResumePosition?.deckIDs ?? filteredWords.map(\.id) : filteredWords.map(\.id)
        let previousIDs = Set(priorIDs)
        let byID = Dictionary(uniqueKeysWithValues: matching.map { ($0.id, $0) })
        // A temporary list search must not discard the card deck's established random order.
        filteredWords = randomOrder
            ? priorIDs.compactMap { byID[$0] } + matching.filter { !previousIDs.contains($0.id) }.shuffled()
            : matching
        currentIndex = filteredWords.firstIndex(where: { $0.id == selectedID }) ?? 0
        if !listMode {
            if let resume = cardResumePosition {
                let eligibleIDs = Set(filteredWords.map(\.id))
                let nearestID = eligibleIDs.contains(resume.wordID) ? resume.wordID : resume.deckIDs.enumerated()
                    .filter { eligibleIDs.contains($0.element) }
                    .min {
                        let leftDistance = abs($0.offset - resume.index)
                        let rightDistance = abs($1.offset - resume.index)
                        return leftDistance == rightDistance ? $0.offset > $1.offset : leftDistance < rightDistance
                    }?.element
                currentIndex = filteredWords.firstIndex(where: { $0.id == nearestID })
                    ?? min(resume.index, max(0, filteredWords.count - 1))
            } else { selectFirstUnstudied() }
            cardResumePosition = nil
        }
        revealed = false; completed = false
    }
    private func rebuildDeck(preservingCardPosition: Bool = false) {
        resetListMeaningReveals()
        if mode == .memory {
            restoreMemorySession()
            return
        }
        if !preservingCardPosition { cardResumePosition = nil }
        var words = matchingWords()
        if mode == .lookup { words.sort { $0.term.compare($1.term, options: [.caseInsensitive, .diacriticInsensitive], locale: Locale(identifier: currentDictionary.locale)) == .orderedAscending } }
        if mode == .study && randomOrder { words.shuffle() }
        filteredWords = words; currentIndex = 0; revealed = false; completed = false
    }
    private func selectFirstUnstudied() {
        guard !filteredWords.isEmpty else { return }
        let start = min(max(0, currentIndex), filteredWords.count - 1)
        let indices = Array(start..<filteredWords.count) + Array(0..<start)
        if let index = indices.first(where: { rating(filteredWords[$0]) == 0 }) { currentIndex = index }
        revealed = false; completed = false
    }
    private func captureReview() {
        resetListMeaningReveals()
        let seen = availableWords.filter { (1...2).contains(rating($0)) }.shuffled()
        let unseen = availableWords.filter { rating($0) == 0 }.shuffled()
        filteredWords = Array((seen + unseen).prefix(20))
        currentIndex = 0; revealed = false; completed = false; reviewRatedIDs = []
    }
    private func folded(_ text: String) -> String { text.folding(options: [.caseInsensitive, .diacriticInsensitive, .widthInsensitive], locale: Locale(identifier: currentDictionary.locale)) }
    private func folded(_ texts: [String]) -> String { folded(texts.joined(separator: " ")) }

    var selectedMemoryChapters: Set<String> {
        let valid = Set(availableCategories.map(\.id))
        return memoryChapters[dictionaryID].map { Set($0).intersection(valid) } ?? []
    }
    var memoryWords: [StudyWord] {
        let selected = selectedMemoryChapters
        return availableWords.filter { rating($0) == 2 && selected.contains($0.category) }
    }
    func memoryRecord(for word: StudyWord) -> MemoryRecord? {
        guard let record = memory[dictionaryID]?[word.id], record.stage < MemoryRecord.masteryStage else { return nil }
        return record
    }
    private func memoryIsDue(_ word: StudyWord, at now: Double) -> Bool {
        memoryRecord(for: word).map { $0.dueAt <= now } ?? true
    }

    private func keepCapturedMemoryWord(_ word: StudyWord, at now: Double) -> Bool {
        memoryAnsweredIDs.contains(word.id) || (!isDeleted(word.id) && rating(word) == 2 && memoryIsDue(word, at: now))
    }
    /// Keep a dated reset so restoring an older backup cannot resurrect a previous learning cycle.
    private func resetMemoryProgress(_ wordID: String, dictionaryID: String) {
        guard let record = memory[dictionaryID]?[wordID] else { return }
        let stamp = min(MemoryRecord.maxTimestamp, max(MemoryRecord.milliseconds(Date()), record.updatedAt + 1))
        memory[dictionaryID]?[wordID] = MemoryRecord(stage: 0, dueAt: stamp, updatedAt: stamp)
    }
    func memoryDueWords(at date: Date = Date()) -> [StudyWord] {
        let now = MemoryRecord.milliseconds(date)
        let positions = Dictionary(uniqueKeysWithValues: availableWords.enumerated().map { ($0.element.id, $0.offset) })
        return memoryWords.filter { memoryIsDue($0, at: now) }
            .sorted { left, right in
                let lhs = memoryRecord(for: left)?.dueAt ?? Double.greatestFiniteMagnitude
                let rhs = memoryRecord(for: right)?.dueAt ?? Double.greatestFiniteMagnitude
                return lhs == rhs ? positions[left.id, default: 0] < positions[right.id, default: 0] : lhs < rhs
            }
    }
    var memoryNextDue: Date? {
        let now = MemoryRecord.milliseconds(Date())
        return memoryWords.compactMap { memoryRecord(for: $0)?.dueAt }.filter { $0 > now }.min()
            .map { Date(timeIntervalSince1970: $0 / 1000) }
    }
    func selectMemoryChapters(_ ids: Set<String>) {
        if mode == .memory, memorySessionActive { leaveMemoryRound() }
        memoryChapters[dictionaryID] = Array(ids.intersection(Set(availableCategories.map(\.id)))).sorted()
        persist()
    }
    func openMemory() {
        guard !currentDictionary.isGrammar else { return }
        if mode != .memory { mode = .memory }
        else { refreshMemoryVisibility(); persist() }
    }
    func startMemoryRound(at date: Date = Date()) {
        guard mode == .memory, !currentDictionary.isGrammar else { return }
        let dueWords = memoryDueWords(at: date)
        guard !dueWords.isEmpty else { return }
        // Capture a fresh order only for an explicit new round. Continuation restores saved IDs.
        let words = memoryRoundOrder(dueWords)
        let wasRestoring = restoring
        restoring = true
        filteredWords = words; currentIndex = 0; revealed = false; completed = false
        memorySessionActive = true; memoryAnsweredIDs = []
        memoryAnsweredCount = 0; memoryMasteredCount = 0; memoryFeedback = nil
        restoring = wasRestoring
        persist()
    }
    var hasSavedMemoryRound: Bool { memorySessions.sessions[dictionaryID] != nil }
    var hasUnfinishedMemoryRound: Bool { memorySessions.sessions[dictionaryID].map { !$0.completed } ?? false }

    func leaveMemoryRound() {
        guard mode == .memory else { return }
        captureMemorySession(for: dictionaryID, paused: true)
        clearMemoryWorkbench()
        persist()
    }
    func resumeMemoryRound() {
        guard mode == .memory else { return }
        restoreMemorySession(resumePaused: true)
        persist()
    }
    private func captureMemorySession(for id: String, paused: Bool = false) {
        guard memorySessionActive else { return }
        memorySessions.sessions[id] = MemorySession(deckIDs: filteredWords.map(\.id), currentWordID: currentWord?.id,
            currentIndex: currentIndex, answeredIDs: memoryAnsweredIDs.sorted(), answeredCount: memoryAnsweredCount,
            masteredCount: memoryMasteredCount, revealed: revealed, completed: completed, paused: paused, feedback: memoryFeedback)
    }
    private func clearMemoryWorkbench() {
        let wasRestoring = restoring; restoring = true
        memorySessionActive = false; filteredWords = []; currentIndex = 0
        revealed = false; completed = false; memoryFeedback = nil
        memoryAnsweredIDs = []; memoryAnsweredCount = 0; memoryMasteredCount = 0
        restoring = wasRestoring
    }
    private func restoreMemorySession(resumePaused: Bool = false) {
        clearMemoryWorkbench()
        guard let session = memorySessions.sessions[dictionaryID], !session.paused || resumePaused else { return }
        let wasRestoring = restoring; restoring = true
        let byID = Dictionary(uniqueKeysWithValues: currentDictionary.words.map { ($0.id, $0) })
        memoryAnsweredIDs = Set(session.answeredIDs)
        let now = MemoryRecord.milliseconds(Date())
        filteredWords = session.deckIDs.compactMap { byID[$0] }.filter { keepCapturedMemoryWord($0, at: now) }
        let pending = Set(filteredWords.filter { !memoryAnsweredIDs.contains($0.id) }.map(\.id))
        let selectedID = session.currentWordID.flatMap { pending.contains($0) ? $0 : nil }
            ?? session.deckIDs.enumerated().first(where: { $0.offset >= session.currentIndex && pending.contains($0.element) })?.element
            ?? filteredWords.first(where: { pending.contains($0.id) })?.id
        currentIndex = filteredWords.firstIndex(where: { $0.id == selectedID })
            ?? min(session.currentIndex, max(0, filteredWords.count - 1))
        memoryAnsweredCount = session.answeredCount; memoryMasteredCount = session.masteredCount
        completed = session.completed || pending.isEmpty
        revealed = !completed && currentWord?.id == session.currentWordID && session.revealed
        memoryFeedback = session.feedback == "5 分鐘後再複習" ? "已重新開始，請依下次複習時間回來" : session.feedback
        memorySessionActive = true
        restoring = wasRestoring
    }

    /// A captured round only loses members; newly due/restored words wait for the next round.
    private func refreshMemoryVisibility() {
        guard mode == .memory, memorySessionActive else { return }
        let selectedID = currentWord?.id
        let oldIndex = currentIndex
        let now = MemoryRecord.milliseconds(Date())
        filteredWords.removeAll { !keepCapturedMemoryWord($0, at: now) }
        currentIndex = filteredWords.firstIndex(where: { $0.id == selectedID }) ?? min(oldIndex, max(0, filteredWords.count - 1))
        if currentWord?.id != selectedID { revealed = false }
        if filteredWords.isEmpty || filteredWords.allSatisfy({ memoryAnsweredIDs.contains($0.id) }) { completed = true; revealed = false }
    }

    @discardableResult func answerMemory(wordID: String, remembered: Bool, at date: Date = Date()) -> Bool {
        let now = MemoryRecord.milliseconds(date)
        guard mode == .memory, memorySessionActive, !completed,
              let word = currentWord, word.id == wordID, !isDeleted(wordID), rating(word) == 2,
              !remembered || word.meanings[meaningLanguage].map({ !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }) == true,
              !memoryAnsweredIDs.contains(wordID),
              memoryIsDue(word, at: now) else { return false }
        let record: MemoryRecord
        do {
            record = try (memoryRecord(for: word) ?? MemoryRecord(stage: 0, dueAt: 0, updatedAt: 0))
                .answering(remembered: remembered, at: now)
        } catch { storageError = error.localizedDescription; return false }
        if record.stage == MemoryRecord.masteryStage {
            do {
                var metadata = try preparedSyncMetadata()
                try metadata.edit(dictionaryID: dictionaryID, wordID: wordID, level: 3)
                syncMetadata = metadata
            } catch { storageError = error.localizedDescription; return false }
            progress[dictionaryID, default: [:]][wordID] = 3
            memoryMasteredCount += 1
        }
        memory[dictionaryID, default: [:]][wordID] = record
        memoryAnsweredIDs.insert(wordID); memoryAnsweredCount += 1
        memoryFeedback = record.stage == MemoryRecord.masteryStage ? "已轉為已掌握" : remembered ? "已安排下一次複習" : "已重新開始，1 天後再複習"
        revealed = false
        if currentIndex < filteredWords.count - 1 { currentIndex += 1 } else { completed = true }
        persist()
        syncInstance?.localDidChange()
        return true
    }

    private func cleanedProgress(_ input: [String: [String: Int]], dictionaries: [StudyDictionary]) -> [String: [String: Int]] {
        var output: [String: [String: Int]] = [:]
        for dictionary in dictionaries {
            let known = Set(dictionary.words.map(\.id))
            output[dictionary.id] = input[dictionary.id, default: [:]].filter { known.contains($0.key) && (0...3).contains($0.value) }
        }
        return output
    }
    private func addingExtensions(_ words: [StudyWord], to dictionary: StudyDictionary) -> StudyDictionary {
        let combined = dictionary.words + words
        let used = Set(combined.map(\.subcategory))
        var categories = dictionary.categories
        let categorySourceID = dictionary.isGrammar ? dictionary.id : "fr"
        for sourceCategory in bundledDictionaries.first(where: { $0.id == categorySourceID })?.categories ?? [] {
            let needed = sourceCategory.subcategories.filter { used.contains($0.id) }
            guard !needed.isEmpty else { continue }
            if let index = categories.firstIndex(where: { $0.id == sourceCategory.id }) {
                let existing = Set(categories[index].subcategories.map(\.id))
                categories[index] = StudyCategory(id: sourceCategory.id, name: sourceCategory.name,
                    subcategories: categories[index].subcategories + needed.filter { !existing.contains($0.id) })
            } else { categories.append(StudyCategory(id: sourceCategory.id, name: sourceCategory.name, subcategories: needed)) }
        }
        return StudyDictionary(id: dictionary.id, title: dictionary.title, language: dictionary.language, categories: categories, words: combined, kind: dictionary.kind, grammarMode: dictionary.grammarMode)
    }
    private var extensions: [String: [StudyWord]] {
        var result: [String: [StudyWord]] = [:]
        for dictionary in dictionaries where dictionary.isBuiltIn {
            let bundledIDs = Set(bundledDictionaries.first(where: { $0.id == dictionary.id })?.words.map(\.id) ?? [])
            result[dictionary.id] = dictionary.words.filter { !bundledIDs.contains($0.id) }
        }
        return result
    }
    @discardableResult private func persist() -> Bool {
        guard !restoring, !persistenceBlocked else { return false }
        if mode == .memory { captureMemorySession(for: dictionaryID) }
        guard let persistenceURL else { return true }
        do {
            let state = SavedState(dictionaries: dictionaries.filter { !$0.isBuiltIn }, extensions: extensions,
                progress: progress, dictionaryID: dictionaryID, mode: mode, search: search,
                categoryID: categoryID, subcategoryID: subcategoryID, listMode: listMode,
                hideMastered: hideMastered, hideImpression: hideImpression, hideListMeanings: hideListMeanings, showExampleTranslations: showExampleTranslations,
                appearance: appearance.rawValue,
                meaningLanguage: meaningLanguage, speechRate: speechRate,
                autoAdvance: autoAdvance, pageSize: pageSize, randomOrder: randomOrder, currentIndex: currentIndex, completed: completed,
                deckIDs: filteredWords.map(\.id), reviewRatedIDs: Array(reviewRatedIDs), syncMetadata: syncMetadata, deletionMetadata: deletionMetadata,
                memory: memory, memoryChapters: memoryChapters, memorySessions: memorySessions)
            let data = try JSONEncoder().encode(state)
            try FileManager.default.createDirectory(at: persistenceURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            try data.write(to: persistenceURL, options: .atomic)
            storageError = recoveryNotice
            return true
        } catch { storageError = "進度尚未儲存：\(error.localizedDescription) 請匯出備份。"; return false }
    }

    @discardableResult func deleteWord(_ word: StudyWord) -> Bool {
        guard currentDictionary.words.contains(where: { $0.id == word.id }), !isDeleted(word.id) else { return false }
        return changeDeletion(word.id, dictionaryID: dictionaryID, deleted: true)
    }

    @discardableResult func restoreWord(_ wordID: String, dictionaryID: String? = nil) -> Bool {
        let id = dictionaryID ?? self.dictionaryID
        guard isDeleted(wordID, dictionaryID: id) else { return false }
        return changeDeletion(wordID, dictionaryID: id, deleted: false)
    }

    private func changeDeletion(_ wordID: String, dictionaryID: String, deleted: Bool) -> Bool {
        do {
            var candidate = deletionMetadata ?? WordDeletionMetadata()
            try candidate.edit(dictionaryID: dictionaryID, wordID: wordID, deleted: deleted)
            restoring = true
            setDeletionMetadata(candidate)
            refreshDeletionVisibility()
            restoring = false
            persist()
            syncInstance?.localDidChange()
            return true
        } catch { storageError = error.localizedDescription; return false }
    }

    private func setDeletionMetadata(_ metadata: WordDeletionMetadata?) {
        deletionMetadata = metadata
        deletionFlags = Dictionary(uniqueKeysWithValues: (metadata?.records ?? []).map { ($0.key, $0.deleted) })
        if let key = revealedListMeaning, isDeleted(key.wordID, dictionaryID: key.dictionaryID) {
            revealedListMeaning = nil
        }
    }

    /// Removing visibility never rates, reveals, shuffles or advances a surviving word.
    private func refreshDeletionVisibility() {
        if mode == .memory { refreshMemoryVisibility(); return }
        let selectedID = currentWord?.id
        let previousIndex = currentIndex
        let previousReveal = revealed
        if mode == .review {
            filteredWords.removeAll { isDeleted($0.id) }
            reviewRatedIDs.formIntersection(Set(filteredWords.map(\.id)))
        } else {
            var matching = matchingWords()
            if mode == .lookup {
                matching.sort { $0.term.compare($1.term, options: [.caseInsensitive, .diacriticInsensitive], locale: Locale(identifier: currentDictionary.locale)) == .orderedAscending }
            }
            let eligible = Set(matching.map(\.id)), prior = Set(filteredWords.map(\.id))
            filteredWords = mode == .study && randomOrder
                ? filteredWords.filter { eligible.contains($0.id) } + matching.filter { !prior.contains($0.id) }
                : matching
        }
        currentIndex = filteredWords.firstIndex(where: { $0.id == selectedID }) ?? min(previousIndex, max(0, filteredWords.count - 1))
        revealed = currentWord?.id == selectedID ? previousReveal : false
        if filteredWords.isEmpty { completed = false }
    }

    func deletionSnapshot() throws -> [WordDeletionRecord] {
        if deletionMetadata == nil { setDeletionMetadata(WordDeletionMetadata()) }
        guard persist() else { throw ProgressSyncError.storage }
        return try WordDeletionRecord.canonical(deletionMetadata?.records ?? [])
    }

    func mergeDeletionSnapshot(_ incoming: [WordDeletionRecord]) throws {
        let validated = try WordDeletionRecord.canonical(incoming)
        var candidate = deletionMetadata ?? WordDeletionMetadata()
        try candidate.merge(validated)
        restoring = true
        setDeletionMetadata(candidate)
        refreshDeletionVisibility()
        restoring = false
        guard persist() else { throw ProgressSyncError.storage }
    }

    func memorySnapshot() throws -> [MemorySyncRecord] {
        try MemoryRecord.validate(memory)
        let result = memory.flatMap { id, words in words.map { wordID, record in
            MemorySyncRecord(dictionaryID: id, wordID: wordID, stage: record.stage, dueAt: record.dueAt, updatedAt: record.updatedAt)
        } }.sorted {
            SyncRecordIdentity.precedes(dictionaryID: $0.dictionaryID, wordID: $0.wordID,
                                        otherDictionaryID: $1.dictionaryID, otherWordID: $1.wordID)
        }
        for record in result { try record.validate() }
        guard persist() else { throw ProgressSyncError.storage }
        return result
    }

    func validatedMemorySnapshot(_ incoming: [MemorySyncRecord]) throws -> [String: [String: MemoryRecord]] {
        guard incoming.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        // Saved schedules use Swift String keys, while wire identifiers compare exact UTF-8.
        // Reject a colliding spelling before a lookup or write can affect another word.
        func exactValue<Value>(_ key: String, in values: [String: Value]) throws -> Value? {
            guard let index = values.index(forKey: key) else { return nil }
            let entry = values[index]
            guard entry.key.utf8.elementsEqual(key.utf8) else { throw ProgressSyncError.memoryIDCollision }
            return entry.value
        }
        let incomingBooks = Set(incoming.map(\.dictionaryID))
        let knownWords = Dictionary(uniqueKeysWithValues: dictionaries.filter { incomingBooks.contains($0.id) }.map {
            ($0.id, Set($0.words.map(\.id)))
        })
        var candidate = memory
        for item in incoming {
            try item.validate()
            if let ids = try exactValue(item.dictionaryID, in: knownWords), let index = ids.firstIndex(of: item.wordID),
               !ids[index].utf8.elementsEqual(item.wordID.utf8) { throw ProgressSyncError.memoryIDCollision }
            if let words = try exactValue(item.dictionaryID, in: candidate),
               let current = try exactValue(item.wordID, in: words),
               !MemorySyncRecord.wins(item.record, over: current) {
                continue
            }
            candidate[item.dictionaryID, default: [:]][item.wordID] = item.record
        }
        try MemoryRecord.validate(candidate)
        return candidate
    }

    func mergeMemorySnapshot(_ incoming: [MemorySyncRecord]) throws {
        memory = try validatedMemorySnapshot(incoming)
        restoring = true
        refreshMemoryVisibility()
        restoring = false
        guard persist() else { throw ProgressSyncError.storage }
    }

    private func preparedSyncMetadata() throws -> ProgressSyncMetadata {
        var metadata = syncMetadata ?? ProgressSyncMetadata()
        try metadata.seed(progress)
        return metadata
    }

    /// Persist the revision metadata and its ratings together before returning anything to the network.
    func syncSnapshot() throws -> [ProgressSyncRecord] {
        syncMetadata = try preparedSyncMetadata()
        guard persist() else { throw ProgressSyncError.storage }
        return try ProgressSyncRecord.canonical(syncMetadata?.records ?? [])
    }

    /// Remote application never calls rate(), toggles a rating, or advances a card.
    func mergeSyncSnapshot(_ incoming: [ProgressSyncRecord]) throws {
        // Validate the complete batch before modifying observable state.
        let validated = try ProgressSyncRecord.canonical(incoming)
        var metadata = try preparedSyncMetadata()
        try metadata.merge(validated)
        let selectedID = currentWord?.id
        let previousIndex = currentIndex
        let previousReveal = revealed
        restoring = true
        syncMetadata = metadata
        applySyncRecordsToKnownWords()
        refreshMemoryVisibility()
        if mode == .study && (hideMastered || hideImpression) {
            let matching = matchingWords()
            let eligible = Set(matching.map(\.id))
            let prior = Set(filteredWords.map(\.id))
            filteredWords = randomOrder
                ? filteredWords.filter { eligible.contains($0.id) } + matching.filter { !prior.contains($0.id) }
                : matching
            currentIndex = filteredWords.firstIndex(where: { $0.id == selectedID }) ?? min(previousIndex, max(0, filteredWords.count - 1))
            revealed = currentWord?.id == selectedID ? previousReveal : false
        }
        // A captured review queue, reviewRatedIDs, completion, and random order stay local.
        restoring = false
        guard persist() else { throw ProgressSyncError.storage }
    }

    private func applySyncRecordsToKnownWords() {
        let known = Set(dictionaries.flatMap { dictionary in dictionary.words.map { word in
            ProgressSyncRecord(dictionaryID: dictionary.id, wordID: word.id, level: 0, clock: 0, deviceID: "").key
        } })
        for record in syncMetadata?.records ?? [] where known.contains(record.key) {
            progress[record.dictionaryID, default: [:]][record.wordID] = record.level
        }
    }

    func importDictionary(_ data: Data, title: String? = nil, language: String? = nil) throws -> String {
        guard dictionaries.filter({ !$0.isBuiltIn }).count < 20 else { throw StudyDataError("最多可匯入 20 部辭典。") }
        guard data.count <= 2 * 1024 * 1024 else { throw StudyDataError("辭典 JSON 最多 2 MB。") }
        let parsed = try JSONSerialization.jsonObject(with: data)
        let source: [String: Any]
        if let object = parsed as? [String: Any] { source = object }
        else if let words = parsed as? [[String: Any]] { source = ["words": words] }
        else { throw StudyDataError("辭典須為 JSON 物件或單字陣列。") }
        let id = "dict-\(UUID().uuidString.lowercased())"
        let dictionary = try StudyImport.dictionary(source, id: id, fallbackLanguage: language ?? currentDictionary.language,
            fallbackTitle: title, fallbackKind: currentDictionary.kind, fallbackGrammarMode: currentDictionary.grammarMode)
        dictionaries.append(dictionary); progress[id] = [:]; dictionaryID = id
        return id
    }

    private static func wordJSON(_ word: StudyWord) -> [String: Any] {
        var result: [String: Any] = ["id": word.id, "term": word.term, "meanings": word.meanings, "example": word.example,
         "category": word.category, "subcategory": word.subcategory]
        if let part = word.part { result["part"] = part }
        if !word.examples.isEmpty {
            result["examples"] = word.examples.map { ["text": $0.text, "translations": $0.translations] as [String: Any] }
        }
        if !word.pattern.isEmpty { result["pattern"] = word.pattern }
        if !word.explanation.isEmpty { result["explanation"] = word.explanation }
        return result
    }
    private static func dictionaryJSON(_ dictionary: StudyDictionary) -> [String: Any] {
        ["id": dictionary.id, "title": dictionary.title, "language": dictionary.language, "kind": dictionary.kind.rawValue, "grammarMode": dictionary.grammarMode.rawValue,
         "categories": dictionary.categories.map { category in
             ["id": category.id, "name": category.name, "subcategories": category.subcategories.map { ["id": $0.id, "name": $0.name] }] as [String: Any]
         }, "words": dictionary.words.map(wordJSON)]
    }
    func exportBackup() throws -> Data {
        let customJSON = dictionaries.filter { !$0.isBuiltIn }.map(Self.dictionaryJSON)
        let extensionsJSON = extensions.mapValues { $0.map(Self.wordJSON) }
        let hiddenLevels: [Int] = (hideImpression ? [2] : []) + (hideMastered ? [3] : [])
        let visibility = Dictionary(uniqueKeysWithValues: dictionaries.map { ($0.id, hiddenLevels) })
        let data: [String: Any] = ["app": "mots", "version": 3, "exportedAt": ISO8601DateFormatter().string(from: Date()),
            "ratings": progress["fr", default: [:]], "progress": progress, "dictionaries": customJSON, "customBanks": extensionsJSON,
            "deletions": try JSONSerialization.jsonObject(with: JSONEncoder().encode(deletionMetadata?.records ?? [])),
            "memory": try JSONSerialization.jsonObject(with: JSONEncoder().encode(memory)),
            "settings": ["dictionaryId": dictionaryID, "meaningLanguage": meaningLanguage, "view": listMode ? "list" : "card",
                         "defaultHideMastered": hideMastered, "hideImpression": hideImpression,
                         "visibility": visibility,
                         "hideListMeanings": hideListMeanings, "showExampleTranslations": showExampleTranslations,
                         "appearance": appearance.rawValue,
                         "pageSize": pageSize, "speechRate": speechRate, "autoAdvance": autoAdvance, "order": randomOrder ? "random" : "ordered"]]
        return try JSONSerialization.data(withJSONObject: data, options: [.prettyPrinted, .sortedKeys])
    }

    @discardableResult func importBackup(_ data: Data) throws -> Int {
        let source = try StudyImport.object(data, limit: 50 * 1024 * 1024)
        guard source["app"] as? String == "mots", let versionNumber = source["version"] as? NSNumber,
              CFGetTypeID(versionNumber) != CFBooleanGetTypeID(), let version = versionNumber as? Int,
              (1...3).contains(version) else { throw StudyDataError("請選擇 Mots 版本 1、2 或 3 的備份。") }
        var candidate = dictionaries
        if version == 3, let supplied = source["dictionaries"] {
            guard let library = supplied as? [[String: Any]], library.count <= 20 else { throw StudyDataError("備份辭典格式不正確。") }
            var seen = Set<String>()
            for raw in library {
                guard let id = raw["id"] as? String, seen.insert(id).inserted else { throw StudyDataError("備份辭典缺少 ID 或 ID 重複。") }
                let dictionary = try StudyImport.dictionary(raw, id: id)
                if let index = candidate.firstIndex(where: { $0.id == id }) {
                    guard candidate[index].kind == dictionary.kind, candidate[index].grammarMode == dictionary.grammarMode else {
                        throw StudyDataError("備份中的書籍類型與現有書籍不同；請將內容作為新書籍匯入。")
                    }
                    candidate[index] = dictionary
                }
                else { candidate.append(dictionary) }
            }
            guard candidate.filter({ !$0.isBuiltIn }).count <= 20 else { throw StudyDataError("合併後超過 20 部自訂辭典。") }
        }
        if version >= 2, let supplied = source["customBanks"] {
            guard let banks = supplied as? [String: Any] else { throw StudyDataError("備份擴充詞庫格式不正確。") }
            for builtin in bundledDictionaries where builtin.isBuiltIn {
                let bookID = builtin.id
                guard let value = banks[bookID] else { continue }
                guard let words = value as? [[String: Any]], words.count <= 5000 else { throw StudyDataError("擴充詞庫最多 5,000 詞。") }
                guard !words.isEmpty, let index = candidate.firstIndex(where: { $0.id == bookID }) else { continue }
                let categorySource = builtin.isGrammar ? builtin : bundledDictionaries.first(where: { $0.id == "fr" }) ?? builtin
                let categoriesJSON = try JSONSerialization.jsonObject(with: JSONEncoder().encode(categorySource.categories))
                let parsed = try StudyImport.dictionary(["language": builtin.language, "kind": builtin.kind.rawValue,
                    "title": "擴充內容", "words": words, "categories": categoriesJSON], id: "dict-extension")
                let builtinIDs = Set(builtin.words.map(\.id))
                var existing = Dictionary(uniqueKeysWithValues: candidate[index].words.filter { !builtinIDs.contains($0.id) }.map { ($0.id, $0) })
                for word in parsed.words {
                    guard word.id.hasPrefix("custom-\(bookID)-"), !builtinIDs.contains(word.id) else { throw StudyDataError("擴充項目 ID 不符合原始書籍，無法安全合併。") }
                    existing[word.id] = word
                }
                guard existing.count <= 5000 else { throw StudyDataError("合併後擴充詞庫超過 5,000 詞。") }
                candidate[index].words = candidate[index].words.filter { builtinIDs.contains($0.id) }
                candidate[index] = addingExtensions(existing.values.sorted { $0.id < $1.id }, to: candidate[index])
            }
        }
        let incoming: [String: Any]
        if version == 1 {
            guard let ratings = source["ratings"] as? [String: Any] else { throw StudyDataError("備份進度格式不正確。") }
            incoming = ["fr": ratings]
        } else {
            guard let values = source["progress"] as? [String: Any] else { throw StudyDataError("備份進度格式不正確。") }
            incoming = values
        }
        var merged = progress, count = 0
        var metadata = try preparedSyncMetadata()
        for dictionary in candidate {
            guard let value = incoming[dictionary.id] else { continue }
            guard let values = value as? [String: Any] else { throw StudyDataError("備份進度格式不正確。") }
            let known = Set(dictionary.words.map(\.id))
            for (id, value) in values where known.contains(id) {
                guard let number = value as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID(), number.doubleValue == Double(number.intValue), (0...3).contains(number.intValue) else { continue }
                if merged[dictionary.id]?[id] != number.intValue {
                    try metadata.edit(dictionaryID: dictionary.id, wordID: id, level: number.intValue)
                }
                merged[dictionary.id, default: [:]][id] = number.intValue; count += 1
            }
        }
        var deletionCandidate = deletionMetadata
        var memoryCandidate = memory
        if let rawMemory = source["memory"] {
            guard let rawMemory = rawMemory as? [String: Any] else { throw StudyDataError("卡片記憶進度格式不正確。") }
            let decoded = try JSONDecoder().decode([String: [String: MemoryRecord]].self,
                from: JSONSerialization.data(withJSONObject: rawMemory))
            try MemoryRecord.validate(decoded)
            for (dictionaryID, words) in decoded {
                for (wordID, record) in words {
                    let replace = memoryCandidate[dictionaryID]?[wordID].map { MemorySyncRecord.wins(record, over: $0) } ?? true
                    if replace { memoryCandidate[dictionaryID, default: [:]][wordID] = record }
                }
            }
            try MemoryRecord.validate(memoryCandidate)
        }
        if let rawDeletions = source["deletions"] {
            let incomingDeletions = try WordDeletionRecord.decodeRecords(rawDeletions)
            var candidate = deletionCandidate ?? WordDeletionMetadata()
            try candidate.importAsLocalEdits(incomingDeletions)
            deletionCandidate = candidate
        }
        // Every content/progress/deletion validation above succeeds before committing any observable state.
        restoring = true
        dictionaries = candidate; progress = cleanedProgress(merged, dictionaries: candidate)
        syncMetadata = metadata
        memory = memoryCandidate
        setDeletionMetadata(deletionCandidate)
        applySyncRecordsToKnownWords()
        if version >= 2, let settings = source["settings"] as? [String: Any] {
            if let id = settings["dictionaryId"] as? String, candidate.contains(where: { $0.id == id }) { dictionaryID = id }
            if let language = settings["meaningLanguage"] as? String, StudyImport.meaningLanguages.contains(language) { meaningLanguage = language }
            if let view = settings["view"] as? String { listMode = view == "list" }
            if let order = settings["order"] as? String { randomOrder = order == "random" }
            if let hidden = settings["defaultHideMastered"] as? Bool { hideMastered = hidden }
            if let hidden = settings["hideImpression"] as? Bool { hideImpression = hidden }
            else if let visibility = settings["visibility"] as? [String: [Int]], let hidden = visibility[dictionaryID] {
                hideImpression = hidden.contains(2)
            }
            if let hidden = settings["hideListMeanings"] as? Bool { hideListMeanings = hidden }
            if let shown = settings["showExampleTranslations"] as? Bool { showExampleTranslations = shown }
            if let value = settings["appearance"] as? String, let imported = StudyAppearance(rawValue: value) { appearance = imported }
            if let size = settings["pageSize"] as? Int, [10,20,50,100].contains(size) { pageSize = size }
            if let rate = settings["speechRate"] as? Double { speechRate = min(0.6, max(0.25, rate)) }
            if let advance = settings["autoAdvance"] as? Bool { autoAdvance = advance }

        }
        search = ""; categoryID = nil; subcategoryID = nil
        if mode == .review || (mode == .memory && currentDictionary.isGrammar) { mode = .study }
        restoring = false
        rebuildDeck(); persist()
        syncInstance?.localDidChange()
        return count
    }

    /// Export scope is independent from the current search, review queue, and study filters.
    func exportCSV(categoryID: String? = nil, subcategoryID: String? = nil) throws -> Data {
        let words = availableWords.filter { rating($0) < 3 && (categoryID == nil || $0.category == categoryID) && (subcategoryID == nil || $0.subcategory == subcategoryID) }
        let entryName = currentDictionary.isGrammar ? "語法" : "單字"
        guard !words.isEmpty else { throw StudyDataError("所選範圍沒有尚未掌握的\(entryName)。") }
        func field(_ value: String) -> String {
            let leading = value.drop(while: { $0.isWhitespace })
            let protected = leading.first.map { "=+-@".contains($0) } == true || value.first == "\t" || value.first == "\r" ? "'" + value : value
            return "\"" + protected.replacingOccurrences(of: "\"", with: "\"\"") + "\""
        }
        var rows = [[entryName, "釋義", "例句", "熟悉程度", "一級單元", "二級單元", "語言", "書籍", "條目 ID"]]
        let labels = ["未學習", "不熟悉", "有印象", "已掌握"]
        rows += words.map { word in [word.term, displayMeaning(for: word), word.exampleTexts.joined(separator: "\n"), labels[rating(word)], categoryName(for: word), subcategoryName(for: word), word.language, currentDictionary.displayTitle, word.id] }
        let csv = "\u{FEFF}" + rows.map { $0.map(field).joined(separator: ",") }.joined(separator: "\r\n") + "\r\n"
        return Data(csv.utf8)
    }
}

private struct SavedState: Codable {
    let dictionaries: [StudyDictionary]
    let extensions: [String: [StudyWord]]
    let progress: [String: [String: Int]]
    let dictionaryID: String
    let mode: StudyMode
    let search: String
    let categoryID: String?
    let subcategoryID: String?
    let listMode: Bool
    let hideMastered: Bool
    let hideImpression: Bool?
    let hideListMeanings: Bool?
    let showExampleTranslations: Bool?
    let appearance: String?
    let meaningLanguage: String
    let speechRate: Double
    let autoAdvance: Bool
    let pageSize: Int
    let randomOrder: Bool?
    let currentIndex: Int
    let completed: Bool
    let deckIDs: [String]
    let reviewRatedIDs: [String]
    let syncMetadata: ProgressSyncMetadata?
    let deletionMetadata: WordDeletionMetadata?
    let memory: [String: [String: MemoryRecord]]?
    let memoryChapters: [String: [String]]?
    let memorySessions: MemorySessionLibrary?
}
