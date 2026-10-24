# 倉庫分類整理 · 2026-10-23

```text
french-atelier/
├── web/                 網頁端
│   ├── src/             維護來源
│   ├── dist/            生成的可部署網站
│   ├── scripts/         Web 構建與資產工具
│   └── tests/           五套網頁回歸測試
├── mobile/
│   └── ios/             原生 App、Xcode 工程、資源與測試
├── database/
│   ├── unit1/–unit16/   來源 JSON／Excel
│   ├── runtime/         共用詞庫、音訊與映射清單
│   ├── catalog.json     跨端詞庫快照
│   └── content-version.json
├── deploy/              VPS 發布與回退
├── scripts/             跨端同步與完整打包
├── tests/               資料一致性與部署測試
├── docs/                共用文件
└── qa/                  驗證記錄
```

原 `src/`、`dist/` 和 `ios/` 根目錄已遷移。共用詞庫／音訊從原 `dist/` 歸入 `database/runtime/`，Web 和 iOS 的資源都是生成副本；原始詞條和音訊內容、詞條 ID、進度鍵及原生 Bundle ID 沒有修改。更新了 Makefile、測試、匯出器、打包、VPS 安裝／檢查、忽略規則、文件連結及介面工具的來源目錄設定。

## 驗證

- `make build`／`make test` 通過：Web 來源及資料副本一致，五套 Web、八項部署、五項跨端資料測試通過。部署測試另外拒絕 `web/src/` 和 `web/scripts/` 被誤放入公開發布清單。
- 新目錄下 `make ios-check` 及 `make ios-build` 通過。原生邏輯、3,870 個詞條與內置讀音保持一致，iOS Release 構建成功。見 `layout-native-tests.log`、`layout-ios-build.log`。
- 當前說明文件的本機連結全部有效，舊的三個根目錄不存在。
- 新 VPS 版本：`20261023-104552-18d2f50f`。Nginx 根目錄改為 `current/web/dist`，公開網址和 `/database/` 路徑保持相容。
- 16,150 個服務端網站／資料檔全量 SHA-256 通過，92 項公網資源校驗通過，音訊 Range 為 206，源站首頁為 200 且 SHA-256 正確，兩個服務均為 active。
- 內容版本 `9baa87240d5442e7`；App／公開詞庫的 SHA-256 仍為 `a417ca3da652285bfc88dc57780bcd60f8116406200a7b5a35c74ce5fba769d5`。版本清單更新反映資料來源路徑整理，詞庫快照內容未變。

最新機器可讀結果為 [`data-vps-sync.json`](data-vps-sync.json)，本次完整發布記錄為 [`layout-vps-sync.log`](layout-vps-sync.log)。舊 `qa/` 記錄中的歷史路徑保留，不能用作目前工程入口。

本次沒有改動介面行為或重新進行實機測試。個人進度仍在各裝置本地，已安裝 App 的詞庫更新仍需新簽名構建。目錄整理及 VPS 同步已完成；未執行 GitHub 推送。
