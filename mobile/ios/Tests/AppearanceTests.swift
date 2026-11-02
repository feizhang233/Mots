import Foundation

@main
struct AppearanceTests {
    @MainActor static func main() throws {
        let word = StudyWord(id: "hello", term: "bonjour", meaning: "你好", category: "1", subcategory: "1.1", language: "fr")
        let catalog = [StudyDictionary(id: "fr", title: "Français Mots", language: "fr", categories: [], words: [word])]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-appearance-\(UUID().uuidString)")
        let url = directory.appendingPathComponent("state.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let store = StudyStore(catalog: catalog, persistenceURL: url)
        precondition(store.appearance == .system, "Existing installs retain system appearance")
        for appearance in StudyAppearance.allCases {
            store.appearance = appearance
            let restored = StudyStore(catalog: catalog, persistenceURL: url)
            precondition(restored.appearance == appearance && restored.storageError == nil, "Every appearance survives relaunch")
        }
        store.appearance = .dark
        let backup = try store.exportBackup()
        let imported = StudyStore(catalog: catalog, persistenceURL: nil)
        _ = try imported.importBackup(backup)
        precondition(imported.appearance == .dark, "Appearance travels in explicit backups")
        var object = try JSONSerialization.jsonObject(with: backup) as! [String: Any]
        var settings = object["settings"] as! [String: Any]
        settings.removeValue(forKey: "appearance")
        object["settings"] = settings
        _ = try imported.importBackup(JSONSerialization.data(withJSONObject: object))
        precondition(imported.appearance == .dark, "Older backups preserve the current preference")
        settings["appearance"] = "unknown"
        object["settings"] = settings
        _ = try imported.importBackup(JSONSerialization.data(withJSONObject: object))
        precondition(imported.appearance == .dark, "Unsupported imported values preserve the current preference")
        var saved = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as! [String: Any]
        saved.removeValue(forKey: "appearance")
        try JSONSerialization.data(withJSONObject: saved).write(to: url)
        let legacy = StudyStore(catalog: catalog, persistenceURL: url)
        precondition(legacy.appearance == .system && legacy.storageError == nil, "Legacy state remains readable")
        saved["appearance"] = "unknown"
        try JSONSerialization.data(withJSONObject: saved).write(to: url)
        let future = StudyStore(catalog: catalog, persistenceURL: url)
        precondition(future.appearance == .system && future.storageError == nil, "Unknown saved appearance falls back safely")
        print("PASS: appearance system/light/dark; saved-state persistence; backup compatibility; unknown-value fallback.")
    }
}
