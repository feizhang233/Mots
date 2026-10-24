# 程式結構與維護邊界

Mots 分成 Web、原生 iOS 和配對同步服務。三者共用詞條身分與同步協議，介面各自使用平台原生能力。新增功能應先找到下表中的責任模組；入口檔負責協調，驗證、渲染與資料儲存各有單一維護位置。

## 目錄地圖

```text
french-atelier/
├── web/
│   ├── src/js/             應用協調、領域驗證、同步與畫面模組
│   ├── src/components/     共用原生 Select 接合層
│   ├── src/styles/         主題與版面
│   ├── scripts/            靜態網站構建
│   ├── tests/              Web 行為回歸
│   └── dist/               生成網站，不直接修改
├── mobile/ios/
│   ├── Mots/
│   │   ├── App/            App 生命週期與導航
│   │   ├── Features/       Study、Settings 畫面
│   │   ├── Shared/         共用原生主題與控制項
│   │   ├── Audio/          發音生命週期
│   │   ├── Domain/         詞庫與設定模型
│   │   ├── Data/           學習狀態與本機持久化
│   │   ├── Sync/           同步修訂、憑證與傳輸
│   │   └── Resources/      生成的詞庫與音訊副本
│   ├── scripts/            資料匯出、工程生成與測試
│   ├── Tests/              原生邏輯與工程完整性回歸
│   └── Mots.xcodeproj/     可重建的 Xcode 工程
├── sync/                   Python 配對服務與 HTTP 回歸
├── database/               原書 JSON／Excel、共用執行期詞庫與音訊
├── deploy/                 發布校驗、啟用與回退
├── scripts/                跨端資料核對與離線打包
├── tests/                  部署與資料完整性回歸
├── docs/                   維護說明
└── qa/                     已執行驗證的記錄與證據
```

## Web 模組

| 模組（`web/src/js/`）           | 責任                                               |
| ------------------------------- | -------------------------------------------------- |
| `app.js`                        | 狀態、路由、學習動作、儲存與匯入的提交協調         |
| `workspace.js`                  | 從傳入模型產生首頁、列表、卡片與複習 HTML          |
| `settings-panel.js`             | 設定分組渲染、展開、遮碼及就地回饋                 |
| `sync-protocol.js`              | 熟悉程度與刪除記錄的共用嚴格驗證、排序及合併規則   |
| `progress-sync.js`              | 唯一配對／網路擁有者；雙通道交換、重試與跨分頁協調 |
| `deletion-state.js`             | 刪除修訂的本機儲存、時鐘、恢復及備份預檢           |
| `dictionaries.js`、`entries.js` | 新辭典、擴充詞條及舊資料格式驗證                   |
| `languages.js`                  | 語言、中文轉換資料與德語／日語示例詞庫             |
| `audio.js`                      | 單一播放器、裝置語音、過期事件與失敗回退           |
| `downloads.js`                  | JSON／CSV 下載及試算表公式轉義                     |
| `core.js`                       | HTML 轉義、物件判斷與既有詞條 ID 雜湊              |

`index.html` 的 `defer` 順序是正式載入順序，共用協議和渲染模組先於應用入口。使用 classic scripts，讓同一份程式也能內嵌到 `file://` 離線 HTML。`web/scripts/build.py` 產生平鋪的 `dist/` 並在入口加入內容雜湊；不要手改成品或另建平行的載入清單。

`styles.css` 擁有共用主題和學習版面；`workspace.css` 擁有首頁、複習及模式導覽；`select.css` 為系統選單提供樣式。`components/select.js` 是唯一選項／值接合層，選單互動由作業系統負責。視覺規則見 [`../DESIGN.md`](../DESIGN.md)，行為規則見 [`../UX-CONTRACT.md`](../UX-CONTRACT.md)。

## 原生 iOS 模組

