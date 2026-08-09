<template>
  <NuxtLink :to="to" class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
    :class="isActive ? 'outline outline-2 outline-gray-900 dark:outline-gray-100 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-400 hover:text-gray-900 dark:hover:text-gray-100'">
    <Icon :name="icon" class="w-4 h-4" />
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  to: string
  label: string
  icon: string
}>()

const route = useRoute()
const isActive = computed(() => route.path === props.to)
</script>
