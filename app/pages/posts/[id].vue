<template>
  <div v-if="post" class="max-w-5xl mx-auto px-4 py-8">
    <div class="flex gap-8">
      <!-- 目录侧栏（仅桌面端） -->
      <aside class="hidden xl:block w-64 flex-shrink-0">
        <div v-if="tocItems.length > 0" class="sticky top-24">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Icon name="lucide:list" class="w-4 h-4" />
            {{ t('article.toc') }}
          </h3>
          <nav class="space-y-1 border-l border-gray-200 dark:border-gray-700">
            <a v-for="item in tocItems" :key="item.id" :href="'#' + item.id"
              class="block pl-3 py-1 text-sm transition-colors border-l-2 -ml-[1px]"
              :class="[
                item.level === 3 ? 'pl-6' : 'pl-3',
                activeTocId === item.id
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-medium'
                  : 'border-transparent text-gray-900 dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-200'
              ]">
              {{ item.text }}
            </a>
          </nav>
        </div>
      </aside>

      <!-- 文章主体 -->
      <div class="flex-1 min-w-0">
    <div class="mb-8">
      <h1 class="text-3xl md:text-4xl font-bold mb-4">{{ displayTitle }}</h1>
      <div class="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span class="flex items-center gap-1">
          <Icon name="lucide:calendar" class="w-4 h-4" />
          {{ post.date }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="lucide:clock" class="w-4 h-4" />
          {{ displayReadTime }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="lucide:folder" class="w-4 h-4" />
          {{ displayCategory }}
        </span>
      </div>
      <div class="flex flex-wrap gap-2 mt-4">
        <NuxtLink v-for="tag in displayTags" :key="tag" :to="`/tags/${tag}`"
          class="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <Icon name="lucide:tag" class="w-3 h-3" />
          {{ tag }}
        </NuxtLink>
      </div>
    </div>

    <div class="mb-8 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50">
      <div class="flex items-start gap-3">
        <svg viewBox="0 0 1024 1024" class="w-8 h-8 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M229.0688 665.4464l183.1424-102.7072 3.1232-8.9088-3.1232-4.9664h-8.9088l-30.6688-1.8432-104.704-2.816-90.7776-3.7888-87.9104-4.7104-22.1696-4.7104-20.7872-27.3408 2.1504-13.6704 18.6368-12.4416 26.624 2.304 58.9824 3.9936 88.3712 6.144 64.1024 3.7888 95.0272 9.8816h15.104l2.1504-6.0928-5.2224-3.7888-3.9936-3.7888-91.4944-61.952-99.0208-65.4848-51.8144-37.7344-28.1088-19.0464-14.1312-17.92-6.144-39.1168 25.4464-28.0064 34.2016 2.304 8.7552 2.3552 34.6624 26.624 74.0352 57.2928L391.2704 380.416l14.1824 11.776 5.632-3.9936 0.7168-2.816-6.3488-10.6496-52.5824-94.9248-56.1152-96.6144-24.9856-40.0384-6.6048-24.0128c-2.5088-9.216-3.8912-18.7392-4.0448-28.2624l29.0304-39.3216 16.0256-5.2224 38.656 5.2224 16.2816 14.1312 24.064 54.8864 38.8608 86.4768L484.352 324.608l17.7152 34.8672 9.4208 32.3072 3.5328 9.8816h6.144v-5.6832l4.9664-66.2016 9.216-81.3056 8.9088-104.5504 3.1232-29.4912 14.592-35.328 28.9792-19.0976 22.6816 10.8544 18.6368 26.5728-2.6112 17.2032-11.1104 71.8336-21.7088 112.64-14.1312 75.3664h8.2432l9.4208-9.3696 38.1952-50.688 64.1024-80.0768 28.3136-31.7952 32.9728-35.072 21.248-16.7424h40.0896l29.4912 43.8272-13.2096 45.2608-41.2672 52.2752-34.2016 44.288-49.0496 65.9456-30.6688 52.7872 2.816 4.2496 7.2704-0.768 110.7968-23.5008 59.8528-10.8544 71.424-12.2368 32.3072 15.0528 3.5328 15.3088-12.7488 31.3344-76.3904 18.8416-89.6 17.92-133.4272 31.5392-1.6384 1.1776 1.8944 2.3552 60.1088 5.6832 25.7024 1.3824h62.9248l117.1968 8.7552 30.6688 20.2752 18.3808 24.7808-3.072 18.8416-47.1552 24.064-63.6416-15.104-148.5824-35.328-50.8928-12.7488h-7.0656v4.2496l42.3936 41.4208 77.824 70.2464 97.3312 90.4192 4.9152 22.4256-12.4928 17.664-13.2096-1.8944-85.5552-64.3072-33.024-28.9792-74.752-62.8736h-4.9664v6.6048l17.2032 25.1904 90.9824 136.6016 4.7104 41.8816-6.6048 13.7216-23.6032 8.2432-25.9072-4.7104-53.2992-74.7008-54.8864-84.0704-44.3392-75.4176-5.4272 3.1232-26.1632 281.4976-12.2368 14.336-28.2624 10.8544-23.552-17.8688-12.4928-28.9792 12.4928-57.2928 15.104-74.6496 12.2368-59.392 11.1104-73.728 6.6048-24.5248-0.4608-1.6384-5.4272 0.7168-55.6544 76.3392-84.5824 114.2784-66.9696 71.5776-16.0768 6.3488-27.8016-14.336 2.6112-25.7024 15.5648-22.8352 92.672-117.8112 55.8592-73.0112 36.096-42.1376-0.256-6.144h-2.1504l-246.1184 159.6928-43.8272 5.6832-18.8928-17.7152 2.3552-28.928 8.96-9.4208 74.0352-50.8928-0.256 0.256z" fill="#D97757" />
        </svg>
        <div>
          <div class="mb-1">
            <p class="text-sm font-semibold text-orange-700 dark:text-orange-400 flex items-center gap-1.5">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-orange-400" :class="{ 'animate-pulse': isTyping }"></span>
              {{ t('article.aiSummary') }}
            </p>
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed" :class="{ 'typing-glow': isTyping }">
            <span v-for="(char, idx) in typedChars" :key="idx">{{ char }}</span>
            <span v-if="isTyping" class="inline-block w-0.5 h-4 -ml-0.5 align-middle bg-gray-700 dark:bg-gray-300 animate-pulse"></span>
          </p>
        </div>
      </div>
    </div>

    <article class="prose prose-lg dark:prose-invert max-w-none mb-12 article-content" v-html="renderedContent" />

    <ImageViewer v-model:show="showViewer" :src="viewerSrc" :alt="viewerAlt" />

    <div class="border-t border-gray-200 dark:border-gray-800 pt-8 mb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button @click="toggleLike" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
            :class="liked ? 'text-red-500 border-red-300 dark:border-red-700' : 'text-gray-500 dark:text-gray-400'">
            <Icon :name="liked ? 'lucide:heart' : 'lucide:heart'" class="w-5 h-5" :class="{ 'fill-red-500': liked }" />
            <span class="font-medium">{{ likeCount + (liked ? 1 : 0) }}</span>
          </button>
          <ShareButton :title="displayTitle" :url="shareUrl" :summary="displaySummary" />
        </div>
      </div>
    </div>

    <Comments :postId="post.id" :title="displayTitle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'
import { useMarkdown } from '~/composables/useMarkdown'
import Comments from '~/components/Comments.vue'
import ShareButton from '~/components/ShareButton.vue'
import ImageViewer from '~/components/ImageViewer.vue'

const route = useRoute()
const { posts } = useData()
const { lang, t } = useLang()
const { render } = useMarkdown()

const postId = route.params.id as string
const post = computed(() => posts.value.find(p => p.id === postId))
const liked = ref(false)
const likeCount = ref(0)
const isTyping = ref(false)
const typedChars = ref<string[]>([])
let generation = 0

const showViewer = ref(false)
const viewerSrc = ref('')
const viewerAlt = ref('')

const DB_NAME = 'blog-db'
const DB_VERSION = 1
const STORE_NAME = 'seen-posts'

let dbPromise: Promise<IDBDatabase> | null = null

const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

const getSeenPosts = async (): Promise<Set<string>> => {
  if (typeof window === 'undefined') return new Set()
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()
      request.onsuccess = () => resolve(new Set(request.result || []))
      request.onerror = () => reject(request.error)
    })
  } catch {
    return new Set()
  }
}

