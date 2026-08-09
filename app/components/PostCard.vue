<template>
  <article class="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-600 transition-all group">
    <NuxtLink :to="`/posts/${post.id}`" class="block">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-500 dark:group-hover:text-white transition-colors mb-2">
        {{ displayTitle }}
      </h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{{ displaySummary }}</p>
    </NuxtLink>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 text-xs text-gray-400">
        <span class="flex items-center gap-1">
          <Icon name="lucide:calendar" class="w-3 h-3" />
          {{ post.date }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="lucide:clock" class="w-3 h-3" />
          {{ displayReadTime }}
        </span>
        <span class="flex items-center gap-1">
          <Icon name="lucide:folder" class="w-3 h-3" />
          {{ displayCategory }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 md:flex-wrap">
        <NuxtLink v-for="tag in displayTags" :key="tag" :to="`/tags/${tag}`"
          class="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors hidden md:inline-block">
          {{ tag }}
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLang } from '~/composables/useLang'

const props = defineProps<{
  post: {
    id: string
    title: string
    summary: string
    date: string
    tags: string[]
    category: string
    readTime: string
  }
}>()

const { lang } = useLang()

const displayTitle = computed(() => props.post.title)
const displaySummary = computed(() => props.post.summary)
const displayTags = computed(() => props.post.tags)
const displayCategory = computed(() => props.post.category)
const displayReadTime = computed(() => props.post.readTime)
</script>
