<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="relative mb-8">
      <Icon name="lucide:search" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="t('search.placeholder')"
        class="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-gray-500 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-500/20 transition-all"
        @keydown.escape="close"
      />
      <kbd class="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <Icon name="lucide:command" class="w-3 h-3" />
        K
      </kbd>
    </div>

    <div v-if="query.trim()" class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('search.resultCount') }}
        <span class="font-semibold text-gray-900 dark:text-gray-100">{{ results.length }}</span>
        {{ t('page.posts') }}
      </p>
      <button @click="query = ''" class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
        {{ t('search.clear') }}
      </button>
    </div>

    <div v-if="query.trim() && results.length > 0" class="space-y-4">
      <PostCard v-for="post in results" :key="post.id" :post="post" />
    </div>

    <div v-if="query.trim() && results.length === 0" class="text-center py-16 text-gray-400">
      <Icon name="lucide:search-x" class="w-12 h-12 mx-auto mb-3" />
      <p class="text-lg font-medium">{{ t('search.noResults') }}</p>
      <p class="text-sm mt-1">{{ t('search.tryOther') }}</p>
    </div>

    <div v-if="!query.trim()" class="text-center py-16 text-gray-400">
      <Icon name="lucide:search" class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p class="text-lg font-medium">{{ t('search.startSearch') }}</p>
      <p class="text-sm mt-1">{{ t('search.hint') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'
import PostCard from '~/components/PostCard.vue'

const { searchPosts } = useData()
const { lang, t } = useLang()
const query = ref('')
const results = ref<any[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

watch(query, (val) => {
  results.value = searchPosts(val)
})

const close = () => {
  navigateTo('/')
}

onMounted(() => {
  nextTick(() => {
    inputRef.value?.focus()
  })
})

useHead({
  title: "Woods'Blog - 搜索",
  meta: [
    { name: 'description', content: 'Woods\'Blog 站内搜索' },
    { property: 'og:title', content: "Woods'Blog - 搜索" }
  ]
})
</script>
