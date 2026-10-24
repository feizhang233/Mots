# Mots VPS 部署

网站：https://mots.feizhang233.com/

服务器：`vultr-tokyo-fei`（`45.76.111.16`），用户 `fei`。


## 部署结构

- 项目：`/home/fei/Work/Mots`
- 当前版本：`current` 符号链接，指向 `releases/` 内已启用的发布目录；旧目录保留用于回退
- 网站：`current/web/dist`，包含词条、界面和全部音频
- 配套 JSON／Excel：`current/database`，通过 `/database/` 下的具体文件路径访问
- Nginx：`127.0.0.1:8010`，用户服务 `mots-web.service`
- 进度 API：`127.0.0.1:8011`，用户服务 `mots-progress.service`，由 Nginx `/api/sync/` 转发
- 私人进度：`/home/fei/Work/Mots/private/progress.sqlite3`，目录 0700／文件 0600，位于发布目录之外
- 独立 Cloudflare Tunnel：`mots-tunnel.service`，配置 `~/.cloudflared/config-mots.yml`
- 服务已启用，`fei` 的 linger 已开启，退出 SSH 后继续运行，系统启动时自动启动
- Nginx 错误日志：`logs/error.log`；隧道日志：`journalctl --user -u mots-tunnel`

Cloudflare 提供公网 HTTPS，源站只监听回环地址。部署不需要额外的数据库服务器。
配对后的熟悉程度经 HTTPS 自动同步；自定义词典内容和设置仍保存在本机。配对码只以 SHA-256 摘要保存在服务端，数据库不可从网站下载。原本本地文件网址下的进度需要先备份，再到线上网站还原并配对。

## 更新

推荐在本地项目目录执行：

```sh
make build
make sync-vps
```

此命令先检查 16 份单元 JSON 与网页全部词条字段、32 份 JSON／XLSX 的清单和 SHA-256、App 内置词库及公开词库快照，再运行回归测试、生成新发布目录、上传和激活。VPS 全量文件校验和公网资源校验通过后，才写入 `qa/data-vps-sync.json`。旧发布目录保留以便回退。

`/database/catalog.json` 与 App 内置 `Resources/catalog.json` 字节一致；`/database/content-version.json` 提供内容版本、数量和校验值。每次词库更新后使用同一流程，禁止只复制单个运行期文件绕过检查。这个流程同步发布的词库；已安装 App 的词库仍随签名构建更新，个人熟悉程度与单词删除／恢复状态由独立进度服务同步。

需要逐步操作时，版本目录名每次使用新值：

```sh
python3 deploy/prepare.py
release="$(date +%Y%m%d-%H%M%S)"
ssh vultr-tokyo-fei "mkdir -p /home/fei/Work/Mots/releases/$release"
rsync -az web database deploy sync scripts README.md AUDIO.md DESIGN.md UX-CONTRACT.md "vultr-tokyo-fei:/home/fei/Work/Mots/releases/$release/"
ssh vultr-tokyo-fei "python3 /home/fei/Work/Mots/releases/$release/deploy/install.py $release"
python3 deploy/verify.py
```

`prepare.py` 先从 `web/src/` 构建 `web/dist/`、生成 App／公开词库快照并核对数据库，再校验音频、脚本及完整发布清单。VPS 只启用已构建的文件，无须安装前端构建依赖。

上传后先比对全部文件 SHA-256，并校验候选 Nginx／隧道配置，再切换当前版本；随后核对源站首页的 SHA-256 及服务状态。激活失败会恢复上一版链接、配置和服务状态。日常更新沿用现有域名路由；首次安装会建立路由，需修复路由时可为 `install.py` 增加 `--configure-dns`。界面脚本和样式在入口 HTML 中使用内容哈希版本号，避免 CDN／浏览器复用旧版本；源站设置重新验证缓存策略，音频支持 HTTP Range。隧道凭据只保存在 VPS 的 `~/.cloudflared/` 中，没有复制到本地项目。

## 运维

在 VPS 上以 `fei` 执行：

```sh
systemctl --user status mots-web mots-tunnel mots-progress
systemctl --user restart mots-web mots-tunnel mots-progress
journalctl --user -u mots-tunnel -n 50 --no-pager
```

`release-manifest.json` 记录部署内容；公网验证报告保存在 `qa/` 中。`common.py` 集中维护路径、清单格式和 SHA-256 校验，三个命令脚本可以独立运行。

需要回退时，重新执行已保留版本的安装器并传入该目录名；不要删除仍需回退的发布目录。
域名首次创建时，部分系统 DNS 缓存可能暂时保留此前的不存在记录；浏览器及公网 IPv4 已验证可用。

## 进度服务

部署清单同时校验 API 源码、服务单元和 Nginx 配置。激活时先启动 API 并验证回环健康检查，再重载网站；公网验证同时检查 `/api/sync/health`。激活失败恢复旧服务与配置，私人数据库保持不动。协议和限制见 [`../sync/PROTOCOL.md`](../sync/PROTOCOL.md)。

私人数据库需独立备份，不能随发布包、公开资源或 Git 上传。在线备份使用 SQLite backup API 取得一致快照，再将快照存入权限受限的备份位置。回退应用版本不回退或删除这份数据库。配对码可读写整组进度，不应记录在 URL、日志或 QA 截图中。
