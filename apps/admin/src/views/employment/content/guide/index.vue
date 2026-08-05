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
  page: 1, size: 10, title: undefined, guideCategory: undefined, guideType: undefined, isTop: undefined, status: undefined,
})

const detailVisible = ref(false)
const detailId = ref<string | null>(null)
const editVisible = ref(false)
const editData = ref<Record<string, any>>({})
const formMode = ref<'add' | 'edit'>('edit')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.title) params.title = queryParams.title
    if (queryParams.guideCategory) params.guideCategory = queryParams.guideCategory
    if (queryParams.guideType) params.guideType = queryParams.guideType
    if (queryParams.isTop !== undefined) params.isTop = queryParams.isTop
    if (queryParams.status !== undefined) params.status = queryParams.status
    const res = await getExamGuidePage(params as ExamGuideQueryDTO)
    if (res.data.code === 200) { tableData.value = res.data.data.records; total.value = res.data.data.total }
    else { ElMessage.error(res.data.msg || '获取列表失败') }
  } catch { ElMessage.error('获取列表失败') } finally { loading.value = false }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.title = undefined; queryParams.guideCategory = undefined; queryParams.guideType = undefined; queryParams.isTop = undefined; queryParams.status = undefined; queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: ExamGuideListVO[]) => { selectedIds.value = rows.map(r => r.id) }

const handleDetail = (id: string) => { detailId.value = id; detailVisible.value = true }
const handleAdd = () => { formMode.value = 'add'; editData.value = {}; editVisible.value = true }
const handleEdit = async (id: string) => {
  formMode.value = 'edit'
  const res = await getExamGuideDetail(id)
  if (res.data.code === 200) { editData.value = res.data.data; editVisible.value = true }
}
const handleSubmit = () => { fetchData() }
const handleDisable = async (row: ExamGuideListVO) => {
  try {
    await ElMessageBox.confirm('确定禁用该备考指南？禁用后将从列表隐藏', '提示', { confirmButtonText: '确定禁用', cancelButtonText: '取消' })
    const res = await updateExamGuideStatus(row.id, { status: 0 })
    if (res.data.code === 200) { ElMessage.success('禁用成功'); fetchData() } else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* cancel */ }
}
const handleEnable = async (row: ExamGuideListVO) => {
  try {
    await ElMessageBox.confirm('确定启用该备考指南？启用后将恢复显示', '提示', { confirmButtonText: '确定启用', cancelButtonText: '取消' })
    const res = await updateExamGuideStatus(row.id, { status: 1 })
    if (res.data.code === 200) { ElMessage.success('启用成功'); fetchData() } else { ElMessage.error(res.data.msg || '操作失败') }
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
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="page-header">
      <div class="page-title">统一备考指南管理</div>
      <div class="page-subtitle">管理各类型备考指南与政策解读</div>
    </div>

    <GuideSearch
      v-model:title="queryParams.title" v-model:guide-category="queryParams.guideCategory"
      v-model:guide-type="queryParams.guideType" v-model:is-top="queryParams.isTop" v-model:status="queryParams.status"
      @search="handleSearch" @reset="handleReset"
    />

    <div class="table-card">
      <GuideTable
        :data="tableData" :loading="loading" :total="total" :page="queryParams.page" :size="queryParams.size" :selected-ids="selectedIds"
        @detail="handleDetail" @add="handleAdd" @edit="handleEdit" @disable="handleDisable" @enable="handleEnable" @delete="handleDelete"
        @batch-delete="handleBatchDelete" @refresh="fetchData"
        @selection-change="handleSelectionChange" @page-change="handlePageChange" @size-change="handleSizeChange"
      />
    </div>

    <GuideDetailModal v-model:visible="detailVisible" :current-id="detailId" />
    <GuideFormModal v-model:visible="editVisible" :initial-data="editData" :mode="formMode" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.page-container { min-height: calc(100vh - 60px); background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%); padding: 24px; position: relative; overflow: hidden; }
.watermark-left,
.watermark-right { position: absolute; opacity: 0.05; pointer-events: none; z-index: 0; }
.watermark-left { top: -60px; right: 40px; transform: rotate(18deg); }
.watermark-right { bottom: -40px; left: 30px; transform: rotate(-12deg); }
.watermark-left img,
.watermark-right img { width: 180px; height: auto; }
.page-header { position: relative; z-index: 1; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: #9ca3af; }
.table-card { background: #fff; border-radius: 12px; border: 1px solid rgba(249,115,22,0.1); border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; padding: 24px; }
</style>
