import SwiftUI
import UniformTypeIdentifiers

private struct ArchivedDictionaryList:View {
    let store:StudyStore
    @State private var failure:String?
    var body:some View {
        List {
            if let failure { Label(failure,systemImage:"exclamationmark.circle").foregroundStyle(.secondary) }
            if store.archivedDictionaries.isEmpty {
                Text("沒有已移除的辭典。").foregroundStyle(.secondary)
            }
            ForEach(store.archivedDictionaries) { book in
                HStack {
                    Text(book.title).fixedSize(horizontal:false,vertical:true)
                    Spacer()
                    Button("還原") {
                        do { try store.archiveDictionary(book.id,archived:false);failure=nil }
                        catch { failure=error.localizedDescription }
                    }
                    .frame(minWidth:44,minHeight:44)
                    .accessibilityLabel("還原 \(book.title)")
                }
            }
        }
        .navigationTitle("已移除的辭典")
    }
}

struct SettingsView: View {
    @Bindable var store: StudyStore
    @Environment(\.dismiss) private var dismiss
    @State private var importing = false
    @State private var importKind = ImportKind.dictionary
    @State private var exporting = false
    @State private var document: MotsExport?
    @State private var exportType = UTType.json
    @State private var exportName = "Mots-backup"
    @State private var status: String?
    @State private var failure = false
    @State private var exportScope = "all"
    @State private var pairingCode = ""
    @State private var expandedGroup: SettingsGroup?
    @State private var renamingDictionary=false
    @State private var renameTitle=""
    @State private var removingDictionary=false
    @State private var dictionaryActionID=""
    @State private var dictionaryActionTitle=""

    private enum SettingsGroup { case learning, sync, dictionaries, backup }

    private enum ImportKind { case dictionary, backup }

