import SwiftUI
import UIKit

/// UIKit owns the interactive page curl. Only a completed turn commits study state.
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
        context.coordinator.synchronize(pager, animated: false)
        return pager
    }

    func updateUIViewController(_ pager: UIPageViewController, context: Context) {
        context.coordinator.store = store
        context.coordinator.synchronize(pager, animated: !reduceMotion)
    }

    @MainActor final class Coordinator: NSObject, UIPageViewControllerDataSource, UIPageViewControllerDelegate {
        var store: StudyStore
        private var transitioning = false
        private var deckIDs: [String] = []
        private var deckWords: [StudyWord] = []
        private var dictionaryID: String?
        init(store: StudyStore) { self.store = store }

        private func page(for word: StudyWord) -> CardPageController {
            CardPageController(store: store, word: word)
        }

        func synchronize(_ pager: UIPageViewController, animated: Bool) {
            guard !transitioning, let word = store.currentWord else { return }
            let ids = store.filteredWords.map(\.id)
            let deckChanged = dictionaryID != store.dictionaryID || deckWords != store.filteredWords
            let visible = pager.viewControllers?.first as? CardPageController
            guard deckChanged || visible?.wordID != word.id else { return }
            let oldIndex = visible.flatMap { deckIDs.firstIndex(of: $0.wordID) } ?? store.currentIndex
            deckIDs = ids
            deckWords = store.filteredWords
            dictionaryID = store.dictionaryID
            if deckChanged {
                // Drop UIKit's adjacent-page cache after dictionary/filter/order changes.
                pager.dataSource = nil
                pager.dataSource = self
            }
            let animateTurn = animated && !deckChanged && visible != nil
            transitioning = animateTurn
            pager.setViewControllers([page(for: word)],
                direction: store.currentIndex >= oldIndex ? .forward : .reverse,
                animated: animateTurn) { [weak self, weak pager] _ in
                    guard let self, let pager else { return }
                    self.transitioning = false
                    self.synchronize(pager, animated: animated)
                }
        }

        func pageViewController(_ pageViewController: UIPageViewController,
                                viewControllerBefore viewController: UIViewController) -> UIViewController? {
            guard let page = viewController as? CardPageController,
                  let index = store.filteredWords.firstIndex(where: { $0.id == page.wordID }), index > 0 else { return nil }
            return self.page(for: store.filteredWords[index - 1])
        }

        func pageViewController(_ pageViewController: UIPageViewController,
                                viewControllerAfter viewController: UIViewController) -> UIViewController? {
            guard let page = viewController as? CardPageController,
                  let index = store.filteredWords.firstIndex(where: { $0.id == page.wordID }),
                  index + 1 < store.filteredWords.count else { return nil }
            return self.page(for: store.filteredWords[index + 1])
        }

        func pageViewController(_ pageViewController: UIPageViewController,
                                willTransitionTo pendingViewControllers: [UIViewController]) {
            transitioning = true
        }

        func pageViewController(_ pageViewController: UIPageViewController, didFinishAnimating finished: Bool,
                                previousViewControllers: [UIViewController], transitionCompleted completed: Bool) {
            transitioning = false
            if completed, let visible = pageViewController.viewControllers?.first as? CardPageController,
               let word = store.filteredWords.first(where: { $0.id == visible.wordID }) {
                store.selectWord(word)
            }
            synchronize(pageViewController, animated: false)
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
