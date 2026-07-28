<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getMajorPage,
  getMajorDetail,
  addMajor,
  deleteMajor,
  batchDeleteMajor,
  importMajorExcel,
} from '@/api/algorithm/constraint'
import type {
  MajorConstraintListVO,
  MajorConstraintDetailVO,
  MajorConstraintQueryDTO,
  MajorConstraintAddDTO,
} from '@/types/algorithm/constraint'
import { UploadFilled } from '@element-plus/icons-vue'
import logoMain from '@/assets/images/logo-main.png'

const loading = ref(false)
const tableData = ref<MajorConstraintListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<MajorConstraintQueryDTO>({
  page: 1,
  size: 10,
  majorCode: '',
  majorName: '',
  constraintCode: '',
  constraintName: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<MajorConstraintDetailVO | null>(null)

const formData = reactive({
  majorName: '',
  constraintName: '',
  remark: '',
})

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.majorCode) params.majorCode = queryParams.majorCode
    if (queryParams.majorName) params.majorName = queryParams.majorName
    if (queryParams.constraintCode) params.constraintCode = queryParams.constraintCode
    if (queryParams.constraintName) params.constraintName = queryParams.constraintName
    const res = await getMajorPage(params as MajorConstraintQueryDTO)
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

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.majorCode = ''
  queryParams.majorName = ''
  queryParams.constraintCode = ''
  queryParams.constraintName = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: MajorConstraintListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增关联'
    formData.majorName = ''
    formData.constraintName = ''
    formData.remark = ''
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '关联详情'
    formLoading.value = true
    try {
      const res = await getMajorDetail(id)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.majorName || !formData.constraintName) {
    ElMessage.warning('请填写专业名称和约束名称')
    return
  }

  try {
    const data: MajorConstraintAddDTO = {
      majorName: formData.majorName,
      constraintName: formData.constraintName,
    }
    if (formData.remark) data.remark = formData.remark

    const res = await addMajor(data)
    if (res.data.code === 200) {
      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '新增失败')
    }
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('新增失败')
    }
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该关联吗？删除后可恢复。',
      '确认删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteMajor(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的关联')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量删除选中的 ${selectedIds.value.length} 条关联吗？删除后可恢复。`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteMajor(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

const openImportDialog = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handleImportSubmit = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  importLoading.value = true
  try {
    const res = await importMajorExcel(importFile.value)
    if (res.data.code === 200) {
      ElMessage.success(`导入成功，共处理 ${res.data.data} 条`)
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    const msg = err.response?.data?.msg
    if (msg) {
      ElMessage.error(msg)
    } else {
      ElMessage.error('导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <img class="watermark watermark-tr" :src="logoMain" alt="" />
    <img class="watermark watermark-bl" :src="logoMain" alt="" />

    <div class="page-header">
      <h2 class="title">专业约束关联</h2>
      <p class="subtitle">管理专业与约束字典的关联关系</p>
    </div>

    <div class="search-card">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2a5.5 5.5 0 0 1 4.383 8.823l3.147 3.147a.75.75 0 0 1-1.06 1.06l-3.147-3.147A5.5 5.5 0 1 1 6.5 2Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>
        <span>筛选条件</span>
      </div>
      <div class="search-form">
        <div class="filter-fields">
          <div class="form-item">
            <label>专业代码</label>
            <el-input v-model="queryParams.majorCode" placeholder="精确搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
          </div>
          <div class="form-item">
            <label>专业名称</label>
            <el-input v-model="queryParams.majorName" placeholder="精确搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
          </div>
          <div class="form-item">
            <label>约束代码</label>
            <el-input v-model="queryParams.constraintCode" placeholder="精确搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
          </div>
          <div class="form-item">
            <label>约束名称</label>
            <el-input v-model="queryParams.constraintName" placeholder="精确搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
          </div>
        </div>
        <div class="search-actions">
          <button class="btn btn-search" @click="handleSearch">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2a5.5 5.5 0 0 1 4.383 8.823l3.147 3.147a.75.75 0 0 1-1.06 1.06l-3.147-3.147A5.5 5.5 0 1 1 6.5 2Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/></svg>
            <span>查询</span>
          </button>
          <button class="btn btn-reset" @click="handleReset">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 8a5.5 5.5 0 0 1 10.434-2.5H10.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-1.5 0v1.585A7.001 7.001 0 0 0 1.003 8.74a.75.75 0 0 0 1.497-.24A5.502 5.502 0 0 1 2.5 8Z"/></svg>
            <span>重置</span>
          </button>
        </div>
      </div>
    </div>

    <div class="action-bar">
      <div class="left-actions">
        <button class="btn btn-add" @click="openDialog('add')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5H2.75a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/></svg>
          <span>新增关联</span>
        </button>
        <button class="btn btn-outline" @click="openImportDialog">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M7.25 10.25a.75.75 0 0 0 1.5 0V4.56l2.22 2.22a.75.75 0 1 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 0l-3.5 3.5a.75.75 0 0 0 1.06 1.06l2.22-2.22v5.69Z"/><path d="M3.5 9.75a.75.75 0 0 0-1.5 0v2.5A1.75 1.75 0 0 0 3.75 14h8.5A1.75 1.75 0 0 0 14 12.25v-2.5a.75.75 0 0 0-1.5 0v2.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-2.5Z"/></svg>
          <span>Excel导入</span>
        </button>
        <button class="btn btn-batch-delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM4 3.5V4H2.75a.75.75 0 0 0 0 1.5h.37l.64 7.06A1.75 1.75 0 0 0 5.505 14H10.5a1.75 1.75 0 0 0 1.745-1.44l.64-7.06h.37a.75.75 0 0 0 0-1.5H12v-.5A2 2 0 0 0 10 2H6Z"/></svg>
          <span>批量删除</span>
        </button>
      </div>
      <div class="right-actions">
        <button class="btn btn-refresh" @click="fetchData">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 8a5.5 5.5 0 0 1 10.434-2.5H10.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-1.5 0v1.585A7.001 7.001 0 0 0 1.003 8.74a.75.75 0 0 0 1.497-.24A5.502 5.502 0 0 1 2.5 8Z"/></svg>
          <span>刷新</span>
        </button>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" class="custom-table">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" min-width="180" show-overflow-tooltip />
        <el-table-column prop="majorCode" label="专业代码" min-width="120" />
        <el-table-column prop="majorName" label="专业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="constraintCode" label="约束代码" min-width="180" show-overflow-tooltip />
        <el-table-column prop="constraintName" label="约束名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-pill action-detail" @click="openDialog('detail', row.id)">详情</button>
            <button class="action-pill action-delete" @click="handleDelete(row.id)">删除</button>
          </template>
        </el-table-column>
      </el-table>

      <div class="custom-pagination">
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

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="uni-dialog"
    >
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="专业代码">{{ detailData.majorCode }}</el-descriptions-item>
            <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="约束代码">{{ detailData.constraintCode }}</el-descriptions-item>
            <el-descriptions-item label="约束名称">{{ detailData.constraintName }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="专业名称" required>
              <el-input v-model="formData.majorName" placeholder="请输入专业名称（系统自动查找对应代码）" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="约束名称" required>
              <el-input v-model="formData.constraintName" placeholder="请输入约束名称（系统自动查找对应代码）" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注说明" maxlength="200" show-word-limit />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>
          <button v-if="dialogMode === 'add'" class="btn btn-confirm" @click="handleSubmit">确定</button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="importDialogVisible"
      title="Excel导入专业约束关联"
      width="500px"
      class="uni-dialog"
    >
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
          <div class="el-upload__tip">
            仅支持 .xlsx / .xls 格式，模板列：专业名称、约束名称、备注（可选）
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="importDialogVisible = false">取消</button>
          <button class="btn btn-confirm" :disabled="importLoading" @click="handleImportSubmit">
            {{ importLoading ? '导入中...' : '确定导入' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ===== 页面包装器 ===== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ===== 水印枫叶 ===== */
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
}
.watermark-tr {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}

/* ===== 页面标题 ===== */
.page-header {
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}
.page-header .title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  letter-spacing: 0.02em;
}
.page-header .subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ===== 搜索卡片 ===== */
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  margin-bottom: 16px;
  transition: box-shadow 0.3s, transform 0.3s;
}
.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.1);
  transform: translateY(-1px);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.filter-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-end;
}
.form-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
}
.form-item label {
  font-size: 13px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

.search-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-search:hover {
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
  transform: translateY(-1px);
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-reset:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

/* ===== 操作栏 ===== */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.left-actions,
.right-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.25s;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-add {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
}

.btn-outline {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}
.btn-outline:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

.btn-batch-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.btn-batch-delete:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.45);
}

.btn-refresh {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.btn-refresh:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

/* ===== 表格卡片 ===== */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

/* ===== 表格头部 ===== */
.custom-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.custom-table :deep(.el-table th.el-table__cell .cell) {
  color: #1f2937 !important;
}

/* ===== 表格行悬停 ===== */
.custom-table :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

/* ===== 表格条纹行 ===== */
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: rgba(255, 247, 237, 0.3);
}

/* ===== 操作胶囊 ===== */
.action-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  margin: 0 2px;
}
.action-detail {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
}
.action-detail:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
}
.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  background: linear-gradient(135deg, #dc2626, #ef4444);
}

/* ===== 分页 ===== */
.custom-pagination {
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  color: #fff !important;
  border-radius: 8px;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #f97316;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #f97316;
}

/* ===== 对话框 ===== */
.uni-dialog :deep(.el-dialog) {
  border-radius: 12px;
}
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding-bottom: 16px;
  margin-bottom: 0;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}
.uni-dialog :deep(.el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06);
  color: #f97316;
  font-weight: 600;
}
.uni-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
}
.uni-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-textarea__inner) {
  border-radius: 8px;
}
.uni-dialog :deep(.el-textarea__inner:focus) {
  border-color: #f97316;
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-form-item) {
  margin-bottom: 18px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-cancel {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-cancel:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}
.btn-confirm {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-confirm:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
  transform: translateY(-1px);
}
.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