const markSeen = async (id: string) => {
  if (typeof window === 'undefined') return
  try {
    const db = await openDB()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(id)
      tx.oncomplete = () => resolve(undefined)
      tx.onerror = () => reject(tx.error)
    })
  } catch {
    // silent fail
  }
}

const skipAnimation = async () => {
  generation++
  await markSeen(postId)
  isTyping.value = false
  typedChars.value = displaySummary.value.split('')
}

const startTypewriter = async (text: string, forceRestart: boolean = false) => {
  if (!text) return
  generation++
  const myGen = generation
  // 立即清空旧文本，避免闪烁
  typedChars.value = []
  isTyping.value = false

  const seen = await getSeenPosts()
  if (myGen !== generation) return
  if (!forceRestart && seen.has(postId)) {
    isTyping.value = false
    typedChars.value = text.split('')
    return
  }

  isTyping.value = true

  for (let i = 0; i < text.length; i++) {
    if (myGen !== generation) return
    const char = text[i]
    let delay = 40 + Math.random() * 40
    if (['.', '。', '!', '！', '?', '？', '\n'].includes(char)) {
      delay = 200 + Math.random() * 300
    } else if (['，', ',', ';', '；', ':', '：'].includes(char)) {
      delay = 100 + Math.random() * 150
    }
    await new Promise(resolve => setTimeout(resolve, delay))
    if (myGen !== generation) return
    typedChars.value = text.slice(0, i + 1).split('')
  }

  if (myGen !== generation) return
  isTyping.value = false
  await markSeen(postId)
}

