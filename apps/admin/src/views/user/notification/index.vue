<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getNotificationPage,
  deleteNotification,
  hardDeleteNotification,
  restoreNotification,
} from '@/api/user/notification'
import type { NotificationListVO, NotificationQueryDTO } from '@/types/user/notification'
import NotificationSearch from './components/NotificationSearch.vue'
import NotificationTable from './components/NotificationTable.vue'
import NotificationDetailModal from './components/NotificationDetailModal.vue'
import BroadcastModal from './components/BroadcastModal.vue'

const loading = ref(false)
const tableData = ref<NotificationListVO[]>([])
const total = ref(0)

const queryParams = reactive<NotificationQueryDTO>({
  page: 1,
  size: 10,
  memberId: undefined,
  notificationType: undefined,
  isRead: undefined,
})

const dialogVisible = ref(false)
const broadcastVisible = ref(false)
const detailData = ref<NotificationListVO | null>(null)

const notificationTypeLabel: Record<string, string> = {
  member_expire_soon: '会员即将到期',
  member_expired: '会员已过期',
  commission_earned: '佣金到账',
  commission_paid: '佣金已发放',
  commission_rejected: '提现被拒绝',
  system_notice: '系统公告',
  member_renewed: '会员续费成功',
  member_activation_success: '会员开通成功',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.memberId) params.memberId = queryParams.memberId
    if (queryParams.notificationType) params.notificationType = queryParams.notificationType
    if (queryParams.isRead !== undefined && queryParams.isRead !== null) params.isRead = queryParams.isRead
    const res = await getNotificationPage(params as NotificationQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.memberId = undefined
  queryParams.notificationType = undefined
  queryParams.isRead = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const openDetail = (row: NotificationListVO) => {
  detailData.value = row
  dialogVisible.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要禁用该通知吗？', '提示', { type: 'warning' })
    const res = await deleteNotification(id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '禁用失败')
    }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要恢复该通知吗？', '提示', { type: 'warning' })
    const res = await restoreNotification(id)
    if (res.data.code === 200) {
      ElMessage.success('恢复成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '恢复失败')
    }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该通知吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteNotification(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const handleBroadcastSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrapper">
    <div class="watermark-top-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-bottom-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">通知管理</h1>
        <p class="page-subtitle">管理系统通知与群发公告</p>
      </div>
      <button type="button" class="broadcast-btn" @click="broadcastVisible = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
        </svg>
        群发公告
      </button>
    </div>

    <NotificationSearch
      :model-value="queryParams"
      :notification-type-label="notificationTypeLabel"
      @update:model-value="Object.assign(queryParams, $event)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <NotificationTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :notification-type-label="notificationTypeLabel"
      @detail="openDetail"
      @disable="handleDelete"
      @restore="handleRestore"
      @hard-delete="handleHardDelete"
      @refresh="fetchData"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <NotificationDetailModal
      v-model:visible="dialogVisible"
      :data="detailData"
      :notification-type-label="notificationTypeLabel"
    />

    <BroadcastModal
      v-model:visible="broadcastVisible"
      @success="handleBroadcastSuccess"
    />
  </div>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  min-height: calc(100vh - 120px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px 32px 40px;
  overflow: hidden;
}

.watermark-top-right {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 320px;
  height: 320px;
  opacity: 0.05;
  pointer-events: none;
}

.watermark-bottom-left {
  position: absolute;
  bottom: -30px;
  left: -30px;
  width: 320px;
  height: 320px;
  opacity: 0.05;
  pointer-events: none;
}

.watermark-top-right img,
.watermark-bottom-left img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}

.broadcast-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 22px;
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

.broadcast-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.broadcast-btn:active {
  transform: translateY(0);
}
</style>
