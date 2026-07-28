<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getInstitutionPage,
  getInstitutionDetail,
  updateInstitution,
  deleteInstitution,
  updateInstitutionStatus,
  batchDeleteInstitution,
  preValidateInstitution,
  importInstitution,
} from '@/api/employment/institution'
import type { InstitutionListVO, InstitutionDetailVO, InstitutionQueryDTO } from '@/types/employment/institution'
import InstitutionSearch from './components/InstitutionSearch.vue'
import InstitutionTable from './components/InstitutionTable.vue'
import InstitutionDetailModal from './components/InstitutionDetailModal.vue'
import InstitutionFormModal from './components/InstitutionFormModal.vue'
import ExcelImportDialog from '../components/ExcelImportDialog.vue'

const loading = ref(false)
const tableData = ref<InstitutionListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<InstitutionQueryDTO>({
  page: 1,
  size: 10,
  positionName: '',
  supervisingDept: '',
  institution: '',
  province: '',
  examCategory: '',
  positionType: '',
  positionStatus: '',
})

const detailVisible = ref(false)
const formVisible = ref(false)
const currentId = ref<string | null>(null)
const editFormData = ref<Record<string, any>>({})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.supervisingDept) params.supervisingDept = queryParams.supervisingDept
    if (queryParams.institution) params.institution = queryParams.institution
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.examCategory) params.examCategory = queryParams.examCategory
    if (queryParams.positionType) params.positionType = queryParams.positionType
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getInstitutionPage(params as InstitutionQueryDTO)
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
  queryParams.positionName = ''
  queryParams.supervisingDept = ''
  queryParams.institution = ''
  queryParams.province = ''
  queryParams.examCategory = ''
  queryParams.positionType = ''
  queryParams.positionStatus = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (rows: InstitutionListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDetail = (row: InstitutionListVO) => {
  currentId.value = row.id
  detailVisible.value = true
}

const openEdit = async (row: InstitutionListVO) => {
  try {
    const res = await getInstitutionDetail(row.id)
    if (res.data.code === 200) {
      editFormData.value = res.data.data
      currentId.value = row.id
      formVisible.value = true
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch {
    ElMessage.error('获取详情失败')
  }
}

const handleSubmitForm = async (data: Record<string, any>) => {
  if (!currentId.value) return
  try {
    const res = await updateInstitution(currentId.value, data)
    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      formVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '操作失败')
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该事业单位职位吗？', '提示')
    const res = await deleteInstitution(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteInstitution(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* cancel */ }
}

const handleStatusChange = async (row: InstitutionListVO, newStatus: string) => {
  try {
    const statusVal = newStatus === '在招' ? 0 : 1
    const res = await updateInstitutionStatus(row.id, { status: statusVal })
    if (res.data.code === 200) {
      ElMessage.success('状态更新成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '操作失败')
  }
}

const preValidateDialogVisible = ref(false)
const preValidateLoading = ref(false)
const importDialogVisible = ref(false)
const importLoading = ref(false)

const handlePreValidateSubmit = async (file: File) => {
  preValidateLoading.value = true
  try {
    const res = await preValidateInstitution(file)
    if (res.data.code === 200) {
      ElMessage.success('校验通过')
      preValidateDialogVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '校验失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '校验失败')
  } finally {
    preValidateLoading.value = false
  }
}

const handleImportSubmit = async (file: File) => {
  importLoading.value = true
  try {
    const res = await importInstitution(file)
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '导入失败')
  } finally {
    importLoading.value = false
  }
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
        <h1 class="page-title">事业单位职位管理</h1>
        <p class="page-subtitle">管理事业单位招录职位信息</p>
      </div>
    </div>

    <InstitutionSearch
      :position-name="queryParams.positionName!"
      :supervising-dept="queryParams.supervisingDept!"
      :institution="queryParams.institution!"
      :province="queryParams.province!"
      :exam-category="queryParams.examCategory!"
      :position-type="queryParams.positionType!"
      :position-status="queryParams.positionStatus!"
      @update:position-name="queryParams.positionName = $event"
      @update:supervising-dept="queryParams.supervisingDept = $event"
      @update:institution="queryParams.institution = $event"
      @update:province="queryParams.province = $event"
      @update:exam-category="queryParams.examCategory = $event"
      @update:position-type="queryParams.positionType = $event"
      @update:position-status="queryParams.positionStatus = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <InstitutionTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :selected-ids="selectedIds"
      @detail="openDetail"
      @edit="openEdit"
      @delete="handleDelete"
      @status-change="handleStatusChange"
      @batch-delete="handleBatchDelete"
      @pre-validate="preValidateDialogVisible = true"
      @import="importDialogVisible = true"
      @refresh="fetchData"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <InstitutionDetailModal
      v-model:visible="detailVisible"
      :current-id="currentId"
    />

    <InstitutionFormModal
      v-model:visible="formVisible"
      :initial-data="editFormData"
      @submit="handleSubmitForm"
    />

    <ExcelImportDialog
      v-model:visible="preValidateDialogVisible"
      mode="preValidate"
      :loading="preValidateLoading"
      @submit="handlePreValidateSubmit"
    />

    <ExcelImportDialog
      v-model:visible="importDialogVisible"
      mode="import"
      :loading="importLoading"
      @submit="handleImportSubmit"
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
