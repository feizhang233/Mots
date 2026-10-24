import SwiftUI

struct CardProgress: View {
    let store: StudyStore

    var body: some View {
        HStack(spacing: 14) {
            ProgressView(value: Double(store.cardPosition), total: Double(max(store.filteredWords.count, 1)))
                .tint(MotsTheme.accent)
                .accessibilityLabel(store.mode == .review ? "本輪複習進度" : "單元卡片進度")
                .accessibilityValue("第 \(store.cardPosition) \(store.currentDictionary.entryUnit)，共 \(store.filteredWords.count) \(store.currentDictionary.entryUnit)")
                .accessibilityIdentifier("study.progress")
            Text("\(store.cardPosition)/\(store.filteredWords.count)")
                .font(.subheadline.monospacedDigit())
                .foregroundStyle(MotsTheme.muted)
                .fixedSize()
                .accessibilityIdentifier("study.progress.count")
        }
        .frame(maxWidth: MotsTheme.contentWidth)
        .frame(maxWidth: .infinity)
    }
}

struct StudyCard: View {
    @Bindable var store: StudyStore
    let word: StudyWord
    @State private var showingDetail = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            HStack(alignment: .top) {
                Text(store.subcategoryName(for: word))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(MotsTheme.muted)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 10)
                RatingBadge(level: store.rating(word))
            }
            VStack(alignment: .leading, spacing: 20) {
                Text(word.term)
                    .font(.system(.largeTitle, design: .rounded).weight(.semibold))
                    .foregroundStyle(MotsTheme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                    .textSelection(.enabled)
                    .accessibilityIdentifier("study.term")
                SpeakButton(word: word)
            }
            .padding(.vertical, 8)

            if store.currentWord?.id == word.id && store.revealed {
                VStack(alignment: .leading, spacing: 18) {
                    Divider().overlay(MotsTheme.stroke)
                    Text(store.displayMeaning(for: word))
                        .font(.title3.weight(.medium))
                        .foregroundStyle(MotsTheme.ink)
                        .textSelection(.enabled)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("study.meaning")
                    if !word.pattern.isEmpty {
                        Text(word.pattern)
                            .font(.subheadline)
                            .foregroundStyle(MotsTheme.accent)
                            .fixedSize(horizontal: false, vertical: true)
                            .textSelection(.enabled)
                            .accessibilityIdentifier("study.pattern")
                    }
                    if !word.exampleTexts.isEmpty {
                        VStack(alignment: .leading, spacing: 14) {
                            Text("例句").font(.caption.weight(.semibold)).foregroundStyle(MotsTheme.muted)
                            ForEach(Array(word.exampleTexts.prefix(2).enumerated()), id: \.offset) { index, example in
                                Text(example)
                                    .font(.body)
                                    .foregroundStyle(MotsTheme.muted)
                                    .lineSpacing(5)
                                    .fixedSize(horizontal: false, vertical: true)
                                    .textSelection(.enabled)
                                    .accessibilityIdentifier("study.example.\(index)")
                            }
                        }
                    }
                }
                .transition(.opacity)
            } else {
                Spacer(minLength: 16)
                Button { store.revealed = true } label: {
                    Label("顯示答案", systemImage: "eye")
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 44)
                }
                .buttonStyle(.glass)
                .foregroundStyle(MotsTheme.accent)
                .tint(MotsTheme.accent)
                .accessibilityIdentifier("study.reveal")
            }
            Button {
                SpeechPlayer.shared.stop()
                showingDetail = true
            } label: {
                Label("查看詳情", systemImage: "text.alignleft")
                    .font(.subheadline.weight(.medium))
                    .frame(minHeight: 44)
            }
            .buttonStyle(.plain)
            .foregroundStyle(MotsTheme.accent)
            .accessibilityLabel("查看 \(word.term) 的詳情")
            .accessibilityIdentifier("study.detail")
        }
        .padding(24)
        .frame(maxWidth: .infinity, minHeight: 350, alignment: .topLeading)
        .motsCardSurface()
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.2), value: store.revealed)
        .sheet(isPresented: $showingDetail) {
            EntryDetailView(store: store, word: word)
        }
    }
}

struct CardNavigation: View {
    let store: StudyStore

    private var finishesReview: Bool { store.mode == .review && store.currentIndex == store.filteredWords.count - 1 }

    var body: some View {
        HStack {
            Button { store.previous() } label: {
                Image(systemName: "chevron.left")
            }
            .motsGlassIconControl()
            .disabled(store.currentIndex == 0)
            .accessibilityLabel(store.currentDictionary.isGrammar ? "上一項語法" : "上一個單字")
            .accessibilityIdentifier("study.previous")
            Spacer()
            if let word = store.currentWord {
                RatingControls(store: store, word: word, cardFooter: true)
            }
            Spacer()
            Button { store.next() } label: {
                Image(systemName: finishesReview ? "checkmark" : "chevron.right")
            }
            .motsGlassIconControl()
            .disabled(store.mode != .review && store.currentIndex >= store.filteredWords.count - 1)
            .accessibilityLabel(finishesReview ? "完成本輪" : store.currentDictionary.isGrammar ? "下一項語法" : "下一個單字")
            .accessibilityIdentifier("study.next")
        }
        .foregroundStyle(MotsTheme.accent)
        .frame(maxWidth: MotsTheme.contentWidth)
        .frame(maxWidth: .infinity)
    }
}
