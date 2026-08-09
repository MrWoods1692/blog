<template>
  <div class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
      <svg viewBox="0 0 1024 1024" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
        <path d="M696.32 368.64c158.35136 0 286.72 128.36864 286.72 286.72 0 67.91168-23.61344 130.31424-63.0784 179.42528l16.6912 50.03264a40.96 40.96 0 0 1-51.8144 51.8144l-65.96608-21.99552A285.61408 285.61408 0 0 1 696.32 942.08c-158.35136 0-286.72-128.36864-286.72-286.72s128.36864-286.72 286.72-286.72z m0 61.44c-124.416 0-225.28 100.864-225.28 225.28s100.864 225.28 225.28 225.28c30.98624 0 61.00992-6.22592 88.73984-18.14528l7.51616-3.3792 22.3232-10.56768 50.50368 16.83456-14.31552-42.94656 20.992-26.13248A224.0512 224.0512 0 0 0 921.6 655.36c0-124.416-100.864-225.28-225.28-225.28z" fill="#131415"/>
        <path d="M430.08 81.92c214.89664 0 389.12 174.22336 389.12 389.12s-174.22336 389.12-389.12 389.12a387.6864 387.6864 0 0 1-162.22208-35.328L157.4912 857.94816a40.96 40.96 0 0 1-51.52768-49.11104l0.90112-3.072 27.32032-81.98144A387.584 387.584 0 0 1 40.96 471.04C40.96 256.14336 215.18336 81.92 430.08 81.92z" fill="#131415"/>
        <path d="M430.08 143.36C249.09824 143.36 102.4 290.05824 102.4 471.04a326.0416 326.0416 0 0 0 73.19552 206.4384l5.3248 6.36928 22.54848 26.4192-25.82528 77.47584 94.78144-28.42624 21.07392 9.68704A326.22592 326.22592 0 0 0 430.08 798.72c180.98176 0 327.68-146.69824 327.68-327.68S611.06176 143.36 430.08 143.36z" fill="#FFFFFF"/>
        <path d="M245.76 327.68m40.96 0l286.72 0q40.96 0 40.96 40.96l0 0q0 40.96-40.96 40.96l-286.72 0q-40.96 0-40.96-40.96l0 0q0-40.96 40.96-40.96Z" fill="#131415"/>
        <path d="M245.76 532.48m40.96 0l163.84 0q40.96 0 40.96 40.96l0 0q0 40.96-40.96 40.96l-163.84 0q-40.96 0-40.96-40.96l0 0q0-40.96 40.96-40.96Z" fill="#131415"/>
      </svg>
      {{ t('page.comments') }}
    </h3>

    <!-- Utterances Comment Widget -->
    <div id="utterances-comments" class="utterances-container">
      <div class="flex items-center justify-center py-8 text-gray-400">
        <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mr-2" />
        <span>{{ t('comments.loading') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRuntimeConfig } from '#app'
import { useLang } from '~/composables/useLang'

const props = defineProps<{
  postId: string
  title: string
}>()

const { t } = useLang()
const config = useRuntimeConfig()

onMounted(() => {
  // Only load Utterances if a valid repo is configured
  const repo = config.public.utterancesRepo
  if (!repo || repo === 'your-username/your-repo') {
    // Utterances not configured, hide the comment section
    const container = document.getElementById('utterances-comments')
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-8 text-gray-400 text-sm">
          <span>${t('comments.disabled')}</span>
        </div>
      `
    }
    return
  }

  // Load Utterances script dynamically with error handling
  const script = document.createElement('script')
  script.src = 'https://utteranc.es/client.js'
  script.setAttribute('repo', repo)
  script.setAttribute('issue-term', config.public.utterancesIssueTerm)
  script.setAttribute('theme', config.public.utterancesTheme)
  script.setAttribute('crossorigin', 'anonymous')
  script.setAttribute('async', '')
  script.onerror = () => {
    const container = document.getElementById('utterances-comments')
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-8 text-gray-400 text-sm">
          <span>${t('comments.error')}</span>
        </div>
      `
    }
  }
  document.getElementById('utterances-comments')?.appendChild(script)
})
</script>

<style>
.utterances-container {
  min-height: 200px;
}
</style>
