<template>
  <div class="max-w-4xl mx-auto px-4 py-12">
    <!-- 页面标题 -->
    <div class="text-center mb-16">
      <h1 class="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
        {{ t('page.archive') }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-lg">{{ t('page.archiveDesc') }}</p>
      <div class="flex items-center justify-center gap-4 mt-6">
        <span class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
          <Icon name="lucide:file-text" class="w-3.5 h-3.5 inline mr-1" />
          {{ totalPosts }} {{ t('page.posts') }}
        </span>
        <span class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
          <Icon name="lucide:calendar" class="w-3.5 h-3.5 inline mr-1" />
          {{ archives.length }} {{ t('page.years') }}
        </span>
      </div>
    </div>

    <!-- 时间线 -->
    <div class="relative">
      <!-- 时间线竖线 -->
      <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700 rounded-full"></div>

      <div class="space-y-12">
        <div v-for="(archive, idx) in archives" :key="archive.year"
          class="relative pl-16 group">
          <!-- 时间线节点 -->
          <div class="absolute left-3 top-1 w-7 h-7 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-400 dark:border-gray-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon name="lucide:calendar" class="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </div>

          <!-- 年份标题 -->
          <h2 class="text-2xl font-bold mb-5 flex items-center gap-3">
            <span class="text-gray-900 dark:text-white">{{ archive.year }}</span>
            <span class="text-sm font-normal px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
              {{ archive.count }} {{ t('page.posts') }}
            </span>
          </h2>

          <!-- 文章列表 -->
          <div class="space-y-3">
            <NuxtLink v-for="post in filterByYear(archive.year)" :key="post.id"
              :to="`/posts/${post.id}`"
              class="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:shadow-gray-100 dark:hover:shadow-gray-900/20 transition-all duration-300 group/card">
              
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-900 dark:text-gray-100 group-hover/card:text-gray-700 dark:group-hover/card:text-gray-200 transition-colors truncate">
                  {{ displayTitle(post) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{{ displaySummary(post) }}</p>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <Icon name="lucide:calendar" class="w-3 h-3" />
                    {{ post.date }}
                  </span>
                </div>
              </div>
              <Icon name="lucide:arrow-right" class="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 group-hover/card:text-gray-600 dark:group-hover/card:text-gray-300 group-hover/card:translate-x-1 transition-all" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'

const { archives, filterByYear, totalPosts } = useData()
const { lang, t } = useLang()

const displayTitle = (post: any) => post.title
const displaySummary = (post: any) => post.summary

useHead({
  title: "Woods'Blog - 归档",
  meta: [
    { name: 'description', content: 'Woods\'Blog 文章归档，按年份浏览所有文章' },
    { property: 'og:title', content: "Woods'Blog - 归档" }
  ]
})
</script>
