# 設定折疊改版驗證

日期：2026-10-23T15:39:03.092507+00:00

## 結果

App 與 Web 設定整理為四組：學習偏好、進度同步、辭典與生詞、備份與還原。普通入口預設全部收起，同時只展開一組；使用系統圖示、短摘要及整行點擊，詳細說明放在對應組內。同步狀態保留在收起的標題，原有詞庫、進度、同步協議及備份格式未變。

Web 使用原生 details/summary，保留原生 Select；iOS 使用 Form/DisclosureGroup，標題由共享全行 Button 樣式渲染。舊 sync.* 控件標識保留，分組 ID 只綁定標題，避免覆蓋子控件標識。

## 實際介面驗證

### Xcode 與 iPhone 模擬器

- Xcode 模擬器構建成功，從 Xcode Run 啟動 Mots Test iPhone 17（iOS 27.0）。
- 普通入口四組全部收起，一屏可見；點擊四組均可互斥展開；備份操作按鈕可見。
- 列表每頁原生選單提供 10/20/50/100，取消後保留既有值。
- 辭典匯入打開系統文件選擇器；取消返回後「辭典與生詞」仍展開。
- 輸入無效測試配對碼，完整錯誤顯示在四組外；收起同步後仍可見，短摘要顯示配對未完成。輸入隨收起清除。測試未建立配對或傳輸真實憑證。
- 關閉／重新打開設定：四組重新收起，保存值與原有熟悉程度保留。
- 真機版沿用現有 Team/Bundle ID 構建成功；當前 iPhone 顯示 unavailable，因此尚未安裝本次設定改版，待重新連接。

### 正式網站瀏覽器

- 默認全部收起，桌面設定高度約 511px。Enter 可展開，Space 可切換，始終僅一組展開。
- 首頁匯入入口只展開「辭典與生詞」並聚焦其標題；普通關閉／重開返回全部收起。
- 無效配對碼顯示明確校驗訊息；切換組後保留短錯誤摘要，輸入清空並恢復遮蔽。
- 320px：對話框寬 296px、文檔寬 320px；390px：文檔寬 390px、分組標題高度 76px。無橫向溢出。
- 窄屏學習組長內容在設定內可捲動，辭典原生選單可開啟；Escape 關閉選單且設定仍開啟。
- 最終正式版本重新載入後全部收起，瀏覽器控制台沒有 warning/error。

## 自動檢查與發布

- `make sync-vps` 的完整檢查通過：6 組 Web、18 個同步服務、12 個部署／回退、5 個資料一致性測試，以及生成檔與語法檢查。
- 本次 5 個修改的 Web 檔案 Prettier 檢查通過。
- 官方 DESIGN.md lint：0 errors；16 個既有 orphaned-tokens 警告。沿用既有 CSS/Theme 色彩與字體，未新增全局視覺 token。
- 嚴格 UI 稽核：33 個既有 affordance.actionless-button 啟發式結果，均源於未解析 addEventListener 綁定；沒有未解決的 canonical ownership。事件綁定、既有回歸與瀏覽器操作補充驗證，未宣稱稽核零告警。
- 正式版本：`/home/fei/Work/Mots/releases/20261023-153141-05d82df6`。16154 份服務器檔案校驗一致、93 項公網檢查通過，包含進度服務 health 與音訊 Range。

## 設計契約調整

| 原規則 | 新規則 | 理由 |
|---|---|---|
| 辭典選擇直接位於設定頂端 | 位於第一組「學習偏好」內 | 用戶要求默認頁面簡短、點擊展開 |
| 所有設定直接展開 | 四組互斥 disclosure | 減少滾動與重複說明 |
| 操作訊息位於各長區塊 | iOS 全局可見；Web 用戶操作展開對應組，背景同步只改摘要 | 保留反饋而不搶焦點 |

## 證據與限制

截圖：[`ios-collapsed-final.png`](ios-collapsed-final.png)、[`ios-error-collapsed.png`](ios-error-collapsed.png)、[`web-collapsed-mobile-final.png`](web-collapsed-mobile-final.png)、[`web-learning-320.png`](web-learning-320.png)、[`web-collapsed-desktop-final.png`](web-collapsed-desktop-final.png)。

實機尚未連接；未宣稱已完成實體手機安裝、大字體全矩陣或螢幕閱讀器真人驗收。
