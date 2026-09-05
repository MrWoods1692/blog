---
id: campux-plugin-system
title: Campux 插件系统设计与实现
summary: 详细介绍 Campux 校园墙项目的插件系统架构，涵盖事件总线、权限声明、生命周期管理等核心设计思路，以及如何用 TypeScript 从零构建一个可扩展的插件框架。
date: 2026-09-05
tags:
  - Campux
  - TypeScript
  - 插件系统
  - 架构设计
readTime: 10 分钟
---

# Campux 插件系统设计与实现

Campux 是一个校园墙项目，随着功能不断增长，核心系统和业务功能之间的耦合越来越严重。为了解决这个问题，我设计并实现了一套插件系统，今天来分享一下整个系统的设计思路和关键实现。

---

## 为什么要做插件系统？

在没有插件系统的早期，Campux 的所有功能——Markdown 渲染、多彩投稿、匿名头像——全部硬编码在核心服务里。每加一个功能，就要改核心代码；想禁用某个功能，也只能改配置或删代码。

插件系统要解决的核心问题是：

1. **解耦** — 功能模块和核心服务互不依赖，各自独立开发
2. **可控** — 管理员可以在运行时启用/禁用任意功能
3. **安全** — 插件必须声明自己需要什么权限，未知权限直接拒绝
4. **可观测** — 所有操作都有审计日志，出了问题能追溯

---

## 架构概览

整个插件系统由三个核心组件构成：

```
┌─────────────────────────────────────────────┐
│              PluginRegistry                  │
│  (注册、校验、生命周期管理、状态管理)         │
├─────────────────────────────────────────────┤
│              EventBus                        │
│  (发布/订阅、请求/响应、审计日志)             │
├─────────────────────────────────────────────┤
│           CampuxPlugin                       │
│  (插件定义、权限声明、生命周期钩子)           │
└─────────────────────────────────────────────┘
```

运行时流程：

```
register() → initAll() → [注册路由] → readyAll() → [服务运行] → closeAll()
              ↓                         ↓                        ↓
          onInit()                   onReady()               onClose()
```

---

## 核心设计：事件总线

事件总线（EventBus）是插件间通信的中枢。它基于发布/订阅模式，但比普通的 EventEmitter 多了几个关键特性：

### 1. 精确匹配 + 通配符

```typescript
// 精确订阅某个事件
ctx.events.on("post:created", (event) => { ... });

// 通配符订阅所有事件（用于日志、调试）
ctx.events.on("*", (event) => { ... });
```

这个设计借鉴了 Node.js 的 EventEmitter，但增加了一个「内部审计事件拦截」的机制——`_audit:entry` 类型的事件不会分发给普通监听器，而是直接写入审计日志。这是一个很有用的技巧：通过在事件分发层拦截特定事件类型，把「事件流」和「审计流」分离，审计日志不会被普通监听器消费，也不会污染事件日志。

### 2. 异步发布

```typescript
// 同步发布（fire-and-forget）
bus.emit(event);

// 异步发布（等待所有 handler 完成）
await bus.emitAsync(event);
```

`emitAsync` 用 `Promise.all` 等待所有 handler 执行完毕，适用于需要确保所有插件都处理完事件的场景。每个 handler 被 `Promise.resolve()` 包装，即使同步函数也能统一处理。

### 3. 插件间请求/响应

这是比较有意思的设计——除了单向的事件发布，还支持插件之间的双向通信：

```typescript
// 插件 A：注册处理器
ctx.events.onRequest("hello:greet", (req) => {
  return {
    requestId: req.requestId,
    source: "my-plugin",
    success: true,
    data: { message: "Hello!" },
  };
});

// 插件 B：发起请求
const response = await ctx.events.request({
  requestId: crypto.randomUUID(),
  source: "caller-plugin",
  action: "hello:greet",
  payload: { name: "Campux" },
});
```

实现上用了 `Promise.race` 做超时竞速——所有 handler 同时执行，取第一个成功响应返回。如果超时先触发，直接返回超时错误。这个模式在微服务通信中很常见（类似 gRPC 的 deadline），我把它搬到了进程内的插件通信中。

### 4. 内存环形缓冲区

事件日志和审计日志都用固定大小的数组实现环形缓冲区：

```typescript
const MAX_EVENT_LOG = 200;
const MAX_AUDIT_LOG = 500;

function recordEvent(event: PluginEvent): void {
  eventLog.push({ timestamp: Date.now(), event });
  if (eventLog.length > MAX_EVENT_LOG) {
    eventLog.splice(0, eventLog.length - MAX_EVENT_LOG);
  }
}
```

用 `splice(0, n)` 从头部删除超出的记录。这个实现简单直接，对于插件系统的审计量级完全够用（不需要 RingBuffer 那种 O(1) 的复杂度）。性能上的考量是：审计日志写入频率远低于读取频率（只有管理员查看时才读），所以写入时的 O(n) splice 不是瓶颈。

