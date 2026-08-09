<template>
  <div v-if="show" class="fixed inset-0 z-[200] flex items-center justify-center" @click.self="close">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" />

    <!-- 操作按钮栏 -->
    <div class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-gray-900/90 backdrop-blur border border-gray-700/50 shadow-xl z-10 text-white">
      <button @click="rotateLeft" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.rotateLeft')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      </button>
      <button @click="rotateRight" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.rotateRight')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>
      </button>
      <div class="w-px h-4 bg-gray-700/50 mx-0.5" />
      <button @click="zoomOut" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.zoomOut')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <span class="text-xs text-gray-400 px-1 min-w-[3rem] text-center font-mono">{{ Math.round(scale * 100) }}%</span>
      <button @click="zoomIn" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.zoomIn')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button @click="reset" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.reset')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
      </button>
      <div class="w-px h-4 bg-gray-700/50 mx-0.5" />
      <button @click="download" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.download')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <button @click="copyLink" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.copyLink')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>
      <button @click="copyImage" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.copyImage')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      <div class="w-px h-4 bg-gray-700/50 mx-0.5" />
      <button @click="close" class="p-2 rounded-lg hover:bg-gray-700/50 transition-colors" :title="t('image.close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- 图片 -->
    <div
      class="relative z-10 cursor-grab active:cursor-grabbing select-none"
      :style="{ transform: `translate(${panX}px, ${panY}px) scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center' }"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
      @wheel.prevent="onWheel"
      @dblclick="reset"
    >
      <img :src="src" :alt="alt" class="max-w-none rounded-lg shadow-2xl" :style="{ maxWidth: '90vw', maxHeight: '85vh' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useLang } from '~/composables/useLang'

const { t } = useLang()

const props = defineProps<{
  show: boolean
  src: string
  alt: string
}>()

const emit = defineEmits(['update:show'])

const scale = ref(1)
const rotation = ref(0)
const panX = ref(0)
const panY = ref(0)
let isDragging = false
let dragStartX = 0
let dragStartY = 0
let panStartX = 0
let panStartY = 0

const close = () => emit('update:show', false)

const reset = () => {
  scale.value = 1
  rotation.value = 0
  panX.value = 0
  panY.value = 0
}

const rotateLeft = () => { rotation.value -= 90 }
const rotateRight = () => { rotation.value += 90 }
const zoomIn = () => { scale.value = Math.min(scale.value + 0.25, 5) }
const zoomOut = () => { scale.value = Math.max(scale.value - 0.25, 0.25) }

const download = async () => {
  try {
    const res = await fetch(props.src)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.alt || 'image'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    window.open(props.src, '_blank')
  }
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.src)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = props.src
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

const copyImage = async () => {
  try {
    const res = await fetch(props.src)
    const blob = await res.blob()
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })])
  } catch {
    // fallback: copy link
    await copyLink()
  }
}

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return
  isDragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  panStartX = panX.value
  panStartY = panY.value
}

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging) return
  panX.value = panStartX + (e.clientX - dragStartX)
  panY.value = panStartY + (e.clientY - dragStartY)
}

const onMouseUp = () => { isDragging = false }

const onWheel = (e: WheelEvent) => {
  const delta = -Math.sign(e.deltaY) * 0.15
  scale.value = Math.max(0.25, Math.min(5, scale.value + delta))
}

watch(() => props.show, (val) => {
  if (val) {
    reset()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (!props.show) return
    if (e.key === 'Escape') close()
    if (e.key === '+' || e.key === '=') zoomIn()
    if (e.key === '-') zoomOut()
    if (e.key === 'r') rotateRight()
  }
  document.addEventListener('keydown', handleKey)
  onUnmounted(() => document.removeEventListener('keydown', handleKey))
})
</script>
