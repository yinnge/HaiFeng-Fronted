<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getChannelPage,
  toggleChannelStatus,
  deleteChannel,
  batchDeleteChannel,
} from '@/api/special/channel'
import type {
  ChannelListVO,
  ChannelQueryDTO,
} from '@/types/special/channel'
import AdmissionSearch from './components/AdmissionSearch.vue'
import AdmissionTable from './components/AdmissionTable.vue'
import AdmissionDetailModal from './components/AdmissionDetailModal.vue'

const loading = ref(false)
const tableData = ref<ChannelListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<ChannelQueryDTO>({
  page: 1,
  size: 10,
  displayType: undefined,
  channelName: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const currentId = ref<string | null>(null)

const displayTypeOptions = [
  { label: '院校列表', value: 'UNIVERSITY_LIST' },
  { label: '仅文章', value: 'ARTICLE_ONLY' },
  { label: '专业数据', value: 'MAJOR_DATA' },
  { label: '分组节点', value: 'GROUP' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.displayType) params.displayType = queryParams.displayType
    if (queryParams.channelName) params.channelName = queryParams.channelName
    const res = await getChannelPage(params as ChannelQueryDTO)
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

const handleSearch = () => { queryParams.page = 1; fetchData() }

const handleReset = () => {
  queryParams.displayType = undefined
  queryParams.channelName = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: ChannelListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  dialogVisible.value = true
}

const handleToggleStatus = async (row: ChannelListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该通道吗？`, '提示')
    const res = await toggleChannelStatus(row.id)
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该通道吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteChannel(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的通道')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条通道吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteChannel(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* 取消 */ }
}

const handleDialogSuccess = () => {
  fetchData()
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-x">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>

    <div class="page-header">
      <h1 class="page-title">通道管理</h1>
      <p class="page-subtitle">管理展示通道配置与内容类型</p>
    </div>

    <AdmissionSearch
      :model-value="queryParams"
      :display-type-options="displayTypeOptions"
      @update:model-value="Object.assign(queryParams, $event)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <AdmissionTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :display-type-options="displayTypeOptions"
      :selected-ids="selectedIds"
      @detail="openDialog('detail', $event.id)"
      @edit="openDialog('edit', $event.id)"
      @toggle-status="handleToggleStatus"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @add="openDialog('add')"
      @refresh="fetchData"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <AdmissionDetailModal
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :current-id="currentId"
      :display-type-options="displayTypeOptions"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<style scoped>
.page-x {
  position: relative;
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  overflow: hidden;
}

.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left { top: -60px; right: 40px; transform: rotate(18deg); }
.watermark-right { bottom: -40px; left: 30px; transform: rotate(-12deg); }
.watermark-left img,
.watermark-right img { width: 180px; height: auto; }

.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}
</style>
