# Mots paired learning and dictionary synchronization

Historical decision (2026-10-23): pair by code, no registration; initially synchronize per-word familiarity only. The 2026-11-05 user decision supersedes that content exclusion: familiarity, memory schedules, deletion/restore state, dictionary content, custom dictionaries and added words now synchronize bidirectionally. Appearance, chapter choices, captured rounds, current position and reveal state remain device-local. Unknown dictionary/word records are retained until matching content exists locally. Do not infer custom dictionary identity from names or terms.

HTTPS production base: https://mots.feizhang233.com/api/sync
- POST /api/sync/create with empty JSON creates a private group; returns {"version":1,"code":"mots-<43 base64url chars>"}. Code contains 32 secure random bytes; never put it in URLs/logs. Persist only code hash on server. Authentication is Authorization: Bearer <code>.
- POST /api/sync/exchange with auth and {"version":1,"records":[records...]} atomically merges and returns {"version":1,"records":[full canonical snapshot...]}. Empty records is a read. Bad auth401, invalid envelope/record400, oversized413. No implicit group creation on exchange. Token is not shared with unrelated origins.

Record exactly: {"dictionaryID":"fr","wordID":"book-1.01-001","level":3,"clock":12,"deviceID":"0123456789abcdef0123456789abcdef"}.
Identifiers: dictionaryID1..128 chars, wordID1..256 chars, nonempty UTF8 strings, no control chars, no __proto__/constructor/prototype. level integer0..3 (bool is invalid). clock integer0..9007199254740991 (bool invalid). deviceID 32 lowercase hex chars, or empty string only for clock0 migration records. Version integer1, not bool. Reject non-object/unknown-required-type records atomically. At most100000 canonical records per group; request body32MiB maximum. Deduplicate incoming keys using comparator below.

Canonical key is (dictionaryID,wordID). Winner is lexicographic max of (clock,deviceID,level), with deviceID compared ASCII. Records sorted by dictionaryID then wordID for deterministic output. A clock0,deviceID-empty seed represents pre-sync progress: import only nonzero local ratings not already represented in metadata. Among conflicting legacy seeds higher familiarity wins ONLY in that clock0 tie. A newly edited level0 is an explicit tombstone; never omit or delete it.

Each installation persists a secure random UUID32 lowercase deviceID and a global Lamport counter. Every real local rating/import edit increments max(localCounter,all observed clocks)+1 and saves the new record atomically with progress before network. Retain full metadata even for unknown dictionary/word IDs. On response validate entire snapshot, merge with CURRENT local metadata, not request-time state (in-flight local edits must survive). Apply winners with dedicated merge setters (do not call toggle/advance rate()). Preserve current selection/random review queue and only refresh mastery-filter membership safely. Avoid feedback loops: applying remote state does not create new local edits. Failed local persistence must prevent claiming synced.

Offline and retry: persist metadata before send, debounce outbound ~400ms, exchange on foreground/online/pair and while visible ~5s. Serialize exchanges; after a local edit during request run again. Errors preserve local data, expose pending/offline status, retry with bounded backoff up to60s. Disconnect invalidates in-flight response via session generation and retains local progress. Join validates token with remote before committing new credentials. Do not discard local progress when creating/joining another group; merge seed existing progress. Different-word edits merge; same-word concurrent versions deterministically tie-break by deviceID and converge, with no dependence on device wall clocks.

Native code in Keychain; web code in localStorage (password-masked input, explicit reveal/copy); no token in backups, URLs, analytics or logs. Endpoint/production HTTPS fixed in normal settings. Debug tests may inject a URLSession transport or test endpoint without relaxing production ATS.

UI: Settings section "資料同步": create pairing, join code, show private code on explicit reveal/copy, connected/syncing/synced/offline/error states, sync now, disconnect. Copy/reveal only after action; no full code in ordinary status. Explain pairing once on another device and offline retry. No automatic cross-origin export of backups or settings. Confirmation not required for reversible disconnect; keep local progress.

## Compatible word-deletion extension

The list-delete user brief adds a reversible user overlay. Source dictionaries/word IDs and familiarity remain intact. Deleted words are excluded from active study, lookup, counts, review capture and CSV; they can be restored from settings. Restore retains the source content and familiarity. A captured review only removes deleted members; restoring does not insert a new member into that round. Backups keep source definitions and include optional `deletions` records; old backups without the field do not clear deletion state. A completely validated backup import applies its explicit true/false values as new local edits, advancing beyond observed/imported deletion clocks.

New endpoint: POST `/api/sync/deletions`, same HTTPS base and Bearer pairing group. Request and response are exactly `{version:1,records:[...]}`. Empty records read the full canonical snapshot. Records are exactly `{dictionaryID,wordID,deleted,clock,deviceID}`. Identifier validation matches familiarity; `deleted` is a JSON boolean, `clock` is an integer in 0..9007199254740991, and `deviceID` is exactly 32 lowercase hex characters (no empty legacy seed). At most 100000 canonical deletion records per pairing group, independently of familiarity; request size 32MiB. Existing auth, Origin/CORS, atomic validation/merge, private storage and no-logging rules also apply.

