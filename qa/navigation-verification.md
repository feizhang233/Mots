# 导航调整验证 · 2026-10-22

线上版本：`/home/fei/Work/Mots/releases/20261022-navigation`。
地址：<https://mots.feizhang233.com/>。

## 完成的行为

- 词典切换从右上角移至设置第一项“目前辞典”，沿用同一个官方 Material Select。
- 移除横向模式按钮条，使用搜索左侧的下拉切换查词典、主题学习、随机复习。
- 下拉不含首页；复习栏及完成摘要不再提供回首页按钮，Mots 标志是唯一显式返回首页入口。
- 手机及收合侧栏时，页首保留 Mots 链接。
- 辞典导入、备份还原及另一分页的更新保留当前视图；被取消的复习回到主题学习。
- 源站之外的缓存曾复用旧脚本，现由 `deploy/prepare.py` 为 JS／CSS 生成内容哈希版本号；离线打包仍解析并嵌入原文件。
- 打开菜单后改变视口会经共用适配器关闭菜单，下次打开重新测量当前宽度。

## 验证证据

- 8 个已配置 JavaScript 语法检查、离线打包脚本语法／音频／ZIP 完整性检查通过；7,693 个音频引用保留。
- 严格静态审计零发现，见 `navigation-static-audit.json`。其对 dist 的扫描限制仍适用。
- 原有应用／存储 VM 回归通过；卡片接续和 Select 桥接回归见 `navigation-card-resume-regression.json`、`navigation-select-regression.json`。Select 测试的 window 桩仅补充标准事件注册接口。
- 本地真实浏览器通过三模式切换、键盘 Home／方向键／Enter、设置中切换词典、无结果／清除搜索和 Mots 返回首页。
- 线上真实浏览器确认新入口、无独立首页按钮、设置词典菜单及菜单展开状态；控制台无 warning／error。
- 线上 320px 视口：文档宽 320px；设置词典触发器和展开菜单均宽 254px。桌面菜单打开后缩窄视口，会关闭菜单；重新打开无横向溢出。
- 公网 81 个资源校验值匹配，含全部网页脚本／样式的实际版本化地址、配套词库文件及音频样本；音频 Range 返回 206。见 `navigation-online-http.json`。
- 线上截图：`navigation-online-desktop.png`、`navigation-settings-mobile.png`。

官方 DESIGN.md lint 已尝试，但 npm registry 的 DNS 解析返回 ENOTFOUND，未能下载工具，不记为通过。生成的第三方 `dist/select.js` 包含模板字符串内的尾部空白；手写文件的 diff 空白检查通过。未宣称实机手机或屏幕阅读器测试。

原部署版本 `20261022-be45b2a` 已保留。学习进度和自定义词典继续保存在浏览器本地。
