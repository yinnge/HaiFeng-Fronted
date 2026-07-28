<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getDictPage,
  getDictDetail,
  addDict,
  updateDict,
  toggleDictStatus,
  deleteDict,
  batchDeleteDict,
} from '@/api/algorithm/constraint'
import type {
  ConstraintDictListVO,
  ConstraintDictDetailVO,
  ConstraintDictAddDTO,
  ConstraintDictUpdateDTO,
} from '@/types/algorithm/constraint'
import logoMain from '@/assets/images/logo-main.png'

const loading = ref(false)
const tableData = ref<ConstraintDictListVO[]>([])
const total = ref(0)
const selectedCodes = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentCode = ref<string | null>(null)
const detailData = ref<ConstraintDictDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  code: '',
  name: '',
  category: '',
  description: '',
  severity: 'HARD',
  checkField: '',
  checkOperator: '',
  checkValue: '',
  extraField: '',
  extraOperator: '',
  extraValue: '',
  sortOrder: 0,
  isActive: true,
})

const severityOptions = [
  { label: '硬限制', value: 'HARD' },
  { label: '软提示', value: 'SOFT' },
]

const checkOperatorOptions = [
  { label: '等于', value: 'EQ' },
  { label: '不等于', value: 'NEQ' },
  { label: '小于', value: 'LT' },
  { label: '小于等于', value: 'LTE' },
  { label: '大于', value: 'GT' },
  { label: '大于等于', value: 'GTE' },
  { label: '为真', value: 'IS_TRUE' },
  { label: '为假', value: 'IS_FALSE' },
  { label: '在范围内', value: 'IN' },
  { label: '不在范围内', value: 'NOT_IN' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getDictPage({ page: queryParams.page, size: queryParams.size })
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

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: ConstraintDictListVO[]) => {
  selectedCodes.value = rows.map((r) => r.code)
}

const resetForm = () => {
  formData.code = ''
  formData.name = ''
  formData.category = ''
  formData.description = ''
  formData.severity = 'HARD'
  formData.checkField = ''
  formData.checkOperator = ''
  formData.checkValue = ''
  formData.extraField = ''
  formData.extraOperator = ''
  formData.extraValue = ''
  formData.sortOrder = 0
  formData.isActive = true
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', code?: string) => {
  dialogMode.value = mode
  currentCode.value = code || null

  if (mode === 'add') {
    dialogTitle.value = '新增约束'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && code) {
    dialogTitle.value = '修改约束'
    formLoading.value = true
    try {
      const res = await getDictDetail(code)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.code = d.code
        formData.name = d.name
        formData.category = d.category
        formData.description = d.description || ''
        formData.severity = d.severity
        formData.checkField = d.checkField || ''
        formData.checkOperator = d.checkOperator || ''
        formData.checkValue = d.checkValue || ''
        formData.extraField = d.extraField || ''
        formData.extraOperator = d.extraOperator || ''
        formData.extraValue = d.extraValue || ''
        formData.sortOrder = d.sortOrder
        formData.isActive = d.isActive
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && code) {
    dialogTitle.value = '约束详情'
    formLoading.value = true
    try {
      const res = await getDictDetail(code)
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
  if (!formData.code || !formData.name || !formData.category) {
    ElMessage.warning('请填写约束代码、名称和分类')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: ConstraintDictAddDTO = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        severity: formData.severity,
        isActive: formData.isActive,
      }
      if (formData.description) data.description = formData.description
      if (formData.checkField) data.checkField = formData.checkField
      if (formData.checkOperator) data.checkOperator = formData.checkOperator
      if (formData.checkValue) data.checkValue = formData.checkValue
      if (formData.extraField) data.extraField = formData.extraField
      if (formData.extraOperator) data.extraOperator = formData.extraOperator
      if (formData.extraValue) data.extraValue = formData.extraValue
      if (formData.sortOrder !== 0) data.sortOrder = formData.sortOrder
      res = await addDict(data)
    } else if (dialogMode.value === 'edit' && currentCode.value) {
      const data: ConstraintDictUpdateDTO = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        severity: formData.severity,
        isActive: formData.isActive,
      }
      if (formData.description) data.description = formData.description
      if (formData.checkField) data.checkField = formData.checkField
      if (formData.checkOperator) data.checkOperator = formData.checkOperator
      if (formData.checkValue) data.checkValue = formData.checkValue
      if (formData.extraField) data.extraField = formData.extraField
      if (formData.extraOperator) data.extraOperator = formData.extraOperator
      if (formData.extraValue) data.extraValue = formData.extraValue
      if (formData.sortOrder !== 0) data.sortOrder = formData.sortOrder
      res = await updateDict(currentCode.value, data)
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
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const handleToggleStatus = async (row: ConstraintDictListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该约束吗？`, '提示')
    const res = await toggleDictStatus(row.code)
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleDelete = async (code: string) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该约束吗？删除后可恢复。',
      '确认删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteDict(code)
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
  if (selectedCodes.value.length === 0) {
    ElMessage.warning('请先选择要删除的约束')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量删除选中的 ${selectedCodes.value.length} 条约束吗？删除后可恢复。`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteDict(selectedCodes.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedCodes.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

const severityTag = (val: string) => (val === 'HARD' ? 'danger' : 'warning')
const severityLabel = (val: string) => (val === 'HARD' ? '硬限制' : '软提示')
const activeTag = (val: boolean) => (val ? 'success' : 'info')
const activeLabel = (val: boolean) => (val ? '启用' : '禁用')

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <img class="watermark watermark-tr" :src="logoMain" alt="" />
    <img class="watermark watermark-bl" :src="logoMain" alt="" />

    <div class="page-header">
      <h2 class="title">约束字典管理</h2>
      <p class="subtitle">管理算法约束字典，配置约束条件与规则</p>
    </div>

    <div class="action-bar">
      <div class="left-actions">
        <button class="btn btn-add" @click="openDialog('add')">
          <span class="btn-icon">+</span>新增约束
        </button>
        <button class="btn btn-batch-delete" :disabled="selectedCodes.length === 0" @click="handleBatchDelete">
          <span class="btn-icon">×</span>批量删除
        </button>
      </div>
      <div class="right-actions">
        <button class="btn btn-refresh" @click="fetchData">
          <span class="btn-icon">↻</span>刷新
        </button>
      </div>
    </div>

    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="约束代码" width="180" />
        <el-table-column prop="name" label="约束名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="约束大类" width="120" />
        <el-table-column prop="severity" label="严重程度" width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.severity === 'HARD' ? 'status-error' : 'status-warning'">
              {{ severityLabel(row.severity) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="checkField" label="检查字段" width="140">
          <template #default="{ row }">
            {{ row.checkField || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.isActive ? 'status-success' : 'status-default'">
              {{ activeLabel(row.isActive) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-pill action-detail" @click="openDialog('detail', row.code)">详情</button>
            <button class="action-pill action-edit" @click="openDialog('edit', row.code)">修改</button>
            <button
              class="action-pill"
              :class="row.isActive ? 'action-disable' : 'action-enable'"
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </button>
            <button class="action-pill action-delete" @click="handleDelete(row.code)">删除</button>
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
      width="750px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      class="uni-dialog"
    >
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="约束代码" :span="2">{{ detailData.code }}</el-descriptions-item>
            <el-descriptions-item label="约束名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="约束大类">{{ detailData.category }}</el-descriptions-item>
            <el-descriptions-item label="严重程度">
              <span class="status-pill" :class="detailData.severity === 'HARD' ? 'status-error' : 'status-warning'">
                {{ severityLabel(detailData.severity) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-pill" :class="detailData.isActive ? 'status-success' : 'status-default'">
                {{ activeLabel(detailData.isActive) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="检查字段">{{ detailData.checkField || '-' }}</el-descriptions-item>
            <el-descriptions-item label="检查运算符">{{ detailData.checkOperator || '-' }}</el-descriptions-item>
            <el-descriptions-item label="检查值">{{ detailData.checkValue || '-' }}</el-descriptions-item>
            <el-descriptions-item label="附加条件字段">{{ detailData.extraField || '-' }}</el-descriptions-item>
            <el-descriptions-item label="附加条件运算符">{{ detailData.extraOperator || '-' }}</el-descriptions-item>
            <el-descriptions-item label="附加条件值">{{ detailData.extraValue || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">
              <div class="max-h-32 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="约束代码" required>
                  <el-input v-model="formData.code" placeholder="如 NO_COLOR_BLIND" maxlength="50" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="约束名称" required>
                  <el-input v-model="formData.name" placeholder="如 不招色盲" maxlength="100" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="约束大类" required>
                  <el-input v-model="formData.category" placeholder="如 身体视觉" maxlength="30" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="严重程度" required>
                  <el-select v-model="formData.severity" style="width: 100%">
                    <el-option v-for="item in severityOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="检查字段">
                  <el-input v-model="formData.checkField" placeholder="对应 t_member_gaokao 字段" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="检查运算符">
                  <el-select v-model="formData.checkOperator" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in checkOperatorOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="检查值">
                  <el-input v-model="formData.checkValue" placeholder="判断值" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序值">
                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-divider content-position="left">附加条件（可选）</el-divider>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="附加字段">
                  <el-input v-model="formData.extraField" placeholder="字段名" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="附加运算符">
                  <el-select v-model="formData.extraOperator" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in checkOperatorOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="附加值">
                  <el-input v-model="formData.extraValue" placeholder="值" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="详细说明">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="约束条件详细说明" />
            </el-form-item>
            <el-form-item label="启用状态">
              <el-switch v-model="formData.isActive" active-text="启用" inactive-text="禁用" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <button class="btn btn-cancel" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>
          <button v-if="dialogMode !== 'detail'" class="btn btn-confirm" @click="handleSubmit">确定</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ===== 页面包装器 ===== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
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
  top: -20px;
  right: -20px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: -20px;
  left: -20px;
  transform: rotate(-12deg);
}

/* ===== 页面标题 ===== */
.page-header {
  margin-bottom: 24px;
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
  border: 1px solid #fdba74;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(249,115,22,0.06);
}
.section-label {
  display: inline-block;
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  color: #f97316;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
  border: 1px solid #fed7aa;
}
.search-btns {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn-search {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border: none;
  padding: 8px 22px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(249,115,22,0.25);
}
.btn-search:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 3px 10px rgba(249,115,22,0.35);
  transform: translateY(-1px);
}
.btn-reset {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 22px;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
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
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}
.btn-icon {
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}
.btn-add {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  box-shadow: 0 2px 6px rgba(249,115,22,0.25);
  border-radius: 24px;
}
.btn-add:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 3px 10px rgba(249,115,22,0.35);
  transform: translateY(-1px);
}
.btn-batch-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 2px 6px rgba(239,68,68,0.2);
  border-radius: 24px;
}
.btn-batch-delete:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  box-shadow: 0 3px 10px rgba(239,68,68,0.3);
  transform: translateY(-1px);
}
.btn-batch-delete:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn-import,
.btn-export,
.btn-refresh {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}
.btn-import:hover,
.btn-export:hover,
.btn-refresh:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

/* ===== 表格卡片 ===== */
.table-card {
  background: #fff;
  border: 1px solid #fdba74;
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(249,115,22,0.06);
}

/* ===== 表格头部橙色渐变 ===== */
:deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #f97316 !important;
  font-weight: 600;
}
:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #fffbf7;
}

/* ===== 状态胶囊 ===== */
.status-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.status-success {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.status-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}
.status-warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}
.status-default {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* ===== 操作胶囊 ===== */
.action-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  transition: all 0.15s;
  margin: 0 2px;
}
.action-detail {
  color: #f97316;
  border-color: #fed7aa;
}
.action-detail:hover {
  background: #fff7ed;
  border-color: #f97316;
}
.action-edit {
  color: #3b82f6;
  border-color: #bfdbfe;
}
.action-edit:hover {
  background: #eff6ff;
  border-color: #3b82f6;
}
.action-enable {
  color: #059669;
  border-color: #a7f3d0;
}
.action-enable:hover {
  background: #ecfdf5;
  border-color: #059669;
}
.action-disable {
  color: #d97706;
  border-color: #fde68a;
}
.action-disable:hover {
  background: #fffbeb;
  border-color: #d97706;
}
.action-delete {
  color: #ef4444;
  border-color: #fecaca;
}
.action-delete:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

/* ===== 分页 ===== */
.custom-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  color: #fff !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #f97316;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #f97316;
}

/* ===== 对话框 ===== */
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #fdba74;
  padding-bottom: 16px;
  margin-bottom: 0;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}
.uni-dialog :deep(.el-descriptions__label) {
  background: #fff7ed;
  color: #f97316;
  font-weight: 600;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-textarea__inner:focus) {
  border-color: #f97316;
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f97316 inset;
}
.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 36px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.btn-cancel {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 24px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
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
  border-radius: 24px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(249,115,22,0.25);
}
.btn-confirm:hover {
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 3px 10px rgba(249,115,22,0.35);
  transform: translateY(-1px);
}
</style>
