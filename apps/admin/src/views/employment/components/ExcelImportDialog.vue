<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  visible: boolean
  mode: 'preValidate' | 'import'
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', file: File): void
}>()

const file = ref<File | null>(null)

watch(() => props.visible, (val) => {
  if (val) file.value = null
})

const handleFileChange = (uploadFile: any) => {
  file.value = uploadFile.raw
  return false
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleSubmit = () => {
  if (!file.value) { ElMessage.warning('请选择文件'); return }
  emit('submit', file.value)
}

const title = ref('')
watch(() => props.mode, (m) => {
  title.value = m === 'preValidate' ? 'Excel预览校验' : 'Excel批量导入'
}, { immediate: true })

const tip = ref('')
watch(() => props.mode, (m) => {
  tip.value = m === 'preValidate'
    ? '上传Excel文件进行数据校验，检查格式和内容是否符合要求。'
    : '导入Excel数据。请确保数据已通过预览校验，格式和内容符合要求。'
}, { immediate: true })
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="550px"
    class="excel-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="excel-content">
      <div class="import-tip">{{ tip }}</div>
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        :limit="1"
      >
        <div class="upload-area">
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="upload-hint">仅支持 .xlsx / .xls 格式</div>
        </div>
      </el-upload>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button
          type="button"
          :class="['submit-btn', mode === 'preValidate' ? 'submit-btn--warning' : 'submit-btn--success']"
          :disabled="loading"
          @click="handleSubmit"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ mode === 'preValidate' ? '开始校验' : '确定导入' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.excel-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.excel-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.excel-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.excel-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.excel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-tip {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.excel-dialog :deep(.el-upload-dragger) {
  border-radius: 12px;
  border: 2px dashed rgba(249, 115, 22, 0.3);
  transition: all 0.25s ease;
}

.excel-dialog :deep(.el-upload-dragger:hover) {
  border-color: #F97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.06);
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #F97316;
}

.upload-text {
  font-size: 14px;
  color: #6b7280;
}

.upload-text em {
  color: #F97316;
  font-style: normal;
  font-weight: 600;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  margin-top: 16px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  color: #fff;
}

.submit-btn--warning {
  background: linear-gradient(135deg, #F97316, #FB923C);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.submit-btn--warning:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn--success {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.submit-btn--success:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
