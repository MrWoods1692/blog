---
id: dswebagent-free-one-api
title: Wiring the DeepSeek Web UI into free-one-api
summary: DS_WebAgent is a Rust bridge that drives a real browser against chat.deepseek.com and exposes an OpenAI-compatible API; a forwarding adapter then turns the DeepSeek web UI into just another channel in free-one-api. This post covers the architecture, how tool calls get relayed, and the gotchas.
date: 2026-10-11
tags:
  - DS_WebAgent
  - free-one-api
  - Rust
  - DeepSeek
  - Browser Automation
readTime: 12 min
---

# Wiring the DeepSeek Web UI into free-one-api

After finishing the adapter work on free-one-api, I went ahead and plugged in the DeepSeek web UI too. The web version is free, comes with web search and deep thinking, and if it can behave like an ordinary channel, running things locally costs nothing in API credits at all.

This post covers two pieces:

1. DS_WebAgent — a local Rust bridge that drives a real browser against chat.deepseek.com and exposes an OpenAI-compatible /v1/chat/completions;
2. The free-one-api forwarding adapter ds-webagent/deepseek-web, which treats that bridge as just another channel.

---

## 1. Why a browser instead of a reverse-engineered API

There are libraries that reverse-engineer DeepSeek private endpoints, but I never intended to go down that road:

- Reverse-engineered endpoints break whenever the frontend changes, so you are stuck chasing it forever;
- They usually involve captchas, rate limiting, and fingerprinting — a lot of pain;
- I already have a machine running 24/7, so an extra browser window costs nothing.

So DS_WebAgent takes the dumb but robust route: it opens a real, headed browser and just operates the page. You log in manually once, and from then on it sends messages in that session, waits for streaming to finish, and extracts the reply.

It does not call any private DeepSeek endpoint, does not bypass captchas, rate limits or Cloudflare, does not fake browser fingerprints, and does not hide WebDriver markers — it is simply an automated user.

---

## 2. The structure of DS_WebAgent

It is a stack of traits, each layer independently replaceable:


HTTP(axum) ── AgentLoop ── ConversationAdapter ── BrowserAdapter(chromiumoxide) ── real browser
     │            │              │
     │            ├─ PromptBuilder (strong prompt + JSON protocol)
     │            ├─ json_parser (code block / brace extraction)
     │            └─ ToolRegistry (whitelist / timeout / arg validation)
     └─ Store (SQLite + JSONL, usage stats)


- BrowserAdapter is a trait — swapping in headless_chrome only touches src/browser/;
- ChatBackend is a trait — tests just inject a mock implementation.

### The key design: disguising a web conversation as an API

The DeepSeek web UI is not an API. There are no messages, no tools. The bridge approach:

1. On every new conversation, inject a strong prompt once, telling the model it is a tool-calling agent and must output JSON only;
2. Parse the JSON it returns (possibly wrapped in a code block, possibly bare braces) and decide whether it is a tool_call or final;
3. For a tool_call, append the result into the same conversation and continue to the next round, until final;
4. When context is nearly full, have it summarize, then start a new conversation and re-inject the strong prompt plus the summary.

The strong prompt is injected once in the first message of a conversation — it is not repeated every round, or all the tokens would burn on the prompt itself.

### Three model variants

The web UI has two toggles, web search and deep thinking; their combinations give three model IDs:

| model id | web search | deep thinking |
|---|---|---|
| ds-web-search | ✅ | ❌ |
| ds-web-think | ❌ | ✅ |
| ds-web-search-think | ✅ | ✅ |

Whichever you pass, the bridge clicks the corresponding toggles on the page. Any other model name returns 404 model_not_found — it never silently substitutes a model.

### Configuration and selectors

Every page DOM selector lives in [selectors] in config.toml. When a DeepSeek redesign breaks element lookup, you change config, not code. It also supports the text=button text form, matching by visible text, which survives redesigns better than hardcoded CSS paths.

---

## 3. Tool calls: the client executes, the bridge just relays

This is the part I am happiest with.

The tools in a request are declared and executed by the caller — nothing needs to be registered locally:

1. When the model decides to call a tool, it returns finish_reason: "tool_calls" and message.tool_calls (content is null); the bridge does not execute it;
2. The client executes the tool, appends {"role":"tool","tool_call_id":"...","content":"..."} to messages, and requests again;
3. The model continues from the tool result and finally returns finish_reason: "stop" with content.

