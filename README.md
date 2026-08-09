# 极简博客

一个基于 Nuxt 3 构建的极简静态博客。

## 功能特性

- 📝 **文章管理** — Markdown 格式编写，自动渲染
- 🔍 **搜索** — 实时搜索文章标题、内容和标签
- 🏷️ **标签系统** — 按标签分类浏览文章
- 📅 **归档** — 按年份查看文章
- 🧭 **导航** — 响应式导航栏，支持移动端
- 💾 **项目展示** — 开源项目展示页面
- 💬 **说说** — 简短的日常记录
- 🔽 **筛选** — 按分类、标签、年份筛选文章
- 📄 **Markdown 渲染** — 支持代码高亮、表格、引用等
- 💬 **评论** — 基于 GitHub Issues (Utterances)
- 👍 **点赞** — 使用 Utterances 点赞功能
- 🔗 **分享** — 支持分享到 Twitter、微博，复制链接
- 🌙 **暗色模式** — 支持亮色/暗色主题切换

## 技术栈

- [Nuxt 3](https://nuxt.com/) — Vue 3 通用框架
- [Vue 3](https://vuejs.org/) — 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) — 原子化 CSS 框架
- [Markdown-it](https://github.com/markdown-it/markdown-it) — Markdown 解析器
- [Utterances](https://utteranc.es/) — 基于 GitHub Issues 的评论系统

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 静态生成

```bash
npm run generate
```

## 项目结构

```
blog/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # 全局样式
│   ├── components/
│   │   ├── Comments.vue          # 评论组件
│   │   ├── Footer.vue            # 页脚
│   │   ├── Header.vue            # 导航栏
│   │   ├── NavLink.vue           # 导航链接
│   │   ├── PostCard.vue          # 文章卡片
│   │   ├── SearchModal.vue       # 搜索弹窗
│   │   └── ShareButton.vue       # 分享按钮
│   ├── composables/
│   │   ├── useData.ts            # 数据管理
│   │   ├── useDark.ts            # 暗色模式
│   │   └── useMarkdown.ts        # Markdown 渲染
│   ├── layouts/
│   │   ├── default.vue           # 默认布局
│   │   └── post.vue              # 文章布局
│   └── pages/
│       ├── about.vue             # 关于页面
│       ├── archive.vue           # 归档页面
│       ├── index.vue             # 首页
│       ├── moments.vue           # 说说页面
│       ├── projects.vue          # 项目页面
│       ├── posts/
│       │   └── [id].vue          # 文章详情
│       └── tags/
│           ├── [tag].vue         # 标签详情
│           └── index.vue         # 标签列表
├── content/
│   ├── data.json                 # 博客数据
│   └── posts/                    # Markdown 文章
│       ├── hello-world.md
│       ├── life-thoughts.md
│       ├── nuxt3-guide.md
│       └── tailwind-tips.md
├── public/                       # 静态资源
├── nuxt.config.ts                # Nuxt 配置
├── package.json
└── tsconfig.json
```

## 添加文章

1. 在 `content/posts/` 目录下创建新的 `.md` 文件
2. 在文件开头添加 frontmatter：

```markdown
---
title: 文章标题
date: 2026-08-01
tags: [标签1, 标签2]
category: 分类
readTime: 5 分钟
---

# 文章内容
```

3. 在 `content/data.json` 的 `posts` 数组中添加文章信息：

```json
{
  "id": "article-slug",
  "title": "文章标题",
  "summary": "文章简介",
  "date": "2026-08-01",
  "tags": ["标签1", "标签2"],
  "category": "分类",
  "readTime": "5 分钟"
}
```

## 配置 Utterances 评论

1. 在 GitHub 仓库中安装 [Utterances](https://github.com/apps/utterances) App
2. 在 `.env` 文件中配置：

```env
GITHUB_REPO=your-username/your-repo
UTTERANCES_REPO=your-username/your-repo
UTTERANCES_ISSUE_TERM=pathname
UTTERANCES_THEME=github-light
```

## License

MIT
