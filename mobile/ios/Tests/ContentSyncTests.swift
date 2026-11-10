import Foundation

private final class ContentCredentials:ProgressSyncCredentials {
    var value:String?
    func read() throws ->String? { value }
    func write(_ code:String?) throws { value=code }
}
private final class ContentURLProtocol:URLProtocol,@unchecked Sendable {
    static var handler:((URLRequest)->(Int,Data))?
    override class func canInit(with request:URLRequest)->Bool { true }
    override class func canonicalRequest(for request:URLRequest)->URLRequest { request }
    override func startLoading() {
        let (status,data)=Self.handler!(request)
        let response=HTTPURLResponse(url:request.url!,statusCode:status,httpVersion:"HTTP/1.1",headerFields:["Content-Type":"application/json"])!
        client?.urlProtocol(self,didReceive:response,cacheStoragePolicy:.notAllowed);client?.urlProtocol(self,didLoad:data);client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}

@main struct ContentSyncTests {
    static func data(_ value:Any)throws->Data { try JSONSerialization.data(withJSONObject:value,options:[.sortedKeys,.withoutEscapingSlashes]) }
    static func rejects(_ action:() throws ->Void) { do { try action() } catch { return };preconditionFailure("Invalid content must reject before applying") }
    static func source(title:String="Shared",first:String="alpha",second:String="beta",extra:Bool=false)->[String:Any] {
        var words:[[String:Any]]=[
            ["id":"a","term":first,"meaning":"甲","category":"1","subcategory":"1.01"],
            ["id":"b","term":second,"meaning":"乙","category":"1","subcategory":"1.01"]]
        if extra { words.append(["id":"c","term":"gamma","meaning":"丙","category":"1","subcategory":"1.01"]) }
        return ["id":"dict-shared","title":title,"language":"fr","kind":"vocabulary","categories":[["id":"1","name":"Unit","subcategories":[["id":"1.01","name":"Words"]]]],"words":words]
    }
    static func body(_ request:URLRequest)->Data {
        if let data=request.httpBody { return data }
        guard let stream=request.httpBodyStream else { return Data() }
        stream.open();defer{stream.close()};var data=Data();var buffer=[UInt8](repeating:0,count:4096)
        while stream.hasBytesAvailable { let n=stream.read(&buffer,maxLength:buffer.count);if n<=0 { break };data.append(contentsOf:buffer.prefix(n)) }
        return data
    }
    @MainActor static func waitFor(_ condition:()->Bool) async {
        for _ in 0..<300 { if condition() { return };try? await Task.sleep(nanoseconds:20_000_000) }
        preconditionFailure("Content transport failed to converge")
    }
    @MainActor static func main() async throws {
        let catalogData=try Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))
        let catalog=try JSONDecoder().decode([StudyDictionary].self,from:catalogData)
        let oldCatalog=catalog.filter{$0.id != "vocab-ja-n2-hongbao"}
        let dir=FileManager.default.temporaryDirectory.appendingPathComponent("mots-content-tests-\(UUID().uuidString)")
        defer{try? FileManager.default.removeItem(at:dir)}
        let path=dir.appendingPathComponent("state.json")
        let first=StudyStore(catalog:oldCatalog,persistenceURL:path)
        first.listMode=true;first.rate(catalog[0].words[0],level:3)
        let n2ID="vocab-ja-n2-hongbao",emptyID="hb-n2-0dada549a204"
        try first.mergeSyncSnapshot([ProgressSyncRecord(dictionaryID:n2ID,wordID:emptyID,level:2,clock:7,deviceID:String(repeating:"a",count:32))])
        try first.mergeMemorySnapshot([MemorySyncRecord(dictionaryID:n2ID,wordID:emptyID,stage:2,dueAt:259201000,updatedAt:1000)])
        try first.applyDownloadedCatalog(catalogData,version:String(repeating:"a",count:64),sha256:ContentLibrary.sha256(catalogData))
        precondition(first.dictionaries.count==10 && first.rating(catalog[0].words[0])==3)
        first.dictionaryID=n2ID
        let empty=first.currentDictionary.words.first{$0.id==emptyID}!
        precondition(first.rating(empty)==2 && first.memory[n2ID]?[emptyID]?.stage==2)
        let saved=try Data(contentsOf:path)
        precondition(saved.count<200_000,"Public dictionary cache must not bloat every progress write")
        let restarted=StudyStore(catalog:oldCatalog,persistenceURL:path)
        precondition(restarted.dictionaries.count==10 && restarted.currentDictionary.isBuiltIn && restarted.rating(empty)==2)
        rejects{try first.applyDownloadedCatalog(catalogData,version:String(repeating:"b",count:64),sha256:String(repeating:"0",count:64))}
        precondition(first.dictionaries.count==10 && first.rating(empty)==2)

