import SwiftUI

struct VocabularyList<Header: View, EmptyContent: View>: View {
    let store: StudyStore
    @ViewBuilder let header: () -> Header
    @ViewBuilder let emptyContent: () -> EmptyContent
    @State private var page = 0
    @State private var pendingUndo: DeletedWordUndo?
    @State private var detailWord: StudyWord?

    private struct DeletedWordUndo: Identifiable {
        let id = UUID()
        let dictionaryID: String
        let wordID: String
        let term: String
    }

    private var pageSize: Int { max(store.pageSize, 1) }
    private var pageCount: Int { max(1, (store.filteredWords.count + pageSize - 1) / pageSize) }
    private var effectivePage: Int { min(page, pageCount - 1) }
    private var start: Int { effectivePage * pageSize }
    private var pageWords: [StudyWord] { Array(store.filteredWords.dropFirst(start).prefix(pageSize)) }

    private struct GrammarListGroup: Identifiable {
        let id: String
        let words: [StudyWord]
    }

    private var pageGroups: [GrammarListGroup] {
        var order: [String] = []
        var grouped: [String: [StudyWord]] = [:]
        for word in pageWords {
            let id = store.dictionaryID + ":" + word.category + ":" + word.subcategory
            if grouped[id] == nil { order.append(id) }
            grouped[id, default: []].append(word)
        }
        return order.map { GrammarListGroup(id: $0, words: grouped[$0, default: []]) }
    }

    private var studyList: some View {
        List {
            Section {
                header()
            }
            .listRowBackground(Color.clear)
            .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
            .listRowSeparator(.hidden)
            if store.filteredWords.isEmpty {
                Section { emptyContent() }
                    .listRowBackground(Color.clear)
            } else {
                if store.currentDictionary.isThematicGrammar {
                    ForEach(pageGroups) { group in
                        Section {
                            DisclosureGroup(isExpanded: expansion(for: group.id)) {
                                ForEach(group.words) { word in
                                    entryRow(word, grouped: true)
                                }
                            } label: {
                                grammarGroupLabel(group)
                            }
                            .tint(MotsTheme.accent)
                            .listRowBackground(MotsTheme.secondarySurface)
                            .accessibilityIdentifier("list.grammar-group.\(group.id)")
                        } header: {
                            if group.id == pageGroups.first?.id { listHeading }
                        }
                    }
                } else {
                    Section {
                        ForEach(pageWords) { word in entryRow(word) }
                    } header: {
                        listHeading
                    }
                }
                Section {
                    pagination
                }
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
                .listRowSeparator(.hidden)
            }
        }
        .listStyle(.insetGrouped)
        .listSectionSpacing(16)
        .contentMargins(.top, 12, for: .scrollContent)
        .scrollContentBackground(.hidden)
        .scrollDismissesKeyboard(.interactively)
        .background(MotsTheme.background)
        .frame(maxWidth: MotsTheme.contentWidth)
        .frame(maxWidth: .infinity)
    }

