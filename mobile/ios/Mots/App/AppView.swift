import SwiftUI
import UIKit

struct AppView: View {
    @Bindable var store: StudyStore
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @State private var columnVisibility: NavigationSplitViewVisibility = .automatic
    @State private var preferredCompactColumn: NavigationSplitViewColumn = .detail
    @State private var settingsPresented = false

    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility, preferredCompactColumn: $preferredCompactColumn) {
            sidebar
                .navigationSplitViewColumnWidth(min: 250, ideal: 286, max: 340)
        } detail: {
            NavigationStack {
                workbench
                    .navigationTitle("Mots")
                    .navigationBarTitleDisplayMode(.inline)
                    .navigationBarBackButtonHidden(horizontalSizeClass == .compact)
                    .toolbar {
                        ToolbarItem(placement: .principal) {
                            bookMenu
                        }
                        if horizontalSizeClass == .compact {
                            ToolbarItem(placement: .topBarLeading) {
                                Button {
                                    preferredCompactColumn = .sidebar
                                } label: {
                                    Label("分類目錄", systemImage: "sidebar.left")
                                }
                                .accessibilityIdentifier("navigation.categories")
                            }
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            modeMenu
                        }
                        ToolbarItem(placement: .topBarTrailing) {
                            Button { settingsPresented = true } label: {
                                Label("設定", systemImage: "slider.horizontal.3")
                            }
                            .accessibilityIdentifier("navigation.settings")
                        }
                    }
            }
        }
        .navigationSplitViewStyle(.balanced)
        .tint(MotsTheme.accent)
        .sheet(isPresented: $settingsPresented) {
            SettingsView(store: store)
        }
        .onChange(of: store.dictionaryID) { stopSpeech() }
        .onChange(of: store.mode) { stopSpeech() }
        .onChange(of: store.currentWord?.id) { stopSpeech() }
        .onChange(of: store.availableWords.map(\.id)) { _, _ in
            if let id = SpeechPlayer.shared.activeWordID, store.isDeleted(id) { stopSpeech() }
        }
    }

    private var sidebar: some View {
        List {
            Section {
                Menu {
                    Picker("目前書籍", selection: $store.dictionaryID) {
                        ForEach(store.dictionaries) { dictionary in
                            Text(dictionary.displayTitle).tag(dictionary.id)
                        }
                    }
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: "books.vertical")
                            .font(.title2)
                            .foregroundStyle(MotsTheme.accent)
                        VStack(alignment: .leading, spacing: 4) {
                            Text("目前書籍").font(.caption).foregroundStyle(MotsTheme.muted)
                            Text(store.currentDictionary.displayTitle).font(.headline)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer(minLength: 4)
                        Image(systemName: "chevron.up.chevron.down").font(.caption)
                    }
                    .padding(.vertical, 6)
                    .contentShape(Rectangle())
                }
                .accessibilityIdentifier("dictionary.picker")
            }

            Section("學習方式") {
                ForEach(StudyMode.allCases) { mode in
                    Button {
                        selectMode(mode)
                    } label: {
                        HStack {
                            Label(mode.navigationTitle(for: store.currentDictionary), systemImage: mode.symbol)
                            Spacer()
                            if store.mode == mode {
                                Image(systemName: "checkmark").font(.caption.bold())
                            }
                        }
                        .foregroundStyle(store.mode == mode ? MotsTheme.accent : MotsTheme.ink)
                        .frame(minHeight: 32)
                    }
                    .accessibilityAddTraits(store.mode == mode ? [.isSelected] : [])
                }
            }

            Section("主題目錄") {
                categoryButton(store.currentDictionary.isGrammar ? "全部語法" : "全部單字", categoryID: nil, subcategoryID: nil, symbol: "square.grid.2x2")
                ForEach(store.currentDictionary.categories) { category in
                    if store.currentDictionary.isThematicGrammar {
                        categoryButton(category.name, categoryID: category.id, subcategoryID: nil)
                    } else {
                        DisclosureGroup {
                            categoryButton("此主題全部", categoryID: category.id, subcategoryID: nil)
                            ForEach(category.subcategories) { subcategory in
                                categoryButton(subcategory.name, categoryID: category.id, subcategoryID: subcategory.id)
                            }
                        } label: {
                            Text(category.name)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(MotsTheme.ink)
                                .fixedSize(horizontal: false, vertical: true)
                                .padding(.vertical, 5)
                        }
                    }
                }
            }

            Section {
                Label("進度保存在此裝置", systemImage: "iphone")
                    .font(.footnote)
                    .foregroundStyle(MotsTheme.muted)
            }
        }
        .listStyle(.sidebar)
        .scrollContentBackground(.hidden)
        .background(MotsTheme.background)
        .navigationTitle("Mots")
    }

    private func categoryButton(_ title: String, categoryID: String?, subcategoryID: String?, symbol: String? = nil) -> some View {
        let selected = store.mode == .study && store.categoryID == categoryID && store.subcategoryID == subcategoryID
        return Button {
            store.mode = .study
            store.categoryID = categoryID
            store.subcategoryID = subcategoryID
            preferredCompactColumn = .detail
        } label: {
            HStack(spacing: 10) {
                if let symbol { Image(systemName: symbol) }
                Text(title).fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 4)
                if selected { Image(systemName: "checkmark").font(.caption.bold()) }
            }
            .frame(minHeight: 34, alignment: .leading)
            .foregroundStyle(selected ? MotsTheme.accent : MotsTheme.ink)
        }
        .accessibilityAddTraits(selected ? [.isSelected] : [])
    }

    private var bookMenu: some View {
        Menu {
            Picker("目前書籍", selection: $store.dictionaryID) {
                ForEach(store.dictionaries) { dictionary in
                    Text(dictionary.displayTitle).tag(dictionary.id)
                }
            }
        } label: {
            HStack(spacing: 5) {
                Text(store.currentDictionary.displayTitle)
                    .font(.headline)
                    .lineLimit(1)
                    .truncationMode(.middle)
                    .minimumScaleFactor(0.8)
                Image(systemName: "chevron.down").font(.caption2.weight(.semibold))
            }
            .frame(maxWidth: horizontalSizeClass == .compact ? 180 : 300, minHeight: 44)
            .contentShape(Rectangle())
        }
        .accessibilityLabel("切換書籍：\(store.currentDictionary.displayTitle)")
        .accessibilityIdentifier("navigation.book")
    }

    private var modeMenu: some View {
        Menu {
            ForEach(StudyMode.allCases) { mode in
                Button {
                    selectMode(mode)
                } label: {
                    Label(mode.navigationTitle(for: store.currentDictionary), systemImage: store.mode == mode ? "checkmark" : mode.symbol)
                }
            }
            Divider()
            Button {
                store.mode = .study
                store.listMode = false
            } label: {
                Label("卡片模式", systemImage: store.mode == .study && !store.listMode ? "checkmark" : "rectangle.portrait")
            }
            Button {
                store.mode = .study
                store.listMode = true
            } label: {
                Label("列表模式", systemImage: store.mode == .study && store.listMode ? "checkmark" : "list.bullet")
            }
        } label: {
            Label(store.mode.navigationTitle(for: store.currentDictionary), systemImage: store.mode.symbol)
        }
        .accessibilityLabel("學習方式：\(store.mode.navigationTitle(for: store.currentDictionary))")
        .accessibilityIdentifier("navigation.mode")
    }

    private func selectMode(_ mode: StudyMode) {
        if mode == .review {
            if store.mode != .review { store.startReview() }
        } else {
            store.mode = mode
        }
        preferredCompactColumn = .detail
    }

    private func stopSpeech() {
        SpeechPlayer.shared.stop()
        SpeechPlayer.shared.message = nil
    }

    @ViewBuilder
    private var workbench: some View {
        if let error = store.loadError {
            ContentUnavailableView {
                Label("詞庫未能載入", systemImage: "exclamationmark.triangle")
            } description: {
                Text(error)
            } actions: {
                Button("開啟設定") { settingsPresented = true }.buttonStyle(.glass)
            }
        } else if store.showsCards {
            StudyWorkbench(store: store, openSettings: { settingsPresented = true })
        } else {
            StudyWorkbench(store: store, openSettings: { settingsPresented = true })
                .searchable(text: $store.search, placement: .navigationBarDrawer(displayMode: .always), prompt: store.currentDictionary.isGrammar ? "搜尋語法、解說或例句" : "搜尋單字、釋義或例句")
                .autocorrectionDisabled()
                .textInputAutocapitalization(.never)
        }
    }
}
