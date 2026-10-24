extension StudyMode {
    func navigationTitle(for dictionary: StudyDictionary) -> String {
        switch self {
        case .lookup: dictionary.isGrammar ? "語法總覽" : "詞彙總覽"
        case .study: dictionary.isThematicGrammar ? "主題背誦" : dictionary.isGrammar ? "語法背誦" : "詞彙背誦"
        case .review: "隨機複習"
        }
    }

    var navigationTitle: String {
        switch self {
        case .lookup: "查詞典"
        case .study: "主題學習"
        case .review: "隨機複習"
        }
    }

    var symbol: String {
        switch self {
        case .lookup: "text.book.closed"
        case .study: "rectangle.on.rectangle"
        case .review: "shuffle"
        }
    }
}
