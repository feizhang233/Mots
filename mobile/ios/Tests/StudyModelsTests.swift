import Foundation

@main
struct StudyModelsTests {
    static func data(_ value: Any) throws -> Data {
        try JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
    }

    static func rejects(_ body: () throws -> Void) {
        do { try body(); preconditionFailure("Malformed study details were accepted") } catch {}
    }

    static func main() throws {
        let legacyWord: [String: Any] = [
            "id": "same", "term": "mot", "meaning": "詞", "meanings": ["zh-Hant": "詞"],
            "example": "Un mot.", "category": "1", "subcategory": "1.01", "language": "fr"
        ]
        let legacyDictionary: [String: Any] = [
            "id": "fr", "title": "法語原書", "language": "fr", "categories": [], "words": [legacyWord]
        ]
        let old = try JSONDecoder().decode(StudyDictionary.self, from: data(legacyDictionary))
        precondition(old.kind == .vocabulary && !old.isGrammar && old.isBuiltIn && old.grammarMode == .standard)
        precondition(old.entryUnit == "詞" && old.displayTitle == "Français Mots")
        precondition(old.words[0].exampleTexts == ["Un mot."])
        precondition(old.words[0].pattern.isEmpty && old.words[0].explanation.isEmpty)
        let oldRoundTrip = try JSONDecoder().decode(StudyDictionary.self, from: JSONEncoder().encode(old))
        precondition(oldRoundTrip == old, "Old catalogs decode, encode and decode without losing data")

        let aliases = ["fr": "Français Mots", "de": "Deutsch Wörter", "ja": "日本語 語彙",
                       "grammar-fr": "Français Grammaire", "grammar-de": "Deutsch Grammatik", "grammar-ja": "日本語 文法",
                       "grammar-theme-fr": "Français Grammaire · 主題", "grammar-theme-de": "Deutsch Grammatik · 主題", "grammar-theme-ja": "日本語 文法 · 主題"]
        for (id, title) in aliases {
            let grammar = id.hasPrefix("grammar-")
            let dictionary = StudyDictionary(id: id, title: "Source title", language: "fr", categories: [], words: [], kind: grammar ? .grammar : .vocabulary,
                grammarMode: id.hasPrefix("grammar-theme-") ? .thematic : .standard)
            precondition(dictionary.isBuiltIn && dictionary.displayTitle == title)
            precondition(dictionary.isGrammar == grammar && dictionary.entryUnit == (grammar ? "項" : "詞"))
            precondition(dictionary.isThematicGrammar == id.hasPrefix("grammar-theme-"))
        }
        let custom = StudyDictionary(id: "dict-personal", title: "個人語法", language: "fr", categories: [], words: [], kind: .grammar)
        precondition(!custom.isBuiltIn && custom.isGrammar && custom.displayTitle == "個人語法")

        let richWord: [String: Any] = [
            "id": "same", "term": "ne … plus", "meanings": ["zh-Hant": "不再"],
            "example": "Je ne travaille plus ici.",
            "examples": [
                ["text": "Je ne travaille plus ici.", "translations": ["zh-Hant": "我不再在這裡工作。"]],
                "Il ne pleut plus.",
                ["text": "Il ne pleut plus.", "translations": ["en": "It is no longer raining."]],
                ["text": "Nous ne prenons plus le bus.", "translations": ["zh-Hant": "我們不再搭公車。"]]
            ],
            "pattern": "ne + verbe + plus", "explanation": "表示先前的狀態已經停止。"
        ]
        var source: [String: Any] = ["title": "法語語法", "language": "fr", "kind": "grammar", "words": [richWord]]
        let imported = try StudyImport.dictionary(source, id: "dict-rich")
        let word = imported.words[0]
        precondition(imported.kind == .grammar && imported.isGrammar && !imported.isBuiltIn)
        precondition(word.exampleTexts == ["Je ne travaille plus ici.", "Il ne pleut plus.", "Nous ne prenons plus le bus."])
        precondition(word.examples[0].translations["zh-Hant"] == "我不再在這裡工作。")
        precondition(word.examples[1].translations["en"] == "It is no longer raining.")
        precondition(word.pattern == "ne + verbe + plus" && word.explanation == "表示先前的狀態已經停止。")
        let roundTrip = try JSONDecoder().decode(StudyDictionary.self, from: JSONEncoder().encode(imported))
        precondition(roundTrip == imported, "Rich content and kind survive native persistence")
        source.removeValue(forKey: "kind")
        let defaultKind = try StudyImport.dictionary(source, id: "dict-default")
        let fallbackKind = try StudyImport.dictionary(source, id: "dict-fallback", fallbackKind: .grammar)
        precondition(defaultKind.kind == .vocabulary && fallbackKind.kind == .grammar)
        source["kind"] = "vocabulary"
        let explicitKind = try StudyImport.dictionary(source, id: "dict-explicit", fallbackKind: .grammar)
        precondition(explicitKind.kind == .vocabulary)
        source["kind"] = "grammar"
        source["grammarMode"] = "thematic"
        let themed = try StudyImport.dictionary(source, id: "dict-themed")
        precondition(themed.isThematicGrammar)
        let themedRoundTrip = try JSONDecoder().decode(StudyDictionary.self, from: JSONEncoder().encode(themed))
        precondition(themedRoundTrip == themed)
        source.removeValue(forKey: "grammarMode")
        let themeFallback = try StudyImport.dictionary(source, id: "dict-theme-fallback", fallbackGrammarMode: .thematic)
        let ordinaryLegacy = try StudyImport.dictionary(source, id: "dict-ordinary")
        precondition(themeFallback.isThematicGrammar && !ordinaryLegacy.isThematicGrammar)
        source["kind"] = "vocabulary"
        let explicitVocabulary = try StudyImport.dictionary(source, id: "dict-vocabulary", fallbackKind: .grammar, fallbackGrammarMode: .thematic)
        precondition(!explicitVocabulary.isThematicGrammar && explicitVocabulary.grammarMode == .standard)
        for mode: Any in ["unknown", 42, NSNull()] {
            rejects { _ = try StudyImport.dictionary(["language": "fr", "kind": "grammar", "grammarMode": mode, "words": [richWord]], id: "dict-invalid") }
        }
        rejects { _ = try StudyImport.dictionary(["language": "fr", "kind": "vocabulary", "grammarMode": "thematic", "words": [richWord]], id: "dict-invalid") }

        let inferred = try StudyImport.details(["examples": [" Première phrase. ", "Première phrase."]])
        precondition(inferred.example == "Première phrase." && inferred.examples.count == 1)
        let empty = try StudyImport.details([:])
        precondition(empty.examples.isEmpty && empty.pattern.isEmpty && empty.explanation.isEmpty)
        let compact = StudyWord(id: "minimal", term: "mot", meaning: "詞", category: "1", subcategory: "1.01", language: "fr")
        precondition(compact.exampleTexts.isEmpty)
        let normalized = StudyWord(id: "duplicate", term: "mot", meaning: "詞", example: " Phrase. ", category: "1", subcategory: "1.01", language: "fr", examples: [StudyExample(text: "Phrase.", translations: ["en": "Sentence."])])
        precondition(normalized.exampleTexts == ["Phrase."] && normalized.examples[0].translations["en"] == "Sentence.")

        let invalid: [[String: Any]] = [
            ["examples": NSNull()], ["examples": "wrong"], ["examples": [""]], ["examples": [42]],
            ["examples": [["text": "Valid", "translations": "wrong"]]],
            ["examples": [["text": "Valid", "translations": NSNull()]]],
            ["examples": [["text": "Valid", "translations": ["zh-Hant": 42]]]],
            ["examples": [["text": "Valid", "translations": ["__proto__": "unsafe"]]]],
            ["examples": [String(repeating: "x", count: 2001)]],
            ["examples": [String(repeating: "😀", count: 1001)]],
            ["examples": (0...20).map { "Example \($0)" }],
            ["example": "Legacy", "examples": (0..<20).map { "Example \($0)" }],
            ["pattern": 42], ["pattern": String(repeating: "x", count: 2001)],
            ["explanation": ["wrong"]], ["explanation": String(repeating: "x", count: 6001)]
        ]
        for replacement in invalid {
            var bad = richWord
            for (key, value) in replacement { bad[key] = value }
            rejects { _ = try StudyImport.dictionary(["title": "Invalid", "language": "fr", "words": [bad]], id: "dict-invalid") }
        }
        for kind: Any in ["unknown", 42, NSNull()] {
            rejects { _ = try StudyImport.dictionary(["title": "Invalid", "language": "fr", "kind": kind, "words": [richWord]], id: "dict-invalid") }
        }
        var malformedNative = legacyDictionary
        malformedNative["kind"] = "unknown"
        rejects { _ = try JSONDecoder().decode(StudyDictionary.self, from: data(malformedNative)) }
        malformedNative["kind"] = NSNull()
        rejects { _ = try JSONDecoder().decode(StudyDictionary.self, from: data(malformedNative)) }
        var malformedWord = legacyWord
        malformedWord["examples"] = NSNull()
        rejects { _ = try JSONDecoder().decode(StudyWord.self, from: data(malformedWord)) }
        malformedWord["examples"] = [["text": "Valid", "translations": NSNull()]]
        rejects { _ = try JSONDecoder().decode(StudyWord.self, from: data(malformedWord)) }

        print("Native study models: legacy decoding, grammar identity, rich examples and validation passed.")
    }
}
