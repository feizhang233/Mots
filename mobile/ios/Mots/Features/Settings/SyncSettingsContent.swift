import SwiftUI
import UIKit

struct SyncSettingsContent: View {
    @Bindable var sync: ProgressSyncController
    @Binding var pairingCode: String

    @ViewBuilder var body: some View {
        Label(sync.catalogStatus,systemImage:sync.catalogBusy ? "arrow.triangle.2.circlepath" : "books.vertical")
            .font(.subheadline).fixedSize(horizontal:false,vertical:true)
            .accessibilityIdentifier("sync.catalog-status")
        if !sync.connected {
            Button { Task { await sync.refreshCatalog(force:true) } } label: {
                Label("更新線上詞庫",systemImage:"arrow.down.circle").settingsActionTarget()
            }
            .disabled(sync.catalogBusy).accessibilityIdentifier("sync.catalog-refresh")
        }
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
        Text("另一裝置輸入同一配對碼，即可雙向同步詞典、自訂詞條、熟悉度、刪除／還原及記憶排程。離線內容可繼續使用，連線後自動合併；外觀、章節選擇與閱讀位置留在各裝置。配對碼請只用於自己的裝置。")
            .font(.footnote).foregroundStyle(.secondary)
    }
}
