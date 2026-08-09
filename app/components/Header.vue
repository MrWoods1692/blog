<template>
  <header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <img :src="'/logo_light.png'" alt="Logo" class="w-8 h-8 dark:hidden" />
          <img :src="'/logo_dark.png'" alt="Logo" class="w-8 h-8 hidden dark:block" />
          <span class="hidden md:inline">{{ siteTitle }}</span>
          <span class="md:hidden">Blog</span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-1">
          <NavLink to="/" :label="t('nav.home')" :icon="'i-lucide-home'" />
          <NavLink to="/archive" :label="t('nav.archive')" :icon="'i-lucide-archive'" />
          <NavLink to="/tags" :label="t('nav.tags')" :icon="'i-lucide-tags'" />
          <NuxtLink to="/moments" class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === '/moments' ? 'outline outline-2 outline-gray-900 dark:outline-gray-100 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-400 hover:text-gray-900 dark:hover:text-gray-100'">
            <svg viewBox="0 0 1024 1024" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M780.7 451.8c-12.1-15.4-23.3-30.4-35.2-44.7-66-78.8-140.6-147.7-230.1-199.1-50.3-28.8-103.5-51-160.7-61.4-31.7-5.7-63.9-7.1-94.9 3.3-45.6 15.3-75.4 46.6-86.5 93.9-8.5 36.2-3.9 72.1 5 107.5 19.2 76.6 55.4 144.9 102.5 207.6 62.3 82.9 135.9 154 222.5 211.1 56.9 37.4 118.1 65.6 185.2 79.5 32.9 6.8 65.9 9 98.9-0.2 50.4-14.3 86.5-56.9 92.6-109.2 4.7-40.1-2.1-78.9-13.8-116.9-5.7-18.6-13.1-36.6-20-54.8-1.2-3.2-1.1-5.3 0.8-8 4.6-6.6 8.9-13.2 14.2-21.1 9 19.4 18.1 37.8 26.1 56.5 16.7 39.1 30 79.3 36.6 121.6 5.4 34.1 6.9 68-3.5 101.3-19 60.5-60.7 95.5-122.7 106.4-27.7 4.9-55.5 3-83.1-1.9-81.9-14.5-156-48.1-225.2-93C378.1 757.9 285.5 666 209.1 558c-45.9-64.8-80.5-135.5-101-212.6-7.1-26.7-11.6-53.7-11.8-81.3-0.4-41.9 8.5-80.9 36.8-113.5 27.5-31.8 62.4-48.9 104.1-52.9 44.8-4.3 88.1 4 130.7 17 87.6 26.8 164.7 72.7 236.2 128.6 50.8 39.8 97 84.5 139.9 132.6 14.9 16.7 28.6 34.5 43 51.7 2.3 2.8 2.6 5.1 0.9 8.3-2.4 4.9-4.6 10.1-7.2 15.9z" fill="currentColor"/>
              <path d="M539.4 163.2c20.6-9.6 39.9-19.4 59.7-27.9 35.2-15 71.4-26.9 109.1-33.7 37.6-6.8 75.4-9.1 112.4 2.6 51.5 16.3 85.1 51.1 100.2 103.1 9.5 32.6 8.5 65.9 3 99.1-11.2 68.1-36.9 130.8-70.5 190.7-36.3 64.7-81.9 122.2-132.5 176.1-38.2 40.7-79.6 77.9-123.1 112.9-3.5 2.8-6.2 3.4-10.3 1.3-15.9-8.2-32.1-15.9-48.1-23.9-1.2-0.6-2.2-1.4-3.7-2.3 12.2-9.1 24.1-17.7 35.7-26.8 81.9-64.6 153-139.4 208.4-228.1 32.3-51.8 56.9-107.2 69.2-167.6 7-34.9 10.1-69.9-0.6-104.6-11.6-37.6-35.8-64.1-71.8-79.9-24-10.5-49.3-12.4-75-11-46.4 2.5-89.7 17.1-131.9 34.9-3.7 1.5-6.3 1.5-9.5-0.8-6.4-4.6-12.7-8.7-20.7-14.1z" fill="currentColor"/>
              <path d="M687.1 420.9c-12.4 9.6-24.1 18.6-35.9 27.6-20.8 16-41.7 32.1-62.7 48-3.7 2.8-4.9 5.1-3.5 10.1 11.6 38 22.7 76.1 33.9 114.2 0.5 1.4 0.7 2.9 1.4 5.7-9.1-6.3-17.3-11.8-25.4-17.4-26.1-18-52.3-36-78.4-54.2-3.3-2.3-5.4-2.1-8.7 0.1-31.5 21.9-63.2 43.6-94.8 65.4-2.6 1.8-5.2 3.5-9 6.1 0.9-3.6 1.4-6 2.1-8.2 11.1-37.4 22.2-75 33.5-112.5 1.3-4.1 0.5-6.2-2.8-8.7-31.8-24.2-63.4-48.6-95.2-72.9-1.2-0.9-2.3-2-3.3-4.6 8.5 0 17 0.1 25.5 0 33.5-0.7 67.1-1.6 100.5-2.2 4.1-0.1 4.7-2.5 5.6-5.1 13.2-37.4 26.5-74.9 39.7-112.3 0.6-1.6 1.2-3.3 2.3-6.6 1.2 3 2 4.9 2.6 6.7 13.2 37.2 26.5 74.4 39.4 111.8 1.5 4.2 3.3 5.5 7.7 5.6 40.7 0.8 81.5 1.9 122.2 2.8 1 0 1.5 0.1 3.3 0.6zM483.9 860.9c-10.9 5.4-21.4 10.6-32.2 15.7-43.3 20.4-87.9 36.7-135.2 45.5-33.8 6.3-67.7 8.7-101.5 0.7-62.3-14.5-105.9-61.3-116-124.4-7-43.9-0.8-86.6 11.4-128.7 12.5-43.3 29.3-85 50.7-124.6 0.8-1.5 1.6-2.9 2.8-5 5.2 7.8 10.2 15 14.6 22.5 0.8 1.5 0.1 4.3-0.7 6.3-12.1 28.6-22.4 57.7-28.9 88-6.8 31.5-9.4 63.2-2.6 95.1 11.7 55.2 55.7 95 112.1 101.8 34.4 4.2 68.1-0.5 101.1-9.9 21.1-6 41.7-13.9 62.4-21.4 4-1.4 6.6-1.2 10.1 1.3 16.8 12.4 34.1 24.4 51.9 37.1zM243.7 452c-3-6.8-6-12.9-8.2-19.2-0.6-1.5 1.2-4.3 2.5-6 23.4-27.4 46.1-55.5 70.8-81.8 44.2-47 92.4-90 145-127.7 6.9-4.9 12.6-7.3 20.1-2 3.4 2.5 7.7 3.7 12.2 5.7-95.6 61.6-174.7 139.7-242.4 231z" fill="currentColor"/>
            </svg>
            <span>{{ t('nav.moments') }}</span>
          </NuxtLink>
          <NavLink to="/search" :label="t('nav.search')" :icon="'i-lucide-search'" />
        </nav>

        <!-- Right Actions -->
        <div class="flex items-center gap-2">
          <!-- Language Toggle -->
          <button @click="toggleLang()" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" :title="t('nav.toggleLang')">
            <svg v-if="lang === 'zh'" viewBox="0 0 1024 1024" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M160 144a32 32 0 0 0-32 32V864a32 32 0 0 0 32 32h688a32 32 0 0 0 32-32V176a32 32 0 0 0-32-32H160z m0-64h688a96 96 0 0 1 96 96V864a96 96 0 0 1-96 96H160a96 96 0 0 1-96-96V176a96 96 0 0 1 96-96z" fill="currentColor"/>
              <path d="M482.176 262.272h59.616v94.4h196v239.072h-196v184.416h-59.616v-184.416H286.72v-239.04h195.456V262.24z m-137.504 277.152h137.504v-126.4H344.64v126.4z m197.12 0h138.048v-126.4H541.76v126.4z" fill="currentColor"/>
            </svg>
            <svg v-else viewBox="0 0 1024 1024" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M229.248 704V337.504h271.744v61.984h-197.76v81.28h184v61.76h-184v99.712h204.768V704h-278.72z m550.496 0h-70.24v-135.488c0-28.672-1.504-47.232-4.48-55.648a39.04 39.04 0 0 0-14.656-19.616 41.792 41.792 0 0 0-24.384-7.008c-12.16 0-23.04 3.328-32.736 10.016-9.664 6.656-16.32 15.488-19.872 26.496-3.584 11.008-5.376 31.36-5.376 60.992V704h-70.24v-265.504h65.248v39.008c23.168-30.016 52.32-44.992 87.488-44.992 15.52 0 29.664 2.784 42.496 8.352 12.832 5.6 22.56 12.704 29.12 21.376 6.592 8.672 11.2 18.496 13.76 29.504 2.56 11.008 3.872 26.752 3.872 47.264V704z" fill="currentColor"/>
              <path d="M160 144a32 32 0 0 0-32 32V864a32 32 0 0 0 32 32h688a32 32 0 0 0 32-32V176a32 32 0 0 0-32-32H160z m0-64h688a96 96 0 0 1 96 96V864a96 96 0 0 1-96 96H160a96 96 0 0 1-96-96V176a96 96 0 0 1 96-96z" fill="currentColor"/>
            </svg>
          </button>

          <!-- Dark Mode Toggle -->
          <button @click="toggleDark" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" :title="t('nav.toggleTheme')">
            <Icon :name="isDark ? 'lucide:sun' : 'lucide:moon'" class="w-5 h-5" />
          </button>

          <!-- Mobile Menu -->
          <button @click="showMobile = !showMobile" class="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Icon :name="showMobile ? 'lucide:x' : 'lucide:menu'" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Mobile Nav -->
      <div v-if="showMobile" class="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800 pt-2">
        <nav class="flex flex-col gap-1">
          <NavLink to="/" :label="t('nav.home')" :icon="'i-lucide-home'" @click="showMobile = false" />
          <NavLink to="/archive" :label="t('nav.archive')" :icon="'i-lucide-archive'" @click="showMobile = false" />
          <NavLink to="/tags" :label="t('nav.tags')" :icon="'i-lucide-tags'" @click="showMobile = false" />
          <NuxtLink to="/moments" class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="route.path === '/moments' ? 'outline outline-2 outline-gray-900 dark:outline-gray-100 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 hover:outline hover:outline-2 hover:outline-gray-300 dark:hover:outline-gray-400 hover:text-gray-900 dark:hover:text-gray-100'"
            @click="showMobile = false">
            <svg viewBox="0 0 1024 1024" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M780.7 451.8c-12.1-15.4-23.3-30.4-35.2-44.7-66-78.8-140.6-147.7-230.1-199.1-50.3-28.8-103.5-51-160.7-61.4-31.7-5.7-63.9-7.1-94.9 3.3-45.6 15.3-75.4 46.6-86.5 93.9-8.5 36.2-3.9 72.1 5 107.5 19.2 76.6 55.4 144.9 102.5 207.6 62.3 82.9 135.9 154 222.5 211.1 56.9 37.4 118.1 65.6 185.2 79.5 32.9 6.8 65.9 9 98.9-0.2 50.4-14.3 86.5-56.9 92.6-109.2 4.7-40.1-2.1-78.9-13.8-116.9-5.7-18.6-13.1-36.6-20-54.8-1.2-3.2-1.1-5.3 0.8-8 4.6-6.6 8.9-13.2 14.2-21.1 9 19.4 18.1 37.8 26.1 56.5 16.7 39.1 30 79.3 36.6 121.6 5.4 34.1 6.9 68-3.5 101.3-19 60.5-60.7 95.5-122.7 106.4-27.7 4.9-55.5 3-83.1-1.9-81.9-14.5-156-48.1-225.2-93C378.1 757.9 285.5 666 209.1 558c-45.9-64.8-80.5-135.5-101-212.6-7.1-26.7-11.6-53.7-11.8-81.3-0.4-41.9 8.5-80.9 36.8-113.5 27.5-31.8 62.4-48.9 104.1-52.9 44.8-4.3 88.1 4 130.7 17 87.6 26.8 164.7 72.7 236.2 128.6 50.8 39.8 97 84.5 139.9 132.6 14.9 16.7 28.6 34.5 43 51.7 2.3 2.8 2.6 5.1 0.9 8.3-2.4 4.9-4.6 10.1-7.2 15.9z" fill="currentColor"/>
              <path d="M539.4 163.2c20.6-9.6 39.9-19.4 59.7-27.9 35.2-15 71.4-26.9 109.1-33.7 37.6-6.8 75.4-9.1 112.4 2.6 51.5 16.3 85.1 51.1 100.2 103.1 9.5 32.6 8.5 65.9 3 99.1-11.2 68.1-36.9 130.8-70.5 190.7-36.3 64.7-81.9 122.2-132.5 176.1-38.2 40.7-79.6 77.9-123.1 112.9-3.5 2.8-6.2 3.4-10.3 1.3-15.9-8.2-32.1-15.9-48.1-23.9-1.2-0.6-2.2-1.4-3.7-2.3 12.2-9.1 24.1-17.7 35.7-26.8 81.9-64.6 153-139.4 208.4-228.1 32.3-51.8 56.9-107.2 69.2-167.6 7-34.9 10.1-69.9-0.6-104.6-11.6-37.6-35.8-64.1-71.8-79.9-24-10.5-49.3-12.4-75-11-46.4 2.5-89.7 17.1-131.9 34.9-3.7 1.5-6.3 1.5-9.5-0.8-6.4-4.6-12.7-8.7-20.7-14.1z" fill="currentColor"/>
              <path d="M687.1 420.9c-12.4 9.6-24.1 18.6-35.9 27.6-20.8 16-41.7 32.1-62.7 48-3.7 2.8-4.9 5.1-3.5 10.1 11.6 38 22.7 76.1 33.9 114.2 0.5 1.4 0.7 2.9 1.4 5.7-9.1-6.3-17.3-11.8-25.4-17.4-26.1-18-52.3-36-78.4-54.2-3.3-2.3-5.4-2.1-8.7 0.1-31.5 21.9-63.2 43.6-94.8 65.4-2.6 1.8-5.2 3.5-9 6.1 0.9-3.6 1.4-6 2.1-8.2 11.1-37.4 22.2-75 33.5-112.5 1.3-4.1 0.5-6.2-2.8-8.7-31.8-24.2-63.4-48.6-95.2-72.9-1.2-0.9-2.3-2-3.3-4.6 8.5 0 17 0.1 25.5 0 33.5-0.7 67.1-1.6 100.5-2.2 4.1-0.1 4.7-2.5 5.6-5.1 13.2-37.4 26.5-74.9 39.7-112.3 0.6-1.6 1.2-3.3 2.3-6.6 1.2 3 2 4.9 2.6 6.7 13.2 37.2 26.5 74.4 39.4 111.8 1.5 4.2 3.3 5.5 7.7 5.6 40.7 0.8 81.5 1.9 122.2 2.8 1 0 1.5 0.1 3.3 0.6zM483.9 860.9c-10.9 5.4-21.4 10.6-32.2 15.7-43.3 20.4-87.9 36.7-135.2 45.5-33.8 6.3-67.7 8.7-101.5 0.7-62.3-14.5-105.9-61.3-116-124.4-7-43.9-0.8-86.6 11.4-128.7 12.5-43.3 29.3-85 50.7-124.6 0.8-1.5 1.6-2.9 2.8-5 5.2 7.8 10.2 15 14.6 22.5 0.8 1.5 0.1 4.3-0.7 6.3-12.1 28.6-22.4 57.7-28.9 88-6.8 31.5-9.4 63.2-2.6 95.1 11.7 55.2 55.7 95 112.1 101.8 34.4 4.2 68.1-0.5 101.1-9.9 21.1-6 41.7-13.9 62.4-21.4 4-1.4 6.6-1.2 10.1 1.3 16.8 12.4 34.1 24.4 51.9 37.1zM243.7 452c-3-6.8-6-12.9-8.2-19.2-0.6-1.5 1.2-4.3 2.5-6 23.4-27.4 46.1-55.5 70.8-81.8 44.2-47 92.4-90 145-127.7 6.9-4.9 12.6-7.3 20.1-2 3.4 2.5 7.7 3.7 12.2 5.7-95.6 61.6-174.7 139.7-242.4 231z" fill="currentColor"/>
            </svg>
            <span>{{ t('nav.moments') }}</span>
          </NuxtLink>
          <NavLink to="/search" :label="t('nav.search')" :icon="'i-lucide-search'" @click="showMobile = false" />
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useData } from '~/composables/useData'
import { useDark } from '~/composables/useDark'
import { useLang } from '~/composables/useLang'
import NavLink from '~/components/NavLink.vue'

const route = useRoute()

const { site } = useData()
const { isDark, toggleDark } = useDark()
const { lang, toggleLang, t } = useLang()
const showMobile = ref(false)

const siteTitle = computed(() => lang.value === 'zh' ? site.titleZh : site.title)

// Cmd/Ctrl+K 快捷键打开搜索
onMounted(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      navigateTo('/search')
    }
  }
  document.addEventListener('keydown', handler)
})
</script>
