import { ref, onMounted } from 'vue'

export function useLike(postId: string) {
  const liked = ref(false)
  const likeCount = ref(0)
  const runtimeConfig = useRuntimeConfig()
  const databaseURL = runtimeConfig.public.firebaseDatabaseURL

  onMounted(async () => {
    if (!databaseURL) return
    try {
      const res = await fetch(`${databaseURL}/likes/${postId}.json`)
      const data = await res.json()
      likeCount.value = data?.count || 0
    } catch (e) {
      console.error('Failed to load like count:', e)
    }
  })

  async function toggleLike() {
    if (!databaseURL) return
    liked.value = !liked.value
    try {
      const newCount = likeCount.value + (liked.value ? 1 : -1)
      await fetch(`${databaseURL}/likes/${postId}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: Math.max(0, newCount) })
      })
      likeCount.value = Math.max(0, newCount)
    } catch (e) {
      console.error('Failed to toggle like:', e)
      liked.value = !liked.value
    }
  }

  return { liked, likeCount, toggleLike }
}