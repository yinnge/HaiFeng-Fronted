<!-- apps/admin/src/views/home/consultation/index.vue -->
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getConsultationDetail, getConsultationPage } from '@/api/home/consultation'
import type {
  ConsultationDetailVO,
  ConsultationListVO,
  ConsultationQueryDTO,
} from '@/types/home/consultation'

const loading = ref(false)
const tableData = ref<ConsultationListVO[]>([])
const total = ref(0)

const query = reactive<ConsultationQueryDTO>({
  page: 1,
  size: 10,
  teacherMemberId: undefined,
  bizType: undefined,
  bizId: undefined,
  status: undefined,
  phone: undefined,
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<ConsultationDetailVO | null>(null)

async function fetchData() {
  loading.value = true
  try {
    const params: ConsultationQueryDTO = { ...query }
    // 空串不传，避免后端 Long 绑定失败
    if (!params.teacherMemberId) delete params.teacherMemberId
    if (!params.bizType) delete params.bizType
    if (!params.bizId) delete params.bizId
    if (typeof params.status !== 'number') delete params.status
    if (!params.phone) delete params.phone
    const res = await getConsultationPage(params)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取留言列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取留言列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  query.page = 1
  fetchData()
}

function handleReset() {
  query.teacherMemberId = undefined
  query.bizType = undefined
  query.bizId = undefined
  query.status = undefined
  query.phone = undefined
  query.page = 1
  fetchData()
}

function handlePageChange(page: number) {
  query.page = page
  fetchData()
}

function handleSizeChange(size: number) {
  query.size = size
  query.page = 1
  fetchData()
}

async function openDetail(row: ConsultationListVO) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const res = await getConsultationDetail(row.id)
    if (res.data.code === 200) {
      detail.value = res.data.data
    }
  } catch (e: any) {
    detailVisible.value = false
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取留言详情失败')
  } finally {
    detailLoading.value = false
  }
}

function formatTime(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrapper">
    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">咨询留言</h1>
        <p class="page-subtitle">查看 C 端用户向规划师 / 培训机构提交的预约留言（只读）</p>
      </div>
    </div>

    <div class="filter-card">
      <div class="filter-item">
        <span class="filter-label">教师会员ID</span>
        <el-input v-model="query.teacherMemberId" clearable placeholder="精确匹配" style="width: 190px" />
      </div>
      <div class="filter-item">
        <span class="filter-label">业务类型</span>
        <el-select v-model="query.bizType" clearable placeholder="全部" style="width: 140px">
          <el-option value="planner" label="规划师" />
          <el-option value="institution" label="培训机构" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">业务ID</span>
        <el-input v-model="query.bizId" clearable placeholder="精确匹配" style="width: 190px" />
      </div>
      <div class="filter-item">
        <span class="filter-label">状态</span>
        <el-select v-model="query.status" clearable placeholder="全部" style="width: 120px">
          <el-option :value="0" label="待处理" />
          <el-option :value="1" label="已处理" />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">联系电话</span>
        <el-input v-model="query.phone" clearable placeholder="精确匹配" style="width: 150px" @keyup.enter="handleSearch" />
      </div>
      <div class="filter-actions">
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <span class="toolbar-title">留言列表</span>
        <span class="record-count">{{ total }} 条记录</span>
        <el-button class="refresh-btn" text @click="fetchData">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="tableData" stripe class="custom-table">
        <el-table-column prop="id" label="留言ID" width="180" show-overflow-tooltip />
        <el-table-column prop="bizType" label="业务类型" width="110">
          <template #default="{ row }">
            <el-tag :type="row.bizType === 'planner' ? 'warning' : 'success'" size="small">
              {{ row.bizTypeDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="bizName" label="业务名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="接收教师" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.teacherUsername || '-' }}</span>
            <span class="sub-id">（{{ row.teacherMemberId }}）</span>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="留言" min-width="220" show-overflow-tooltip />
        <el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="wechat" label="微信" width="130" show-overflow-tooltip>
          <template #default="{ row }">{{ row.wechat || '-' }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'warning' : 'success'" size="small" effect="plain">
              {{ row.statusDesc }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="180">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="留言详情" width="640px" append-to-body destroy-on-close>
      <div v-loading="detailLoading" class="detail-body">
        <el-descriptions v-if="detail" :column="1" border>
          <el-descriptions-item label="留言ID">{{ detail.id }}</el-descriptions-item>
          <el-descriptions-item label="业务类型">{{ detail.bizTypeDesc }}</el-descriptions-item>
          <el-descriptions-item label="业务名称">{{ detail.bizName }}</el-descriptions-item>
          <el-descriptions-item label="业务ID">{{ detail.bizId }}</el-descriptions-item>
          <el-descriptions-item label="接收教师">
            {{ detail.teacherUsername || '-' }}（{{ detail.teacherMemberId }}）
          </el-descriptions-item>
          <el-descriptions-item label="提交人会员ID">{{ detail.senderMemberId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="留言">
            <span class="message-text">{{ detail.message }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="电话">{{ detail.phone }}</el-descriptions-item>
          <el-descriptions-item label="微信号">{{ detail.wechat || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提交IP">{{ detail.clientIp || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="detail.status === 0 ? 'warning' : 'success'" size="small">
              {{ detail.statusDesc }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatTime(detail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.updatedAt) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-wrapper {
  min-height: calc(100vh - 120px);
  padding: 24px 32px 40px;
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

.filter-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.table-card {
  padding: 16px;
  background: #fff;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.record-count {
  font-size: 12px;
  color: #9ca3af;
}

.refresh-btn {
  margin-left: auto;
}

.sub-id {
  font-size: 12px;
  color: #9ca3af;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-body {
  min-height: 120px;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
