---
id: botroost-llbot-provider
title: 给 OneBot 集群加上 LLBot
summary: Botroost 是一个 OneBot 协议端集群控制台，原来只有 NapCat 一个运行时。这次把 LLBot 做成独立的 provider：自己拉容器、自己读写它的 ob11 配置、自己从容器日志里解析流量，登录则交给 LLBot 自己的 WebUI。
date: 2026-10-11
tags:
  - Botroost
  - LLBot
  - OneBot
  - 集群
  - TypeScript
readTime: 12 分钟
---

# 给 OneBot 集群加上 LLBot

Botroost 是我在写的一个 OneBot 协议端集群控制台：一台控制面，管一堆 Linux 节点上的协议端，负责把「我想要的状态」对齐到「实际跑着的容器」。之前它只支持 NapCat 一个运行时，这次把 LLBot 也接了进来。

这篇文章讲的是接入过程——不是「怎么用 LLBot」，而是「怎么把一个完全不同的协议端塞进同一套模型里，还不把控制台写成一堆 if-else」。

---

## 一、先说 Botroost 的模型

它刻意不做一个「容器面板」，而是把概念拆开：


Workspace
├── Members / roles / 每个协议端的告警订阅
├── Agent node（跑 agent 的机器）
│   └── Protocol endpoint（受管资源）
│       ├── Runtime driver（比如 NapCat、LLBot）
│       ├── 被托管的容器 / 进程
│       ├── QQ 账号身份
│       ├── OneBot 11 协议服务
│       ├── WebSocket 客户端 / 服务端
│       └── 操作与审计事件
└── 统一活动历史（变更 + 审计）


几个关键点：

- Runtime driver 不是协议本身。napcat 只是「把期望状态变成容器」的那一层，llbot 也一样。协议端是 OneBot 服务，驱动是驱动。
- 健康状态分五层，不揉成一个徽章：节点心跳、容器、驱动探测、协议服务、期望状态是否收敛。
- WebSocket 配置单独展示——因为「配置了」和「对端连上了」根本不是一回事。

这个拆分就是这次能顺利接 LLBot 的前提：只要新驱动的输出能填进这五层，控制台和 UI 基本不用动。

---

## 二、为什么是 LLBot

NapCat 靠改配置文件定 OneBot 行为，LLBot 不一样——它有个正经 WebUI，很多配置是你在界面上点出来的，而且只有 QQ 登录之后才会生成 config_<qq>.json。

所以接 LLBot 不是「换一个镜像名」，而是要在同一套控制台里同时容纳两种工作方式：

- NapCat 那种：控制台写配置 → 重启 → 生效；
- LLBot 这种：控制台管容器和配置，但首次登录必须人去 WebUI 扫码，配置得等登录后文件出现了才能写。

这件事想清楚之后，剩下的都是实现细节。

---

## 三、Provider 包：先声明能力，再谈实现

新增了 packages/provider-llbot，跟 provider-napcat、provider-snowluma 平级。它只做三件事：声明能力、描述配置形状、提供脱敏。

```ts
export const llbotManifest: ProviderCapabilityManifest = {
  id: asProviderId("llbot"),
  displayName: "LLBot",
  capabilities: ["configure", "observe"],
  credentialTransport: "provider-api",
  runtimeRequirements: [
    "llbot-license-accepted",
    "verified-artifact-policy",
    "isolated-network",
    "ephemeral-storage",
  ],
};
```



注意 llbotAvailability.available 是 false——这不是漏写。LLBot 有自己的授权机制和产物校验要求，所以在这些前置条件满足之前，provider 会明确说自己不可用，而不是偷偷跑起来一个不受控的容器。

配置和凭据也是分开的：

```ts
// 普通配置：只允许容器内部明文 HTTP
export const LLBotConfigurationSchema = z.strictObject({
  endpointUrl: z.string().url().startsWith("http://"),
});

// 凭据单独一个 schema，走 credentialEnvelope
export const LLBotCredentialsSchema = z.strictObject({
  accessToken: z.string().min(1),
});


z.strictObject 意味着多传一个字段就直接抛错——我不希望配置里悄悄混进一个 accessToken。凭据走 provider-sdk 的 credentialEnvelope，只有框架自己包过的信封才认，裸对象会被 invalid credential envelope 挡掉。
```


脱敏是递归的：redactSecrets 会按 key 名（token/secret/password/api_key…）整枝砍掉，字符串里的 URL 会把 user:pass 和敏感 query 参数一并抹掉。所以控制台里能安全地展示配置摘要，不会把 token 漏回浏览器。

---

## 四、Runtime 驱动：容器的生命周期

