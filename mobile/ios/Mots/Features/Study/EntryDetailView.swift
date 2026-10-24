import SwiftUI

/// Both study surfaces present the same read-only entry without moving the study queue.
struct EntryDetailView: View {
    let store: StudyStore
    let word: StudyWord
    @Environment(\.dismiss) private var dismiss

    private var isGrammar: Bool { store.currentDictionary.isGrammar }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 16) {
                        Text(store.subcategoryName(for: word))
                            .font(.caption.weight(.medium))
                            .foregroundStyle(MotsTheme.muted)
                        Text(word.term)
                            .font(.system(.largeTitle, design: .rounded).weight(.semibold))
                            .foregroundStyle(MotsTheme.ink)
                            .fixedSize(horizontal: false, vertical: true)
                            .textSelection(.enabled)
                            .accessibilityIdentifier("entry-detail.term")
                        Text(store.displayMeaning(for: word))
                            .font(.title3.weight(.medium))
                            .foregroundStyle(MotsTheme.ink)
                            .fixedSize(horizontal: false, vertical: true)
                            .textSelection(.enabled)
                            .accessibilityIdentifier("entry-detail.meaning")
                        SpeakButton(word: word)
                    }
                    if !word.pattern.isEmpty {
                        detailSection(isGrammar ? "接續方式" : "搭配與句型") {
                            Text(word.pattern)
                                .foregroundStyle(MotsTheme.accent)
                                .accessibilityIdentifier("entry-detail.pattern")
                        }
                    }
                    detailSection("用法說明") {
                        Text(word.explanation.isEmpty ? "尚未補充用法說明。" : word.explanation)
                            .foregroundStyle(word.explanation.isEmpty ? MotsTheme.muted : MotsTheme.ink)
                            .accessibilityIdentifier("entry-detail.explanation")
                    }
                    detailSection("例句") {
                        if word.exampleTexts.isEmpty {
                            Text("尚未收錄例句。")
                                .foregroundStyle(MotsTheme.muted)
                        } else {
                            VStack(alignment: .leading, spacing: 20) {
                                ForEach(Array(word.exampleTexts.enumerated()), id: \.offset) { index, example in
                                    if index > 0 { Divider().overlay(MotsTheme.stroke) }
                                    Text(example)
                                        .foregroundStyle(MotsTheme.ink)
                                        .accessibilityIdentifier("entry-detail.example.\(index)")
                                }
                            }
                        }
                    }
                }
                .padding(24)
                .frame(maxWidth: MotsTheme.contentWidth, alignment: .leading)
                .frame(maxWidth: .infinity)
            }
            .background(MotsTheme.background)
            .navigationTitle(isGrammar ? "語法詳情" : "詞彙詳情")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .frame(minWidth: 44, minHeight: 44)
                    }
                    .accessibilityLabel("關閉詳情")
                    .accessibilityIdentifier("entry-detail.close")
                }
            }
        }
        .tint(MotsTheme.accent)
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .onDisappear { SpeechPlayer.shared.stop() }
        .accessibilityIdentifier("entry-detail")
    }

    private func detailSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Divider().overlay(MotsTheme.stroke)
            Text(title)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(MotsTheme.muted)
                .accessibilityAddTraits(.isHeader)
            content()
                .font(.body)
                .lineSpacing(5)
                .fixedSize(horizontal: false, vertical: true)
                .textSelection(.enabled)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
