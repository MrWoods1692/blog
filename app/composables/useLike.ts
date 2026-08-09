import { ref, onMounted, onUnmounted } from 'vue'
import { initializeApp } from 'firebase/app'
import { getDatabase, ref as dbRef, runTransaction, onValue } from 'firebase/database'

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

function getFirebaseDB() {
  if (!app) {
    app = initializeApp(firebaseConfig)
  }
  if (!db) {
    db = getDatabase(app)
  }
  return db
}

export function useLike(postId: string) {
  const liked = ref(false)
  const likeCount = ref(0)
  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    const database = getFirebaseDB()
    const likeRef = dbRef(database, `likes/${postId}`)

    unsubscribe = onValue(likeRef, (snapshot) => {
      const val = snapshot.val()
      likeCount.value = val?.count || 0
    })
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  async function toggleLike() {
    liked.value = !liked.value
    const database = getFirebaseDB()
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
  }

  return { liked, likeCount, toggleLike }
}