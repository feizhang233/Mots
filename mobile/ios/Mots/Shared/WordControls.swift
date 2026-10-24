import SwiftUI

struct RatingControls: View {
    let store: StudyStore
    let word: StudyWord
    var cardFooter = false

    var body: some View {
        HStack(spacing: cardFooter ? 6 : 0) {
            ForEach(cardFooter ? [3, 2, 1] : [1, 2, 3], id: \.self) { level in
                ratingButton(level)
            }
        }
    }

    private func ratingButton(_ level: Int) -> some View {
        let selected = store.rating(word) == level
        let color = MotsTheme.ratingIndicatorColor(level)
        return Button { store.rate(word, level: level) } label: {
            ZStack {
                Circle().fill(color).frame(width: cardFooter ? 26 : 20, height: cardFooter ? 26 : 20)
                if selected {
                    Image(systemName: "checkmark")
                        .font(.system(size: cardFooter ? 12 : 10, weight: .bold))
                        .foregroundStyle(level == 2 ? Color.black : Color.white)
                }
            }
            .frame(width: 44, height: 44)
            .contentShape(Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(word.term)，\(MotsTheme.ratingLabel(level))")
        .accessibilityValue(selected ? (store.showsCards ? "已選取" : "已選取，再點一次清除標記") : "未選取")
        .help(MotsTheme.ratingLabel(level))
        .accessibilityAddTraits(selected ? [.isSelected] : [])
        .accessibilityIdentifier("rating.\(word.id).\(level)")
    }
}

struct SpeakButton: View {
    let word: StudyWord

    var body: some View {
        let isPlaying = SpeechPlayer.shared.activeWordID == word.id
        Button { SpeechPlayer.shared.speak(word: word) } label: {
            ZStack {
                Label("停止朗讀", systemImage: "speaker.wave.2").hidden()
                Label(isPlaying ? "停止朗讀" : "聽發音", systemImage: isPlaying ? "stop.fill" : "speaker.wave.2")
            }
            .font(.subheadline.weight(.medium))
            .frame(minHeight: 32)
        }
        .buttonStyle(.glass)
        .accessibilityLabel(isPlaying ? "停止朗讀 \(word.term)" : "朗讀 \(word.term)")
        .accessibilityValue(isPlaying ? "播放中" : "")
    }
}

struct RatingBadge: View {
    let level: Int

    var body: some View {
        Label(MotsTheme.ratingLabel(level), systemImage: MotsTheme.ratingSymbol(level))
            .font(.caption)
            .foregroundStyle(MotsTheme.ratingColor(level))
            .fixedSize(horizontal: false, vertical: true)
    }
}
