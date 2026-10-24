# 手機端

[`ios/`](ios/README.md) 保存 SwiftUI 原生 App。Xcode 工程為 [`ios/Mots.xcodeproj`](ios/Mots.xcodeproj)，App 源碼、資源、原生測試和生成腳本都在這個目錄內。

從倉庫根目錄執行 `make ios-assets`、`make ios-check` 或 `make ios-build`。詞庫和讀音來源為 `../database/runtime/`；客戶端資源由生成器產生。簽名、安裝和裝置驗證要求見 [iOS 說明](ios/README.md)。
