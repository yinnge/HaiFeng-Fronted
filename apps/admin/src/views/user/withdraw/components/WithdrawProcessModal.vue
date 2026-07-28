<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { processWithdraw } from '@/api/user/withdraw'
import type { WithdrawProcessDTO } from '@/types/user/withdraw'

const props = defineProps<{
  visible: boolean
  withdrawId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const processAction = ref<'paid' | 'rejected'>('paid')
const processRemark = ref('')
const processing = ref(false)

const handleCancel = () => {
  emit('update:visible', false)
}

const handleConfirm = async () => {
  if (!props.withdrawId) return
  processing.value = true
  try {
    const data: WithdrawProcessDTO = { action: processAction.value }
    if (processRemark.value) data.remark = processRemark.value
    const res = await processWithdraw(props.withdrawId, data)
    if (res.data.code === 200) {
      ElMessage.success(processAction.value === 'paid' ? '打款成功' : '已拒绝')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.data.msg || '处理失败')
    }
  } catch {
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      processAction.value = 'paid'
      processRemark.value = ''
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="处理提现"
    width="480px"
    :close-on-click-modal="false"
    class="process-dialog"
    @update:model-value="handleCancel"
  >
    <div class="process-body">
      <div class="action-label">选择操作</div>
      <el-radio-group v-model="processAction" class="action-radio-group">
        <label :class="['action-radio', processAction === 'paid' ? 'radio-active' : '']">
          <el-radio value="paid" class="hide-radio">
            <span class="radio-content">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              确认打款
            </span>
          </el-radio>
        </label>
        <label :class="['action-radio', processAction === 'rejected' ? 'radio-active-reject' : '']">
          <el-radio value="rejected" class="hide-radio">
            <span class="radio-content">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              拒绝提现
            </span>
          </el-radio>
        </label>
      </el-radio-group>

      <div class="remark-section">
        <div class="section-label">
          <span class="label-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </span>
          处理备注
        </div>
        <el-input
          v-model="processRemark"
          type="textarea"
          :rows="3"
          placeholder="请输入处理备注（可选）"
          maxlength="500"
        />
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="exit-btn" @click="handleCancel">取消</button>
        <button
          type="button"
          :class="['confirm-btn', processAction === 'paid' ? 'confirm-pay' : 'confirm-reject']"
          :disabled="processing"
          @click="handleConfirm"
        >
          <span v-if="processing" class="loading-spinner"></span>
          {{ processAction === 'paid' ? '确认打款' : '确认拒绝' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.process-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.process-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.process-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.process-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.process-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.process-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.action-radio-group {
  display: flex;
  gap: 12px;
}

.action-radio {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-radio:hover {
  border-color: #d1d5db;
}

.radio-active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.radio-active-reject {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.hide-radio :deep(.el-radio__input) {
  display: none;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.remark-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  width: fit-content;
}

.label-icon {
  display: flex;
  align-items: center;
}

.process-dialog :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.process-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.process-dialog :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.exit-btn {
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

.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.confirm-pay {
  background: linear-gradient(135deg, #10b981, #34d399);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.confirm-pay:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.confirm-reject {
  background: linear-gradient(135deg, #ef4444, #f87171);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.confirm-reject:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.confirm-btn:disabled {
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
