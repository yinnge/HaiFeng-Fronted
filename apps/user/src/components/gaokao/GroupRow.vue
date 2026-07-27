<script setup lang="ts">
import { computed } from 'vue'
import type { AdmissionGroupVO, ConstraintCheckResult } from '@/api/gaokao'

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
  '搏': '#FF4D4F',
  '冲': '#FFA940',
  '稳': '#FADB14',
  '保': '#52C41A',
  '垫': '#1890FF',
  '禁': '#999999',
}

const safetyBallColor = computed(() => {
  return safetyColorMap[props.group.levelShort] || '#999999'
})

const hasHardConflict = computed(() => {
  return props.conflicts && !props.conflicts.isPass
})

const hasSoftConflict = computed(() => {
  return props.conflicts && props.conflicts.isPass && props.conflicts.softConflicts.length > 0
})
</script>

<template>
  <div
    class="rounded-xl border transition-all"
    :class="[
      isMasked ? 'opacity-60' : '',
      hasHardConflict ? 'border-red-200 bg-red-50/50' : hasSoftConflict ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 bg-white',
    ]"
  >
    <!-- 主行 -->
    <div class="flex items-stretch">
      <!-- 左框：安全等级 -->
      <div class="w-24 shrink-0 flex flex-col items-center justify-center p-3 border-r border-gray-100">
        <span
          class="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white mb-1"
          :style="{ backgroundColor: safetyBallColor }"
        >
          {{ group.levelShort }}
        </span>
        <span class="text-xs text-gray-500">{{ (group.safetyLevel * 100).toFixed(0) }}%</span>
      </div>

      <!-- 中左框：院校信息 -->
      <div class="flex-1 min-w-0 p-4">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            class="text-lg font-bold text-gray-800 truncate cursor-pointer hover:text-orange-500 transition-colors"
            @click.stop="$emit('clickUniversity', group.universityName)"
          >
            {{ group.universityName }}
          </span>
          <span
            class="text-sm text-gray-400 cursor-pointer hover:text-orange-500 transition-colors"
            @click.stop="$emit('clickCity', group.cityName)"
          >
            {{ group.cityName }}
          </span>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ group.enrollmentCode }}</span>
          <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ group.groupCode }}</span>
        </div>
        <div class="mt-1 flex items-center gap-3 text-sm text-gray-500">
          <span>专业组：{{ group.groupName }}</span>
          <span class="text-gray-300">|</span>
          <span>{{ group.majorCount }}个专业</span>
          <span class="text-gray-300">|</span>
          <span>选科：{{ group.requirementType }}</span>
        </div>
        <p class="mt-2 text-sm text-gray-500 line-clamp-2">{{ group.description }}</p>
        <!-- 约束条件 -->
        <div v-if="group.constraints.length > 0" class="mt-2 flex flex-wrap gap-1">
          <span
            v-for="c in group.constraints"
            :key="c"
            class="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full"
          >
            {{ c }}
          </span>
        </div>
        <!-- 约束冲突 -->
        <div v-if="hasHardConflict" class="mt-2 text-xs text-red-600 bg-red-50 rounded-lg p-2">
          <span class="font-medium">不可报考：</span>
          <span v-for="(c, i) in conflicts!.hardConflicts" :key="c.code">
            {{ i > 0 ? '、' : '' }}{{ c.name }}
          </span>
        </div>
        <div v-else-if="hasSoftConflict" class="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
          <span class="font-medium">建议谨慎：</span>
          <span v-for="(c, i) in conflicts!.softConflicts" :key="c.code">
            {{ i > 0 ? '、' : '' }}{{ c.name }}
          </span>
        </div>
      </div>

      <!-- 中右框：历史分数 -->
      <div class="w-80 shrink-0 border-l border-gray-100 p-3">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-gray-400">
              <th class="text-left font-normal">年份</th>
              <th class="text-left font-normal">最低分/位次</th>
              <th class="text-left font-normal">平均分/位次</th>
              <th class="text-left font-normal">最高分/位次</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in group.historyScores" :key="s.year" class="text-gray-600">
              <td class="py-0.5">{{ s.year }}</td>
              <td>{{ s.minScore }}/{{ s.minRank }}</td>
              <td>{{ s.avgScore }}/{{ s.avgRank }}</td>
              <td>{{ s.maxScore }}/{{ s.maxRank }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 右框：操作 -->
      <div class="w-16 shrink-0 flex flex-col items-center justify-center gap-2 border-l border-gray-100">
        <button
          class="text-xs text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50"
          @click="$emit('toggleExpand')"
        >
          {{ isExpanded ? '收起' : '查看专业' }}
        </button>
      </div>
    </div>

    <!-- 遮罩 -->
    <div v-if="isMasked" class="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <div class="text-center">
        <p class="text-sm text-gray-500 mb-2">升级会员查看完整数据</p>
        <span class="text-xs text-orange-500 font-medium">立即升级</span>
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
