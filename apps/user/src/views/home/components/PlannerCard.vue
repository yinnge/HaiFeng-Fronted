<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PlannerListVO } from '@/types/home'

const props = defineProps<{
  planner: PlannerListVO
  offset?: number
  align?: 'left' | 'right'
}>()

const router = useRouter()
const isActive = ref(false)

const isTouchDevice = computed(() =>
  'ontouchstart' in window || navigator.maxTouchPoints > 0
)

const handleEnter = () => {
  if (!isTouchDevice.value) {
    isActive.value = true
  }
}

const handleLeave = () => {
  if (!isTouchDevice.value) {
    isActive.value = false
  }
}

const goDetail = () => {
  router.push(`/home/planner/${props.planner.id}`)
}
</script>

<template>
  <div
    class="relative cursor-default flex flex-col items-center"
    :style="{ transform: `translateY(${offset || 0}px)`, zIndex: isActive ? 20 : 1 }"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <div class="relative">
      <div
        class="overflow-hidden cursor-pointer border-2 shadow-md transition-all duration-300"
        :class="isActive ? 'border-orange-400 shadow-orange-200' : 'border-orange-100 hover:border-orange-400'"
        style="transform: skewX(-8deg)"
        @click="goDetail"
      >
        <img
          :src="planner.avatar"
          :alt="planner.name"
          class="w-20 h-[107px] sm:w-24 sm:h-32 md:w-28 md:h-[150px] lg:w-40 lg:h-[213px] object-cover"
          style="transform: skewX(8deg) scale(1.15)"
        />
      </div>
      <div
        v-show="isActive"
        class="absolute top-0 h-full z-30 w-40 sm:w-44 md:w-48 lg:w-52 bg-white rounded-lg shadow-xl border border-orange-100"
        :class="align === 'left' ? 'right-full' : 'left-full'"
        style="transform: skewX(-8deg)"
      >
        <div class="flex h-full w-full flex-col justify-center px-4" style="transform: skewX(8deg)">
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-800 truncate">{{ planner.name }}</p>
            <p class="text-xs text-orange-500 truncate">{{ planner.position }} · {{ planner.region }}</p>
          </div>
          <p class="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">擅长：{{ planner.specialty }}</p>
        </div>
      </div>
    </div>
    <span class="mt-2 w-full truncate px-1 text-center text-sm text-gray-500">{{ planner.name }}</span>
  </div>
</template>
