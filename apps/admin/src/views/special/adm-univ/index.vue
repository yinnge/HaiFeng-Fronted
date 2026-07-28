<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getChannelUnivPage,
  toggleChannelUnivStatus,
  deleteChannelUniv,
  batchDeleteChannelUniv,
} from '@/api/special/channel-univ'
import type { ChannelUnivListVO } from '@/types/special/channel-univ'
import AdmUnivSearch from './components/AdmUnivSearch.vue'
import AdmUnivTable from './components/AdmUnivTable.vue'
import AdmUnivDetailModal from './components/AdmUnivDetailModal.vue'

const loading = ref(false)
const allData = ref<ChannelUnivListVO[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
})

const filterChannelName = ref('')
const filterUniversityName = ref('')
const filterYear = ref<number | undefined>(undefined)

const filteredData = computed(() => {
  return allData.value.filter((item) => {
    if (filterChannelName.value && !item.channelName.includes(filterChannelName.value)) return false
    if (filterUniversityName.value && !item.universityName.includes(filterUniversityName.value)) return false
    if (filterYear.value !== undefined && filterYear.value !== null && item.year !== filterYear.value) return false
    return true
  })
})

const total = computed(() => filteredData.value.length)

const tableData = computed(() => {
  const start = (queryParams.page - 1) * queryParams.size
  return filteredData.value.slice(start, start + queryParams.size)
})

const selectedIds = ref<string[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const currentId = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getChannelUnivPage({ page: 1, size: 1000 })
    if (res.data.code === 200) {
      allData.value = res.data.data.records
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1 }

const handleReset = () => {
  filterChannelName.value = ''
  filterUniversityName.value = ''
  filterYear.value = undefined
  queryParams.page = 1
}

const handlePageChange = (page: number) => { queryParams.page = page }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
}

const handleSelectionChange = (rows: ChannelUnivListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  dialogVisible.value = true
}

const handleToggleStatus = async (row: ChannelUnivListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该关联吗？`, '提示')
    const res = await toggleChannelUnivStatus(row.id)
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
    await ElMessageBox.confirm('确定要删除该关联吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteChannelUniv(id)
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
    ElMessage.warning('请先选择要删除的关联')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条关联吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteChannelUniv(selectedIds.value)
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
  <div class="page-wrapper">
    <div class="watermark-top-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-bottom-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">通道院校关联管理</h1>
        <p class="page-subtitle">管理通道与大学的招生关联信息</p>
      </div>
    </div>

    <AdmUnivSearch
      :channel-name="filterChannelName"
      :university-name="filterUniversityName"
      :year="filterYear"
      @update:channel-name="filterChannelName = $event"
      @update:university-name="filterUniversityName = $event"
      @update:year="filterYear = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <AdmUnivTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
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

    <AdmUnivDetailModal
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :current-id="currentId"
      @success="handleDialogSuccess"
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
</style>
