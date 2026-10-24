import Foundation

private final class MemoryCredentials: ProgressSyncCredentials {
    var value: String?
    func read() throws -> String? { value }
    func write(_ code: String?) throws { value = code }
}

private final class SyncURLProtocol: URLProtocol, @unchecked Sendable {
    static var handler: ((URLRequest, @escaping (Int, Data) -> Void) -> Void)?
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        Self.handler?(request) { [self] status, data in
            let response = HTTPURLResponse(url: request.url!, statusCode: status, httpVersion: "HTTP/1.1", headerFields: ["Content-Type": "application/json"])!
            client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
            client?.urlProtocol(self, didLoad: data)
            client?.urlProtocolDidFinishLoading(self)
        }
    }
    override func stopLoading() {}
}

@main struct ProgressSyncTests {
    static let a = StudyWord(id: "a", term: "alpha", meaning: "甲", category: "1", subcategory: "1.01", language: "fr")
    static let b = StudyWord(id: "b", term: "beta", meaning: "乙", category: "1", subcategory: "1.01", language: "fr")
    static let c = StudyWord(id: "c", term: "gamma", meaning: "丙", category: "1", subcategory: "1.01", language: "fr")
    static let dictionary = StudyDictionary(id: "fr", title: "Test", language: "fr", categories: [
        StudyCategory(id: "1", name: "Unit", subcategories: [StudySubcategory(id: "1.01", name: "Lesson")])], words: [a, b, c])
    static let remoteDevice = String(repeating: "f", count: 32)
    static func record(_ word: String, _ level: Int, _ clock: Int64, dictionaryID: String = "fr", device: String = remoteDevice) -> ProgressSyncRecord {
        ProgressSyncRecord(dictionaryID: dictionaryID, wordID: word, level: level, clock: clock, deviceID: device)
    }
    static func requestBody(_ request: URLRequest) -> Data {
        if let body = request.httpBody { return body }
        guard let stream = request.httpBodyStream else { preconditionFailure("Missing request body") }
        stream.open(); defer { stream.close() }
        var data = Data(), buffer = [UInt8](repeating: 0, count: 4096)
        while stream.hasBytesAvailable {
            let count = stream.read(&buffer, maxLength: buffer.count)
            if count <= 0 { break }; data.append(contentsOf: buffer.prefix(count))
        }
        return data
    }
    static func data(_ value: Any) throws -> Data { try JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]) }
    static func envelope(_ records: [ProgressSyncRecord]) throws -> Data {
        try data(["version": 1, "records": try JSONSerialization.jsonObject(with: JSONEncoder().encode(records))])
    }
    @MainActor static func waitFor(_ message: String, _ condition: () -> Bool) async {
        for _ in 0..<250 {
            if condition() { return }
            try? await Task.sleep(nanoseconds: 20_000_000)
        }
        preconditionFailure(message)
    }
    @MainActor static func main() async throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("mots-sync-tests-\(UUID().uuidString)")
        defer { try? FileManager.default.removeItem(at: directory) }
        let url = directory.appendingPathComponent("state.json")
        let original = StudyStore(catalog: [dictionary], persistenceURL: url)
        original.listMode = true; original.rate(a, level: 2)
        // Genuine old saved-state migration: the optional sync field did not exist before pairing.
        var oldState = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as! [String: Any]
        oldState.removeValue(forKey: "syncMetadata")
        try data(oldState).write(to: url)
        let legacy = StudyStore(catalog: [dictionary], persistenceURL: url)
        precondition(legacy.syncMetadata == nil && legacy.rating(a) == 2)
        let seeds = try legacy.syncSnapshot()
        precondition(seeds.count == 1 && seeds[0].clock == 0 && seeds[0].deviceID.isEmpty && seeds[0].level == 2)
        let seedTie = try ProgressSyncRecord.canonical([record("a", 1, 0, device: ""), record("a", 3, 0, device: "")])
        precondition(seedTie.first?.level == 3)
        let editTie = try ProgressSyncRecord.canonical([record("a", 3, 5, device: String(repeating: "a", count: 32)), record("a", 0, 5)])
        precondition(editTie.first?.level == 0,
            "Ties use ASCII device ID before familiarity, including explicit zero tombstones")

        legacy.randomOrder = true; legacy.selectWord(b); legacy.revealed = true
        let prior = legacy.filteredWords.map(\.id)
        try legacy.mergeSyncSnapshot([record("a", 0, 40), record("future", 3, 60, dictionaryID: "unknown")])
        precondition(legacy.rating(a) == 0 && legacy.currentWord?.id == b.id && legacy.revealed && legacy.filteredWords.map(\.id) == prior,
            "Remote changes preserve selected page, revealed answer and random order")
        precondition(legacy.syncMetadata!.records.contains(where: { $0.dictionaryID == "unknown" }))
        legacy.rate(b, level: 1)
        precondition(legacy.syncMetadata!.counter == 61 && legacy.syncMetadata!.records.first(where: { $0.wordID == "b" })!.clock == 61,
            "A local edit follows every observed clock, including unknown content")
        let restored = StudyStore(catalog: [dictionary], persistenceURL: url)
        precondition(restored.rating(a) == 0 && restored.rating(b) == 1 && restored.syncMetadata == legacy.syncMetadata,
            "Ratings, unknown records, tombstones and installation identity persist atomically")
        let backup = String(decoding: try legacy.exportBackup(), as: UTF8.self)
        precondition(!backup.contains("deviceID") && !backup.contains("syncMetadata"), "Portable backups contain no sync credentials or installation identity")
        let exactIdentities = try ProgressSyncRecord.canonical([record("é", 1, 1), record("e\u{301}", 3, 2)])
        precondition(exactIdentities.count == 2 && exactIdentities[0].key != exactIdentities[1].key,
            "Canonically equivalent Unicode strings remain distinct wire identifiers")
        let beforeInvalid = legacy.syncMetadata
        do {
            try legacy.mergeSyncSnapshot([record("c", 3, 70), record("__proto__", 3, 80)])
            preconditionFailure("Malformed record must reject the entire snapshot")
        } catch {}
        precondition(legacy.syncMetadata == beforeInvalid && legacy.rating(c) == 0)
        legacy.startReview()
        let reviewIDs = legacy.filteredWords.map(\.id)
        let reviewIndex = legacy.currentIndex
        try legacy.mergeSyncSnapshot([record("c", 3, 90)])
        precondition(legacy.filteredWords.map(\.id) == reviewIDs && legacy.currentIndex == reviewIndex && legacy.reviewRatedCount == 0 && !legacy.completed,
            "Remote mastery does not mutate captured review membership, rating count or completion")
        _ = try legacy.importBackup(data(["app": "mots", "version": 1, "ratings": ["a": 2, "b": 0]]))
        precondition(legacy.rating(a) == 2 && legacy.rating(b) == 0)
        precondition(legacy.syncMetadata!.records.filter { ["a", "b"].contains($0.wordID) }.allSatisfy { $0.clock > 90 && $0.deviceID == legacy.syncMetadata!.deviceID },
            "Validated backup edits receive new local revisions, including imported zero tombstones")
        let beforeBadBackup = legacy.syncMetadata
        do {
            _ = try legacy.importBackup(data(["app": "mots", "version": 3, "progress": ["fr": ["a": 3]],
                "dictionaries": [["id": "dict-invalid", "language": "xx", "words": []]]]))
            preconditionFailure("Invalid backup must reject before any revision is committed")
        } catch {}
        precondition(legacy.syncMetadata == beforeBadBackup && legacy.rating(a) == 2)
        try record(String(repeating: "😀", count: 256), 1, 1).validate()
        for invalid in [record("a", -1, 1), record("a", 1, -1), record("a", 1, 1, device: ""), record("x\u{7f}", 1, 1)] {
            do { try invalid.validate(); preconditionFailure("Invalid sync record accepted") } catch {}
        }
        try record("zero\u{200d}width", 1, 1).validate() // Cf format characters are allowed by the v1 server.
        for malformed in [
            "{\"version\":1.0,\"records\":[]}",
            "{\"version\":1,\"records\":[],\"extra\":1}",
            "{\"version\":1,\"records\":[{\"dictionaryID\":\"fr\",\"wordID\":\"a\",\"level\":true,\"clock\":1,\"deviceID\":\"ffffffffffffffffffffffffffffffff\"}]}",
            "{\"version\":1,\"records\":[{\"dictionaryID\":\"fr\",\"wordID\":\"a\",\"level\":1,\"clock\":1,\"deviceID\":\"ffffffffffffffffffffffffffffffff\",\"extra\":1}]}"
        ] {
            do { _ = try ProgressSyncRecord.decodeEnvelope(Data(malformed.utf8)); preconditionFailure("Malformed wire response accepted") } catch {}
        }
        let filtered = StudyStore(catalog: [dictionary], persistenceURL: nil)
        filtered.hideMastered = true; filtered.selectWord(b)
        try filtered.mergeSyncSnapshot([record("b", 3, 1)])
        precondition(filtered.currentWord?.id == c.id && filtered.filteredWords.map(\.id) == ["a", "c"], "Mastery filtering retains the immediate neighbour without advancing twice")
        let unusable = directory.appendingPathComponent("blocked")
        try Data("file".utf8).write(to: unusable)
        let unsaved = StudyStore(catalog: [dictionary], persistenceURL: unusable.appendingPathComponent("state.json"))
        unsaved.rate(a, level: 1)
        do { _ = try unsaved.syncSnapshot(); preconditionFailure("Unsaved progress must never be uploaded") } catch {}

        // Inject a real URLSession transport: enforce wire names, private auth, race-safe merging and stale-response protection.
        let configuration = URLSessionConfiguration.ephemeral; configuration.protocolClasses = [SyncURLProtocol.self]
        let session = URLSession(configuration: configuration)
        let vault = MemoryCredentials()
        let network = StudyStore(catalog: [dictionary], persistenceURL: directory.appendingPathComponent("network.json"))
        network.listMode = true; network.rate(a, level: 1)
        let controller = ProgressSyncController(store: network, credentials: vault, session: session)
        let code = "mots-" + String(repeating: "A", count: 43)
        var server: [ProgressSyncRecord] = []
        var serverDeletions: [WordDeletionRecord] = []
        var delayNext = false, inFlight = false, reject = false
        var delayDeletion = false, deletionInFlight = false, rejectDeletions = false
        var exchangeCount = 0
        SyncURLProtocol.handler = { request, reply in
            Task { @MainActor in
                precondition(request.url?.scheme == "https" && request.url?.query == nil && request.url?.absoluteString.contains(code) == false)
                if request.url!.lastPathComponent == "create" {
                    precondition(request.value(forHTTPHeaderField: "Authorization") == nil)
                    reply(200, try! data(["version": 1, "code": code])); return
                }
                if request.url!.lastPathComponent == "deletions" {
                    precondition(request.value(forHTTPHeaderField: "Authorization") == "Bearer " + code)
                    let supplied = try! WordDeletionRecord.decodeEnvelope(requestBody(request))
                    serverDeletions = try! WordDeletionRecord.canonical(serverDeletions + supplied)
                    let response = try! data(["version": 1, "records": try! JSONSerialization.jsonObject(with: JSONEncoder().encode(serverDeletions))])
                    if delayDeletion {
                        delayDeletion = false; deletionInFlight = true
                        try? await Task.sleep(nanoseconds: 250_000_000)
                        deletionInFlight = false
                    }
                    if rejectDeletions { reply(200, try! data(["version": true, "records": []])) }
                    else { reply(200, response) }
                    return
                }
                exchangeCount += 1
                precondition(request.value(forHTTPHeaderField: "Authorization") == "Bearer " + code)
                let body = try! JSONSerialization.jsonObject(with: requestBody(request)) as! [String: Any]
                precondition(body["version"] as? Int == 1)
                let supplied = try! JSONDecoder().decode([ProgressSyncRecord].self, from: data(body["records"]!))
                server = try! ProgressSyncRecord.canonical(server + supplied)
                let response = try! envelope(server)
                if delayNext {
                    delayNext = false; inFlight = true
                    try? await Task.sleep(nanoseconds: 250_000_000)
                    inFlight = false
                }
                if reject { reply(200, try! data(["version": true, "records": []])) }
                else { reply(200, response) }
            }
        }
        await controller.create()
        await waitFor("Pairing uploads existing local familiarity") { !controller.busy && controller.status == "已同步" && server.count == 1 }
        precondition(vault.value == code && controller.connected && controller.revealedCode == nil)
        controller.revealCode(); precondition(controller.revealedCode == code); controller.hideCode()
        delayNext = true; controller.requestSync(force: true)
        await waitFor("Expected delayed request") { inFlight }
        network.rate(b, level: 2); controller.localDidChange()
        await waitFor("Local edit made in flight must reach the server") { !controller.busy && server.contains(where: { $0.wordID == "b" && $0.level == 2 }) && controller.status == "已同步" }
        precondition(network.rating(b) == 2 && exchangeCount >= 3)
        // A response generated before a local edit must not overwrite its newer clock.
        server = try ProgressSyncRecord.canonical(server + [record("b", 1, network.syncMetadata!.counter + 1)])
        delayNext = true; controller.requestSync(force: true)
        await waitFor("Expected second delayed request") { inFlight }
        try network.mergeSyncSnapshot([record("c", 2, network.syncMetadata!.counter + 20)])
        network.rate(b, level: 0); controller.localDidChange()
        await waitFor("Current metadata wins over stale request-time data") { !controller.busy && controller.status == "已同步" && server.contains(where: { $0.wordID == "b" && $0.level == 0 }) }
        precondition(network.rating(b) == 0)
        precondition(network.deleteWord(b)); controller.localDidChange()
        await waitFor("Deletion uploads through the independent channel") { !controller.busy && controller.status == "已同步" && serverDeletions.contains(where: { $0.wordID == "b" && $0.deleted }) }
        precondition(network.isDeleted("b") && network.rating(b) == 0)
        delayDeletion = true; controller.requestSync(force: true)
        await waitFor("Expected delayed deletion response") { deletionInFlight }
        precondition(network.restoreWord("b")); controller.localDidChange()
        await waitFor("A restoration during deletion exchange survives its stale response") { !controller.busy && controller.status == "已同步" && serverDeletions.contains(where: { $0.wordID == "b" && !$0.deleted }) }
        precondition(!network.isDeleted("b"))
        serverDeletions = try WordDeletionRecord.canonical(serverDeletions + [
            WordDeletionRecord(dictionaryID: "fr", wordID: "a", deleted: true, clock: network.deletionMetadata!.counter + 50, deviceID: remoteDevice)])
        delayDeletion = true; controller.requestSync(force: true)
        await waitFor("Expected remote deletion exchange") { deletionInFlight }
        precondition(network.deleteWord(c)); controller.localDidChange()
        await waitFor("Different-word deletion made in flight is merged and uploaded") { !controller.busy && controller.status == "已同步" && network.isDeleted("a") && serverDeletions.contains(where: { $0.wordID == "c" && $0.deleted }) }
        precondition(network.rating(a) == 1 && network.rating(c) == 2, "Visibility never changes familiarity")
        rejectDeletions = true; controller.requestSync(force: true)
        await waitFor("A failed deletion channel cannot claim full synchronization") { !controller.busy && controller.status != "已同步" }
        precondition(controller.connected && network.isDeleted("a") && network.isDeleted("c"))
        rejectDeletions = false
        reject = true; controller.requestSync(force: true)
        await waitFor("A boolean protocol version must reject atomically") { !controller.busy && controller.status != "已同步" }
        precondition(controller.connected && network.rating(a) == 1)
        reject = false
        server = try ProgressSyncRecord.canonical(server + [record("a", 3, network.syncMetadata!.counter + 100)])
        delayNext = true; controller.requestSync(force: true)
        await waitFor("Expected disconnect race") { inFlight }
        controller.disconnect()
        await waitFor("Disconnected request settles") { !controller.busy }
        precondition(!controller.connected && vault.value == nil && network.rating(a) == 1 && controller.revealedCode == nil,
            "Disconnect invalidates in-flight responses while retaining local progress")
        SyncURLProtocol.handler = { request, reply in reply(401, Data("{}".utf8)) }
        await controller.join(code)
        precondition(!controller.connected && vault.value == nil && network.rating(a) == 1, "Join validates remotely before committing credentials")
        var joinReads = [String]()
        SyncURLProtocol.handler = { request, reply in
            Task { @MainActor in
                joinReads.append(request.url!.lastPathComponent)
                if request.url!.lastPathComponent == "deletions" { reply(401, Data("{}".utf8)) }
                else { reply(200, try! envelope([])) }
            }
        }
        await controller.join(code)
        precondition(joinReads == ["exchange", "deletions"] && !controller.connected && vault.value == nil,
            "Pairing commits no credentials until both channels validate")
        controller.setActive(false); session.invalidateAndCancel()
        print("PASS: paired sync protocol validation; legacy seeding; deterministic ties; zero tombstones; Lamport counters; unknown-record retention; atomic persistence; review/random/page preservation; mastery membership; persistence failure; HTTPS private auth; create/join; in-flight local changes; stale response/disconnect; invalid envelopes; independent deletion/restore transport; two-channel pairing; in-flight deletion edits; no partial-sync success.")
    }
}
