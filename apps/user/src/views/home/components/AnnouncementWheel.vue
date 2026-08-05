<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { AnnouncementListVO } from '@/types/home'

const props = defineProps<{
  announcements: AnnouncementListVO[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const centerIndex = ref(0)
const isSmallScreen = ref(false)

const updateViewport = () => {
  isSmallScreen.value = window.innerWidth < 768
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})

const windowSize = computed(() => (isSmallScreen.value ? 3 : 5))
const cardWidth = computed(() => (isSmallScreen.value ? 150 : 230))
const cardHeight = computed(() => (isSmallScreen.value ? 72 : 88))
const cardStep = computed(() => cardHeight.value + 10)
const containerWidth = computed(() => Math.ceil(cardWidth.value * scaleFor(0)))

const totalCount = computed(() => props.announcements.length)

const defaultHalf = computed(() => Math.floor(windowSize.value / 2))

const half = computed(() => {
  const n = totalCount.value
  if (!n) return 0
  return Math.min(defaultHalf.value, Math.floor((n - 1) / 2))
})

const scaleFor = (dist: number) => [1.1, 0.86, 0.7][dist] ?? 0.6
const blurFor = (dist: number) => [0, 1.5, 3.5][dist] ?? 5
const opacityFor = (dist: number) => [1, 0.8, 0.5][dist] ?? 0.35

const windowCards = computed(() => {
  const n = totalCount.value
  if (!n) return []
  const list: { ann: AnnouncementListVO; offset: number; z: number }[] = []
  for (let d = -half.value; d <= half.value; d++) {
    const idx = ((centerIndex.value + d) % n + n) % n
    const dist = Math.abs(d)
    list.push({
      ann: props.announcements[idx],
      offset: d * cardStep.value,
      z: 10 - dist,
    })
  }
  return list
})

const wheelHeight = computed(() => {
  const scale = scaleFor(half.value)
  const extent = half.value * cardStep.value + (cardHeight.value * scale) / 2
  return Math.max(cardHeight.value, Math.round(2 * extent))
})

const cardStyle = (offset: number, z: number) => {
  const dist = Math.abs(offset / cardStep.value)
  const d = Math.round(dist)
  const scale = scaleFor(d)
  return {
    width: `${cardWidth.value}px`,
    height: `${cardHeight.value}px`,
    transform: `translate(-50%, calc(-50% + ${offset}px)) scale(${scale})`,
    zIndex: z,
    filter: d > 0 ? `blur(${blurFor(d)}px)` : 'none',
    opacity: opacityFor(d),
  }
}

const isCenter = (ann: AnnouncementListVO) => ann.id === props.announcements[centerIndex.value]?.id

watch(
  () => props.announcements,
  () => {
    centerIndex.value = 0
  },
)

const handleCardClick = (ann: AnnouncementListVO) => {
  const idx = props.announcements.findIndex(a => a.id === ann.id)
  if (idx >= 0) {
    centerIndex.value = idx
    emit('select', ann.id)
  }
}

const next = () => {
  const n = totalCount.value
  if (!n) return
  centerIndex.value = (centerIndex.value + 1) % n
  emit('select', props.announcements[centerIndex.value].id)
}

const prev = () => {
  const n = totalCount.value
  if (!n) return
  centerIndex.value = (centerIndex.value - 1 + n) % n
  emit('select', props.announcements[centerIndex.value].id)
}

let wheelAccum = 0
let lastWheelTime = 0

const onWheel = (e: WheelEvent) => {
  e.preventDefault()
  const now = Date.now()
  if (now - lastWheelTime < 180 || totalCount.value < 2) return
  wheelAccum += e.deltaY
  if (wheelAccum >= 60) {
    next()
    wheelAccum = 0
    lastWheelTime = now
  } else if (wheelAccum <= -60) {
    prev()
    wheelAccum = 0
    lastWheelTime = now
  }
}

let touchStartX = 0
let touchStartY = 0

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX
  touchStartY = e.touches[0].clientY
}

const onTouchEnd = (e: TouchEvent) => {
  const dx = e.changedTouches[0].clientX - touchStartX
  const dy = e.changedTouches[0].clientY - touchStartY
  if (Math.abs(dy) < 40 || Math.abs(dy) < Math.abs(dx)) return
  if (dy < 0) {
    next()
  } else {
    prev()
  }
}
</script>

<template>
  <div
    class="flex h-full flex-col items-center justify-center"
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <button
      class="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-orange-500 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="totalCount < 2"
      aria-label="上一则"
      @click="prev"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>

    <div
      v-if="totalCount"
      class="relative overflow-hidden"
      :style="{ height: `${wheelHeight}px`, width: `${containerWidth}px` }"
    >
      <div
        v-for="c in windowCards"
        :key="c.ann.id"
        class="absolute left-1/2 top-1/2 cursor-pointer rounded-xl bg-white p-3 shadow-lg transition-all duration-500 ease-out hover:shadow-xl"
        :class="isCenter(c.ann) ? 'border-2 border-orange-400 shadow-orange-200' : 'border border-gray-100'"
        :style="cardStyle(c.offset, c.z)"
        @click="handleCardClick(c.ann)"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-center justify-between gap-2">
            <span
              v-if="c.ann.tag"
              class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600"
            >
              {{ c.ann.tag }}
            </span>
            <span class="shrink-0 text-xs text-gray-400">{{ c.ann.updatedAt?.slice(0, 10) }}</span>
          </div>
          <h4
            class="mt-1.5 line-clamp-2 font-bold text-gray-800 leading-snug"
            :class="isCenter(c.ann) ? 'text-base' : 'text-sm opacity-80'"
          >
            {{ c.ann.title }}
          </h4>
        </div>
      </div>

      <div class="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white to-transparent"></div>
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent"></div>
    </div>
    <div v-else class="flex items-center justify-center py-12 text-sm text-gray-400" :style="{ width: `${cardWidth}px` }">
      暂无公告
    </div>

    <button
      class="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:text-orange-500 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      :disabled="totalCount < 2"
      aria-label="下一则"
      @click="next"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
</template>
