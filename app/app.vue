<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
onMounted(() => {
  if (process.client) {
    const styles = {
      title: 'font-size: 28px; font-weight: bold; color: #fb7e03;',
      subtitle: 'font-size: 14px; color: #6b7280;',
      line: 'font-size: 12px; color: #d1d5db; letter-spacing: 2px;',
      heart: 'color: #fb7e03;',
      info: 'font-size: 12px; color: #9ca3af;'
    }

    console.log(
      `%c${'╔══════════════════════════════════════╗'}`, styles.line
    )
    console.log(
      `%c${'║'}  %cWoods' Blog%c${'  ║'}`,
      styles.line, styles.title, styles.line
    )
    console.log(
      `%c${'║'}  %c${'🌐'} %cA static blog built with Nuxt 3%c${'  ║'}`,
      styles.line, styles.heart, styles.subtitle, styles.line
    )
    console.log(
      `%c${'╚══════════════════════════════════════╝'}`, styles.line
    )
    console.log(
      `%c${'──────────────────────────────────────'}`, styles.line
    )
    console.log(
      `%c${'📦'} %cTech Stack%c: Nuxt 3 · Vue 3 · Tailwind CSS`,
      styles.heart, styles.subtitle
    )
    console.log(
      `%c${'🚀'} %cDeployed on%c: Cloudflare Pages`,
      styles.heart, styles.subtitle
    )
    console.log(
      `%c${'🔗'} %cSource%c: github.com/MrWoods1692/blog`,
      styles.heart, styles.subtitle
    )
    console.log(
      `%c${'──────────────────────────────────────'}`, styles.line
    )
    console.log(
      `%c${'✨'} %cHappy reading!%c  ${'📖'}`,
      styles.heart, styles.subtitle, styles.info
    )
  }
})
</script>
