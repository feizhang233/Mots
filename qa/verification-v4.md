# v4 驗證紀錄

2026-10-22，延續 v3。下列瀏覽器結果由主要實作者在 Codex 內建瀏覽器實測；文件代理僅整理證據與唯讀邏輯檢查，沒有宣稱實機手機測試或人工聽辨。法語原書內容由其他聊天持續更新，詞數採介面即時統計，不固定寫入本紀錄。

## 官方 Material 3 Select

- 設定使用本地打包的 Google `@material/web` `md-outlined-select`，透過共享 `MotsSelect` 的 options/value API 配置四個欄位。原生 select markup 已移除。
- 桌面欄位高度 56px；已開啟的選單和觸發欄位寬度皆為 227.5px，左邊界皆為 406px。
- 背誦語言切換為德語成功。每頁詞數選單可用 Home + Enter 選到 10 詞；Escape 會關閉選單並保留設定對話框。
- 截圖：`settings-select-v4.png`、`page-size-select-v4.png`。

## 每頁單字數與 URL

- 選 50 時實際產生 50 行，頁數為 1 / 7；切至 2 / 7，重新整理後保留。
- 鍵盤選 10 後實際顯示 10 行；選 100 後實際顯示 100 行。
- URL 請求 page=999 時，依篩選結果修正至末頁，顯示第 21–27 詞／共 27 詞。
- 由程式碼確認 size 只接受 10/20/50/100；page 只接受正整數並依結果上限修正。修改 size 計算舊頁第一詞的位置，找出新 size 所屬頁；篩選重設頁 1。

## 已掌握預設隱藏

- 將 l’âge 標記為 3，再開啟預設隱藏開關後，該詞立即消失。
- 新 URL 不帶 hide 時仍套用已保存的預設隱藏。
- 篩選中顯示所有熟悉程度後產生明確 hide=，重新整理仍可查看已掌握詞；預設開關維持啟用。
- 由程式碼確認開關預設 false，開啟／關閉會對三語新增／移除 hidden 3，保留其他 hidden 等級；切換語言時套用啟用的預設。

## 側欄

- 桌面收合後側欄 display:none，workspace 左邊界為 0；重新整理仍保持收合。頁首展開鈕維持可用且有 aria-expanded。
- 截圖：`sidebar-collapsed-v4.png`。

## 窄視口與響應式焦點

- 390px 手機視口的釋義選單已開啟檢視，截圖 `mobile-select-v4.png`。
- 320×700 視口的發音方式選單 left=33、width=254px；觸發器也是 254px，選單 bottom=553，小於視口高度 700。穩定後 document.scrollWidth=320，沒有持續橫向溢出。
- 調整尺寸的官方關閉動畫期間，舊選單曾短暫使 scrollWidth=357；動畫穩定後回到 320。此為已觀察到的過渡限制，沒有宣稱動畫全程零溢出。
- 桌面目錄已收合時，從 320px 分類對話框切回桌面後，分類對話框會關閉，焦點移至可見的 sidebar-toggle。1280px 桌面沒有橫向溢出。

## 設定備份與還原

- v4 介面下載的版本 2 備份經檔案實讀，包含 pageSize=100、defaultHideMastered=true、sidebarCollapsed=true。
- 先在介面關閉預設隱藏，再還原該備份；回報已合併 1 個詞的進度，開關恢復 true、body 恢復收合狀態，分頁顯示每頁 100 詞。
- 本輪瀏覽器 console 沒有 warning 或 error。

## 程式與範圍檢查

- 六個腳本 app/data/languages/audio-manifest/extra-audio/select 均執行 node --check。
- 唯讀 VM 檢查通過：舊設定預設 pageSize=20、兩個新布林設定為 false；套用 mastered 預設會保留其他隱藏等級；20→50、50→100、10→50 的頁面計算讓原第一詞仍位於新頁面。
- 正常嚴格靜態審計為 0 findings，但具有下節記錄的 dist 排除限制。另將 9 個 runtime 檔複製到非排除路徑補掃，只剩 21 個 actionless-button 啟發式候選；已核對它們由 app 的外接或委派事件處理。原生 Select ownership 衝突已不存在。
- 本紀錄涵蓋瀏覽器視口與操作、程式碼及 VM 檢查；不宣稱實體手機、人工讀音聽辨或完整 200% 縮放矩陣。單檔與 ZIP 完整性由另行執行的打包器檢查。

## 檢查範圍

靜態審計工具內建忽略 dist 路徑，因此一般 0 findings 只代表合約檢查無問題，不能當成完整程式掃描。另以 /private/tmp 下的來源快照補查。工具的 actionless-button 啟發式只辨識行內 onclick／框架事件，無法證實本專案的 addEventListener 與事件委派；對應按鈕須以瀏覽器實際操作驗證。不要為消除這類候選警示加入空事件。

## 最後確認

- 設定視窗每次開啟回到頂部；瀏覽器量測 scrollTop=0，完成截圖為 settings-v4.png。
- 最後打包會驗證六段內嵌腳本語法、音訊內嵌及 ZIP CRC，並比較打包前後的執行檔雜湊；法語詞庫更新仍由其他聊天負責。
