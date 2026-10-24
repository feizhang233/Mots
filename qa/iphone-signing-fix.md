# iPhone 開發安裝修復 · 2026-10-23

使用者選擇 Personal Team 後，重新構建仍出現 `CodeSign failed`。最新構建記錄實際指出 `AppIcon60x60@2x.png` 為未簽名子元件。圖示本身是正常 PNG、沒有異常延伸屬性；臨時 App 副本只把頂層 `Resources` 目錄改名後，簽名和嚴格驗證即通過，確認是資源打包布局引起的格式識別問題。

修復將 `catalog.json` 與 `audio/` 個別納入資源階段，避免 App 頂層出現 `Resources` 目錄。離線播放器按標準 bundle 資源路徑尋找音訊；詞庫載入器原有根目錄回退仍可讀取詞庫。來源檔案仍位於 `mobile/ios/Mots/Resources/`，詞庫內容和 ID 未變。

工程生成器現在會保留既有 Debug／Release 的開發 Team、Bundle ID、版本和構建號。兩項生成器回歸測試驗證配置保留及資源布局，原生資料測試亦通過；結果見 `signing-native-check.log`。

Xcode 清理舊構建後，在已連接的 iPhone 上重新 Run。簽名通過，系統嚴格簽名驗證通過；實際 App 包內詞庫與來源一致，共 3,870 個內置單字音訊。`devicectl` 只讀確認手機已安裝 `Mots` 1.0（`com.feizhang.mots`）。結果見 [`iphone-signing-verification.json`](iphone-signing-verification.json)。

目前 Xcode 啟動提示「Developer App Certificate is not trusted」。最後一步需要使用者在 iPhone「設定 → 一般／通用 → VPN 與裝置管理」中選擇自己的開發者帳戶並信任憑證。此確認未由代理執行；尚未確認實機畫面或播放效果。
