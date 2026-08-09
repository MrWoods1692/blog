# 极简博客

一个基于 Nuxt 3 构建的极简静态博客，支持中英文双语、Markdown 渲染、评论等功能。

## 功能特性

- 📝 **文章管理** — JSON 格式编写，自动渲染 Markdown
- 🔍 **搜索** — 实时搜索文章标题、内容和标签
- 🏷️ **标签系统** — 按标签分类浏览文章
- 📅 **归档** — 按年份查看文章
- 🧭 **导航** — 响应式导航栏，支持移动端
- 💾 **项目展示** — 开源项目展示页面
- 💬 **说说** — 简短的日常记录，支持图片
- 📄 **Markdown 渲染** — 支持代码高亮、表格、引用等
- 💬 **评论** — 基于 GitHub Issues (Utterances)
-  **分享** — 支持分享到 Twitter、微博，复制链接
- 🌙 **暗色模式** — 支持亮色/暗色主题切换
- 🌐 **多语言** — 支持中文/英文双语切换

## 技术栈

- [Nuxt 3](https://nuxt.com/) — Vue 3 通用框架
- [Vue 3](https://vuejs.org/) — 渐进式 JavaScript 框架
- [Tailwind CSS](https://tailwindcss.com/) — 原子化 CSS 框架
- [Markdown-it](https://github.com/markdown-it/markdown-it) — Markdown 解析器
- [Utterances](https://utteranc.es/) — 基于 GitHub Issues 的评论系统
- [Cloudflare Pages](https://pages.cloudflare.com/) — 静态站点托管

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 静态生成

```bash
pnpm generate
```

### 本地预览

```bash
pnpm preview
```

---

## 添加一篇新文章

文章以 JSON 文件的形式存储在 `content/posts/` 目录下，按语言分文件夹（`zh/` 和 `en/`）。

### 步骤 1：创建文章 JSON 文件

在 `content/posts/zh/`（中文）或 `content/posts/en/`（英文）目录下创建一个新的 JSON 文件，文件名即为文章的 slug（URL 标识）。

例如创建 `content/posts/zh/my-new-post.json`：

```json
{
  "id": "my-new-post",
  "title": "我的新文章",
  "summary": "这是一篇新文章的简介，会显示在文章列表页。",
  "date": "2026-08-09",
  "tags": ["标签1", "标签2"],
  "category": "分类名",
  "readTime": "5 min",
  "content": "# 标题\n\n这里是 Markdown 格式的文章正文。\n\n## 二级标题\n\n- 列表项 1\n- 列表项 2\n\n```javascript\nconsole.log('Hello World!')\n```\n\n> 这是一段引用\n\n---\n\n*文章结尾*"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 文章唯一标识，需与文件名一致 |
| `title` | string | ✅ | 文章标题 |
| `summary` | string | ✅ | 文章简介，显示在列表页 |
| `date` | string | ✅ | 发布日期，格式 `YYYY-MM-DD` |
| `tags` | string[] | ✅ | 标签数组 |
| `category` | string | ✅ | 文章分类 |
| `readTime` | string | ✅ | 预计阅读时间，如 `"5 min"` |
| `content` | string | ✅ | Markdown 格式的文章正文 |

### 步骤 2：更新文章索引

在 `content/posts/index.json` 中添加文章记录：

```json
[
  { "id": "hello-world", "date": "2026-08-01" },
  { "id": "my-new-post", "date": "2026-08-09" }
]
```

### 步骤 3：添加英文版本（可选）

如果需要双语支持，在 `content/posts/en/` 下创建对应的英文 JSON 文件，字段结构相同，内容使用英文。

### 步骤 4：本地验证

```bash
pnpm dev
```

在浏览器中访问 `http://localhost:3000/posts/my-new-post` 查看效果。

---

## 添加一篇新说说

说说以 JSON 数组的形式存储在 `content/moments/` 目录下，按语言分文件夹。每个文件代表一页（每页最多 20 条）。

### 步骤 1：确定目标文件

说说文件按页编号命名，如 `page-1.json`、`page-2.json`。

- 如果当前最后一页未满 20 条，直接在该文件末尾添加
- 如果已满 20 条，创建新的 `page-N.json` 文件

### 步骤 2：添加说说内容

编辑 `content/moments/zh/page-1.json`（中文）或 `content/moments/en/page-1.json`（英文），在数组末尾添加新对象：

```json
[
  {
    "id": 1,
    "content": "今天开始写博客了，希望能坚持下去！",
    "date": "2026-08-01",
    "images": ["https://example.com/photo1.jpg"]
  },
  {
    "id": 5,
    "content": "这是一条新的说说，记录今天的心情。",
    "date": "2026-08-09"
  }
]
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | ✅ | 唯一递增 ID，需与现有 ID 不重复 |
| `content` | string | ✅ | 说说正文内容 |
| `date` | string | ✅ | 发布日期，格式 `YYYY-MM-DD` |
| `images` | string[] | ❌ | 图片 URL 数组，可省略 |

### 注意事项

- `id` 必须全局唯一，建议查看现有文件中的最大 ID 后递增
- 单页最多 20 条说说，超过后创建新页文件
- 图片建议使用稳定的图床服务（如 Cloudflare R2、GitHub 等）

---

## 发布到 Cloudflare Pages

本项目使用 Cloudflare Pages 进行静态站点托管，`_routes.json` 文件用于配置缓存策略。

### 方式一：通过 Cloudflare Dashboard 手动部署

1. **构建项目**

   ```bash
   pnpm build
   ```

   构建完成后，产物位于 `dist/` 目录。

2. **登录 Cloudflare Dashboard**

   访问 [Cloudflare Pages](https://pages.cloudflare.com/)，点击 **Create a project**。

3. **选择部署方式**

   - 选择 **Upload assets**（手动上传）
   - 项目名称填写你的博客名称
   - 上传 `dist/` 目录下的所有文件

4. **配置自定义域名（可选）**

   在 **Custom domains** 中添加你的域名，Cloudflare 会自动配置 SSL。

### 方式二：通过 GitHub 集成自动部署（推荐）

1. **在 Cloudflare Dashboard 创建项目**

   - 点击 **Create a project**
   - 选择 **Connect to Git**
   - 授权 GitHub 并选择你的博客仓库

2. **配置构建设置**

   | 设置项 | 值 |
   |--------|-----|
   | Framework preset | Nuxt 3 |
   | Build command | `pnpm build` |
   | Build output directory | `dist` |
   | Node.js version | 20 |

3. **配置环境变量**

   在 **Settings → Environment variables** 中添加：

   ```
   GITHUB_REPO = your-username/your-repo
   UTTERANCES_REPO = your-username/your-repo
   UTTERANCES_ISSUE_TERM = pathname
   UTTERANCES_THEME = github-light
   ```

4. **提交代码触发部署**

   每次 push 到主分支后，Cloudflare Pages 会自动构建并部署。

### 方式三：通过 Wrangler CLI 部署

1. **安装 Wrangler**

   ```bash
   pnpm add -D wrangler
   ```

2. **登录 Cloudflare**

   ```bash
   wrangler login
   ```

3. **构建并部署**

   ```bash
   pnpm build
   wrangler pages deploy dist --project-name=your-project-name
   ```

### 缓存策略说明

项目根目录的 `_routes.json` 配置了 Cloudflare 的缓存规则：

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/_nuxt/*", "/_payload.json", "/assets/*", "/favicon.ico", "/robots.txt"]
}
```

- `include: ["/*"]` — 所有页面路由启用缓存
- `exclude` — 排除静态资源（JS/CSS/图片等），这些由 Nuxt 自动处理缓存

---

## 开启 GitHub 评论（Utterances）

本项目使用 [Utterances](https://utteranc.es/) 作为评论系统，它基于 GitHub Issues 实现，无需后端服务。

### 步骤 1：安装 Utterances GitHub App

1. 访问 [Utterances App](https://github.com/apps/utterances)
2. 点击 **Install**
3. 选择 **Only select repositories**
4. 勾选你的博客仓库
5. 点击 **Install**

### 步骤 2：配置环境变量

在 Cloudflare Pages 的 **Settings → Environment variables** 中添加以下变量：

```
GITHUB_REPO = your-username/your-repo
UTTERANCES_REPO = your-username/your-repo
UTTERANCES_ISSUE_TERM = pathname
UTTERANCES_THEME = github-light
```

| 变量 | 说明 |
|------|------|
| `GITHUB_REPO` | 你的 GitHub 仓库地址（用户名/仓库名） |
| `UTTERANCES_REPO` | Utterances 使用的仓库地址，通常与 `GITHUB_REPO` 相同 |
| `UTTERANCES_ISSUE_TERM` | Issue 匹配方式，`pathname` 表示按页面路径匹配 |
| `UTTERANCES_THEME` | 评论主题，可选 `github-light`、`github-dark`、`github-dark-orange` 等 |

### 步骤 3：验证评论功能

1. 部署站点后，打开任意文章页面
2. 滚动到页面底部，应能看到 Utterances 评论框
3. 使用 GitHub 账号登录即可发表评论

### 常见问题

**评论框显示"评论功能已禁用"**

- 检查 `UTTERANCES_REPO` 是否配置正确，不能是默认的 `your-username/your-repo`
- 确认仓库是 **Public** 的（Utterances 需要公开仓库）

**评论框显示错误**

- 确认已安装 Utterances GitHub App
- 确认 App 已授权到正确的仓库
- 检查仓库中是否有 Issues 权限

**暗色模式下评论主题不匹配**

- 可将 `UTTERANCES_THEME` 设置为 `github-dark`，或在代码中根据主题动态切换

---

## 项目结构

```
blog/
├── _routes.json                  # Cloudflare Pages 缓存路由配置
├── nuxt.config.ts                # Nuxt 主配置
├── package.json
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json
├── app/
│   ├── app.vue                   # 根组件
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # 全局样式
│   ├── components/
│   │   ├── Comments.vue          # 评论组件 (Utterances)
│   │   ├── Footer.vue            # 页脚
│   │   ├── Header.vue            # 导航栏
│   │   ├── ImageViewer.vue       # 图片查看器
│   │   ├── NavLink.vue           # 导航链接
│   │   ├── PostCard.vue          # 文章卡片
│   │   ├── SearchModal.vue       # 搜索弹窗
│   │   └── ShareButton.vue       # 分享按钮
│   ├── composables/
│   │   ├── useData.ts            # 数据管理（文章/说说加载）
│   │   ├── useDark.ts            # 暗色模式
│   │   ├── useLang.ts            # 多语言
│   │   └── useMarkdown.ts        # Markdown 渲染
│   ├── layouts/
│   │   ├── default.vue           # 默认布局
│   │   └── post.vue              # 文章布局
│   └── pages/
│       ├── index.vue             # 首页
│       ├── archive.vue           # 归档页面
│       ├── moments.vue           # 说说页面
│       ├── search.vue            # 搜索页面
│       ├── posts/
│       │   └── [id].vue          # 文章详情页
│       └── tags/
│           ├── [tag].vue         # 标签详情页
│           └── index.vue         # 标签列表页
├── content/
│   ├── posts/
│   │   ├── index.json            # 文章索引
│   │   ├── zh/                   # 中文文章
│   │   │   ├── hello-world.json
│   │   │   ├── life-thoughts.json
│   │   │   ├── nuxt3-guide.json
│   │   │   └── tailwind-tips.json
│   │   └── en/                   # 英文文章
│   │       ├── hello-world.json
│   │       ├── life-thoughts.json
│   │       ├── nuxt3-guide.json
│   │       └── tailwind-tips.json
│   └── moments/
│       ├── zh/                   # 中文说说
│       │   └── page-1.json
│       └── en/                   # 英文说说
│           └── page-1.json
├── public/                       # 静态资源
│   └── robots.txt
└── server/
    └── routes/
        └── sitemap.xml.ts        # 站点地图
```