---
id: campux-plugin-system
title: Designing a Plugin System for Campux
summary: A deep dive into the plugin system architecture for Campux, a campus wall project. Covers event bus design, permission declarations, lifecycle management, and key TypeScript implementation patterns.
date: 2026-09-05
tags:
  - Campux
  - TypeScript
  - Plugin System
  - Architecture
readTime: 10 min
---

# Designing a Plugin System for Campux

Campux is a campus wall project. As features kept growing, the coupling between core services and business logic became painful. To fix this, I designed and implemented a plugin system. This post covers the architecture, key design decisions, and interesting implementation patterns.

---

## Why a Plugin System?

Before the plugin system, all features—Markdown rendering, color themes, anonymous avatars—were hardcoded into the core service. Adding a feature meant modifying core code. Disabling one meant either config changes or deleting code.

The plugin system needed to solve four problems:

1. **Decoupling** — Features and core services develop independently
2. **Controllability** — Admins enable/disable features at runtime
3. **Security** — Plugins must declare required permissions; unknown permissions are rejected
4. **Observability** — All operations are audit-logged for traceability

---

## Architecture Overview

Three core components:

```
┌─────────────────────────────────────────────┐
│              PluginRegistry                  │
│  (Registration, validation, lifecycle, state)│
├─────────────────────────────────────────────┤
│              EventBus                        │
│  (Pub/sub, request/response, audit log)      │
├─────────────────────────────────────────────┤
│           CampuxPlugin                       │
│  (Plugin definition, permissions, hooks)     │
└─────────────────────────────────────────────┘
```

Runtime flow:

```
register() → initAll() → [register routes] → readyAll() → [running] → closeAll()
              ↓                              ↓                         ↓
          onInit()                        onReady()                onClose()
```

---

## Core Design: The Event Bus

The EventBus is the communication hub between plugins. Built on a pub/sub pattern, but with several key additions beyond a standard EventEmitter.

### 1. Exact Match + Wildcards

```typescript
// Subscribe to a specific event
ctx.events.on("post:created", (event) => { ... });

// Wildcard: subscribe to all events (for logging, debugging)
ctx.events.on("*", (event) => { ... });
```

A useful trick here: the `_audit:entry` event type is intercepted at the dispatch layer and never reaches normal listeners. It goes directly to the audit log. This separates the event stream from the audit stream—audit entries don't pollute the event log, and normal listeners can't accidentally consume audit data.

### 2. Async Emission

```typescript
// Fire-and-forget
bus.emit(event);

// Wait for all handlers to complete
await bus.emitAsync(event);
```

`emitAsync` uses `Promise.all` to wait for every handler. Each handler is wrapped with `Promise.resolve()` so both sync and async handlers are handled uniformly.

### 3. Inter-Plugin Request/Response

This is the most interesting part. Beyond one-way events, plugins can communicate bidirectionally:

```typescript
// Plugin A: register a handler
ctx.events.onRequest("hello:greet", (req) => {
  return {
    requestId: req.requestId,
    source: "my-plugin",
    success: true,
    data: { message: "Hello!" },
  };
});

// Plugin B: send a request
const response = await ctx.events.request({
  requestId: crypto.randomUUID(),
  source: "caller-plugin",
  action: "hello:greet",
  payload: { name: "Campux" },
});
```

Implementation uses `Promise.race` for timeout contention—all handlers execute concurrently, and the first successful response wins. If the timeout fires first, a timeout error is returned immediately. This pattern is common in microservice communication (similar to gRPC deadlines), adapted here for in-process plugin communication.

### 4. Ring Buffer with splice

Event and audit logs use fixed-size arrays as ring buffers:

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

Simple `splice(0, n)` from the head. For a plugin system's audit volume, this is perfectly adequate—the O(n) splice on write is fine because writes are infrequent relative to reads (admins check logs occasionally, not continuously).

---

## Permission System

