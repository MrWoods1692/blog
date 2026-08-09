<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">{{ t('page.tags') }}</h1>
      <p class="text-gray-500 dark:text-gray-400">{{ t('page.tagsDesc') }}</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <NuxtLink v-for="tag in allTags" :key="tag.name" :to="`/tags/${tag.name}`"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-800 dark:hover:bg-gray-700 dark:hover:text-white dark:hover:border-gray-600 transition-colors group">
        <Icon name="lucide:tag" class="w-4 h-4" />
        <span class="font-medium">{{ tag.name }}</span>
        <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-700 dark:group-hover:bg-gray-600 group-hover:text-white dark:group-hover:text-white transition-colors">{{ tag.count }}</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'

const { allTags } = useData()
const { t } = useLang()

useHead({
  title: "Woods'Blog - 标签",
  meta: [
    { name: 'description', content: 'Woods\'Blog 标签云，按标签浏览文章' },
    { property: 'og:title', content: "Woods'Blog - 标签" }
  ]
})
</script>