The key is exact `(dictionaryID,wordID)`, without Unicode normalization. Winner is maximum `(clock,deviceID,deleted?1:0)`, with canonical ID ordering. Both true (delete) and false (restore/undo) records remain permanently; absence never restores an earlier deletion. Local deletion metadata has its own stable device ID/counter and atomic persistence, separate from familiarity metadata. Never encode deletion as familiarity level zero. Unknown IDs and false records survive restart, pairing and round trips. Source imports with fresh dictionary IDs remain separate.

The existing sync owner handles both channels with the same credentials, serialized transport, foreground/online triggers, polling and debounce. Create/join validate both snapshots before committing credentials; ordinary sync only reports fully synchronized after both channels validate and persist. Partial failures retain local changes and retry. Responses merge into CURRENT local metadata, preserving edits during a request; disconnect generation checks protect both channels.

`/exchange` v1 and its exact record schema remain unchanged. An older client continues to exchange familiarity and cannot resurrect deletions on newer clients; it must be updated to understand the deletion overlay and hide deleted words itself. The service adds a separate transactional SQLite table without migrating/removing old familiarity data.


## Card-memory schedule extension (2026-11-02)

`POST /api/sync/memory` uses the existing private pairing credentials and exact
`{version:1,records:[...]}` envelope. Each record has exactly
`dictionaryID,wordID,stage,dueAt,updatedAt`. IDs use the existing 128/256 scalar limits;
`stage` is an integer 0..5; timestamps are integer UTC milliseconds 0..253402300799999.
Stage 5 requires dueAt 0; other stages require dueAt >= updatedAt.
The independent SQLite table is additive and retains unknown IDs and reset records.
Limits, authentication, CORS and atomic rejection match the other channels.

Merge each word by maximum `(updatedAt,-stage,dueAt)`, matching existing portable
backup merges: most recent answer wins; simultaneous conflicting answers retain the
lower stage, then later due date. This channel uses device UTC timestamps, so devices
should use automatic date/time. It does not count simultaneous recalls twice.
Manual local familiarity changes reset an existing schedule with a timestamp strictly
newer than that record. Receiving familiarity must not manufacture a reset with the
receiving device's time, which would overwrite the actual answer from another device.

Every accepted recall/lapse schedules an upload even while familiarity remains 2.
Merge into current local schedules, retaining changes made during network requests;
retry until all required channels converge (four channels after the 2026-11-05 content extension). New clients must not show fully synced when
memory transport or persistence fails. Pairing validates all required remote envelopes
before committing credentials. Old clients remain compatible with the original two
endpoints, but need an update to send/receive schedules. Chapter choices, captured
round order, current position and answer reveal state remain local. Received future
schedules remove stale pending cards without advancing stages or capturing new cards.

## N2 Hongbao content revisions (2026-11-04)

The built-in N2 vocabulary book uses dictionary ID `vocab-ja-n2-hongbao` on all
three sync channels. Its 3,136 published word IDs are pinned in
`database/japanese/hongbao-n2/identity.json`, keyed by extraction order rather than
the current headword. Correcting a headword, reading, definition or example must
keep its ID: the importer rejects changes to the pinned identities. Source text
does not participate in progress keys or trigger familiarity/schedule resets.

Content is published in the Web release and shared catalog. Private familiarity,
deletions and memory schedules stay in the VPS database outside release folders;
deploying or rolling back content never replaces that database. Paired clients
exchange N2 records through the same existing endpoints and conflict rules as
other books, including unknown IDs on clients with older content. Installed native
clients without the content-sync implementation still need an application update
once. Updated clients retrieve the published baseline described below, then merge
their private content records; retaining unknown progress alone does not install
that client capability.

## Bidirectional dictionary content extension (2026-11-05)

The existing three learning channels remain wire-compatible and keep their private
SQLite tables. `POST /api/sync/content` adds a fourth private channel under the same
pairing code. Content records are isolated per pairing group; they are never written
into the publicly downloadable catalog. New clients only claim fully synchronized
after the content channel, familiarity, deletions and memory all validate and persist.

Published built-ins remain available without private credentials at
`/database/content-version.json` and `/database/catalog.json`. The version document
contains the fixed same-origin catalog path and its SHA-256. Updated clients check
that version, validate a changed catalog completely, and retain an offline cached
baseline. A new public release may change definitions or add books without an App
reinstallation once the content-sync-capable App is installed. Private overrides
retain their own revisions and apply over that baseline. Downloading the public
catalog is one-way publication; edits and custom content use the bidirectional
private channel. Public refresh never publishes or resets private learning data.

Content request: exactly `{version:1,records:[...]}`, optionally with a third field
`knownDigest`, whose value is null or 64 lowercase hexadecimal characters. Each
record has exactly:

