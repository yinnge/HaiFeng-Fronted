<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getScorePage,
  toggleScoreStatus,
  deleteScore,
  batchDeleteScore,
} from '@/api/special/strong-base-score'
import type {
  StrongBaseScoreListVO,
  StrongBaseScoreQueryDTO,
} from '@/types/special/strong-base-score'
import SbsScoreSearch from './components/SbsScoreSearch.vue'
import SbsScoreTable from './components/SbsScoreTable.vue'
import SbsScoreDetailModal from './components/SbsScoreDetailModal.vue'

const loading = ref(false)
const tableData = ref<StrongBaseScoreListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<StrongBaseScoreQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  year: undefined,
  province: '',
  subjectType: undefined,
})

const subjectTypeOptions = [
  { label: '物理类', value: '物理类' },
  { label: '历史类', value: '历史类' },
  { label: '理科', value: '理科' },
  { label: '文科', value: '文科' },
  { label: '综合改革', value: '综合改革' },
]

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const currentId = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.year) params.year = queryParams.year
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.subjectType) params.subjectType = queryParams.subjectType
    const res = await getScorePage(params as StrongBaseScoreQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }

const handleReset = () => {
  queryParams.universityName = ''
  queryParams.year = undefined
  queryParams.province = ''
  queryParams.subjectType = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: StrongBaseScoreListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  dialogVisible.value = true
}

const handleToggleStatus = async (row: StrongBaseScoreListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该数据吗？`, '提示')
    const res = await toggleScoreStatus(row.id)
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
    await ElMessageBox.confirm('确定要删除该数据吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteScore(id)
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
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条数据吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteScore(selectedIds.value)
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
        <h1 class="page-title">重点线差分数管理</h1>
        <p class="page-subtitle">管理各大学重点批次的录取分数线与入围数据</p>
      </div>
    </div>

    <SbsScoreSearch
      :university-name="queryParams.universityName!"
      :year="queryParams.year"
      :province="queryParams.province!"
      :subject-type="queryParams.subjectType"
      :subject-type-options="subjectTypeOptions"
      @update:university-name="queryParams.universityName = $event"
      @update:year="queryParams.year = $event"
      @update:province="queryParams.province = $event"
      @update:subject-type="queryParams.subjectType = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <SbsScoreTable
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

    <SbsScoreDetailModal
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :current-id="currentId"
      :subject-type-options="subjectTypeOptions"
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
