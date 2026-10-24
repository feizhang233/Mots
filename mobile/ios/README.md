# Mots for iPhone

原生 SwiftUI App，最低 iOS 26，使用系統 Liquid Glass 與 SF Symbols。無 WebView、無 Material 3、無第三方 Swift 套件。學習內容和讀音隨 App 打包，進度保存在裝置 Application Support。

## 開啟與安裝

在專案根目錄執行 `make ios-assets`，再開啟 `mobile/ios/Mots.xcodeproj`。選擇 Mots scheme、自己的 Apple 開發簽名 Team，以及連接的 iPhone 或已安裝的模擬器，執行 Run。開發者帳戶和裝置授權需由使用者在 Xcode 設定。預設 Bundle ID 為 `com.feizhang.mots`，如帳戶已佔用，改為自己的唯一識別碼。

重新生成工程會保留在 Xcode 設定的 Team、Bundle ID、版本與構建號。資源來源仍位於 `Mots/Resources/`，但只把 `catalog.json` 和 `audio/` 分別複製至 App 的標準資源位置；不在 iOS App 根部建立名為 `Resources` 的資料夾，避免被簽名工具誤判為其他 Bundle 格式。若使用早期構建，先在 Xcode 執行 Product → Clean Build Folder，再 Run。

`make ios-build` 可產生不簽名的 iOS Release 構建，用於編譯檢查。它不能直接安裝至手機。分發需在 Xcode 完成簽名及 Archive；此專案尚未提交 TestFlight 或 App Store。

本次使用 Xcode 27.0 / iOS 27 SDK。Duo 的完整邊緣與垂直控制列行為以最新版 Xcode SDK 為準；Apple 建議使用 Xcode 27.1 驗證所有姿態。不要以 Catalyst 或網頁尺寸檢查代替 Duo 裝置／模擬器測試。

## 布局與操作

- 一般 iPhone／Duo 外螢幕：單欄學習畫面，左上「分類目錄」開啟目錄，選擇後回到內容。
- Duo 展開／較寬視窗：由 `NavigationSplitView` 和系統尺寸類別決定分欄、覆蓋或收合。沒有機型判斷、固定螢幕座標或以裝置方向推測內外螢幕。
- 折疊／調整視窗不重建 `StudyStore`，保留選中辭典、單字、答案顯示、搜尋和複習隊列。進度和學習位置另外持久化至本機。
- 導航、選單及按鈕使用系統 Liquid Glass；內容卡片保留不透明底色。系統深色、Dynamic Type、減少動態及減少透明度設定受到支援。
- 查詞包含已掌握詞；主題學習可隱藏已掌握詞。隨機複習每輪最多 20 詞，優先未熟悉／有印象，可翻頁瀏覽，最後一詞點「完成本輪」。
- 目錄的一級／二級單元使用各自的詞條範圍；列表不再顯示辭典標題、語言及掌握統計區。
- 卡片頂部只以一行進度條與「目前詞序/本組詞數」呈現位置；不顯示搜尋、篩選和列表控制區。右上學習方式選單可切回列表。
- 卡片移除回想提示，可左右滑動進行原生翻頁；底部依序為上一詞、綠色已掌握、黃色有印象、紅色不熟悉、下一詞。三色按鈕不顯示漢字，選擇後自動前往下一詞，保留無障礙標籤。完成翻頁才儲存位置，取消手勢不改進度；每一張新卡片答案預設隱藏，長內容可垂直捲動。揭曉後顯示釋義、接續與最多兩個不同例句；只有語法卡片提供「查看詳情」，可讀完整例句及用法說明。詞彙卡片及列表不設詳情入口。
- 頂部書名、分類目錄及設定可切換獨立詞彙／語法書籍；語法列表採詞條／釋義與例句／熟悉度的雙排布局，另設詳情入口。例句不顯示翻譯。
- 列表中的搜尋只影響列表，切到卡片後暫停、切回後恢復。詞彙列表每列只顯示單字、釋義和右側紅／黃／綠的純色熟悉程度按鈕，不顯示例句與獨立發音符號。點單字／釋義區發音，再點停止；熟悉程度按鈕獨立操作，不觸發發音。重點已選等級可清除；列表標記不自動翻頁，隱藏已掌握時仍即時移除該列。

應用圖標由 `scripts/create-icon.swift` 生成為不透明的 1024×1024 RGB PNG，透過 `AppIcon.appiconset` 打包；圓角由 iOS 系統處理。

最新列表精簡、右側純色熟悉程度與點擊發音的模擬器驗證見 [`../../qa/ios/compact-list/verification.md`](../../qa/ios/compact-list/verification.md)。卡片翻頁與圖標的早期驗證保留在 [`../../qa/ios/paging-list-update/verification.md`](../../qa/ios/paging-list-update/verification.md)。

