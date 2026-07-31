<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getCommunityPage, getCommunityDetail, updateCommunity, deleteCommunity, updateCommunityStatus, batchDeleteCommunity, preValidateCommunity, importCommunity } from '@/api/employment/community'
import type { CommunityListVO, CommunityDetailVO, CommunityQueryDTO } from '@/types/employment/community'
import CommunitySearch from './components/CommunitySearch.vue'
import CommunityTable from './components/CommunityTable.vue'
import CommunityDetailModal from './components/CommunityDetailModal.vue'
import CommunityFormModal from './components/CommunityFormModal.vue'
import ExcelImportDialog from '../components/ExcelImportDialog.vue'

const loading = ref(false)
const tableData = ref<CommunityListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<CommunityQueryDTO>({
  page: 1, size: 10, positionName: '', communityName: '', supervisingDept: '', positionType: '', province: '', city: '', positionStatus: '',
})

const detailVisible = ref(false)
const detailId = ref<string | null>(null)
const editVisible = ref(false)
const editData = ref<Record<string, any>>({})
const excelMode = ref<'preValidate' | 'import'>('preValidate')
const excelVisible = ref(false)
const excelFile = ref<File | null>(null)
const excelLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.communityName) params.communityName = queryParams.communityName
    if (queryParams.supervisingDept) params.supervisingDept = queryParams.supervisingDept
    if (queryParams.positionType) params.positionType = queryParams.positionType
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getCommunityPage(params as CommunityQueryDTO)
    if (res.data.code === 200) { tableData.value = res.data.data.records; total.value = res.data.data.total }
    else { ElMessage.error(res.data.msg || '获取列表失败') }
  } catch { ElMessage.error('获取列表失败') } finally { loading.value = false }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.positionName = ''; queryParams.communityName = ''; queryParams.supervisingDept = ''; queryParams.positionType = ''; queryParams.province = ''; queryParams.city = ''; queryParams.positionStatus = ''; queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: CommunityListVO[]) => { selectedIds.value = rows.map((r) => r.id) }

const handleDetail = (id: string) => { detailId.value = id; detailVisible.value = true }
const handleEdit = async (id: string) => {
  const res = await getCommunityDetail(id)
  if (res.data.code === 200) { editData.value = res.data.data; editVisible.value = true }
}
const handleSubmit = () => { fetchData() }
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该社区工作者岗位吗', '提示')
    const res = await deleteCommunity(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() } else { ElMessage.error(res.data.msg || '删除失败') }
  } catch { /* cancel */ }
}
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
  try {
    await ElMessageBox.confirm(`确定软删除选中的${selectedIds.value.length}条记录吗？`, '提示')
    const res = await batchDeleteCommunity(selectedIds.value)
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() } else { ElMessage.error(res.data.msg || '批量删除失败') }
  } catch { /* cancel */ }
}
const handleStatusChange = async (row: CommunityListVO, newStatus: string) => {
  try {
    const res = await updateCommunityStatus(row.id, { positionStatus: newStatus })
    if (res.data.code === 200) { ElMessage.success('状态更新成功'); fetchData() } else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }
}
const openPreValidate = () => { excelMode.value = 'preValidate'; excelFile.value = null; excelVisible.value = true }
const openImport = () => { excelMode.value = 'import'; excelFile.value = null; excelVisible.value = true }
const handleExcelFileChange = (file: File) => { excelFile.value = file }
const handleExcelConfirm = async () => {
  if (!excelFile.value) { ElMessage.warning('请选择文件'); return }
  excelLoading.value = true
  try {
    const fn = excelMode.value === 'preValidate' ? preValidateCommunity : importCommunity
    const res = await fn(excelFile.value)
    if (res.data.code === 200) { ElMessage.success(excelMode.value === 'preValidate' ? '校验通过' : '导入成功'); excelVisible.value = false; if (excelMode.value === 'import') fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') } finally { excelLoading.value = false }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-x">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png"></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png"></div>
    <div class="page-header">
      <h2 class="page-title">社区工作者岗位管理</h2>
      <p class="page-subtitle">管理社区工作者招录岗位信息</p>
    </div>

    <CommunitySearch
      v-model:positionName="queryParams.positionName" v-model:communityName="queryParams.communityName"
      v-model:supervisingDept="queryParams.supervisingDept" v-model:positionType="queryParams.positionType"
      v-model:province="queryParams.province" v-model:city="queryParams.city"
      v-model:positionStatus="queryParams.positionStatus"
      @search="handleSearch" @reset="handleReset"
    />

    <div class="table-card">
      <CommunityTable
        :data="tableData" :loading="loading" :total="total" :page="queryParams.page" :size="queryParams.size" :selected-ids="selectedIds"
        @detail="handleDetail" @edit="handleEdit" @delete="handleDelete" @status-change="handleStatusChange"
        @batch-delete="handleBatchDelete" @pre-validate="openPreValidate" @import="openImport" @refresh="fetchData"
        @selection-change="handleSelectionChange" @page-change="handlePageChange" @size-change="handleSizeChange"
      />
    </div>

    <CommunityDetailModal v-model:visible="detailVisible" :current-id="detailId" />
    <CommunityFormModal v-model:visible="editVisible" :initial-data="editData" @submit="handleSubmit" />
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
.table-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid rgba(249,115,22,0.1); border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; transition: all .3s ease; }
.table-card:hover { box-shadow: 0 4px 16px rgba(249,115,22,0.08); }
</style>
