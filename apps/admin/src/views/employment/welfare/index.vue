<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getWelfarePage, getWelfareDetail, updateWelfare, deleteWelfare, updateWelfareStatus, batchDeleteWelfare, preValidateWelfare, importWelfare } from '@/api/employment/welfare'
import type { WelfareListVO, WelfareDetailVO, WelfareQueryDTO } from '@/types/employment/welfare'
import WelfareSearch from './components/WelfareSearch.vue'
import WelfareTable from './components/WelfareTable.vue'
import WelfareDetailModal from './components/WelfareDetailModal.vue'
import WelfareFormModal from './components/WelfareFormModal.vue'
import ExcelImportDialog from '../components/ExcelImportDialog.vue'

const loading = ref(false)
const tableData = ref<WelfareListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<WelfareQueryDTO>({
  page: 1, size: 10, positionName: '', developingUnit: '', employingUnit: '', positionCategory: '', province: '', city: '', district: '', maxServiceYears: undefined, positionStatus: '',
})

const detailVisible = ref(false)
const detailId = ref<string | null>(null)
const editVisible = ref(false)
const editData = ref<Record<string, any>>({})
const formMode = ref<'add' | 'edit'>('edit')
const excelMode = ref<'preValidate' | 'import'>('preValidate')
const excelVisible = ref(false)
const excelFile = ref<File | null>(null)
const excelLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.developingUnit) params.developingUnit = queryParams.developingUnit
    if (queryParams.employingUnit) params.employingUnit = queryParams.employingUnit
    if (queryParams.positionCategory) params.positionCategory = queryParams.positionCategory
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.district) params.district = queryParams.district
    if (queryParams.maxServiceYears) params.maxServiceYears = queryParams.maxServiceYears
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getWelfarePage(params as WelfareQueryDTO)
    if (res.data.code === 200) { tableData.value = res.data.data.records; total.value = res.data.data.total }
    else { ElMessage.error(res.data.msg || '获取列表失败') }
  } catch { ElMessage.error('获取列表失败') } finally { loading.value = false }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.positionName = ''; queryParams.developingUnit = ''; queryParams.employingUnit = ''; queryParams.positionCategory = ''; queryParams.province = ''; queryParams.city = ''; queryParams.district = ''; queryParams.maxServiceYears = undefined; queryParams.positionStatus = ''; queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: WelfareListVO[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleDetail = (id: string) => { detailId.value = id; detailVisible.value = true }
const handleAdd = () => {
  formMode.value = 'add'
  editData.value = {}
  editVisible.value = true
}
const handleEdit = async (id: string) => {
  formMode.value = 'edit'
  const res = await getWelfareDetail(id)
  if (res.data.code === 200) { editData.value = res.data.data; editVisible.value = true }
}
const handleSubmit = () => { fetchData() }
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该公益性岗位吗？', '提示')
    const res = await deleteWelfare(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() } else { ElMessage.error(res.data.msg || '删除失败') }
  } catch { /* cancel */ }
}
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
  try {
    await ElMessageBox.confirm(`确定软删除选中的${selectedIds.value.length}条记录吗？`, '提示')
    const res = await batchDeleteWelfare(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() } else { ElMessage.error(res.data.msg || '批量删除失败') }
  } catch { /* cancel */ }
}
const handleStatusChange = async (row: WelfareListVO, newStatus: string) => {
  try {
    const res = await updateWelfareStatus(row.id, { positionStatus: newStatus })
    if (res.data.code === 200) { ElMessage.success('状态更新成功'); fetchData() } else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || err.message || '操作失败') }
}
const openPreValidate = () => { excelMode.value = 'preValidate'; excelFile.value = null; excelVisible.value = true }
const openImport = () => { excelMode.value = 'import'; excelFile.value = null; excelVisible.value = true }
const handleExcelFileChange = (file: File) => { excelFile.value = file }
const handleExcelConfirm = async () => {
  if (!excelFile.value) { ElMessage.warning('请选择文件'); return }
  excelLoading.value = true
  try {
    const fn = excelMode.value === 'preValidate' ? preValidateWelfare : importWelfare
    const res = await fn(excelFile.value)
    if (res.data.code === 200) { ElMessage.success(excelMode.value === 'preValidate' ? '校验通过' : '导入成功'); excelVisible.value = false; if (excelMode.value === 'import') fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || err.message || '操作失败') } finally { excelLoading.value = false }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-x">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="page-header">
      <h2 class="page-title">公益性岗位管理</h2>
      <p class="page-subtitle">管理公益性岗位招录信息</p>
    </div>

    <WelfareSearch
      v-model:positionName="queryParams.positionName" v-model:developingUnit="queryParams.developingUnit"
      v-model:employingUnit="queryParams.employingUnit" v-model:positionCategory="queryParams.positionCategory"
      v-model:province="queryParams.province" v-model:city="queryParams.city"
      v-model:district="queryParams.district" v-model:maxServiceYears="queryParams.maxServiceYears"
      v-model:positionStatus="queryParams.positionStatus"
      @search="handleSearch" @reset="handleReset"
    />

    <div class="table-card">
      <WelfareTable
        :data="tableData" :loading="loading" :total="total" :page="queryParams.page" :size="queryParams.size" :selected-ids="selectedIds"
        @detail="handleDetail" @edit="handleEdit" @delete="handleDelete" @add="handleAdd" @status-change="handleStatusChange"
        @batch-delete="handleBatchDelete" @pre-validate="openPreValidate" @import="openImport" @refresh="fetchData"
        @selection-change="handleSelectionChange" @page-change="handlePageChange" @size-change="handleSizeChange"
      />
    </div>

    <WelfareDetailModal v-model:visible="detailVisible" :current-id="detailId" />
    <WelfareFormModal v-model:visible="editVisible" :initial-data="editData" :mode="formMode" @submit="handleSubmit" />
    <ExcelImportDialog v-model:visible="excelVisible" :mode="excelMode" @confirm="handleExcelConfirm" @file-change="handleExcelFileChange" :loading="excelLoading" />
  </div>
</template>

<style scoped>
.page-x { position: relative; min-height: calc(100vh - 60px); background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%); padding: 24px; overflow: hidden; }
.watermark-left, .watermark-right { position: absolute; opacity: 0.05; pointer-events: none; z-index: 0; }
.watermark-left { top: -60px; right: 40px; transform: rotate(18deg); }
.watermark-right { bottom: -40px; left: 30px; transform: rotate(-12deg); }
.watermark-left img, .watermark-right img { width: 180px; height: auto; }
.page-header { position: relative; z-index: 1; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
.page-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }
.table-card { position: relative; z-index: 1; background:#fff; border-radius:12px; padding:24px; border:1px solid rgba(249,115,22,0.1); border-top:3px solid #F97316; border-bottom:3px solid #FB923C; transition:all .3s ease; }
.table-card:hover { box-shadow:0 4px 16px rgba(249,115,22,0.08); }
</style>
