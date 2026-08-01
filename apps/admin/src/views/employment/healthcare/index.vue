<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getHealthcarePage,
  addHealthcare,
  updateHealthcare,
  deleteHealthcare,
  updateHealthcareStatus,
  batchDeleteHealthcare,
  importHealthcare,
} from '@/api/employment/healthcare'
import type { HealthcareListVO, HealthcareQueryDTO, HealthcareAddDTO } from '@/types/employment/healthcare'
import HealthcareSearch from './components/HealthcareSearch.vue'
import HealthcareTable from './components/HealthcareTable.vue'
import HealthcareDetailModal from './components/HealthcareDetailModal.vue'
import HealthcareFormModal from './components/HealthcareFormModal.vue'

const loading = ref(false)
const tableData = ref<HealthcareListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<HealthcareQueryDTO>({
  page: 1,
  size: 10,
  institutionName: '',
  positionName: '',
  institutionNature: '',
  department: '',
  province: '',
  city: '',
  district: '',
  positionStatus: '',
})

const detailVisible = ref(false)
const formVisible = ref(false)
const currentId = ref<string | null>(null)
const editFormData = ref<Record<string, any>>({})
const formMode = ref<'add' | 'edit'>('edit')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.institutionName) params.institutionName = queryParams.institutionName
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.institutionNature) params.institutionNature = queryParams.institutionNature
    if (queryParams.department) params.department = queryParams.department
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.district) params.district = queryParams.district
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getHealthcarePage(params as HealthcareQueryDTO)
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
  queryParams.institutionName = ''
  queryParams.positionName = ''
  queryParams.institutionNature = ''
  queryParams.department = ''
  queryParams.province = ''
  queryParams.city = ''
  queryParams.district = ''
  queryParams.positionStatus = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (rows: HealthcareListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDetail = (row: HealthcareListVO) => {
  currentId.value = row.id
  detailVisible.value = true
}

const openEdit = async (row: HealthcareListVO) => {
  try {
    const { getHealthcareDetail } = await import('@/api/employment/healthcare')
    const res = await getHealthcareDetail(row.id)
    if (res.data.code === 200) {
      formMode.value = 'edit'
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

const handleAdd = () => {
  formMode.value = 'add'
  currentId.value = null
  editFormData.value = {}
  formVisible.value = true
}

const handleSubmitForm = async (data: Record<string, any>) => {
  try {
    const res = formMode.value === 'add' ? await addHealthcare(data as HealthcareAddDTO) : await updateHealthcare(currentId.value!, data)
    if (res.data.code === 200) {
      ElMessage.success(formMode.value === 'add' ? '新增成功' : '修改成功')
      formVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || err.message || '操作失败')
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定删除该医疗卫生岗位吗？', '提示')
    const res = await deleteHealthcare(id)
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
    await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteHealthcare(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* cancel */ }
}

const handleStatusChange = async (row: HealthcareListVO, newStatus: string) => {
  try {
    const res = await updateHealthcareStatus(row.id, { positionStatus: newStatus })
    if (res.data.code === 200) {
      ElMessage.success('状态更新成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || err.message || '操作失败')
  }
}

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const openImportDialog = () => { importFile.value = null; importDialogVisible.value = true }
const handleImportFileChange = (uploadFile: any) => { importFile.value = uploadFile.raw; return false }

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importHealthcare(importFile.value)
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || err.message || '导入失败')
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
        <h1 class="page-title">医疗卫生岗位管理</h1>
        <p class="page-subtitle">管理医疗卫生机构招聘岗位信息</p>
      </div>
    </div>

    <HealthcareSearch
      :institution-name="queryParams.institutionName!"
      :position-name="queryParams.positionName!"
      :institution-nature="queryParams.institutionNature!"
      :department="queryParams.department!"
      :province="queryParams.province!"
      :city="queryParams.city!"
      :district="queryParams.district!"
      :position-status="queryParams.positionStatus!"
      @update:institution-name="queryParams.institutionName = $event"
      @update:position-name="queryParams.positionName = $event"
      @update:institution-nature="queryParams.institutionNature = $event"
      @update:department="queryParams.department = $event"
      @update:province="queryParams.province = $event"
      @update:city="queryParams.city = $event"
      @update:district="queryParams.district = $event"
      @update:position-status="queryParams.positionStatus = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <HealthcareTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :selected-ids="selectedIds"
      @add="handleAdd"
      @detail="openDetail"
      @edit="openEdit"
      @delete="handleDelete"
      @status-change="handleStatusChange"
      @batch-delete="handleBatchDelete"
      @import="openImportDialog"
      @refresh="fetchData"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <HealthcareDetailModal
      v-model:visible="detailVisible"
      :current-id="currentId"
    />

    <HealthcareFormModal
      v-model:visible="formVisible"
      :initial-data="editFormData"
      :mode="formMode"
      @submit="handleSubmitForm"
    />

    <el-dialog v-model="importDialogVisible" title="Excel导入" width="500px" class="import-dialog">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        accept=".xlsx,.xls"
        :on-change="handleImportFileChange"
        :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持.xlsx / .xls 格式</div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="cancel-btn" @click="importDialogVisible = false">取消</button>
          <button type="button" class="submit-btn" :disabled="importLoading" @click="handleImportSubmit">
            {{ importLoading ? '导入中...' : '确定导入' }}
          </button>
        </div>
      </template>
    </el-dialog>
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

.import-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.import-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.import-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.import-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
