# Mots VPS 部署

网站：https://mots.feizhang233.com/

服务器：`vultr-tokyo-fei`（`45.76.111.16`），用户 `fei`。


## 部署结构

- 项目：`/home/fei/Work/Mots`
- 当前版本：`current` 符号链接，指向 `releases/` 内已启用的发布目录；旧目录保留用于回退
- 网站：`current/dist`，包含词条、界面和全部音频
- 配套 JSON／Excel：`current/database`，通过 `/database/` 下的具体文件路径访问
- Nginx：`127.0.0.1:8010`，用户服务 `mots-web.service`
- 独立 Cloudflare Tunnel：`mots-tunnel.service`，配置 `~/.cloudflared/config-mots.yml`
- 服务已启用，`fei` 的 linger 已开启，退出 SSH 后继续运行，系统启动时自动启动
- Nginx 错误日志：`logs/error.log`；隧道日志：`journalctl --user -u mots-tunnel`

Cloudflare 提供公网 HTTPS，源站只监听回环地址。部署不需要额外的数据库服务器。
学习进度、自定义词典和设置仍保存在各浏览器；原本本地文件网址下的进度需要从设置下载备份，再到线上站点还原。

## 更新

在本地项目目录执行，版本目录名每次使用新值：

```sh
python3 deploy/prepare.py
release="$(date +%Y%m%d-%H%M%S)"
ssh vultr-tokyo-fei "mkdir -p /home/fei/Work/Mots/releases/$release"
rsync -az dist database deploy src scripts README.md AUDIO.md DESIGN.md UX-CONTRACT.md "vultr-tokyo-fei:/home/fei/Work/Mots/releases/$release/"
ssh vultr-tokyo-fei "python3 /home/fei/Work/Mots/releases/$release/deploy/install.py $release"
python3 deploy/verify.py
```

`prepare.py` 先从 `src/` 构建 `dist/`，再校验音频、脚本及完整发布清单。VPS 只启用已构建的文件，无须安装前端构建依赖。

上传后先比对全部文件 SHA-256，并校验候选 Nginx／隧道配置，再切换当前版本；随后核对源站首页的 SHA-256 及服务状态。激活失败会恢复上一版链接、配置和服务状态。日常更新沿用现有域名路由；首次安装会建立路由，需修复路由时可为 `install.py` 增加 `--configure-dns`。界面脚本和样式在入口 HTML 中使用内容哈希版本号，避免 CDN／浏览器复用旧版本；源站设置重新验证缓存策略，音频支持 HTTP Range。隧道凭据只保存在 VPS 的 `~/.cloudflared/` 中，没有复制到本地项目。

## 运维

在 VPS 上以 `fei` 执行：

```sh
systemctl --user status mots-web mots-tunnel
systemctl --user restart mots-web mots-tunnel
journalctl --user -u mots-tunnel -n 50 --no-pager
```

`release-manifest.json` 记录部署内容；公网验证报告保存在 `qa/` 中。`common.py` 集中维护路径、清单格式和 SHA-256 校验，三个命令脚本可以独立运行。

需要回退时，重新执行已保留版本的安装器并传入该目录名；不要删除仍需回退的发布目录。
域名首次创建时，部分系统 DNS 缓存可能暂时保留此前的不存在记录；浏览器及公网 IPv4 已验证可用。
