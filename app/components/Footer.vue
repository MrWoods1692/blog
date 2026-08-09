<template>
  <footer class="bg-white dark:bg-gray-900">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="text-center text-sm text-gray-400">
        <p>© {{ yearRange }} WoodsChen</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'

const { site } = useData()
const { lang } = useLang()
const currentYear = new Date().getFullYear()
const yearRange = computed(() => currentYear === 2026 ? '2026' : `2026-${currentYear}`)

const displayTitle = computed(() => lang.value === 'zh' ? site.titleZh : site.title)
const displayDesc = computed(() => lang.value === 'zh' ? site.descriptionZh : site.description)
const displayAuthor = computed(() => lang.value === 'zh' ? site.authorZh : site.author)
</script>
