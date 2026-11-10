import Foundation
import CoreFoundation
import CryptoKit

/// Portable JSON values keep content metadata separate from device preferences.
enum ContentJSON: Codable, Equatable {
    case object([String: ContentJSON]), array([ContentJSON]), string(String), integer(Int64), bool(Bool), null
    init(from decoder: Decoder) throws {
        let value = try decoder.singleValueContainer()
        if value.decodeNil() { self = .null }
        else if let v = try? value.decode(Bool.self) { self = .bool(v) }
        else if let v = try? value.decode(Int64.self) { self = .integer(v) }
        else if let v = try? value.decode(String.self) { self = .string(v) }
        else if let v = try? value.decode([ContentJSON].self) { self = .array(v) }
        else { self = .object(try value.decode([String: ContentJSON].self)) }
    }
    func encode(to encoder: Encoder) throws {
        var value = encoder.singleValueContainer()
        switch self {
        case .object(let v): try value.encode(v)
        case .array(let v): try value.encode(v)
        case .string(let v): try value.encode(v)
        case .integer(let v): try value.encode(v)
        case .bool(let v): try value.encode(v)
        case .null: try value.encodeNil()
        }
    }
    var foundation: Any {
        switch self {
        case .object(let v): return v.mapValues(\.foundation)
        case .array(let v): return v.map(\.foundation)
        case .string(let v): return v
        case .integer(let v): return v
        case .bool(let v): return v
        case .null: return NSNull()
        }
    }
    static func from(_ value: Any) throws -> Self {
        try JSONDecoder().decode(Self.self, from: JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed]))
    }
    var canonical: String {
        String(decoding: (try? JSONSerialization.data(withJSONObject: foundation,
            options: [.fragmentsAllowed, .sortedKeys, .withoutEscapingSlashes])) ?? Data(), as: UTF8.self)
    }
    var object: [String: Any]? { foundation as? [String: Any] }
    static func ==(lhs:Self,rhs:Self)->Bool { lhs.canonical.utf8.elementsEqual(rhs.canonical.utf8) }
}

