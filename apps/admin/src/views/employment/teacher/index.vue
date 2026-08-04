<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getTeacherPage,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  updateTeacherStatus,
  batchDeleteTeacher,
  preValidateTeacher,
  importTeacher,
} from '@/api/employment/teacher'
import type { TeacherListVO, TeacherQueryDTO, TeacherAddDTO } from '@/types/employment/teacher'
import TeacherSearch from './components/TeacherSearch.vue'
import TeacherTable from './components/TeacherTable.vue'
import TeacherDetailModal from './components/TeacherDetailModal.vue'
import TeacherFormModal from './components/TeacherFormModal.vue'

const loading = ref(false)
const tableData = ref<TeacherListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<TeacherQueryDTO>({
  page: 1,
  size: 10,
  schoolName: '',
  positionName: '',
  schoolType: '',
  schoolNature: '',
  recruitmentType: '',
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
    if (queryParams.schoolName) params.schoolName = queryParams.schoolName
    if (queryParams.positionName) params.positionName = queryParams.positionName
    if (queryParams.schoolType) params.schoolType = queryParams.schoolType
    if (queryParams.schoolNature) params.schoolNature = queryParams.schoolNature
    if (queryParams.recruitmentType) params.recruitmentType = queryParams.recruitmentType
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.city) params.city = queryParams.city
    if (queryParams.district) params.district = queryParams.district
    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus
    const res = await getTeacherPage(params as TeacherQueryDTO)
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
  queryParams.schoolName = ''
  queryParams.positionName = ''
  queryParams.schoolType = ''
  queryParams.schoolNature = ''
  queryParams.recruitmentType = ''
  queryParams.province = ''
  queryParams.city = ''
  queryParams.district = ''
  queryParams.positionStatus = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (rows: TeacherListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDetail = (row: TeacherListVO) => {
  currentId.value = row.id
  detailVisible.value = true
}

const openEdit = async (row: TeacherListVO) => {
  try {
    const { getTeacherDetail } = await import('@/api/employment/teacher')
    const res = await getTeacherDetail(row.id)
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
    const res = formMode.value === 'add' ? await addTeacher(data as TeacherAddDTO) : await updateTeacher(currentId.value!, data)
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
    await ElMessageBox.confirm('确定删除该教师岗位吗？', '提示')
    const res = await deleteTeacher(id)
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
    const res = await batchDeleteTeacher(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* cancel */ }
}

const handleStatusChange = async (row: TeacherListVO, newStatus: string) => {
  try {
    const res = await updateTeacherStatus(row.id, { positionStatus: newStatus })
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

const preValidateVisible = ref(false)
const preValidateFile = ref<File | null>(null)
const preValidateLoading = ref(false)

const openPreValidate = () => { preValidateFile.value = null; preValidateVisible.value = true }
const handlePreValidateFileChange = (uploadFile: any) => { preValidateFile.value = uploadFile.raw; return false }

const handlePreValidateSubmit = async () => {
  if (!preValidateFile.value) { ElMessage.warning('请选择文件'); return }
  preValidateLoading.value = true
  try {
    const res = await preValidateTeacher(preValidateFile.value)
    if (res.data.code === 200) {
      ElMessage.success('校验通过')
      preValidateVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '校验失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || err.message || '校验失败')
  } finally {
    preValidateLoading.value = false
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
    const res = await importTeacher(importFile.value)
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
        <h1 class="page-title">教师岗位管理</h1>
        <p class="page-subtitle">管理教师招聘岗位信息</p>
      </div>
    </div>

    <TeacherSearch
      :school-name="queryParams.schoolName!"
      :position-name="queryParams.positionName!"
      :school-type="queryParams.schoolType!"
      :school-nature="queryParams.schoolNature!"
      :recruitment-type="queryParams.recruitmentType!"
      :province="queryParams.province!"
      :city="queryParams.city!"
      :district="queryParams.district!"
      :position-status="queryParams.positionStatus!"
      @update:school-name="queryParams.schoolName = $event"
      @update:position-name="queryParams.positionName = $event"
      @update:school-type="queryParams.schoolType = $event"
      @update:school-nature="queryParams.schoolNature = $event"
      @update:recruitment-type="queryParams.recruitmentType = $event"
      @update:province="queryParams.province = $event"
      @update:city="queryParams.city = $event"
      @update:district="queryParams.district = $event"
      @update:position-status="queryParams.positionStatus = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <TeacherTable
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
      @preview="openPreValidate"
      @refresh="fetchData"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <TeacherDetailModal
      v-model:visible="detailVisible"
      :current-id="currentId"
    />

    <TeacherFormModal
      v-model:visible="formVisible"
      :initial-data="editFormData"
      :mode="formMode"
      @submit="handleSubmitForm"
    />

    <el-dialog v-model="preValidateVisible" title="Excel预览" width="500px" class="preview-dialog">
      <div class="preview-content">
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="true"
          accept=".xlsx,.xls"
          :on-change="handlePreValidateFileChange"
          :limit="1"
        >
          <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持.xlsx / .xls 格式</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="cancel-btn" @click="preValidateVisible = false">取消</button>
          <button type="button" class="import-submit-btn" :disabled="preValidateLoading" @click="handlePreValidateSubmit">
            {{ preValidateLoading ? '校验中...' : '开始校验' }}
          </button>
        </div>
      </template>
    </el-dialog>

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
          <button type="button" class="import-submit-btn" :disabled="importLoading" @click="handleImportSubmit">
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

.preview-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.preview-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.preview-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.preview-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.preview-content :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937;
  font-weight: 600;
  border-bottom: 2px solid #F97316;
}

.close-preview-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.close-preview-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
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

.import-submit-btn {
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

.import-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.import-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
