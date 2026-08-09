import { ref, onMounted, onBeforeUnmount } from 'vue'

export const useDark = () => {
  const isDark = ref(false)

  const toggleDark = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  const updateTheme = () => {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  onMounted(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDark.value = true
    }
    updateTheme()
  })

  return { isDark, toggleDark }
}
