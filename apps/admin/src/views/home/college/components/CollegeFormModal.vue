<script setup lang="ts">
import { ref, watch } from 'vue'
import { COLLEGE_STAGE_OPTIONS } from '@/types/home/fileload'
import type { FileLoadUploadDTO } from '@/types/home/fileload'

const props = defineProps<{
  visible: boolean
  mode: 'upload' | 'edit'
  formLoading: boolean
  initialData?: FileLoadUploadDTO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: { file?: File; subject: string; applicableStage: string; description?: string; tag?: string }): void
}>()

const file = ref<File | null>(null)
const uploadRef = ref<any>(null)
const formData = ref<{ subject: string; applicableStage: string; description: string; tag: string }>({
  subject: '',
  applicableStage: '',
  description: '',
  tag: '',
})

// 清空上传组件内部文件列表（避免关闭后再次打开仍残留上次选择的文件）
const resetUploader = () => {
  file.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 监听弹窗打开 / 初始数据变化
watch(
  () => [props.visible, props.initialData, props.mode] as const,
  ([visible, initial, mode]) => {
    if (visible) {
      resetUploader()
      if (mode === 'edit' && initial) {
        formData.value = {
          subject: initial.subject || '',
          applicableStage: initial.applicableStage || '',
          description: initial.description || '',
          tag: initial.tag || '',
        }
      } else {
        formData.value = { subject: '', applicableStage: '', description: '', tag: '' }
      }
    }
  },
  { immediate: true },
)

/** el-upload 选择文件（手动上传模式，仅取文件对象） */
const handleFileChange = (uploadFile: any) => {
  file.value = uploadFile.raw
  return false
}

const handleSubmit = () => {
  emit('submit', {
    file: file.value || undefined,
    subject: formData.value.subject,
    applicableStage: formData.value.applicableStage,
    description: formData.value.description || undefined,
    tag: formData.value.tag || undefined,
  })
}

const handleClose = () => {
  resetUploader()
  emit('update:visible', false)
}

const dialogTitle = () => (props.mode === 'upload' ? '上传文件' : '修改文件信息')
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle()"
    width="600px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="form-content">
      <el-form :model="formData" label-width="90px" class="file-form">
        <el-form-item v-if="mode === 'upload'" label="文件" required>
          <el-upload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :show-file-list="true"
            :limit="1"
            :on-change="handleFileChange"
            class="file-uploader"
          >
            <div class="upload-area">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
              <div class="upload-hint">支持 PDF / Word / Excel / PPT / 图片 / 文本等格式</div>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="学科" required>
          <el-input
            v-model="formData.subject"
            placeholder="请输入学科（如：高等数学 / 计算机科学）"
            clearable
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="适合人群">
          <el-select
            v-model="formData.applicableStage"
            placeholder="请选择（可选）"
            clearable
            style="width: 260px"
          >
            <el-option v-for="item in COLLEGE_STAGE_OPTIONS" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="formData.tag"
            placeholder="如：备考指南 / 就业辅导（可选）"
            clearable
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="文档简介">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="选填，用于前端详情页展示"
            style="width: 420px"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">
          {{ mode === 'upload' ? '确认上传' : '保存修改' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.form-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.form-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.form-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.file-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.file-form :deep(.el-input__wrapper),
.file-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.file-form :deep(.el-input__wrapper:hover),
.file-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.file-form :deep(.el-input__wrapper.is-focus),
.file-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

/* 上传区 */
.file-uploader :deep(.el-upload-dragger) {
  border-radius: 10px;
  border: 1px dashed #d1d5db;
  background: rgba(249, 115, 22, 0.02);
  transition: all 0.25s ease;
}

.file-uploader :deep(.el-upload-dragger:hover) {
  border-color: #F97316;
  background: rgba(249, 115, 22, 0.04);
}

.upload-area {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.upload-icon {
  width: 40px;
  height: 40px;
  color: #F97316;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 14px;
  color: #374151;
}

.upload-text em {
  font-style: normal;
  color: #F97316;
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
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
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

.cancel-btn:active {
  background: #f3f4f6;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>
