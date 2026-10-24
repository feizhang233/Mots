import SwiftUI
import UIKit

/// The native adapter for the Mots palette in DESIGN.md.
/// Content stays opaque; Liquid Glass belongs to navigation and controls.
enum MotsTheme {
    static let accent = adaptive(0x245B48, 0xA7DCC3)
    static let background = adaptive(0xF3F6F7, 0x111817)
    static let surface = adaptive(0xFFFFFF, 0x1C2523)
    static let secondarySurface = adaptive(0xE8EFED, 0x26332E)
    static let stroke = adaptive(0xD9E3DF, 0x3D4C45)
    static let ink = adaptive(0x202A25, 0xEDF4EF)
    static let muted = adaptive(0x5D7066, 0xA9BDB0)
    static let unfamiliar = adaptive(0x9C443B, 0xF4B0A5)
    static let learning = adaptive(0x805B17, 0xEAC783)
    static let mastered = adaptive(0x386A48, 0xA7DCC3)
    static let contentWidth: CGFloat = 780
    static let cardRadius: CGFloat = 28
    static let iconControlSize: CGFloat = 44

    static func ratingColor(_ level: Int) -> Color {
        switch level {
        case 1: unfamiliar
        case 2: learning
        case 3: mastered
        default: muted
        }
    }

    static func ratingIndicatorColor(_ level: Int) -> Color {
        switch level {
        case 1: Color(uiColor: .systemRed)
        case 2: Color(uiColor: .systemYellow)
        case 3: Color(uiColor: .systemGreen)
        default: muted
        }
    }

    static func ratingLabel(_ level: Int) -> String {
        switch level {
        case 1: "不熟悉"
        case 2: "有印象"
        case 3: "已掌握"
        default: "未學習"
        }
    }

    static func ratingSymbol(_ level: Int) -> String {
        switch level {
        case 1: "arrow.counterclockwise"
        case 2: "circle.lefthalf.filled"
        case 3: "checkmark"
        default: "circle.dotted"
        }
    }

    private static func adaptive(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(uiColor: UIColor { traits in
            let hex = traits.userInterfaceStyle == .dark ? dark : light
            return UIColor(
                red: CGFloat((hex >> 16) & 0xFF) / 255,
                green: CGFloat((hex >> 8) & 0xFF) / 255,
                blue: CGFloat(hex & 0xFF) / 255,
                alpha: 1
            )
        })
    }
}

struct MotsCardSurface: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(MotsTheme.surface, in: RoundedRectangle(cornerRadius: MotsTheme.cardRadius))
            .overlay {
                RoundedRectangle(cornerRadius: MotsTheme.cardRadius)
                    .strokeBorder(MotsTheme.stroke.opacity(0.65), lineWidth: 0.5)
            }
    }
}

struct MotsGlassChrome: ViewModifier {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency

    @ViewBuilder
    func body(content: Content) -> some View {
        if reduceTransparency {
            content
                .background(MotsTheme.surface, in: Capsule())
                .overlay { Capsule().strokeBorder(MotsTheme.stroke, lineWidth: 1) }
        } else {
            content.glassEffect(.regular, in: Capsule())
        }
    }
}

/// Size the styled control, rather than adding a touch target inside the glass padding.
struct MotsGlassIconControl: ViewModifier {
    func body(content: Content) -> some View {
        content
            .buttonStyle(.glass)
            .controlSize(.large)
            .buttonBorderShape(.circle)
            .buttonSizing(.flexible)
            .frame(width: MotsTheme.iconControlSize, height: MotsTheme.iconControlSize)
    }
}

extension View {
    func motsCardSurface() -> some View { modifier(MotsCardSurface()) }
    func motsGlassChrome() -> some View { modifier(MotsGlassChrome()) }
    func motsGlassIconControl() -> some View { modifier(MotsGlassIconControl()) }
}