```
{dictionaryID,kind,wordID,clock,deviceID,deleted,payload}
```

`kind` is `dictionary` or `word`. A dictionary-metadata record uses `wordID:"*"`;
word records use a stable actual word ID and cannot use `*`. Dictionary IDs use the
existing 128-scalar validation; word IDs use 256 scalars. All three key components
compare exact UTF-8 without Unicode normalization. Keep an existing word ID when
editing its term, pronunciation, definition, example or category. The content key
is independent of every learning channel and never encodes familiarity as content.

`clock` is an integer 0..9007199254740991, not a boolean. An initial migration seed
may use only clock 0 with empty deviceID. Every real edit uses a positive clock and
a 32-character lowercase hexadecimal device ID. Advance beyond all observed local
and remote content clocks before saving a new edit. Record the new revision and
payload locally before scheduling an upload; merge responses into current state,
not the state captured when the request started.

Winner for one key is maximum `(clock,deviceID,deleted?1:0,canonicalJSON(payload))`.
The final tie compares canonical JSON's UTF-8 bytes. Canonical JSON recursively
sorts object keys by Unicode scalar/UTF-8 order, preserves array order, uses no
insignificant spaces, does not escape slashes or non-ASCII scalars, and uses normal
JSON escaping for quotes, backslashes and control characters. The server validates
but never adds defaults, merges examples, converts scripts or rewrites a winning
payload at the same revision. Clients materialize optional defaults separately.

Live records use an object payload. For dictionary metadata, `id,title,language`
and `categories` are required; id must equal dictionaryID. Supported languages are
`fr,de,ja`. Optional `kind` defaults to vocabulary for validation, and optional
`grammarMode` defaults to standard; thematic mode is only valid for grammar books.
Allowed additional fields are `audioMode:"speech"`, `description`, safe relative
`sourceInfo`, `entryCount` and boolean `archived`. An archived metadata record
retains its categories and content, allowing the book to be restored without
recreating IDs or losing learning progress. Omitted optional metadata fields do
not erase corresponding public-baseline provenance fields during projection.

Live word payloads require `id,term,language,category,subcategory` and at least one
usable `meaning` or supported-language `meanings` value. The id equals wordID.
Allowed optional fields are `meaning,meanings,example,examples,audio,part,pattern,
explanation,reading,headword,order`. `order` is an integer 0..100000000 used for
stable source ordering. Audio is null or a bounded relative `audio/*.m4a` reference;
edited/new words may use device speech instead of an obsolete recording. Japanese
readings use kana, prolonged-sound mark, wave placeholders, middle dot or slash.
Examples may include supported-language translations and aligned furigana, whose
segments must concatenate to their original text; readings only annotate Han
segments. A word may precede its metadata or future category: retain that record
instead of silently dropping an offline edit. Clients materialize valid navigation
without altering the raw winning payload.

String limits match the existing import model: title/category names 80; term,
headword and reading 180; meanings 1600; example/translation/pattern/description
2000; explanation 6000; part 100. At most 100 parent categories, 300 child
categories and 20 distinct examples including a legacy example. Category IDs use
128 scalars and subcategory IDs 256. Control and surrogate scalars are rejected
where unsafe; ordinary multiline text permits newline, carriage return and tab.
Unknown object fields and reserved prototype keys are rejected atomically.

An actual content tombstone has `deleted:true,payload:null`; it remains in the
snapshot and wins over a live value with the same clock/device. A newer live
revision restores that key. Content tombstones and archived books do not delete
familiarity, schedules or the independent word deletion/restore overlay. Old
offline uploads cannot resurrect a more recent tombstone or archive revision.

The request body limit remains 32 MiB. Each content record is limited to 256 KiB
in its actual UTF-8 JSON representation. A pairing group has at most 100000
canonical content records and 24 MiB for its full canonical envelope. Validate
the entire proposed merged snapshot before committing any rows; an invalid or
over-capacity upload rejects every record in that batch and preserves old state.
The content table is additive and lives outside release folders with the existing
private database, so website releases and rollbacks do not replace it.

Plain two-field requests receive the plain two-field canonical response. When
knownDigest is present, the response is exactly
`{version:1,records:[...],digest:<64hex>,unchanged:<bool>}`. Compute digest as SHA-256
of canonical JSON for the entire canonical records array sorted by
`(dictionaryID,kind,wordID)` in exact UTF-8 order, after merging the upload. If the
client's knownDigest equals this result, return `unchanged:true,records:[]`;
otherwise return `unchanged:false` with the complete canonical snapshot. Empty
records in an unchanged response do not clear local content. This handshake
avoids downloading a large custom library every five seconds while still
acknowledging idempotent or new outgoing edits. Persist the received snapshot and
its digest together; do not acknowledge a digest before local persistence succeeds.

Cross-language canonicalization vectors are in `sync/content_fixtures.json`.
