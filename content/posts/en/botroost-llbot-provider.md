---
id: botroost-llbot-provider
title: Adding LLBot to an OneBot Cluster
summary: Botroost is an OneBot protocol endpoint cluster console that only knew NapCat. Adding LLBot as an independent provider meant its own container lifecycle, reading and writing LLBot's native ob11 config, and parsing traffic out of container logs — while QQ login stays in LLBot's own WebUI.
date: 2026-10-11
tags:
  - Botroost
  - LLBot
  - OneBot
  - Cluster
  - TypeScript
readTime: 12 min
---

# Adding LLBot to an OneBot Cluster

Botroost is an OneBot protocol endpoint cluster console I have been building: one control plane for protocol endpoints spread across Linux agent nodes, responsible for reconciling the state I want onto the containers actually running. It only knew one runtime, NapCat. This time I wired in LLBot.

This post is about the integration — not how to use LLBot, but how to fit a completely different protocol endpoint into the same model without turning the console into a pile of if-else.

---

## 1. The Botroost model first

It deliberately is not a container dashboard; it splits the concepts apart:

```text
Workspace
```

├── Members / roles / per-endpoint alert subscriptions
├── Agent node (the machine running the agent)
│   └── Protocol endpoint (the managed resource)
│       ├── Runtime driver (for example, NapCat, LLBot)
│       ├── Managed container / process
│       ├── QQ account identity
│       ├── OneBot 11 protocol service
│       ├── WebSocket clients and servers
│       └── Operations and audit events
└── Unified activity history (changes + audit)


Key points:

- A runtime driver is not the protocol itself. napcat is just the layer that turns desired state into a container; llbot is the same.
- Health is five independent layers, not one badge: node heartbeat, container, driver probe, protocol service, and whether desired state converged.
- WebSocket config is shown separately — configured and peer connected are not the same thing.

That split is the precondition for this integration: as long as a new driver fills those five layers, the control plane and UI barely change.

---

## 2. Why LLBot

NapCat defines OneBot behaviour by editing config files. LLBot is different — it has a real WebUI, plenty of its config is clicked in the UI, and config_<qq>.json only appears after a QQ login.

So adding LLBot is not swap the image name; the same console has to accommodate two working styles:

- NapCat style: the console writes config, restart, takes effect.
- LLBot style: the console manages the container and the config, but the first login must be a human scanning a QR in the WebUI, and config can only be written once login has created the file.

Once that is clear, the rest is implementation detail.

---

## 3. The provider package: declare capabilities first

I added packages/provider-llbot, a sibling of provider-napcat and provider-snowluma. It does three things only: declare capabilities, describe the config shape, and provide redaction.

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


llbotAvailability.available is false on purpose: LLBot has its own authorization mechanism and artifact verification requirements, so until those preconditions are met the provider says it is unavailable instead of quietly bringing up an uncontrolled container.
```


Config and credentials are separate:

```ts
// Ordinary config: plain HTTP inside its own container only
export const LLBotConfigurationSchema = z.strictObject({
  endpointUrl: z.string().url().startsWith("http://"),
});

// Credentials get their own schema and go through credentialEnvelope
export const LLBotCredentialsSchema = z.strictObject({
  accessToken: z.string().min(1),
});


z.strictObject means one extra field throws immediately — I do not want an accessToken quietly mixed into ordinary config. Credentials go through provider-sdk credentialEnvelope; a bare object is rejected with invalid credential envelope.

Redaction is recursive: redactSecrets kills whole branches by key name (token / secret / password / api_key), and URL strings have user:pass and sensitive query parameters stripped. The console can show a config summary without leaking a token back to the browser.

---
```


## 4. The runtime driver: a container's lifecycle

The real work is apps/agent/src/llbot-runtime.ts, a standalone file that deliberately imports no runtime values from ./index.js (type-only imports are erased), so it cannot contaminate the NapCat / SnowLuma code paths.

### The image is pinned to a digest

```ts
export const LLBOT_IMAGE =
  "linyuchen/llbot@sha256:6f10ce9c8848cc6a1157b4bda878d7485e25602b719448f3907de87f1bd30014";
