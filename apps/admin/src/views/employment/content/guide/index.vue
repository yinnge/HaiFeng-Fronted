<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getExamGuidePage, getExamGuideDetail, updateExamGuide, deleteExamGuide, updateExamGuideStatus, batchDeleteExamGuide } from '@/api/employment/guide'
import type { ExamGuideListVO, ExamGuideDetailVO, ExamGuideQueryDTO } from '@/types/employment/guide'
import GuideSearch from './components/GuideSearch.vue'
import GuideTable from './components/GuideTable.vue'
import GuideDetailModal from './components/GuideDetailModal.vue'
import GuideFormModal from './components/GuideFormModal.vue'

const loading = ref(false)
const tableData = ref<ExamGuideListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<ExamGuideQueryDTO>({
  page: 1, size: 10, title: undefined, guideCategory: undefined, guideType: undefined, isTop: undefined,
})

const detailVisible = ref(false)
const detailId = ref<string | null>(null)
const editVisible = ref(false)
const editData = ref<Record<string, any>>({})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.title) params.title = queryParams.title
    if (queryParams.guideCategory) params.guideCategory = queryParams.guideCategory
    if (queryParams.guideType) params.guideType = queryParams.guideType
    if (queryParams.isTop !== undefined) params.isTop = queryParams.isTop
    const res = await getExamGuidePage(params as ExamGuideQueryDTO)
    if (res.data.code === 200) { tableData.value = res.data.data.records; total.value = res.data.data.total }
    else { ElMessage.error(res.data.msg || '获取列表失败') }
  } catch { ElMessage.error('获取列表失败') } finally { loading.value = false }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.title = undefined; queryParams.guideCategory = undefined; queryParams.guideType = undefined; queryParams.isTop = undefined; queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: ExamGuideListVO[]) => { selectedIds.value = rows.map(r => r.id) }

const handleDetail = (id: string) => { detailId.value = id; detailVisible.value = true }
const handleEdit = async (id: string) => {
  const res = await getExamGuideDetail(id)
  if (res.data.code === 200) { editData.value = res.data.data; editVisible.value = true }
}
const handleSubmit = () => { fetchData() }
const handleDisable = async (row: ExamGuideListVO) => {
  try {
    await ElMessageBox.confirm('确定禁用该备考指南？禁用后将从列表隐藏？', '提示', { confirmButtonText: '确定禁用', cancelButtonText: '取消' })
    const res = await updateExamGuideStatus(row.id, { status: 0 })
    if (res.data.code === 200) { ElMessage.success('禁用成功'); fetchData() } else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* cancel */ }
}
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该备考指南？此操作不可恢复！', '警告', { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' })
    const res = await deleteExamGuide(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() } else { ElMessage.error(res.data.msg || '删除失败') }
  } catch { /* cancel */ }
}
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的条目'); return }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length}条记录？此操作不可恢复！`, '警告', { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' })
    const res = await batchDeleteExamGuide(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() } else { ElMessage.error(res.data.msg || '批量删除失败') }
  } catch { /* cancel */ }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-container">
    <div class="page-watermark top-right"></div>
    <div class="page-watermark bottom-left"></div>
    <div class="page-header">
      <h2 class="page-title">统一备考指南管理</h2>
      <p class="page-subtitle">管理各类型备考指南与政策解读</p>
    </div>

    <GuideSearch
      v-model:title="queryParams.title" v-model:guide-category="queryParams.guideCategory"
      v-model:guide-type="queryParams.guideType" v-model:is-top="queryParams.isTop"
      @search="handleSearch" @reset="handleReset"
    />

    <div class="table-card">
      <GuideTable
        :data="tableData" :loading="loading" :total="total" :page="queryParams.page" :size="queryParams.size" :selected-ids="selectedIds"
        @detail="handleDetail" @edit="handleEdit" @disable="handleDisable" @delete="handleDelete"
        @batch-delete="handleBatchDelete" @refresh="fetchData"
        @selection-change="handleSelectionChange" @page-change="handlePageChange" @size-change="handleSizeChange"
      />
    </div>

    <GuideDetailModal v-model:visible="detailVisible" :current-id="detailId" />
    <GuideFormModal v-model:visible="editVisible" :initial-data="editData" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.page-container { min-height: 100vh; background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%); padding: 24px; position: relative; }
.page-watermark { position: fixed; width: 300px; height: 300px; background: url('@/assets/images/logo-main.png') no-repeat center; background-size: contain; opacity: 0.05; pointer-events: none; }
.page-watermark.top-right { top: 20px; right: 20px; }
.page-watermark.bottom-left { bottom: 20px; left: 20px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.page-subtitle { font-size: 14px; color: #9ca3af; margin: 0; }
.table-card { background: #fff; border-radius: 12px; border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; padding: 20px; }
</style>
