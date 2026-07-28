<script setup lang="ts">
import type { WithdrawListVO } from '@/types/user/withdraw'

const props = defineProps<{
  visible: boolean
  data: WithdrawListVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const statusLabel: Record<string, string> = {
  pending: '待处理',
  paid: '已支付',
  rejected: '已拒绝',
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="提现详情"
    width="600px"
    :close-on-click-modal="false"
    class="detail-dialog"
    @update:model-value="handleClose"
  >
    <template v-if="data">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">{{ data.memberId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ data.memberName }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ data.phone }}</el-descriptions-item>
        <el-descriptions-item label="微信号">{{ data.wechatId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提现金额">
          <span class="amount-text">¥{{ data.amount?.toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <span v-if="data.status === 'pending'" class="status-tag status-pending">待处理</span>
          <span v-else-if="data.status === 'paid'" class="status-tag status-paid">已支付</span>
          <span v-else-if="data.status === 'rejected'" class="status-tag status-rejected">已拒绝</span>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ data.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注">{{ data.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ data.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ data.updatedAt || '-' }}</el-descriptions-item>
      </el-descriptions>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="exit-btn" @click="handleClose">关闭</button>
      </div>
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

.detail-dialog :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.detail-dialog :deep(.el-descriptions__label) {
  font-weight: 500;
  color: #374151;
}

.amount-text {
  font-weight: 600;
  color: #F97316;
  font-size: 15px;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #fff;
}

.status-paid {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.status-rejected {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.exit-btn {
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

.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
</style>
