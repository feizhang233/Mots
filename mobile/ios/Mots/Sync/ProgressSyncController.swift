import Foundation
import CoreFoundation
import Observation
import Network

/// A dedicated session refuses redirects so a pairing credential never reaches another origin.
private final class ProgressSyncSessionDelegate: NSObject, URLSessionTaskDelegate, @unchecked Sendable {
    func urlSession(_ session: URLSession, task: URLSessionTask, willPerformHTTPRedirection response: HTTPURLResponse,
                    newRequest request: URLRequest, completionHandler: @escaping (URLRequest?) -> Void) { completionHandler(nil) }
}

@MainActor @Observable
final class ProgressSyncController {
    private(set) var connected = false
    private(set) var busy = false
    private(set) var status = "尚未配對"
    private(set) var revealedCode: String?
    private(set) var catalogStatus = "詞庫更新待檢查"
    private(set) var catalogBusy = false
    @ObservationIgnored private weak var store: StudyStore?
    @ObservationIgnored private let credentials: any ProgressSyncCredentials
    @ObservationIgnored private let session: URLSession
    @ObservationIgnored private let baseURL: URL
    @ObservationIgnored private var code: String?
    @ObservationIgnored private var generation = 0
    @ObservationIgnored private var active = false
    @ObservationIgnored private var requested = false
    @ObservationIgnored private var needsUpload = true
    @ObservationIgnored private var debounce: Task<Void, Never>?
    @ObservationIgnored private var polling: Task<Void, Never>?
    @ObservationIgnored private var retry: Task<Void, Never>?
    @ObservationIgnored private var retrySeconds: UInt64 = 2
    @ObservationIgnored private var monitor: NWPathMonitor?
    @ObservationIgnored private let catalogUpdatesEnabled:Bool
    @ObservationIgnored private var catalogTask:Task<Bool,Never>?
    @ObservationIgnored private var lastCatalogCheck:Date?
    @ObservationIgnored private var catalogFailed=false
    @ObservationIgnored private var forceCatalogCheck=false
    @ObservationIgnored private var acknowledgedContent:[ContentSyncRecord]=[]
    @ObservationIgnored private var contentDigest:String?

    init(store: StudyStore, credentials: any ProgressSyncCredentials = KeychainProgressSyncCredentials(),
         session: URLSession? = nil, baseURL: URL = URL(string: "https://mots.feizhang233.com/api/sync")!,catalogUpdatesEnabled:Bool? = nil) {
        self.store = store; self.credentials = credentials; self.baseURL = baseURL
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 20; configuration.timeoutIntervalForResource = 30
        configuration.httpShouldSetCookies = false; configuration.urlCache = nil
        self.session = session ?? URLSession(configuration: configuration, delegate: ProgressSyncSessionDelegate(), delegateQueue: nil)
        self.catalogUpdatesEnabled=catalogUpdatesEnabled ?? (session == nil)
        do {
            if let saved = try credentials.read() {
                guard Self.validCode(saved) else { throw ProgressSyncError.invalidCode }
                code = saved; connected = true; status = "等待同步"
            }
        } catch { status = error.localizedDescription }
    }
    static func validCode(_ value: String) -> Bool {
        value.hasPrefix("mots-") && value.utf8.count == 48 && value.dropFirst(5).utf8.allSatisfy {
            (65...90).contains($0) || (97...122).contains($0) || (48...57).contains($0) || $0 == 45 || $0 == 95
        }
    }
    func setActive(_ value: Bool) {
        active = value; polling?.cancel(); polling = nil
        if value {
            Task { [weak self] in _ = await self?.refreshCatalog() }
            if monitor == nil {
                let watcher = NWPathMonitor()
                watcher.pathUpdateHandler = { [weak self] path in
                    if path.status == .satisfied { Task { @MainActor [weak self] in
                        guard let self, self.active else { return }; self.requestSync(force: true)
                    } }
                }
                watcher.start(queue: DispatchQueue(label: "com.feizhang.mots.sync-path")); monitor = watcher
            }
            requestSync(force: true)
            polling = Task { [weak self] in
                while !Task.isCancelled {
                    try? await Task.sleep(nanoseconds: 5_000_000_000)
                    guard !Task.isCancelled, let self else { return }; self.requestSync()
                }
            }
        } else { debounce?.cancel(); retry?.cancel(); hideCode() }
    }
    func localDidChange() {
        needsUpload = true
        guard connected else { return }
        status = "有資料等待同步"
        debounce?.cancel()
        debounce = Task { [weak self] in
            try? await Task.sleep(nanoseconds: 400_000_000)
            guard !Task.isCancelled else { return }; self?.requestSync(force: true)
        }
    }
    func revealCode() { revealedCode = code }
    func hideCode() { revealedCode = nil }
    func copyCode() -> String? { code }

