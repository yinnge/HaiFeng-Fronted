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

/* 波浪错位用 margin-top 表达：translateY 会让整张卡（含底部姓名文字）
   常驻合成层，Windows 下小字发毛。margin 是布局属性，不触发位图化。 */
const cardStyle = computed(() => ({
  marginTop: `${props.offset || 0}px`,
  zIndex: isActive.value ? 20 : 1,
}))

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
    :style="cardStyle"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <div class="relative">
      <!-- 图片卡片整块只有 <img>、无文字，skew/scale 属于纯装饰层，合法 -->
      <div
        class="overflow-hidden cursor-pointer border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.06)]"
        :class="isActive ? 'border-blue-300 shadow-[0_12px_28px_rgba(15,23,42,0.14)]' : 'hover:border-blue-300'"
        style="transform: skewX(-8deg); transition: border-color 0.5s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.5s cubic-bezier(0.32, 0.72, 0, 1)"
        @click="goDetail"
      >
        <img
          :src="planner.avatar"
          :alt="planner.name"
          class="w-20 h-[107px] sm:w-24 sm:h-32 md:w-28 md:h-[150px] lg:w-40 lg:h-[213px] xl:w-56 xl:h-[299px] 2xl:w-64 2xl:h-[341px] object-cover"
          style="transform: skewX(8deg) scale(1.15)"
        />
      </div>
      <!-- 悬浮信息卡含姓名/职位/擅长文字：倾斜只交给 ::before 纯装饰背景层，
           文字容器零 transform，避免被当成位图拧来拧去后发毛 -->
      <div
        v-show="isActive"
        class="planner-pop absolute top-0 h-full z-30 w-40 sm:w-44 md:w-48 lg:w-52 xl:w-72 2xl:w-80"
        :class="align === 'left' ? 'right-full' : 'left-full'"
      >
        <div class="planner-pop__body flex h-full w-full flex-col justify-center px-4">
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

<style scoped>
/* 悬浮信息卡：背景 / 描边 / 阴影 / 倾斜全部下沉到纯装饰伪元素，
   姓名·职位·擅长这些文字零 transform，不会被位图插值揉出毛边 */
.planner-pop::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.5rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.14);
  transform: skewX(-8deg);
  pointer-events: none;
}
.planner-pop__body {
  position: relative;
  z-index: 1;
}
</style>
