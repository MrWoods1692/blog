---
id: dswebagent-free-one-api
title: 把 DeepSeek 网页版接进 free-one-api
summary: DS_WebAgent 是一个 Rust 桥梁，用真实浏览器操作 chat.deepseek.com，对外暴露 OpenAI 兼容接口；再给 free-one-api 写一个转发适配器，就能把「网页版 DeepSeek」当成一个普通渠道用。本文讲这套组合的架构、工具调用是怎么转的，以及踩过的坑。
date: 2026-10-11
tags:
  - DS_WebAgent
  - free-one-api
  - Rust
  - DeepSeek
  - 浏览器自动化
readTime: 12 分钟
---

# 把 DeepSeek 网页版接进 free-one-api

前阵子搞完 free-one-api 的适配器，顺手把「网页版 DeepSeek」也接了进去——毕竟网页版免费、还带联网搜索和深度思考，能当普通渠道用的话，本地跑点东西就完全不用买 API 额度了。

这篇文章讲两个东西：

1. DS_WebAgent：一个 Rust 写的本地桥梁，驱动真实浏览器操作 chat.deepseek.com，对外暴露 OpenAI 兼容的 /v1/chat/completions；
2. free-one-api 转发适配器 ds-webagent/deepseek-web，把上面那个桥梁当成一个渠道接进 free-one-api。

---

## 一、为什么用浏览器，而不是逆向接口

网上确实有直接逆向 DeepSeek 私有接口的库，但我一开始就没打算走那条路：

- 逆向接口会随前端改版随时挂掉，得一直追着改；
- 逆向往往要处理验证码、风控、指纹，很折腾；
- 我本来就有个一直开着的机器，多跑一个浏览器窗口不算成本。

所以 DS_WebAgent 的做法很「笨」也很稳：开一个真实、有头的浏览器，老老实实操作页面。你手动登录一次，之后它就在这个会话里发消息、等流式结束、把回复抠出来。

它不逆向任何私有接口、不绕过验证码/风控/Cloudflare、不伪造指纹、不隐藏 WebDriver 特征——就是个自动化用户。

---

## 二、DS_WebAgent 的结构

整体是一层套一层的 trait，每层都能单独换：


HTTP(axum) ── AgentLoop ── ConversationAdapter ── BrowserAdapter(chromiumoxide) ── 真实浏览器
     │            │              │
     │            ├─ PromptBuilder(强提示词 + JSON 协议)
     │            ├─ json_parser(代码块 / 大括号截取)
     │            └─ ToolRegistry(白名单 / 超时 / 参数校验)
     └─ Store(SQLite + JSONL,使用量统计)


- BrowserAdapter 是 trait，哪天想换 headless_chrome 只改 src/browser/；
- ChatBackend 是 trait，测试时塞个 mock 实现就行。

### 关键设计：把网页对话「伪装」成 API

DeepSeek 网页版不是 API，没有 messages、没有 tools。桥梁的做法是：

1. 每次新建对话，注入一次强提示词，告诉模型「你是一个工具调用代理，只输出 JSON」；
2. 解析模型返回的 JSON（可能包在代码块里，也可能直接是大括号），决定这是 tool_call 还是 final；
3. tool_call 就把结果回填到同一个对话里，继续下一轮，直到 final；
4. 上下文快满的时候，让它自己总结一遍，再开新对话、重新注入强提示词 + 摘要。

强提示词只在首条消息注入一次，不会每轮都塞——不然 token 全烧在提示词上了。

### 三个模型变体

网页上有「联网搜索」和「深度思考」两个开关，组合起来就是三个模型 ID：

| model id | 联网搜索 | 深度思考 |
|---|---|---|
| ds-web-search | ✅ | ❌ |
| ds-web-think | ❌ | ✅ |
| ds-web-search-think | ✅ | ✅ |

调用时传哪个，桥梁就去点网页上对应的开关。传别的模型名直接 404 model_not_found，不静默换模型。

### 配置与选择器

所有页面 DOM 选择器都集中在 config.toml 的 [selectors] 里。DeepSeek 改版导致找不到元素时，只改配置、不改代码。还支持 text=按钮文字 这种按可见文本匹配的写法，比死抠 CSS 路径抗改版。

---

## 三、工具调用：客户端执行，桥梁只转发

这是我觉得设计得最舒服的一块。

请求里的 tools 由调用方定义、调用方执行，不需要在本地注册：

1. 模型决定调工具时，返回 finish_reason: "tool_calls" 和 message.tool_calls（content 为 null），桥梁不会自己执行；
2. 客户端执行完工具，把 {"role":"tool","tool_call_id":"...","content":"..."} 追加到 messages 再请求一次；
3. 模型基于工具结果继续，最终返回 finish_reason: "stop" 和 content。

