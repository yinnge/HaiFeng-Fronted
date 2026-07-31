<!-- apps/user/src/views/profile/components/NotificationPanel.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getNotificationPage,
  getNotificationDetail,
  markAllAsRead,
  markAsRead,
  deleteNotification,
  cleanExpired,
} from '@/api/notification'
import {
  NotificationTypeLabel,
  NotificationTypeTag,
  NotificationTypeOptions,
} from '@haifeng/shared'
import type { NotificationListVO, NotificationDetailVO, NotificationQueryDTO } from '@/types/notification'

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const tableData = ref<NotificationListVO[]>([])
const total = ref(0)
const queryParams = ref<NotificationQueryDTO>({
  page: 1,
  size: 10,
  notificationType: undefined,
  isRead: undefined,
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<NotificationDetailVO | null>(null)
const listKey = ref(0)

const isReadOptions = [
  { label: '未读', value: false },
  { label: '已读', value: true },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getNotificationPage(queryParams.value)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
      listKey.value++
    }
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryParams.value.page = 1
  loadData()
}

function handleReset() {
  queryParams.value = {
    page: 1,
    size: 10,
    notificationType: undefined,
    isRead: undefined,
  }
  loadData()
}

function handleSizeChange(val: number) {
  queryParams.value.size = val
  queryParams.value.page = 1
  loadData()
}

function handleCurrentChange(val: number) {
  queryParams.value.page = val
  loadData()
}

async function handleMarkAllRead() {
  try {
    await ElMessageBox.confirm('确定将所有消息标记为已读？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await markAllAsRead()
    ElMessage.success('已全部标记为已读')
    loadData()
    emit('refresh')
    window.dispatchEvent(new Event('notification-updated'))
  } catch {
    // cancelled
  }
}

async function handleMarkSingleRead(row: NotificationListVO) {
  if (row.isRead) return
  try {
    await markAsRead(row.id)
    row.isRead = true
    emit('refresh')
    window.dispatchEvent(new Event('notification-updated'))
  } catch {
    ElMessage.error('操作失败')
  }
}

async function handleViewDetail(row: NotificationListVO) {
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await getNotificationDetail(row.id)
    if (res.data.code === 200) {
      detailData.value = res.data.data
      if (!row.isRead) {
        await markAsRead(row.id)
        row.isRead = true
        emit('refresh')
        window.dispatchEvent(new Event('notification-updated'))
      }
    }
  } catch {
    ElMessage.error('加载详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleDelete(row: NotificationListVO) {
  try {
    await ElMessageBox.confirm('确定删除该消息？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteNotification(row.id)
    ElMessage.success('已删除')
    loadData()
    window.dispatchEvent(new Event('notification-updated'))
  } catch {
    // cancelled
  }
}

async function handleCleanExpired() {
  try {
    await ElMessageBox.confirm('确定清理已读超过 7 天的消息？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await cleanExpired()
    if (res.data.code === 200) {
      ElMessage.success(`已清理 ${res.data.data} 条过期消息`)
      loadData()
      window.dispatchEvent(new Event('notification-updated'))
    }
  } catch {
    // cancelled
  }
}

function formatTime(dateStr: string) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="notification-panel">
    <!-- 操作栏 -->
    <div class="panel-actions">
      <div class="action-left">
        <button class="action-btn action-btn-primary" @click="handleMarkAllRead">
          <svg viewBox="0 0 20 20" fill="currentColor" class="action-icon">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          一键已读
        </button>
        <button class="action-btn action-btn-danger" @click="handleCleanExpired">
          <svg viewBox="0 0 20 20" fill="currentColor" class="action-icon">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          清理过期消息
        </button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-fields">
        <div class="filter-item">
          <label class="filter-label">通知类型</label>
          <el-select v-model="queryParams.notificationType" placeholder="全部类型" clearable class="filter-select">
            <el-option
              v-for="item in NotificationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <label class="filter-label">状态</label>
          <el-select v-model="queryParams.isRead" placeholder="全部状态" clearable class="filter-select">
            <el-option
              v-for="item in isReadOptions"
              :key="String(item.value)"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </div>
      <div class="filter-actions">
        <button class="filter-btn filter-btn-primary" @click="handleSearch">
          <svg viewBox="0 0 20 20" fill="currentColor" class="filter-icon">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          搜索
        </button>
        <button class="filter-btn filter-btn-default" @click="handleReset">重置</button>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div v-loading="loading" :key="listKey" class="card-list">
      <div v-if="tableData.length === 0 && !loading" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <span class="empty-text">暂无消息</span>
      </div>
      <div
        v-for="(item, index) in tableData"
        :key="item.id"
        class="notification-card"
        :class="{ 'is-unread': !item.isRead }"
        :style="{ '--index': index }"
      >
        <div class="card-top">
          <div class="card-top-left">
            <el-tag
              :type="NotificationTypeTag[item.notificationType as keyof typeof NotificationTypeTag] || 'info'"
              size="small"
              round
            >
              {{ NotificationTypeLabel[item.notificationType as keyof typeof NotificationTypeLabel] || item.notificationType }}
            </el-tag>
          </div>
          <div class="card-top-right">
            <span v-if="item.isRead" class="read-badge">已读</span>
            <span v-else class="unread-badge">未读</span>
          </div>
        </div>
        <div class="card-body">
          <h4 class="card-title">{{ item.title }}</h4>
          <p class="card-content">{{ item.content }}</p>
        </div>
        <div class="card-footer">
          <span class="card-time">{{ formatTime(item.createdAt) }}</span>
          <div class="card-actions">
            <button
              v-if="!item.isRead"
              class="card-action-btn card-action-btn-primary"
              @click="handleMarkSingleRead(item)"
            >
              标为已读
            </button>
            <button
              class="card-action-btn card-action-btn-success"
              @click="handleViewDetail(item)"
            >
              查看
            </button>
            <button class="card-action-btn card-action-btn-danger" @click="handleDelete(item)">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="消息详情"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-loading="detailLoading" class="detail-content">
        <template v-if="detailData">
          <div class="detail-row">
            <span class="detail-label">通知类型</span>
            <el-tag
              :type="NotificationTypeTag[detailData.notificationType as keyof typeof NotificationTypeTag] || 'info'"
              size="small"
              round
            >
              {{ NotificationTypeLabel[detailData.notificationType as keyof typeof NotificationTypeLabel] || detailData.notificationType }}
            </el-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">标题</span>
            <span class="detail-value">{{ detailData.title }}</span>
          </div>
          <div class="detail-row detail-row-block">
            <span class="detail-label">内容</span>
            <span class="detail-value detail-content-text">{{ detailData.content }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <span class="detail-value">
              <el-tag :type="detailData.isRead ? 'info' : 'warning'" size="small" round>
                {{ detailData.isRead ? '已读' : '未读' }}
              </el-tag>
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ formatTime(detailData.createdAt) }}</span>
          </div>
          <div v-if="detailData.readAt" class="detail-row">
            <span class="detail-label">阅读时间</span>
            <span class="detail-value">{{ formatTime(detailData.readAt) }}</span>
          </div>
        </template>
      </div>
      <template #footer>
        <button class="detail-close-btn" @click="detailVisible = false">关闭</button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.notification-panel {
  padding: 0.5rem 0;
  scrollbar-gutter: stable;
}

/* 操作栏 */
.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
}

.action-left {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 9999px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn-primary {
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
  box-shadow: 0 2px 8px rgba(232, 114, 42, 0.25);
}

.action-btn-primary:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a);
  box-shadow: 0 4px 12px rgba(232, 114, 42, 0.35);
  transform: translateY(-1px);
}

.action-btn-danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

.action-btn-danger:hover {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

.action-icon {
  width: 1rem;
  height: 1rem;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #f3f4f6;
  margin-bottom: 1rem;
}

.filter-fields {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.filter-select {
  width: 160px;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 9999px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-btn-primary {
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
}

.filter-btn-primary:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a);
}

.filter-btn-default {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.filter-btn-default:hover {
  border-color: #e8722a;
  color: #e8722a;
}

.filter-icon {
  width: 1rem;
  height: 1rem;
}

/* 卡片列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: #d1d5db;
}

.empty-text {
  font-size: 0.9rem;
  color: #9ca3af;
}

.notification-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
  animation: cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--index, 0) * 300ms);
}

.notification-card:hover {
  border-color: rgba(249, 115, 22, 0.2);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

.notification-card.is-unread {
  border-left: 3px solid #f5a54a;
  background: linear-gradient(135deg, #fffbf7, #fff7ed);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.unread-badge {
  font-size: 0.7rem;
  font-weight: 500;
  color: #e8722a;
  background: #fff7ed;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.read-badge {
  font-size: 0.7rem;
  font-weight: 500;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.card-body {
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.375rem 0;
  line-height: 1.4;
}

.card-content {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.card-time {
  font-size: 0.8rem;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-action-btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 9999px;
  transition: all 0.15s ease;
  cursor: pointer;
}

.card-action-btn-primary {
  color: #e8722a;
  background: #fff7ed;
}

.card-action-btn-primary:hover {
  background: #ffedd5;
}

.card-action-btn-success {
  color: #059669;
  background: #ecfdf5;
}

.card-action-btn-success:hover {
  background: #d1fae5;
}

.card-action-btn-danger {
  color: #dc2626;
  background: #fef2f2;
}

.card-action-btn-danger:hover {
  background: #fee2e2;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.75rem 1.25rem;
  margin-top: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #6b7280;
  --el-pagination-button-bg-color: white;
}

:deep(.el-pagination.is-background .el-pager li) {
  border-radius: 8px;
  margin: 0 2px;
  min-width: 36px;
  height: 36px;
  line-height: 36px;
  font-weight: 500;
  border: 1px solid #f3f4f6;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.el-pagination.is-background .el-pager li:hover) {
  color: #e8722a;
  border-color: rgba(249, 115, 22, 0.3);
  background: #fff7ed;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.12);
}

:deep(.el-pagination.is-background .el-pager li:active) {
  transform: scale(0.95);
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
  border-color: transparent;
  box-shadow: 
    0 2px 8px rgba(232, 114, 42, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .btn-prev) {
  border-radius: 8px;
  min-width: 36px;
  height: 36px;
  border: 1px solid #f3f4f6;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

:deep(.el-pagination.is-background .btn-next:hover),
:deep(.el-pagination.is-background .btn-prev:hover) {
  color: #e8722a;
  border-color: rgba(249, 115, 22, 0.3);
  background: #fff7ed;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.12);
}

:deep(.el-pagination.is-background .btn-next:active),
:deep(.el-pagination.is-background .btn-prev:active) {
  transform: scale(0.95);
}

:deep(.el-pagination .el-pagination__total) {
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.el-pagination .el-pagination__total::before) {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #f5a54a, #e8722a);
  border-radius: 2px;
}

:deep(.el-pagination .el-pagination__sizes .el-select) {
  margin: 0;
}

:deep(.el-pagination .el-pagination__jump) {
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

:deep(.el-pagination .el-pagination__jump::before) {
  content: '';
  display: inline-block;
  width: 3px;
  height: 14px;
  background: linear-gradient(180deg, #f5a54a, #e8722a);
  border-radius: 2px;
}

:deep(.el-tag--small) {
  border-radius: 9999px;
}

/* 详情弹窗 */
.detail-content {
  min-height: 120px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row-block {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  min-width: 70px;
  flex-shrink: 0;
}

.detail-value {
  font-size: 0.9rem;
  color: #1f2937;
}

.detail-content-text {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-close-btn {
  padding: 0.5rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.detail-close-btn:hover {
  border-color: #e8722a;
  color: #e8722a;
}

:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 1rem;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