    var body: some View {
        NavigationStack {
            Form {
                feedback
                Section {
                    DisclosureGroup(isExpanded: expansion(for: .learning)) {
                        learningPreferences
                    } label: {
                        SettingsGroupLabel("學習偏好", symbol: "slider.horizontal.3", summary: store.currentDictionary.displayTitle)
                    }
                    .disclosureGroupStyle(SettingsDisclosureStyle(identifier: "settings.group.learning"))
                }
                Section {
                    DisclosureGroup(isExpanded: expansion(for: .sync)) {
                        SyncSettingsContent(sync: store.syncController, pairingCode: $pairingCode)
                    } label: {
                        SettingsGroupLabel("資料同步", symbol: "arrow.triangle.2.circlepath.icloud", summary: syncSummary)
                    }
                    .disclosureGroupStyle(SettingsDisclosureStyle(identifier: "settings.group.sync"))
                }
                Section {
                    DisclosureGroup(isExpanded: expansion(for: .dictionaries)) {
                        dictionaryTools
                    } label: {
                        SettingsGroupLabel("辭典匯入與生詞", symbol: "books.vertical", summary: "匯入新辭典・範例模板・匯出生詞")
                    }
                    .disclosureGroupStyle(SettingsDisclosureStyle(identifier: "settings.group.dictionaries"))
                }
                Section {
                    DisclosureGroup(isExpanded: expansion(for: .backup)) {
                        backupTools
                    } label: {
                        SettingsGroupLabel("備份與還原", symbol: "externaldrive", summary: "匯出完整備份・合併備份")
                    }
                    .disclosureGroupStyle(SettingsDisclosureStyle(identifier: "settings.group.backup"))
                } footer: {
                    Text("Mots · iOS \(appVersion)")
                        .frame(maxWidth: .infinity)
                        .padding(.top, 8)
                }
            }
            .navigationTitle("設定")
            .toolbar { ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() } } }
            .onChange(of: store.dictionaryID) { _, _ in exportScope = "all"; SpeechPlayer.shared.stop() }
        }
        .tint(MotsTheme.accent)
        .onAppear { clearPairingDisplay() }
        .onDisappear { clearPairingDisplay() }
        .onChange(of: expandedGroup) { _, group in
            if group != .sync { clearPairingDisplay() }
        }
        .fileImporter(isPresented: $importing, allowedContentTypes: [.json], allowsMultipleSelection: false) { result in
            handleImport(result)
        }
        .fileExporter(isPresented: $exporting, document: document, contentType: exportType, defaultFilename: exportName) { result in
            switch result {
            case .success: showStatus("已匯出檔案。")
            case .failure(let error): showStatus("匯出失敗：\(error.localizedDescription)", error: true)
            }
        }
        .alert("重新命名辭典",isPresented:$renamingDictionary) {
            TextField("辭典名稱",text:$renameTitle)
            Button("取消",role:.cancel) {}
            Button("儲存") {
                do { try store.renameDictionary(dictionaryActionID,title:renameTitle);showStatus("辭典名稱已儲存，配對後會同步。") }
                catch { showStatus(error.localizedDescription,error:true) }
            }
        }
        .confirmationDialog("移除「\(dictionaryActionTitle)」？",isPresented:$removingDictionary,titleVisibility:.visible) {
            Button("移除辭典",role:.destructive) {
                do { try store.archiveDictionary(dictionaryActionID,archived:true);showStatus("辭典已移除，可隨時還原；學習紀錄已保留。") }
                catch { showStatus(error.localizedDescription,error:true) }
            }
            Button("取消",role:.cancel) {}
        } message: { Text("移除會同步到已配對裝置。你可以在「已移除的辭典」還原，熟悉度與記憶排程會保留。") }
    }

    private var appVersion: String {
        Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? "1.0"
    }

    private var syncSummary: String {
        let sync = store.syncController
        if sync.catalogBusy { return "詞庫更新中" }
        if sync.busy { return sync.connected ? "同步中" : "配對中" }
        if syncIssue != nil { return sync.connected ? "需要處理，點開查看" : "配對未完成" }
        if sync.status == "已同步" { return "已同步" }
        return sync.connected ? "等待同步" : "尚未配對"
    }

    /// Keep complete failures visible even when their controls are collapsed.
    private var syncIssue: String? {
        let sync = store.syncController
        guard !sync.busy else { return nil }
        if sync.catalogStatus.hasPrefix("線上詞庫更新失敗") { return sync.catalogStatus }
        let ordinary = ["尚未配對", "等待同步", "已同步", "有進度等待同步", "有資料等待同步", "已配對，正在同步…",
                        "正在配對…", "正在同步…", "已中斷同步，本機進度已保留"]
        return ordinary.contains(sync.status) ? nil : sync.status
    }

    @ViewBuilder private var feedback: some View {
        if status != nil || store.storageError != nil || syncIssue != nil {
            Section {
                if let status {
                    Label(status, systemImage: failure ? "exclamationmark.circle" : "checkmark.circle")
                        .foregroundStyle(failure ? .red : .primary)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("settings-status")
                }
                if let issue = syncIssue {
                    Label(issue, systemImage: "exclamationmark.icloud")
                        .foregroundStyle(.red)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("sync.issue")
                }
                if let error = store.storageError {
                    Label(error, systemImage: "exclamationmark.triangle")
                        .foregroundStyle(.red)
                        .fixedSize(horizontal: false, vertical: true)
                        .accessibilityIdentifier("settings.storage-error")
                }
            }
        }
    }

    @ViewBuilder private var learningPreferences: some View {
        Picker("目前書籍", selection: $store.dictionaryID) {
            ForEach(store.dictionaries) { dictionary in
                Text(dictionary.displayTitle).tag(dictionary.id)
            }
        }
        Picker("外觀", selection: $store.appearance) {
            ForEach(StudyAppearance.allCases) { appearance in
                Text(appearance.title).tag(appearance)
            }
        }
        .accessibilityIdentifier("settings.appearance")
        Picker("釋義語言", selection: $store.meaningLanguage) {
            Text("繁體中文").tag("zh-Hant")
            Text("简体中文").tag("zh-Hans")
            Text("English").tag("en")
            Text("Français").tag("fr")
            Text("Deutsch").tag("de")
            Text("日本語").tag("ja")
        }
        if store.currentDictionary.isGrammar {
            LabeledContent("書籍類型", value: store.currentDictionary.isThematicGrammar ? "主題背誦" : "語法背誦")
                .accessibilityIdentifier("settings.grammar-book-type")
        } else {
            Toggle("先隱藏翻譯", isOn: $store.hideListMeanings)
                .accessibilityIdentifier("settings.hide-translations")
            Text("主題學習列表先只顯示單字，點一下會發音並顯示目前單字的翻譯；點其他單字會隱藏上一個翻譯。")
                .font(.footnote)
                .foregroundStyle(MotsTheme.muted)
        }
        Toggle("卡片顯示例句翻譯", isOn: $store.showExampleTranslations)
            .accessibilityIdentifier("settings.show-example-translations")
        Text("顯示答案後，顯示目前釋義語言已有的例句翻譯。")
            .font(.footnote)
            .foregroundStyle(MotsTheme.muted)
        Toggle("隱藏已掌握的項目", isOn: $store.hideMastered)
        Toggle("隱藏有印象的項目", isOn: $store.hideImpression)
            .accessibilityIdentifier("settings.hide-impression")
        Picker("列表每頁", selection: $store.pageSize) {
            ForEach([10, 20, 50, 100], id: \.self) { Text("\($0) \(store.currentDictionary.entryUnit)").tag($0) }
        }
        VStack(alignment: .leading, spacing: 8) {
            Text("讀音速度")
            Slider(value: $store.speechRate, in: 0.32...0.58, step: 0.01) {
                Text("讀音速度")
            } minimumValueLabel: { Image(systemName: "tortoise") }
            maximumValueLabel: { Image(systemName: "hare") }
        }
        .padding(.vertical, 6)
    }

    @ViewBuilder private var dictionaryTools: some View {
        Text("匯入新辭典")
            .font(.subheadline.weight(.semibold))
        Text("選擇 JSON 檔案，最多 2 MB、5,000 個詞條；支援法語（fr）、德語（de）與日語（ja）。匯入後會加入獨立書籍。")
            .font(.footnote).foregroundStyle(.secondary)
        Button { importKind = .dictionary; importing = true } label: {
            Label("匯入辭典 JSON", systemImage: "square.and.arrow.down")
                .settingsActionTarget()
        }
        .accessibilityIdentifier("settings.import-dictionary")
        Button {
            prepareExport(type: .json, name: "mots-\(store.currentDictionary.language)-dictionary-template") {
                try StudyImport.dictionaryTemplate(for: store.currentDictionary, meaningLanguage: store.meaningLanguage)
            }
        } label: {
            Label("下載範例模板", systemImage: "doc.badge.arrow.down")
                .settingsActionTarget()
        }
        .accessibilityIdentifier("settings.dictionary-template-download")
        Text("模板依目前書籍的語言與類型產生。填寫 title（辭典名稱）、language（語言）與 words（詞條）；每個詞條包含 term（單字或句型）和 meanings（釋義）。kind 使用 vocabulary（詞彙）或 grammar（語法），每個 id 保持唯一。")
            .font(.footnote).foregroundStyle(.secondary)
        VStack(alignment: .leading, spacing: 8) {
            Text("範例模板（JSON）").font(.subheadline.weight(.semibold))
            ScrollView {
                Text(dictionaryTemplatePreview)
                    .font(.system(.caption, design: .monospaced))
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(height: 220)
            .accessibilityIdentifier("settings.dictionary-template-preview")
        }
        .padding(.vertical, 6)
        Picker("匯出範圍", selection: $exportScope) {
            Text(store.currentDictionary.isGrammar ? "全部語法" : "全部單字").tag("all")
            ForEach(store.currentDictionary.categories) { category in
                Text(category.name).tag("c:" + category.id)
                ForEach(category.subcategories) { subcategory in
                    Text("　" + subcategory.name).tag("s:" + category.id + ":" + subcategory.id)
                }
            }
        }
        Button(action: prepareCSV) {
            Label(store.currentDictionary.isGrammar ? "匯出未掌握語法 CSV" : "匯出生詞 CSV", systemImage: "square.and.arrow.up").settingsActionTarget()
        }
        Text(store.currentDictionary.isGrammar ? "匯出未學習與尚未掌握的語法。" : "匯出未學習與尚未掌握的單字。")
            .font(.footnote).foregroundStyle(.secondary)
        NavigationLink {
            DeletedWordsView(store: store)
        } label: {
            Label("已刪除的項目（\(store.deletedWords.count)）", systemImage: "trash")
                .settingsActionTarget()
        }
        .accessibilityIdentifier("settings.deleted-words")
        Button {
            dictionaryActionID=store.dictionaryID;dictionaryActionTitle=store.currentDictionary.displayTitle
            renameTitle=store.currentDictionary.title;renamingDictionary=true
        } label: {
            Label("重新命名目前辭典",systemImage:"pencil").settingsActionTarget()
        }
        .disabled(store.dictionaries.isEmpty).accessibilityIdentifier("settings.dictionary-rename")
        Button(role:.destructive) {
            dictionaryActionID=store.dictionaryID;dictionaryActionTitle=store.currentDictionary.displayTitle;removingDictionary=true
        } label: {
            Label("移除目前辭典",systemImage:"books.vertical").settingsActionTarget()
        }
        .disabled(store.dictionaries.isEmpty).accessibilityIdentifier("settings.dictionary-remove")
        NavigationLink { ArchivedDictionaryList(store:store) } label: {
            Label("已移除的辭典（\(store.archivedDictionaries.count)）",systemImage:"archivebox").settingsActionTarget()
        }
        .accessibilityIdentifier("settings.dictionary-archive")
        Text("帶有既有辭典 ID 的 JSON 會更新或新增所列詞條，未列出的詞條保留。保留詞條 ID，即可沿用熟悉度與記憶排程；沒有既有 ID 的內容會匯入為新辭典。")
            .font(.footnote).foregroundStyle(.secondary)
    }

    private var dictionaryTemplatePreview: String {
        guard let data = try? StudyImport.dictionaryTemplate(for: store.currentDictionary, meaningLanguage: store.meaningLanguage),
              let text = String(data: data, encoding: .utf8) else { return "範例模板暫時無法顯示，請重新開啟設定。" }
        return text
    }

    @ViewBuilder private var backupTools: some View {
        Button {
            prepareExport(type: .json, name: "Mots-backup") { try store.exportBackup() }
        } label: {
            Label("匯出完整備份", systemImage: "externaldrive").settingsActionTarget()
        }
        Button { importKind = .backup; importing = true } label: {
            Label("合併備份", systemImage: "square.and.arrow.down").settingsActionTarget()
        }
        Text("相同項目採用備份進度，其餘保留。")
            .font(.footnote).foregroundStyle(.secondary)
    }

    private func expansion(for group: SettingsGroup) -> Binding<Bool> {
        Binding(get: { expandedGroup == group }, set: { value in
            if value { expandedGroup = group }
            else if expandedGroup == group { expandedGroup = nil }
        })
    }

    private func clearPairingDisplay() {
        store.syncController.hideCode()
        pairingCode = ""
    }

    private func showStatus(_ text: String, error: Bool = false) { status = text; failure = error }

    private func prepareExport(type: UTType, name: String, data: () throws -> Data) {
        do {
            document = MotsExport(data: try data())
            exportType = type
            exportName = name
            exporting = true
        } catch { showStatus(error.localizedDescription, error: true) }
    }

    private func prepareCSV() {
        let scope = exportScope.split(separator: ":").map(String.init)
        let category = scope.first == "c" || scope.first == "s" ? scope.dropFirst().first : nil
        let subcategory = scope.first == "s" ? scope.last : nil
        prepareExport(type: .commaSeparatedText, name: "Mots-\(store.dictionaryID)-未掌握項目") {
            try store.exportCSV(categoryID: category, subcategoryID: subcategory)
        }
    }

    private func handleImport(_ result: Result<[URL], Error>) {
        do {
            guard let url = try result.get().first else { return }
            let granted = url.startAccessingSecurityScopedResource()
            defer { if granted { url.stopAccessingSecurityScopedResource() } }
            let maximum = importKind == .backup ? 50 * 1024 * 1024 : 2 * 1024 * 1024
            let size = try url.resourceValues(forKeys: [.fileSizeKey]).fileSize ?? 0
            guard size <= maximum else { throw CocoaError(.fileReadTooLarge) }
            let data = try Data(contentsOf: url)
            if importKind == .backup {
                let count = try store.importBackup(data)
                showStatus("已合併 \(count) 個項目的進度。")
            } else {
                _ = try store.importDictionary(data)
                showStatus("已儲存「\(store.currentDictionary.displayTitle)」（\(store.currentDictionary.words.count) 個詞條），配對後會同步。")
            }
        } catch { showStatus("匯入失敗：\(error.localizedDescription)", error: true) }
    }
}
