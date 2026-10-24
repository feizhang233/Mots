import SwiftUI
import UIKit

struct SyncSettingsContent: View {
    @Bindable var sync: ProgressSyncController
    @Binding var pairingCode: String

    @ViewBuilder var body: some View {
        Label(sync.status, systemImage: sync.busy ? "arrow.triangle.2.circlepath" : sync.connected ? "checkmark.icloud" : "icloud")
            .font(.subheadline)
            .fixedSize(horizontal: false, vertical: true)
            .accessibilityIdentifier("sync.status")
        if sync.connected {
            Button {
                if sync.revealedCode == nil { sync.revealCode() } else { sync.hideCode() }
            } label: {
                Label(sync.revealedCode == nil ? "顯示配對碼" : "隱藏配對碼", systemImage: sync.revealedCode == nil ? "eye" : "eye.slash")
                    .settingsActionTarget()
            }
            .accessibilityIdentifier("sync.reveal")
            if let code = sync.revealedCode {
                Text(code).font(.caption.monospaced()).textSelection(.enabled)
                    .fixedSize(horizontal: false, vertical: true)
                    .privacySensitive()
                    .accessibilityIdentifier("sync.code")
            }
            Button {
                if let code = sync.copyCode() { UIPasteboard.general.string = code }
            } label: {
                Label("複製配對碼", systemImage: "doc.on.doc").settingsActionTarget()
            }
            .accessibilityIdentifier("sync.copy")
            Button { sync.requestSync(force: true) } label: {
                Label("立即同步", systemImage: "arrow.triangle.2.circlepath").settingsActionTarget()
            }
            .disabled(sync.busy).accessibilityIdentifier("sync.now")
            Button(role: .destructive) { sync.disconnect() } label: {
                Label("中斷同步", systemImage: "icloud.slash").settingsActionTarget()
            }
            .accessibilityIdentifier("sync.disconnect")
        } else {
            Button { Task { await sync.create() } } label: {
                Label("建立配對碼", systemImage: "link.badge.plus").settingsActionTarget()
            }
            .disabled(sync.busy).accessibilityIdentifier("sync.create")
            SecureField("貼上另一裝置的配對碼", text: $pairingCode)
                .textInputAutocapitalization(.never).autocorrectionDisabled()
                .privacySensitive().accessibilityIdentifier("sync.input")
                .frame(minHeight: 44)
            Button {
                let code = pairingCode
                Task { await sync.join(code); if sync.connected { pairingCode = "" } }
            } label: {
                Label("加入配對", systemImage: "link").settingsActionTarget()
            }
            .disabled(sync.busy || pairingCode.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .accessibilityIdentifier("sync.join")
        }
        Text("另一裝置輸入同一配對碼即可同步熟悉程度與刪除狀態，離線變更會自動重試。配對碼請只用於自己的裝置。")
            .font(.footnote).foregroundStyle(.secondary)
    }
}
