import { ref, onMounted, onUnmounted } from 'vue'

const runtimeConfig = useRuntimeConfig()

const firebaseConfig = {
  apiKey: runtimeConfig.public.firebaseApiKey,
  authDomain: runtimeConfig.public.firebaseAuthDomain,
  databaseURL: runtimeConfig.public.firebaseDatabaseURL,
  projectId: runtimeConfig.public.firebaseProjectId,
  storageBucket: runtimeConfig.public.firebaseStorageBucket,
  messagingSenderId: runtimeConfig.public.firebaseMessagingSenderId,
  appId: runtimeConfig.public.firebaseAppId
}

let app: any = null
let db: any = null

async function getFirebaseDB() {
  if (!app) {
    const { initializeApp } = await import('firebase/app')
    app = initializeApp(firebaseConfig)
  }
  if (!db) {
    const { getDatabase } = await import('firebase/database')
    db = getDatabase(app)
  }
  return db
}

export function useLike(postId: string) {
  const liked = ref(false)
  const likeCount = ref(0)
  let unsubscribe: (() => void) | null = null

  onMounted(async () => {
    try {
      const database = await getFirebaseDB()
      const { ref: dbRef, onValue } = await import('firebase/database')
      const likeRef = dbRef(database, `likes/${postId}`)

      unsubscribe = onValue(likeRef, (snapshot) => {
        const val = snapshot.val()
        likeCount.value = val?.count || 0
      })
    } catch (e) {
      console.error('Firebase init failed:', e)
    }
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  async function toggleLike() {
    liked.value = !liked.value
    try {
      const database = await getFirebaseDB()
      const { ref: dbRef, runTransaction } = await import('firebase/database')
      const likeRef = dbRef(database, `likes/${postId}`)

      await runTransaction(likeRef, (current) => {
        const data = current || { count: 0 }
        if (liked.value) {
          data.count = (data.count || 0) + 1
        } else {
          data.count = Math.max(0, (data.count || 0) - 1)
        }
        return data
      })
    } catch (e) {
      console.error('Like toggle failed:', e)
      liked.value = !liked.value
    }
  }

  return { liked, likeCount, toggleLike }
}