多轮需要的上下文全部来自客户端的 messages，所以客户端不需要维护会话 id。工具名可以是任意名字，本地注册表只用来给 GET /v1/tools 看一眼。

说白了，桥梁只负责「把网页对话包装成 OpenAI 的请求/响应形状」，工具那一层完全是 OpenAI 的标准玩法。

---

## 四、再接进 free-one-api

DS_WebAgent 自己就能当 API 用，但我想让它出现在 free-one-api 的渠道列表里，跟其他渠道一起负载均衡、一起统计。

free-one-api 是个 Python（Quart + SQLite）项目，把各种「逆向 LLM 网页后端」聚合成一个 OpenAI 兼容入口。加一个后端 = 写一个适配器类 + 两处注册 + 建一条渠道。

我写的是 free_one_api/impls/adapter/ds_web_agent.py，类名 DSWebAgentAdapter，渠道名 ds-webagent/deepseek-web。

### 适配器做了什么

它本质上是个 HTTP 转发层：

- test()：GET 一下 DS_WebAgent 的 /health，ready 就返回可用；
- query()：把请求转成 DS_WebAgent 的 payload POST 过去；
- 拿到响应后，如果有 tool_calls，就转成内部的 FunctionCall 并把 finish_reason 置成 tool_calls；
- 否则返回 STOP + 正文。

配置四个字段，改完立即生效不用重启：

json
{
  "base_url": "http://ds-webagent:9178",
  "api_token": "local-dev-token",
  "default_model": "ds-web-search",
  "timeout_secs": 900
}


api_token 必须和 DS_WebAgent 的 [server].api_token 一致，否则 401。timeout_secs 默认给了 900 秒——网页对话本来就慢，别设太短。

### 一键起两个容器

仓库里带了一个 docker-compose.dswebagent.yaml，把两边拼一起：

bash
docker compose -f docker-compose.dswebagent.yaml up -d --build


启动后三步走：

1. 打开 http://localhost:16080/vnc.html ，在容器里的 Chromium 中手动登录 DeepSeek（登录态持久化在 ./ds_webagent-data/browser-profile，之后重启不用再登）；
2. 打开 http://localhost:3000/ 进 free-one-api 管理页；
3. 「添加渠道」→ 适配器选 ds-webagent/deepseek-web → 保存 → 点测试。

端口映射：3000 free-one-api、19178→9178 DS_WebAgent API、16080→6080 noVNC 可视化桌面。

---

## 五、踩过的坑

### 1. 适配器的 __init__ 不能写成 def init

free-one-api 框架是自己调用 init(config, eval) 的，不是 Python 的构造函数。我一开始把 __init__ 写成了 def init，代码能跑、能导入，但 config 根本没存下来——每个渠道设置都被静默忽略。这个 bug 特别阴，因为完全不报错。

同理，实体类（request.py / response.py）里同样的手误会静默丢掉新字段。

### 2. 改完 .py 要重启，光 docker cp 没用

Python 会把模块缓存在 sys.modules 里，docker cp 进去新文件、进程不重启，还是跑旧代码。正确姿势是 docker cp → docker restart <container> → 再打接口。

### 3. 别把运行时状态提交进去

ds_webagent-data/ 里是 Chromium 的 profile——带着活的 DeepSeek 会话 cookie，还有 dswa.db 和日志；data/ 里是渠道和密钥数据库。这些都得进 .gitignore，提交前 git diff --cached --name-only 看一遍。

### 4. 推上游得走 SSH

https 的 origin 在这台机器上没法非交互认证（没有 credential helper），git push 会卡在「could not read Username」。改成 git remote set-url origin git@github.com:<owner>/<repo>.git 之后一直走 SSH 就行。

---

## 六、现在能干什么

搭好之后，这套组合可以：

- 用任意 OpenAI 兼容客户端（编辑器、CLI、Agent 框架）调用「网页版 DeepSeek」，且能选搜索/思考组合；
- 让模型调用工具、由客户端执行、再把结果喂回去，多轮跑完；
- 在 free-one-api 里跟别的渠道一起做负载均衡、心跳检测、用量统计；
- 在 /v1/stats 看到「相对官方 API 省了多少钱」——虽然省的是本来就不花的钱。

DS_WebAgent 的合规底线一直没变：只走正常 UI、低频串行（一次请求独占浏览器）、仅本地个人使用。

代码在 fork 里：https://github.com/MrWoods1692/free-one-api ，桥接源码在同仓库的 ds_web_agent/ 目录，适配器在 free_one_api/impls/adapter/ds_web_agent.py。

> 用别人的东西留名是基本礼仪——free-one-api 是 RockChinQ 的项目，我只加了适配器和文档。
