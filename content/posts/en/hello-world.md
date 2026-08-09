---
id: hello-world
title: Hello World
summary: Welcome to Woods'Blog. This is my first blog post, introducing the features, tech stack, and design philosophy of this blog.
date: 2026-08-09
tags:
  - Getting Started
  - Essay
  - Introduction
category: Essay
readTime: 5 min
---

# Hello World

Welcome to **Woods' Blog**! 🎉

This is my very first post on this blog. The original idea behind creating it is simple—**to record** and **to share**. Here, I'll post technical articles, life reflections, and some daily musings (no pure fluff, though—for that, go check out my QQ Zone).

---

## Why Blog?

Ah, that's a question worth pondering. For me, blogging serves several purposes:

1. **Knowledge consolidation** — Writing down what I learn deepens my understanding and makes it easier to revisit later, even though we all use AI assistants nowadays.
2. **Helping others** — Maybe my experience can save someone else from the same pitfalls.
3. **Sharpening communication** — Writing is an extension of thinking; you can't write clearly unless you think clearly. Also, my Chinese composition skills are pretty weak, so this is good practice.
4. **Leaving a trace** — Words on the internet are proof that you existed.

---

## What's on This Blog?

### 📝 Articles

Technical posts and casual essays covering programming, tools, study notes, and more. Every article supports Markdown rendering, including code blocks, tables, blockquotes, links, and other formatting.

### 💬 Statuses

Short, daily updates similar to QQ Zone posts, supporting both text and images. When I don't feel like writing a full article, I'll just drop a quick note about my current mood here.

### 🔍 Search

Real‑time search across article titles, content, and tags, so you can quickly find what interests you.

### 🏷️ Tags & Archives

Articles are categorized by tags and also archived by year, making it easy to browse past content.

### 💬 Comments

A comment system powered by GitHub Issues (via Utterances). No backend service needed—since this project is fully frontend, I didn't want to pay for a server.

### 🌙 Dark Mode

Supports light/dark theme switching, following your system preference or manual toggle, to protect your eyes.

### 🌐 Multi‑language

Supports both Chinese and English, with content maintained in sync.

---

## Tech Stack

This blog is built entirely with frontend technologies and is a purely static site:

| Technology | Purpose |
|------------|---------|
| [Nuxt 3](https://nuxt.com/) | Universal framework with SSR and static generation support |
| [Vue 3](https://vuejs.org/) | Reactive UI framework |
| [Tailwind CSS](https://tailwindcss.com/) | Utility‑first CSS for rapid UI development |
| [Markdown-it](https://github.com/markdown-it/markdown-it) | Markdown parsing and rendering |
| [Utterances](https://utteranc.es/) | Comment system based on GitHub Issues |
| [Cloudflare Pages](https://pages.cloudflare.com/) | Static site hosting and deployment |

### Architecture Highlights

- **Fully static** — All content is stored as Markdown files and compiled into static HTML at build time. No database required.
- **SSG (Static Site Generation)** — Uses Nuxt 3's `nuxt generate` to produce static files for easy deployment.
- **Responsive design** — Built with Tailwind CSS, works well on both desktop and mobile.
- **Internationalization** — Chinese and English content are stored separately and loaded at runtime based on language preference.

---

## Open Source

This blog is open source, with the code hosted on GitHub. If you're curious about the implementation details, feel free to browse the source code or submit an issue. Repository: [GitHub](https://github.com/MrWoods1692/blog).

---

*Thanks for reading—I look forward to connecting with you!*
