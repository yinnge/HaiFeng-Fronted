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
        class="overflow-hidden cursor-pointer border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]"
        :class="isActive ? 'border-blue-300 shadow-[0_12px_28px_rgba(15,23,42,0.14)]' : 'hover:border-blue-300'"
        style="transform: skewX(-8deg); transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1)"
        @click="goDetail"
      >
        <img
          :src="planner.avatar"
          :alt="planner.name"
          class="w-20 h-[107px] sm:w-24 sm:h-32 md:w-28 md:h-[150px] lg:w-40 lg:h-[213px] xl:w-56 xl:h-[299px] 2xl:w-64 2xl:h-[341px] object-cover"
          style="transform: skewX(8deg) scale(1.15)"
        />
      </div>
      <div
        v-show="isActive"
        class="absolute top-0 h-full z-30 w-40 sm:w-44 md:w-48 lg:w-52 xl:w-72 2xl:w-80 bg-white rounded-lg shadow-[0_14px_36px_rgba(15,23,42,0.14)] border border-slate-200"
        :class="align === 'left' ? 'right-full' : 'left-full'"
        style="transform: skewX(-8deg); transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1)"
      >
        <div class="flex h-full w-full flex-col justify-center px-4" style="transform: skewX(8deg)">
          <div class="min-w-0">
            <p class="text-sm font-bold text-gray-800 truncate">{{ planner.name }}</p>
            <p class="text-xs text-blue-600 truncate">{{ planner.position }} · {{ planner.region }}</p>
          </div>
          <p class="mt-3 text-xs text-gray-500 leading-relaxed line-clamp-2">擅长：{{ planner.specialty }}</p>
        </div>
      </div>
    </div>
    <span class="mt-2 w-full truncate px-1 text-center text-sm text-gray-500">{{ planner.name }}</span>
  </div>
</template>
