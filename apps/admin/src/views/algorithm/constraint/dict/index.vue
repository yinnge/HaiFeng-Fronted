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
      `      确定批量移除选中的 ${selectedCodes.value.length} 条约束吗？删除后可恢复。`,
      '确认批量移除',
      { type: 'warning', confirmButtonText: '确定批量移除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteDict(selectedCodes.value)
    if (res.data.code === 200) {
      ElMessage.success('批量移除成功')
      selectedCodes.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量移除失败')
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5H2.75a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z"/></svg>
          <span>新增约束</span>
        </button>
        <button class="btn btn-batch-delete" :disabled="selectedCodes.length === 0" @click="handleBatchDelete">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 2h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM4 3.5V4H2.75a.75.75 0 0 0 0 1.5h.37l.64 7.06A1.75 1.75 0 0 0 5.505 14H10.5a1.75 1.75 0 0 0 1.745-1.44l.64-7.06h.37a.75.75 0 0 0 0-1.5H12v-.5A2 2 0 0 0 10 2H6Z"/></svg>
          <span>批量移除</span>
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
        <el-table-column prop="code" label="约束代码" min-width="180" />
        <el-table-column prop="name" label="约束名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="约束大类" min-width="120" />
        <el-table-column prop="severity" label="严重程度" min-width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.severity === 'HARD' ? 'status-on' : 'status-off'">
              {{ severityLabel(row.severity) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="checkField" label="检查字段" min-width="140">
          <template #default="{ row }">
            {{ row.checkField || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.isActive ? 'status-on' : 'status-off'">
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
              <span class="status-pill" :class="detailData.severity === 'HARD' ? 'status-on' : 'status-off'">
                {{ severityLabel(detailData.severity) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-pill" :class="detailData.isActive ? 'status-on' : 'status-off'">
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

/* ===== 状态胶囊 ===== */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.status-on {
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  color: #059669;
}
.status-off {
  background: #f3f4f6;
  color: #6b7280;
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
.action-edit {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}
.action-enable {
  background: linear-gradient(135deg, #059669, #34d399);
  color: #fff;
}
.action-enable:hover {
  background: linear-gradient(135deg, #047857, #059669);
}
.action-disable {
  background: #fef3c7;
  color: #d97706;
}
.action-disable:hover {
  background: #fde68a;
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
.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 36px;
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
</style>
