import Foundation
import Security

protocol ProgressSyncCredentials {
    func read() throws -> String?
    func write(_ code: String?) throws
}

struct KeychainProgressSyncCredentials: ProgressSyncCredentials {
    private var query: [String: Any] { [kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: "com.feizhang.mots.progress-sync", kSecAttrAccount as String: "pairing-code"] }
    func read() throws -> String? {
        var request = query
        request[kSecReturnData as String] = true; request[kSecMatchLimit as String] = kSecMatchLimitOne
        var item: CFTypeRef?
        let status = SecItemCopyMatching(request as CFDictionary, &item)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = item as? Data, let code = String(data: data, encoding: .utf8) else { throw ProgressSyncError.credentialStorage }
        return code
    }
    func write(_ code: String?) throws {
        if let code {
            let attributes: [String: Any] = [kSecValueData as String: Data(code.utf8),
                kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly]
            let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
            if status == errSecItemNotFound {
                var item = query; attributes.forEach { item[$0.key] = $0.value }
                guard SecItemAdd(item as CFDictionary, nil) == errSecSuccess else { throw ProgressSyncError.credentialStorage }
            } else if status != errSecSuccess { throw ProgressSyncError.credentialStorage }
        } else {
            let status = SecItemDelete(query as CFDictionary)
            guard status == errSecSuccess || status == errSecItemNotFound else { throw ProgressSyncError.credentialStorage }
        }
    }
}
