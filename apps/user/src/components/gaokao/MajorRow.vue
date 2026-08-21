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
  clickMajor: [name: string]
}>()

const safetyColorMap: Record<string, string> = {
  '搏': '#ef4444',
  '冲': '#f97316',
  '稳': '#eab308',
  '保': '#22c55e',
  '垫': '#3b82f6',
  '禁': '#94a3b8',
}

const safetyGradientMap: Record<string, string> = {
  '搏': 'from-red-500 to-red-600',
  '冲': 'from-orange-500 to-orange-600',
  '稳': 'from-yellow-500 to-yellow-600',
  '保': 'from-green-500 to-green-600',
  '垫': 'from-blue-500 to-blue-600',
  '禁': 'from-gray-400 to-gray-500',
}

const safetyBallColor = computed(() => safetyColorMap[props.major.levelShort] || '#94a3b8')
const safetyGradient = computed(() => safetyGradientMap[props.major.levelShort] || 'from-gray-400 to-gray-500')
const canSelect = computed(() => props.major.levelShort !== '禁' && !props.isMasked)

/** 学制规范化：'4' → '4年'，'4年' → '4年' */
const displayDuration = computed(() => {
  const d = props.major.duration || ''
  if (!d) return '-'
  return /\d$/.test(d) ? `${d}年` : d
})

/** 条件限制文本：constraints 逗号隔开；为空则不展示 */
const restrictionText = computed(() => {
  const list = props.major.constraints || []
  return list.join('，')
})
</script>

<template>
  <div
    class="flex items-stretch rounded-xl border transition-all duration-200"
    :class="isSelected
      ? 'border-green-200 bg-gradient-to-r from-green-50/80 to-white shadow-sm'
      : 'border-gray-100/60 bg-white/80 hover:bg-gray-50/80 hover:border-gray-200/60'"
  >
    <div class="w-24 shrink-0 flex flex-col items-center justify-center p-3 border-r border-gray-100/60">
      <div class="relative">
        <span
          class="inline-flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white shadow-md transition-transform duration-200 hover:scale-105"
          :class="`bg-gradient-to-br ${safetyGradient}`"
        >
          {{ major.levelShort }}
        </span>
      </div>
      <span class="mt-1.5 text-[10px] font-medium text-gray-500 tabular-nums">{{ (major.safetyLevel * 100).toFixed(0) }}%</span>
    </div>

    <div class="flex-1 min-w-0 p-4">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          class="text-sm font-semibold text-gray-800 hover:text-brand-orange hover:underline underline-offset-2 transition-colors cursor-pointer"
          title="查看专业信息"
          @click.stop="$emit('clickMajor', major.majorName)"
        >
          {{ major.majorName }}
        </button>
        <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-500">{{ major.majorCode }}</span>
      </div>
      <div class="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
        <span class="inline-flex items-center">
          <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          {{ major.educationLevel }}
        </span>
        <span class="text-gray-300">·</span>
        <span class="inline-flex items-center">
          <svg class="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          学制 {{ displayDuration }}
        </span>
        <span class="text-gray-300">·</span>
        <span class="text-brand-orange font-medium">{{ major.tuition }}/年</span>
      </div>
      <p class="mt-2 text-xs text-gray-500 leading-relaxed break-words">{{ major.description }}</p>
      <!-- 条件限制：红色字体贴底，有才展示 -->
      <div v-if="restrictionText" class="mt-2 text-xs text-red-500 leading-relaxed">
        限制：{{ restrictionText }}
      </div>
    </div>

    <div class="w-[30rem] shrink-0 border-l border-gray-100/60 p-3 bg-gray-50/20">
      <div class="overflow-hidden rounded-lg border border-gray-200/60">
        <table class="w-full text-[11px]">
          <thead>
            <tr class="bg-gray-100/40">
              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">年份</th>
              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">最低分/位次</th>
              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">平均分/位次</th>
              <th class="text-left font-semibold text-gray-600 px-3 py-1.5">最高分/位次</th>
              <th class="text-center font-semibold text-gray-600 px-3 py-1.5">录取人数</th>
            </tr>
          </thead>
          <tbody class="text-gray-600 divide-y divide-gray-100/60">
            <tr v-for="s in major.historyScores" :key="s.year" class="hover:bg-gray-50/60 transition-colors">
              <td class="px-3 py-1.5 font-medium tabular-nums">{{ s.year }}</td>
              <td class="px-3 py-1.5 tabular-nums">{{ s.minScore }}/{{ s.minRank }}</td>
              <td class="px-3 py-1.5 tabular-nums">{{ s.avgScore }}/{{ s.avgRank }}</td>
              <td class="px-3 py-1.5 tabular-nums">{{ s.maxScore }}/{{ s.maxRank }}</td>
              <td class="px-3 py-1.5 tabular-nums text-center">{{ s.admissionCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="canSelect" class="w-14 shrink-0 flex items-center justify-center border-l border-gray-100/60">
      <button
        class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
        :class="isSelected
          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30'
          : 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 border border-transparent hover:border-brand-orange/20'"
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
</style>
