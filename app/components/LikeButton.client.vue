<template>
  <button @click="toggleLike"
    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 transition-colors"
    :class="liked ? 'text-red-500 border-red-300 dark:border-red-700' : 'text-gray-500 dark:text-gray-400'">
    <Icon :name="liked ? 'lucide:heart' : 'lucide:heart'" class="w-5 h-5" :class="{ 'fill-red-500': liked }" />
    <span class="font-medium">{{ likeCount + (liked ? 1 : 0) }}</span>
  </button>
</template>

<script setup lang="ts">
import { useLike } from '~/utils/useLike'

const props = defineProps<{ postId: string }>()
const { liked, likeCount, toggleLike } = useLike(props.postId)
</script>