export const LLBOT_ARTIFACT =
  "artifact:llbot:linyuchen.llbot.sha256:6f10ce9c...";


Every command runs assertAllowed first: the image string must equal that digest exactly, and the command's approvedArtifactId has to match. latest is simply not an option.
```


### Ownership is checked, not assumed from the name

A container counts as this endpoint's only if three labels all match:

```ts
container.labels["botroost.workspace_id"] === command.workspaceId &&
container.labels["botroost.endpoint_id"] === command.endpointId &&
container.labels["botroost.provider"] === "llbot"


Otherwise it throws LLBot container is not owned by this endpoint — it will never adopt a same-named container of unknown origin.
```


### Generation fence

this.commands holds each endpoint's most recent command. A new command whose generation is older than the recorded one gets runtime generation fence rejected. With multiple workers dispatching in parallel, a stale command cannot overwrite a newer state.

### Ports derived from the endpoint id

Running several endpoints in parallel, the thing that collides first is the WebUI port. This derives a deterministic offset from the first four characters of the endpoint id:

```ts
export function llbotLoginPorts(endpointId: string) {
  const offset = Number.parseInt(endpointId.slice(0, 4), 16) % 400;
  return { webuiPort: 3080 + offset };
}


Same endpoint always computes the same port; different endpoints mostly miss each other. Not perfect, but far easier to debug than random ports.
```


### Resource floors

```ts
export function llbotResourceLimits(requested) {
  const cpuMillis = Math.max(1000, requested.cpuMillis);
  const memoryMiB = Math.max(1024, requested.memoryMiB);
  return { cpuMillis, memoryMiB, memorySwapMiB: memoryMiB + 512 };
}


Anything below 1 core / 1G gets raised — NTQQ-based software will simply fail to start with too little memory, and the error is unreadable.
```


One more detail: the refresh-login-qr action is explicitly unsupported for LLBot:

```ts
throw new Error("action is not supported for LLBot endpoints; complete login through the LLBot WebUI");


On the NapCat side the QR appears in the console; LLBot's login is its own WebUI, and the console does not overstep by emulating it.

---
```


## 5. Aligning the two config models

This was the most brain-bending part.

The console's OneBot editor renders NapCat-shaped fields (websocketClients / websocketServers), but LLBot's native config looks like this:

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



So the driver adds a mapping layer that translates the editor model into LLBot's ob11.connect:

- The console's clients become type: "ws-reverse" (LLBot connects out — the correct direction);
- The console's servers become type: "ws" (LLBot listens);
- Entries of type "http" / "http-post" are passed through untouched.

### Tokens are never echoed, but must be preserved

The editor never shows a token back to the browser — only a boolean:

```ts
tokenConfigured: typeof entry.token === "string" && entry.token.length > 0,


So what happens on write-back? Positional inheritance: if the Nth client entry carries no new token, it reuses the token from the previous entry in the same position. Nothing has to be typed in the UI, and an existing token never gets wiped by an empty string.
```


### A restart is required after writing

LLBot reads its protocol config at startup, so after writing the file you must docker restart. This does not lose the login — the session persists under /app/llbot/data (the qq-session-<uin>.json setup I stepped in before).

### Timing of the config file

findOneBotConfig looks for config_<qq>.json in the endpoint data directory; if it is not there it reports:


```text
LLBot OneBot configuration appears after QQ login; complete the login in the WebUI first
```



That is not sloppy error handling — it is the real shape of this runtime: no login, no config file. The console saying so honestly is better than writing an empty file and pretending it succeeded.

---

## 6. Observation: two sources, one UI

### OneBot HTTP probes

Once the container is up, the agent talks to LLBot's OneBot HTTP interface directly (container port 3000):

- get_status, get_login_info, get_version_info — determine online state;
- once online, get_friend_list and get_group_list (each carrying its own probe duration and error).

Lists over 500 entries are truncated and flagged truncated — a whole friends list never gets stuffed into a heartbeat.

There is a semantic that has to be spelled out: LLBot's OneBot HTTP service only starts listening after login. So container running but HTTP unreachable does not mean failure — it means still waiting for WebUI login. The code decides exactly that:

```ts
// LLBot only starts its OneBot HTTP server after QQ logs in, so an unreachable
// provider while the container runs means "waiting for the WebUI login".
return { runtime: "ready", provider: "available", protocol: "disconnected",
         convergence: "reconciling", metadata: { loginGuide: { webuiPort } } };


