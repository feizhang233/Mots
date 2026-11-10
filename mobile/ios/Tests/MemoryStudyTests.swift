import Foundation

@main
struct MemoryStudyTests {
    static let categories = [
        StudyCategory(id: "1", name: "第一章", subcategories: [StudySubcategory(id: "1.01", name: "子類")]),
        StudyCategory(id: "2", name: "第二章", subcategories: [StudySubcategory(id: "2.01", name: "子類")])]
    static func word(_ id: String, chapter: String = "1") -> StudyWord {
        StudyWord(id: id, term: id, meaning: "釋義", example: "", category: chapter,
                  subcategory: "\(chapter).01", language: "fr", audio: nil)
    }
    static let now = Date(timeIntervalSince1970: 1_800_000_000)
    static var catalog: [StudyDictionary] {
        [StudyDictionary(id: "fr", title: "法語", language: "fr", categories: categories,
                         words: [word("a"), word("b", chapter: "2"), word("unseen"), word("known")]),
         StudyDictionary(id: "de", title: "德語", language: "de", categories: categories, words: [word("a")]),
         StudyDictionary(id: "grammar-fr", title: "語法", language: "fr", categories: categories,
                         words: [word("grammar")], kind: .grammar)]
    }
    @MainActor static func store() -> StudyStore {
        let store = StudyStore(catalog: catalog, persistenceURL: nil, memoryRoundOrder: { $0 })
        store.listMode = true
        store.rate(catalog[0].words[0], level: 2)
        store.rate(catalog[0].words[1], level: 2)
        store.rate(catalog[0].words[3], level: 3)
        store.selectMemoryChapters(["1", "2"])
        return store
    }