---

## 权限系统

每个插件在注册时必须声明需要的权限：

```typescript
permissions: {
  required: ["db:read", "db:write", "events:emit"],
  riskLevel: "high",
  rationale: "需要读写数据库以存储插件状态",
}
```

权限分为三级：

| 等级 | 权限 | 说明 |
|------|------|------|
| 低 | `config:read`, `events:emit`, `events:listen` | 只读或轻量操作 |
| 中 | `db:read`, `tenant:data`, `queue:worker` | 涉及数据读取 |
| 高 | `db:write`, `http:route`, `user:data` | 涉及数据写入和用户数据 |

注册时的校验逻辑：

1. 未知权限 → 直接抛错，拒绝注册
2. 高风险权限 → 记录警告日志，但仍允许注册（不是阻塞，是通知）

这个设计的取舍是：安全性通过「声明 + 审计」而非「沙箱隔离」实现。Campux 的插件是进程内的，运行在同一个 Node.js 进程里，所以无法做到真正的隔离。但通过审计日志和运行时状态管理（可随时禁用），管理员有足够的控制能力。

---

## 生命周期管理

插件通过三个钩子参与服务生命周期：

```typescript
const myPlugin: CampuxPlugin = {
  name: "my-plugin",
  version: "1.0.0",
  hooks: {
    // 路由注册前：初始化资源、订阅事件
    onInit(ctx) {
      ctx.events.on("post:created", handlePostCreated);
    },
    // 路由就绪后：发布就绪事件、启动后台任务
    onReady(ctx) {
      ctx.events.emit({ type: "my-plugin:ready" });
    },
    // 服务关闭时：清理资源
    onClose(ctx) {
      ctx.logger.info("插件已关闭");
    },
  },
};
```

关键设计决策：

- `onInit` 失败 → 中断服务启动（初始化失败说明环境有问题）
- `onReady` 失败 → 不中断其他插件（单个插件就绪失败不应该影响整个服务）
- 禁用的插件 → 跳过 `initAll` 和 `readyAll`（通过 `enabledByDefault` 或管理员手动禁用）

---

## 预设插件 vs 运行时插件

Campux 有两种插件形式：

**预设插件**（Preset Plugin）— 内置的租户级功能，配置存储在 `tenant_metadata.plugin_config` 中。不需要 `CampuxPlugin` 实例，但状态管理复用同一套 API。例如 Markdown 渲染、多彩投稿、字体选择、匿名头像、Bot 多彩消息。

**运行时插件**（Registry Plugin）— 通过 `registry.register()` 注册的完整插件，有完整的生命周期钩子。例如审核通知插件。

两者在管理面板统一展示，管理员通过同一个 PATCH 接口切换启用/禁用状态。

---

## 审计日志

所有插件操作自动记录审计日志，合并两类来源：

```typescript
// 1. 运行时审计（注册表记录）
type: "plugin:registered" | "plugin:status_changed" | "plugin:permission_check" | ...

// 2. 配置变更审计（数据库记录）
action: "tenant.plugin.markdownRender.enable"
```

管理面板通过合并接口将两者按时间排序展示，便于管理员追溯任意插件的完整操作历史。

---

## 写插件的几个实用技巧

### 1. 用 `context` 而非全局变量

插件通过 `PluginContext` 访问所有运行时资源：

```typescript
interface PluginContext {
  app: FastifyInstance;
  config: CampuxConfig;
  db: PrismaClientType;
  events: EventBus;
  logger: PluginLogger;
  queue: PluginQueue;
}
```

不要用全局变量，因为多租户场景下同一个插件可能需要在不同上下文中运行。

### 2. 错误隔离

事件 handler 里的异常不应该中断其他 handler：

```typescript
for (const handler of handlers) {
  try {
    handler(event);
  } catch (err) {
    console.error(`handler error:`, err);
  }
}
```

每个 handler 独立 try-catch，一个插件崩了不影响其他插件。

### 3. 取消订阅要干净

`on()` 返回取消订阅函数，`onRequest()` 也是。在 `onClose` 里清理所有订阅，避免内存泄漏：

```typescript
onInit(ctx) {
  const unsub = ctx.events.on("post:created", handler);
  // 存起来，onClose 里调用 unsub()
}
```

---

## 总结

Campux 的插件系统不算复杂，但覆盖了核心需求：权限声明、生命周期、事件通信、审计日志。它不是微内核架构，更像是「带有插件约定的服务端框架」——所有插件运行在同一个进程里，通过共享的事件总线通信。

这个设计的适用场景是：功能模块需要解耦，但不需要进程级隔离。对于校园墙这种中小型项目，这套方案在开发效率和架构灵活性之间找到了一个合适的平衡点。

源码在 [Campux GitHub 仓库](https://github.com/MrWoods1692/Campux) 的 `packages/plugin/` 目录下。