struct ContentSyncRecord: Codable, Equatable {
    let dictionaryID: String
    let kind: String
    let wordID: String
    let clock: Int64
    let deviceID: String
    let deleted: Bool
    let payload: ContentJSON?
    var key: String { SyncRecordIdentity.key(dictionaryID: dictionaryID, wordID: kind + ":" + wordID) }
    private enum CodingKeys: String, CodingKey { case dictionaryID, kind, wordID, clock, deviceID, deleted, payload }
    func encode(to encoder: Encoder) throws {
        var v = encoder.container(keyedBy: CodingKeys.self)
        try v.encode(dictionaryID, forKey: .dictionaryID); try v.encode(kind, forKey: .kind)
        try v.encode(wordID, forKey: .wordID); try v.encode(clock, forKey: .clock)
        try v.encode(deviceID, forKey: .deviceID); try v.encode(deleted, forKey: .deleted)
        if let payload { try v.encode(payload, forKey: .payload) } else { try v.encodeNil(forKey: .payload) }
    }
    static func identifier(_ value: String, max: Int) -> Bool {
        !value.isEmpty && value.unicodeScalars.count <= max &&
        !["__proto__", "constructor", "prototype"].contains(value) &&
        !value.unicodeScalars.contains { $0.properties.generalCategory == .control }
    }
    func validate() throws {
        guard Self.identifier(dictionaryID, max:128), ["dictionary", "word"].contains(kind),
              (kind == "dictionary" ? wordID == "*" : Self.identifier(wordID, max:256) && wordID != "*"),
              (0...ProgressSyncRecord.maximumClock).contains(clock),
              clock == 0 ? deviceID.isEmpty : (deviceID.count == 32 && deviceID.utf8.allSatisfy { (48...57).contains($0) || (97...102).contains($0) }),
              deleted ? payload == nil || payload == .null : payload != nil && payload != .null
        else { throw ProgressSyncError.invalidResponse }
        if !deleted {
            guard let raw = payload?.object,let id=raw["id"] as? String,id.utf8.elementsEqual((kind == "dictionary" ? dictionaryID : wordID).utf8),
                  (payload?.canonical.utf8.count ?? 0) <= 256 * 1024 else { throw ProgressSyncError.invalidResponse }
            if kind == "dictionary" { _ = try ContentLibrary.metadata(raw) }
            else { _ = try ContentLibrary.word(raw) }
        }
        let wire=try ContentJSON.from(JSONSerialization.jsonObject(with:JSONEncoder().encode(self))).canonical
        guard wire.utf8.count<=256*1024 else { throw ProgressSyncError.invalidResponse }
    }
    func wins(over other: Self) -> Bool {
        if clock != other.clock { return clock > other.clock }
        if deviceID != other.deviceID { return deviceID > other.deviceID }
        if deleted != other.deleted { return deleted }
        return (payload?.canonical ?? "null").utf8.lexicographicallyPrecedes((other.payload?.canonical ?? "null").utf8) == false && payload != other.payload
    }
    static func canonical(_ records: [Self]) throws -> [Self] {
        var result: [String: Self] = [:]
        for r in records {
            try r.validate()
            if result[r.key].map({ r.wins(over:$0) }) ?? true { result[r.key] = r }
        }
        guard result.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        let sorted = result.values.sorted {
            if !$0.dictionaryID.utf8.elementsEqual($1.dictionaryID.utf8) {
                return $0.dictionaryID.utf8.lexicographicallyPrecedes($1.dictionaryID.utf8)
            }
            if $0.kind != $1.kind { return $0.kind < $1.kind }
            return $0.wordID.utf8.lexicographicallyPrecedes($1.wordID.utf8)
        }
        let array=try JSONSerialization.jsonObject(with:JSONEncoder().encode(sorted))
        let envelope=try ContentJSON.from(["version":1,"records":array]).canonical
        guard envelope.utf8.count <= 24 * 1024 * 1024 else { throw ProgressSyncError.invalidResponse }
        return sorted
    }
    static func decodeEnvelope(_ data: Data) throws -> [Self] {
        guard data.count <= 32 * 1024 * 1024,
              let raw = try JSONSerialization.jsonObject(with:data) as? [String:Any],
              Set(raw.keys) == ["version","records"], ProgressSyncRecord.wireInteger(raw["version"]) == 1,
              let records = raw["records"] as? [[String:Any]], records.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
        for r in records {
            guard Set(r.keys) == ["dictionaryID","kind","wordID","clock","deviceID","deleted","payload"],
                  ProgressSyncRecord.wireInteger(r["clock"]) != nil,
                  let flag = r["deleted"] as? NSNumber, CFGetTypeID(flag) == CFBooleanGetTypeID() else { throw ProgressSyncError.invalidResponse }
        }
        return try canonical(JSONDecoder().decode([Self].self, from:JSONSerialization.data(withJSONObject:records)))
    }
}

struct ContentSyncMetadata: Codable, Equatable {
    var deviceID = UUID().uuidString.replacingOccurrences(of:"-",with:"").lowercased()
    var counter: Int64 = 0
    var records: [ContentSyncRecord] = []
    mutating func validate() throws {
        guard deviceID.count == 32, deviceID.utf8.allSatisfy({ (48...57).contains($0) || (97...102).contains($0) }),
              (0...ProgressSyncRecord.maximumClock).contains(counter) else { throw ProgressSyncError.invalidResponse }
        records = try ContentSyncRecord.canonical(records); counter = max(counter, records.map(\.clock).max() ?? 0)
    }
    mutating func merge(_ incoming:[ContentSyncRecord]) throws {
        records = try ContentSyncRecord.canonical(records + incoming); counter = max(counter,records.map(\.clock).max() ?? 0)
    }
    mutating func put(dictionaryID:String,kind:String,wordID:String,payload:ContentJSON?,deleted:Bool = false,seed:Bool = false) throws {
        let key = SyncRecordIdentity.key(dictionaryID:dictionaryID,wordID:kind+":"+wordID)
        if seed && records.contains(where:{$0.key == key}) { return }
        guard seed || counter < ProgressSyncRecord.maximumClock else { throw ProgressSyncError.clockLimit }
        if !seed { counter += 1 }
        let record = ContentSyncRecord(dictionaryID:dictionaryID,kind:kind,wordID:wordID,
            clock:seed ? 0 : counter,deviceID:seed ? "" : deviceID,deleted:deleted,payload:payload)
        try record.validate(); records.removeAll{$0.key==key};records.append(record)
        guard records.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
    }
}