## 內容與備份

`make ios-assets` 執行 `scripts/export-content.cjs`，從現有 Web 內容載入器產生 `Mots/Resources/catalog.json` 和單字讀音。語法沒有預錄音，使用裝置對應語言的語音。詞彙書包含法語 3,846 詞、德語 12 詞、日語 414 詞；另有法語／德語／日語三本語法入門書，各 6 項，共 4,290 個項目。語法內容是原創入門示例，並非完整教材。`Resources/audio/` 是可重新生成的副本，不重複納入 Git；來源是專案 `database/runtime/` 的共用詞庫和音訊。

根目錄 `make build` 另外產生 `database/catalog.json` 和 `database/content-version.json`，將 App 內置詞庫與 VPS 公開詞庫綁定為同一內容版本。`make check`／`make sync-vps` 會拒絕詞庫或來源清單不一致的版本。這是構建與發布時的同步；已安裝 App 目前不會自動從 VPS 下載詞庫更新，需重新構建並安裝。

設定可匯入辭典 JSON、匯入 Web v1–v3 備份、匯出相容 v3 備份，以及按全部／一級／二級單元匯出生詞 CSV。相同辭典 ID／詞條 ID 使用匯入進度，其他內容保留；先驗證整份輸入再合併。CSV 排除已掌握詞，與畫面搜尋和頁碼無關。

App 與線上網站的設定均提供「進度同步」：一端建立配對碼，另一端輸入一次。前景連線時自動交換熟悉程度與單字刪除／還原狀態，離線修改在恢復連線後合併。首次配對合併既有進度；沒有修訂資訊的舊記錄衝突採較高熟悉程度，之後清除／降低也會同步。配對碼只存 Keychain，不包含於備份。斷開配對保留本機進度；偏好、學習位置、自訂辭典內容仍需備份轉移，相同辭典／詞條 ID 才會同步。存檔錯誤會保留記憶體內工作並顯示錯誤，請先匯出備份。卸載 App 可能清除本機進度。

進度同步、正式網站與真機安裝驗證見 [`../../qa/progress-sync/verification.md`](../../qa/progress-sync/verification.md)。

## 維護

| 檔案                            | 責任                                                       |
| ------------------------------- | ---------------------------------------------------------- |
| `Mots/App/`                     | App 入口、自適應導覽與學習方式的顯示名稱                   |
| `Mots/Features/Study/`          | 學習畫面、卡片翻頁、原生列表、側滑刪除與撤銷               |
| `Mots/Features/Settings/`       | 折疊設定、已刪除單字還原、同步與檔案轉移介面               |
| `Mots/Domain/Models.swift`      | 詞庫模型與匯入驗證                                         |
| `Mots/Data/StudyStore.swift`    | 查詞、熟悉度、可見詞條、穩定複習隊列、原子存檔與相容備份   |
| `Mots/Sync/`                    | 兩種修訂記錄、共用識別規則、Keychain 配對與 HTTPS 同步調度 |
| `Mots/Shared/`                  | 原生語義色彩、閱讀卡片與共用熟悉度／發音控制               |
| `Mots/Audio/SpeechPlayer.swift` | 離線讀音、裝置語音及單一播放生命週期                       |
| `scripts/sources.json`          | Xcode 與原生測試共用的來源清單；model 範圍不包含 SwiftUI   |
| `scripts/generate-project.py`   | 依來源目錄產生 Xcode 分組，保留 Team、Bundle ID 與版本設定 |
| `scripts/test.sh` / `Tests/`    | Store、雙通道同步、刪除還原與工程結構測試                  |

`make ios-check` 驗證內容與原生資料邏輯。`make ios-preview-build` 建立同源的 Mac Catalyst 預覽以檢查原生互動，不代表 iPhone／Duo 驗證。完整本次證據和限制見 [`../../qa/ios/verification.md`](../../qa/ios/verification.md)。

## Apple 設計依據

- [Applying Liquid Glass to custom views](https://developer.apple.com/documentation/SwiftUI/Applying-Liquid-Glass-to-custom-views)
- [Designing for iPhone Duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
- [Prepare your app for iPhone Duo](https://developer.apple.com/videos/play/tech-talks/111461/)

列表以原生 List 提供向左側滑刪除，刪除後 8 秒內可撤銷；設定「辭典與生詞 → 已刪除的單字」可長期還原，熟悉程度保留。配對同步另行傳送刪除／還原記錄；未更新 App 不會理解刪除狀態。學習位置與顯示偏好仍各自儲存。

語法模式本次驗證與截圖見 [qa/ios/grammar-study](../../qa/ios/grammar-study/verification.md)。新匯入書籍可標記 `kind: "grammar"`，並提供 `examples`、`pattern`、`explanation`；省略 kind 的新匯入沿用目前書籍種類，舊備份預設詞彙。
