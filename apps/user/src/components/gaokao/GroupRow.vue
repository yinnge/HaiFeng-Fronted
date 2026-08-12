<script setup lang="ts">
import { computed } from 'vue'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import type { AdmissionGroupVO, ConstraintCheckResult } from '@/api/gaokao'

const recharge = useRechargeDialog()

const props = defineProps<{
  group: AdmissionGroupVO
  isExpanded: boolean
  conflicts: ConstraintCheckResult | null
  isMasked: boolean
}>()

defineEmits<{
  toggleExpand: []
  clickUniversity: [name: string]
  clickCity: [name: string]
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

const safetyBallColor = computed(() => safetyColorMap[props.group.levelShort] || '#94a3b8')
const safetyGradient = computed(() => safetyGradientMap[props.group.levelShort] || 'from-gray-400 to-gray-500')
const hasHardConflict = computed(() => props.conflicts && !props.conflicts.isPass)
const hasSoftConflict = computed(() => props.conflicts && props.conflicts.isPass && props.conflicts.softConflicts.length > 0)

const cardClass = computed(() => {
  const base = 'group relative rounded-2xl border transition-all duration-300 ease-out'
  if (props.isMasked) return `${base} opacity-60`
  if (hasHardConflict.value) return `${base} border-red-200/60 bg-gradient-to-br from-red-50/80 to-white shadow-card hover:shadow-card-hover`
  if (hasSoftConflict.value) return `${base} border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white shadow-card hover:shadow-card-hover`
  return `${base} border-gray-100/80 bg-white shadow-card hover:shadow-card-hover hover:border-brand-orange/20`
})
</script>

<template>
  <div :class="cardClass">
    <div class="flex items-stretch">
      <div class="w-28 shrink-0 flex flex-col items-center justify-center p-4 border-r border-gray-100/60">
        <div class="relative">
          <span
            class="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold text-white shadow-lg transition-transform duration-200 group-hover:scale-105"
            :class="`bg-gradient-to-br ${safetyGradient}`"
          >
            {{ group.levelShort }}
          </span>
          <div class="absolute -inset-1 rounded-2xl opacity-20 blur-sm" :style="{ backgroundColor: safetyBallColor }" />
        </div>
        <span class="mt-2 text-xs font-medium text-gray-500 tabular-nums">{{ (group.safetyLevel * 100).toFixed(0) }}%</span>
      </div>

      <div class="flex-1 min-w-0 p-5">
        <div class="flex items-center gap-3 flex-wrap">
          <span
            class="text-lg font-bold text-gray-800 truncate cursor-pointer transition-colors duration-200 hover:text-brand-orange"
            @click.stop="$emit('clickUniversity', group.universityName)"
          >
            {{ group.universityName }}
          </span>
          <span
            class="inline-flex items-center text-sm text-gray-500 cursor-pointer transition-colors duration-200 hover:text-brand-orange"
            @click.stop="$emit('clickCity', group.cityName)"
          >
            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ group.cityName }}
          </span>
          <span class="pill pill-blue text-xs">{{ group.enrollmentCode }}</span>
          <span class="pill pill-gold text-xs">{{ group.groupCode }}</span>
        </div>

        <div class="mt-2.5 flex items-center gap-3 text-sm text-gray-500">
          <span class="inline-flex items-center">
            <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {{ group.groupName }}
          </span>
          <span class="text-gray-300">·</span>
          <span>{{ group.majorCount }}个专业</span>
          <span class="text-gray-300">·</span>
          <span class="inline-flex items-center">
            <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            选科：{{ group.requirementType }}
          </span>
        </div>

        <p class="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">{{ group.description }}</p>

        <div v-if="group.constraints.length > 0" class="mt-3 flex flex-wrap gap-1.5">
          <span
            v-for="c in group.constraints"
            :key="c"
            class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-100"
          >
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ c }}
          </span>
        </div>

        <div v-if="hasHardConflict" class="mt-3 text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-100">
          <div class="flex items-center mb-1.5">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-semibold">不可报考</span>
          </div>
          <span v-for="(c, i) in conflicts!.hardConflicts" :key="c.code" class="text-xs">
            {{ i > 0 ? '、' : '' }}{{ c.name }}
          </span>
        </div>
        <div v-else-if="hasSoftConflict" class="mt-3 text-sm text-amber-600 bg-amber-50 rounded-xl p-3 border border-amber-100">
          <div class="flex items-center mb-1.5">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="font-semibold">建议谨慎</span>
          </div>
          <span v-for="(c, i) in conflicts!.softConflicts" :key="c.code" class="text-xs">
            {{ i > 0 ? '、' : '' }}{{ c.name }}
          </span>
        </div>
      </div>

      <div class="w-[28rem] shrink-0 border-l border-gray-100/60 p-4 bg-gray-50/30">
        <div class="flex items-center mb-3">
          <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wider">历史分数</span>
        </div>
        <div class="overflow-hidden rounded-xl border border-gray-200/60">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-gray-100/60">
                <th class="text-left font-semibold text-gray-600 px-4 py-2">年份</th>
                <th class="text-left font-semibold text-gray-600 px-4 py-2">最低分/位次</th>
                <th class="text-left font-semibold text-gray-600 px-4 py-2">平均分/位次</th>
                <th class="text-left font-semibold text-gray-600 px-4 py-2">最高分/位次</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100/60">
              <tr v-for="s in group.historyScores" :key="s.year" class="text-gray-600 hover:bg-gray-50 transition-colors">
                <td class="px-4 py-2 font-medium tabular-nums">{{ s.year }}</td>
                <td class="px-4 py-2 tabular-nums">{{ s.minScore }}/{{ s.minRank }}</td>
                <td class="px-4 py-2 tabular-nums">{{ s.avgScore }}/{{ s.avgRank }}</td>
                <td class="px-4 py-2 tabular-nums">{{ s.maxScore }}/{{ s.maxRank }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="w-20 shrink-0 flex flex-col items-center justify-center gap-2 border-l border-gray-100/60 p-3">
        <button
          class="w-full flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium"
          :class="isExpanded
            ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'
            : 'text-brand-blue hover:bg-brand-blue/10 hover:border-brand-blue/20 border border-transparent'"
          @click="$emit('toggleExpand')"
        >
          <svg
            class="w-5 h-5 transition-transform duration-200"
            :class="isExpanded ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <span class="text-xs">{{ isExpanded ? '收起' : '专业' }}</span>
        </button>
      </div>
    </div>

    <div v-if="isMasked" class="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <div class="text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-brand-orange/10 flex items-center justify-center">
          <svg class="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500 mb-2">升级会员查看完整数据</p>
        <span class="text-xs text-brand-orange font-semibold cursor-pointer hover:underline" @click="recharge.open()">立即升级</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