        let a=StudyStore(catalog:catalog,persistenceURL:dir.appendingPathComponent("a.json"))
        let b=StudyStore(catalog:catalog,persistenceURL:dir.appendingPathComponent("b.json"))
        _ = try a.importDictionary(data(source()))
        let seeded=try a.contentSnapshot()
        precondition(seeded.count==3 && seeded.allSatisfy{$0.clock>0},"Authored book uploads metadata and words only")
        try b.mergeContentSnapshot(seeded);b.dictionaryID="dict-shared";b.listMode=true
        precondition(b.currentDictionary.words.map(\.term)==["alpha","beta"])
        a.listMode=true;a.selectWord(a.currentDictionary.words[0]);a.revealed=true
        a.rate(a.currentDictionary.words[0],level:2)
        try a.mergeMemorySnapshot([MemorySyncRecord(dictionaryID:"dict-shared",wordID:"a",stage:2,dueAt:259201000,updatedAt:1000)])
        _ = try a.importDictionary(data(source(first:"alpha-edited")))
        _ = try b.importDictionary(data(source(second:"beta-edited",extra:true)))
        let changesA=try a.contentSnapshot(),changesB=try b.contentSnapshot()
        try a.mergeContentSnapshot(changesB);try b.mergeContentSnapshot(changesA)
        precondition(a.currentDictionary.words.map(\.term)==["alpha-edited","beta-edited","gamma"])
        precondition(a.currentDictionary.words==b.currentDictionary.words,"Concurrent different-word edits must merge")
        _ = try a.importDictionary(data(["id":"dict-shared","language":"fr","words":[["id":"c","term":"gamma-updated","meaning":"丙"]]]))
        precondition(a.currentDictionary.words.count==3 && a.currentDictionary.title=="Shared","Partial same-ID import must retain omitted words and book title")
        try b.mergeContentSnapshot(a.contentSnapshot())
        precondition(a.rating(a.currentDictionary.words[0])==2 && a.memory["dict-shared"]?["a"]?.stage==2)
        try a.renameDictionary("dict-shared",title:"Renamed")
        try b.mergeContentSnapshot(a.contentSnapshot());precondition(b.currentDictionary.title=="Renamed")
        a.openMemory();a.selectMemoryChapters(["1"]);a.startMemoryRound();a.revealed=true
        let captured=a.filteredWords.map(\.id)
        try a.archiveDictionary("dict-shared",archived:true)
        precondition(a.mode == .study && !a.memorySessionActive,"Removed active book cannot move its local memory round into the fallback book")
        try b.mergeContentSnapshot(a.contentSnapshot())
        precondition(!b.dictionaries.contains{$0.id=="dict-shared"} && b.archivedDictionaries.first?.title=="Renamed")
        try b.archiveDictionary("dict-shared",archived:false)
        try a.mergeContentSnapshot(b.contentSnapshot());a.dictionaryID="dict-shared"
        precondition(a.currentDictionary.words.count==3 && a.rating(a.currentDictionary.words[0])==2)
        a.openMemory();precondition(a.filteredWords.map(\.id)==captured && a.revealed,"Restoring a book retains its local captured round and reveal state")
        let fromDisk=StudyStore(catalog:catalog,persistenceURL:dir.appendingPathComponent("a.json"))
        precondition(fromDisk.storageError==nil && fromDisk.dictionaries.contains{$0.id=="dict-shared"})
        let backup=try a.exportBackup(),rawBackup=try JSONSerialization.jsonObject(with:backup) as! [String:Any]
        let portable=rawBackup["content"] as! [String:Any]
        precondition((portable["records"] as! [[String:Any]]).allSatisfy{$0["clock"]==nil && $0["deviceID"]==nil})
        let restored=StudyStore(catalog:catalog,persistenceURL:nil)
        _ = try restored.importBackup(backup);restored.dictionaryID="dict-shared"
        precondition(restored.currentDictionary.words==a.currentDictionary.words && restored.memory["dict-shared"]?["a"]?.stage==2)
        let before=try a.contentSnapshot()
        var invalid=source();invalid["language"]="de"
        rejects{_ = try a.importDictionary(data(invalid))}
        let afterInvalid=try a.contentSnapshot();precondition(afterInvalid==before)
        var newCatalog=try JSONSerialization.jsonObject(with:catalogData) as! [[String:Any]]
        var remoteBook=newCatalog.first{$0["id"] as? String==n2ID}!
        remoteBook["id"]="vocab-server-new";remoteBook["title"]="New remote book";remoteBook["words"]=[];newCatalog.append(remoteBook)
        let remoteData=try data(newCatalog)
        try first.applyDownloadedCatalog(remoteData,version:String(repeating:"c",count:64),sha256:ContentLibrary.sha256(remoteData))
        precondition(first.dictionaries.first{$0.id=="vocab-server-new"}!.isBuiltIn)
        let reloaded=StudyStore(catalog:oldCatalog,persistenceURL:path)
        precondition(reloaded.dictionaries.first{$0.id=="vocab-server-new"}!.isBuiltIn)
        let cache=dir.appendingPathComponent("catalog-cache-\(ContentLibrary.sha256(remoteData)).json")
        try Data("broken".utf8).write(to:cache)
        let fallback=StudyStore(catalog:oldCatalog,persistenceURL:path)
        precondition(fallback.loadError != nil && fallback.storageError==nil && fallback.rating(catalog[0].words[0])==3,
                     "Cache corruption must never quarantine or erase learning state")
        let recovered=StudyStore(catalog:oldCatalog,persistenceURL:nil)
        _ = try recovered.importBackup(fallback.exportBackup())
        try recovered.applyDownloadedCatalog(catalogData,version:String(repeating:"a",count:64),sha256:ContentLibrary.sha256(catalogData))
        recovered.dictionaryID=n2ID
        precondition(recovered.rating(empty)==2 && recovered.memory[n2ID]?[emptyID]?.stage==2,
                     "Portable backup retains learning for temporarily unavailable public books")
        let privateWord=StudyWord(id:"private-word",term:"語彙",meaning:"詞彙",category:"1",subcategory:"1.01",language:"ja",reading:"ごい")
        let privateBook=StudyDictionary(id:"vocab-server-new",title:"Private retained book",language:"ja",
            categories:[StudyCategory(id:"1",name:"Words",subcategories:[StudySubcategory(id:"1.01",name:"Items")])],words:[privateWord])
        try first.updateDictionaryContent(privateBook)
        first.dictionaryID=privateBook.id;first.listMode=true;first.rate(privateWord,level:2)
        try first.applyDownloadedCatalog(catalogData,version:String(repeating:"f",count:64),sha256:ContentLibrary.sha256(catalogData))
        precondition(first.currentDictionary.id==privateBook.id && !first.currentDictionary.isBuiltIn)
        let retainedBackup=try first.exportBackup()
        let retainedJSON=try JSONSerialization.jsonObject(with:retainedBackup) as! [String:Any]
        precondition(!(retainedJSON["dictionaries"] as! [[String:Any]]).contains{$0["id"] as? String==privateBook.id},
                     "Non-dict private overlays use portable content, never the legacy custom dictionary validator")
        let privateRestart=StudyStore(catalog:oldCatalog,persistenceURL:path)
        precondition(privateRestart.storageError==nil && privateRestart.dictionaries.first{$0.id==privateBook.id}?.words.first?.term=="語彙")
        let retainedRestore=StudyStore(catalog:catalog,persistenceURL:nil)
        _ = try retainedRestore.importBackup(retainedBackup);retainedRestore.dictionaryID=privateBook.id
        precondition(retainedRestore.currentDictionary.words.first?.term=="語彙" && retainedRestore.rating(privateWord)==2)
        var removedCatalog=try JSONSerialization.jsonObject(with:catalogData) as! [[String:Any]]
        var frenchWords=removedCatalog[0]["words"] as! [[String:Any]]
        let removedID=frenchWords.removeFirst()["id"] as! String;removedCatalog[0]["words"]=frenchWords
        let removedData=try data(removedCatalog),removedPath=dir.appendingPathComponent("removed.json")
        let publisher=StudyStore(catalog:catalog,persistenceURL:removedPath)
        try publisher.applyDownloadedCatalog(removedData,version:String(repeating:"d",count:64),sha256:ContentLibrary.sha256(removedData))
        let publicationRestart=StudyStore(catalog:catalog,persistenceURL:removedPath)
        let migrationSnapshot=try publicationRestart.contentSnapshot()
        precondition(!migrationSnapshot.contains{$0.dictionaryID=="fr" && $0.wordID==removedID},
                     "Old bundled words removed by the publisher are never seeded as authored extensions")
        let legacyPath=dir.appendingPathComponent("legacy-unpaired.json")
        let legacy=StudyStore(catalog:catalog,persistenceURL:legacyPath)
        legacy.dictionaryID=n2ID;legacy.listMode=true;legacy.rate(empty,level:2)
        var legacyState=try JSONSerialization.jsonObject(with:Data(contentsOf:legacyPath)) as! [String:Any]
        legacyState.removeValue(forKey:"syncMetadata");legacyState.removeValue(forKey:"contentMetadata")
        try data(legacyState).write(to:legacyPath)
        let upgraded=StudyStore(catalog:catalog,persistenceURL:legacyPath)
        let withoutN2=try data((try JSONSerialization.jsonObject(with:catalogData) as! [[String:Any]]).filter{$0["id"] as? String != n2ID})
        try upgraded.applyDownloadedCatalog(withoutN2,version:String(repeating:"e",count:64),sha256:ContentLibrary.sha256(withoutN2))
        precondition(!upgraded.dictionaries.contains{$0.id==n2ID},"Verified public baseline is authoritative when a book is removed")
        let removedBookRestart=StudyStore(catalog:catalog,persistenceURL:legacyPath)
        let retainedRatings=try removedBookRestart.syncSnapshot(),retainedContent=try removedBookRestart.contentSnapshot()
        precondition(!removedBookRestart.dictionaries.contains{$0.id==n2ID} && retainedRatings.contains{$0.dictionaryID==n2ID && $0.wordID==emptyID && $0.level==2})
        precondition(!retainedContent.contains{$0.dictionaryID==n2ID},"Removed unmodified built-in book is not republished from the old bundle")

