import Foundation
import CoreFoundation

/// IDs intentionally match the web edition so an imported backup keeps its progress.
enum StudyMode: String, CaseIterable, Codable, Identifiable {
    case lookup, study, review
    var id: String { rawValue }
    var title: String {
        switch self { case .lookup: "查詞"; case .study: "主題學習"; case .review: "隨機複習" }
    }
}

struct StudySubcategory: Codable, Hashable, Identifiable {
    let id: String
    let name: String
}

struct StudyCategory: Codable, Hashable, Identifiable {
    let id: String
    let name: String
    let subcategories: [StudySubcategory]
}

enum StudyDictionaryKind: String, Codable, CaseIterable {
    case vocabulary, grammar
}

enum StudyGrammarMode: String, Codable, CaseIterable {
    case standard, thematic
}

struct StudyExample: Codable, Hashable {
    let text: String
    let translations: [String: String]

    init(text: String, translations: [String: String] = [:]) {
        self.text = text
        self.translations = translations
    }

    private enum CodingKeys: String, CodingKey { case text, translations }

    init(from decoder: Decoder) throws {
        if let sentence = try? decoder.singleValueContainer().decode(String.self) {
            self.init(text: try StudyImport.detailText(sentence, field: "例句", limit: 2000))
            return
        }
        let values = try decoder.container(keyedBy: CodingKeys.self)
        let sentence = try StudyImport.detailText(values.decode(String.self, forKey: .text), field: "例句", limit: 2000)
        let translations = try values.contains(.translations) ? values.decode([String: String].self, forKey: .translations) : [:]
        var checked: [String: String] = [:]
        guard !translations.keys.contains(where: StudyImport.unsafeKeys.contains) else {
            throw StudyDataError("例句翻譯包含不支援的欄位。")
        }
        for (language, translation) in translations where StudyImport.meaningLanguages.contains(language) {
            let value = try StudyImport.detailText(translation, field: "例句翻譯", limit: 2000, required: false)
            if !value.isEmpty { checked[language] = value }
        }
        self.init(text: sentence, translations: checked)
    }
}

struct StudyWord: Codable, Hashable, Identifiable {
    let id: String
    let term: String
    let meaning: String
    let meanings: [String: String]
    let example: String
    let category: String
    let subcategory: String
    let language: String
    let audio: String?
    let part: String?
    let examples: [StudyExample]
    let pattern: String
    let explanation: String

    var exampleTexts: [String] { examples.map(\.text) }

    init(id: String, term: String, meaning: String, example: String = "", category: String,
         subcategory: String, language: String, audio: String? = nil,
         meanings: [String: String]? = nil, part: String? = nil,
         examples: [StudyExample] = [], pattern: String = "", explanation: String = "") {
        self.id = id; self.term = term; self.meaning = meaning
        self.meanings = meanings ?? ["zh-Hant": meaning]
        let combined = Self.mergeExamples(legacy: example, supplied: examples)
        self.examples = combined
        self.example = combined.first?.text ?? ""
        self.category = category; self.subcategory = subcategory
        self.language = language; self.audio = audio; self.part = part
        self.pattern = pattern; self.explanation = explanation
    }

    static func mergeExamples(legacy: String, supplied: [StudyExample]) -> [StudyExample] {
        var result: [StudyExample] = []
        var positions: [String: Int] = [:]
        for entry in [StudyExample(text: legacy)] + supplied {
            let sentence = entry.text.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !sentence.isEmpty else { continue }
            if let position = positions[sentence] {
                let translations = result[position].translations.merging(entry.translations) { first, _ in first }
                result[position] = StudyExample(text: sentence, translations: translations)
            } else {
                positions[sentence] = result.count
                result.append(StudyExample(text: sentence, translations: entry.translations))
            }
        }
        return result
    }

