import SwiftUI

struct DeletedWordsView: View {
    @Bindable var store: StudyStore
    @State private var query = ""

    private var matchingWords: [StudyWord] {
        store.deletedWords.filter {
            query.isEmpty || $0.term.localizedStandardContains(query) ||
                store.displayMeaning(for: $0).localizedStandardContains(query)
        }
    }

    var body: some View {
        List {
            if let error = store.storageError {
                Section {
                    Label("尚未儲存：\(error)", systemImage: "exclamationmark.triangle")
                        .foregroundStyle(.red)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("deleted.storage-error")
                }
            }
            if store.deletedWords.isEmpty {
                ContentUnavailableView("沒有已刪除的項目", systemImage: "trash",
                    description: Text("列表中刪除的項目會保留在這裡，可隨時還原。"))
                    .listRowBackground(Color.clear)
            } else if matchingWords.isEmpty {
                ContentUnavailableView.search(text: query)
                    .listRowBackground(Color.clear)
            } else {
                Section {
                    ForEach(matchingWords) { word in
                        HStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(word.term).font(.headline).foregroundStyle(MotsTheme.ink)
                                Text(store.displayMeaning(for: word))
                                    .font(.subheadline).foregroundStyle(MotsTheme.muted)
                            }
                            .fixedSize(horizontal: false, vertical: true)
                            Spacer(minLength: 0)
                            Button("還原") {
                                if store.restoreWord(word.id) {
                                    UIAccessibility.post(notification: .announcement, argument: "已還原 \(word.term)")
                                }
                            }
                            .buttonStyle(.borderless)
                            .frame(minWidth: 44, minHeight: 44)
                            .accessibilityLabel("還原 \(word.term)")
                            .accessibilityIdentifier("deleted.restore.\(word.id)")
                        }
                        .padding(.vertical, 4)
                    }
                } footer: {
                    Text("還原後會保留原有熟悉程度，並回到原來的書籍位置。")
                }
            }
        }
        .navigationTitle("已刪除的項目")
        .navigationBarTitleDisplayMode(.inline)
        .searchable(text: $query, prompt: "搜尋已刪除的項目")
        .autocorrectionDisabled()
        .textInputAutocapitalization(.never)
        .scrollContentBackground(.hidden)
        .background(MotsTheme.background)
    }
}
