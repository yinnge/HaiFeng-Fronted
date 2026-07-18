<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PlannerListVO } from '@/types/home'

const props = defineProps<{ planner: PlannerListVO }>()

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

const handleClick = () => {
  if (isTouchDevice.value) {
    isActive.value = !isActive.value
  }
}

const goDetail = () => {
  router.push(`/home/planner/${props.planner.id}`)
}
</script>

<template>
  <div
    class="flex items-center transition-all duration-300 ease-in-out cursor-default overflow-hidden"
    :class="isActive ? 'w-[380px]' : 'w-[80px]'"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
    @click="handleClick"
  >
    <div class="flex-shrink-0 flex flex-col items-center w-[80px]">
      <img
        :src="planner.avatar"
        :alt="planner.name"
        class="w-16 h-16 rounded-full object-cover border-2 border-orange-100 hover:border-orange-400 transition-colors"
      />
      <span class="mt-2 text-xs text-gray-500 text-center truncate w-full px-1">{{ planner.name }}</span>
    </div>
    <div v-show="isActive" class="flex-1 min-w-0 pl-3 pr-2">
      <p class="text-sm font-bold text-gray-800 truncate">{{ planner.name }}</p>
      <p class="text-xs text-orange-500 mt-0.5 truncate">{{ planner.position }} · {{ planner.region }}</p>
      <p class="text-xs text-gray-500 mt-0.5 truncate">擅长：{{ planner.specialty }}</p>
      <button
        class="mt-1.5 text-xs text-orange-500 hover:text-orange-600 font-medium"
        @click.stop="goDetail"
      >
        查看详细资料 →
      </button>
    </div>
  </div>
</template>
