# 程式整理驗證記錄

日期：2026-10-23。此次為本機程式結構整理，沒有部署網站、推送遠端或安裝實機。

後續模擬器實測、正式網站發布及手機更新見 [`update-verification.md`](update-verification.md)。

## 結構與冗餘

- Web：設定展示與暫存狀態移到 `settings-panel.js`；列表／卡片純渲染移到 `workspace.js`；進度及刪除通道共用 `sync-protocol.js` 的嚴格校驗、修訂比較與合併。移除重複配對碼重置分支。`app.js` 由 1952 行縮至 1728 行，進度同步由 582 行縮至 511 行，刪除狀態由 233 行縮至 168 行。
- iOS：22 個 Swift 來源按 App、Features、Shared、Audio、Domain、Data、Sync 分組。`AppView.swift` 由 949 行拆分為 215 行，`SettingsView.swift` 由 454 行拆分為 250 行。移除未使用的 `languageName()` 和發音按鈕無呼叫的分支；共用精確詞條身分處理。工程及測試共用 `scripts/sources.json`。
- 同步服務：原 480 行 `server.py` 拆成 40 行入口，協議、SQLite 和 HTTP 分別由 `protocol.py`、`store.py`、`http_server.py` 維護。保留既有 API、資料庫結構與嚴格驗證差異。
- 工具：統一 Makefile 入口；JS 語法檢查覆蓋全部生成檔；構建拒絕平鋪資產重名；發布清單強制包含每個同步執行期模組，防止模組與清單同時遺失後才於服務啟動失敗。
- 說明：`docs/architecture.md`、根目錄／Web／iOS README 和設計文件已對應新的目錄與維護責任。

## 已通過的驗證

| 項目 | 結果與證據 |
| --- | --- |
| Web 構建 | 18 個介面資產，全部生成 JS 語法通過；`build.log` |
| Web 行為 | 7 套回歸通過，涵蓋導航、匯入、備份、翻頁、音訊、同步、刪除／恢復；`tests.log` |
| 同步 HTTP | 30 項測試通過；`tests.log` |
| 部署與資料 | 14 項部署、5 項資料完整性測試通過；`tests.log` |
| iOS 邏輯與工程 | 3 套原生邏輯回歸、6 項工程測試通過；`ios-check.log` |
| Xcode | iPhone 17 模擬器 Debug 構建成功；`ios-build.log` |
| 發布檔案 | 7693 個音訊參照與 16161 個檔案校驗；`prepare.log` |
| 離線包 | HTML 內嵌 16 個腳本及 7693 個音訊，JS 語法通過，ZIP 成功生成；`package.log` |
| 詞庫相容 | 資料版本仍為 `9baa87240d5442e7`，法語 3846 詞、德語／日語各 12 詞，32 個來源檔；原生與 Web 一致 |

Web 拆分前後的首頁／查詞／卡片 HTML 與設定摘要逐字比對一致。只讀覆核未發現載入順序、初始化、閉包狀態、事件重複綁定或協議相容問題。Xcode 完整構建發現並修復展示屬性與域模型同名的衝突，新增跨檔案型別檢查後重建成功。

## 畫面檢查與限制

本機瀏覽器確認首頁載入、單元列表、刪除入口、卡片／列表切換、答案展開、上一詞／下一詞、設定互斥展開、關閉後收合和同步不可用狀態正常。沒有改動既有熟悉程度或刪除記錄。截圖為 `web-settings.png`。

Mac 鎖屏，Xcode 原生界面操作無法進行，因此本次沒有聲稱模擬器互動測試或實機安裝完成。同步網路行為由本機真實 HTTP 與跨端協議回歸驗證，沒有改寫正式配對資料。

設計文件檢查為 0 錯誤、16 個既有未引用 token 警告。UI 靜態掃描仍回報原有 39 個 `affordance.actionless-button`：掃描器不追蹤外部腳本／委託事件，這些按鈕已由 app、settings-panel 等模組綁定；並非嚴格掃描零問題。記錄見 `design-lint.log`、`ui-audit.json`。
