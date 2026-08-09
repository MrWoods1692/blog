<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2 flex items-center gap-2">
        <Icon name="lucide:tag" class="w-7 h-7 text-blue-500" />
        {{ route.params.tag }}
      </h1>
      <p class="text-gray-500 dark:text-gray-400">
        {{ t('page.tagCount') }} {{ filteredPosts.length }} {{ t('page.posts') }}
      </p>
    </div>

    <div class="space-y-4">
      <PostCard v-for="post in filteredPosts" :key="post.id" :post="post" />
    </div>

    <div v-if="filteredPosts.length === 0" class="text-center py-12 text-gray-400">
      <Icon name="lucide:tag" class="w-12 h-12 mx-auto mb-3" />
      <p>{{ t('page.noTagPosts') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useData } from '~/composables/useData'
import { useLang } from '~/composables/useLang'
import PostCard from '~/components/PostCard.vue'

const route = useRoute()
const { filterByTag } = useData()
const { t } = useLang()
const filteredPosts = computed(() => filterByTag(route.params.tag as string))

useHead({
  title: computed(() => `${route.params.tag} - Woods'Blog`),
  meta: [
    { name: 'description', content: computed(() => `Woods'Blog 标签 ${route.params.tag} 下的所有文章`) },
    { property: 'og:title', content: computed(() => `${route.params.tag} - Woods'Blog`) }
  ]
})
</script>
