import SwiftUI

struct MemoryWorkbench: View {
    @Bindable var store: StudyStore
    let openSettings: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let error = store.storageError {
                    Button(action: openSettings) {
                        Label("尚未儲存：\(error)", systemImage: "exclamationmark.triangle")
                            .font(.footnote).foregroundStyle(MotsTheme.unfamiliar)
                    }
                }
                if store.memorySessionActive {
                    if store.completed { completion }
                    else if let word = store.currentWord {
                        CardProgress(store: store)
                        Text("第 \((store.memoryRecord(for: word)?.stage ?? 0) + 1) / \(MemoryRecord.masteryStage) 次成功回想")
                            .font(.subheadline).foregroundStyle(MotsTheme.muted)
                        StudyCard(store: store, word: word)
                    }
                } else {
                    setup
                }
                if let feedback = store.memoryFeedback {
                    Text(feedback).font(.footnote).foregroundStyle(MotsTheme.accent)
                        .accessibilityIdentifier("memory.feedback")
                }
            }
            .frame(maxWidth: MotsTheme.contentWidth, alignment: .leading)
            .padding(20)
            .frame(maxWidth: .infinity)
        }
        .background(MotsTheme.background)
        .safeAreaInset(edge: .bottom, spacing: 0) {
            if store.memorySessionActive && !store.completed, let word = store.currentWord {
                VStack(spacing: 8) {
                    if word.meanings[store.meaningLanguage] == nil {
                        Text("所選語言尚無釋義，請在設定切換。")
                            .font(.footnote).foregroundStyle(MotsTheme.muted)
                    }
                    MemoryAnswerLayout {
                        Button {
                            SpeechPlayer.shared.stop()
                            store.markMemoryMastered(wordID: word.id)
                        } label: {
                            Text("已掌握")
                                .font(.subheadline.weight(.medium))
                                .lineLimit(1).minimumScaleFactor(0.75)
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .buttonStyle(.glass)
                        .tint(MotsTheme.mastered)
                        .accessibilityHint("直接將這個單字轉為已掌握，並前往下一張卡片")
                        .accessibilityIdentifier("memory.mastered")
                        Button {
                            SpeechPlayer.shared.stop()
                            store.answerMemory(wordID: word.id, remembered: false)
                        } label: {
                            Text("沒想起")
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .buttonStyle(.glass)
                        .accessibilityIdentifier("memory.forgot")
                        Button {
                            SpeechPlayer.shared.stop()
                            store.answerMemory(wordID: word.id, remembered: true)
                        } label: {
                            Text("記住了")
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .buttonStyle(.glassProminent)
                        .disabled(word.meanings[store.meaningLanguage] == nil)
                        .accessibilityIdentifier("memory.remembered")
                    }
                    .buttonSizing(.flexible)
                    Button("返回章節選擇") { store.leaveMemoryRound() }
                        .font(.footnote).frame(minHeight: 44)
                }
                .padding(.horizontal, 20).padding(.vertical, 10)
                .background(MotsTheme.background)
            }
        }
        .onChange(of: store.currentWord?.id) { SpeechPlayer.shared.stop() }
        .onDisappear { SpeechPlayer.shared.stop() }
        .accessibilityIdentifier("memory.workbench")
    }

    private var setup: some View {
        VStack(alignment: .leading, spacing: 18) {
            Text("卡片記憶")
                .font(.system(.title, design: .rounded).weight(.semibold))
                .accessibilityAddTraits(.isHeader)
            DisclosureGroup("複習規則") {
                VStack(alignment: .leading, spacing: 8) {
                    Text("完成 5 次成功回想後轉為「已掌握」。第一次立即背誦，之後間隔 1、2、4、7 天。忘記後從頭開始，1 天後重練；連續兩次忘記會轉為「不熟悉」。記住一次即中斷連續忘記。")
                    Text("每次間隔從實際作答時計算。新一輪隨機排列，繼續上次保留順序與位置。")
                }
                .font(.footnote).foregroundStyle(MotsTheme.muted)
            }
            if store.hasSavedMemoryRound {
                Button {
                    store.resumeMemoryRound()
                } label: {
                    Label(store.hasUnfinishedMemoryRound ? "繼續上次" : "查看上次結果", systemImage: "play.fill")
                        .frame(maxWidth: .infinity, minHeight: 44)
                }
                .buttonStyle(.glassProminent)
                .accessibilityIdentifier("memory.resume")
            }
            Text("選擇章節")
                .font(.headline).accessibilityAddTraits(.isHeader)
            HStack {
                Button("全選") { store.selectMemoryChapters(Set(store.availableCategories.map(\.id))) }
                Button("清除選擇") { store.selectMemoryChapters([]) }
            }
            .buttonStyle(.glass)
            ForEach(store.availableCategories) { category in
                chapterChoice(category)
            }
            TimelineView(.periodic(from: .now, by: 30)) { context in
                let dueCount = store.memoryDueWords(at: context.date).count
                VStack(alignment: .leading, spacing: 12) {
                    Text("已選 \(store.selectedMemoryChapters.count) 章 · 有印象 \(store.memoryWords.count) 詞 · 現在可背 \(dueCount) 詞")
                        .font(.subheadline).foregroundStyle(MotsTheme.muted)
                    if store.selectedMemoryChapters.isEmpty {
                        Text("請至少選擇一個章節。")
                    } else if store.memoryWords.isEmpty {
                        Text("所選章節沒有「有印象」的單字。先在詞彙背誦中標記，再回來記憶。")
                    } else if dueCount == 0 {
                        Text("目前沒有到期卡片，請在下次複習時間回來。")
                        nextDue
                    }
                    Button {
                        store.startMemoryRound()
                    } label: {
                        Label("\(store.hasSavedMemoryRound ? "開始新一輪" : "開始記憶") · \(dueCount) 詞", systemImage: "play.fill")
                            .frame(maxWidth: .infinity, minHeight: 44)
                    }
                    .buttonStyle(.glassProminent)
                    .disabled(dueCount == 0)
                    .accessibilityIdentifier("memory.start")
                }
            }
        }
        .foregroundStyle(MotsTheme.ink)
    }

    private func chapterChoice(_ category: StudyCategory) -> some View {
        let selected = store.selectedMemoryChapters.contains(category.id)
        let count = store.availableWords.filter { $0.category == category.id && store.rating($0) == 2 }.count
        return Button {
            var ids = store.selectedMemoryChapters
            if selected { ids.remove(category.id) } else { ids.insert(category.id) }
            store.selectMemoryChapters(ids)
        } label: {
            HStack(spacing: 12) {
                Image(systemName: selected ? "checkmark.square.fill" : "square")
                    .foregroundStyle(MotsTheme.accent)
                Text(category.name).frame(maxWidth: .infinity, alignment: .leading)
                Text("\(count) 詞").font(.subheadline).foregroundStyle(MotsTheme.muted)
            }
            .frame(minHeight: 44)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(category.name)，有印象 \(count) 詞")
        .accessibilityAddTraits(selected ? [.isSelected] : [])
        .accessibilityIdentifier("memory.chapter.\(category.id)")
    }

    private var completion: some View {
        VStack(spacing: 18) {
            Image(systemName: "checkmark.circle").font(.system(size: 48, weight: .light))
                .foregroundStyle(MotsTheme.accent).accessibilityHidden(true)
            Text("本輪記憶完成").font(.title2.weight(.semibold))
            Text("已複習 \(store.memoryAnsweredCount) 詞，其中 \(store.memoryMasteredCount) 詞轉為已掌握。")
                .multilineTextAlignment(.center)
            nextDue
            TimelineView(.periodic(from: .now, by: 30)) { context in
                Button("開始新一輪") { store.startMemoryRound() }
                    .buttonStyle(.glassProminent)
                    .disabled(store.memoryDueWords(at: context.date).isEmpty)
            }
            Button("返回章節選擇") { store.leaveMemoryRound() }.buttonStyle(.glass)
        }
        .frame(maxWidth: .infinity).padding(24).motsCardSurface()
        .accessibilityIdentifier("memory.completed")
    }

    @ViewBuilder private var nextDue: some View {
        if let date = store.memoryNextDue {
            Text("下次複習：\(date.formatted(date: .abbreviated, time: .shortened))")
                .font(.subheadline).foregroundStyle(MotsTheme.muted)
        }
    }
}

/// Measure each styled button at its final width, including its native control padding.
private struct MemoryAnswerLayout: Layout {
    private let spacing: CGFloat = 8

    private func buttonWidth(_ index: Int, in row: CGFloat) -> CGFloat {
        let unit = max(0, row - spacing * 2) / 5
        return index == 0 ? unit : unit * 2
    }

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? MotsTheme.contentWidth
        var height: CGFloat = 44
        for (index, button) in subviews.enumerated() {
            let size = button.sizeThatFits(ProposedViewSize(width: buttonWidth(index, in: width), height: nil))
            height = max(height, size.height)
        }
        return CGSize(width: width, height: height)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX
        for (index, button) in subviews.enumerated() {
            let width = buttonWidth(index, in: bounds.width)
            button.place(at: CGPoint(x: x, y: bounds.minY), anchor: .topLeading,
                         proposal: ProposedViewSize(width: width, height: bounds.height))
            x += width + spacing
        }
    }
}

struct MemoryLapseList: View {
    let store: StudyStore
    let returnToMemory: () -> Void

    var body: some View {
        let words = store.memoryLapseWords
        List {
            Section {
                Button(action: returnToMemory) {
                    Label("返回卡片記憶", systemImage: "chevron.backward")
                        .frame(minHeight: 44)
                }
                .accessibilityIdentifier("memory.lapses.back")
            }
            Section {
                if words.isEmpty {
                    Text("目前沒有忘記一次的單字。")
                        .foregroundStyle(MotsTheme.muted)
                }
                ForEach(words) { word in
                    HStack(spacing: 12) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(word.displayTerm)
                                .font(.system(.headline, design: .rounded))
                                .foregroundStyle(MotsTheme.ink)
                            Text(store.displayMeaning(for: word))
                                .font(.subheadline)
                                .foregroundStyle(MotsTheme.muted)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        SpeakButton(word: word).labelStyle(.iconOnly)
                    }
                    .accessibilityIdentifier("memory.lapse.\(word.id)")
                }
            } header: {
                HStack {
                    Text("忘記一次").font(.headline)
                    Spacer()
                    Text("\(words.count) 詞").font(.footnote.monospacedDigit())
                }
                .textCase(nil)
            }
            .listRowBackground(MotsTheme.surface)
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .background(MotsTheme.background)
        .onDisappear { SpeechPlayer.shared.stop() }
        .accessibilityIdentifier("memory.lapses")
    }
}
