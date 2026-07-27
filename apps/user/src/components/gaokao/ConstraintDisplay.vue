<script setup lang="ts">
import type { ConstraintItem } from '@/api/gaokao'

defineProps<{
  constraints: ConstraintItem[]
}>()

const severityConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  HARD: { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: '不可报考' },
  SOFT: { color: '#f97316', bg: '#fff7ed', border: '#fed7aa', label: '建议谨慎' },
}

function getSeverityStyle(severity: string) {
  return severityConfig[severity] || severityConfig.SOFT
}
</script>

<template>
  <div v-if="constraints.length > 0" class="space-y-3">
    <div
      v-for="item in constraints"
      :key="item.code"
      class="rounded-xl p-4 border"
      :style="{
        backgroundColor: getSeverityStyle(item.severity).bg,
        borderColor: getSeverityStyle(item.severity).border,
      }"
    >
      <div class="flex items-start gap-3">
        <span
          class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs text-white"
          :style="{ backgroundColor: getSeverityStyle(item.severity).color }"
        >
          {{ item.severity === 'HARD' ? '!' : '?' }}
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-semibold text-gray-800">{{ item.name }}</span>
            <span
              class="text-xs px-2 py-0.5 rounded-full"
              :style="{
                color: getSeverityStyle(item.severity).color,
                backgroundColor: getSeverityStyle(item.severity).border,
              }"
            >
              {{ getSeverityStyle(item.severity).label }}
            </span>
            <span class="text-xs text-gray-400">{{ item.category }}</span>
          </div>
          <p class="mt-1 text-sm text-gray-600 leading-relaxed">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-6 text-gray-400 text-sm">
    暂无触发的约束条件
  </div>
</template>
