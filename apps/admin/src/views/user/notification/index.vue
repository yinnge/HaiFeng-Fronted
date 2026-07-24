<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getNotificationPage,
  broadcastNotification,
  deleteNotification,
  hardDeleteNotification,
  restoreNotification,
} from '@/api/user/notification'
import type { NotificationListVO, NotificationQueryDTO, BroadcastDTO } from '@/types/user/notification'

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
const formLoading = ref(false)
const detailData = ref<NotificationListVO | null>(null)
const broadcastForm = reactive<BroadcastDTO>({ title: '', content: '' })
const broadcasting = ref(false)

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

const openBroadcast = () => {
  broadcastForm.title = ''
  broadcastForm.content = ''
  broadcastVisible.value = true
}

const handleBroadcast = async () => {
  if (!broadcastForm.title || !broadcastForm.content) {
    ElMessage.warning('请填写公告标题和内容')
    return
  }
  broadcasting.value = true
  try {
    const res = await broadcastNotification({ title: broadcastForm.title, content: broadcastForm.content })
    if (res.data.code === 200) {
      ElMessage.success('群发任务已提交')
      broadcastVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '群发失败')
    }
  } catch {
    ElMessage.error('群发失败')
  } finally {
    broadcasting.value = false
  }
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="用户ID">
          <el-input-number v-model="queryParams.memberId" :min="1" :value-on-clear="undefined" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="queryParams.notificationType" placeholder="全部" clearable style="width: 160px">
            <el-option v-for="(label, val) in notificationTypeLabel" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否已读">
          <el-select v-model="queryParams.isRead" placeholder="全部" clearable style="width: 100px">
            <el-option label="已读" :value="true" />
            <el-option label="未读" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <el-button type="primary" @click="openBroadcast">群发公告</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="memberId" label="用户ID" width="100" />
        <el-table-column prop="memberName" label="用户名" width="100" />
        <el-table-column prop="notificationType" label="通知类型" width="130">
          <template #default="{ row }">
            <el-tag size="small">{{ notificationTypeLabel[row.notificationType] || row.notificationType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isRead" label="已读状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'success' : 'info'" size="small">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">禁用</el-button>
            <el-button type="success" link @click="handleRestore(row.id)">恢复</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id)">硬删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="通知详情" width="700px" :close-on-click-modal="false">
      <template v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.memberId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.memberName }}</el-descriptions-item>
          <el-descriptions-item label="通知类型">{{ notificationTypeLabel[detailData.notificationType] || detailData.notificationType }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ detailData.content }}</el-descriptions-item>
          <el-descriptions-item label="已读状态">{{ detailData.isRead ? '已读' : '未读' }}</el-descriptions-item>
          <el-descriptions-item label="阅读时间">{{ detailData.readAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="broadcastVisible" title="群发系统公告" width="500px" :close-on-click-modal="false">
      <el-form :model="broadcastForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="broadcastForm.title" placeholder="请输入公告标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="broadcastForm.content" type="textarea" :rows="6" placeholder="请输入公告内容" maxlength="5000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="broadcastVisible = false">取消</el-button>
        <el-button type="primary" :loading="broadcasting" @click="handleBroadcast">确认群发</el-button>
      </template>
    </el-dialog>
  </div>
</template>