    private var studyListWithFeedback: some View {
        studyList
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if let undo = pendingUndo, store.isDeleted(undo.wordID, dictionaryID: undo.dictionaryID) {
                HStack(spacing: 12) {
                    Text("已刪除「\(undo.term)」")
                        .font(.subheadline)
                        .fixedSize(horizontal: false, vertical: true)
                    Spacer(minLength: 0)
                    Button("撤銷") {
                        if store.restoreWord(undo.wordID, dictionaryID: undo.dictionaryID) { pendingUndo = nil }
                    }
                    .frame(minHeight: 44)
                    .accessibilityIdentifier("list.undo-delete")
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 6)
                .background(MotsTheme.surface)
                .accessibilityElement(children: .contain)
            }
        }
        .task(id: pendingUndo?.id) {
            guard pendingUndo != nil else { return }
            try? await Task.sleep(nanoseconds: 8_000_000_000)
            if !Task.isCancelled { pendingUndo = nil }
        }
    }

    private var studyListWithScopeTracking: some View {
        studyListWithFeedback
        .onAppear { page = store.currentIndex / pageSize }
        .onChange(of: store.search) { page = 0 }
        .onChange(of: store.dictionaryID) { page = 0; pendingUndo = nil; detailWord = nil }
        .onChange(of: store.categoryID) { page = 0 }
        .onChange(of: store.subcategoryID) { page = 0 }
        .onChange(of: store.mode) { page = 0 }
    }

    var body: some View {
        studyListWithScopeTracking
        .onChange(of: store.hideMastered) { page = 0 }
        .onChange(of: store.randomOrder) { page = 0 }
        .onChange(of: store.currentIndex) { _, newIndex in page = newIndex / pageSize }
        .onChange(of: store.filteredWords.map(\.id)) { page = min(page, pageCount - 1) }
        .onChange(of: store.pageSize) { _, newValue in
            page = store.currentIndex / max(newValue, 1)
        }
        .sheet(item: $detailWord) { word in
            EntryDetailView(store: store, word: word)
        }
    }

    private func expansion(for id: String) -> Binding<Bool> {
        Binding(get: { !store.search.isEmpty || store.expandedGrammarGroupIDs.contains(id) }, set: { expanded in
            guard store.search.isEmpty else { return }
            if expanded { store.expandedGrammarGroupIDs.insert(id) }
            else { store.expandedGrammarGroupIDs.remove(id) }
        })
    }

    private var listHeading: some View {
        HStack {
            Text(store.search.isEmpty ? "\(store.filteredWords.count) \(store.currentDictionary.entryUnit)" : "找到 \(store.filteredWords.count) \(store.currentDictionary.entryUnit)")
                .font(.headline)
                .foregroundStyle(MotsTheme.ink)
            Spacer()
            Text("\(effectivePage + 1) / \(pageCount)")
                .font(.footnote.monospacedDigit())
                .foregroundStyle(MotsTheme.muted)
        }
        .textCase(nil)
        .padding(.bottom, 6)
    }

    @ViewBuilder private func grammarGroupLabel(_ group: GrammarListGroup) -> some View {
        if let word = group.words.first {
            let total = store.filteredWords.filter { $0.category == word.category && $0.subcategory == word.subcategory }.count
            VStack(alignment: .leading, spacing: 5) {
                Text(store.categoryName(for: word))
                    .font(.caption)
                    .foregroundStyle(MotsTheme.muted)
                Text(store.subcategoryName(for: word))
                    .font(.headline)
                    .foregroundStyle(MotsTheme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Text(total == group.words.count ? "\(group.words.count) 項語法" : "本頁 \(group.words.count) 項，共 \(total) 項語法")
                    .font(.footnote)
                    .foregroundStyle(MotsTheme.muted)
            }
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
            .padding(.vertical, 6)
        }
    }

    private func entryRow(_ word: StudyWord, grouped: Bool = false) -> some View {
        Group {
            if store.currentDictionary.isGrammar {
                GrammarRow(store: store, word: word) {
                    SpeechPlayer.shared.stop()
                    detailWord = word
                }
            } else {
                VocabularyRow(store: store, word: word)
            }
        }
        .background(MotsTheme.surface, in: RoundedRectangle(cornerRadius: grouped ? 14 : 0))
        .padding(.horizontal, grouped ? 10 : 0)
        .padding(.bottom, grouped ? 8 : 0)
        .listRowInsets(EdgeInsets(top: 0, leading: 0, bottom: 0, trailing: 0))
        .listRowBackground(grouped ? MotsTheme.secondarySurface : MotsTheme.surface)
        .listRowSeparator(grouped ? .hidden : .automatic)
        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
            Button(role: .destructive) { delete(word) } label: {
                Label("刪除", systemImage: "trash")
            }
            .tint(.red)
            .accessibilityIdentifier("list.delete.\(word.id)")
        }
        .accessibilityAction(named: Text("刪除 \(word.term)")) { delete(word) }
    }

    private func delete(_ word: StudyWord) {
        let dictionaryID = store.dictionaryID
        if SpeechPlayer.shared.activeWordID == word.id { SpeechPlayer.shared.stop() }
        guard store.deleteWord(word) else { return }
        pendingUndo = DeletedWordUndo(dictionaryID: dictionaryID, wordID: word.id, term: word.term)
        page = min(page, pageCount - 1)
        UIAccessibility.post(notification: .announcement, argument: "已刪除 \(word.term)，可撤銷")
    }

    private func selectPage(_ newPage: Int) {
        page = newPage
        let index = min(newPage * pageSize, store.filteredWords.count - 1)
        if store.filteredWords.indices.contains(index) {
            store.selectWord(store.filteredWords[index])
        }
    }

    private var pagination: some View {
        HStack(spacing: 12) {
            Button { selectPage(max(0, effectivePage - 1)) } label: {
                Image(systemName: "chevron.left")
            }
            .motsGlassIconControl()
            .disabled(effectivePage == 0)
            .accessibilityLabel("上一頁")
            .accessibilityIdentifier("list.previous")
            Text("\(start + 1)–\(min(start + pageSize, store.filteredWords.count))")
                .font(.footnote.monospacedDigit())
                .foregroundStyle(MotsTheme.muted)
                .frame(maxWidth: .infinity)
                .accessibilityLabel("顯示第 \(start + 1) 至 \(min(start + pageSize, store.filteredWords.count)) \(store.currentDictionary.entryUnit)")
                .accessibilityIdentifier("list.range")
            Button { selectPage(min(pageCount - 1, effectivePage + 1)) } label: {
                Image(systemName: "chevron.right")
            }
            .motsGlassIconControl()
            .disabled(effectivePage == pageCount - 1)
            .accessibilityLabel("下一頁")
            .accessibilityIdentifier("list.next")
        }
        .padding(.vertical, 4)
    }
}

