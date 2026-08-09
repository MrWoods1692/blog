<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" @click.self="close">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />
    <div class="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <Icon name="lucide:search" class="w-5 h-5 text-gray-400" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          :placeholder="t('search.placeholder')"
          class="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          @keydown.escape="close"
        />
        <button @click="close" class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <Icon name="lucide:x" class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div class="max-h-[60vh] overflow-y-auto">
        <div v-if="query.trim() && results.length === 0" class="p-8 text-center text-gray-400">
          <Icon name="lucide:search-x" class="w-8 h-8 mx-auto mb-2" />
          <p>{{ t('search.noResults') }}</p>
        </div>

        <div v-else-if="!query.trim()" class="p-8 text-center text-gray-400">
          <p>{{ t('search.startSearch') }}</p>
        </div>

        <NuxtLink v-for="post in results" :key="post.id" :to="`/posts/${post.id}`"
          class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800"
          @click="close">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 dark:text-gray-100 truncate">{{ displayTitle(post) }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{{ displaySummary(post) }}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-xs text-gray-400">{{ post.date }}</span>
              <span class="text-xs text-gray-300 dark:text-gray-600">·</span>
              <span v-for="tag in displayTags(post).slice(0, 2)" :key="tag" class="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                {{ tag }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits(['update:modelValue'])

const { searchPosts } = useData()
const { lang, t } = useLang()
const query = ref('')
const results = ref<any[]>([])
const inputRef = ref<HTMLInputElement | null>(null)

const displayTitle = (post: any) => post.title
const displaySummary = (post: any) => post.summary
const displayTags = (post: any) => post.tags

watch(() => props.modelValue, async (val) => {
  if (val) {
    await nextTick()
    inputRef.value?.focus()
  } else {
    query.value = ''
    results.value = []
  }
})

watch(query, (val) => {
  results.value = searchPosts(val)
})

const close = () => {
  emit('update:modelValue', false)
}
</script>