    private enum CodingKeys: String, CodingKey {
        case id, term, meaning, meanings, example, category, subcategory, language, audio, part
        case examples, pattern, explanation
    }

    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        let legacy = try StudyImport.detailText(values.decodeIfPresent(String.self, forKey: .example), field: "例句", limit: 2000, required: false)
        let examples = try values.contains(.examples) ? values.decode([StudyExample].self, forKey: .examples) : []
        guard examples.count <= 20, Self.mergeExamples(legacy: legacy, supplied: examples).count <= 20 else {
            throw StudyDataError("每個詞條最多 20 個例句（包含 example 欄位）。")
        }
        let pattern = try StudyImport.detailText(values.decodeIfPresent(String.self, forKey: .pattern), field: "接續方式", limit: 2000, required: false)
        let explanation = try StudyImport.detailText(values.decodeIfPresent(String.self, forKey: .explanation), field: "用法說明", limit: 6000, required: false)
        let meaning = try values.decode(String.self, forKey: .meaning)
        self.init(id: try values.decode(String.self, forKey: .id),
                  term: try values.decode(String.self, forKey: .term), meaning: meaning, example: legacy,
                  category: try values.decode(String.self, forKey: .category),
                  subcategory: try values.decode(String.self, forKey: .subcategory),
                  language: try values.decode(String.self, forKey: .language),
                  audio: try values.decodeIfPresent(String.self, forKey: .audio),
                  meanings: try values.decodeIfPresent([String: String].self, forKey: .meanings),
                  part: try values.decodeIfPresent(String.self, forKey: .part),
                  examples: examples, pattern: pattern, explanation: explanation)
    }
}

struct StudyDictionary: Codable, Hashable, Identifiable {
    let id: String
    let title: String
    let language: String
    let categories: [StudyCategory]
    var words: [StudyWord]
    let kind: StudyDictionaryKind
    let grammarMode: StudyGrammarMode
    var isBuiltIn: Bool { ["fr", "de", "ja", "grammar-fr", "grammar-de", "grammar-ja",
                          "grammar-theme-fr", "grammar-theme-de", "grammar-theme-ja"].contains(id) }
    var isGrammar: Bool { kind == .grammar }
    var isThematicGrammar: Bool { isGrammar && grammarMode == .thematic }
    var entryUnit: String { isGrammar ? "項" : "詞" }
    var displayTitle: String {
        ["fr": "Français Mots", "de": "Deutsch Wörter", "ja": "日本語 語彙",
         "grammar-fr": "Français Grammaire", "grammar-de": "Deutsch Grammatik", "grammar-ja": "日本語 文法",
         "grammar-theme-fr": "Français Grammaire · 主題", "grammar-theme-de": "Deutsch Grammatik · 主題",
         "grammar-theme-ja": "日本語 文法 · 主題"][id] ?? title
    }
    var languageName: String { ["fr": "法語", "de": "德語", "ja": "日語"][language] ?? language }
    var locale: String { ["fr": "fr-FR", "de": "de-DE", "ja": "ja-JP"][language] ?? language }

    init(id: String, title: String, language: String, categories: [StudyCategory], words: [StudyWord],
         kind: StudyDictionaryKind = .vocabulary, grammarMode: StudyGrammarMode = .standard) {
        self.id = id; self.title = title; self.language = language
        self.categories = categories; self.words = words; self.kind = kind
        self.grammarMode = kind == .grammar ? grammarMode : .standard
    }

    private enum CodingKeys: String, CodingKey { case id, title, language, categories, words, kind, grammarMode }

    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        let kind = try values.contains(.kind) ? values.decode(StudyDictionaryKind.self, forKey: .kind) : .vocabulary
        let grammarMode = try values.contains(.grammarMode) ? values.decode(StudyGrammarMode.self, forKey: .grammarMode) : .standard
        guard kind == .grammar || grammarMode == .standard else {
            throw StudyDataError("主題背誦書籍須使用 grammar 類型。")
        }
        self.init(id: try values.decode(String.self, forKey: .id),
                  title: try values.decode(String.self, forKey: .title),
                  language: try values.decode(String.self, forKey: .language),
                  categories: try values.decode([StudyCategory].self, forKey: .categories),
                  words: try values.decode([StudyWord].self, forKey: .words),
                  kind: kind, grammarMode: grammarMode)
    }
    static let empty = StudyDictionary(id: "fr", title: "詞庫尚未載入", language: "fr", categories: [], words: [])
}