All the context needed for multi-round is carried in the client messages, so clients do not need to track a session id. Tool names can be anything; the local registry exists only so GET /v1/tools has something to list.

In other words, the bridge only wraps a web conversation into OpenAI request/response shape — the tool layer is plain standard OpenAI.

---

## 4. Plugging it into free-one-api

DS_WebAgent already works as an API on its own, but I wanted it to appear in the free-one-api channel list, sharing load balancing and stats with the other channels.

free-one-api is a Python project (Quart + SQLite) that aggregates various reverse-engineered LLM web backends behind one OpenAI-compatible endpoint. Adding a backend = one adapter class + two registrations + one channel row.

Mine is free_one_api/impls/adapter/ds_web_agent.py, class DSWebAgentAdapter, channel name ds-webagent/deepseek-web.

### What the adapter does

It is essentially an HTTP forwarding layer:

- test(): GETs DS_WebAgent /health; ready means usable;
- query(): converts the request into DS_WebAgent payload and POSTs it;
- On the response, if there are tool_calls, it converts them to the internal FunctionCall and sets finish_reason to tool_calls;
- Otherwise returns STOP plus the text.

Four config fields, effective immediately after editing, no restart:

json
{
  "base_url": "http://ds-webagent:9178",
  "api_token": "local-dev-token",
  "default_model": "ds-web-search",
  "timeout_secs": 900
}


api_token must match DS_WebAgent [server].api_token, or you get a 401. timeout_secs defaults to 900 seconds — web conversations are slow, do not set it too low.

### One command, two containers

The repo ships docker-compose.dswebagent.yaml, wiring both sides together:

bash
docker compose -f docker-compose.dswebagent.yaml up -d --build


Then three steps:

1. Open http://localhost:16080/vnc.html and log into DeepSeek manually in the container Chromium (the session persists in ./ds_webagent-data/browser-profile, so restarts do not need a re-login);
2. Open http://localhost:3000/ for the free-one-api admin page;
3. Add channel → adapter ds-webagent/deepseek-web → save → test.

Port map: 3000 free-one-api, 19178→9178 DS_WebAgent API, 16080→6080 noVNC desktop.

---

## 5. Gotchas

### 1. The adapter __init__ must not be written as def init

The free-one-api framework calls init(config, eval) itself — it is not Python constructor. I first wrote __init__ as def init; the code ran and imported fine, but config was never stored — every channel setting was silently ignored. That bug is nasty precisely because nothing errors.

The same slip in the entity classes (request.py / response.py) silently drops new fields.

### 2. Editing a .py needs a restart, docker cp alone does not work

Python caches modules in sys.modules; copying a new file in without restarting the process means the old code still runs. The correct move is docker cp → docker restart <container> → hit the endpoint again.

### 3. Do not commit runtime state

ds_webagent-data/ is a Chromium profile — with live DeepSeek session cookies — plus dswa.db and logs; data/ is the channels and keys database. All of it belongs in .gitignore; run git diff --cached --name-only before committing.

### 4. Pushing upstream means SSH

An https origin cannot authenticate non-interactively on this machine (no credential helper), so git push hangs on could not read Username. Switching to git remote set-url origin git@github.com:<owner>/<repo>.git once keeps it on SSH from then on.

---

## 6. What it can do now

Once it is set up, this combo lets you:

- Call DeepSeek web from any OpenAI-compatible client (editor, CLI, agent framework), with search/thinking combinations selectable;
- Let the model call tools, have the client execute them, feed results back, and run multi-round;
- Load-balance and health-check alongside other channels in free-one-api, with usage stats;
- See how much was saved versus the official API at /v1/stats — though it is money that was never being spent anyway.

DS_WebAgent compliance line has not changed: normal UI only, low-frequency serial (one request owns the browser at a time), local personal use only.

The code is in the fork: https://github.com/MrWoods1692/free-one-api — the bridge source lives in the same repo under ds_web_agent/, and the adapter is free_one_api/impls/adapter/ds_web_agent.py.

> Leaving a mark when you use someone else work is basic courtesy — free-one-api is RockChinQ project; I only added the adapter and docs.
