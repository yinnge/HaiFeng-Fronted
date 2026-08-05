<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { broadcastNotification } from '@/api/user/notification'
import type { BroadcastDTO } from '@/types/user/notification'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const broadcasting = ref(false)
const form = reactive<BroadcastDTO>({ title: '', content: '' })

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.title = ''
      form.content = ''
    }
  }
)

const handleSubmit = async () => {
  if (!form.title || !form.content) {
    ElMessage.warning('请填写公告标题和内容')
    return
  }
  broadcasting.value = true
  try {
    const res = await broadcastNotification({ title: form.title, content: form.content })
    if (res.data.code === 200) {
      ElMessage.success('群发任务已提交')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.data.msg || '群发失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '群发失败')
  } finally {
    broadcasting.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="群发系统公告"
    width="500px"
    class="broadcast-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="broadcast-content">
      <div class="broadcast-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span>群发公告将发送给所有用户，请谨慎操作</span>
      </div>
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" required>
          <el-input
            v-model="form.title"
            placeholder="请输入公告标题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="6"
            placeholder="请输入公告内容"
            maxlength="5000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" :disabled="broadcasting" @click="handleSubmit">
          <svg v-if="!broadcasting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
          </svg>
          <span v-if="broadcasting" class="loading-spinner"></span>
          确认群发
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.broadcast-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.broadcast-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.broadcast-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.broadcast-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.broadcast-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.broadcast-content :deep(.el-input__wrapper),
.broadcast-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.broadcast-content :deep(.el-input__wrapper:hover),
.broadcast-content :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.broadcast-content :deep(.el-input__wrapper.is-focus),
.broadcast-content :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.broadcast-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.broadcast-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.1));
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px;
  margin-bottom: 20px;
  color: #C2410C;
  font-size: 13px;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
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