struct StudyDataError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
    init(_ message: String) { self.message = message }
}

/// Validates complete input before StudyStore commits any changes.
enum StudyImport {
    static let languages = Set(["fr", "de", "ja"])
    static let meaningLanguages = Set(["zh-Hant", "zh-Hans", "en", "fr", "de", "ja"])
    static let unsafeKeys = Set(["__proto__", "constructor", "prototype"])

    static func detailText(_ value: Any?, field: String, limit: Int, required: Bool = true) throws -> String {
        if !required && (value == nil || value is NSNull) { return "" }
        let result = try text(value, field: field, limit: limit, required: required)
        guard result.utf16.count <= limit else { throw StudyDataError("\(field)最多 \(limit) 字。") }
        return result
    }

    static func details(_ source: [String: Any]) throws -> (example: String, examples: [StudyExample], pattern: String, explanation: String) {
        guard !source.keys.contains(where: unsafeKeys.contains) else { throw StudyDataError("詞條包含不支援的欄位。") }
        let legacy = try detailText(source["example"], field: "例句", limit: 2000, required: false)
        let supplied: [Any]
        if let value = source["examples"] {
            guard let array = value as? [Any], array.count <= 20 else { throw StudyDataError("examples 須為最多 20 個例句的陣列。") }
            supplied = array
        } else { supplied = [] }
        let examples = try supplied.map { value -> StudyExample in
            if let sentence = value as? String {
                return StudyExample(text: try detailText(sentence, field: "例句", limit: 2000))
            }
            guard let entry = value as? [String: Any], !entry.keys.contains(where: unsafeKeys.contains) else {
                throw StudyDataError("例句格式不正確。")
            }
            let sentence = try detailText(entry["text"], field: "例句", limit: 2000)
            var translations: [String: String] = [:]
            if let raw = entry["translations"] {
                guard let values = raw as? [String: Any], !values.keys.contains(where: unsafeKeys.contains) else {
                    throw StudyDataError("例句翻譯格式不正確。")
                }
                for (language, value) in values where meaningLanguages.contains(language) {
                    let translation = try detailText(value, field: "例句翻譯", limit: 2000, required: false)
                    if !translation.isEmpty { translations[language] = translation }
                }
            }
            return StudyExample(text: sentence, translations: translations)
        }
        let merged = StudyWord.mergeExamples(legacy: legacy, supplied: examples)
        guard merged.count <= 20 else { throw StudyDataError("每個詞條最多 20 個例句（包含 example 欄位）。") }
        let pattern = try detailText(source["pattern"], field: "接續方式", limit: 2000, required: false)
        let explanation = try detailText(source["explanation"], field: "用法說明", limit: 6000, required: false)
        return (merged.first?.text ?? "", merged, pattern,
                explanation.applyingTransform(StringTransform("Simplified-Traditional"), reverse: false) ?? explanation)
    }

