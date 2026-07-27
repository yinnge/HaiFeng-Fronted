<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AnnouncementAddDTO } from '@/types/home/announcement'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  formLoading: boolean
  initialData?: AnnouncementAddDTO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: AnnouncementAddDTO): void
}>()

const formData = ref<AnnouncementAddDTO>({
  title: '',
  content: '',
  tag: '',
})

// 监听弹窗打开 / 初始数据变化
watch(
  () => [props.visible, props.initialData, props.mode] as const,
  ([visible, initial, mode]) => {
    if (visible) {
      if (mode === 'edit' && initial) {
        formData.value = {
          title: initial.title || '',
          content: initial.content || '',
          tag: initial.tag || '',
        }
      } else {
        formData.value = { title: '', content: '', tag: '' }
      }
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}

const handleClose = () => {
  emit('update:visible', false)
}

const dialogTitle = () => (props.mode === 'add' ? '新增公告' : '修改公告')
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle()"
    width="700px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="form-content">
      <el-form :model="formData" label-width="80px" class="announcement-form">
        <el-form-item label="标题" required>
          <el-input
            v-model="formData.title"
            placeholder="请输入标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-input
            v-model="formData.tag"
            placeholder="请输入标签（可选）"
            maxlength="20"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="8"
            placeholder="请输入公告内容（支持 HTML）"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">
          {{ mode === 'add' ? '确认新增' : '保存修改' }}
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

.announcement-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.announcement-form :deep(.el-input__wrapper),
.announcement-form :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.announcement-form :deep(.el-input__wrapper:hover),
.announcement-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.announcement-form :deep(.el-input__wrapper.is-focus),
.announcement-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
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
