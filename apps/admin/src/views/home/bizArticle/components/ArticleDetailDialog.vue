<script setup lang="ts">
import { computed, ref } from 'vue'
import { sanitizeArticleHtml } from '@/utils/sanitize'
import '@/assets/styles/article-content.css'
import type { BizArticleDetailVO } from '@/types/home/bizArticle'

const props = defineProps<{
  visible: boolean
  detailData: BizArticleDetailVO | null
  formLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'close'): void
}>()

/** 展示前前端再过一层 DOMPurify（双保险），并把 table 包上 .table-wrap */
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

const formatTime = (s: string | null) => (s ? s.replace('T', ' ').slice(0, 16) : '-')

const handleClose = () => {
  lightboxUrl.value = ''
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="资讯详情"
    width="900px"
    top="6vh"
    class="article-detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <div class="detail-header">
          <div class="detail-title">{{ detailData.title }}</div>
          <div class="detail-meta">
            <span class="meta-pill module">{{ detailData.moduleName }}</span>
            <span v-if="detailData.columnName" class="meta-pill column">{{ detailData.columnName }}</span>
            <span v-if="detailData.province" class="meta-pill">{{ detailData.province }}</span>
            <span v-if="detailData.year != null" class="meta-pill">{{ detailData.year }} 年</span>
            <span :class="detailData.status === 1 ? 'meta-pill off' : 'meta-pill on'">
              {{ detailData.status === 1 ? '下架' : '已发布' }}
            </span>
            <span class="meta-text">浏览 {{ detailData.viewCount ?? 0 }}</span>
            <span class="meta-text">发布于 {{ formatTime(detailData.publishTime) }}</span>
          </div>
          <p v-if="detailData.summary" class="detail-summary">{{ detailData.summary }}</p>
        </div>

        <el-divider content-position="left">正文</el-divider>

        <!-- v-html 的 DOM 不受 scoped 约束，样式走全局 .article-content（见 assets/styles/article-content.css） -->
        <div class="article-content" v-html="safeContent" @click="handleContentClick"></div>
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
.article-detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.article-detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.article-detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.article-detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 68vh;
  overflow-y: auto;
}

.article-detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.detail-content {
  min-height: 120px;
}

.detail-header {
  padding-bottom: 8px;
}

.detail-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.5;
  margin-bottom: 10px;
}

.detail-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-pill {
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

.meta-pill.module {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-color: transparent;
}

.meta-pill.column {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(96, 165, 250, 0.12));
  color: #1d4ed8;
  border-color: rgba(37, 99, 235, 0.2);
}

.meta-pill.on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.16));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.3);
}

.meta-pill.off {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.meta-text {
  font-size: 12px;
  color: #9ca3af;
}

.detail-summary {
  margin: 0;
  padding: 10px 14px;
  background: #fff7ed;
  border-left: 3px solid #FB923C;
  border-radius: 0 8px 8px 0;
  color: #7c2d12;
  font-size: 14px;
  line-height: 1.7;
}

.detail-content :deep(.el-divider__text) {
  font-weight: 600;
  color: #374151;
  background: #fff;
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
</style>