`App/AppView.swift` 只組裝導航與工作區；`Features/Study/` 擁有學習控制、Cards 的翻頁容器及 List 的原生側滑；`Features/Settings/` 擁有設定分組、同步設定和已刪除詞條恢復。共用熟悉程度與發音控制位於 `Shared/WordControls.swift`，顏色及系統材質位於 `Shared/Theme.swift`。

`Data/StudyStore.swift` 是學習位置、篩選、隨機複習、進度、刪除與本機存檔的唯一擁有者。畫面呼叫 store 的動作，不另外保存一套學習記錄。`Sync/` 分離純修訂資料、Keychain 憑證和非同步傳輸控制；`Audio/SpeechPlayer.swift` 擁有發音生命週期。`Domain/Models.swift` 保存共用值型別。

`generate-project.py` 登記來源並保留現有簽名 Team 和 Bundle ID。新增 Swift 檔時必須同時通過工程來源完整性測試；Foundation 邏輯測試與含 SwiftUI／UIKit 的平台構建分開驗證。詳細入口見 [`../mobile/ios/README.md`](../mobile/ios/README.md)。

## 同步服務

| 模組                  | 責任                                                      |
| --------------------- | --------------------------------------------------------- |
| `sync/server.py`      | 命令列啟動入口                                            |
| `sync/protocol.py`    | 協議常量、嚴格 JSON／記錄驗證與修訂比較                   |
| `sync/store.py`       | 憑證摘要、私人 SQLite、兩條通道的原子交易                 |
| `sync/http_server.py` | HTTP 路由、Origin／CORS、鑑權順序、請求限制與建立配對限流 |
| `sync/test_server.py` | 使用真實本機 HTTP 的整合回歸                              |

服務可用 `python3 sync/server.py` 或 `python3 -m sync.server` 啟動。熟悉程度與刪除各有獨立端點及修訂集合，沿用同一私人配對；恢復記錄也要保留，缺少記錄不代表恢復。協議唯一規格見 [`../sync/PROTOCOL.md`](../sync/PROTOCOL.md)。

## 資料與相容性

- `database/runtime/` 是詞條、分類、音訊清單及音訊的共用來源；單元 JSON／Excel 也在 `database/`。生成的 Web 與 App 副本不得獨立修改。
- 原有辭典／詞條 ID、本機儲存鍵、備份版本與同步線上格式保持相容。重構不觸發資料遷移或清除學習記錄。
- 普通與主題語法使用不同書籍 ID／資料庫；`kind: grammar` 搭配 `grammarMode: standard | thematic` 決定操作方式。缺少欄位的舊書籍視為普通語法，不能用顯示設定或備份將同一本書改成另一類。三本主題語法內建書先保留空內容，等待來源資料。
- 配對碼不進入備份、日誌或來源包。服務端私人 SQLite 位於發布目錄外，不能加入公開資產。
- 舊資料相容分支及原書音訊是仍在使用的能力，不能只因檔案大或名稱舊而當作冗餘刪除。

## 日常修改與驗證

```sh
make help          # 查看開發入口
make build         # 構建 Web 並核對兩端詞庫
make test          # 成品一致性、全部 JS 語法及 Web／同步／工具回歸
make test-web      # Web 回歸（含成品一致性檢查）
make test-sync     # 同步 HTTP 回歸
make test-tools    # 部署回退及跨端資料一致性
make ios-check     # 重建工程，原生模型／同步／刪除及工程回歸
make serve         # 本機 Web 預覽
make package       # 驗證後重新生成離線 HTML／完整 ZIP
```

JS／HTML／CSS 遵循 `.prettierrc.json`。構建工具只依賴 Python 標準庫和 Node.js；無需在產品中加入前端框架。驗證記錄需區分自動測試、瀏覽器操作、Xcode 構建與實機安裝。

部署使用 `make prepare` 生成 SHA-256 清單，或 `make sync-vps` 驗證後發布。同步服務的每個執行期模組都必須列在 `deploy/common.py` 的 `SYNC_RELEASE_FILES`；漏列、遺失或內容損壞會在啟用前失敗。發布與回退流程見 [`../deploy/README.md`](../deploy/README.md)。