const displayTitle = computed(() => post.value ? post.value.title : '')
const displaySummary = computed(() => post.value ? post.value.summary : '')
const displayReadTime = computed(() => post.value ? post.value.readTime : '')
const displayCategory = computed(() => post.value ? post.value.category : '')
const displayTags = computed(() => post.value ? post.value.tags : [])
const shareUrl = computed(() => {
  return typeof window !== 'undefined' ? window.location.href : ''
})

// SEO
useHead(() => ({
  title: post.value ? `${displayTitle.value} - Woods'Blog` : "Woods'Blog",
  meta: [
    { name: 'description', content: displaySummary.value },
    { name: 'keywords', content: displayTags.value.join(', ') },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: displayTitle.value },
    { property: 'og:description', content: displaySummary.value },
    { property: 'og:url', content: shareUrl.value },
    { property: 'og:site_name', content: "Woods'Blog" },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: displayTitle.value },
    { name: 'twitter:description', content: displaySummary.value }
  ],
  link: [
    { rel: 'canonical', href: shareUrl.value }
  ],
  script: post.value ? [{
    type: 'application/ld+json',
    children: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: displayTitle.value,
      description: displaySummary.value,
      datePublished: post.value.date,
      dateModified: post.value.date,
      author: { '@type': 'Person', name: 'Woods' },
      publisher: { '@type': 'Organization', name: "Woods'Blog" },
      mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl.value },
      keywords: displayTags.value.join(', ')
    })
  }] : []
}))

let lastLang = lang.value

watch(displaySummary, (newSummary) => {
  const langChanged = lang.value !== lastLang
  lastLang = lang.value
  startTypewriter(newSummary, langChanged)
}, { immediate: true })

const renderedContent = computed(() => {
  if (!post.value) return ''
  return render(post.value.content)
})

