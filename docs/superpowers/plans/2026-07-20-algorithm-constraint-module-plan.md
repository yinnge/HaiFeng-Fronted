# Algorithm Constraint Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add algorithm constraint management module (约束字典管理, 专业约束关联管理, 安全系数管理) to the admin frontend.

**Architecture:** Three CRUD pages under `algorithm/constraint/` following existing Element Plus patterns. Each page is a single `index.vue` with script setup + template, backed by shared types and API service files.

**Tech Stack:** Vue 3 + Element Plus + TailwindCSS + Axios (via `@haifeng/shared`)

---

### Task 1: Create Type Definitions

**Files:**
- Create: `apps/admin/src/types/algorithm/constraint/dict.ts`
- Create: `apps/admin/src/types/algorithm/constraint/major.ts`
- Create: `apps/admin/src/types/algorithm/constraint/safety-level.ts`
- Create: `apps/admin/src/types/algorithm/constraint/index.ts`

- [ ] **Step 1: Create `types/algorithm/constraint/dict.ts`**

```typescript
export interface ConstraintDictListVO {
  code: string
  name: string
  category: string
  severity: string
  checkField: string | null
  isActive: boolean
}

export interface ConstraintDictDetailVO {
  code: string
  name: string
  category: string
  description: string | null
  severity: string
  checkField: string | null
  checkOperator: string | null
  checkValue: string | null
  extraField: string | null
  extraOperator: string | null
  extraValue: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ConstraintDictAddDTO {
  code: string
  name: string
  category: string
  description?: string
  severity: string
  checkField?: string
  checkOperator?: string
  checkValue?: string
  extraField?: string
  extraOperator?: string
  extraValue?: string
  sortOrder?: number
  isActive: boolean
}

export interface ConstraintDictUpdateDTO {
  code: string
  name: string
  category: string
  description?: string
  severity: string
  checkField?: string
  checkOperator?: string
  checkValue?: string
  extraField?: string
  extraOperator?: string
  extraValue?: string
  sortOrder?: number
  isActive: boolean
}
```

- [ ] **Step 2: Create `types/algorithm/constraint/major.ts`**

```typescript
export interface MajorConstraintListVO {
  id: string
  majorCode: string
  majorName: string
  constraintCode: string
  constraintName: string
}

export interface MajorConstraintDetailVO {
  id: string
  majorCode: string
  majorName: string
  constraintCode: string
  constraintName: string
  remark: string | null
  createdAt: string
}

export interface MajorConstraintQueryDTO {
  page: number
  size: number
  majorCode?: string
  majorName?: string
  constraintCode?: string
  constraintName?: string
}

export interface MajorConstraintAddDTO {
  majorName: string
  constraintName: string
  remark?: string
}
```

- [ ] **Step 3: Create `types/algorithm/constraint/safety-level.ts`**

```typescript
export interface SafetyLevelListVO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  confidence: string | null
}

export interface SafetyLevelDetailVO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  color: string | null
  confidence: string | null
  confidenceReason: string | null
  description: string | null
}

export interface SafetyLevelAddDTO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  color?: string
  confidence?: string
  confidenceReason?: string
  description?: string
}

export interface SafetyLevelUpdateDTO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  color?: string
  confidence?: string
  confidenceReason?: string
  description?: string
}
```

- [ ] **Step 4: Create `types/algorithm/constraint/index.ts`**

```typescript
export * from './dict'
export * from './major'
export * from './safety-level'
```

---

### Task 2: Create API Service

**Files:**
- Create: `apps/admin/src/api/algorithm/constraint.ts`

- [ ] **Step 1: Create `api/algorithm/constraint.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ConstraintDictListVO,
  ConstraintDictDetailVO,
  ConstraintDictAddDTO,
  ConstraintDictUpdateDTO,
  MajorConstraintListVO,
  MajorConstraintDetailVO,
  MajorConstraintQueryDTO,
  MajorConstraintAddDTO,
  SafetyLevelListVO,
  SafetyLevelDetailVO,
  SafetyLevelAddDTO,
  SafetyLevelUpdateDTO,
} from '@/types/algorithm/constraint'
import type { AxiosResponse } from 'axios'

// ========== 约束字典 ==========
const DICT_PREFIX = '/api/v1/admin/algorithm/constraint/dict'

export const getDictPage = (params: { page: number; size: number }): Promise<AxiosResponse<R<PageResult<ConstraintDictListVO>>>> =>
  request.get(`${DICT_PREFIX}/page`, { params })

export const getDictDetail = (code: string): Promise<AxiosResponse<R<ConstraintDictDetailVO>>> =>
  request.get(`${DICT_PREFIX}/${code}`)

export const addDict = (data: ConstraintDictAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.post(DICT_PREFIX, data)

export const updateDict = (code: string, data: ConstraintDictUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${DICT_PREFIX}/${code}`, data)

export const toggleDictStatus = (code: string): Promise<AxiosResponse<R<void>>> =>
  request.put(`${DICT_PREFIX}/${code}/toggle`)

