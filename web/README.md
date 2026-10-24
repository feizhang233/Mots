# Web 端

| 目錄       | 責任                                                              |
| ---------- | ----------------------------------------------------------------- |
| `src/`     | HTML、JavaScript、CSS 和圖示的維護來源                            |
| `dist/`    | 可部署網站，由構建產生；詞庫／音訊副本來自 `../database/runtime/` |
| `scripts/` | 構建、資產路徑和內容雜湊工具                                      |
| `tests/`   | 導航、儲存、卡片續讀、選單、音訊、同步與刪除回歸                  |

從倉庫根目錄執行 `make build`、`make test`、`make serve`。預覽網址為 `http://localhost:4173`。不要直接修改 `dist/`；共用詞庫的維護方式見 [資料庫說明](../database/README.md)。

VPS 發布使用根目錄 `make sync-vps`，完整流程見 [部署說明](../deploy/README.md)。線上網址及既有學習進度鍵保持相容。

## 瀏覽器程式結構

`src/index.html` 是唯一的腳本載入順序。所有模組保留 classic script 與明確的 `window.Mots…` 介面，讓線上網站和單檔離線版共用同一份程式；不依賴 ES module、套件安裝或執行時載入。

| 模組                                               | 責任                                                                       |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| `core.js`、`dictionaries.js`、`entries.js`         | 共用純函式、辭典與匯入資料規則                                             |
| `languages.js`                                     | 語言定義、繁簡轉換表與初始詞庫；檔案大小主要來自資料，保留原順序與轉換結果 |
| `workspace.js`                                     | 首頁、複習摘要、學習卡片與列表的 HTML 渲染；不修改學習資料                 |
| `settings-panel.js`                                | 設定顯示、折疊分組、配對碼遮罩與已刪除詞分頁；資料操作交回應用程式         |
| `sync-protocol.js`                                 | 兩條同步通道共用的嚴格校驗、排序與衝突比較；不儲存資料或發送請求           |
| `deletion-state.js`                                | 刪除記錄、本機時鐘、還原備份的預檢與儲存                                   |
| `progress-sync.js`                                 | 熟悉度記錄、配對憑證，以及兩條通道共用的排程與網路生命週期                 |
| `audio.js`、`downloads.js`、`components/select.js` | 播放、下載與原生選單介面                                                   |
| `app.js`                                           | 應用狀態、學習隊列、導航、事件協調與跨模組資料操作                         |

同步腳本必須依序載入 `sync-protocol.js` → `deletion-state.js` → `progress-sync.js`；設定與畫面模組在 `app.js` 之前載入。構建會保留檔名並為 HTML 引用加入內容雜湊，重名資產會直接報錯。

從倉庫根目錄執行 `MOTS_TEST_SOURCE=1 node web/tests/run.cjs` 可在產生 `dist/` 前檢查維護來源。測試替身沿用 HTML 的載入順序；預設測試則驗證構建輸出。

## 詞彙與語法背誦

頂部選擇書籍，詞彙與語法分屬獨立書籍，不再另設背誦模式切換。既有詞彙進度保留；三組語法入門示例各有 6 項，使用獨立學習進度。列表以詞條與釋義、例句與熟悉程度兩排呈現；卡片顯示至多兩個不同例句，詳情展示完整例句、接續及說明。現有詞彙只收錄一個例句時不重複填補。

JSON 學習集可設定 `kind: "grammar"` 或 `"vocabulary"`。詞條支援 `examples: [{text, translations: {"zh-Hant": "翻譯"}}]`、`pattern`、`explanation`，並相容舊 `example` 欄位。`grammar.js` 的原創示例是 Web 專用內容，尚非完整課程。

內建書名：Français Mots／Français Grammaire、Deutsch Wörter／Deutsch Grammatik、日本語 語彙／日本語 文法。例句只顯示原文；詞條釋義與用法說明保留。匯入書籍沿用其自訂名稱。