Every plugin declares required permissions at registration:

```typescript
permissions: {
  required: ["db:read", "db:write", "events:emit"],
  riskLevel: "high",
  rationale: "Needs read/write access for plugin state storage",
}
```

Three risk levels:

| Level | Permissions | Purpose |
|-------|-------------|---------|
| Low | `config:read`, `events:emit`, `events:listen` | Read-only or lightweight |
| Medium | `db:read`, `tenant:data`, `queue:worker` | Data access |
| High | `db:write`, `http:route`, `user:data` | Data mutation, user data |

Registration validation:

1. Unknown permission → throw, reject registration
2. High-risk permission → log warning, still allow registration

The trade-off: security is enforced through declaration + audit, not sandbox isolation. Plugins run in the same Node.js process, so true isolation isn't feasible. But with audit logs and runtime state management (instant disable capability), admins have sufficient control.

---

## Lifecycle Management

Three hooks for the service lifecycle:

```typescript
const myPlugin: CampuxPlugin = {
  name: "my-plugin",
  version: "1.0.0",
  hooks: {
    // Before route registration: init resources, subscribe to events
    onInit(ctx) {
      ctx.events.on("post:created", handlePostCreated);
    },
    // After routes ready: emit ready event, start background tasks
    onReady(ctx) {
      ctx.events.emit({ type: "my-plugin:ready" });
    },
    // On shutdown: cleanup
    onClose(ctx) {
      ctx.logger.info("Plugin closed");
    },
  },
};
```

Key decisions:

- `onInit` failure → abort startup (initialization failure means environment issues)
- `onReady` failure → don't abort other plugins (one plugin's readiness shouldn't break the whole service)
- Disabled plugins → skip `initAll` and `readyAll`

---

## Preset Plugins vs Runtime Plugins

Campux has two plugin forms:

**Preset Plugins** — Built-in tenant-level features stored in `tenant_metadata.plugin_config`. No `CampuxPlugin` instance needed, but state management reuses the same API. Examples: Markdown rendering, color themes, font selection, anonymous avatars, bot stylish messages.

**Runtime Plugins** — Registered via `registry.register()` with full lifecycle hooks. Example: review notification plugin.

Both appear unified in the admin panel, controlled through the same PATCH endpoint.

---

## Audit Log

All plugin operations are automatically audit-logged, merging two sources:

```typescript
// 1. Runtime audit (registry-recorded)
type: "plugin:registered" | "plugin:status_changed" | "plugin:permission_check" | ...

// 2. Config change audit (database-recorded)
action: "tenant.plugin.markdownRender.enable"
```

The admin panel merges both by timestamp, giving a complete operation history per plugin.

---

## Practical Tips for Writing Plugins

### 1. Use context, not globals

Access all runtime resources through `PluginContext`:

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

No global variables—multi-tenant scenarios may require different contexts.

### 2. Error isolation

Handler exceptions should not break other handlers:

```typescript
for (const handler of handlers) {
  try {
    handler(event);
  } catch (err) {
    console.error(`handler error:`, err);
  }
}
```

Each handler gets its own try-catch.

### 3. Clean unsubscribe

`on()` and `onRequest()` both return unsubscribe functions. Clean up in `onClose` to avoid memory leaks:

```typescript
onInit(ctx) {
  const unsub = ctx.events.on("post:created", handler);
  // Store it, call unsub() in onClose
}
```

---

## Summary

Campux's plugin system isn't overly complex, but it covers the essentials: permission declarations, lifecycle hooks, event communication, and audit logging. It's not a microkernel—it's more of a "plugin-convention server framework" where all plugins run in one process and communicate through a shared event bus.

This design works well when you need feature decoupling without process-level isolation. For a mid-sized project like a campus wall, it strikes a good balance between development efficiency and architectural flexibility.

Source code is in the `packages/plugin/` directory of the [Campux GitHub repository](https://github.com/MrWoods1692/Campux).
