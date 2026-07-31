<script setup lang="ts">
import type { OrderDetailVO } from '@/types/user/order'
import { MemberTypeLabel, OrderStatusLabel, OrderStatusTagClass, OrderStatus } from '@haifeng/shared'

defineProps<{
  visible: boolean
  detailData: OrderDetailVO | null
  formLoading: boolean
  wechatPlaintext: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'view-wechat'): void
  (e: 'close'): void
}>()

const orderTypeLabel: Record<string, string> = {
  new: '新开通',
  renewal: '续费升级',
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="订单详情"
    width="700px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="detail-content">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="会员名称">{{ detailData.memberName }}</el-descriptions-item>
          <el-descriptions-item label="会员ID">{{ detailData.memberId }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
          <el-descriptions-item label="微信号">
            <span class="wechat-value">{{ wechatPlaintext || detailData.wechatId || '-' }}</span>
            <button
              v-if="detailData.wechatId && !wechatPlaintext"
              type="button"
              class="view-wechat-btn"
              @click="emit('view-wechat')"
            >
              查看明文
            </button>
          </el-descriptions-item>
          <el-descriptions-item label="订单类型">
            <span class="type-badge">{{ orderTypeLabel[detailData.orderType] }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="变更前">{{ MemberTypeLabel[detailData.beforeType as keyof typeof MemberTypeLabel] }}</el-descriptions-item>
          <el-descriptions-item label="变更后">{{ MemberTypeLabel[detailData.afterType as keyof typeof MemberTypeLabel] }}</el-descriptions-item>
          <el-descriptions-item label="开通时长">{{ detailData.durationMonths }}个月</el-descriptions-item>
          <el-descriptions-item label="金额">
            <span class="amount-value">¥{{ detailData.amount?.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <span :class="['status-tag', OrderStatusTagClass[detailData.status as OrderStatus]]">
              {{ OrderStatusLabel[detailData.status as OrderStatus] }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ detailData.paymentMethod === 'wechat' ? '微信支付' : '线下转账' }}
          </el-descriptions-item>
          <el-descriptions-item label="变更前到期">{{ detailData.beforeExpireAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="变更后到期">{{ detailData.afterExpireAt }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ detailData.operatorName }}</el-descriptions-item>
          <el-descriptions-item label="操作人ID">{{ detailData.operatorId }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
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

.wechat-value {
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 13px;
  color: #6b7280;
}

.view-wechat-btn {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  padding: 2px 10px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-wechat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

.type-badge {
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

.amount-value {
  font-size: 16px;
  font-weight: 700;
  color: #F97316;
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

.status-completed {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.status-cancelled {
  background: linear-gradient(135deg, #9ca3af, #d1d5db);
  color: #fff;
}

.status-revoked {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
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
