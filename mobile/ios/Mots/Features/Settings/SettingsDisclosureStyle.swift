import SwiftUI

struct SettingsGroupLabel: View {
    @ScaledMetric(relativeTo: .body) private var iconWidth = 24
    let title: String
    let symbol: String
    let summary: String

    init(_ title: String, symbol: String, summary: String) {
        self.title = title; self.symbol = symbol; self.summary = summary
    }

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: symbol)
                .font(.body)
                .foregroundStyle(MotsTheme.accent)
                .frame(width: iconWidth)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.body.weight(.medium)).foregroundStyle(MotsTheme.ink)
                Text(summary).font(.caption).foregroundStyle(MotsTheme.muted)
            }
            .fixedSize(horizontal: false, vertical: true)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.vertical, 6)
        .frame(maxWidth: .infinity, minHeight: 52, alignment: .leading)
    }
}

/// Native disclosure state with a single full-row button; expanded fields stay native Form rows.
struct SettingsDisclosureStyle: DisclosureGroupStyle {
    let identifier: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    @ViewBuilder func makeBody(configuration: Configuration) -> some View {
        Button {
            withAnimation(reduceMotion ? nil : .easeInOut(duration: 0.18)) {
                configuration.isExpanded.toggle()
            }
        } label: {
            HStack(spacing: 8) {
                configuration.label
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .rotationEffect(.degrees(configuration.isExpanded ? 90 : 0))
                    .foregroundStyle(MotsTheme.muted)
                    .accessibilityHidden(true)
            }
            .frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityIdentifier(identifier)
        .accessibilityValue(configuration.isExpanded ? "已展開" : "已收起")
        .accessibilityHint("點兩下展開或收起此分組")
        if configuration.isExpanded { configuration.content }
    }
}

extension View {
    func settingsActionTarget() -> some View {
        frame(maxWidth: .infinity, minHeight: 44, alignment: .leading)
            .contentShape(Rectangle())
    }
}
