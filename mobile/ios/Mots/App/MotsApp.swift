import SwiftUI

@main
struct MotsApp: App {
    @State private var store = StudyStore()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            AppView(store: store)
                .environment(\.locale, Locale(identifier: "zh-Hant"))
                .task {
                    SpeechPlayer.shared.rate = store.speechRate
                    store.syncController.setActive(scenePhase == .active)
                }
                .onChange(of: store.speechRate) { _, value in SpeechPlayer.shared.rate = value }
                .onChange(of: scenePhase) { _, phase in
                    store.syncController.setActive(phase == .active)
                    if phase != .active { SpeechPlayer.shared.stop() }
                }
        }
    }
}
