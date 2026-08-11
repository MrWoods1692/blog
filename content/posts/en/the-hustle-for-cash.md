---
id: the-hustle-for-cash
title: The Hustle for Cash
summary: 
date: 2026-08-11
tags:
  - NewAPI
  - Token
  - AI
readTime: 10 min
---

## Background

> The last couple of days, I’ve been itching to figure out how to make some money. Now that I’ve graduated, I’ve got plenty of time to tinker. So I hopped on Telegram and brainstormed with KD about what to sell.

---

## 1. The VPN Reselling Idea

At first, I thought about buying a subscription from [Kitty](https://kitty.fo), then using [SubBoost](https://github.com/SubBoost/subboost) to relay and redistribute the subscription, stripping out upstream ads and injecting my own.

**The catch:**  
SubBoost doesn’t support traffic quotas, max concurrent connections, expiration dates, or a user management system. So relaying would be a pain to distribute, manage, and maintain.

**Kitty pricing:**  
It’s pretty cheap—they have 5TB/month and 10TB/month plans, no device limit, fast speeds, and lots of regions. Perfect for relaying.  
And if you’re just using it for yourself, I’d recommend it too. Check out the price:  
![Kitty pricing](https://cloudflarecnimg.scdn.io/i/6a7aaba55c43d_1786424229.webp)

> Referral link: [Click here](https://kitty.fo/register?invite=2ATYY6QL)

---

## 2. Pivot to Selling Tokens (AI API Relay)

Decided VPN reselling wasn’t lucrative enough and too much hassle, so I switched to selling tokens—relaying other people’s AI APIs.  
I borrowed 84 RMB from my classmate cky and bought a promotional VPS from Xiaotu Interconnect. Specs:

![Server specs](https://cloudflarecnimg.scdn.io/i/6a7aacb5c9d07_1786424501.webp)

- Term: 180 days  
- Renewal: 336 RMB/year  
- Lightly loaded for now, performance is overkill  
  ![Status screenshot](https://cloudflarecnimg.scdn.io/i/6a7aae7b6c4f3_1786424955.webp)

This provider runs promos often. If you’re interested, you can sign up here: [Click here](https://moebun.com/aff/QUPXEVNU)

---

## 3. Setting Up NewAPI

I spent a night configuring NewAPI. **Big gripe:** so many things can’t be batched. For example, you can’t bulk-set prices—I grabbed a bunch of free models from NVIDIA and had to manually set each one to 0. Also, the redemption codes: I forgot to adjust the exchange rate upfront, and when I had to delete all the codes, I had to do it one by one. Clicked forever.

**Upstream setup:**  
Total of 5 upstreams:

- 1 official (relying on high cache hit rates from heavy traffic to undercut and earn thin margins)
- 4 other relays aggregated from various sources

![Channel screenshot](https://cloudflarecnimg.scdn.io/i/6a7aadb6a2cb2_1786424758.webp)  
You can see official responds the fastest.

> If you want to try it out, you can register via my invite: [Click to register](https://ai.mrcwoods.com/sign-up?aff=keS3)  
> You get 0.5 RMB credit on sign-up, enough to test the models.

---

## 4. Model List

Mostly free edge/on‑device models; high‑end models are scarce because I can’t find cheap upstreams for them.  
Here’s a look at the premium model pricing:

![Model screenshot 1](https://cloudflarecnimg.scdn.io/i/6a7aaeca31efb_1786425034.webp)  
![Model screenshot 2](https://cloudflarecnimg.scdn.io/i/6a7aaee6ad256_1786425062.webp)

For the full list and prices, check it out yourself: [Open pricing page](https://ai.mrcwoods.com/pricing)

---

## 5. Monetization

At this point, it feels hard to break even on the initial investment.  
I’m selling via Xianyu (Chinese second‑hand platform) with auto‑delivery of redemption codes that users can apply themselves.

**Hosting saga:**

- First tried hosting with [zhinianboke](https://xy.zhinianboke.com/), but found out that sold items wouldn’t auto‑relist.
- Since I don’t have a “Fish Shop” (Xianyu seller account), I asked KD to host it for me. And just like that, the payment system was cobbled together.

> Anyway, it’s all makeshift—just winging it step by step.

---

*The above is just a record of my personal tinkering—for reference only, not investment or purchase advice.*