    @MainActor static func main() throws {
        let initial = StudyStore(catalog: catalog, persistenceURL: nil, memoryRoundOrder: { $0 })
        initial.openMemory()
        precondition(initial.selectedMemoryChapters.isEmpty && initial.memoryWords.isEmpty,
                     "Memory starts with no chapter selected")
        initial.selectMemoryChapters(["1"])
        initial.dictionaryID = "de"
        precondition(initial.selectedMemoryChapters.isEmpty, "New books also start without a selected chapter")
        initial.dictionaryID = "fr"
        precondition(initial.selectedMemoryChapters == ["1"], "An explicit chapter selection remains saved per book")
        let store = store()
        store.search = "nothing"; store.hideMastered = true; store.randomOrder = true
        store.openMemory()
        precondition(store.mode == .memory && store.showsCards)
        precondition(store.memoryWords.map(\.id) == ["a", "b"], "Memory ignores ordinary search/hide/order and only selects partial recall")
        store.selectMemoryChapters(["2"])
        precondition(store.memoryWords.map(\.id) == ["b"])
        store.selectMemoryChapters([])
        store.startMemoryRound(at: now)
        precondition(!store.memorySessionActive && store.currentWord == nil)
        store.selectMemoryChapters(["1", "2"])
        store.startMemoryRound(at: now)
        precondition(store.filteredWords.map(\.id) == ["a", "b"])
        precondition(!store.revealed, "Memory starts with the answer hidden")
        store.meaningLanguage = "de"
        precondition(!store.answerMemory(wordID: "a", remembered: true, at: now), "Cannot claim recall without an available answer")
        store.meaningLanguage = "zh-Hant"
        precondition(!store.answerMemory(wordID: "b", remembered: true, at: now), "Stale/non-current callback rejected")
        precondition(store.answerMemory(wordID: "a", remembered: true, at: now), "Recall can be recorded without revealing the answer")
        precondition(store.memory["fr"]?["a"]?.stage == 1 && store.rating(catalog[0].words[0]) == 2)
        let firstInterval = MemoryRecord.intervals[0]
        precondition(MemoryRecord.masteryStage == 5 && MemoryRecord.intervals == [86_400, 172_800, 345_600, 604_800])
        precondition(store.memory["fr"]?["a"]?.dueAt == MemoryRecord.milliseconds(now) + firstInterval * 1000)
        precondition(store.currentWord?.id == "b" && !store.revealed)
        precondition(!store.answerMemory(wordID: "a", remembered: true, at: now), "Duplicate callback cannot advance another word")
        precondition(store.answerMemory(wordID: "b", remembered: false, at: now), "Forgetting can be recorded without revealing the answer")
        precondition(store.completed && store.memoryAnsweredCount == 2)
        precondition(store.memory["fr"]?["b"]?.stage == 0)
        store.startMemoryRound(at: now.addingTimeInterval(firstInterval - 1))
        precondition(store.completed && store.memoryDueWords(at: now.addingTimeInterval(firstInterval - 1)).isEmpty,
                     "Early revisits never advance memory stages")
        store.startMemoryRound(at: now.addingTimeInterval(firstInterval))
        precondition(store.filteredWords.map(\.id) == ["a", "b"])

        let manyWords = (0..<25).map { word("word-\($0)") }
        let unlimited = StudyStore(catalog: [StudyDictionary(id: "fr", title: "法語", language: "fr",
            categories: categories, words: manyWords)], persistenceURL: nil, memoryRoundOrder: { $0 })
        for word in manyWords { unlimited.rate(word, level: 2) }
        unlimited.openMemory(); unlimited.selectMemoryChapters(["1"]); unlimited.startMemoryRound(at: now)
        precondition(unlimited.filteredWords.count == manyWords.count && Set(unlimited.filteredWords.map(\.id)).count == manyWords.count,
                     "Captured rounds include every due word without a practice limit")
        unlimited.revealed = true
        precondition(unlimited.answerMemory(wordID: "word-0", remembered: true, at: now))
        unlimited.leaveMemoryRound(); unlimited.startMemoryRound(at: now.addingTimeInterval(firstInterval))
        precondition(unlimited.currentWord?.id == "word-0", "Scheduled due cards take priority over fresh partial-recall cards")

        let late = self.store()
        late.openMemory(); late.selectMemoryChapters(["1"]); late.startMemoryRound(at: now); late.revealed = true
        precondition(late.answerMemory(wordID: "a", remembered: true, at: now))
        let thirdDay = now.addingTimeInterval(2 * 86_400)
        late.startMemoryRound(at: thirdDay); late.revealed = true
        precondition(late.answerMemory(wordID: "a", remembered: true, at: thirdDay))
        precondition(late.memory["fr"]?["a"]?.stage == 2 && late.rating(catalog[0].words[0]) == 2,
                     "Reviewing on the third day still counts as the second successful recall")
        precondition(late.memory["fr"]?["a"]?.dueAt == MemoryRecord.milliseconds(thirdDay) + MemoryRecord.intervals[1] * 1000,
                     "The next interval begins at the actual late answer time")
        let longDelay = thirdDay.addingTimeInterval(60 * 86_400)
        late.startMemoryRound(at: longDelay); late.revealed = true
        precondition(late.answerMemory(wordID: "a", remembered: true, at: longDelay))
        precondition(late.memory["fr"]?["a"]?.stage == 3,
                     "A long absence advances exactly one stage when the user actually answers")

        // Complete the exact expanding schedule, checking both boundaries of every interval.
        let mastery = self.store()
        mastery.openMemory(); mastery.selectMemoryChapters(["1"])
        var time = now
        for stage in 1...MemoryRecord.masteryStage {
            mastery.startMemoryRound(at: time); mastery.revealed = true
            precondition(mastery.answerMemory(wordID: "a", remembered: true, at: time))
            precondition(mastery.memory["fr"]?["a"]?.stage == stage)
            if stage < MemoryRecord.masteryStage {
                let interval = MemoryRecord.intervals[stage - 1]
                precondition(mastery.rating(catalog[0].words[0]) == 2)
                precondition(mastery.memoryDueWords(at: time.addingTimeInterval(interval - 0.001)).isEmpty)
                time = time.addingTimeInterval(interval)
                precondition(mastery.memoryDueWords(at: time).count == 1)
            }
        }
        precondition(mastery.rating(catalog[0].words[0]) == 3 && mastery.memoryMasteredCount == 1)
        precondition(mastery.memory["fr"]?["a"]?.dueAt == 0, "Completed records use the Web-compatible zero due timestamp")
        let completedBackup = try JSONSerialization.jsonObject(with: mastery.exportBackup()) as! [String: Any]
        let completedRecords = completedBackup["memory"] as! [String: [String: [String: Any]]]
        precondition((completedRecords["fr"]?["a"]?["dueAt"] as? NSNumber)?.doubleValue == 0)
        let snapshot = try mastery.syncSnapshot()
        precondition(snapshot.contains { $0.wordID == "a" && $0.level == 3 }, "Mastery enters existing cross-device sync")
        mastery.rate(catalog[0].words[0], level: 2)
        precondition(mastery.memory["fr"]?["a"]?.stage == 0, "Relearning starts fresh with a dated reset")
        let resetRecord = mastery.memory["fr"]!["a"]!
        precondition(resetRecord.dueAt == resetRecord.updatedAt && resetRecord.updatedAt >= MemoryRecord.milliseconds(time))
        time = Date(timeIntervalSince1970: resetRecord.dueAt / 1000)

        // A failure after successful stages resets the schedule without changing familiarity.
        mastery.startMemoryRound(at: time); mastery.revealed = true
        _ = mastery.answerMemory(wordID: "a", remembered: true, at: time)
        time = time.addingTimeInterval(firstInterval)
        mastery.startMemoryRound(at: time); mastery.revealed = true
        precondition(mastery.answerMemory(wordID: "a", remembered: false, at: time))
        precondition(mastery.memory["fr"]?["a"]?.stage == 0 && mastery.rating(catalog[0].words[0]) == 2)
        precondition(mastery.memory["fr"]?["a"]?.dueAt == MemoryRecord.milliseconds(time) + firstInterval * 1000)

        // Valid backups merge newest schedules; invalid memory cannot partly import ratings.
        let backup = try mastery.exportBackup()
        let restored = self.store()
        try restored.importBackup(backup)
        precondition(restored.memory == mastery.memory)
        var payload = try JSONSerialization.jsonObject(with: backup) as! [String: Any]
        payload["progress"] = ["fr": ["a": 3]]
        payload["memory"] = ["fr": ["a": ["stage": 10, "dueAt": 0, "updatedAt": 0]]]
        do {
            try restored.importBackup(JSONSerialization.data(withJSONObject: payload))
            preconditionFailure("Invalid stages must be rejected")
        } catch {}
        precondition(restored.rating(catalog[0].words[0]) == 2 && restored.memory == mastery.memory)
        let tieTime = mastery.memory["fr"]!["a"]!.updatedAt
        let tieDue = tieTime + 2 * firstInterval * 1000
        payload["progress"] = ["fr": ["a": 2]]
        payload["memory"] = ["fr": ["a": ["stage": 1, "dueAt": tieDue, "updatedAt": tieTime]]]
        try restored.importBackup(JSONSerialization.data(withJSONObject: payload))
        precondition(restored.memory["fr"]?["a"]?.stage == 0, "Equal-time imports cannot erase a more conservative reset")
        payload["memory"] = ["fr": ["a": ["stage": 0, "dueAt": tieDue, "updatedAt": tieTime]]]
        try restored.importBackup(JSONSerialization.data(withJSONObject: payload))
        precondition(restored.memory["fr"]?["a"]?.dueAt == tieDue, "Same-stage ties preserve the later due time")
        let memoryBeforeOldBackup = restored.memory
        payload.removeValue(forKey: "memory")
        payload["progress"] = ["fr": ["b": 2]]
        try restored.importBackup(JSONSerialization.data(withJSONObject: payload))
        precondition(restored.memory == memoryBeforeOldBackup, "Old backups do not erase schedules")

        for invalid in [
            ["app": "mots", "version": true, "ratings": ["a": 3]],
            ["app": "mots", "version": 3, "progress": ["fr": ["a": 3]], "memory": NSNull()]
        ] as [[String: Any]] {
            do {
                try restored.importBackup(JSONSerialization.data(withJSONObject: invalid))
                preconditionFailure("Malformed backup must reject before applying any ratings or schedules")
            } catch {}
            precondition(restored.rating(catalog[0].words[0]) == 2 && restored.memory == memoryBeforeOldBackup)
        }

        for raw in [
            ["stage": 1, "dueAt": 0, "updatedAt": 1],
            ["stage": 9, "dueAt": 1, "updatedAt": 1],
            ["stage": 1, "dueAt": MemoryRecord.maxTimestamp + 1, "updatedAt": 1],
            ["stage": 1, "dueAt": 100, "updatedAt": 1, "extra": 0]
        ] {
            do {
                _ = try JSONDecoder().decode(MemoryRecord.self, from: JSONSerialization.data(withJSONObject: raw))
                preconditionFailure("Invalid Web-incompatible memory record accepted")
            } catch {}
        }

        // Cross-device schedules preserve current local edits and prune stale due cards.
        let sender = self.store()
        let receiver = self.store()
        let currentDate = Date()
        sender.openMemory(); sender.selectMemoryChapters(["1"]); sender.startMemoryRound(at: currentDate)
        receiver.openMemory(); receiver.selectMemoryChapters(["1"]); receiver.startMemoryRound(at: currentDate)
        precondition(sender.answerMemory(wordID: "a", remembered: true, at: currentDate))
        let sent = try sender.memorySnapshot()
        let encodedSchedule = try JSONSerialization.data(withJSONObject: ["version": 1,
            "records": try JSONSerialization.jsonObject(with: JSONEncoder().encode(sent))])
        try receiver.mergeMemorySnapshot(MemorySyncRecord.decodeEnvelope(encodedSchedule))
        precondition(receiver.memory["fr"]?["a"] == sender.memory["fr"]?["a"] && receiver.currentWord?.id != "a",
            "An answer elsewhere removes a stale card without rating or answering the next card")
        precondition(receiver.rating(catalog[0].words[0]) == 2)
        let pausedReceiver = self.store()
        pausedReceiver.openMemory(); pausedReceiver.startMemoryRound(at: currentDate)
        pausedReceiver.revealed = true; pausedReceiver.leaveMemoryRound()
        try pausedReceiver.mergeMemorySnapshot(sent)
        pausedReceiver.resumeMemoryRound()
        precondition(pausedReceiver.filteredWords.map(\.id) == ["b"] && !pausedReceiver.revealed &&
                     pausedReceiver.answerMemory(wordID: "b", remembered: true, at: currentDate) && pausedReceiver.completed,
                     "Resuming after sync skips a card answered elsewhere and the remaining round can finish")
        let recent = MemoryRecord.milliseconds(currentDate) + 1
        try receiver.mergeMemorySnapshot([MemorySyncRecord(dictionaryID: "fr", wordID: "a", stage: 0,
            dueAt: recent + 86_400_000, updatedAt: recent)])
        try receiver.mergeMemorySnapshot(sent)
        precondition(receiver.memory["fr"]?["a"]?.stage == 0, "A stale response cannot overwrite a newer local lapse")
        let beforeMalformed = receiver.memory
        do {
            try receiver.mergeMemorySnapshot([MemorySyncRecord(dictionaryID: "fr", wordID: "b", stage: 1,
                dueAt: recent, updatedAt: recent), MemorySyncRecord(dictionaryID: "fr", wordID: "bad", stage: 6,
                dueAt: recent, updatedAt: recent)])
            preconditionFailure("Malformed schedules must reject the whole batch")
        } catch {}
        precondition(receiver.memory == beforeMalformed)

        let accented = "é", decomposed = "e\u{301}"
        let unicodeStore = StudyStore(catalog: [StudyDictionary(id: "fr", title: "Test", language: "fr",
            categories: categories, words: [word(accented)])], persistenceURL: nil)
        func schedule(_ book: String, _ id: String) -> MemorySyncRecord {
            MemorySyncRecord(dictionaryID: book, wordID: id, stage: 1, dueAt: recent, updatedAt: recent)
        }
        try unicodeStore.mergeMemorySnapshot([schedule("unknown", decomposed), schedule(accented, "word")])
        let validUnicode = try unicodeStore.memorySnapshot()
        precondition(validUnicode.count == 2 && validUnicode.contains { $0.wordID.utf8.elementsEqual(decomposed.utf8) })
        for collision in [schedule("fr", decomposed), schedule("unknown", accented), schedule(decomposed, "word")] {
            do {
                try unicodeStore.mergeMemorySnapshot([schedule("fr", "extra"), collision])
                preconditionFailure("Canonically equivalent IDs must not overwrite another known or stored key")
            } catch ProgressSyncError.memoryIDCollision {}
        }
        let afterCollisions = try unicodeStore.memorySnapshot()
        precondition(afterCollisions == validUnicode)

        // Manual and remote familiarity changes retain resets against old backup resurrection.
        let relearning = self.store()
        let oldStamp = MemoryRecord.milliseconds(now)
        let oldPayload: [String: Any] = ["app": "mots", "version": 3, "progress": ["fr": ["a": 2]],
            "memory": ["fr": ["a": ["stage": 8, "dueAt": oldStamp + 1_000, "updatedAt": oldStamp]]]]
        let oldBackup = try JSONSerialization.data(withJSONObject: oldPayload)
        try relearning.importBackup(oldBackup)
        relearning.openMemory()
        relearning.rate(catalog[0].words[0], level: 3)
        relearning.rate(catalog[0].words[0], level: 2)
        let manualReset = relearning.memory["fr"]!["a"]!
        precondition(manualReset.stage == 0 && manualReset.dueAt == manualReset.updatedAt)
        try relearning.importBackup(oldBackup)
        precondition(relearning.memory["fr"]?["a"] == manualReset, "Older stage8 backup cannot resurrect a manually reset cycle")
        try relearning.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: "a", level: 3,
            clock: 100, deviceID: String(repeating: "b", count: 32))])
        let remoteReset = relearning.memory["fr"]!["a"]!
        precondition(remoteReset.stage == 0)
        try relearning.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: "a", level: 3,
            clock: 100, deviceID: String(repeating: "b", count: 32))])
        precondition(relearning.memory["fr"]?["a"] == remoteReset, "Unchanged sync does not repeatedly rewrite the reset timestamp")
        try relearning.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: "a", level: 2,
            clock: 101, deviceID: String(repeating: "b", count: 32))])
        let remoteRelearnReset = relearning.memory["fr"]!["a"]!
        try relearning.importBackup(oldBackup)
        precondition(relearning.memory["fr"]?["a"] == remoteRelearnReset,
                     "Older stage8 backup cannot resurrect a remotely reset cycle")

        // Remote mastery/deletion removes the current card and rejects its stale answer.
        let remote = self.store()
        remote.openMemory(); remote.startMemoryRound(at: now); remote.revealed = true
        try remote.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: "a", level: 3,
            clock: 100, deviceID: String(repeating: "a", count: 32))])
        precondition(remote.currentWord?.id == "b" && !remote.revealed)
        precondition(!remote.answerMemory(wordID: "a", remembered: true, at: now))
        _ = remote.deleteWord(catalog[0].words[1])
        precondition(remote.completed && remote.currentWord == nil)
        _ = remote.restoreWord("b")
        precondition(remote.currentWord == nil, "Restoration waits until next round")

        // Dictionary isolation, vocab-only routing and local storage round trip.
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let path = dir.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: dir) }
        let persisted = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        persisted.rate(catalog[0].words[0], level: 2); persisted.openMemory()
        persisted.selectMemoryChapters(["1"]); persisted.startMemoryRound(at: now); persisted.revealed = true
        _ = persisted.answerMemory(wordID: "a", remembered: true, at: now)
        let reopened = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(reopened.memory == persisted.memory && reopened.selectedMemoryChapters == ["1"])
        precondition(reopened.memorySessionActive && reopened.completed && reopened.memoryAnsweredCount == 1,
                     "Reopen retains the completed round instead of rebuilding")
        reopened.dictionaryID = "de"
        precondition(reopened.memoryWords.isEmpty && reopened.memory["de"] == nil)
        reopened.dictionaryID = "grammar-fr"
        precondition(reopened.mode == .study)
        reopened.openMemory()
        precondition(reopened.mode == .study)
        try testShuffledRound()
        try testSessionResume()
        try testUnboundedSession()
        try testLegacyScheduleMigration()
        try testConsecutiveForgetting()
        try testDirectMastery()
        print("MemoryStudyTests passed")
    }

    @MainActor static func testDirectMastery() throws {
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("memory-direct-mastery-\(UUID().uuidString)")
        let path = directory.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let first = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        first.listMode = true
        first.rate(catalog[0].words[0], level: 2); first.rate(catalog[0].words[1], level: 2)
        let stamp = MemoryRecord.milliseconds(now)
        let prior = MemorySyncRecord(dictionaryID: "fr", wordID: "a", stage: 0, dueAt: stamp, updatedAt: stamp)
        try first.mergeMemorySnapshot([prior])
        precondition(!first.markMemoryMastered(wordID: "a", at: now), "Study mode cannot execute a memory-only action")
        first.openMemory(); first.selectMemoryChapters(["1", "2"]); first.startMemoryRound(at: now)
        precondition(first.currentWord?.id == "a" && !first.revealed)
        precondition(!first.markMemoryMastered(wordID: "b", at: now), "Non-current callbacks cannot master another card")
        precondition(!first.markMemoryMastered(wordID: "a", at: now.addingTimeInterval(-0.001)), "Early callbacks remain rejected")
        first.meaningLanguage = "de"
        precondition(first.markMemoryMastered(wordID: "a", at: now), "Explicit mastery needs neither reveal nor a selected-language meaning")
        let mastered = first.memory["fr"]!["a"]!
        precondition(first.rating(catalog[0].words[0]) == 3 && mastered.stage == MemoryRecord.masteryStage && mastered.dueAt == 0)
        precondition(mastered.updatedAt == stamp + 1, "Same-millisecond mastery outranks the prior lower-stage schedule")
        precondition(first.currentWord?.id == "b" && !first.revealed && first.memoryAnsweredCount == 1 && first.memoryMasteredCount == 1)
        precondition(first.memoryFeedback == "已轉為已掌握")
        precondition(!first.markMemoryMastered(wordID: "a", at: now), "Repeated callbacks cannot advance or recount mastery")
        try first.mergeMemorySnapshot([prior])
        precondition(first.memory["fr"]?["a"] == mastered, "Stale schedules cannot replace explicit mastery")
        first.leaveMemoryRound()
        precondition(!first.markMemoryMastered(wordID: "b", at: now), "Paused rounds reject mastery callbacks")
        first.resumeMemoryRound()
        precondition(first.currentWord?.id == "b" && first.memoryAnsweredCount == 1)
        precondition(first.answerMemory(wordID: "b", remembered: false, at: now))
        precondition(first.completed && first.memoryAnsweredCount == 2 && first.memoryMasteredCount == 1)

        let reopened = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(reopened.completed && reopened.memoryAnsweredCount == 2 && reopened.memoryMasteredCount == 1 && reopened.memory["fr"]?["a"] == mastered,
                     "Mastery and the actual one-card result survive reopening")
        precondition(!reopened.markMemoryMastered(wordID: "a", at: now), "Completed rounds reject callbacks")
        let receiver = self.store()
        try receiver.mergeSyncSnapshot(first.syncSnapshot())
        try receiver.mergeMemorySnapshot(first.memorySnapshot())
        precondition(receiver.rating(catalog[0].words[0]) == 3 && receiver.memory["fr"]?["a"] == mastered,
                     "Explicit mastery travels through both existing sync channels")
        precondition(!receiver.memoryDueWords(at: now.addingTimeInterval(30 * 86_400)).contains { $0.id == "a" })
        reopened.rate(catalog[0].words[0], level: 2)
        let reset = reopened.memory["fr"]!["a"]!
        precondition(reset.stage == 0 && reset.dueAt == reset.updatedAt && reset.updatedAt > mastered.updatedAt,
                     "An explicit later familiarity change can restart a manually mastered word")

        let mismatched = self.store()
        try mismatched.mergeMemorySnapshot([MemorySyncRecord(dictionaryID: "fr", wordID: "a", stage: MemoryRecord.masteryStage,
            dueAt: 0, updatedAt: stamp)])
        mismatched.openMemory(); mismatched.selectMemoryChapters(["1"]); mismatched.startMemoryRound(at: now)
        precondition(mismatched.currentWord?.id == "a" && mismatched.rating(catalog[0].words[0]) == 2)
        precondition(mismatched.markMemoryMastered(wordID: "a", at: now) && mismatched.memory["fr"]?["a"]?.updatedAt == stamp + 1,
                     "A completed schedule arriving before familiarity can still accept current-card mastery")

        let deleted = self.store()
        deleted.openMemory(); deleted.startMemoryRound(at: now)
        _ = deleted.deleteWord(catalog[0].words[0])
        precondition(!deleted.markMemoryMastered(wordID: "a", at: now), "Deleted/currently removed cards reject mastery callbacks")
    }

    @MainActor static func testConsecutiveForgetting() throws {
        let entry = catalog[0].words[0]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("memory-lapses-\(UUID().uuidString)")
        let path = directory.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let first = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        first.rate(entry, level: 2)
        first.openMemory(); first.selectMemoryChapters(["1"]); first.startMemoryRound(at: now)
        precondition(first.answerMemory(wordID: entry.id, remembered: false, at: now))
        precondition(first.rating(entry) == 2, "One forgotten answer leaves partial familiarity unchanged")
        precondition(first.memoryLapseWords.map(\.id) == [entry.id], "A single miss appears immediately, before the next due date")
        precondition(!first.answerMemory(wordID: entry.id, remembered: false, at: now),
                     "A duplicate answer cannot count as a second lapse")
        first.startMemoryRound(at: now.addingTimeInterval(86_399))
        precondition(!first.answerMemory(wordID: entry.id, remembered: false, at: now.addingTimeInterval(86_399)),
                     "An early revisit cannot count as a second lapse")

        let second = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(second.memoryLapseWords.map(\.id) == [entry.id], "The list derives from existing saved records")
        let nextDay = now.addingTimeInterval(86_400)
        second.startMemoryRound(at: nextDay)
        precondition(second.answerMemory(wordID: entry.id, remembered: false, at: nextDay))
        precondition(second.rating(entry) == 1 && second.memoryWords.isEmpty && second.completed,
                     "Two consecutive accepted lapses across restart demote and leave card memory")
        precondition(second.memoryLapseWords.isEmpty)
        precondition(second.memoryMasteredCount == 0 && second.memoryFeedback == "連續兩次忘記，已轉為不熟悉")
        let demotedSnapshot = try second.syncSnapshot()
        precondition(demotedSnapshot.contains { $0.wordID == entry.id && $0.level == 1 },
                     "Automatic demotion enters the existing familiarity sync")
        let reopened = StudyStore(catalog: catalog, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(reopened.rating(entry) == 1 && reopened.memory == second.memory,
                     "Automatic demotion and the answered schedule survive reopening")
        let receiver = self.store()
        try receiver.mergeSyncSnapshot(second.syncSnapshot())
        try receiver.mergeMemorySnapshot(second.memorySnapshot())
        precondition(receiver.rating(entry) == 1 && receiver.memory["fr"]?[entry.id] == second.memory["fr"]?[entry.id],
                     "Another device receives the demotion with its answer history")

        // A manually restarted cycle must not treat its dated reset as an actual forgotten answer.
        reopened.listMode = true
        reopened.rate(entry, level: 2)
        let reset = reopened.memory["fr"]![entry.id]!
        precondition(reset.stage == 0 && reset.dueAt == reset.updatedAt)
        precondition(reopened.memoryLapseWords.isEmpty, "Returning a word to partial recall manually does not count as a miss")
        let restartedAt = Date(timeIntervalSince1970: reset.dueAt / 1000)
        reopened.startMemoryRound(at: restartedAt)
        precondition(reopened.answerMemory(wordID: entry.id, remembered: false, at: restartedAt))
        precondition(reopened.rating(entry) == 2, "The first miss after a manual reset stays partially familiar")

        // Any successful answer breaks the run of forgotten answers.
        let interrupted = self.store()
        interrupted.openMemory(); interrupted.selectMemoryChapters(["1"])
        for (day, remembered) in [(0.0, false), (1.0, true), (2.0, false)] {
            let date = now.addingTimeInterval(day * 86_400)
            interrupted.startMemoryRound(at: date)
            precondition(interrupted.answerMemory(wordID: entry.id, remembered: remembered, at: date))
            precondition(interrupted.rating(entry) == 2, "A successful recall clears the consecutive-forgetting run")
            precondition(interrupted.memoryLapseWords.map(\.id) == (remembered ? [] : [entry.id]))
        }
        interrupted.selectMemoryChapters(["2"])
        precondition(interrupted.memoryLapseWords.map(\.id) == [entry.id], "The book-wide list includes unselected chapters")
        interrupted.dictionaryID = "de"
        precondition(interrupted.memoryLapseWords.isEmpty, "Identical word IDs in different dictionaries stay separate")
        interrupted.dictionaryID = "fr"
        _ = interrupted.deleteWord(entry)
        precondition(interrupted.memoryLapseWords.isEmpty, "A deleted word disappears from the list")
    }

    @MainActor static func testShuffledRound() throws {
        let scope = categories + [StudyCategory(id: "3", name: "第三章",
            subcategories: [StudySubcategory(id: "3.01", name: "子類")])]
        let words = [word("a"), word("b", chapter: "2"), word("c"), word("d", chapter: "2"),
                     word("future"), word("deleted"), word("outside", chapter: "3"),
                     word("unseen"), word("unfamiliar"), word("mastered")]
        let books = [StudyDictionary(id: "fr", title: "法語", language: "fr", categories: scope, words: words), catalog[1]]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("memory-shuffle-\(UUID().uuidString)")
        let path = directory.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        var inputs: [[String]] = []
        let order: ([StudyWord]) -> [StudyWord] = { candidates in
            inputs.append(candidates.map(\.id))
            if inputs.count.isMultiple(of: 2) { return Array(candidates.dropFirst()) + Array(candidates.prefix(1)) }
            return Array(candidates.reversed())
        }
        let first = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: order)
        for word in words.prefix(7) { first.rate(word, level: 2) }
        first.rate(words[8], level: 1); first.rate(words[9], level: 3)
        let stamp = MemoryRecord.milliseconds(now)
        let schedule: [String: Any] = ["app": "mots", "version": 3,
            "progress": ["fr": ["future": 2]],
            "memory": ["fr": ["future": ["stage": 1, "dueAt": stamp + 86_400_000, "updatedAt": stamp]]]]
        try first.importBackup(JSONSerialization.data(withJSONObject: schedule))
        precondition(first.deleteWord(words[5]))
        first.search = "nothing"; first.categoryID = "3"; first.subcategoryID = "3.01"
        first.hideImpression = true; first.hideMastered = true; first.randomOrder = false
        first.openMemory()
        first.startMemoryRound(at: now)
        precondition(inputs.isEmpty && !first.memorySessionActive,
                     "Starting without eligible selected chapters does not shuffle")
        first.selectMemoryChapters(["1", "2"])
        let expected = ["a", "b", "c", "d"]
        precondition(first.memoryDueWords(at: now).map(\.id) == expected)
        first.startMemoryRound(at: now)
        let savedOrder = first.filteredWords.map(\.id)
        precondition(inputs == [expected] && savedOrder == Array(expected.reversed()),
                     "Each explicit new round shuffles the full eligible due set exactly once, even with thematic order disabled")
        precondition(Set(savedOrder) == Set(expected) && savedOrder.count == Set(savedOrder).count,
                     "Selected due partial-recall words occur once; future, deleted, unselected and other familiarity levels stay excluded")
        first.revealed = true
        first.openMemory()
        precondition(inputs.count == 1 && first.filteredWords.map(\.id) == savedOrder && first.revealed)
        precondition(first.answerMemory(wordID: "d", remembered: true, at: now))
        precondition(inputs.count == 1 && first.filteredWords.map(\.id) == savedOrder &&
                     first.currentWord?.id == "c" && !first.revealed && first.memoryAnsweredCount == 1,
                     "Answering advances through the captured shuffled round without reordering it")
        first.revealed = true
        first.leaveMemoryRound(); first.resumeMemoryRound()
        first.randomOrder = true
        first.mode = .lookup; first.openMemory()
        first.dictionaryID = "de"; first.dictionaryID = "fr"
        precondition(inputs.count == 1 && first.filteredWords.map(\.id) == savedOrder &&
                     first.currentWord?.id == "c" && first.revealed,
                     "Reveal, pause/continue, thematic order, mode changes and book switches keep the captured permutation")
        let cold = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: order)
        precondition(inputs.count == 1 && cold.filteredWords.map(\.id) == savedOrder && cold.currentWord?.id == "c" &&
                     cold.revealed && cold.memoryAnsweredCount == 1,
                     "Cold restart restores the actual shuffled IDs, position, reveal and counters without invoking shuffle")
        cold.leaveMemoryRound(); cold.selectMemoryChapters(["1"]); cold.resumeMemoryRound()
        precondition(inputs.count == 1 && cold.filteredWords.map(\.id) == savedOrder && cold.currentWord?.id == "c",
                     "Changing future chapter choices never recaptures or reorders a saved round")
        cold.selectMemoryChapters(["1", "2"])
        cold.startMemoryRound(at: now)
        precondition(inputs.count == 2 && inputs[1] == ["a", "b", "c"] &&
                     cold.filteredWords.map(\.id) == ["b", "c", "a"] && cold.memoryAnsweredCount == 0 && !cold.revealed,
                     "Only an explicit new round invokes shuffle again and excludes answered cards until their next due time")
        cold.startMemoryRound(at: now.addingTimeInterval(86_400))
        precondition(inputs.count == 3 && Set(inputs[2]) == Set(expected + ["future"]) && inputs[2].count == 5 &&
                     cold.filteredWords.map(\.id) == Array(inputs[2].reversed()),
                     "Previously future cards join the full shuffled set exactly at their due time")

        // Exercise the production default without asserting a probabilistic permutation.
        let random = StudyStore(catalog: books, persistenceURL: nil)
        for word in words.prefix(4) { random.rate(word, level: 2) }
        random.openMemory(); random.selectMemoryChapters(["1", "2"]); random.startMemoryRound(at: now)
        precondition(Set(random.filteredWords.map(\.id)) == Set(expected) && random.filteredWords.count == expected.count,
                     "The default random ordering preserves complete membership without duplicates")
    }

    @MainActor static func testSessionResume() throws {
        let words = [word("a"), word("b", chapter: "2"), word("c"), word("newly-due", chapter: "2")]
        let books = [StudyDictionary(id: "fr", title: "法語", language: "fr", categories: categories, words: words), catalog[1]]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("memory-resume-\(UUID().uuidString)")
        let path = directory.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let first = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        first.listMode = true
        for word in words.prefix(3) { first.rate(word, level: 2) }
        first.openMemory(); first.selectMemoryChapters(["1", "2"]); first.startMemoryRound(at: now)
        first.revealed = true
        precondition(first.answerMemory(wordID: "a", remembered: true, at: now))
        first.revealed = true
        let savedOrder = first.filteredWords.map(\.id)
        let savedSchedule = first.memory
        let partialStateBytes = try Data(contentsOf: path)

        let cold = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(cold.mode == .memory && cold.memorySessionActive && !cold.completed)
        precondition(cold.filteredWords.map(\.id) == savedOrder && cold.currentWord?.id == "b" && cold.currentIndex == 1)
        precondition(cold.revealed && cold.memoryAnsweredCount == 1 && cold.memoryMasteredCount == 0)
        precondition(cold.memory == savedSchedule && !cold.answerMemory(wordID: "a", remembered: true, at: now),
                     "Cold restart retains the queue, position, reveal and rating bookkeeping")
        cold.openMemory()
        precondition(cold.currentWord?.id == "b" && cold.revealed, "Clicking memory again does not reset it")

        cold.mode = .lookup
        cold.rate(words[3], level: 2)
        cold.openMemory()
        precondition(cold.filteredWords.map(\.id) == savedOrder && cold.currentWord?.id == "b" && cold.revealed,
                     "Mode reentry retains the captured queue without adding a newly eligible word")
        cold.mode = .study
        cold.dictionaryID = "de"
        cold.rate(books[1].words[0], level: 2)
        cold.openMemory(); cold.selectMemoryChapters(["1"]); cold.startMemoryRound(at: now); cold.revealed = true
        cold.dictionaryID = "fr"
        precondition(cold.currentWord?.id == "b" && cold.filteredWords.map(\.id) == savedOrder && cold.revealed)
        precondition(cold.selectedMemoryChapters == ["1", "2"], "Chapters and sessions are independent for each book")
        cold.dictionaryID = "de"
        let secondCold = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(secondCold.dictionaryID == "de" && secondCold.currentWord?.id == "a" && secondCold.revealed)
        secondCold.dictionaryID = "fr"
        precondition(secondCold.currentWord?.id == "b" && secondCold.revealed)

        secondCold.leaveMemoryRound()
        let paused = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(!paused.memorySessionActive && paused.hasUnfinishedMemoryRound && paused.currentWord == nil,
                     "Returning to chapter selection pauses rather than deleting the round")
        paused.selectMemoryChapters(["1"])
        paused.resumeMemoryRound()
        precondition(paused.currentWord?.id == "b" && paused.filteredWords.map(\.id) == savedOrder && paused.revealed,
                     "Continue restores the prior round even if chapter choices were changed for a future round")
        precondition(paused.selectedMemoryChapters == ["1"] && paused.memoryAnsweredCount == 1)
        precondition(!paused.filteredWords.contains { $0.id == "newly-due" })

        try paused.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID: "fr", wordID: "b", level: 1,
            clock: 100, deviceID: String(repeating: "c", count: 32))])
        precondition(paused.currentWord?.id == "c" && !paused.revealed && paused.filteredWords.map(\.id) == ["a", "c"],
                     "A remote rating removes only an invalid pending member and hides the new current answer")
        precondition(paused.deleteWord(words[2]))
        precondition(paused.completed && paused.memoryAnsweredCount == 1 && paused.filteredWords.map(\.id) == ["a"])
        precondition(paused.restoreWord("c"))
        let complete = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(complete.memorySessionActive && complete.completed && complete.memoryAnsweredCount == 1 &&
                     complete.filteredWords.map(\.id) == ["a"], "Completed summary and actual counters persist; restoration does not add cards")
        precondition(!complete.answerMemory(wordID: "a", remembered: true, at: now.addingTimeInterval(30 * 86400)),
                     "Reopening after a long delay never rerates answered members")
        let transfer = try JSONSerialization.jsonObject(with: complete.exportBackup()) as! [String: Any]
        precondition(transfer["memorySessions"] == nil && transfer["memory"] != nil,
                     "Transfer backups contain schedules, not local captured sessions")

        var saved = try JSONSerialization.jsonObject(with: Data(contentsOf: path)) as! [String: Any]
        let validSessions = saved["memorySessions"] as! [String: Any]
        saved["memorySessions"] = ["fr": ["deckIDs": true], "de": validSessions["de"]!]
        try JSONSerialization.data(withJSONObject: saved).write(to: path)
        let damaged = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(damaged.storageError == nil && damaged.rating(words[0]) == 2 && damaged.memory == complete.memory,
                     "One damaged session never quarantines unrelated learning data")
        damaged.dictionaryID = "de"
        precondition(damaged.memorySessionActive && damaged.currentWord?.id == "a" && damaged.revealed,
                     "Other valid book sessions survive a damaged entry")
        saved.removeValue(forKey: "memorySessions")
        try JSONSerialization.data(withJSONObject: saved).write(to: path)
        let legacy = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(legacy.storageError == nil && legacy.memorySessionActive && legacy.completed &&
                     legacy.memory == complete.memory && legacy.memoryAnsweredCount == 1,
                     "Build4 completed rounds migrate from their saved deck and position")
        var legacyPartialState = try JSONSerialization.jsonObject(with: partialStateBytes) as! [String: Any]
        legacyPartialState.removeValue(forKey: "memorySessions")
        try JSONSerialization.data(withJSONObject: legacyPartialState).write(to: path)
        let legacyPartial = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(legacyPartial.currentWord?.id == "b" && legacyPartial.currentIndex == 1 &&
                     legacyPartial.filteredWords.map(\.id) == savedOrder && legacyPartial.memoryAnsweredCount == 1 &&
                     !legacyPartial.revealed && legacyPartial.memory == savedSchedule,
                     "Build4 partial rounds migrate exact order/index and inferred sequential answers; unavailable reveal stays hidden")
        legacyPartialState["currentIndex"] = 99
        try JSONSerialization.data(withJSONObject: legacyPartialState).write(to: path)
        let invalidLegacy = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(invalidLegacy.storageError == nil && !invalidLegacy.memorySessionActive && invalidLegacy.memory == savedSchedule,
                     "Invalid legacy positions do not invent a resumed round or erase schedules")

        let dormantPath = directory.appendingPathComponent("dormant.json")
        let dormant = StudyStore(catalog: books, persistenceURL: dormantPath, memoryRoundOrder: { $0 })
        dormant.listMode = true
        for word in words.prefix(3) { dormant.rate(word, level: 2) }
        dormant.openMemory(); dormant.selectMemoryChapters(["1", "2"]); dormant.startMemoryRound(at: now); dormant.revealed = true
        precondition(dormant.answerMemory(wordID: "a", remembered: true, at: now))
        dormant.revealed = true; dormant.mode = .lookup
        precondition(dormant.deleteWord(words[1]))
        let dormantCold = StudyStore(catalog: books, persistenceURL: dormantPath, memoryRoundOrder: { $0 })
        dormantCold.openMemory()
        precondition(dormantCold.currentWord?.id == "c" && !dormantCold.revealed &&
                     dormantCold.filteredWords.map(\.id) == ["a", "c"] && dormantCold.memoryAnsweredCount == 1,
                     "Cold entry reconciles a dormant session without adding replacements or losing completed answers")
    }

    @MainActor static func testUnboundedSession() throws {
        let words = (0..<45).map { word("long-round-\($0)") }
        let books = [StudyDictionary(id: "fr", title: "法語", language: "fr", categories: categories, words: words)]
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("memory-unbounded-\(UUID().uuidString)")
        let path = directory.appendingPathComponent("study.json")
        defer { try? FileManager.default.removeItem(at: directory) }
        let first = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        for word in words { first.rate(word, level: 2) }
        first.openMemory(); first.selectMemoryChapters(["1"]); first.startMemoryRound(at: now)
        precondition(first.filteredWords.map(\.id) == words.map(\.id))
        for word in words.prefix(31) {
            first.revealed = true
            precondition(first.answerMemory(wordID: word.id, remembered: true, at: now))
        }
        let reopened = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(reopened.filteredWords.map(\.id) == words.map(\.id) && reopened.currentWord?.id == words[31].id &&
                     reopened.currentIndex == 31 && reopened.memoryAnsweredCount == 31,
                     "Round sizes, positions and answer counts beyond twenty survive restart")
        reopened.leaveMemoryRound(); reopened.selectMemoryChapters([])
        let paused = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(paused.selectedMemoryChapters.isEmpty && paused.hasUnfinishedMemoryRound)
        paused.resumeMemoryRound()
        precondition(paused.currentWord?.id == words[31].id && paused.filteredWords.count == words.count,
                     "Saved long rounds resume independently of a cleared next-round chapter choice")
        for word in words.dropFirst(31) {
            paused.revealed = true
            precondition(paused.answerMemory(wordID: word.id, remembered: true, at: now))
        }
        let completed = StudyStore(catalog: books, persistenceURL: path, memoryRoundOrder: { $0 })
        precondition(completed.completed && completed.memoryAnsweredCount == words.count &&
                     completed.filteredWords.map(\.id) == words.map(\.id),
                     "Completed unbounded rounds keep all words and exact counts")
    }

    @MainActor static func testLegacyScheduleMigration() throws {
        let stamp = MemoryRecord.milliseconds(now)
        for oldStage in 5...8 {
            let raw: [String: Any] = ["stage": oldStage, "dueAt": stamp + 86_400_000, "updatedAt": stamp]
            let migrated = try JSONDecoder().decode(MemoryRecord.self, from: JSONSerialization.data(withJSONObject: raw))
            precondition(migrated.stage == 4 && migrated.dueAt == stamp + 86_400_000 && migrated.updatedAt == stamp,
                         "Legacy pending stages retain their due time and need a real final recall")
            let roundTrip = try JSONDecoder().decode(MemoryRecord.self, from: JSONEncoder().encode(migrated))
            precondition(roundTrip == migrated)
        }
        let legacyMastered: [String: Any] = ["stage": 9, "dueAt": 0, "updatedAt": stamp]
        let mastered = try JSONDecoder().decode(MemoryRecord.self, from: JSONSerialization.data(withJSONObject: legacyMastered))
        precondition(mastered.stage == 5 && mastered.dueAt == 0 && mastered.updatedAt == stamp)
        let source: [String: Any] = ["app": "mots", "version": 3, "progress": ["fr": ["a": 2, "b": 3]],
            "memory": ["fr": ["a": ["stage": 8, "dueAt": stamp + 86_400_000, "updatedAt": stamp], "b": legacyMastered]]]
        let store = self.store()
        try store.importBackup(JSONSerialization.data(withJSONObject: source))
        precondition(store.memory["fr"]?["a"]?.stage == 4 && store.rating(catalog[0].words[0]) == 2,
                     "Importing an old pending schedule does not mark the word mastered")
        precondition(store.memory["fr"]?["b"]?.stage == 5 && store.rating(catalog[0].words[1]) == 3,
                     "Old mastered words retain their familiarity and normalize to stage five")
        store.openMemory(); store.selectMemoryChapters(["1"])
        store.startMemoryRound(at: now.addingTimeInterval(86_400)); store.revealed = true
        precondition(store.answerMemory(wordID: "a", remembered: true, at: now.addingTimeInterval(86_400)))
        precondition(store.memory["fr"]?["a"]?.stage == 5 && store.rating(catalog[0].words[0]) == 3)
        let exported = try JSONSerialization.jsonObject(with: store.exportBackup()) as! [String: Any]
        let exportedMemory = exported["memory"] as! [String: [String: [String: Any]]]
        precondition((exportedMemory["fr"]?["a"]?["stage"] as? NSNumber)?.intValue == 5 &&
                     (exportedMemory["fr"]?["b"]?["stage"] as? NSNumber)?.intValue == 5,
                     "New backups emit canonical five-recall stages")
    }
}
