# 詞庫資料

這裡保存法語手冊第 1–16 單元的靜態詞庫，共 **3,846 個詞條**，以及 **414 詞的日語詞彙總表**。每個法語 `unitN/` 資料夾包含一份 JSON 與一份 XLSX，合計 32 份法語資料檔。

| 單元 | 詞條數 | 單元 | 詞條數 |
|---|---:|---|---:|
| 1 履歷、個人信息 | 321 | 9 感覺和運動 | 248 |
| 2 居住 | 196 | 10 學習培訓 | 153 |
| 3 環境 | 210 | 11 工作領域 | 157 |
| 4 旅遊和交通 | 167 | 12 語言 | 309 |
| 5 膳食 | 104 | 13 業餘時間和娛樂 | 304 |
| 6 購物 | 162 | 14 私人關係和聯絡 | 166 |
| 7 公共和私人服務業 | 131 | 15 政治和社會 | 334 |
| 8 身體健康和衛生 | 207 | 16 一般性概念 | 677 |

JSON 的 `words` 陣列包含詞條 ID、分類／子類、法語、中文、例句、詞性、基礎／進階級別、原書／PDF 頁碼、來源與校對註記。XLSX 提供可篩選的表格版本；內容來源與校正限制保留在各檔案的註記中。檔名與來源文字依原整理檔保留，網站介面以繁體中文顯示。

共用執行期詞庫來源是 [`runtime/data.js`](runtime/data.js)，音訊與對應清單也歸 `runtime/` 管理。Web 構建複製至 `web/dist/`，App 生成器複製至 `mobile/ios/Mots/Resources/`。此處的單元 JSON 供資料交換與維護使用，不會因修改 XLSX 而自動更新詞庫。發布時強制核對 16 份 JSON 的全部詞條欄位與執行期詞庫，並保留詞條 ID，避免既有進度錯配。

本目錄提供靜態詞庫資料，沒有另設資料庫伺服器或個人進度 API。`unit1/`–`unit16/` 是來源 JSON／Excel；`runtime/` 是兩端共用內容；`catalog.json`／`content-version.json` 是生成並發布的跨端快照。

`make build` 產生 [`catalog.json`](catalog.json) 和 [`content-version.json`](content-version.json)。前者與 iOS App 內置詞庫逐位元組相同，包含法語 3,846 詞、德語示例 12 詞及日語 414 詞；後者記錄內容版本、辭典數量、來源檔和快照 SHA-256。`make check` 及 VPS 發布準備會核對所有 JSON 欄位、詞條 ID 和法語來源檔的雜湊，發現不一致即停止。執行 `make sync-vps` 可將同一快照部署至 VPS 並驗證線上結果；具體流程見 [部署說明](../deploy/README.md)。

## 日語詞彙總表

[`japanese/source.md`](japanese/source.md) 保留使用者提供的原始 Markdown；[`japanese/vocabulary.json`](japanese/vocabulary.json) 是對應的結構化詞庫。共 414 詞，依左欄由上至下、再接右欄的順序排列，統一歸入「全部詞彙」，替換原有 12 個日語示例。顯示文字保留原表「詞彙（讀音）」和「溶く〔待確認〕」標記；中文釋義原樣保留，原表未提供詞性。另由 [`japanese/examples.json`](japanese/examples.json) 為每詞補充一條原創日語例句及繁體中文參考翻譯；這些補充不屬於原始 Markdown，網站例句顯示日語原文。

執行 `python3 scripts/import-japanese.py` 可由原表及例句補充檔重建 JSON 與 `web/src/js/languages.js` 中的日語詞庫；`python3 scripts/import-japanese.py --check` 可核對三者是否一致。新詞 ID 由詞彙及讀音產生，與舊示例 ID 分開，避免既有進度套用到不同詞條。讀音使用 Kyoko（ja-JP）合成語音，詳細範圍見 [讀音方案](../AUDIO.md)。

[`manifest.json`](manifest.json) 記錄各單元數量、32 份來源檔案的大小及 SHA-256，可用來核對下載內容。這批來源檔共 2,296,609 bytes；清單檔、本說明與生成的公開快照不計入其中。

本資料夾不包含瀏覽器內的熟悉程度、個人匯入辭典或使用設定。這些內容仍由網站儲存在目前瀏覽器，可透過「設定 → 備份」另行保存。

來源為《法语基础词汇分类学习手册》，未將來源內容另行宣告為 MIT 或其他開放授權。
