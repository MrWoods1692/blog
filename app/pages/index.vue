<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="text-center mb-12">
      <p class="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
        {{ siteDesc }}
      </p>
    </div>

    <div class="space-y-4">
      <PostCard v-for="post in paginatedPosts" :key="post.id" :post="post" />
    </div>

    <div v-if="posts.length === 0" class="text-center py-12 text-gray-400">
      <Icon name="lucide:file-x" class="w-12 h-12 mx-auto mb-3" />
      <p>No posts yet</p>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-12">
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
        class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800">
        <Icon name="lucide:chevron-left" class="w-4 h-4" />
      </button>

      <template v-for="page in displayPages" :key="page">
        <span v-if="page === '...'" class="px-3 py-1.5 text-sm text-gray-400">…</span>
        <NuxtLink v-else :to="`/?page=${page}`"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          :class="page === currentPage ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'">
          {{ page }}
        </NuxtLink>
      </template>

      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
        class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800">
        <Icon name="lucide:chevron-right" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'
import PostCard from '~/components/PostCard.vue'

const route = useRoute()
const { site, posts, postPagePosts, postTotalPages, loadPostsPage } = useData()
const { lang } = useLang()

const siteDesc = computed(() => lang.value === 'zh' ? site.descriptionZh : site.description)

// 分页由 index_*.json 索引文件驱动：第 1 页 = 编号最大的文件（最新一页）
const currentPage = ref(parseInt(route.query.page as string) || 1)
const totalPages = computed(() => postTotalPages.value)
const paginatedPosts = computed(() => postPagePosts.value)

const displayPages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  navigateTo(`/?page=${page}`, { replace: true })
}

// 监听路由页码和语言变化，重新加载分页文章
watch([() => route.query.page, lang], () => {
  currentPage.value = parseInt(route.query.page as string) || 1
  loadPostsPage(currentPage.value)
}, { immediate: true })

useHead({
  title: "Woods'Blog",
  meta: [
    { name: 'description', content: siteDesc.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: "Woods'Blog" },
    { property: 'og:description', content: siteDesc.value }
  ]
})
</script>
