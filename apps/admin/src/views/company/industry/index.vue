<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getEnterpriseIndustryPage,
  deleteEnterpriseIndustry,
  batchDeleteEnterpriseIndustry,
  importEnterpriseIndustry,
} from '@/api/company'
import type {
  EnterpriseIndustryListVO,
  EnterpriseIndustryQueryDTO,
} from '@/types/company'
import IndustrySearch from './components/IndustrySearch.vue'
import IndustryTable from './components/IndustryTable.vue'
import IndustryDetailModal from './components/IndustryDetailModal.vue'

const loading = ref(false)
const tableData = ref<EnterpriseIndustryListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<EnterpriseIndustryQueryDTO>({
  page: 1,
  size: 10,
  enterpriseName: '',
  industryName: '',
})

const dialogVisible = ref(false)
const currentId = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.enterpriseName) params.enterpriseName = queryParams.enterpriseName
    if (queryParams.industryName) params.industryName = queryParams.industryName
    const res = await getEnterpriseIndustryPage(params as EnterpriseIndustryQueryDTO)
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
  queryParams.enterpriseName = ''
  queryParams.industryName = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: EnterpriseIndustryListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDetail = (row: EnterpriseIndustryListVO) => {
  currentId.value = row.id
  dialogVisible.value = true
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该关联吗？此操作不可恢复！', '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await deleteEnterpriseIndustry(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的关联'); return }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条关联记录吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消',
    })
    const res = await batchDeleteEnterpriseIndustry(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* cancel */ }
}

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const openImportDialog = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importEnterpriseIndustry(importFile.value)
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
        <h1 class="page-title">企业行业关联管理</h1>
        <p class="page-subtitle">管理企业与行业类别的关联关系</p>
      </div>
    </div>

    <IndustrySearch
      :enterprise-name="queryParams.enterpriseName!"
      :industry-name="queryParams.industryName!"
      @update:enterprise-name="queryParams.enterpriseName = $event"
      @update:industry-name="queryParams.industryName = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <IndustryTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :selected-ids="selectedIds"
      @detail="openDetail"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @import="openImportDialog"
      @refresh="fetchData"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <IndustryDetailModal
      v-model:visible="dialogVisible"
      :current-id="currentId"
    />

    <!-- Excel导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="Excel批量导入" width="550px" class="import-dialog">
      <div class="import-content">
        <div class="import-tip">
          导入企业-行业关联数据。企业名称必填且必须在企业表中存在，行业名称必填且必须在行业表中存在。
        </div>
        <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">
          <div class="upload-area">
            <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div class="upload-text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="upload-hint">仅支持 .xlsx / .xls 格式，单次导入不超过500行</div>
          </div>
        </el-upload>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="cancel-btn" @click="importDialogVisible = false">取消</button>
          <button type="button" class="submit-btn" :disabled="importLoading" @click="handleImportSubmit">
            <span v-if="importLoading" class="loading-spinner"></span>
            确定导入
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

.import-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.import-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-tip {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
}

.import-dialog :deep(.el-upload-dragger) {
  border-radius: 12px;
  border: 2px dashed rgba(249, 115, 22, 0.3);
  transition: all 0.25s ease;
}

.import-dialog :deep(.el-upload-dragger:hover) {
  border-color: #F97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.06);
}

.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 0;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: #F97316;
}

.upload-text {
  font-size: 14px;
  color: #6b7280;
}

.upload-text em {
  color: #F97316;
  font-style: normal;
  font-weight: 600;
}

.upload-hint {
  font-size: 12px;
  color: #9ca3af;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  margin-top: 16px;
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
  gap: 6px;
  padding: 8px 24px;
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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
