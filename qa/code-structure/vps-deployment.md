# Mots 程式結構整理正式網站部署

驗證時間：2026-10-23T20:48:03.411483+02:00（Europe/Belgrade）。

- 正式網站：https://mots.feizhang233.com/
- 部署 ID：`20261023-184506-30e00d6b`
- 目前目錄：`/home/fei/Work/Mots/releases/20261023-184506-30e00d6b`
- 可回退版本：`/home/fei/Work/Mots/releases/20261023-181843-ec7d8eec`
- 標準流程：`deploy/sync.py` 執行既有測試、prepare、候選上傳、全量 SHA-256 及配置檢查，再激活和驗證。
- 測試：7 套 Web、30 項同步 HTTP、14 項部署、5 項資料完整性全部通過。
- 伺服器：16161 個檔案全部 SHA-256 相符；網站、隧道與同步服務均 active。
- 公網：96 項 HTTPS 資源及 SHA-256 相符；音訊範圍請求 HTTP 206；同步 health 回傳版本 1 / ok，禁止快取。
- 相容性：`/api/sync/exchange` 與 `/api/sync/deletions` 未授權 POST 均為 HTTP 401；合法來源 OPTIONS 均為 HTTP 200，Bearer/JSON CORS 標頭保留。完整 wire merge 相容性由已通過且已部署同哈希程式的 30 項 HTTP 回歸確認。
- 詞庫內容版本保持 `9baa87240d5442e79ef0906728f6d2414bc9a32b618a632a72a1808e8419ea9a`：法語 3846 詞，德語／日語各 12 詞。

此次未建立配對組、未寫入私人學習進度，未推送 Git、未建立 GitHub Release，未操作瀏覽器或手機。Xcode 工程及 Swift 來源未改動。部署未觸發回退，上一版本保留。

證據：`vps-deploy.log`、`vps-deployment.json`；標準流程原始結果另存於 `qa/data-vps-sync.json`。
