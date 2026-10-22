# 程式結構

`src/` 是介面程式唯一維護來源。`scripts/build.py` 將來源複製成可獨立服務的 `dist/`，並在 HTML 的腳本與樣式網址加上內容雜湊。`--check` 只比較、不寫入，防止來源改了但發布的成品未更新。

## 模組責任

| 來源 | 責任 |
|---|---|
| `src/js/core.js` | HTML 轉義、物件判斷、既有詞條 ID 雜湊 |
| `src/js/languages.js` | 語言資料、中文轉換、德語與日語示例詞庫 |
| `src/js/dictionaries.js` | 辭典身分、格式與完整新辭典驗證 |
| `src/js/entries.js` | 既有擴充詞庫及舊備份的相容驗證 |
| `src/js/audio.js` | 單一播放器、裝置語音、過期事件與失敗回退 |
| `src/js/downloads.js` | JSON／CSV 下載及試算表公式轉義 |
| `src/js/workspace.js` | 首頁和複習摘要的無狀態畫面渲染 |
| `src/js/app.js` | 狀態、路由、進度儲存與互動協調 |
| `src/components/material-select.js` | 官方 Select 的選項和值同步、視窗縮放時關閉選單 |

以 `src/index.html` 的 defer 順序載入。共用工具先於驗證和畫面模組；應用入口最後執行。所有成品使用 classic scripts，讓 `file://` 單檔離線版也能執行，沒有模組網路載入需求。

詞條、分類、音訊清單和音訊檔是現有內容資產，保留在 `dist/data.js`、`dist/audio-manifest.js`、`dist/extra-audio.js` 及音訊目錄；逐單元來源在 `database/`。一般程式構建不重寫這些資料。

## 共用樣式與格式

`src/styles/styles.css` 擁有全站主題、控制項和學習版面；`select.css` 將這些主題值提供給官方元件；`workspace.css` 擁有首頁、複習和模式導覽。舊版已移除入口的樣式不再保留，無條件的 `:root` 主題值集中在一處。

JavaScript、HTML、CSS 使用 `.prettierrc.json`。需要重新排版時可執行 `npx prettier@3.9.6 --write src tests`。第三方生成的 `dist/select.js` 不手改，也不以格式器改寫。

## 官方 Select 重新打包

一般構建直接校驗並使用倉庫已有的官方 bundle。只有修改 Select 接合程式／依賴時才需要重新打包：

```sh
python3 scripts/build-material-select.py --node-modules /absolute/path/to/node_modules
make build
```

依賴版本和完整授權文字在 `scripts/vendor/material-select/`。打包工具拒絕版本不符的依賴，且不執行安裝或網路操作；生成的 `build.json` 記錄來源、授權與 bundle 雜湊。一般構建會拒絕過期的 bundle。

## 驗證和發布

`make test` 檢查構建是否一致、所有內容腳本語法，以及瀏覽器替身與部署回退回歸。真實瀏覽器還需檢查桌面／窄屏、搜尋、模式切換、設定下拉和發音狀態。

`make package` 生成單 HTML 與完整 ZIP，包含 `src`、測試、構建和部署工具。`make prepare` 產生完整資產 SHA-256 清單；VPS 上傳到新目錄，校驗後切換，失敗恢復上一版。具體步驟見 [部署說明](../deploy/README.md)。

進度鍵與匯入格式沿用原有版本；這次結構整理不執行使用者資料遷移。
