import Foundation

/// The wire protocol identifies and sorts records by exact UTF-8, without String normalization.
enum SyncRecordIdentity {
    static func key(dictionaryID: String, wordID: String) -> String {
        Data((dictionaryID + "\u{0}" + wordID).utf8).base64EncodedString()
    }

    static func precedes(dictionaryID: String, wordID: String, otherDictionaryID: String, otherWordID: String) -> Bool {
        dictionaryID.utf8.elementsEqual(otherDictionaryID.utf8)
            ? wordID.utf8.lexicographicallyPrecedes(otherWordID.utf8)
            : dictionaryID.utf8.lexicographicallyPrecedes(otherDictionaryID.utf8)
    }
}
