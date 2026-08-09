// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  srcDir: 'app/',

  devtools: { enabled: false },

  // Tailwind CSS 配置 - 启用 class-based dark mode
  tailwindcss: {
    config: {
      darkMode: 'class'
    }
  },

  vite: {
    watch: {
      usePolling: true,
      interval: 1000,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.output/**']
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.output/**']
      }
    },
    build: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.output/**']
      }
    }
  },

  devServer: {
    watch: false
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon'
  ],

  // 静态站点生成
  nitro: {
    prerender: {
      routes: ['/']
    },
    rollupConfig: {
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**', '**/.output/**']
      }
    }
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: "Woods'Blog",
      meta: [
        { name: 'description', content: 'Woods\'Blog — 记录技术与生活' },
        { name: 'keywords', content: 'blog, 博客, 技术, 编程, 前端, Vue, Nuxt, Tailwind CSS' },
        { name: 'author', content: 'Woods' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#111827', media: '(prefers-color-scheme: dark)' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: "Woods'Blog" },
        { property: 'og:locale', content: 'zh_CN' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@woods' },
        { name: 'twitter:creator', content: '@woods' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo_light.png', media: '(prefers-color-scheme: light)' },
        { rel: 'icon', type: 'image/png', href: '/logo_dark.png', media: '(prefers-color-scheme: dark)' },
        { rel: 'apple-touch-icon', href: '/logo_light.png' },
        { rel: 'canonical', href: 'https://woods.blog' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      githubRepo: process.env.GITHUB_REPO || 'your-username/your-repo',
      utterancesRepo: process.env.UTTERANCES_REPO || 'your-username/your-repo',
      utterancesIssueTerm: process.env.UTTERANCES_ISSUE_TERM || 'pathname',
      utterancesTheme: process.env.UTTERANCES_THEME || 'github-light'
    }
  }
})