    func create() async { await pair(existingCode: nil) }
    func join(_ value: String) async {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        guard Self.validCode(trimmed) else { status = ProgressSyncError.invalidCode.localizedDescription; return }
        await pair(existingCode: trimmed)
    }
    private func pair(existingCode: String?) async {
        guard !busy, let store else { return }
        retry?.cancel(); retry = nil
        busy = true; status = "正在配對…"
        let token = generation
        defer { busy = false; if requested && connected { requestSync() } }
        do {
            // Persist local seed before any outbound request. Credentials never enter this state file.
            _ = try store.syncSnapshot()
            _ = try store.deletionSnapshot()
            _ = try store.memorySnapshot()
            _ = try store.contentSnapshot()
            let candidate: String
            if let existingCode { candidate = existingCode }
            else {
                let data = try await send(path: "create", code: nil, body: Data("{}".utf8))
                guard let response = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                      Set(response.keys) == ["version", "code"], ProgressSyncRecord.wireInteger(response["version"]) == 1,
                      let newCode = response["code"] as? String, Self.validCode(newCode) else { throw ProgressSyncError.invalidResponse }
                candidate = newCode
            }
            let remote = try await exchange(code: candidate, records: [])
            guard generation == token else { return }
            let remoteDeletions = try await exchangeDeletions(code: candidate, records: [])
            guard generation == token else { return }
            let remoteMemory = try await exchangeMemory(code: candidate, records: [])
            guard generation == token else { return }
            let remoteContent=try await exchangeContent(code:candidate,records:[],knownDigest:nil,acknowledged:[])
            guard generation == token else { return }
            _ = try store.validatedMemorySnapshot(remoteMemory)
            _ = try store.validatedContentSnapshot(remoteContent.records)
            try credentials.write(candidate)
            code = candidate; connected = true; revealedCode = nil
            try store.mergeSyncSnapshot(remote)
            try store.mergeDeletionSnapshot(remoteDeletions)
            try store.mergeMemorySnapshot(remoteMemory)
            try store.mergeContentSnapshot(remoteContent.records)
            acknowledgedContent=remoteContent.records;contentDigest=remoteContent.digest
            needsUpload = true; requested = true; status = "已配對，正在同步…"; retrySeconds = 2
        } catch { if generation == token { status = safeDescription(error) } }
    }
    func disconnect() {
        do { try credentials.write(nil) }
        catch { status = error.localizedDescription; return }
        generation += 1; code = nil; connected = false; requested = false; needsUpload = true
        acknowledgedContent=[];contentDigest=nil
        debounce?.cancel(); debounce = nil; retry?.cancel(); retry = nil
        revealedCode = nil; status = "已中斷同步，本機進度已保留"
    }
    func requestSync(force: Bool = false) {
        if force { forceCatalogCheck=true }
        if !connected { Task { [weak self] in _ = await self?.refreshCatalog(force:force) };return }
        guard connected, code != nil, retry == nil || force else { return }
        requested = true
        guard !busy else { return }
        retry?.cancel(); retry = nil
        Task { await synchronize() }
    }
    private func synchronize() async {
        guard !busy, let code, let store else { return }
        busy = true
        let token = generation
        defer { busy = false }
        while requested && connected && generation == token {
            requested = false; status = "正在同步…"
            do {
                _ = await refreshCatalog(force:forceCatalogCheck);forceCatalogCheck=false
                guard generation == token else { return }
                let snapshot = try store.syncSnapshot()
                let deletionSnapshot = try store.deletionSnapshot()
                let memorySnapshot = try store.memorySnapshot()
                let contentSnapshot=try store.contentSnapshot()
                let uploading = needsUpload
                needsUpload = false
                let remote = try await exchange(code: code, records: uploading ? snapshot : [])
                guard generation == token else { return }
                try store.mergeSyncSnapshot(remote)
                let remoteDeletions = try await exchangeDeletions(code: code, records: uploading ? deletionSnapshot : [])
                guard generation == token else { return }
                try store.mergeDeletionSnapshot(remoteDeletions)
                let remoteMemory = try await exchangeMemory(code: code, records: uploading ? memorySnapshot : [])
                guard generation == token else { return }
                try store.mergeMemorySnapshot(remoteMemory)
                let remoteContent=try await exchangeContent(code:code,records:contentSnapshot,
                    knownDigest:contentDigest,acknowledged:acknowledgedContent)
                guard generation == token else { return }
                try store.mergeContentSnapshot(remoteContent.records)
                acknowledgedContent=remoteContent.records;contentDigest=remoteContent.digest
                let currentMemory = try store.memorySnapshot()
                let current = try store.syncSnapshot()
                let currentDeletions = try store.deletionSnapshot()
                let currentContent=try store.contentSnapshot()
                // All channels merge CURRENT local records; in-flight edits are sent on the next serialized pass.
                if current != remote || currentDeletions != remoteDeletions || currentMemory != remoteMemory || currentContent != remoteContent.records {
                    // If the server failed to acknowledge an unchanged upload, use normal retry backoff.
                    if uploading && current == snapshot && currentDeletions == deletionSnapshot && currentMemory == memorySnapshot && currentContent == contentSnapshot {
                        throw ProgressSyncError.server
                    }
                    needsUpload = true
                    requested = true
                }
                retrySeconds = 2
                status = needsUpload ? "有資料等待同步" : catalogFailed ? "詞庫更新待重試" : "已同步"
            } catch {
                guard generation == token else { return }
                needsUpload = true; requested = false; status = safeDescription(error)
                scheduleRetry(); return
            }
        }
    }
    private func scheduleRetry() {
        guard active, connected else { return }
        let delay = retrySeconds; retrySeconds = min(60, retrySeconds * 2)
        retry?.cancel()
        retry = Task { [weak self] in
            try? await Task.sleep(nanoseconds: delay * 1_000_000_000)
            guard !Task.isCancelled else { return }; self?.retry = nil; self?.requestSync()
        }
    }
    private func safeDescription(_ error: Error) -> String {
        if let known = error as? ProgressSyncError { return known.localizedDescription }
        return "目前無法連線，本機進度已保留，連線後會自動重試。"
    }
    private struct ExchangeEnvelope: Codable { var version = 1; let records: [ProgressSyncRecord] }
    private func exchange(code: String, records: [ProgressSyncRecord]) async throws -> [ProgressSyncRecord] {
        let response = try await send(path: "exchange", code: code, body: JSONEncoder().encode(ExchangeEnvelope(records: records)))
        return try ProgressSyncRecord.decodeEnvelope(response)
    }
    private struct DeletionEnvelope: Encodable { var version = 1; let records: [WordDeletionRecord] }
    private func exchangeDeletions(code: String, records: [WordDeletionRecord]) async throws -> [WordDeletionRecord] {
        let response = try await send(path: "deletions", code: code, body: JSONEncoder().encode(DeletionEnvelope(records: records)))
        return try WordDeletionRecord.decodeEnvelope(response)
    }
    private struct MemoryEnvelope: Encodable { var version = 1; let records: [MemorySyncRecord] }
    private struct ContentEnvelope:Encodable {
        var version=1
        let records:[ContentSyncRecord]
        let knownDigest:String?
        enum CodingKeys:String,CodingKey { case version,records,knownDigest }
        func encode(to encoder:Encoder) throws {
            var v=encoder.container(keyedBy:CodingKeys.self);try v.encode(version,forKey:.version);try v.encode(records,forKey:.records)
            if let knownDigest { try v.encode(knownDigest,forKey:.knownDigest) } else { try v.encodeNil(forKey:.knownDigest) }
        }
    }
    private struct ContentResponse { let records:[ContentSyncRecord];let digest:String }
    private func exchangeContent(code:String,records:[ContentSyncRecord],knownDigest:String?,acknowledged:[ContentSyncRecord]) async throws ->ContentResponse {
        let prior=Dictionary(uniqueKeysWithValues:acknowledged.map{($0.key,$0)})
        let pending=records.filter{prior[$0.key] != $0}
        let data=try await send(path:"content",code:code,body:JSONEncoder().encode(ContentEnvelope(records:pending,knownDigest:knownDigest)))
        guard let raw=try JSONSerialization.jsonObject(with:data) as? [String:Any],Set(raw.keys)==["version","records","digest","unchanged"],
              ProgressSyncRecord.wireInteger(raw["version"])==1,let digest=raw["digest"] as? String,
              digest.range(of:"^[0-9a-f]{64}$",options:.regularExpression) != nil,
              let unchanged=raw["unchanged"] as? NSNumber,CFGetTypeID(unchanged)==CFBooleanGetTypeID(),
              let wire=raw["records"] as? [[String:Any]] else { throw ProgressSyncError.invalidResponse }
        if unchanged.boolValue {
            guard wire.isEmpty,knownDigest==digest else { throw ProgressSyncError.invalidResponse }
            return ContentResponse(records:acknowledged,digest:digest)
        }
        let decoded=try ContentSyncRecord.decodeEnvelope(JSONSerialization.data(withJSONObject:["version":1,"records":wire]))
        let canonical=try ContentJSON.from(JSONSerialization.jsonObject(with:JSONEncoder().encode(decoded))).canonical
        guard ContentLibrary.sha256(Data(canonical.utf8))==digest else { throw ProgressSyncError.invalidResponse }
        return ContentResponse(records:decoded,digest:digest)
    }

