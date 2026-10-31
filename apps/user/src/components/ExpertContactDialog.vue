<script setup lang="ts">
import { useExpertContact } from '@/composables/useExpertContact'

const { visible, siteInfo, loading, close } = useExpertContact()
</script>

<template>
  <el-dialog
    v-model="visible"
    title="专家指导 · 联系信息"
    width="440px"
    :close-on-click-modal="false"
    class="expert-dialog"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500"></div>
    </div>
    <div v-else class="space-y-5">
      <!-- 二维码 Hero：置于最上方，图注脚在下方 -->
      <figure class="qr-figure">
        <div class="qr-frame">
          <img
            v-if="siteInfo?.contactUrl?.wechat"
            :src="siteInfo.contactUrl.wechat"
            alt="微信二维码"
            class="qr-img"
          />
          <div v-else class="qr-img flex items-center justify-center text-gray-400">
            二维码加载中...
          </div>
        </div>
        <figcaption class="qr-caption">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.75 4.5v3M3.75 16.5v3M20.25 4.5v3M20.25 16.5v3M4.5 3.75h3M16.5 3.75h3M4.5 20.25h3M16.5 20.25h3M3.75 12h16.5" />
          </svg>
          规划师微信咨询
        </figcaption>
      </figure>

      <!-- 其他咨询方式：电话 / 咨询时间 以 2 列网格紧凑展示，联系邮箱做底部收口条 -->
      <div class="contact-card">
        <div class="contact-card-head">
          <svg class="head-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2.25 12.75c0 4.56 3.69 8.25 8.25 8.25h.75a2.25 2.25 0 0 0 2.25-2.25v-.75a2.25 2.25 0 0 1 2.25-2.25h.75a2.25 2.25 0 0 0 2.25-2.25v-2.25A8.25 8.25 0 0 0 12 3.75H4.5A2.25 2.25 0 0 0 2.25 6v6.75Z" />
            <path d="M7.5 10.5h.008v.008H7.5v-.008Zm4.5 0h.008v.008h-.008v-.008Zm4.5 0h.008v.008h-.008v-.008Z" />
          </svg>
          其他咨询方式
        </div>

        <div class="contact-grid">
          <div class="contact-item">
            <span class="contact-icon contact-icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.436-4.136-7.032-7.032l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </span>
            <div class="contact-text">
              <p class="contact-label">联系电话</p>
              <p class="contact-value">{{ siteInfo?.basicMessage?.phone || '暂未提供' }}</p>
            </div>
          </div>

          <div class="contact-item">
            <span class="contact-icon contact-icon--amber">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            <div class="contact-text">
              <p class="contact-label">咨询时间</p>
              <p class="contact-value">{{ siteInfo?.basicMessage?.consultationTime || '暂未提供' }}</p>
            </div>
          </div>
        </div>

        <div class="contact-foot">
          <span class="contact-icon contact-icon--green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </span>
          <div class="contact-text">
            <p class="contact-label">联系邮箱</p>
            <p class="contact-value">{{ siteInfo?.basicMessage?.email || '暂未提供' }}</p>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button
        class="rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-[#EA580C] hover:to-[#D9700F] spring-fast"
        @click="close"
      >我知道了</button>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 二维码 Hero */
.qr-figure {
  margin: 0;
  text-align: center;
}

.qr-frame {
  display: block;
  width: 100%;
  padding: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid var(--neutral-border);
  border-radius: 20px;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.08);
}

.qr-img {
  width: 100%;
  aspect-ratio: 1 / 1;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: 8px;
}

.qr-caption {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.qr-caption svg {
  width: 15px;
  height: 15px;
  color: #94a3b8;
}

/* 联系信息卡片 */
.contact-card {
  background: #ffffff;
  border: 1px solid var(--neutral-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.contact-card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.contact-card-head .head-icon {
  width: 18px;
  height: 18px;
  color: #f97316;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--neutral-bg);
  border-radius: 12px;
  padding: 10px 12px;
}

.contact-icon {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-icon svg {
  width: 18px;
  height: 18px;
}

.contact-icon--blue {
  background: #eff6ff;
  color: #2563eb;
}

.contact-icon--green {
  background: #ecfdf5;
  color: #059669;
}

.contact-icon--amber {
  background: #fffbeb;
  color: #d97706;
}

.contact-text {
  min-width: 0;
}

.contact-label {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 2px;
}

.contact-value {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  word-break: break-all;
}

.contact-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  background: var(--neutral-bg);
  border-radius: 12px;
  padding: 10px 12px;
}
</style>

<style>
.expert-dialog .el-dialog {
  border-radius: 16px;
  background: #ffffff;
  overflow: hidden;
}

.expert-dialog .el-dialog__header {
  border-bottom: 1px solid var(--neutral-border);
  padding-bottom: 14px;
}

.expert-dialog .el-dialog__title {
  color: #1f2937;
  font-weight: 700;
}

.expert-dialog .el-dialog__body {
  padding-top: 18px;
}
</style>
