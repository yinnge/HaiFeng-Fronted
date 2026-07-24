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
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增约束</el-button>
        <el-button type="danger" :disabled="selectedCodes.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="code" label="约束代码" width="180" />
        <el-table-column prop="name" label="约束名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="category" label="约束大类" width="120" />
        <el-table-column prop="severity" label="严重程度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="severityTag(row.severity)" size="small">{{ severityLabel(row.severity) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkField" label="检查字段" width="140">
          <template #default="{ row }">
            {{ row.checkField || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="activeTag(row.isActive)" size="small">{{ activeLabel(row.isActive) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.code)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.code)">修改</el-button>
            <el-button :type="row.isActive ? 'info' : 'success'" link @click="handleToggleStatus(row)">
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.code)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="750px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="约束代码" :span="2">{{ detailData.code }}</el-descriptions-item>
            <el-descriptions-item label="约束名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="约束大类">{{ detailData.category }}</el-descriptions-item>
            <el-descriptions-item label="严重程度">
              <el-tag :type="severityTag(detailData.severity)" size="small">{{ severityLabel(detailData.severity) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="activeTag(detailData.isActive)" size="small">{{ activeLabel(detailData.isActive) }}</el-tag>
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
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
