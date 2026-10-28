import SwiftUI
import UIKit

/// UIKit owns horizontal page gestures. Only a completed turn commits study state.
struct StudyCardPager: UIViewControllerRepresentable {
    @Bindable var store: StudyStore
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeCoordinator() -> Coordinator { Coordinator(store: store) }

    func makeUIViewController(context: Context) -> UIPageViewController {
        let pager = UIPageViewController(
            transitionStyle: reduceMotion ? .scroll : .pageCurl,
            navigationOrientation: .horizontal,
            options: [.spineLocation: UIPageViewController.SpineLocation.min.rawValue])
        pager.isDoubleSided = false
        pager.dataSource = context.coordinator
        pager.delegate = context.coordinator
        pager.view.backgroundColor = UIColor(MotsTheme.background)
        context.coordinator.synchronize(pager, requested: store.cardPagingContext)
        return pager
    }

    func updateUIViewController(_ pager: UIPageViewController, context: Context) {
        context.coordinator.store = store
        // Read selection in SwiftUI's update even while UIKit is turning a page.
        // Reading it only after the coordinator's transition guard drops Observation
        // tracking on that update; subsequent buttons then advance only the footer.
        context.coordinator.synchronize(pager, requested: store.cardPagingContext)
    }

    static func dismantleUIViewController(_ pager: UIPageViewController, coordinator: Coordinator) {
        coordinator.stop(pager)
    }

    @MainActor final class Coordinator: NSObject, UIPageViewControllerDataSource, UIPageViewControllerDelegate {
        var store: StudyStore
        private var paging = CardPagingState()
        private var deckIDs: [String] = []
        private var deckWords: [StudyWord] = []
        private var dictionaryID: String?
        private var recoveryTask: Task<Void, Never>?
        init(store: StudyStore) { self.store = store }

        private func page(for word: StudyWord) -> CardPageController {
            CardPageController(store: store, word: word)
        }

        private var context: CardPagingState.Context { store.cardPagingContext }

        func stop(_ pager: UIPageViewController) {
            recoveryTask?.cancel()
            recoveryTask = nil
            paging = CardPagingState()
            pager.delegate = nil
            pager.dataSource = nil
        }

        private func scheduleRecovery(_ pager: UIPageViewController) {
            recoveryTask?.cancel()
            recoveryTask = Task { @MainActor [weak self, weak pager] in
                try? await Task.sleep(for: .seconds(2))
                guard !Task.isCancelled, let self, let pager, self.paging.isTurning else { return }
                // A finger may legitimately hold a page open. Once no recognizer is
                // active, a missing delegate callback must not lock the next card.
                if self.hasActiveGesture(in: pager.view) {
                    self.scheduleRecovery(pager)
                    return
                }
                pager.dataSource = nil
                pager.dataSource = self
                self.finishTurn(pager, completed: true)
            }
        }

        private func hasActiveGesture(in view: UIView) -> Bool {
            // The scroll pager's pan recognizer belongs to its internal scroll view.
            (view.gestureRecognizers ?? []).contains { $0.state == .began || $0.state == .changed }
                || view.subviews.contains { hasActiveGesture(in: $0) }
        }

        func synchronize(_ pager: UIPageViewController, requested: CardPagingState.Context) {
            guard !paging.isTurning, let selectedID = requested.selectedID,
                  let word = requested.words.first(where: { $0.id == selectedID }) else { return }
            let words = requested.words
            let deckChanged = dictionaryID != requested.dictionaryID || deckWords != words
            let visible = pager.viewControllers?.first as? CardPageController
            guard deckChanged || visible?.wordID != word.id else { return }
            let oldIndex = visible.flatMap { deckIDs.firstIndex(of: $0.wordID) } ?? store.currentIndex
            deckIDs = words.map(\.id)
            deckWords = words
            dictionaryID = requested.dictionaryID
            // Invalidate adjacent pages for every explicit selection. Programmatic
            // turns are immediate so they cannot overlap the interactive curl.
            pager.dataSource = nil
            pager.dataSource = self
            pager.setViewControllers([page(for: word)],
                direction: store.currentIndex >= oldIndex ? .forward : .reverse,
                animated: false)
        }

        func pageViewController(_ pageViewController: UIPageViewController,
                                viewControllerBefore viewController: UIViewController) -> UIViewController? {
            guard let page = viewController as? CardPageController,
                  let index = deckIDs.firstIndex(of: page.wordID), index > 0 else { return nil }
            return self.page(for: deckWords[index - 1])
        }

        func pageViewController(_ pageViewController: UIPageViewController,
                                viewControllerAfter viewController: UIViewController) -> UIViewController? {
            guard let page = viewController as? CardPageController,
                  let index = deckIDs.firstIndex(of: page.wordID),
                  index + 1 < deckWords.count else { return nil }
            return self.page(for: deckWords[index + 1])
        }

        func pageViewController(_ pageViewController: UIPageViewController,
                                willTransitionTo pendingViewControllers: [UIViewController]) {
            paging.begin(in: context)
            scheduleRecovery(pageViewController)
        }

        func pageViewController(_ pageViewController: UIPageViewController, didFinishAnimating finished: Bool,
                                previousViewControllers: [UIViewController], transitionCompleted completed: Bool) {
            finishTurn(pageViewController, completed: completed)
        }

        private func finishTurn(_ pageViewController: UIPageViewController, completed: Bool) {
            recoveryTask?.cancel()
            recoveryTask = nil
            let visibleID = (pageViewController.viewControllers?.first as? CardPageController)?.wordID
            if let selectedID = paging.finish(in: context, visibleID: visibleID, completed: completed),
               let word = store.filteredWords.first(where: { $0.id == selectedID }) {
                store.selectWord(word)
            }
            // Let UIKit finish its delegate callback before applying any button/filter
            // request that arrived while the finger was turning the page.
            Task { @MainActor [weak self, weak pageViewController] in
                await Task.yield()
                guard let self, let pageViewController else { return }
                self.synchronize(pageViewController, requested: self.context)
            }
        }
    }
}

private final class CardPageController: UIHostingController<CardPage> {
    let wordID: String
    init(store: StudyStore, word: StudyWord) {
        wordID = word.id
        super.init(rootView: CardPage(store: store, word: word))
        view.backgroundColor = UIColor(MotsTheme.background)
    }
    @available(*, unavailable)
    required init?(coder: NSCoder) { fatalError("Use init(store:word:)") }
}

private struct CardPage: View {
    @Bindable var store: StudyStore
    let word: StudyWord

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if let message = SpeechPlayer.shared.message, store.currentWord?.id == word.id {
                    Label(message, systemImage: "speaker.slash")
                        .font(.subheadline)
                        .foregroundStyle(MotsTheme.unfamiliar)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                StudyCard(store: store, word: word)
            }
            .frame(maxWidth: MotsTheme.contentWidth)
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
            .frame(maxWidth: .infinity)
        }
        .background(MotsTheme.background)
        .environment(\.locale, Locale(identifier: "zh-Hant"))
    }
}
