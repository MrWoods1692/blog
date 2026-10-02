---
id: hydro-kuiguang-oj
title: 基于 Hydro 给奎光做了一套在线测评平台
summary: 从 GitHub 上 fork 了一份 Hydro，折腾了一周多，把桂林市奎光学校的 Online Judge 从零搭起来。Campux OAuth 单点登录、签到打卡、Celadon 主题、校徽 branding、排行榜修复……一共 41 个 commit，本文讲讲都改了什么、为什么这么改。
date: 2026-10-02
tags:
  - Hydro
  - OJ
  - 开源
  - TypeScript
  - 校园
readTime: 12 分钟
---

# 基于 Hydro 给奎光做了一套OJ

去年给奎光部署了一套Hydro，跑在NAT机上，用了一年，现在NAT机快到期了，然后我本来也有自己做一套OJ系统的想法，就准备拿Hydro来改，这不刚好这几天有空就弄了。

这篇文章就是来复盘一下整个过程。一共 41 个 commit、84 个文件、增删约 3800 行代码，然后把大概经过讲一下。

## 首先，为什么非选 Hydro？

Hydro 的话，我觉得比较好用，代码比较清晰，功能比较齐全丰富，还有去年刚开始弄的时候，试过其他的OJ系统，感觉都不怎么样。我第一次接触的是一本通的在线测评平台，后面用过洛谷，还有我学编程那里老师自己搭建的，忘记用什么模板了开了美化界面还不错，但是还是感觉差点意思。

- **前后端一体**，基于 Koa + Nuxt，不是那种 PHP 拆东墙补西墙的老代码，PHP感觉就很乐；
- **插件化**，核心、UI、judge、框架都是独立 package，改哪儿都不影响别的；
- **文档和 issue 维护得很勤**，遇到问题能在群里问到人（虽然我改了代码之后不能再更新了，因为数据库什么的全改了）；
- **部署简单**，`yarn install` 一把梭就能跑。

对一个新上手的项目，这些都意味着**不需要从零学一套奇怪的框架**——正好省时间。

## 先说整体思路

我不是直接 clone 一个 Hydro 部署上去就完事，而是从 fork 开始（虽然最开始就是）：

1. **上游同步**：保留 `origin/master`，但日常开发分支叫 `master`（不叫 main，Hydro 官方就是用 master）；
2. **功能改造**：按学校需求逐项改，每个 commit 尽量只做一件事，commit message 用 `area: 简短描述` 的格式，方便回滚；
3. **文档折叠**：README 改成按 Linux / Windows 分系统折叠，把部署踩过的坑坑坑全部记下来。

现在这个 fork 的规模大致是：**70 commits / 142 files / +3870 / -1538**。

## 改动

下面按主题讲。

### 1. Campux OAuth：全站单点登录

这是这个 fork 最大的改动。学校有自己的统一登录系统 Campux（一个 OAuth2 提供方），所有校园相关的账号体系都走它。原 Hydro 的登录是账密 + Gravatar 头像，跟学校需求完全对不上。

所以做了这些事：

- 去掉本地密码登录，OAuth-only 模式；
- 从 Campux 拿到的 QQ 号映射到 Hydro 的 uid 和昵称；
- 头像直接用 QQ 头像，本地不再走 Gravatar；
- 第一次 OAuth 登录后强制设置密码（为了后续密码找回）；
- 支持多个管理员 QQ（2671016745、1692138502 等）；
- 登录页 branding 换成校徽 + 校园画背景，但**页脚保留 `Powered by Hydro`**——这是我的底线，用别人的东西要留名。

关键 commit：

```
f56ed9a3 core: Campux OAuth-only login with auto registration
5b9e9a45 oauth: map Campux QQ nickname/uid and allow first password set
4e1b797f oauth: use QQ avatar for Campux accounts
e25a357c oauth: allow multiple admin QQs including 2671016745
a908aeda oauth: single registered callback plus cross-host session attach
```

其中 `a908aeda` 那个是踩了挺久才调好的：跨主机部署时 OAuth callback 会 400，因为 Hydro 默认把 `redirect_uri` 写死了。改成了**从请求 host 动态拼 `redirect_uri`**，这样本地联调和线上域名都能跑。

当然，接校园墙Campux主要原因还是趁机推广一下校园墙，使用的人太少了。

### 2. 签到打卡：Hydro 插件化改造

Hydro 原生没有签到功能。学校想要每天签到打卡，让老师能一眼看出谁来了谁没来。还有激发兴趣。

我在 `packages/` 下新建了一个 `checkin` 包，完全走 Hydro 插件注册的方式：

- `Service` 层：一个 `checkin` collection，按 `domainId + uid + day` 做唯一索引；
- `Handler` 层：`checkIn`、`listDay`、`listMissed`（管理员考勤用）；
- `Template` 层：`checkin.html` 前端页面 + `checkin_manage.html` 管理员考勤表；
- **导航注册用 Hydro 原生方式**（`ea71a5c2` 修过一次，之前 service inject 报错），最终放进用户下拉菜单里（`4917d5f8`），不搞顶部一级菜单——那个太占地方。