The WebUI port rides along in loginGuide, so the console can tell you which port to scan the QR on.
```


### Traffic: counted from container logs

The console wants to show OneBot's send/receive rates and connection events, but LLBot has no Prometheus-style interface, so it reads container logs.

LLBot's logs look like this (with ANSI colour): [收-群] / [发-群], and connection events are onebot11-adapter WebSocket 事件上报 ws://... plus 正向 WebSocket 服务已启动. The parser strips colour codes first, then classifies by regex:

```ts
export function parseLLBotTrafficLine(line: string) {
  const inbound = message.includes("[收-") || message.includes("收到");
  const outbound = message.includes("[发-") || message.includes("发送");
  // ...
}


The accumulator (NapCatTrafficAccumulator, reused here with the two LLBot parsers) keeps six 10-second buckets, and reports 1-minute / 5-minute windows, the last 40 events and the last 40 connection events.
```


Two boundaries matter:

- The privacy stance is aggregate_only — only direction, scope (group/private) and byte count, never message content.
- Truncation is admitted. When log volume is huge it reads at most 5000 lines / 4MB, then returns status: "partial" with a note that the displayed rates are lower bounds — better than quietly undercounting.

Logs also pass through redaction before being returned, replacing values after token=, Authorization:, Cookie: with [REDACTED]. Container logs are the easiest place to leak something.

---

## 7. Gotchas

1. Container running and protocol available are two different things. Before LLBot login, the OneBot port is not listening at all; my first version marked it provider: unavailable, so the UI just showed a permanent error. The correct expression is runtime ready, waiting for login, protocol disconnected, reconciling.
2. ANSI colour breaks every string match. LLBot's logs are coloured; without stripping, prefix matches like [收- fail mysteriously.
3. Config writes need a container restart, but a restart must not lose the login. I spent a while confirming the session persists under /app/llbot/data — as long as the volume is mounted correctly, restarting is safe.
4. Token echo is a trap. The editor cannot see the token (and should not), so writing back the empty string it sends would erase an existing token. Positional inheritance fixes it.
5. z.strictObject is worth the trouble. With config and credentials mixed together, strict mode fails immediately instead of letting an accessToken quietly sit in ordinary config and get written to the database.

---

## 8. What it looks like now

An LLBot endpoint in the console can:

- create / start / stop / restart / force-restart / delete, with ownership labels and generation checks on the container;
- expose a deterministic WebUI port and a direct QR login entry point;
- edit OneBot WebSocket clients and servers online, writing LLBot's native ob11.connect, with tokens write-only;
- show five-layer health plus friends/groups lists plus send/receive traffic and connection events;
- pull bounded, redacted container logs;
- audit every operation and support offline / recovery alert subscriptions.

The code is at https://github.com/idoknow/botroost — the LLBot parts are packages/provider-llbot (capability declaration), apps/agent/src/llbot-runtime.ts (runtime driver), and apps/agent/src/traffic.ts (log parsing).

---

## Tail

The value of adding a second runtime is not "one more piece of software supported" — it is proving the model actually tolerates difference. NapCat and LLBot differ in login method, config timing and observation interface, yet inside the five layers of node / container / driver / protocol / convergence, the control plane barely changed.

The next one should only cost a provider package and a runtime file.