export const deleteDict = (code: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${DICT_PREFIX}/${code}`)

export const batchDeleteDict = (codes: string[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${DICT_PREFIX}/batch-delete`, codes)

// ========== 专业约束关联 ==========
const MAJOR_PREFIX = '/api/v1/admin/algorithm/constraint/major'

export const getMajorPage = (params: MajorConstraintQueryDTO): Promise<AxiosResponse<R<PageResult<MajorConstraintListVO>>>> =>
  request.get(`${MAJOR_PREFIX}/page`, { params })

export const getMajorDetail = (id: string): Promise<AxiosResponse<R<MajorConstraintDetailVO>>> =>
  request.get(`${MAJOR_PREFIX}/${id}`)

export const addMajor = (data: MajorConstraintAddDTO): Promise<AxiosResponse<R<string>>> =>
  request.post(MAJOR_PREFIX, data)

export const deleteMajor = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${MAJOR_PREFIX}/${id}`)

export const batchDeleteMajor = (ids: string[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${MAJOR_PREFIX}/batch-delete`, ids)

export const importMajorExcel = (file: File): Promise<AxiosResponse<R<number>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${MAJOR_PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ========== 安全系数 ==========
const SAFETY_PREFIX = '/api/v1/admin/algorithm/constraint/safety-level'

export const getSafetyPage = (params: { page: number; size: number }): Promise<AxiosResponse<R<PageResult<SafetyLevelListVO>>>> =>
  request.get(`${SAFETY_PREFIX}/page`, { params })

export const getSafetyDetail = (level: number): Promise<AxiosResponse<R<SafetyLevelDetailVO>>> =>
  request.get(`${SAFETY_PREFIX}/${level}`)

export const addSafety = (data: SafetyLevelAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.post(SAFETY_PREFIX, data)

export const updateSafety = (level: number, data: SafetyLevelUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${SAFETY_PREFIX}/${level}`, data)

export const deleteSafety = (level: number): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${SAFETY_PREFIX}/${level}`)

export const batchDeleteSafety = (levels: number[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${SAFETY_PREFIX}/batch-delete`, levels)
```

---

### Task 3: Update Router

**Files:**
- Modify: `apps/admin/src/router/modules/algorithm.ts`

- [ ] **Step 1: Add constraint sub-module routes**

Replace the existing `algorithm.ts` with this expanded version:

```typescript
import type { RouteRecordRaw } from 'vue-router'

const algorithmRoutes: RouteRecordRaw = {
  path: '/algorithm',
  name: 'Algorithm',
  meta: { title: '高考算法', icon: 'TrendCharts' },
  redirect: '/algorithm/admission/group',
  children: [
    // === 专业组管理 ===
    {
      path: 'admission/group',
      name: 'AdmissionGroup',
      component: () => import('@/views/algorithm/admission/group/index.vue'),
      meta: { title: '专业组列表', moduleCode: 'algo_admission_grp' },
    },
    {
      path: 'admission/major-score',
      name: 'AdmissionMajorScore',
      component: () => import('@/views/algorithm/admission/major-score/index.vue'),
      meta: { title: '专业明细列表', moduleCode: 'algo_admission_dtl' },
    },
    // === 分数位次管理 ===
    {
      path: 'score/province-reform',
      name: 'AlgorithmConfigProvinceReform',
      component: () => import('@/views/algorithm/config/province-reform/index.vue'),
      meta: { title: '改革省份', moduleCode: 'algo_score_prov' },
    },
    {
      path: 'score/rank',
      name: 'AlgorithmConfigScoreRank',
      component: () => import('@/views/algorithm/config/score-rank/index.vue'),
      meta: { title: '一分一段位次', moduleCode: 'algo_score_rank' },
    },
    {
      path: 'score/baseline',
      name: 'AlgorithmConfigBatchScoreLine',
      component: () => import('@/views/algorithm/config/batch-score-line/index.vue'),
      meta: { title: '批次分数线', moduleCode: 'algo_score_baseline' },
    },
    // === 约束管理 ===
    {
      path: 'constraint',
      name: 'AlgorithmConstraint',
      meta: { title: '约束管理', icon: 'List' },
      redirect: '/algorithm/constraint/dict',
      children: [
        {
          path: 'dict',
          name: 'AlgorithmConstraintDict',
          component: () => import('@/views/algorithm/constraint/dict/index.vue'),
          meta: { title: '约束字典', moduleCode: 'algo_constraint_dict' },
        },
        {
          path: 'major',
          name: 'AlgorithmConstraintMajor',
          component: () => import('@/views/algorithm/constraint/major/index.vue'),
          meta: { title: '专业约束关联', moduleCode: 'algo_constraint_mjr' },
        },
      ],
    },
    // === 安全系数管理 ===
    {
      path: 'safety',
      name: 'AlgorithmSafety',
      meta: { title: '安全系数管理', icon: 'TrendCharts' },
      redirect: '/algorithm/safety/level',
      children: [
        {
          path: 'level',
          name: 'AlgorithmSafetyLevel',
          component: () => import('@/views/algorithm/constraint/safety-level/index.vue'),
          meta: { title: '安全系数', moduleCode: 'algo_safety_level' },
        },
      ],
    },
  ],
}

export default algorithmRoutes
```

---

### Task 4: Create 约束字典 Page

**Files:**
- Create: `apps/admin/src/views/algorithm/constraint/dict/index.vue`

- [ ] **Step 1: Create the full page component**

```vue
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
    <!-- 工具栏 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增约束</el-button>
        <el-button type="danger" :disabled="selectedCodes.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
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

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="750px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <!-- 详情模式 -->
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

        <!-- 新增/修改模式 -->
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
```

---

### Task 5: Create 专业约束关联 Page

**Files:**
- Create: `apps/admin/src/views/algorithm/constraint/major/index.vue`

- [ ] **Step 1: Create the full page component**

```vue
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
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="专业代码">
          <el-input v-model="queryParams.majorCode" placeholder="精确搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.majorName" placeholder="精确搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="约束代码">
          <el-input v-model="queryParams.constraintCode" placeholder="精确搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="约束名称">
          <el-input v-model="queryParams.constraintName" placeholder="精确搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 工具栏 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增关联</el-button>
        <el-button type="success" @click="openImportDialog">Excel导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />
        <el-table-column prop="majorCode" label="专业代码" width="120" />
        <el-table-column prop="majorName" label="专业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="constraintCode" label="约束代码" width="180" show-overflow-tooltip />
        <el-table-column prop="constraintName" label="约束名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
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

    <!-- 详情/新增 Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" :close-on-click-modal="false" :destroy-on-close="true">
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
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'add'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Excel导入弹窗 -->
    <el-dialog v-model="importDialogVisible" title="Excel导入专业约束关联" width="500px">
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
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 6: Create 安全系数 Page

**Files:**
- Create: `apps/admin/src/views/algorithm/constraint/safety-level/index.vue`

- [ ] **Step 1: Create the full page component**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getSafetyPage,
  getSafetyDetail,
  addSafety,
  updateSafety,
  deleteSafety,
  batchDeleteSafety,
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
    const res = await getSafetyPage({ page: queryParams.page, size: queryParams.size })
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
    } catch {
      ElMessage.error('获取详情失败')
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
    } catch {
      ElMessage.error('获取详情失败')
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
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (level: number) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该安全系数等级吗？删除后可恢复。',
      '确认删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteSafety(level)
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
  if (selectedLevels.value.length === 0) {
    ElMessage.warning('请先选择要删除的等级')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量删除选中的 ${selectedLevels.value.length} 个等级吗？删除后可恢复。`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteSafety(selectedLevels.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedLevels.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
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
  <div>
    <!-- 工具栏 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增等级</el-button>
        <el-button type="danger" :disabled="selectedLevels.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="level" label="等级编号" width="90" align="center" />
        <el-table-column prop="code" label="代码" width="140" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="nameShort" label="简称" width="70" align="center" />
        <el-table-column label="系数范围" width="160" align="center">
          <template #default="{ row }">
            {{ row.minCoefficient.toFixed(2) }} ~ {{ row.maxCoefficient.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信度" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="confidenceTag(row.confidence)" size="small">{{ confidenceLabel(row.confidence) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.level)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.level)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row.level)">删除</el-button>
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

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" :destroy-on-close="true">
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
              <span v-if="detailData.color" :style="{ color: detailData.color }">■</span>
              {{ detailData.color || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="置信度">
              <el-tag :type="confidenceTag(detailData.confidence)" size="small">{{ confidenceLabel(detailData.confidence) }}</el-tag>
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
                  <el-input v-model="formData.code" placeholder="如 REACH_HIGH" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" required>
                  <el-input v-model="formData.name" placeholder="如 大胆冲刺" maxlength="30" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="简称" required>
                  <el-input v-model="formData.nameShort" placeholder="如 冲" maxlength="10" show-word-limit />
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
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

## Self-Review

Checking against spec requirements:

1. ✅ 约束字典: 详情、新增、修改、切换启用状态、软删除、批量软删除 — all implemented
2. ✅ 专业约束关联: 详情、新增、软删除、批量软删除、Excel导入 — all implemented
3. ✅ 安全系数: 详情、新增、修改、软删除、批量软删除 — all implemented
4. ✅ 无搜索栏 for 约束字典 & 安全系数 (API has no query params)
5. ✅ 专业约束关联有4个精确查询框
6. ✅ isActive 状态友好展示(启用/禁用)，sortOrder 未展示
7. ✅ 删除提示语注明可恢复
8. ✅ 报错信息通过 ElMessage.error 展示
9. ✅ 路由含 meta.moduleCode 权限控制
10. ✅ 路由层级: algorithm > algo_constraint > algo_constraint_dict / algo_constraint_mjr 和 algorithm > algo_safety > algo_safety_level
11. ✅ API接口功能覆盖检查: 未遗漏接口功能，也未添加不支持的接口功能
