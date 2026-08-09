<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="space-y-4">
      <div v-for="moment in sortedMoments" :key="moment.id"
        class="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between gap-4">
          <p class="flex-1 text-gray-800 dark:text-gray-200">{{ moment.content }}</p>
        </div>
        <div v-if="moment.images && moment.images.length > 0" class="grid gap-2 mt-3" :class="moment.images.length === 1 ? 'grid-cols-1 max-w-sm' : moment.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'">
          <button v-for="(img, idx) in moment.images" :key="idx" @click="openImage(img)" class="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
            <img :src="img" :alt="`Moment ${moment.id} image ${idx + 1}`" class="w-full h-full object-cover" loading="lazy" />
          </button>
        </div>
        <div class="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <Icon name="lucide:clock" class="w-3 h-3" />
          <span>{{ moment.date }}</span>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="momentsTotalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage <= 1"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        :class="currentPage <= 1 ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'">
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
      </button>
      <button v-for="p in displayPages" :key="p.label" @click="p.value && goToPage(p.value)"
        class="w-9 h-9 rounded-lg text-sm font-medium transition-colors"
        :class="p.value === currentPage ? 'bg-blue-500 text-white' : p.value === null ? 'text-gray-400 cursor-default' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'">
        {{ p.label }}
      </button>
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage >= momentsTotalPages"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        :class="currentPage >= momentsTotalPages ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'">
        <Icon name="lucide:chevron-right" class="w-4 h-4" />
      </button>
    </div>

    <ImageViewer v-model:show="showViewer" :src="viewerSrc" :alt="viewerAlt" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'
import ImageViewer from '~/components/ImageViewer.vue'

const route = useRoute()
const { moments, momentsTotalPages, loadMoments } = useData()
const { lang, t } = useLang()

const currentPage = ref(parseInt(route.query.page as string) || 1)

const sortedMoments = computed(() => [...moments.value].sort((a, b) => b.date.localeCompare(a.date)))

const displayPages = computed(() => {
  const pages: { label: string | number; value: number | null }[] = []
  const total = momentsTotalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push({ label: i, value: i })
    return pages
  }

  pages.push({ label: 1, value: 1 })

  if (current > 3) pages.push({ label: '...', value: null })

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push({ label: i, value: i })

  if (current < total - 2) pages.push({ label: '...', value: null })

  pages.push({ label: total, value: total })
  return pages
})

const goToPage = (page: number) => {
  if (page < 1 || page > momentsTotalPages.value) return
  currentPage.value = page
  navigateTo({ path: '/moments', query: { page: String(page) } })
}

const showViewer = ref(false)
const viewerSrc = ref('')
const viewerAlt = ref('')

const openImage = (src: string) => {
  viewerSrc.value = src
  viewerAlt.value = ''
  showViewer.value = true
}

// 监听路由和语言变化，重新加载说说
watch([() => route.query.page, lang], () => {
  const page = parseInt(route.query.page as string) || 1
  currentPage.value = page
  loadMoments(page)
}, { immediate: true })

useHead({
  title: "Woods'Blog - 说说",
  meta: [
    { name: 'description', content: 'Woods\'Blog 说说，日常记录与感悟' },
    { property: 'og:title', content: "Woods'Blog - 说说" }
  ]
})
</script>
