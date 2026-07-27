<script setup lang="ts">
import type { CommissionListVO } from '@/types/user/commission'

defineProps<{
  visible: boolean
  data: CommissionListVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const handleClose = () => {
  emit('update:visible', false)
}

const formatMoney = (val: number) => val?.toFixed(2) || '0.00'
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="佣金详情"
    width="650px"
    class="detail-dialog"
    @close="handleClose"
  >
    <div v-if="data" class="detail-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="ID">{{ data.id }}</el-descriptions-item>
        <el-descriptions-item label="推荐人">{{ data.referrerName }}</el-descriptions-item>
        <el-descriptions-item label="推荐人手机号">{{ data.referrerPhone }}</el-descriptions-item>
        <el-descriptions-item label="被推荐人">{{ data.refereeName }}</el-descriptions-item>
        <el-descriptions-item label="被推荐人手机号">{{ data.refereePhone }}</el-descriptions-item>
        <el-descriptions-item label="关联订单ID">{{ data.orderId }}</el-descriptions-item>
        <el-descriptions-item label="订单金额">
          <span class="money-highlight">¥{{ formatMoney(data.orderAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="佣金比例">
          <span class="rate-highlight">{{ data.commissionRate }}%</span>
        </el-descriptions-item>
        <el-descriptions-item label="佣金金额">
          <span class="money-highlight primary">¥{{ formatMoney(data.commissionAmount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ data.createdAt }}</el-descriptions-item>
      </el-descriptions>
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

.money-highlight {
  font-weight: 600;
  color: #374151;
}

.money-highlight.primary {
  color: #F97316;
  font-size: 16px;
  font-weight: 700;
}

.rate-highlight {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.1));
  color: #C2410C;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
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