真正干活的是 apps/agent/src/llbot-runtime.ts，它是一个独立文件，刻意不从 ./index.js 引入运行时值（只留 type-only import），免得跟 NapCat / SnowLuma 的代码路径互相污染。

### 镜像固定到 digest

```ts
export const LLBOT_IMAGE =
  "linyuchen/llbot@sha256:6f10ce9c8848cc6a1157b4bda878d7485e25602b719448f3907de87f1bd30014";
export const LLBOT_ARTIFACT =
  "artifact:llbot:linyuchen.llbot.sha256.6f10ce9c...";
```



每条命令执行前都会 assertAllowed：镜像字符串必须完全等于上面这个 digest 地址，而且命令里的 approvedArtifactId 也得对上。用 latest 是不可能的。

### 归属校验，不是「名字对了就行」

容器必须同时满足三个标签才被认为是这个端点的：

```ts
container.labels["botroost.workspace_id"] === command.workspaceId &&
container.labels["botroost.endpoint_id"] === command.endpointId &&
container.labels["botroost.provider"] === "llbot"
```



对不上就报 LLBot container is not owned by this endpoint，绝不接管一个来路不明的同名容器。

### Generation fence

this.commands 里存着每个端点最近一次命令。新命令的 generation 比已记录的更旧，直接 runtime generation fence rejected。多个 worker 并发下发时，旧命令不会覆盖新状态。

### 端口用端点 ID 派生

并行跑多个端点时，最容易撞的就是 WebUI 端口。这里用端点 ID 前四位算一个固定偏移：

```ts
export function llbotLoginPorts(endpointId: string) {
  const offset = Number.parseInt(endpointId.slice(0, 4), 16) % 400;
  return { webuiPort: 3080 + offset };
}
```



同一个端点每次算出来一样，不同端点大概率错开。不完美，但比随机端口好排查得多。

### 资源下限

```ts
export function llbotResourceLimits(requested) {
  const cpuMillis = Math.max(1000, requested.cpuMillis);
  const memoryMiB = Math.max(1024, requested.memoryMiB);
  return { cpuMillis, memoryMiB, memorySwapMiB: memoryMiB + 512 };
}
```



低于 1 核 / 1G 的请求会被抬上来——LLBot 这种基于 NTQQ 的东西给太少内存会直接起不来，报错还很难看懂。

另外还有个细节：refresh-login-qr 这个动作对 LLBot 明确不支持：

```ts
throw new Error("action is not supported for LLBot endpoints; complete login through the LLBot WebUI");


NapCat 那边扫码是在控制台里出的，LLBot 的登录就是它自己的 WebUI，控制台不越权去模拟。

---
```


## 五、把两种配置模型对齐

这是我觉得最费脑子的一块。

控制台的 OneBot 编辑器是按 NapCat 的字段形状渲染的（websocketClients / websocketServers），但 LLBot 的原生配置长这样：

```json
{
  "ob11": {
    "enable": true,
    "connect": [
      { "type": "ws-reverse", "enable": true, "url": "ws://astrbot:6199/ws", "token": "" },
      { "type": "ws", "enable": true, "host": "0.0.0.0", "port": 3001 }
    ]
  }
}
```



所以驱动里做了一层映射，把编辑器模型翻译成 LLBot 的 ob11.connect：

- 控制台的「客户端」→ type: "ws-reverse"（LLBot 主动连出去，方向正确）；
- 控制台的「服务端」→ type: "ws"（LLBot 监听）；
- type: "http" / "http-post" 的条目原样透传，不碰。

### Token 不回显，但要保留

编辑器从来不把 token 回显给浏览器——只给一个布尔：

```ts
tokenConfigured: typeof entry.token === "string" && entry.token.length > 0,
```



那写回的时候怎么办？按位置继承：第 N 个客户端条目如果没有新 token，就沿用上一次同位置条目的 token。这样界面上什么都不用输，旧 token 也不会被空字符串抹掉。

### 写完必须重启

LLBot 只在启动时读协议配置，所以写文件之后要 docker restart。这不会丢登录态——登录会话持久化在 /app/llbot/data 下面（就是我之前踩过的 qq-session-<uin>.json 那套）。

### 配置文件的时机

findOneBotConfig 在端点数据目录里找 config_<qq>.json，找不到就报：


```text
LLBot OneBot configuration appears after QQ login; complete the login in the WebUI first
```



这不是错误处理写得啰嗦，而是这个运行时的真实形状：没登录就没有配置文件。控制台如实说出来，比写一个空文件假装成功要好。

---

## 六、观测：两个来源，一个界面

### OneBot HTTP 探测