    static func object(_ data: Data, limit: Int) throws -> [String: Any] {
        guard data.count <= limit else { throw StudyDataError("檔案過大，請選擇較小的 JSON 檔案。") }
        guard let result = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw StudyDataError("JSON 須為包含詞庫或備份欄位的物件。")
        }
        return result
    }

    static func text(_ value: Any?, field: String, limit: Int, required: Bool = true) throws -> String {
        guard let value = value as? String else {
            if value == nil && !required { return "" }
            throw StudyDataError("\(field)須為文字。")
        }
        let clean = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard clean.count <= limit, !required || !clean.isEmpty else {
            throw StudyDataError("\(field)不可留白且最多 \(limit) 字。")
        }
        return clean
    }

    static func identifier(_ value: Any?, field: String) throws -> String {
        let raw: String
        if let value = value as? String { raw = value }
        else if let value = value as? NSNumber, CFGetTypeID(value) != CFBooleanGetTypeID(), value.doubleValue.rounded() == value.doubleValue { raw = value.stringValue }
        else { throw StudyDataError("\(field)代碼格式不正確。") }
        let clean = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard clean.range(of: "^[\\p{L}\\p{N}_.-]{1,110}$", options: .regularExpression) != nil,
              !["__proto__", "constructor", "prototype", "all"].contains(clean) else {
            throw StudyDataError("\(field)代碼格式不正確。")
        }
        return clean
    }

    static func dictionary(_ source: [String: Any], id: String, fallbackLanguage: String? = nil,
                           fallbackTitle: String? = nil, fallbackKind: StudyDictionaryKind = .vocabulary,
                           fallbackGrammarMode: StudyGrammarMode = .standard) throws -> StudyDictionary {
        guard id.range(of: "^dict-[a-z0-9][a-z0-9-]{0,79}$", options: .regularExpression) != nil else {
            throw StudyDataError("自訂辭典 ID 格式不正確。")
        }
        let kind: StudyDictionaryKind
        if let raw = source["kind"] {
            guard let name = raw as? String, let supplied = StudyDictionaryKind(rawValue: name) else {
                throw StudyDataError("背誦類型須為 vocabulary（詞彙）或 grammar（語法）。")
            }
            kind = supplied
        } else { kind = fallbackKind }
        let grammarMode: StudyGrammarMode
        if let raw = source["grammarMode"] {
            guard let name = raw as? String, let supplied = StudyGrammarMode(rawValue: name),
                  kind == .grammar || supplied == .standard else {
                throw StudyDataError("語法書類型須為 standard（一般）或 thematic（主題）；主題書須使用 grammar 類型。")
            }
            grammarMode = supplied
        } else { grammarMode = kind == .grammar ? fallbackGrammarMode : .standard }
        let language = source["language"] as? String ?? fallbackLanguage ?? ""
        guard languages.contains(language) else { throw StudyDataError("辭典語言須為 fr、de 或 ja。") }
        let title = try text(source["title"] ?? source["name"] ?? fallbackTitle ?? "匯入辭典", field: "辭典名稱", limit: 80)
        guard let rawWords = source["words"] as? [[String: Any]], !rawWords.isEmpty, rawWords.count <= 5000 else {
            throw StudyDataError("辭典須包含 1–5,000 個單字。")
        }
        var categories: [StudyCategory] = []
        var parentIDs = Set<String>(), childIDs = Set<String>()
        let declared = source["categories"] != nil
        if declared {
            guard let supplied = source["categories"] as? [[String: Any]], !supplied.isEmpty, supplied.count <= 100 else {
                throw StudyDataError("分類須包含 1–100 個一級單元。")
            }
            for parent in supplied {
                let parentID = try identifier(parent["id"], field: "一級單元")
                guard parentIDs.insert(parentID).inserted else { throw StudyDataError("一級單元代碼重複。") }
                let name = try text(parent["name"] ?? "單元 \(parentID)", field: "單元名稱", limit: 80)
                let children: [[String: Any]]
                if let value = parent["subcategories"] {
                    guard let suppliedChildren = value as? [[String: Any]], !suppliedChildren.isEmpty else { throw StudyDataError("每個一級單元須包含二級單元。") }
                    children = suppliedChildren
                } else { children = [["id": "\(parentID).01", "name": kind == .grammar ? "一般語法" : "一般詞彙"]] }
                let subs = try children.map { child -> StudySubcategory in
                    let childID = try identifier(child["id"], field: "二級單元")
                    guard childIDs.insert(childID).inserted, childIDs.count <= 300 else { throw StudyDataError("二級單元重複或超過 300 個。") }
                    return StudySubcategory(id: childID, name: try text(child["name"] ?? "子單元 \(childID)", field: "子單元名稱", limit: 80))
                }
                categories.append(StudyCategory(id: parentID, name: name, subcategories: subs))
            }
        }
        var seen = Set<String>(), inferred: [String: [String]] = [:], inferredOrder: [String] = []
        var owners: [String: String] = [:]
        let words = try rawWords.enumerated().map { index, raw -> StudyWord in
            let term = try text(raw["term"] ?? raw["word"] ?? raw["french"], field: "第 \(index + 1) 詞", limit: 180)
            let wordID = try identifier(raw["id"] ?? "word-\(index + 1)", field: "單字")
            guard seen.insert(wordID).inserted else { throw StudyDataError("單字 ID 重複。") }
            var meanings: [String: String] = [:]
            if let value = raw["meanings"] {
                guard let supplied = value as? [String: Any] else { throw StudyDataError("釋義格式不正確。") }
                for (code, value) in supplied where meaningLanguages.contains(code) {
                    let clean = try text(value, field: "釋義", limit: 1600, required: false)
                    if !clean.isEmpty { meanings[code] = clean }
                }
            }
            if let value = raw["chinese"] { meanings["zh-Hans"] = try text(value, field: "中文釋義", limit: 1600) }
            if let value = raw["meaning"], meanings["zh-Hant"] == nil { meanings["zh-Hant"] = try text(value, field: "釋義", limit: 1600) }
            if let hans = meanings["zh-Hans"], meanings["zh-Hant"] == nil { meanings["zh-Hant"] = hans.applyingTransform(StringTransform("Simplified-Traditional"), reverse: false) ?? hans }
            if let hant = meanings["zh-Hant"], meanings["zh-Hans"] == nil { meanings["zh-Hans"] = hant.applyingTransform(StringTransform("Traditional-Simplified"), reverse: false) ?? hant }
            guard let meaning = meanings["zh-Hant"] ?? meanings.sorted(by: { $0.key < $1.key }).first?.value else { throw StudyDataError("第 \(index + 1) 詞缺少釋義。") }
            let suppliedSub = try raw["subcategory"].map { try identifier($0, field: "二級單元") }
            let parent = try raw["category"].map { try identifier($0, field: "一級單元") }
                ?? categories.first(where: { $0.subcategories.contains(where: { $0.id == suppliedSub }) })?.id
                ?? (declared ? categories.first?.id : suppliedSub?.components(separatedBy: ".").first) ?? "1"
            let sub = suppliedSub ?? categories.first(where: { $0.id == parent })?.subcategories.first?.id ?? "\(parent).01"
            if declared {
                guard categories.contains(where: { $0.id == parent && $0.subcategories.contains(where: { $0.id == sub }) }) else { throw StudyDataError("第 \(index + 1) 詞的分類未在 categories 中定義。") }
            } else {
                guard owners[sub] == nil || owners[sub] == parent else { throw StudyDataError("同一二級單元不可屬於不同一級單元。") }
                owners[sub] = parent
                if inferred[parent] == nil { inferred[parent] = []; inferredOrder.append(parent) }
                if !inferred[parent, default: []].contains(sub) { inferred[parent, default: []].append(sub) }
                guard inferred.count <= 100, owners.count <= 300 else { throw StudyDataError("分類超過 100 個一級或 300 個二級單元。") }
            }
            let details = try details(raw)
            return StudyWord(id: wordID, term: term, meaning: meaning,
                example: details.example,
                category: parent, subcategory: sub, language: language, meanings: meanings,
                part: raw["part"] as? String, examples: details.examples,
                pattern: details.pattern, explanation: details.explanation)
        }
        if !declared {
            categories = inferredOrder.map { parent in StudyCategory(id: parent, name: parent == "1" ? (kind == .grammar ? "一般語法" : "一般詞彙") : "單元 \(parent)", subcategories: inferred[parent, default: []].map { StudySubcategory(id: $0, name: "子單元 \($0)") }) }
        }
        return StudyDictionary(id: id, title: title, language: language, categories: categories, words: words, kind: kind, grammarMode: grammarMode)
    }
}
