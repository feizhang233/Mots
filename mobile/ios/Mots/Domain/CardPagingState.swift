import Foundation

/// A swipe may finish after a button, filter or book change requested a different card.
/// Commit its result only when the selection and deck still belong to that gesture.
struct CardPagingState {
    struct Context: Equatable {
        let dictionaryID: String
        let words: [StudyWord]
        let selectedID: String?
        let mode: StudyMode
        let listMode: Bool
        let completed: Bool
        let categoryID: String?
        let subcategoryID: String?
        let search: String
        let hideMastered: Bool
        let randomOrder: Bool
    }

    private var origin: Context?
    var isTurning: Bool { origin != nil }

    mutating func begin(in context: Context) { origin = context }

    mutating func finish(in context: Context, visibleID: String?, completed: Bool) -> String? {
        defer { origin = nil }
        guard completed, origin == context, let visibleID, visibleID != origin?.selectedID,
              context.words.contains(where: { $0.id == visibleID }) else { return nil }
        return visibleID
    }
}

extension StudyStore {
    /// Read before the UIKit transition guard so every update keeps observing selection.
    var cardPagingContext: CardPagingState.Context {
        .init(dictionaryID: dictionaryID, words: filteredWords, selectedID: currentWord?.id,
              mode: mode, listMode: listMode, completed: completed,
              categoryID: categoryID, subcategoryID: subcategoryID, search: search,
              hideMastered: hideMastered, randomOrder: randomOrder)
    }
}