/// Shared strict interpretation of public baseline and private content overlays.
enum ContentLibrary {
    static let metadataKeys:Set<String> = ["id","title","language","kind","grammarMode","categories","audioMode","description","sourceInfo","entryCount","archived"]
    static let wordKeys:Set<String> = ["id","term","meaning","meanings","example","examples","category","subcategory","language","audio","part","pattern","explanation","reading","headword","order"]
    static func text(_ value:Any?,field:String,limit:Int,required:Bool=true) throws ->String {
        if let string=value as? String { guard string.unicodeScalars.count<=limit else { throw ProgressSyncError.invalidResponse } }
        return try StudyImport.text(value,field:field,limit:limit,required:required)
    }
    static func metadata(_ raw:[String:Any]) throws -> StudyDictionary {
        try validateStrings(raw)
        guard Set(raw.keys).isSubset(of:metadataKeys), let id=raw["id"] as? String,
              ContentSyncRecord.identifier(id,max:128), let language=raw["language"] as? String,
              StudyImport.languages.contains(language), let kind=StudyDictionaryKind(rawValue:raw["kind"] as? String ?? "vocabulary"),
              let mode=StudyGrammarMode(rawValue:raw["grammarMode"] as? String ?? "standard"),
              kind == .grammar || mode == .standard,
              let categories=raw["categories"] as? [[String:Any]], categories.count <= 100 else { throw ProgressSyncError.invalidResponse }
        if raw["kind"] != nil { guard raw["kind"] is String else { throw ProgressSyncError.invalidResponse } }
        if raw["grammarMode"] != nil { guard raw["grammarMode"] is String else { throw ProgressSyncError.invalidResponse } }
        let title = try text(raw["title"],field:"辭典名稱",limit:80)
        var parents=Set<String>(),children=Set<String>()
        for category in categories {
            guard Set(category.keys)==["id","name","subcategories"],let id=category["id"] as? String, ContentSyncRecord.identifier(id,max:128), parents.insert(id).inserted,
                  let subs=category["subcategories"] as? [[String:Any]], !subs.isEmpty else { throw ProgressSyncError.invalidResponse }
            _ = try text(category["name"],field:"單元名稱",limit:80)
            for sub in subs {
                guard Set(sub.keys)==["id","name"],let id=sub["id"] as? String, ContentSyncRecord.identifier(id,max:256),children.insert(id).inserted,
                      children.count <= 300 else { throw ProgressSyncError.invalidResponse }
                _ = try text(sub["name"],field:"單元名稱",limit:80)
            }
        }
        if let description=raw["description"] { _ = try text(description,field:"說明",limit:2000,required:false) }
        if let value=raw["sourceInfo"] {
            _ = try text(value,field:"來源",limit:256)
            let link=value as! String
            guard link.range(of:"^[A-Za-z0-9][A-Za-z0-9._/-]*$",options:.regularExpression) != nil,!link.components(separatedBy:"/").contains("..") else { throw ProgressSyncError.invalidResponse }
        }
        if let n=raw["entryCount"] { guard let value=ProgressSyncRecord.wireInteger(n),(0...100_000).contains(value) else { throw ProgressSyncError.invalidResponse } }
        if let mode=raw["audioMode"] { guard mode as? String == "speech" else { throw ProgressSyncError.invalidResponse } }
        if let archived=raw["archived"] { guard let flag=archived as? NSNumber,CFGetTypeID(flag)==CFBooleanGetTypeID() else { throw ProgressSyncError.invalidResponse } }
        let decoded=try JSONDecoder().decode([StudyCategory].self,from:JSONSerialization.data(withJSONObject:categories))
        return StudyDictionary(id:id,title:title,language:language,categories:decoded,words:[],kind:kind,grammarMode:mode)
    }
    static func word(_ raw:[String:Any], audioAllowed:Bool = false) throws -> StudyWord {
        try validateStrings(raw)
        guard Set(raw.keys).isSubset(of:wordKeys),let id=raw["id"] as? String,ContentSyncRecord.identifier(id,max:256),
              let category=raw["category"] as? String,ContentSyncRecord.identifier(category,max:128),
              let subcategory=raw["subcategory"] as? String,ContentSyncRecord.identifier(subcategory,max:256),
              let language=raw["language"] as? String,StudyImport.languages.contains(language),
              raw["meanings"] == nil || raw["meanings"] is [String:String] else { throw ProgressSyncError.invalidResponse }
        var meanings=raw["meanings"] as? [String:String] ?? [:]
        guard Set(meanings.keys).isSubset(of:StudyImport.meaningLanguages) else { throw ProgressSyncError.invalidResponse }
        let term=try text(raw["term"],field:"詞條",limit:180)
        for value in meanings.values { _ = try text(value,field:"釋義",limit:1600,required:false) }
        let meaning=try text(raw["meaning"] ?? meanings["zh-Hant"] ?? meanings["zh-Hans"] ?? meanings.sorted{$0.key<$1.key}.first?.value,field:"釋義",limit:1600,required:false)
        guard !meaning.isEmpty || meanings.values.contains(where:{!$0.trimmingCharacters(in:.whitespacesAndNewlines).isEmpty}) else { throw ProgressSyncError.invalidResponse }
        if meanings.isEmpty { meanings["zh-Hant"]=meaning }
        if let supplied=raw["examples"] as? [Any] {
            for case let sentence as String in supplied { _ = try text(sentence,field:"例句",limit:2000) }
            for case let example as [String:Any] in supplied {
                guard Set(example.keys).isSubset(of:["text","translations","furigana"]) else { throw ProgressSyncError.invalidResponse }
                _ = try text(example["text"],field:"例句",limit:2000)
                if let translations=example["translations"] as? [String:Any] {
                    guard Set(translations.keys).isSubset(of:StudyImport.meaningLanguages) else { throw ProgressSyncError.invalidResponse }
                    for translation in translations.values { _ = try text(translation,field:"翻譯",limit:2000,required:false) }
                }
                if let segments=example["furigana"] as? [[String:Any]] {
                    guard segments.allSatisfy({Set($0.keys)==["text","reading"]}) else { throw ProgressSyncError.invalidResponse }
                    for segment in segments { _ = try text(segment["text"],field:"讀音原文",limit:2000,required:false); _ = try text(segment["reading"],field:"讀音",limit:2000,required:false) }
                }
            }
        }
        for (key,limit) in [("example",2000),("pattern",2000),("explanation",6000)] where raw[key] != nil { _ = try text(raw[key],field:key,limit:limit,required:false) }
        let details=try StudyImport.details(raw)
        let reading=try StudyWord.checkedReading(raw["reading"].map { try text($0,field:"讀音",limit:180,required:false) })
        var audio:String?
        if let value=raw["audio"],!(value is NSNull) {
            guard let path=value as? String,path.range(of:"^audio/[A-Za-z0-9_.-]+\\.m4a$",options:.regularExpression) != nil else { throw ProgressSyncError.invalidResponse }
            if audioAllowed { audio=path }
        }
        if let order=raw["order"] { guard let n=ProgressSyncRecord.wireInteger(order),(0...100_000_000).contains(n) else { throw ProgressSyncError.invalidResponse } }
        if let headword=raw["headword"] { _ = try text(headword,field:"詞頭",limit:180) }
        let part=try raw["part"].flatMap { value -> String? in value is NSNull ? nil : try text(value,field:"詞性",limit:100,required:false) }
        return StudyWord(id:id,term:term,meaning:meaning,example:details.example,category:category,subcategory:subcategory,
            language:language,audio:audio,meanings:meanings,part:part,examples:details.examples,pattern:details.pattern,explanation:details.explanation,reading:reading)
    }
    static func metadataJSON(_ dictionary:StudyDictionary) throws -> ContentJSON {
        try .from(["id":dictionary.id,"title":dictionary.title,"language":dictionary.language,"kind":dictionary.kind.rawValue,
                   "grammarMode":dictionary.grammarMode.rawValue,"categories":try JSONSerialization.jsonObject(with:JSONEncoder().encode(dictionary.categories))])
    }
    static func wordJSON(_ word:StudyWord,order:Int? = nil) throws -> ContentJSON {
        var raw:[String:Any] = ["id":word.id,"term":word.term,"meaning":word.meaning,"meanings":word.meanings,"example":word.example,
            "examples":word.examples.map(\.importJSON),"category":word.category,"subcategory":word.subcategory,"language":word.language,
            "audio":NSNull(),"part":word.part as Any? ?? NSNull(),"pattern":word.pattern,"explanation":word.explanation,"reading":word.reading,"headword":word.term]
        if let order { raw["order"]=order }
        return try .from(raw)
    }
    static func decodeCatalog(_ data:Data) throws -> [StudyDictionary] {
        guard data.count <= 32*1024*1024,let books=try JSONSerialization.jsonObject(with:data) as? [[String:Any]],
              !books.isEmpty,books.count <= 100 else { throw ProgressSyncError.invalidResponse }
        var seen=Set<String>(),total=0
        return try books.map { raw in
            guard let id=raw["id"] as? String,seen.insert(id).inserted,
                  let words=raw["words"] as? [[String:Any]],words.count <= 100_000 else { throw ProgressSyncError.invalidResponse }
            total += words.count; guard total <= 100_000 else { throw ProgressSyncError.invalidResponse }
            var meta=raw;meta.removeValue(forKey:"words")
            // Release catalogs include provenance fields which are not private edit fields.
            meta=meta.filter { metadataKeys.contains($0.key) }
            let info=try metadata(meta)
            let decoded=try words.map { try word($0.filter { wordKeys.contains($0.key) },audioAllowed:true) }
            try validateWords(decoded,in:info)
            return StudyDictionary(id:info.id,title:info.title,language:info.language,categories:info.categories,words:decoded,
                kind:info.kind,grammarMode:info.grammarMode,builtIn:true)
        }
    }
    static func validateWords(_ words:[StudyWord],in book:StudyDictionary) throws {
        var ids=Set<String>()
        for word in words {
            guard ids.insert(SyncRecordIdentity.key(dictionaryID:book.id,wordID:word.id)).inserted,word.language==book.language,
                  book.categories.contains(where:{$0.id==word.category && $0.subcategories.contains(where:{$0.id==word.subcategory})}) else { throw ProgressSyncError.invalidResponse }
        }
    }
    static func materialize(baseline:[StudyDictionary],records:[ContentSyncRecord]) throws -> [StudyDictionary] {
        let canonical=try ContentSyncRecord.canonical(records)
        try rejectUnicodeCollisions(baseline.map(\.id)+canonical.map(\.dictionaryID))
        var result=baseline,known=Dictionary(uniqueKeysWithValues:baseline.enumerated().map{($0.element.id,$0.offset)})
        for r in canonical where r.kind=="dictionary" {
            if r.deleted { result.removeAll{$0.id==r.dictionaryID};known=Dictionary(uniqueKeysWithValues:result.enumerated().map{($0.element.id,$0.offset)});continue }
            if r.payload?.object?["archived"] as? Bool == true { result.removeAll{$0.id==r.dictionaryID};known=Dictionary(uniqueKeysWithValues:result.enumerated().map{($0.element.id,$0.offset)});continue }
            let meta=try metadata(r.payload!.object!)
            let prior=known[meta.id].map{result[$0]}
            if let prior { guard prior.kind==meta.kind,prior.language==meta.language,prior.grammarMode==meta.grammarMode else { throw ProgressSyncError.invalidResponse } }
            let book=StudyDictionary(id:meta.id,title:meta.title,language:meta.language,categories:mergingCategories(prior?.categories ?? [],with:meta.categories),words:prior?.words ?? [],
                kind:meta.kind,grammarMode:meta.grammarMode,builtIn:baseline.contains{$0.id==meta.id},usesCustomTitle:prior?.usesCustomTitle==true || prior?.title != meta.title)
            if let index=known[meta.id] { result[index]=book } else { known[meta.id]=result.count;result.append(book) }
        }
        for index in result.indices {
            let id=result[index].id
            var words=result[index].words
            let patches=canonical.filter{$0.dictionaryID==id && $0.kind=="word"}
            // Bundled/public baselines are validated by their own source loader.
            // Only overlay-touched books need rebuilding and cross-reference checks.
            if patches.isEmpty && !canonical.contains(where:{$0.dictionaryID==id && $0.kind=="dictionary"}) { continue }
            try rejectUnicodeCollisions(words.map(\.id)+patches.map(\.wordID))
            var orders:[String:Int64]=[:]
            for r in patches {
                if r.deleted { words.removeAll{$0.id==r.wordID};continue }
                let word=try word(r.payload!.object!)
                if let at=words.firstIndex(where:{$0.id==word.id}) { words[at]=word } else { words.append(word) }
                if let order=ProgressSyncRecord.wireInteger(r.payload!.object!["order"]) { orders[word.id]=order }
            }
            if !orders.isEmpty {
                let original=Dictionary(uniqueKeysWithValues:words.enumerated().map{($0.element.id,Int64($0.offset))})
                words.sort {
                    let lhs=orders[$0.id] ?? original[$0.id]!,rhs=orders[$1.id] ?? original[$1.id]!
                    return lhs==rhs ? $0.id.utf8.lexicographicallyPrecedes($1.id.utf8) : lhs<rhs
                }
            }
            var categories=result[index].categories
            for word in words {
                if let at=categories.firstIndex(where:{$0.id==word.category}) {
                    if !categories[at].subcategories.contains(where:{$0.id==word.subcategory}) {
                        let old=categories[at];categories[at]=StudyCategory(id:old.id,name:old.name,subcategories:old.subcategories+[StudySubcategory(id:word.subcategory,name:"子單元 \(word.subcategory)")])
                    }
                } else { categories.append(StudyCategory(id:word.category,name:"單元 \(word.category)",subcategories:[StudySubcategory(id:word.subcategory,name:"子單元 \(word.subcategory)")])) }
            }
            let old=result[index]
            result[index]=StudyDictionary(id:old.id,title:old.title,language:old.language,categories:categories,words:words,kind:old.kind,grammarMode:old.grammarMode,builtIn:old.builtIn,usesCustomTitle:old.usesCustomTitle)
            try validateWords(words,in:result[index])
        }
        guard result.filter({!$0.isBuiltIn}).count <= 20 else { throw StudyDataError("同步後超過 20 部自訂辭典。") }
        return result
    }
    static func sha256(_ data:Data)->String { SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined() }
    static func mergingCategories(_ base:[StudyCategory],with updates:[StudyCategory])->[StudyCategory] {
        var result=base
        for category in updates {
            if let at=result.firstIndex(where:{$0.id==category.id}) {
                var subs=result[at].subcategories
                for child in category.subcategories {
                    if let index=subs.firstIndex(where:{$0.id==child.id}) { subs[index]=child } else { subs.append(child) }
                }
                result[at]=StudyCategory(id:category.id,name:category.name,subcategories:subs)
            } else { result.append(category) }
        }
        return result
    }
    private static func validateStrings(_ value:Any) throws {
        if let text=value as? String {
            guard !text.unicodeScalars.contains(where:{$0.properties.generalCategory == .control && ![9,10,13].contains($0.value)}) else { throw ProgressSyncError.invalidResponse }
        } else if let array=value as? [Any] { for item in array { try validateStrings(item) } }
        else if let object=value as? [String:Any] { for (key,item) in object { guard !StudyImport.unsafeKeys.contains(key) else { throw ProgressSyncError.invalidResponse };try validateStrings(item) } }
    }
    private static func rejectUnicodeCollisions(_ ids:[String]) throws {
        var seen:[String:String]=[:]
        for id in ids {
            if let old=seen[id],!old.utf8.elementsEqual(id.utf8) { throw ProgressSyncError.invalidResponse }
            seen[id]=id
        }
    }
}

struct DownloadedCatalog: Codable, Equatable {
    let version:String
    let sha256:String
    let dictionaries:[StudyDictionary]
    var rawData:Data? = nil
}
struct CatalogCacheReference:Codable {
    let version:String
    let sha256:String
    var fileName:String { "catalog-cache-\(sha256).json" }
}