// 为代码块添加复制按钮
const addCopyButtons = () => {
  if (typeof window === 'undefined') return
  nextTick(() => {
    const article = document.querySelector('.article-content')
    if (!article) return
    const pres = article.querySelectorAll('pre')
    pres.forEach(pre => {
      if (pre.closest('.code-block-wrapper')) return
      const wrapper = document.createElement('div')
      wrapper.className = 'code-block-wrapper'
      const copyBtn = document.createElement('button')
      copyBtn.className = 'copy-btn'
      copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
      copyBtn.title = '复制代码'
      copyBtn.addEventListener('click', async () => {
        const code = pre.querySelector('code')
        const text = code?.textContent || pre.textContent
        try {
          await navigator.clipboard.writeText(text)
          copyBtn.classList.add('copied')
          setTimeout(() => copyBtn.classList.remove('copied'), 2000)
        } catch {
          // fallback
          const ta = document.createElement('textarea')
          ta.value = text
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
          copyBtn.classList.add('copied')
          setTimeout(() => copyBtn.classList.remove('copied'), 2000)
        }
      })
      wrapper.appendChild(copyBtn)
      wrapper.appendChild(pre)
      pre.parentNode?.replaceChild(wrapper, pre)
    })
  })
}

const addImageClickHandlers = () => {
  if (typeof window === 'undefined') return
  nextTick(() => {
    const article = document.querySelector('.article-content')
    if (!article) return
    const imgs = article.querySelectorAll('img')
    imgs.forEach(img => {
      if (img.hasAttribute('data-clickable')) return
      img.setAttribute('data-clickable', 'true')
      img.classList.add('article-image')
      img.addEventListener('click', () => {
        viewerSrc.value = img.src
        viewerAlt.value = img.alt || ''
        showViewer.value = true
      })
    })
  })
}

const addExternalLinkConfirm = () => {
  if (typeof window === 'undefined') return
  nextTick(() => {
    const article = document.querySelector('.article-content')
    if (!article) return
    const links = article.querySelectorAll('a')
    links.forEach(link => {
      if (link.hasAttribute('data-external-confirmed')) return
      const href = link.getAttribute('href')
      if (!href) return
      try {
        const url = new URL(href, window.location.origin)
        if (url.hostname === window.location.hostname) return
      } catch {
        return
      }
      link.setAttribute('data-external-confirmed', 'true')
      link.addEventListener('click', (e) => {
        e.preventDefault()
        if (confirm(`即将跳转到外部网站：\n${href}\n\n是否继续？`)) {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      })
    })
  })
}

watch(renderedContent, () => {
  if (typeof window === 'undefined') return
  addCopyButtons()
  addImageClickHandlers()
  addExternalLinkConfirm()
}, { immediate: true })

const toggleLike = () => {
  liked.value = !liked.value
}

// 目录
const tocItems = ref<{ id: string; text: string; level: number }[]>([])
const activeTocId = ref('')
let observer: IntersectionObserver | null = null

const extractToc = () => {
  if (typeof window === 'undefined') return
  const article = document.querySelector('.article-content')
  if (!article) return
  const headings = article.querySelectorAll('h2, h3')
  tocItems.value = Array.from(headings).map(h => ({
    id: h.id,
    text: h.textContent?.replace(/#/g, '').trim() || '',
    level: parseInt(h.tagName[1])
  }))
}

const initScrollSpy = () => {
  if (typeof window === 'undefined') return
  const article = document.querySelector('.article-content')
  if (!article) return

  if (observer) observer.disconnect()

  const headings = article.querySelectorAll('h2, h3')
  if (headings.length === 0) return

  observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting)
    if (visible.length === 0) return
    visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
    activeTocId.value = visible[0].target.id
  }, { rootMargin: '-80px 0px -80% 0px', threshold: [0, 0.2] })

  headings.forEach(h => observer!.observe(h))
}

watch(renderedContent, () => {
  if (typeof window === 'undefined') return
  nextTick(() => {
    extractToc()
    initScrollSpy()
  })
}, { immediate: true })
</script>

<style scoped>
.typing-glow {
  text-shadow: 0 0 12px rgba(251, 146, 60, 0.15);
}

/* 文章正文美化 */
.article-content :deep(h2) {
  font-size: 1.75rem;
  font-weight: 700;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
  scroll-margin-top: 5rem;
}

