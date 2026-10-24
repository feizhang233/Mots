# 詞庫與 VPS 同步驗證 · 2026-10-23

已部署至 <https://mots.feizhang233.com/>，版本目錄 `20261023-103538-e9858642`。上一版 `20261022-refactor-v0.1.1` 保留，可回退。

- 內容版本：`1af5866376b68b350fc11fd95fb034405931c08b74e6881df7f9f1804e58554e`。
- 16 份單元 JSON 的 3,846 條法語詞彙與網頁逐欄位一致，詞條 ID 唯一。32 份 JSON／XLSX 的大小與 SHA-256 均符合來源清單。
- App 內置詞庫與公開 `database/catalog.json` 位元組完全一致，SHA-256 為 `a417ca3da652285bfc88dc57780bcd60f8116406200a7b5a35c74ce5fba769d5`；法語 3,846 詞、德語與日語各 12 詞。
- 7,693 個音訊引用存在且格式簽名有效。
- VPS 當前版本 8,100 個檔案通過全量 SHA-256 校驗；源站首頁 HTTP 200，首頁雜湊正確。
- 公網 HTTPS 驗證 87 個資源，包含公開詞庫與版本清單；內容雜湊全部相符，音訊範圍請求回傳 206。
- `mots-web`／`mots-tunnel` 均為 active。瀏覽器實際開啟新網站，顯示法語 3,846 詞及三部辭典；未修改個人熟悉程度。
- 原有五套網頁測試、八項部署測試及新增五項資料一致性測試通過。新增測試確認錯誤釋義、重複 ID、被修改的 XLSX 和未列入清單的來源會阻止發布。

原始結果：[`data-vps-sync-before-layout.json`](data-vps-sync-before-layout.json)、[`data-vps-sync.log`](data-vps-sync.log)。線上截圖：[`data-vps-live.png`](data-vps-live.png)。公開版本：<https://mots.feizhang233.com/database/content-version.json>。

後續在根目錄執行 `make build`、`make sync-vps`。流程會重新生成原生／公開詞庫快照，檢查來源、測試、上傳、啟用並核對伺服器和公網；遇到資料不一致即停止。

此處驗證的是詞庫和發布版本同步。已安裝 App 目前隨新簽名構建更新詞庫，不會自動下載 VPS 詞庫；個人學習進度、匯入辭典和設定仍存於各裝置，可透過備份轉移。本次未增加帳號或跨設備進度服務，也未執行 GitHub 發布。

目錄整理後的最新部署與驗證見 [`repository-layout.md`](repository-layout.md)；本頁保留首次同步的記錄。
