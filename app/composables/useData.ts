import { ref, computed, watch } from 'vue'
import { useLang } from '~/composables/useLang'
import { useRuntimeConfig } from '#app'

const MOMENTS_PER_PAGE = 20

// 使用 import.meta.glob 在构建时加载所有说说文件
const zhMomentsFiles = import.meta.glob<{ default: any[] }>('../../content/moments/zh/page-*.json', { eager: true })
const enMomentsFiles = import.meta.glob<{ default: any[] }>('../../content/moments/en/page-*.json', { eager: true })

// 使用 import.meta.glob 在构建时加载所有文章 Markdown 文件（query: '?raw' 以原始字符串方式加载）
const zhPostsFiles = import.meta.glob<string>('../../content/posts/zh/*.md', { eager: true, query: '?raw' })
const enPostsFiles = import.meta.glob<string>('../../content/posts/en/*.md', { eager: true, query: '?raw' })

/**
 * 解析 Markdown 文件中的 YAML frontmatter
 * 格式: ---\nkey: value\n---\n正文内容
 */
let currentListKey: string | null = null
const parseFrontmatter = (raw: string) => {
  currentListKey = null
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)
  if (!match) return { meta: {}, content: raw }

  const meta: Record<string, any> = {}
  const content = match[2]

  match[1].split('\n').forEach(line => {
    // 跳过空行
    if (!line.trim()) return

    // 列表项 (tags: 下的 - item)
    const listMatch = line.match(/^\s+-\s+(.+)$/)
    if (listMatch) {
      // 找到当前正在解析的列表键
      if (currentListKey) {
        if (!meta[currentListKey]) meta[currentListKey] = []
        meta[currentListKey].push(listMatch[1].trim())
      }
      return
    }

    // 普通键值对
    const kvMatch = line.match(/^([\w]+):\s*(.*)$/)
    if (kvMatch) {
      const key = kvMatch[1]
      const val = kvMatch[2].trim()
      if (val === '') {
        // 空值，可能是列表的开头
        currentListKey = key
      } else {
        // 非空值，重置列表键
        currentListKey = null
        // 尝试解析为数字或布尔值
        if (/^\d+$/.test(val)) meta[key] = parseInt(val)
        else if (val === 'true') meta[key] = true
        else if (val === 'false') meta[key] = false
        else meta[key] = val
      }
    }
  })

  return { meta, content }
}

// 加载所有文章
const loadAllPosts = (locale: 'zh' | 'en'): any[] => {
  const files = locale === 'zh' ? zhPostsFiles : enPostsFiles
  return Object.entries(files).map(([path, mod]) => {
    const raw = typeof mod === 'string' ? mod : (mod as any).default || ''
    const { meta, content } = parseFrontmatter(raw)
    return { ...meta, content }
  })
}

// 合并所有页面的说说
const loadAllMoments = (locale: 'zh' | 'en'): any[] => {
  const files = locale === 'zh' ? zhMomentsFiles : enMomentsFiles
  const all: any[] = []
  Object.values(files).forEach(mod => {
    const items = mod.default || []
    all.push(...items)
  })
  return all
}

// 计算总页数
const getTotalPages = (locale: 'zh' | 'en'): number => {
  const files = locale === 'zh' ? zhMomentsFiles : enMomentsFiles
  return Object.keys(files).length
}

// 获取指定页的说说
const getMomentsPage = (page: number, locale: 'zh' | 'en'): any[] => {
  const files = locale === 'zh' ? zhMomentsFiles : enMomentsFiles
  const keys = Object.keys(files).sort((a, b) => {
    const numA = parseInt(a.match(/page-(\d+)/)?.[1] || '0')
    const numB = parseInt(b.match(/page-(\d+)/)?.[1] || '0')
    return numA - numB
  })
  const key = keys[page - 1]
  if (!key) return []
  return files[key].default || []
}

export const useData = () => {
  const { lang } = useLang()
  const config = useRuntimeConfig()

  const site = computed(() => ({
    title: config.public.siteTitle,
    titleZh: config.public.siteTitleZh,
    description: config.public.siteDesc,
    descriptionZh: config.public.siteDescZh
  }))

  const locale = computed(() => (lang.value === 'zh' ? 'zh' : 'en') as 'zh' | 'en')

  // 文章：从独立文件加载
  const posts = computed(() => loadAllPosts(locale.value))

  // 说说：从独立文件加载
  const moments = ref<any[]>([])
  const momentsTotalPages = ref(0)

  const loadMoments = (page: number = 1) => {
    momentsTotalPages.value = getTotalPages(locale.value)
    moments.value = getMomentsPage(page, locale.value)
  }

  // 监听语言变化，重新加载说说
  watch(locale, () => {
    loadMoments(1)
  }, { immediate: true })

  // 获取所有标签（根据语言返回）
  const allTags = computed(() => {
    const tagMap = new Map<string, number>()
    posts.value.forEach(post => {
      post.tags.forEach((tag: string) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })
    return Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }))
  })

  // 获取所有分类（根据语言返回）
  const allCategories = computed(() => {
    const catMap = new Map<string, number>()
    posts.value.forEach(post => {
      catMap.set(post.category, (catMap.get(post.category) || 0) + 1)
    })
    return Array.from(catMap.entries()).map(([name, count]) => ({ name, count }))
  })

  // 按年份归档
  const archives = computed(() => {
    const yearMap = new Map<string, number>()
    posts.value.forEach(post => {
      const year = post.date.split('-')[0]
      yearMap.set(year, (yearMap.get(year) || 0) + 1)
    })
    return Array.from(yearMap.entries()).map(([year, count]) => ({ year, count }))
  })

  // 搜索文章
  const searchPosts = (query: string) => {
    if (!query.trim()) return posts.value
    const q = query.toLowerCase()
    return posts.value.filter(post => {
      return post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(q))
    })
  }

  // 按标签筛选
  const filterByTag = (tag: string) => {
    return posts.value.filter(post => {
      return post.tags.includes(tag)
    })
  }

  // 按分类筛选
  const filterByCategory = (category: string) => {
    return posts.value.filter(post => {
      return post.category === category
    })
  }

  // 按年份筛选
  const filterByYear = (year: string) => {
    return posts.value.filter(post => post.date.startsWith(year))
  }

  // 统计：总字数（根据当前语言计算 content 字数）
  const totalWords = computed(() => {
    return posts.value.reduce((sum, post) => {
      const content = post.content
      // 中文字符按字符数，英文按空格分割
      if (lang.value === 'zh') {
        return sum + content.replace(/\s/g, '').length
      }
      return sum + content.split(/\s+/).filter(Boolean).length
    }, 0)
  })

  // 统计：总阅读时间（从 readTime 字段提取数字求和）
  const totalReadTime = computed(() => {
    return posts.value.reduce((sum, post) => {
      const readTime = post.readTime
      const match = readTime.match(/(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
  })

  // 统计：总标签数（去重后的标签总数）
  const totalTags = computed(() => allTags.value.length)

  // 统计：总博客数
  const totalPosts = computed(() => posts.value.length)

  return {
    site,
    posts,
    moments,
    momentsTotalPages,
    loadMoments,
    allTags,
    allCategories,
    archives,
    searchPosts,
    filterByTag,
    filterByCategory,
    filterByYear,
    totalWords,
    totalReadTime,
    totalTags,
    totalPosts
  }
}