private struct VocabularyRow: View {
    let store: StudyStore
    let word: StudyWord

    private var isPlaying: Bool { SpeechPlayer.shared.activeWordID == word.id }

    var body: some View {
        HStack(alignment: .center, spacing: 8) {
            Button { SpeechPlayer.shared.speak(word: word) } label: {
                VStack(alignment: .leading, spacing: 4) {
                    Text(word.term)
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(isPlaying ? MotsTheme.accent : MotsTheme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(store.displayMeaning(for: word))
                        .font(.subheadline)
                        .foregroundStyle(MotsTheme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                .padding(.leading, 14)
                .padding(.vertical, 10)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isPlaying ? "停止朗讀 \(word.term)" : "朗讀 \(word.term)")
            .accessibilityValue(isPlaying ? "播放中" : store.displayMeaning(for: word))
            .accessibilityIdentifier("list.speak.\(word.id)")

            RatingControls(store: store, word: word)
                .padding(.trailing, 14)
        }
    }
}

/// Grammar adds an example band while the accepted vocabulary row stays unchanged.
private struct GrammarRow: View {
    let store: StudyStore
    let word: StudyWord
    let openDetail: () -> Void
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    private var isPlaying: Bool { SpeechPlayer.shared.activeWordID == word.id }
    private var primaryLayout: AnyLayout {
        dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 4))
            : AnyLayout(HStackLayout(alignment: .top, spacing: 12))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Button { SpeechPlayer.shared.speak(word: word) } label: {
                primaryLayout {
                    Text(word.term)
                        .font(.system(.headline, design: .rounded))
                        .foregroundStyle(isPlaying ? MotsTheme.accent : MotsTheme.ink)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    Text(store.displayMeaning(for: word))
                        .font(.subheadline)
                        .foregroundStyle(MotsTheme.muted)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .accessibilityLabel(isPlaying ? "停止朗讀 \(word.term)" : "朗讀 \(word.term)")
            .accessibilityValue(isPlaying ? "播放中" : store.displayMeaning(for: word))
            .accessibilityIdentifier("list.speak.\(word.id)")

            if dynamicTypeSize.isAccessibilitySize {
                VStack(alignment: .leading, spacing: 4) {
                    example
                    HStack(spacing: 8) {
                        detailButton
                        Spacer(minLength: 0)
                        RatingControls(store: store, word: word)
                    }
                }
            } else {
                HStack(alignment: .top, spacing: 8) {
                    Button(action: openDetail) {
                        VStack(alignment: .leading, spacing: 2) {
                            example
                            Text("詳情 →")
                                .font(.caption.weight(.medium))
                                .foregroundStyle(MotsTheme.accent)
                        }
                        .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
                        .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("查看 \(word.term) 的詳情")
                    .accessibilityValue(word.exampleTexts.first ?? "尚未收錄例句")
                    .accessibilityIdentifier("list.detail.\(word.id)")
                    RatingControls(store: store, word: word)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .accessibilityElement(children: .contain)
        .accessibilityIdentifier("list.grammar.\(word.id)")
    }

    private var example: some View {
        Text(word.exampleTexts.first ?? "尚未收錄例句")
            .font(.subheadline)
            .foregroundStyle(MotsTheme.muted)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.top, 4)
            .accessibilityIdentifier("list.example.\(word.id)")
    }

    private var detailButton: some View {
        Button(action: openDetail) {
            Text("詳情")
                .font(.subheadline.weight(.medium))
                .frame(minWidth: 44, minHeight: 44)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .foregroundStyle(MotsTheme.accent)
        .accessibilityLabel("查看 \(word.term) 的詳情")
        .accessibilityIdentifier("list.detail.\(word.id)")
    }
}
