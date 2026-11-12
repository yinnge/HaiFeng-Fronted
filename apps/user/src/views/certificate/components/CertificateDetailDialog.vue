<script setup lang="ts">
/**
 * 证书详情弹窗（报名指南）。
 *
 * ⚠️ 本组件由旧 List.vue 原样搬移而来：模板结构、内联 Tailwind 类名与 scoped 样式
 * 均为逐字保留，视觉与交互零改动（Q1=A「暂不修改 detail」）。
 * 后续如需按 AGENTS.md 重做弹窗视觉，另开一轮处理。
 */
import { ElDialog } from 'element-plus'
import type { CertificateDetailVO } from '@/types/certificate'

defineProps<{
  /** 当前证书详情；为 null 时内容区留空 */
  cert: CertificateDetailVO | null
  /** 详情加载中 */
  loading: boolean
}>()

/** 弹窗可见性（父层 v-model 绑定） */
const visible = defineModel<boolean>({ default: false })
</script>

<template>
  <ElDialog
    v-model="visible"
    title="📋 报名指南"
    width="640px"
    :close-on-click-modal="false"
    v-loading="loading"
    class="cert-guide-dialog"
  >
    <template v-if="cert">
      <div class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-5 border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C]">
        <div class="space-y-5">
          <div class="text-center">
            <h3 class="text-xl font-bold text-gray-800">{{ cert.certName }}</h3>
            <div class="flex justify-center flex-wrap gap-2 mt-2">
              <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">{{ cert.category }}</span>
              <span class="rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-200">{{ cert.certLevel }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
              <div class="text-xs text-gray-400">适用专业</div>
              <div class="mt-1 font-medium text-gray-700">{{ cert.applicableMajor || '-' }}</div>
            </div>
            <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
              <div class="text-xs text-gray-400">报名时间</div>
              <div class="mt-1 font-medium text-gray-700">{{ cert.registrationTime || '-' }}</div>
            </div>
            <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
              <div class="text-xs text-gray-400">考试时间</div>
              <div class="mt-1 font-medium text-gray-700">{{ cert.examTime || '-' }}</div>
            </div>
            <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
              <div class="text-xs text-gray-400">考试费用</div>
              <div class="mt-1 font-medium text-gray-700">{{ cert.examFee ? `¥${cert.examFee}` : '-' }}</div>
            </div>
          </div>

          <div class="h-px shrink-0 bg-gradient-to-r from-orange-500 to-amber-400"></div>

          <div v-if="cert.certIntro" class="text-sm">
            <h4 class="mb-1.5 flex items-center gap-1.5 font-semibold text-gray-800">
              <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 2 0 01.707.293l5.414 5.414a1 2 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              证书简介
            </h4>
            <div class="rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4 text-sm leading-relaxed text-gray-600">
              {{ cert.certIntro }}
            </div>
          </div>

          <div v-if="cert.examRequirements?.length" class="text-sm">
            <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-gray-800">
              <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              考试要求
            </h4>
            <ul class="list-disc list-inside space-y-1 text-gray-600">
              <li v-for="req in cert.examRequirements" :key="req">{{ req }}</li>
            </ul>
          </div>

          <div v-if="cert.examArrangement" class="text-sm">
            <h4 class="mb-1 flex items-center gap-1.5 font-semibold text-gray-800">
              <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              考试安排
            </h4>
            <p class="text-gray-600">{{ cert.examArrangement }}</p>
          </div>

          <div v-if="cert.officialWebsite" class="text-sm">
            <h4 class="mb-1 flex items-center gap-1.5 font-semibold text-gray-800">
              <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m5.328 2.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"/></svg>
              官方网站
            </h4>
            <a :href="cert.officialWebsite" target="_blank" class="text-orange-500 hover:text-orange-600 hover:underline">
              {{ cert.officialWebsite }}
            </a>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button
        class="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
        @click="visible = false"
      >
        关闭
      </button>
    </template>
  </ElDialog>
</template>

<style scoped>
.cert-guide-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.cert-guide-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #F97316;
  margin-right: 0;
  padding-bottom: 16px;
}

.cert-guide-dialog :deep(.el-dialog__title) {
  font-weight: 700;
  color: #1f2937;
}
</style>
