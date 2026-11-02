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
                        Text("目前釋義語言沒有答案，請在設定切換釋義語言後再判斷是否記得。")
                            .font(.footnote).foregroundStyle(MotsTheme.muted)
                    } else if !store.revealed {
                        Text("可直接選擇是否記得，也可先顯示答案確認。")
                            .font(.footnote).foregroundStyle(MotsTheme.muted)
                    }
                    HStack(spacing: 12) {
                        Button {
                            SpeechPlayer.shared.stop()
                            store.answerMemory(wordID: word.id, remembered: false)
                        } label: {
                            Label("忘記了", systemImage: "arrow.counterclockwise")
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .buttonStyle(.glass)
                        .accessibilityIdentifier("memory.forgot")
                        Button {
                            SpeechPlayer.shared.stop()
                            store.answerMemory(wordID: word.id, remembered: true)
                        } label: {
                            Label("記得", systemImage: "checkmark")
                                .frame(maxWidth: .infinity, minHeight: 44)
                        }
                        .buttonStyle(.glassProminent)
                        .disabled(word.meanings[store.meaningLanguage] == nil)
                        .accessibilityIdentifier("memory.remembered")
                    }
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
            Text("專門複習「有印象」的單字。包含第一次背誦，完成 5 次成功回想後，會自動轉為「已掌握」。")
                .foregroundStyle(MotsTheme.muted)
            Text("第一次立即背誦，之後依次間隔 1 天、2 天、4 天、7 天。忘記後從頭開始，1 天後再複習。逾期仍按實際成功次數計算，下次間隔從本次作答時計算。")
                .font(.footnote).foregroundStyle(MotsTheme.muted)
            Text("每次開始新一輪會隨機排列到期單字；繼續上次會保留原本的順序與位置。")
                .font(.footnote).foregroundStyle(MotsTheme.muted)
            if store.hasSavedMemoryRound {
                Button {
                    store.resumeMemoryRound()
                } label: {
                    Label(store.hasUnfinishedMemoryRound ? "繼續上次" : "查看上次結果", systemImage: "play.fill")
                        .frame(maxWidth: .infinity, minHeight: 44)
                }
                .buttonStyle(.glassProminent)
                .accessibilityIdentifier("memory.resume")
                Text("上次的詞組與位置已保留。章節選擇只會套用到新的一輪。")
                    .font(.footnote).foregroundStyle(MotsTheme.muted)
            }
            Text("選擇章節，可同時選多個")
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
            Text("配對後，複習次數與下次複習時間會自動同步，並包含在備份中；章節選擇與本輪位置保存在此裝置。")
                .font(.footnote).foregroundStyle(MotsTheme.muted)
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
