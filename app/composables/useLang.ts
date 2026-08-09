import { ref, computed, watch } from 'vue'

type Lang = 'en' | 'zh'

export const useLang = () => {
  const lang = useState<Lang>('blog-lang', () => 'en')

  const isZh = computed(() => lang.value === 'zh')
  const isEn = computed(() => lang.value === 'en')

  const toggleLang = () => {
    lang.value = lang.value === 'zh' ? 'en' : 'zh'
  }

  const setLang = (l: Lang) => {
    lang.value = l
  }

  // 翻译函数 - 使用点号分隔的键
  const t = (key: string): string => {
    const dict: Record<Lang, Record<string, string>> = {
      en: {
        'nav.home': 'Home',
        'nav.archive': 'Archive',
        'nav.tags': 'Tags',
        'nav.moments': 'Moments',
        'nav.about': 'About',
        'nav.search': 'Search',
        'nav.toggleLang': 'Toggle Language',
        'nav.toggleTheme': 'Toggle Theme',
        'page.all': 'All',
        'page.posts': 'posts',
        'page.tags': 'Tags',
        'page.moments': 'Moments',
        'page.about': 'About',
        'page.archive': 'Archive',
        'page.archiveDesc': 'Browse posts by year',
        'page.years': 'years',
        'page.tagsDesc': 'Browse posts by tag',
        'page.momentsDesc': 'Short daily notes',
        'page.aboutDesc': 'About this blog',
        'page.noPosts': 'No posts yet',
        'page.noTagPosts': 'No posts with this tag',
        'page.tagCount': 'Total',
        'page.comments': 'Comments',
        'article.aiSummary': 'AI Summary',
        'article.skipAnimation': 'Skip animation',
        'article.toc': 'Table of Contents',
        'image.rotateLeft': 'Rotate Left',
        'image.rotateRight': 'Rotate Right',
        'image.zoomIn': 'Zoom In',
        'image.zoomOut': 'Zoom Out',
        'image.reset': 'Reset',
        'image.download': 'Download',
        'image.copyLink': 'Copy Link',
        'image.copyImage': 'Copy Image',
        'image.close': 'Close',
        'image.hint': 'Scroll to zoom · Drag to move · Double-click to reset',
        'search.placeholder': 'Search posts, tags...',
        'search.noResults': 'No posts found',
        'search.startSearch': 'Type to search',
        'search.resultCount': 'Found',
        'search.clear': 'Clear',
        'search.tryOther': 'Try different keywords',
        'search.hint': 'Search by title, summary, or tags',
        'page.search': 'Search',
        'page.searchDesc': 'Search all posts by keyword',
        'comments.loading': 'Loading comments...',
        'comments.disabled': 'Comments are not configured',
        'comments.error': 'Failed to load comments',
        'comments.installHint': 'Please install the Utterances GitHub App on this repository',
        'share.title': 'Share',
        'share.twitter': 'Share to Twitter',
        'share.weibo': 'Share to Weibo',
        'share.facebook': 'Share to Facebook',
        'share.linkedin': 'Share to LinkedIn',
        'share.telegram': 'Share to Telegram',
        'share.qqspace': 'Share to QQ Space',
        'share.copyLink': 'Copy Link',
        'share.copied': 'Link copied to clipboard',
        'share.copyFailed': 'Copy failed, please copy manually',
        'stats.totalWords': 'Total Words',
        'stats.totalPosts': 'Total Posts',
        'stats.totalTags': 'Total Tags',
        'stats.totalReadTime': 'Total Read Time',
        'stats.words': 'words',
        'stats.posts': 'posts',
        'stats.tags': 'tags',
        'stats.minutes': 'min'
      },
      zh: {
        'nav.home': '首页',
        'nav.archive': '归档',
        'nav.tags': '标签',
        'nav.moments': '说说',
        'nav.about': '关于',
        'nav.search': '搜索',
        'nav.toggleLang': '切换语言',
        'nav.toggleTheme': '切换主题',
        'page.all': '全部',
        'page.posts': '篇',
        'page.tags': '标签',
        'page.moments': '说说',
        'page.about': '关于',
        'page.archive': '归档',
        'page.archiveDesc': '按年份查看文章',
        'page.years': '年',
        'page.tagsDesc': '按标签浏览文章',
        'page.momentsDesc': '简短的日常记录',
        'page.aboutDesc': '关于这个博客',
        'page.noPosts': '暂无文章',
        'page.noTagPosts': '暂无该标签的文章',
        'page.tagCount': '共',
        'page.comments': '评论',
        'article.aiSummary': 'AI 摘要',
        'article.skipAnimation': '跳过动画',
        'article.toc': '目录',
        'image.rotateLeft': '向左旋转',
        'image.rotateRight': '向右旋转',
        'image.zoomIn': '放大',
        'image.zoomOut': '缩小',
        'image.reset': '重置',
        'image.download': '下载',
        'image.copyLink': '复制链接',
        'image.copyImage': '复制图片',
        'image.close': '关闭',
        'image.hint': '滚轮缩放 · 拖拽移动 · 双击重置',
        'search.placeholder': '搜索文章、标签...',
        'search.noResults': '没有找到相关文章',
        'search.startSearch': '输入关键词开始搜索',
        'search.resultCount': '找到',
        'search.clear': '清空',
        'search.tryOther': '试试其他关键词',
        'search.hint': '支持搜索标题、摘要和标签',
        'page.search': '搜索',
        'page.searchDesc': '搜索所有文章',
        'comments.loading': '加载评论中...',
        'comments.disabled': '评论功能未配置',
        'comments.error': '评论加载失败',
        'comments.installHint': '请先在此仓库安装 Utterances GitHub App',
        'share.title': '分享',
        'share.twitter': '分享到 Twitter',
        'share.weibo': '分享到微博',
        'share.facebook': '分享到 Facebook',
        'share.linkedin': '分享到 LinkedIn',
        'share.telegram': '分享到 Telegram',
        'share.qqspace': '分享到QQ空间',
        'share.copyLink': '复制链接',
        'share.copied': '链接已复制到剪贴板',
        'share.copyFailed': '复制失败，请手动复制',
        'stats.totalWords': '总字数',
        'stats.totalPosts': '总文章数',
        'stats.totalTags': '总标签数',
        'stats.totalReadTime': '总阅读时间',
        'stats.words': '字',
        'stats.posts': '篇',
        'stats.tags': '个',
        'stats.minutes': '分钟'
      }
    }
    return dict[lang.value]?.[key] || key
  }

  // 持久化语言设置
  watch(lang, (newLang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('blog-lang', newLang)
      document.documentElement.lang = newLang
    }
  }, { immediate: true })

  // 初始化时读取本地存储
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('blog-lang')
    if (saved === 'zh' || saved === 'en') {
      lang.value = saved
    }
  }

  return {
    lang,
    isZh,
    isEn,
    toggleLang,
    setLang,
    t
  }
}