容器起来后，agent 直接打 LLBot 的 OneBot HTTP 接口（容器内的 3000 端口）：

- get_status、get_login_info、get_version_info——判断在线；
- 在线后继续 get_friend_list、get_group_list（各自带 probe 的耗时与错误）。

列表超过 500 条会截断并标记 truncated，不把整个好友列表塞进心跳。

这里有个必须写清楚的语义：LLBot 的 OneBot HTTP 服务是登录之后才开始监听的。所以「容器 running 但 HTTP 打不通」不等于故障，等于「还在等 WebUI 登录」。代码里就是按这个判断的：

```ts
// LLBot only starts its OneBot HTTP server after QQ logs in, so an unreachable
// provider while the container runs means "waiting for the WebUI login".
return { runtime: "ready", provider: "available", protocol: "disconnected",
         convergence: "reconciling", metadata: { loginGuide: { webuiPort } } };
```



顺手把 WebUI 端口放进 loginGuide，控制台就能提示「去这个端口扫码」。

### 流量：从容器日志里数

控制台要显示 OneBot 的收发速率和连接事件，但 LLBot 没有 Prometheus 之类的接口，所以只能读容器日志。

LLBot 的日志长这样（带 ANSI 颜色）：[收-群]、[发-群]，连接事件是 onebot11-adapter WebSocket 事件上报 ws://... 和 正向 WebSocket 服务已启动。解析器先把颜色码剥掉，再按正则归类：

```ts
export function parseLLBotTrafficLine(line: string) {
  const inbound = message.includes("[收-") || message.includes("收到");
  const outbound = message.includes("[发-") || message.includes("发送");
  // ...
}
```



聚合器（NapCatTrafficAccumulator，这次复用并扩了 LLBot 的两个解析器）按 10 秒一个桶保留最近 6 个桶，给出 1 分钟 / 5 分钟窗口、最近 40 条事件和最近 40 条连接事件。

两条边界很重要：

- 隐私口径是 aggregate_only——只保留方向、范围（群/私聊）、字节数，不存消息内容。
- 截断了要承认。日志量太大时最多读 5000 行 / 4MB，此时返回 status: "partial" 并附带说明「显示的是下界」——比悄悄少算一半数字强。

日志返回前还会过一遍脱敏，把 token=...、Authorization:、Cookie: 之类的值替换成 [REDACTED]。容器日志是最容易漏东西的地方。

---

## 七、踩过的坑

1. 「容器在跑」和「协议可用」是两件事。LLBot 登录前 OneBot 端口根本不监听，第一版把它当成 provider: unavailable 了，界面上看就是一直报错。正确的表达是「运行时就绪、等待登录、协议断开、正在收敛」。
2. ANSI 颜色会毁掉所有字符串匹配。LLBot 的日志带色，不剥掉的话 [收- 这种前缀匹配会莫名其妙失败。
3. 配置写入必须重启容器，但重启不能丢登录。第一次做的时候担心重启要重扫码，翻了半天才确认登录态在 /app/llbot/data 里持久化——只要卷挂对，重启是安全的。
4. token 回显是个陷阱。编辑器拿不到 token（也不该拿到），如果写回时直接用编辑器传来的空字符串，就会把已有 token 清空。按位置继承解决。
5. z.strictObject 比 object 省事。配置和凭据混在一起时，严格模式会立刻报错，而不是让一个 accessToken 悄悄躺在普通配置里被写进数据库。

---

## 八、现在的样子

LLBot 端点在控制台里的能力：

- 创建 / 启动 / 停止 / 重启 / 强制重启 / 删除，容器带归属标签和 generation 校验；
- 确定性的 WebUI 端口，界面直接给出扫码入口；
- OneBot WebSocket 客户端 / 服务端在线编辑，写入 LLBot 原生 ob11.connect，token 只进不出；
- 五层健康 + 好友/群列表 + 收发流量与连接事件；
- 受限、脱敏的容器日志拉取；
- 所有操作进审计，支持离线 / 恢复告警订阅。

代码在 https://github.com/idoknow/botroost ，LLBot 相关的是这几个位置：packages/provider-llbot（能力声明）、apps/agent/src/llbot-runtime.ts（运行时驱动）、apps/agent/src/traffic.ts（日志解析）。

---

## 尾巴

接第二个运行时的价值不在「多支持一个软件」，而在于验证模型是不是真的能容纳差异。NapCat 和 LLBot 的登录方式、配置时机、观测接口都不一样，但落到「节点 / 容器 / 驱动 / 协议 / 收敛」这五层里，控制面几乎没改。

下次再接第三个，应该就只是写一个 provider 包加一个 runtime 文件的事了。
