<script setup lang="ts">
import { useExpertContact } from '@/composables/useExpertContact'

const { visible, siteInfo, loading, close } = useExpertContact()
</script>

<template>
  <el-dialog
    v-model="visible"
    title="专家指导 · 联系信息"
    width="420px"
    :close-on-click-modal="false"
    class="expert-dialog"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
    </div>
    <div v-else class="space-y-4">
      <div class="expert-info-row">
        <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <div>
          <p class="expert-info-label">公司地址</p>
          <p class="expert-info-value">{{ siteInfo?.basicMessage?.address }}</p>
        </div>
      </div>
      <div class="expert-info-row">
        <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        <div>
          <p class="expert-info-label">联系电话</p>
          <p class="expert-info-value">{{ siteInfo?.basicMessage?.phone }}</p>
        </div>
      </div>
      <div class="expert-info-row">
        <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        <div>
          <p class="expert-info-label">联系邮箱</p>
          <p class="expert-info-value">{{ siteInfo?.basicMessage?.email }}</p>
        </div>
      </div>
      <div class="expert-info-row">
        <svg class="expert-info-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        <div>
          <p class="expert-info-label">咨询时间</p>
          <p class="expert-info-value">{{ siteInfo?.basicMessage?.consultationTime }}</p>
        </div>
      </div>
      <div class="pt-2 text-center">
        <p class="mb-3 text-sm font-semibold text-gray-700">微信二维码</p>
        <div class="inline-block rounded-xl border border-orange-100 bg-orange-50/40 p-2 shadow-md">
          <img
            v-if="siteInfo?.contactUrl?.wechat"
            :src="siteInfo.contactUrl.wechat"
            alt="微信二维码"
            class="h-40 w-40 object-contain"
          />
          <div v-else class="flex h-40 w-40 items-center justify-center text-gray-400">
            二维码加载中...
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-500">扫码添加规划师微信咨询</p>
      </div>
    </div>
    <template #footer>
      <button
        class="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 spring-fast"
        @click="close"
      >我知道了</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.expert-info-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 247, 237, 0.6);
  padding: 0.75rem;
}

.expert-info-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
  color: #f97316;
}

.expert-info-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.expert-info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}
</style>

<style>
.expert-dialog .el-dialog {
  border-radius: 12px;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
  border-top: 3px solid #f97316;
  border-bottom: 3px solid #fb923c;
  overflow: hidden;
}

.expert-dialog .el-dialog__header {
  border-bottom: 1px solid rgba(249, 115, 22, 0.2);
  padding-bottom: 14px;
}

.expert-dialog .el-dialog__title {
  color: #1f2937;
  font-weight: 700;
}

.expert-dialog .el-dialog__body {
  padding-top: 16px;
}
</style>
