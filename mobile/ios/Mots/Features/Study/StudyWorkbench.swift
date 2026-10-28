import SwiftUI

struct StudyWorkbench: View {
    @Bindable var store: StudyStore
    let openSettings: () -> Void
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var showsList: Bool { !store.showsCards }
    private var isGrammar: Bool { store.currentDictionary.isGrammar }
    private var entryName: String { isGrammar ? "語法" : "單字" }
    private var overviewTitle: String { isGrammar ? "語法總覽" : "查詞典" }

    var body: some View {
        Group {
            if store.showsCards && !store.filteredWords.isEmpty && !store.completed {
                VStack(spacing: 0) {
                    CardProgress(store: store)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 18)
                    StudyCardPager(store: store)
                        .id(reduceMotion)
                }
            } else {
                listContent
            }
        }
        .background(MotsTheme.background)
        .safeAreaInset(edge: .top, spacing: 0) {
            if let error = store.storageError {
                Button(action: openSettings) {
                    Label("尚未儲存：\(error)", systemImage: "exclamationmark.triangle")
                        .font(.footnote)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .foregroundStyle(MotsTheme.unfamiliar)
                        .background(MotsTheme.surface)
                }
            }
        }
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if store.showsCards && !store.filteredWords.isEmpty && !store.completed {
                CardNavigation(store: store)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(MotsTheme.background)
            }
        }
    }

    @ViewBuilder private var listContent: some View {
        if showsList {
            VocabularyList(store: store) {
                if let message = SpeechPlayer.shared.message { speechNotice(message) }
                if store.mode == .study { studyControls }
            } emptyContent: {
                emptyState
            }
        } else {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    if let message = SpeechPlayer.shared.message {
                        speechNotice(message)
                    }
                    if store.mode == .review && store.completed {
                        reviewCompletion
                    } else if store.filteredWords.isEmpty {
                        emptyState
                    }
                }
                .frame(maxWidth: MotsTheme.contentWidth, alignment: .leading)
                .padding(.horizontal, 20)
                .padding(.top, 18)
                .padding(.bottom, 28)
                .frame(maxWidth: .infinity)
            }
            .scrollDismissesKeyboard(.interactively)
            .background(MotsTheme.background)
        }
    }

    private func speechNotice(_ message: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Label(message, systemImage: "speaker.slash")
                .font(.subheadline)
                .foregroundStyle(MotsTheme.unfamiliar)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
            Button { SpeechPlayer.shared.message = nil } label: {
                Image(systemName: "xmark").frame(minWidth: 44, minHeight: 44)
            }
            .accessibilityLabel("關閉讀音提示")
        }
        .padding(14)
        .motsCardSurface()
        .accessibilityElement(children: .contain)
    }

    private var studyControls: some View {
        HStack(alignment: .center, spacing: 8) {
            Text(store.categoryID == nil ? "全部\(entryName)" : store.currentScopeTitle)
                .font(.title3.weight(.semibold))
                .foregroundStyle(MotsTheme.ink)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)
                .accessibilityAddTraits(.isHeader)
                .accessibilityIdentifier("study.scope")
            Menu {
                if !isGrammar {
                    Toggle("先隱藏翻譯", isOn: $store.hideListMeanings)
                        .accessibilityIdentifier("study.hide-translations")
                }
                Toggle("隱藏已掌握", isOn: $store.hideMastered)
                Picker(isGrammar ? "語法順序" : "詞序", selection: $store.randomOrder) {
                    Text("原書順序").tag(false)
                    Text("隨機順序").tag(true)
                }
                if store.randomOrder {
                    Button("重新洗牌", systemImage: "shuffle") { store.reshuffle() }
                }
                if store.categoryID != nil || !store.search.isEmpty || store.hideMastered {
                    Button("顯示全部\(entryName)") {
                        store.categoryID = nil
                        store.subcategoryID = nil
                        store.search = ""
                        store.hideMastered = false
                    }
                }
            } label: {
                Image(systemName: "line.3.horizontal.decrease")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(MotsTheme.accent)
                    .overlay(alignment: .topTrailing) {
                        if store.hideMastered || (!isGrammar && store.hideListMeanings) {
                            Circle()
                                .fill(MotsTheme.accent)
                                .frame(width: 6, height: 6)
                                .offset(x: 5, y: -4)
                                .accessibilityHidden(true)
                        }
                    }
                    .frame(width: MotsTheme.iconControlSize, height: MotsTheme.iconControlSize)
                    .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .menuIndicator(.hidden)
            .accessibilityLabel(filterAccessibilityLabel)
            .accessibilityIdentifier("study.filter")
        }
        .padding(.horizontal, 14)
    }

    private var filterAccessibilityLabel: String {
        var parts = ["篩選\(entryName)"]
        if store.hideMastered { parts.append("已隱藏已掌握") }
        if !isGrammar && store.hideListMeanings { parts.append("已隱藏翻譯") }
        return parts.joined(separator: "，")
    }

    private var reviewCompletion: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle")
                .font(.system(size: 52, weight: .light))
                .foregroundStyle(MotsTheme.accent)
                .accessibilityHidden(true)
            Text("這一輪完成了")
                .font(.system(.title, design: .rounded).weight(.semibold))
            Text("本輪共 \(store.reviewTotal) \(isGrammar ? "項語法" : "個單字")。")
                .font(.body)
                .foregroundStyle(MotsTheme.muted)
                .multilineTextAlignment(.center)
            Button { store.startReview() } label: {
                Label("再複習一輪", systemImage: "shuffle").frame(minHeight: 44)
            }
            .buttonStyle(.glass)
            .foregroundStyle(MotsTheme.accent)
            .tint(MotsTheme.accent)
            Button(overviewTitle) { store.mode = .lookup }.buttonStyle(.glass)
        }
        .frame(maxWidth: .infinity)
        .padding(30)
        .motsCardSurface()
        .accessibilityIdentifier("review.completed")
    }

    private var emptyState: some View {
        let allDeleted = store.availableWords.isEmpty && !store.deletedWords.isEmpty
        let emptyThematicBook = store.currentDictionary.isThematicGrammar && store.currentDictionary.words.isEmpty
        return ContentUnavailableView {
            Label(emptyThematicBook ? "尚未加入主題語法" : allDeleted ? "此書籍的\(entryName)已刪除" : store.mode == .review ? "目前沒有待複習的\(entryName)" : "沒有符合的\(entryName)",
                  systemImage: emptyThematicBook ? "books.vertical" : allDeleted ? "trash" : store.mode == .review ? "checkmark.seal" : "magnifyingglass")
        } description: {
            Text(emptyThematicBook ? "主題背誦使用獨立的語法資料。可在設定中匯入主題語法書籍。" : allDeleted ? "可在設定中還原已刪除的\(entryName)。" :
                 store.mode == .review ? "本輪只會收錄未掌握的\(entryName)。你可以繼續瀏覽全部內容。" : "試試其他關鍵字，或清除目前的搜尋與篩選。")
        } actions: {
            if emptyThematicBook {
                Button("開啟設定匯入", action: openSettings).buttonStyle(.glass)
            } else if allDeleted {
                Button("開啟設定", action: openSettings).buttonStyle(.glass)
            } else if store.mode == .review {
                Button(overviewTitle) { store.mode = .lookup }.buttonStyle(.glass)
            } else {
                Button("清除搜尋與篩選") {
                    store.search = ""
                    store.categoryID = nil
                    store.subcategoryID = nil
                    store.hideMastered = false
                }
                .buttonStyle(.glass)
            }
        }
        .accessibilityIdentifier("words.empty")
    }
}
