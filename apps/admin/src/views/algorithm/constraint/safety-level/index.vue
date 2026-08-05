<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getSafetyPage,
  getSafetyDetail,
  addSafety,
  updateSafety,
  batchDeleteSafety,
  toggleSafetyStatus,
} from '@/api/algorithm/constraint'
import type {
  SafetyLevelListVO,
  SafetyLevelDetailVO,
  SafetyLevelAddDTO,
  SafetyLevelUpdateDTO,
} from '@/types/algorithm/constraint'

const loading = ref(false)
const tableData = ref<SafetyLevelListVO[]>([])
const total = ref(0)
const selectedLevels = ref<number[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
  isDeleted: null as boolean | null,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentLevel = ref<number | null>(null)
const detailData = ref<SafetyLevelDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  level: null,
  code: '',
  name: '',
  nameShort: '',
  minCoefficient: null,
  maxCoefficient: null,
  color: '',
  confidence: '',
  confidenceReason: '',
  description: '',
})

const confidenceOptions = [
  { label: '高', value: 'HIGH' },
  { label: '中', value: 'MEDIUM' },
  { label: '低', value: 'LOW' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const params: { page: number; size: number; isDeleted?: boolean | null } = { page: queryParams.page, size: queryParams.size }
    if (queryParams.isDeleted !== null) {
      params.isDeleted = queryParams.isDeleted
    }
    const res = await getSafetyPage(params)
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

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: SafetyLevelListVO[]) => {
  selectedLevels.value = rows.map((r) => r.level)
}

const resetForm = () => {
  formData.level = null
  formData.code = ''
  formData.name = ''
  formData.nameShort = ''
  formData.minCoefficient = null
  formData.maxCoefficient = null
  formData.color = ''
  formData.confidence = ''
  formData.confidenceReason = ''
  formData.description = ''
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', level?: number) => {
  dialogMode.value = mode
  currentLevel.value = level || null

  if (mode === 'add') {
    dialogTitle.value = '新增安全系数等级'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && level) {
    dialogTitle.value = '修改安全系数等级'
    formLoading.value = true
    try {
      const res = await getSafetyDetail(level)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.level = d.level
        formData.code = d.code
        formData.name = d.name
        formData.nameShort = d.nameShort
        formData.minCoefficient = d.minCoefficient
        formData.maxCoefficient = d.maxCoefficient
        formData.color = d.color || ''
        formData.confidence = d.confidence || ''
        formData.confidenceReason = d.confidenceReason || ''
        formData.description = d.description || ''
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && level) {
    dialogTitle.value = '安全系数等级详情'
    formLoading.value = true
    try {
      const res = await getSafetyDetail(level)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.level || !formData.code || !formData.name || !formData.nameShort) {
    ElMessage.warning('请填写等级编号、代码、名称和简称')
    return
  }
  if (formData.minCoefficient === null || formData.maxCoefficient === null) {
    ElMessage.warning('请填写系数范围')
    return
  }
  if (formData.minCoefficient >= formData.maxCoefficient) {
    ElMessage.warning('系数下界必须小于系数上界')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: SafetyLevelAddDTO = {
        level: formData.level,
        code: formData.code,
        name: formData.name,
        nameShort: formData.nameShort,
        minCoefficient: formData.minCoefficient,
        maxCoefficient: formData.maxCoefficient,
      }
      if (formData.color) data.color = formData.color
      if (formData.confidence) data.confidence = formData.confidence
      if (formData.confidenceReason) data.confidenceReason = formData.confidenceReason
      if (formData.description) data.description = formData.description
      res = await addSafety(data)
    } else if (dialogMode.value === 'edit' && currentLevel.value) {
      const data: SafetyLevelUpdateDTO = {
        level: formData.level,
        code: formData.code,
        name: formData.name,
        nameShort: formData.nameShort,
        minCoefficient: formData.minCoefficient,
        maxCoefficient: formData.maxCoefficient,
      }
      if (formData.color) data.color = formData.color
      if (formData.confidence) data.confidence = formData.confidence
      if (formData.confidenceReason) data.confidenceReason = formData.confidenceReason
      if (formData.description) data.description = formData.description
      res = await updateSafety(currentLevel.value, data)
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
  } catch (err: any) {
    ElMessage.error(err.message || '操作失败')
  }
}

const handleToggleStatus = async (row: SafetyLevelListVO) => {
  const action = row.isDeleted ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(
      `确定${action}该安全系数等级吗？`,
      `确认${action}`,
      { type: 'warning', confirmButtonText: `确定${action}`, cancelButtonText: '取消' }
    )
    const res = await toggleSafetyStatus(row.level)
    if (res.data.code === 200) {
      ElMessage.success(`${action}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || `${action}失败`)
    }
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedLevels.value.length === 0) {
    ElMessage.warning('请先选择要删除的等级')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量禁用选中的${selectedLevels.value.length} 个等级吗？`,
      '确认批量禁用',
      { type: 'warning', confirmButtonText: '确定批量禁用', cancelButtonText: '取消' }
    )
    const res = await batchDeleteSafety(selectedLevels.value)
    if (res.data.code === 200) {
      ElMessage.success('批量禁用成功')
      selectedLevels.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量禁用失败')
    }
  } catch {
    // 取消
  }
}

const confidenceTag = (val: string | null) => {
  if (val === 'HIGH') return 'success'
  if (val === 'MEDIUM') return 'warning'
  if (val === 'LOW') return 'danger'
  return 'info'
}
const confidenceLabel = (val: string | null) => {
  if (val === 'HIGH') return '高'
  if (val === 'MEDIUM') return '中'
  if (val === 'LOW') return '低'
  return val || '-'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-x">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>

    <div class="page-header">
      <h1 class="page-title">安全系数等级管理</h1>
      <p class="page-subtitle">管理安全系数等级配置、系数范围与置信度</p>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="left-actions">
        <button class="btn-primary" @click="openDialog('add')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5H2.75a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/></svg>
          <span>新增等级</span>
        </button>
        <button class="btn btn-batch-delete" :disabled="selectedLevels.length === 0" @click="handleBatchDelete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM4 3.5V4H2.75a.75.75 0 0 0 0 1.5h.37l.64 7.06A1.75 1.75 0 0 0 5.505 14H10.5a1.75 1.75 0 0 0 1.745-1.44l.64-7.06h.37a.75.75 0 0 0 0-1.5H12v-.5A2 2 0 0 0 10 2H6Z"/></svg>
          <span>批量禁用</span>
        </button>
      </div>
      <div class="right-actions">
        <div class="status-filter">
          <span class="filter-label">状态：</span>
          <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 110px" @change="fetchData">
            <el-option label="全部" :value="null as any" />
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </div>
        <button class="btn btn-refresh" @click="fetchData">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 8a5.5 5.5 0 0 1 10.434-2.5H10.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-1.5 0v1.585A7.001 7.001 0 0 0 1.003 8.74a.75.75 0 0 0 1.497-.24A5.502 5.502 0 0 1 2.5 8Z"/></svg>
          <span>刷新</span>
        </button>
      </div>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" class="custom-table">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="level" label="等级编号" min-width="90" align="center" />
        <el-table-column prop="code" label="代码" min-width="140" />
        <el-table-column prop="name" label="名称" min-width="120" />
        <el-table-column prop="nameShort" label="简称" min-width="70" align="center" />
        <el-table-column label="系数范围" min-width="160" align="center">
          <template #default="{ row }">
            {{ row.minCoefficient.toFixed(2) }} ~ {{ row.maxCoefficient.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" min-width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="'status-' + confidenceTag(row.confidence)">{{ confidenceLabel(row.confidence) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.isDeleted ? 'status-danger' : 'status-success'">{{ row.isDeleted ? '禁用' : '启用' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-pill action-detail" @click="openDialog('detail', row.level)">详情</button>
            <button class="action-pill action-edit" @click="openDialog('edit', row.level)">修改</button>
            <button class="action-pill" :class="row.isDeleted ? 'action-enable' : 'action-delete'" @click="handleToggleStatus(row)">{{ row.isDeleted ? '启用' : '禁用' }}</button>
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

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" :destroy-on-close="true" class="safety-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="等级编号">{{ detailData.level }}</el-descriptions-item>
            <el-descriptions-item label="代码">{{ detailData.code }}</el-descriptions-item>
            <el-descriptions-item label="名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="简称">{{ detailData.nameShort }}</el-descriptions-item>
            <el-descriptions-item label="系数范围">
              {{ detailData.minCoefficient.toFixed(2) }} ~ {{ detailData.maxCoefficient.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="显示颜色">
              <span v-if="detailData.color" :style="{ color: detailData.color }">●</span>
              {{ detailData.color || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="置信度">
              <span class="status-pill" :class="'status-' + confidenceTag(detailData.confidence)">{{ confidenceLabel(detailData.confidence) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="置信度说明">{{ detailData.confidenceReason || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">
              <div class="max-h-32 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="等级编号" required>
                  <el-input-number v-model="formData.level" :min="1" :max="10" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代码" required>
                  <el-input v-model="formData.code" placeholder="如：REACH_HIGH" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" required>
                  <el-input v-model="formData.name" placeholder="如：大胆冲刺" maxlength="30" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="简称" required>
                  <el-input v-model="formData.nameShort" placeholder="如：冲刺" maxlength="10" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="系数下界" required>
                  <el-input-number v-model="formData.minCoefficient" :min="0" :max="1" :precision="2" :step="0.05" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系数上界" required>
                  <el-input-number v-model="formData.maxCoefficient" :min="0" :max="1" :precision="2" :step="0.05" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="显示颜色">
                  <el-color-picker v-model="formData.color" show-alpha />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="置信度">
                  <el-select v-model="formData.confidence" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in confidenceOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="置信度说明">
              <el-input v-model="formData.confidenceReason" placeholder="置信度说明" maxlength="150" show-word-limit />
            </el-form-item>
            <el-form-item label="详细说明">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="详细说明" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button class="exit-btn" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>
          <button v-if="dialogMode !== 'detail'" class="save-btn" @click="handleSubmit">确定</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-x {
  position: relative;
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  overflow: hidden;
}

/* 水印 */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left { top: -60px; right: 40px; transform: rotate(18deg); }
.watermark-right { bottom: -40px; left: 30px; transform: rotate(-12deg); }
.watermark-left img,
.watermark-right img { width: 180px; height: auto; }

/* 页面标题 */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* 操作栏 */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
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

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
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

/* 状态筛选 */
.status-filter {
  display: flex;
  align-items: center;
  gap: 4px;
}
.status-filter .filter-label {
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}
.status-filter :deep(.el-select .el-input__wrapper) {
  border-radius: 20px;
}
.status-filter :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.status-filter :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f97316 inset;
}

/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.table-card:hover { box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08); }

/* 表格 */
.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.custom-table :deep(.el-table__header th .cell) { color: #1f2937; }
.custom-table :deep(.el-table__body tr) { transition: background-color 0.2s ease; }
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}
.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}
.custom-table :deep(.el-table__empty-block) { min-height: 200px; }

/* 状态胶囊 */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.status-pill.status-success {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
}
.status-pill.status-warning {
  background: #fef3c7;
  color: #d97706;
}
.status-pill.status-danger {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  color: #dc2626;
}
.status-pill.status-info {
  background: #f3f4f6;
  color: #6b7280;
}

/* 操作胶囊 */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.action-enable {
  background: linear-gradient(135deg, #22c55e, #4ade80);
  color: #fff;
}
.action-enable:hover {
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

/* 分页 */
.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.custom-pagination :deep(.el-pagination) { --el-pagination-hover-color: #F97316; }
.custom-pagination :deep(.el-pager li) { border-radius: 8px; transition: all 0.2s ease; font-weight: 500; }
.custom-pagination :deep(.el-pager li:hover) { color: #F97316; }
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) { border-radius: 8px; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) { border-radius: 8px; }
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) { color: #F97316; }

/* 弹窗 */
.safety-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.safety-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}
.safety-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.safety-dialog :deep(.el-dialog__body) { padding: 24px; }
.safety-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}
.safety-dialog :deep(.el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06);
  color: #f97316;
  font-weight: 600;
}
.safety-dialog :deep(.el-input__wrapper),
.safety-dialog :deep(.el-textarea__inner),
.safety-dialog :deep(.el-select__wrapper) { border-radius: 8px; transition: all 0.25s ease; }
.safety-dialog :deep(.el-input__wrapper:hover),
.safety-dialog :deep(.el-textarea__inner:hover),
.safety-dialog :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.safety-dialog :deep(.el-input__wrapper.is-focus),
.safety-dialog :deep(.el-textarea__inner:focus),
.safety-dialog :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.safety-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) { padding-right: 36px; }
.safety-dialog :deep(.el-form-item) { margin-bottom: 18px; }

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.exit-btn {
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
.exit-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.save-btn {
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
.save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
