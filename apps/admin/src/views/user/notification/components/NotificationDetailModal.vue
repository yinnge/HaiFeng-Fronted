<script setup lang="ts">
import type { NotificationListVO } from '@/types/user/notification'

defineProps<{
  visible: boolean
  data: NotificationListVO | null
  notificationTypeLabel: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="通知详情"
    width="700px"
    class="detail-dialog"
    @close="handleClose"
  >
    <div v-if="data" class="detail-content">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ data.id }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ data.memberId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ data.memberName }}</el-descriptions-item>
        <el-descriptions-item label="通知类型">{{ notificationTypeLabel[data.notificationType] || data.notificationType }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ data.title }}</el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="content-text">{{ data.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="已读状态">
          <span :class="['status-pill', data.isRead ? 'status-read' : 'status-unread']">
            {{ data.isRead ? '已读' : '未读' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="阅读时间">{{ data.readAt || '-' }}</el-descriptions-item>
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
  width: 90px;
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

.content-text {
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-read {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.status-unread {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
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