.dark .article-content :deep(h2) {
  color: #f3f4f6;
  border-bottom-color: #fb923c;
}

.article-content :deep(h3) {
  font-size: 1.375rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: #374151;
  scroll-margin-top: 5rem;
}

.dark .article-content :deep(h3) {
  color: #e5e7eb;
}

.article-content :deep(p) {
  line-height: 1.85;
  margin-bottom: 1.25rem;
  color: #4b5563;
}

.dark .article-content :deep(p) {
  color: #d1d5db;
}

.article-content :deep(blockquote) {
  border-left: 4px solid #94a3b8;
  background: #f1f5f9;
  padding: 1rem 1.25rem;
  border-radius: 0 8px 8px 0;
  margin: 1.5rem 0;
  font-style: italic;
  color: #475569;
}

.dark .article-content :deep(blockquote) {
  background: #1e293b;
  border-left-color: #64748b;
  color: #94a3b8;
}

.article-content :deep(pre) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin: 0;
  overflow-x: auto;
  box-shadow: none;
}

.dark .article-content :deep(pre) {
  background: #1e293b;
  border-color: #334155;
}

/* 代码块容器 */
.article-content :deep(.code-block-wrapper) {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 复制按钮 */
.article-content :deep(.copy-btn) {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 10;
}

.article-content :deep(.code-block-wrapper:hover .copy-btn) {
  opacity: 1;
}

.article-content :deep(.copy-btn:hover) {
  background: #f1f5f9;
  color: #334155;
  border-color: #cbd5e1;
}

.article-content :deep(.copy-btn.copied) {
  opacity: 1;
  background: #dcfce7;
  border-color: #86efac;
  color: #16a34a;
}

.dark .article-content :deep(.copy-btn) {
  background: #1e293b;
  border-color: #334155;
  color: #94a3b8;
}

.dark .article-content :deep(.copy-btn:hover) {
  background: #334155;
  color: #e2e8f0;
  border-color: #475569;
}

.dark .article-content :deep(.copy-btn.copied) {
  background: #14532d;
  border-color: #22c55e;
  color: #86efac;
}

.article-content :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 0.875em;
}

.article-content :deep(p code),
.article-content :deep(li code) {
  background: #f1f5f9;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  color: #c2410c;
  font-size: 0.875em;
}

.dark .article-content :deep(p code),
.dark .article-content :deep(li code) {
  background: #334155;
  color: #fb923c;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.article-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.75;
}

.article-content :deep(ul li::marker) {
  color: #fb923c;
}

.article-content :deep(ol li::marker) {
  color: #fb923c;
  font-weight: 600;
}

.article-content :deep(img) {
  border-radius: 12px;
  margin: 1.5rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.article-content :deep(img:hover) {
  transform: scale(1.01);
}

.article-content :deep(a) {
  color: #ea580c;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.article-content :deep(a:hover) {
  border-bottom-color: #fb923c;
}

.article-content :deep(hr) {
  border: none;
  border-top: 2px dashed #f1f5f9;
  margin: 2.5rem 0;
}

.dark .article-content :deep(hr) {
  border-top-color: #374151;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.article-content :deep(th) {
  background: #f1f5f9;
  color: #1f2937;
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: left;
}

.dark .article-content :deep(th) {
  background: #4b5563;
  color: #f9fafb;
}

.article-content :deep(td) {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.dark .article-content :deep(td) {
  border-bottom-color: #374151;
}

.article-content :deep(tr:nth-child(even) td) {
  background: #fafafa;
}

.dark .article-content :deep(tr:nth-child(even) td) {
  background: #1e293b;
}

.article-content :deep(.anchor-link) {
  color: #fb923c;
  opacity: 0.5;
  transition: opacity 0.2s ease;
  margin-right: 0.5rem;
  text-decoration: none;
  font-weight: 400;
  font-size: 0.85em;
  vertical-align: middle;
}

.article-content :deep(.anchor-link:hover) {
  opacity: 1;
}
</style>
