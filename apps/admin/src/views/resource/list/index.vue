<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getResourcePage,
  getResourceDetail,
  addResource,
  updateResource,
  updateResourceStatus,
  batchDeleteResource,
  importResource,
} from '@/api/resource'
import type {
  ResourceListVO,
  ResourceDetailVO,
  ResourceQueryDTO,
  ResourceAddDTO,
  ResourceUpdateDTO,
} from '@/types/resource'

const loading = ref(false)
const tableData = ref<ResourceListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<ResourceQueryDTO>({
  page: 1,
  size: 10,
  resourceName: '',
  category: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ResourceDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  resourceName: '',
  coverUrl: '',
  description: '',
  resourceUrl: '',
  accessCode: '',
  category: '',
  fileType: '',
  sortOrder: null,
})

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.resourceName) params.resourceName = queryParams.resourceName
    if (queryParams.category) params.category = queryParams.category
    const res = await getResourcePage(params as ResourceQueryDTO)
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
  queryParams.resourceName = ''
  queryParams.category = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: ResourceListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const resetForm = () => {
  formData.resourceName = ''
  formData.coverUrl = ''
  formData.description = ''
  formData.resourceUrl = ''
  formData.accessCode = ''
  formData.category = ''
  formData.fileType = ''
  formData.sortOrder = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增资源'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改资源'
    formLoading.value = true
    try {
      const res = await getResourceDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.resourceName = d.resourceName
        formData.coverUrl = d.coverUrl || ''
        formData.description = d.description || ''
        formData.resourceUrl = d.resourceUrl
        formData.accessCode = d.accessCode || ''
        formData.category = d.category || ''
        formData.fileType = d.fileType || ''
      }
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '资源详情'
    formLoading.value = true
    try {
      const res = await getResourceDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.resourceName || !formData.resourceUrl) {
    ElMessage.warning('请填写资源名称和资源URL')
    return
  }

  try {
    const data: Record<string, any> = {
      resourceName: formData.resourceName,
      resourceUrl: formData.resourceUrl,
    }
    if (formData.coverUrl) data.coverUrl = formData.coverUrl
    if (formData.description) data.description = formData.description
    if (formData.accessCode) data.accessCode = formData.accessCode
    if (formData.category) data.category = formData.category
    if (formData.fileType) data.fileType = formData.fileType
    if (formData.sortOrder !== null) data.sortOrder = formData.sortOrder

    let res: any
    if (dialogMode.value === 'add') {
      res = await addResource(data as ResourceAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateResource(currentId.value, data as ResourceUpdateDTO)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

const handleToggleStatus = async (row: ResourceListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该资源吗？`, '提示')
    const res = await updateResourceStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) { ElMessage.success(`${actionText}成功`); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要禁用的资源'); return }
  try {
    await ElMessageBox.confirm(`确定要批量禁用选中的${selectedIds.value.length} 条资源吗？`, '提示', {
      type: 'warning', confirmButtonText: '确定批量禁用', cancelButtonText: '取消',
    })
    const res = await batchDeleteResource(selectedIds.value as unknown as number[])
    if (res.data.code === 200) { ElMessage.success('批量禁用成功'); selectedIds.value = []; fetchData() }
    else { ElMessage.error(res.data.msg || '批量禁用失败') }
  } catch { /* cancel */ }
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importResource(importFile.value)
    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }
    else { ElMessage.error(res.data.msg || '导入失败') }
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }
  finally { importLoading.value = false }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-wrap">
    <!-- Watermarks -->
    <img src="@/assets/images/logo-main.png" class="watermark watermark-tr" alt="" />
    <img src="@/assets/images/logo-main.png" class="watermark watermark-bl" alt="" />

    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title">资源管理</h2>
      <p class="page-subtitle">管理平台资源，包括文件、链接等内容的增删改查操作</p>
    </div>

    <!-- Search Card -->
    <div class="search-card">
      <div class="section-label">
        <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        搜索条件
      </div>
      <el-form :model="queryParams" inline>
        <el-form-item label="资源名称">
          <el-input v-model="queryParams.resourceName" placeholder="资源名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-input v-model="queryParams.category" placeholder="分类模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <button class="btn btn-primary" @click="handleSearch">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            查询
          </button>
          <button class="btn btn-outline" @click="handleReset">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            重置
          </button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-bar-left">
        <button class="btn btn-primary" @click="openDialog('add')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          新增资源
        </button>
        <button class="btn btn-outline" @click="importDialogVisible = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><path d="M12 3v12"/></svg>
          Excel导入
        </button>
        <button class="btn btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          批量禁用
        </button>
      </div>
      <button class="btn btn-outline" @click="fetchData">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
        刷新
      </button>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="resourceName" label="资源名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <span class="tag tag-type">{{ row.category || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fileType" label="文件类型" width="100" align="center">
          <template #default="{ row }">
            <span class="tag tag-filetype">{{ row.fileType || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :class="['tag', 'tag-status', row.isDeleted ? 'tag-disabled' : 'tag-enabled']">
              {{ statusLabel(row.isDeleted) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-btn action-detail" @click="openDialog('detail', row.id)">详情</button>
            <button class="action-btn action-edit" @click="openDialog('edit', row.id)">修改</button>
            <button v-if="row.isDeleted" class="action-btn action-enable" @click="handleToggleStatus(row)">启用</button>
            <button v-else class="action-btn action-disable" @click="handleToggleStatus(row)">禁用</button>
          </template>
        </el-table-column>
      </el-table>

      <div class="custom-pagination mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Main Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" class="uni-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="资源名称" :span="2">{{ detailData.resourceName }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ detailData.category || '-' }}</el-descriptions-item>
            <el-descriptions-item label="文件类型">{{ detailData.fileType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="资源URL" :span="2">
              <el-link type="primary" :href="detailData.resourceUrl" target="_blank">{{ detailData.resourceUrl }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="访问码">{{ detailData.accessCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="浏览量">{{ detailData.viewCount }}</el-descriptions-item>
            <el-descriptions-item label="封面URL" :span="2">{{ detailData.coverUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="描述" :span="2">
              <div class="max-h-40 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <span :class="['tag', 'tag-status', detailData.isDeleted ? 'tag-disabled' : 'tag-enabled']">
                {{ statusLabel(detailData.isDeleted) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="100px" class="mt-2">
            <el-form-item label="资源名称" required>
              <el-input v-model="formData.resourceName" placeholder="请输入资源名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="资源URL" required>
              <el-input v-model="formData.resourceUrl" placeholder="请输入资源链接（如百度网盘地址）" maxlength="500" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="访问码">
                  <el-input v-model="formData.accessCode" placeholder="百度网盘提取码" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序序号">
                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分类">
                  <el-input v-model="formData.category" placeholder="分类（如：考研真题）" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="文件类型">
                  <el-input v-model="formData.fileType" placeholder="如：PDF/视频/压缩包" maxlength="20" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="封面URL">
              <el-input v-model="formData.coverUrl" placeholder="封面图片URL" maxlength="500" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="资源描述" maxlength="1000" show-word-limit />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <button class="btn btn-outline" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>
        <button v-if="dialogMode !== 'detail'" class="btn btn-primary" @click="handleSubmit">确定</button>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog v-model="importDialogVisible" title="导入资源" width="500px" class="uni-dialog">
      <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <button class="btn btn-outline" @click="importDialogVisible = false">取消</button>
        <button class="btn btn-primary" :disabled="importLoading" @click="handleImportSubmit">
          <span v-if="importLoading" class="loading-spinner"></span>
          确定导入
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ===== Page Wrapper ===== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* Watermarks */
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-tr {
  top: -20px;
  right: -20px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: -20px;
  left: -20px;
  transform: rotate(-12deg);
}

/* ===== Page Header ===== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 6px 0;
  line-height: 1.3;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ===== Section Label Pill ===== */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #F97316;
  margin-bottom: 16px;
}
.label-icon {
  width: 16px;
  height: 16px;
}

/* ===== Search Card ===== */
.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

/* ===== Buttons ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1.4;
  white-space: nowrap;
}
.btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn:disabled:hover {
  transform: none;
}

/* Primary - orange gradient */
.btn-primary {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 4px 12px rgba(249,115,22,0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249,115,22,0.4);
}

/* Outline */
.btn-outline {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}
.btn-outline:hover:not(:disabled) {
  border-color: #F97316;
  color: #F97316;
}

/* Danger - red gradient */
.btn-danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 4px 12px rgba(239,68,68,0.25);
}
.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239,68,68,0.35);
}

/* ===== Action Bar ===== */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.action-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ===== Table Card ===== */
.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

/* Table header light orange gradient + dark text + orange bottom border */
.table-card :deep(.el-table__header-wrapper th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.table-card :deep(.el-table__header-wrapper th .cell) {
  color: #1f2937 !important;
}

/* Row hover orange tint */
.table-card :deep(.el-table tbody tr:hover > td) {
  background-color: rgba(249,115,22,0.04) !important;
}

/* Striped orange tint */
.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(249,115,22,0.03) !important;
}
.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped:hover > td) {
  background-color: rgba(249,115,22,0.07) !important;
}

/* ===== Custom Tags ===== */
.tag {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.6;
}
.tag-status.tag-enabled {
  background: #ecfdf5;
  color: #059669;
}
.tag-status.tag-disabled {
  background: #fef3c7;
  color: #d97706;
}
.tag-type {
  background: rgba(249,115,22,0.1);
  color: #F97316;
}
.tag-filetype {
  background: #eff6ff;
  color: #3b82f6;
}

/* ===== Action Buttons ===== */
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 4px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 2px;
}
.action-btn:hover {
  transform: translateY(-1px);
}
.action-detail {
  background: rgba(249,115,22,0.1);
  color: #F97316;
}
.action-detail:hover {
  background: rgba(249,115,22,0.2);
}
.action-edit {
  background: #eff6ff;
  color: #3b82f6;
}
.action-edit:hover {
  background: #dbeafe;
}
.action-enable {
  background: #ecfdf5;
  color: #059669;
}
.action-enable:hover {
  background: #d1fae5;
}
.action-disable {
  background: #fef3c7;
  color: #d97706;
}
.action-disable:hover {
  background: #fde68a;
}

/* ===== Custom Pagination ===== */
.custom-pagination {
  padding-top: 16px;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}
.custom-pagination :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

/* ===== Dialog ===== */
.uni-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid rgba(249,115,22,0.15);
  padding: 20px 24px;
  margin-right: 0;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}
.uni-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

/* Descriptions orange label bg */
.uni-dialog :deep(.el-descriptions__label) {
  background: rgba(249,115,22,0.04) !important;
}
.uni-dialog :deep(.el-descriptions__content) {
  background: #fff !important;
}

/* Form inputs orange focus */
.uni-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.2s ease;
}
.uni-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
}
.uni-dialog :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-textarea__inner) {
  border-radius: 8px;
}
.uni-dialog :deep(.el-textarea__inner:hover) {
  border-color: rgba(249,115,22,0.4);
}
.uni-dialog :deep(.el-textarea__inner:focus) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316 inset;
}
.uni-dialog :deep(.el-input-number .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
}
.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  border-radius: 8px;
}

/* Dialog footer buttons styled the same way */
.uni-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
}

/* ===== Import Dialog ===== */
.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== El-tabs orange accent (if used anywhere) ===== */
:deep(.el-tabs__active-bar) {
  background-color: #F97316 !important;
}
:deep(.el-tabs__item:hover) {
  color: #F97316 !important;
}
:deep(.el-tabs__item.is-active) {
  color: #F97316 !important;
}
</style>
