<script setup lang="ts">
import { computed } from 'vue'
import type { AdmissionMajorVO } from '@/api/gaokao'

const props = defineProps<{
  major: AdmissionMajorVO
  isSelected: boolean
  isMasked: boolean
}>()

defineEmits<{
  toggleSelect: []
}>()

const safetyColorMap: Record<string, string> = {
  '搏': '#FF4D4F',
  '冲': '#FFA940',
  '稳': '#FADB14',
  '保': '#52C41A',
  '垫': '#1890FF',
  '禁': '#999999',
}

const safetyBallColor = computed(() => {
  return safetyColorMap[props.major.levelShort] || '#999999'
})

const canSelect = computed(() => props.major.levelShort !== '禁' && !props.isMasked)
</script>

<template>
  <div class="flex items-stretch rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
    <!-- 左框：安全等级 -->
    <div class="w-20 shrink-0 flex flex-col items-center justify-center p-2 border-r border-gray-100">
      <span
        class="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white mb-0.5"
        :style="{ backgroundColor: safetyBallColor }"
      >
        {{ major.levelShort }}
      </span>
      <span class="text-[10px] text-gray-500">{{ (major.safetyLevel * 100).toFixed(0) }}%</span>
    </div>

    <!-- 中左框：专业信息 -->
    <div class="flex-1 min-w-0 p-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm font-semibold text-gray-800">{{ major.majorName }}</span>
        <span class="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{{ major.majorCode }}</span>
      </div>
      <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
        <span>{{ major.educationLevel }}</span>
        <span class="text-gray-300">|</span>
        <span>{{ major.duration }}</span>
        <span class="text-gray-300">|</span>
        <span>{{ major.tuition }}</span>
      </div>
      <p class="mt-1 text-xs text-gray-500 line-clamp-1">{{ major.description }}</p>
      <div v-if="major.constraints.length > 0" class="mt-1 flex flex-wrap gap-1">
        <span
          v-for="c in major.constraints"
          :key="c"
          class="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded"
        >
          {{ c }}
        </span>
      </div>
    </div>

    <!-- 中右框：历史分数 -->
    <div class="w-72 shrink-0 border-l border-gray-100 p-2">
      <table class="w-full text-[11px]">
        <thead>
          <tr class="text-gray-400">
            <th class="text-left font-normal">年份</th>
            <th class="text-left font-normal">最低分/位次</th>
            <th class="text-left font-normal">平均分/位次</th>
            <th class="text-left font-normal">最高分/位次</th>
          </tr>
        </thead>
        <tbody class="text-gray-600">
          <tr v-for="s in major.historyScores" :key="s.year">
            <td class="py-0.5">{{ s.year }}</td>
            <td>{{ s.minScore }}/{{ s.minRank }}</td>
            <td>{{ s.avgScore }}/{{ s.avgRank }}</td>
            <td>{{ s.maxScore }}/{{ s.maxRank }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 右框：操作 -->
    <div v-if="canSelect" class="w-12 shrink-0 flex items-center justify-center border-l border-gray-100">
      <button
        class="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
        :class="isSelected
          ? 'bg-green-500 text-white'
          : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'"
        @click="$emit('toggleSelect')"
      >
        <svg v-if="isSelected" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
