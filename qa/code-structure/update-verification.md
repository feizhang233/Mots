# 解鎖後的模擬器測試與兩端更新

日期：2026-10-23。此記錄接續 `verification.md` 的鎖屏限制，網站及手機狀態以本記錄為準。

## Xcode 模擬器實測

透過 Xcode 的 Mots scheme 重新 Build and Run，目標為 Mots Test iPhone 17／iOS 27.0，確認新程序成功啟動。

- 列表顯示 3846 詞，保留右側紅黃綠熟悉程度，未顯示例句或獨立發音按鈕。
- 第一列向左側滑，紅色刪除按鈕出現；點擊後 l’âge 移除，總數降至 3845。
- 撤銷提示到期後，從「設定 → 辭典與生詞 → 已刪除的單字」還原；列表回到 3846，l’âge 原本黃色「有印象」保留，回收列表歸零。
- 設定預設四組收起；展開學習偏好會收起辭典與生詞。原設定值保留。
- 選擇「履歷、個人信息 → 個人數據」，列表只顯示本組 28 詞。
- 卡片顯示單行進度條及 5/28，沒有列表搜尋／篩選控制或回想提示。
- 從頁邊向左滑動，demeurer（5/28）切到 l’enfance（6/28）；反向滑動回到 5/28。顯示答案後釋義及例句正常。
- 前往 la dame（4/28）並選其既有紅色熟悉度，立即自動前往 demeurer（5/28），沒有改動原熟悉程度。
- 全部測試刪除已恢復，未將測試配對套用到實體手機。

證據：`ios-swipe-tested.png`、`ios-card-tested.png`、`ios-card-tested-ax.txt`。

## 正式網站

已發布 https://mots.feizhang233.com/ ，版本 `20261023-184506-30e00d6b`。

- 標準部署流程的 7 套 Web、30 項同步 HTTP、14 項部署及 5 項資料測試通過。
- 16161 個服務器檔案 SHA-256 相符，96 項公網資源檢查通過；音訊 Range 為 206，三個服務 active，同步 health 正常。
- 熟悉度與刪除端點的授權拒絕和 CORS 檢查通過。本次未另建跨端配對；同步合併行為由回歸測試驗證。
- 正式瀏覽器重新載入後，首頁、列表、設定互斥展開、同步可用入口及已刪除單字管理正常。
- 實際點擊最右側刪除，再點撤銷：3846 → 3845 → 3846，l’âge 黃色熟悉程度保留。沒有遺留測試刪除。

證據：`vps-deployment.json`、`vps-deployment.md`、`vps-deploy.log`、`web-published-tested.png`。

## 實體 iPhone

Xcode 選取已連接的 iPhone 16 Pro Max，使用現有 Team／Bundle ID 完成簽名構建。Xcode Run 進入安裝階段，隨後要求解鎖 iPhone 才能啟動。

為取得明確安裝結果，結束該等待後，使用 Xcode 開發工具將同一份剛生成的 `Debug-iphoneos/Mots.app` 覆蓋更新到手機，回傳 `outcome: success`。重新查詢 `com.feizhang.mots`，安裝路徑與本次成功結果一致，簽名檢查也通過。沒有卸載應用或清除進度。

手機仍鎖屏，已向使用者請求解鎖。因此 **手機更新已完成，真機啟動、原有學習位置與畫面檢查尚待解鎖**；沒有把安裝成功等同於真機互動測試通過。

證據：`phone-update-install.json`、`phone-update-install.log`、`phone-installed-app.json`。
