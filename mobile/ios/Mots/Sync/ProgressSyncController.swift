import Foundation
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

    init(store: StudyStore, credentials: any ProgressSyncCredentials = KeychainProgressSyncCredentials(),
         session: URLSession? = nil, baseURL: URL = URL(string: "https://mots.feizhang233.com/api/sync")!) {
        self.store = store; self.credentials = credentials; self.baseURL = baseURL
        let configuration = URLSessionConfiguration.ephemeral
        configuration.timeoutIntervalForRequest = 20; configuration.timeoutIntervalForResource = 30
        configuration.httpShouldSetCookies = false; configuration.urlCache = nil
        self.session = session ?? URLSession(configuration: configuration, delegate: ProgressSyncSessionDelegate(), delegateQueue: nil)
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
        status = "有進度等待同步"
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
            try credentials.write(candidate)
            code = candidate; connected = true; revealedCode = nil
            try store.mergeSyncSnapshot(remote)
            try store.mergeDeletionSnapshot(remoteDeletions)
            needsUpload = true; requested = true; status = "已配對，正在同步…"; retrySeconds = 2
        } catch { if generation == token { status = safeDescription(error) } }
    }
    func disconnect() {
        do { try credentials.write(nil) }
        catch { status = error.localizedDescription; return }
        generation += 1; code = nil; connected = false; requested = false; needsUpload = true
        debounce?.cancel(); debounce = nil; retry?.cancel(); retry = nil
        revealedCode = nil; status = "已中斷同步，本機進度已保留"
    }
    func requestSync(force: Bool = false) {
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
                let snapshot = try store.syncSnapshot()
                let deletionSnapshot = try store.deletionSnapshot()
                let uploading = needsUpload
                needsUpload = false
                let remote = try await exchange(code: code, records: uploading ? snapshot : [])
                guard generation == token else { return }
                try store.mergeSyncSnapshot(remote)
                let remoteDeletions = try await exchangeDeletions(code: code, records: uploading ? deletionSnapshot : [])
                guard generation == token else { return }
                try store.mergeDeletionSnapshot(remoteDeletions)
                let current = try store.syncSnapshot()
                let currentDeletions = try store.deletionSnapshot()
                // Both channels merge CURRENT local records; in-flight edits are sent on the next serialized pass.
                let canonicalRemote = try ProgressSyncRecord.canonical(remote)
                if current != canonicalRemote || currentDeletions != remoteDeletions { needsUpload = true; requested = true }
                retrySeconds = 2
                status = needsUpload ? "有進度等待同步" : "已同步"
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
