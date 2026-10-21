<script setup lang="ts">
import { computed, ref } from 'vue'
import { sanitizeArticleHtml } from '@/utils/sanitize'
import '@/assets/styles/article-content.css'
import type { AnnouncementDetailVO } from '@/types/home/announcement'

const props = defineProps<{
  visible: boolean
  detailData: AnnouncementDetailVO | null
  formLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'close'): void
}>()

const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

/** 展示前前端再过一层 DOMPurify（双保险），链接强制新窗口打开 */
const safeContent = computed(() => sanitizeArticleHtml(props.detailData?.content))

/** 图片点击放大：轻量 lightbox（零依赖，事件委托在内容容器上） */
const lightboxUrl = ref('')
const handleContentClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.tagName === 'IMG') {
    lightboxUrl.value = (target as HTMLImageElement).src
  }
}
const closeLightbox = () => {
  lightboxUrl.value = ''
}

const handleClose = () => {
  lightboxUrl.value = ''
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="公告详情"
    width="900px"
    top="6vh"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
          <el-descriptions-item label="标签">
            <span v-if="detailData.tag" class="tag-pill">{{ detailData.tag }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
              {{ statusLabel(detailData.status) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">正文</el-divider>

        <!-- v-html 的 DOM 不受 scoped 约束，样式走全局 .article-content（见 assets/styles/article-content.css） -->
        <div class="article-content announcement-content" v-html="safeContent" @click="handleContentClick"></div>
      </template>
    </div>

    <!-- 图片放大遮罩 -->
    <div v-if="lightboxUrl" class="article-lightbox" @click="closeLightbox">
      <img :src="lightboxUrl" alt="图片预览" />
    </div>

    <template #footer>
      <button type="button" class="close-btn" @click="handleClose">关闭</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 68vh;
  overflow-y: auto;
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.detail-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.detail-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
  width: 110px;
}

.detail-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.detail-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.detail-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.detail-content :deep(.el-divider__text) {
  font-weight: 600;
  color: #374151;
  background: #fff;
}

/* 公告正文容器：去掉 .article-content 默认超大字号，适配弹窗场景 */
.announcement-content {
  max-height: 320px;
  overflow-y: auto;
  padding: 16px;
  background: rgba(249, 115, 22, 0.02);
  border: 1px solid rgba(249, 115, 22, 0.08);
  border-radius: 8px;
}

.dim-text {
  font-size: 13px;
  color: #9ca3af;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}

.status-on {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border-color: rgba(249, 115, 22, 0.2);
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

/* 图片放大遮罩（本组件自身渲染，scoped 生效） */
.article-lightbox {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.article-lightbox img {
  max-width: 92vw;
  max-height: 92vh;
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}

.close-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.close-btn:active {
  transform: translateY(0);
}
</style>
