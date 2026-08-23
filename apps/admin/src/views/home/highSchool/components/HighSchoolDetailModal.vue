<script setup lang="ts">
import type { FileLoadDetailVO } from '@/types/home/fileload'

const props = defineProps<{
  visible: boolean
  detailData: FileLoadDetailVO | null
  formLoading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'close'): void
}>()

/** 文件大小格式化 */
const formatSize = (bytes: number) => {
  if (!bytes && bytes !== 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let size = bytes / 1024
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`
}

/** 下载（预签名 URL） */
const handleDownload = () => {
  if (props.detailData?.fileUrl) {
    window.open(props.detailData.fileUrl, '_blank')
  }
}

/** 在线预览（KKFileView 地址，可空） */
const handlePreview = () => {
  if (props.detailData?.filePreviewUrl) {
    window.open(props.detailData.filePreviewUrl, '_blank')
  }
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="文件详情"
    width="700px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="文件名">{{ detailData.fileName }}</el-descriptions-item>
          <el-descriptions-item label="类型">
            <span v-if="detailData.fileType" class="type-pill">{{ detailData.fileType.toUpperCase() }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="大小">{{ formatSize(detailData.fileSize) }}</el-descriptions-item>
          <el-descriptions-item label="学科">
            <span v-if="detailData.subject" class="tag-pill">{{ detailData.subject }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="适合人群">
            <span v-if="detailData.applicableStage" class="tag-pill stage-pill">{{ detailData.applicableStage }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="上传人">
            <span v-if="detailData.createBy">{{ detailData.createBy }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="上传时间">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">
            <span v-if="detailData.updateTime">{{ detailData.updateTime }}</span>
            <span v-else class="dim-text">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="操作">
            <div class="file-actions">
              <button type="button" class="dl-btn" @click="handleDownload">下载文件</button>
              <button
                v-if="detailData.filePreviewUrl"
                type="button"
                class="pv-btn"
                @click="handlePreview"
              >
                在线预览
              </button>
              <span v-else class="dim-text">该格式暂不支持在线预览</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </template>
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

.dim-text {
  font-size: 13px;
  color: #9ca3af;
}

/* 学科药丸 */
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

.stage-pill {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(96, 165, 250, 0.12));
  color: #1d4ed8;
  border-color: rgba(37, 99, 235, 0.2);
}

.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  font-family: Consolas, Monaco, monospace;
}

/* 文件操作按钮 */
.file-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.dl-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 18px;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
}

.dl-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
}

.pv-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 18px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.pv-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
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