这个签到页面还配了个签到日历，Celadon 主题里是绿的，跟主色呼应。

### 3. UI 主题：Celadon（青瓷）+ 暖白

默认 Hydro 的主题是灰色调，跟学校氛围不太搭。折腾了两版：

- **Warm White（暖白）**：37af325b 那版，把主色调拉暖，配上了 AC 烟花和休息提醒（长时间刷题会提醒起来活动一下）；
- **Celadon（青瓷）**：7b93fbd5 那版，青绿色系，跟学校的 logo 颜色接近。

主题改动都在 `packages/ui-default/misc/page-beautify.page.styl`，用 Stylus 写的。有个坑：暗色主题的 CSS 特异性比亮色块高一级，需要用 `html.theme--dark` 前缀才能覆盖，不然亮色设置会失效（`page-beautify.page.styl:351` 那行有注释说明）。

### 4. 排行榜修复：top-3 高亮 off-by-one

Hydro 原版的排行榜 top-3 高亮有个 bug——它把前 3 名一起高亮成金色，但按 rank 分别着色（金/银/铜）时，index 0 反而没上色。

`af394ee4` 这个 commit 修了这个问题：按 rank 分别着色，index 0 金色、index 1 银色、index 2 铜色，从 index 3 开始恢复默认色。顺手把 medal 图标换了。

### 5. Branding：校徽 + 校园画 + 本地 avatar

默认 Hydro 的站名是「Hydro OJ」，头像走 Gravatar，登录卡片是 Hydro 的蓝白 logo——完全不像一个学校自己的 OJ。

- `2d9133d0` / `c1beab83`：默认站名改成「奎光」；
- `205d41ec`：换 Campux 官方 logo 和学校 favicon；
- `d9e2d629` / `40c2c1ca`：用户头像在顶部导航显示，Gravatar 失败时走本地 fallback；
- `727986ea`：登录卡片换成奎光校徽 + 校园画背景；
- `bdbea73d`：branding 脚本从 boot 里剥离，改成 `start-*` 启动脚本里应用（避免 boot 阶段跑脚本导致 service worker cache 拿到旧 logo，`7b7ab2e5` 修过一次）。

### 6. 部署：Linux / Windows 双栈脚本

这个 fork 部署脚本写得比上游细：

```
scripts/start-all.sh       # 一键：后台内存 Mongo → 等 config → 前台 Hydro
scripts/start-hydro.sh     # 只跑 Hydro
scripts/start-mongo.sh     # 只跑内存 Mongo（联调用）
scripts/env.campux         # Campux OAuth 密钥（chmod 600，不进 git）
```

`env.campux` 里是 OAuth 三件套 + 管理员 QQ：

```bash
CAMPUX_OAUTH_ENDPOINT=https://kg.campux.top
CAMPUX_OAUTH_CLIENT_ID=...
CAMPUX_OAUTH_CLIENT_SECRET=...
CAMPUX_ADMIN_QQ=1692138502
```

生产环境强烈建议换持久化 MongoDB，内存版只适合联调——这点在 README 里也写清楚了。

## 坑坑坑

挑几个最傻逼的：

1. **OAuth redirect_uri 写死导致跨主机 400**：`a908aeda` 修的。改成从请求 host 动态拼，本地联调和线上域名都能用。
2. **Service Worker cache 拿到旧 logo**：`7b7ab2e5`。Hydro 的 service worker 会缓存静态资源，换 logo 后必须清缓存。现在 branding 逻辑从 boot 挪到了启动脚本里，避免 boot 阶段跑脚本时拿到旧资源。
3. **checkin service inject 报错**：`ea71a5c2`。最初没走 Hydro 原生的 service 注册流程，注入时报错。改成原生注册方式后就好了。
4. **webauthn 自动填充提示在 OAuth-only 模式下乱弹**：`257a6a7c`。关掉这个提示，不然用户看到「保存密码」的弹窗会很困惑。
5. **忘记密码流程在 OAuth-only 模式下还有链接**：`a12ffa5c` / `e38c3577`。删掉了，反正用户走 OAuth 也不用密码登录。

## 现在的样子

跑起来后的主要页面：

- 首页：Celadon 主题 + 校徽 + 校园画背景
- 登录：Campux OAuth 单点登录，登录卡片换成校徽
- 排行榜：top-3 金/银/铜分别着色
- 签到：日历形式，管理员能看考勤
- 用户详情：显示 QQ 头像、displayName

## 尾巴

Hydro改造得差不多了 。整个 fork 下来最大的感受是：**Hydro 的插件化设计做得好，一般**，签到、OAuth、theme 都能独立开发，不用动核心代码。

仓库地址：https://github.com/MrWoods1692/Hydro ，欢迎来提 issue 或者 pr。

目前界面还是不太好看，我还会再改改的。


> 页脚那句 `Powered by Hydro` 我特意保留了。用别人的东西留名是基本礼仪。因为我也希望别人用我的代码要保留我的名字。