        let fixture=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[2]))) as! [String:Any]
        let wire=try ContentSyncRecord.decodeEnvelope(data(["version":1,"records":fixture["records"]!]))
        let canonical=try ContentJSON.from(JSONSerialization.jsonObject(with:JSONEncoder().encode(wire))).canonical
        precondition(canonical==fixture["canonicalRecordsJSON"] as! String && ContentLibrary.sha256(Data(canonical.utf8))==fixture["digest"] as! String)

        let transportStore=StudyStore(catalog:oldCatalog,persistenceURL:nil)
        let configuration=URLSessionConfiguration.ephemeral;configuration.protocolClasses=[ContentURLProtocol.self]
        let session=URLSession(configuration:configuration)
        let controller=ProgressSyncController(store:transportStore,credentials:ContentCredentials(),session:session,
            baseURL:URL(string:"https://sync.test/api/sync")!,catalogUpdatesEnabled:true)
        var serverRecords:[ContentSyncRecord]=[],contentRequests=0,uploads:[Int]=[],catalogDownloads=0,failContent=false
        ContentURLProtocol.handler={request in
            if request.httpMethod=="GET" {
                precondition(request.value(forHTTPHeaderField:"Authorization")==nil,"Public catalog request must not carry private pairing credentials")
                if request.url!.lastPathComponent=="content-version.json" {
                    return (200,try! data(["version":String(repeating:"a",count:64),"catalogSHA256":ContentLibrary.sha256(catalogData),"catalogPath":"/database/catalog.json"]))
                }
                catalogDownloads+=1;return (200,catalogData)
            }
            let raw=try! JSONSerialization.jsonObject(with:body(request)) as! [String:Any]
            if request.url!.lastPathComponent=="content" {
                contentRequests+=1
                if failContent { return (500,try! data(["error":"unavailable"])) }
                let incoming=try! ContentSyncRecord.decodeEnvelope(data(["version":1,"records":raw["records"]!]))
                uploads.append(incoming.count);serverRecords=try! ContentSyncRecord.canonical(serverRecords+incoming)
                let encoded=try! JSONSerialization.jsonObject(with:JSONEncoder().encode(serverRecords))
                let digest=ContentLibrary.sha256(Data(try! ContentJSON.from(encoded).canonical.utf8))
                let unchanged=raw["knownDigest"] as? String==digest
                return (200,try! data(["version":1,"records":unchanged ? [] : encoded,"digest":digest,"unchanged":unchanged]))
            }
            return (200,try! data(["version":1,"records":raw["records"] ?? []]))
        }
        let refreshed=await controller.refreshCatalog(force:true);precondition(refreshed)
        precondition(transportStore.dictionaries.count==10 && catalogDownloads==1)
        await controller.join("mots-"+String(repeating:"a",count:43))
        await waitFor{controller.status=="已同步" && !controller.busy}
        _ = try transportStore.importDictionary(data(source()))
        controller.localDidChange()
        await waitFor{serverRecords.count==3 && controller.status=="已同步" && !controller.busy}
        let count=contentRequests
        controller.requestSync(force:true)
        await waitFor{contentRequests>count && controller.status=="已同步" && !controller.busy}
        precondition(uploads.last==0 && catalogDownloads==1,"Progress-only polling sends no content body and reuses unchanged digest")
        failContent=true;let failedAt=contentRequests;controller.requestSync(force:true)
        await waitFor{contentRequests>failedAt && !controller.busy}
        precondition(controller.status != "已同步" && transportStore.dictionaries.contains{$0.id=="dict-shared"})
        failContent=false;controller.requestSync(force:true)
        await waitFor{controller.status=="已同步" && !controller.busy}
        controller.disconnect();session.invalidateAndCancel()
        print("PASS: public catalog cache/download/provenance/SHA; two-way book/word edits; concurrent merges; archive/restore; stable progress/memory; restart/portable backups; digest delta transport; failures and cross-language fixture.")
    }
}
