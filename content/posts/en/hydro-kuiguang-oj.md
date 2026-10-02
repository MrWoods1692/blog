---
id: hydro-kuiguang-oj
title: Building an OJ for Kuiguang on Hydro
summary: Last year I deployed Hydro for Kuiguang on a NAT machine, ran it for a year. The NAT machine is about to expire, so I forked Hydro and rebuilt the OJ from scratch — Campux OAuth SSO, check-in plugin, Celadon theme, branding, ranking fix. 41 commits, here's what I changed.
date: 2026-10-02
tags:
  - Hydro
  - OJ
  - Open Source
  - TypeScript
  - Campus
readTime: 12 min
---

# Building an OJ for Kuiguang on Hydro

Last year I deployed Hydro for Kuiguang, running on a NAT machine. It's been in use for a year now, and the NAT machine is about to expire. I'd already been wanting to build my own OJ system for a while, so Hydro was the obvious starting point — and I happened to have a few free days this week. So I went for it.

This post is a recap of the whole thing. 41 commits, 84 files changed, ~3800 lines added/removed. Here's roughly what happened.

## So, why Hydro?

Hydro is just a good fit, IMO. Clean code, a solid feature set. When I started last year I tried a few other OJ systems and none of them felt right. The first one I used was the OJ that came with 一本通 (the classic OI textbook). Then I used Luogu. And there was one my programming teacher set up himself — I can't remember what template it used, it had some beautification applied and looked okay, but still felt lacking.

- **Full-stack in one repo** — Koa + Nuxt, not a PHP patchwork where every feature is a duct-tape job. PHP code just reads badly;
- **Plugin-based** — core, UI, judge, and framework are independent packages, so changes in one don't affect others;
- **Well-maintained docs and issues** — when you get stuck, there's a community that answers (though after my changes I can't sync upstream anymore, since I've changed the database and everything);
- **Easy to deploy** — `yarn install` and it runs.

For a project you're picking up fresh, all of this means you don't have to learn some weird framework from scratch. Time saved.

## The overall approach

I didn't just clone Hydro and deploy it. I forked it (though that's literally how it started):

1. **Upstream sync** — kept `origin/master`, but my daily dev branch is also `master` (not main, Hydro upstream uses master);
2. **Feature changes** — one thing per commit, formatted as `area: short description` for easy rollback;
3. **Docs collapsed by OS** — README is now split by Linux/Windows sections, with every deployment gotcha I stepped in written down.

Now the fork is at: **70 commits / 142 files / +3870 / -1538**.

## Changes

Grouped by theme.

### 1. Campux OAuth: single sign-on everywhere

This is the biggest change in the fork. The school has its own unified login system — Campux (an OAuth2 provider) — that handles every campus account. Stock Hydro uses username/password + Gravatar avatars, which doesn't fit at all.

So:

- Killed local password login, OAuth-only mode;
- Map Campux QQ numbers to Hydro uid and nickname;
- Use QQ avatars directly, no more Gravatar;
- Force password setup after first OAuth login (for future password reset);
- Support multiple admin QQs (2671016745, 1692138502, etc.);
- Rebrand the login card with school badge + campus background — but **keep `Powered by Hydro` in the footer**. That's my bottom line: when you use someone else's work, leave a mark.

Key commits:

```
f56ed9a3 core: Campux OAuth-only login with auto registration
5b9e9a45 oauth: map Campux QQ nickname/uid and allow first password set
4e1b797f oauth: use QQ avatar for Campux accounts
e25a357c oauth: allow multiple admin QQs including 2671016745
a908aeda oauth: single registered callback plus cross-host session attach
```

`a908aeda` was the one I struggled with the most: OAuth callbacks returned 400 across hosts because Hydro hardcodes `redirect_uri`. Fixed by **building `redirect_uri` dynamically from the request host**, so both local dev and production domains work.

Of course, the main reason I wired up Campux was also to give the campus wall (Campux) a bit of a push — not enough people were using it.

### 2. Check-in: a Hydro-native plugin

Hydro doesn't have a check-in feature. The school wants daily sign-in so teachers can see at a glance who came and who didn't. Also to spark a bit of interest.

I created a new `checkin` package under `packages/`, going the full Hydro plugin registration route:

- `Service` layer: a `checkin` collection with a unique index on `domainId + uid + day`;
- `Handler` layer: `checkIn`, `listDay`, `listMissed` (for admin attendance);
- `Template` layer: `checkin.html` frontend + `checkin_manage.html` admin attendance table;
- **Navigation registered the native Hydro way** (fixed once in `ea71a5c2`, was getting a service inject error before), finally tucked into the user dropdown (`4917d5f8`) — a top-level nav item takes too much space.

The check-in page also has a calendar view, green in the Celadon theme to match the accent color.

### 3. UI theme: Celadon + Warm White

Hydro's default theme is grey, which doesn't fit a school at all. Two versions:

- **Warm White**: `37af325b`, warmer tones, AC fireworks, and a rest reminder (prompts users to take a break during long coding sessions);
- **Celadon (青瓷)**: `7b93fbd5`, teal-green palette close to the school logo color.

Theme changes live in `packages/ui-default/misc/page-beautify.page.styl`, written in Stylus. Gotcha: dark theme CSS has higher specificity than light blocks, so `html.theme--dark` prefix is required to override light settings — see the comment at `page-beautify.page.styl:351`.

### 4. Ranking fix: top-3 highlight off-by-one

Hydro's ranking top-3 highlight has a bug — it highlights all top 3 in gold, but when color-coding per rank (gold/silver/bronze), index 0 doesn't get colored.

Commit `af394ee4` fixed this: per-rank coloring, index 0 gold, index 1 silver, index 2 bronze, default from index 3. Also swapped the medal icons.

### 5. Branding: school badge + campus art + local avatars

Stock Hydro says "Hydro OJ", uses Gravatar, and shows Hydro's blue-white logo — not at all a school's own OJ.

- `2d9133d0` / `c1beab83`: default site name → 「奎光」;
- `205d41ec`: Campux logo + school favicon;
- `d9e2d629` / `40c2c1ca`: user avatar in top nav, local fallback when Gravatar fails;
- `727986ea`: login card → school badge + campus art;
- `bdbea73d`: branding logic moved from boot to start scripts (avoid service worker cache grabbing stale logos — `7b7ab2e5` fixed this once).

### 6. Deployment: Linux / Windows dual-stack scripts

The deployment scripts in this fork are more detailed than upstream:

```
scripts/start-all.sh       # One-shot: background memory Mongo → wait for config → foreground Hydro
scripts/start-hydro.sh     # Hydro only
scripts/start-mongo.sh     # Memory Mongo only (for dev)
scripts/env.campux         # Campux OAuth keys (chmod 600, not in git)
```

`env.campux` holds the OAuth triple + admin QQ:

```bash
CAMPUX_OAUTH_ENDPOINT=https://kg.campux.top
CAMPUX_OAUTH_CLIENT_ID=...
CAMPUX_OAUTH_CLIENT_SECRET=...
CAMPUX_ADMIN_QQ=1692138502
```

Strongly recommend persistent MongoDB for production; the memory version is for dev only — that's also spelled out in the README.

## Gotchas

A few of the dumbest ones:

1. **OAuth redirect_uri hardcoded → cross-host 400**: fixed in `a908aeda`. Build it dynamically from the request host.
2. **Service Worker cache grabbed stale logos**: `7b7ab2e5`. Hydro's service worker caches static assets, so logo changes must bust the cache. Now branding logic runs in start scripts, not boot — that avoids grabbing stale assets during boot.
3. **Check-in service inject error**: `ea71a5c2`. Initially didn't follow Hydro's native service registration, got an inject error. Fixed by going the native way.
4. **WebAuthn autofill notice in OAuth-only mode**: `257a6a7c`. Disabled it — the "save password" prompt confused users.
5. **Forgot-password link still there in OAuth-only mode**: `a12ffa5c` / `e38c3577`. Removed — users log in via OAuth, not password.

## What it looks like now

Main pages after the rebuild:

- Homepage: Celadon theme + school badge + campus art background
- Login: Campux OAuth SSO, login card with school badge
- Ranking: top-3 gold/silver/bronze per rank
- Check-in: calendar form, admin attendance view
- User profile: QQ avatar + displayName

## Tail

Hydro's mostly refactored. The biggest takeaway from forking: **Hydro's plugin architecture is decent** — check-in, OAuth, and themes all develop independently, no touching core code.

Repo: https://github.com/MrWoods1692/Hydro , issues and PRs welcome.

The UI still isn't all that pretty — I'll keep fiddling with it.

> The `Powered by Hydro` footer line was kept on purpose. Leaving a mark when you use someone else's work is basic courtesy — and I want the same applied when others use my code.
