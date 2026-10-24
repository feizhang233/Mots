import AVFoundation
import Observation

/// One player for all screens. Bundled clips work without a network connection.
@MainActor @Observable
final class SpeechPlayer: NSObject, AVAudioPlayerDelegate, AVSpeechSynthesizerDelegate {
    static let shared = SpeechPlayer()
    private var player: AVAudioPlayer?
    private let synthesizer = AVSpeechSynthesizer()
    private var utterance: AVSpeechUtterance?
    var activeWordID: String?
    var message: String?
    var rate = 0.45

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    func stop() {
        player?.stop()
        player = nil
        utterance = nil
        synthesizer.stopSpeaking(at: .immediate)
        activeWordID = nil
    }

    func speak(word: StudyWord) {
        if activeWordID == word.id { stop(); return }
        stop()
        message = nil
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, options: [.duckOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
        activeWordID = word.id
        if let path = word.audio,
           let resources = Bundle.main.resourceURL,
           !path.contains(".."), path.hasPrefix("audio/") {
            let url = resources.appendingPathComponent(path)
            if let clip = try? AVAudioPlayer(contentsOf: url) {
                player = clip
                clip.delegate = self
                clip.enableRate = true
                clip.rate = Float(min(1.3, max(0.7, rate / 0.45)))
                if clip.play() { return }
                player = nil
            }
        }
        let locale = ["fr": "fr-FR", "de": "de-DE", "ja": "ja-JP"][word.language] ?? word.language
        guard let voice = AVSpeechSynthesisVoice(language: locale) else {
            activeWordID = nil
            message = "沒有可用的語音。請在系統設定下載對應語言的語音後再試。"
            return
        }
        let speech = AVSpeechUtterance(string: word.term)
        speech.voice = voice
        speech.rate = Float(rate)
        utterance = speech
        synthesizer.speak(speech)
    }

    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        let identity = ObjectIdentifier(player)
        Task { @MainActor [weak self] in
            guard let self, self.player.map(ObjectIdentifier.init) == identity else { return }
            self.activeWordID = nil
            if !flag { self.message = "讀音未能完成，請再試一次。" }
        }
    }

    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        let identity = ObjectIdentifier(utterance)
        Task { @MainActor [weak self] in
            guard let self, self.utterance.map(ObjectIdentifier.init) == identity else { return }
            self.activeWordID = nil
            self.utterance = nil
        }
    }
}