    @discardableResult func refreshCatalog(force:Bool=false) async ->Bool {
        guard catalogUpdatesEnabled else { return true }
        if let task=catalogTask { return await task.value }
        if !force,let lastCatalogCheck,Date().timeIntervalSince(lastCatalogCheck)<300 { return !catalogFailed }
        catalogBusy=true;catalogStatus="正在檢查線上詞庫…"
        let task=Task { [weak self] () ->Bool in
            guard let self,let store=self.store else { return false }
            do {
                var components=URLComponents(url:self.baseURL,resolvingAgainstBaseURL:false)!
                components.path="/database/content-version.json";components.query=nil;components.fragment=nil
                let manifestData=try await self.publicData(components.url!,limit:1024*1024)
                guard let manifest=try JSONSerialization.jsonObject(with:manifestData) as? [String:Any],
                      let version=manifest["version"] as? String,let hash=manifest["catalogSHA256"] as? String,
                      version.range(of:"^[0-9a-f]{64}$",options:.regularExpression) != nil,
                      hash.range(of:"^[0-9a-f]{64}$",options:.regularExpression) != nil,
                      manifest["catalogPath"] as? String == "/database/catalog.json" else { throw ProgressSyncError.invalidResponse }
                if store.downloadedCatalog?.sha256 != hash {
                    components.path="/database/catalog.json"
                    let data=try await self.publicData(components.url!,limit:32*1024*1024)
                    try store.applyDownloadedCatalog(data,version:version,sha256:hash)
                }
                self.catalogFailed=false;self.lastCatalogCheck=Date();self.catalogStatus="詞庫已更新"
                return true
            } catch {
                self.catalogFailed=true;self.lastCatalogCheck=nil
                self.catalogStatus="線上詞庫更新失敗，離線內容與學習紀錄已保留。"
                return false
            }
        }
        catalogTask=task
        let success=await task.value
        catalogTask=nil;catalogBusy=false
        return success
    }
    private func publicData(_ url:URL,limit:Int) async throws ->Data {
        guard url.scheme=="https",url.host==baseURL.host,url.port==baseURL.port else { throw ProgressSyncError.invalidResponse }
        var request=URLRequest(url:url,cachePolicy:.reloadIgnoringLocalCacheData);request.httpMethod="GET"
        let (data,response)=try await session.data(for:request)
        guard let response=response as? HTTPURLResponse,response.statusCode==200,data.count<=limit else { throw ProgressSyncError.server }
        return data
    }
    private func exchangeMemory(code: String, records: [MemorySyncRecord]) async throws -> [MemorySyncRecord] {
        let response = try await send(path: "memory", code: code, body: JSONEncoder().encode(MemoryEnvelope(records: records)))
        let incoming = try MemorySyncRecord.decodeEnvelope(response)
        // Canonicalize duplicate keys and ordering before comparing snapshots.
        var winners: [String: MemorySyncRecord] = [:]
        for item in incoming {
            let key = SyncRecordIdentity.key(dictionaryID: item.dictionaryID, wordID: item.wordID)
            if let old = winners[key], !MemorySyncRecord.wins(item.record, over: old.record) { continue }
            winners[key] = item
        }
        return winners.values.sorted {
            SyncRecordIdentity.precedes(dictionaryID: $0.dictionaryID, wordID: $0.wordID,
                                        otherDictionaryID: $1.dictionaryID, otherWordID: $1.wordID)
        }
    }
    private func send(path: String, code: String?, body: Data) async throws -> Data {
        guard baseURL.scheme == "https", body.count <= 32 * 1024 * 1024 else { throw ProgressSyncError.invalidResponse }
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"; request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let code { request.setValue("Bearer " + code, forHTTPHeaderField: "Authorization") }
        request.httpBody = body
        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, data.count <= 32 * 1024 * 1024 else { throw ProgressSyncError.invalidResponse }
        if http.statusCode == 401 { throw ProgressSyncError.unauthorized }
        guard http.statusCode == 200 else { throw ProgressSyncError.server }
        return data
    }
}
