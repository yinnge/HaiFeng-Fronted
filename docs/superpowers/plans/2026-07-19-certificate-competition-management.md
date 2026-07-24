# 竞赛证书管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现竞赛证书管理模块的 3 个管理页面（证书管理、竞赛管理、竞赛-专业关联）

**Architecture:** 每个子页面独立为一个 views 目录下的页面文件，API 和类型定义按模块拆分到对应目录。所有页面参考首页公告管理页面的布局模式：白色圆角卡片 + 搜索栏 + 操作栏 + 表格 + 分页 + Dialog（详情/新增/修改三模式）。

**Tech Stack:** Vue 3 (Composition API + script setup), TypeScript, Element Plus, Tailwind CSS, Pinia, Vue Router 4

---

### Task 1: 创建类型定义

**Files:**
- Create: `apps/admin/src/types/certificate/certificate.ts`
- Create: `apps/admin/src/types/certificate/competition.ts`
- Create: `apps/admin/src/types/certificate/competitionMajor.ts`

- [ ] **Step 1: 创建 types/certificate 目录**

```bash
New-Item -ItemType Directory -Path "apps/admin/src/types/certificate" -Force
New-Item -ItemType Directory -Path "apps/admin/src/api/certificate" -Force
New-Item -ItemType Directory -Path "apps/admin/src/views/certificate/certificate" -Force
New-Item -ItemType Directory -Path "apps/admin/src/views/certificate/competition" -Force
New-Item -ItemType Directory -Path "apps/admin/src/views/certificate/competition-major" -Force
```

- [ ] **Step 2: 创建证书类型文件 `types/certificate/certificate.ts`**

```typescript
export interface CertificateListVO {
  id: number
  certName: string
  category: string | null
  certLevel: string | null
  applicableMajor: string | null
  registrationTime: string | null
  examTime: string | null
  examFee: number | null
  updatedAt: string
}

export interface CertificateDetailVO {
  id: number
  certName: string
  category: string | null
  certLevel: string | null
  applicableMajor: string | null
  registrationTime: string | null
  examTime: string | null
  examFee: number | null
  certIntro: string | null
  examRequirements: string[]
  examArrangement: string | null
  officialWebsite: string | null
  createdAt: string
  updatedAt: string
}

export interface CertificateQueryDTO {
  certName?: string
  category?: string
  certLevel?: string
  applicableMajor?: string
  page: number
  size: number
}

export interface CertificateAddDTO {
  certName: string
  category?: string
  certLevel?: string
  applicableMajor?: string
  registrationTime?: string
  examTime?: string
  examFee?: number
  certIntro?: string
  examRequirements?: string[]
  examArrangement?: string
  officialWebsite?: string
}

export interface CertificateUpdateDTO extends CertificateAddDTO {
  id: number
}
```

- [ ] **Step 3: 创建竞赛类型文件 `types/certificate/competition.ts`**

```typescript
export interface CompetitionListVO {
  id: number
  compName: string
  compLevel: string | null
  registrationTime: string | null
  updatedAt: string
}

export interface CompetitionDetailVO {
  id: number
  compName: string
  compLevel: string | null
  registrationTime: string | null
  detailId: number
  basicInfo: Record<string, any>
  awards: string[]
  background: string | null
  purposes: string[]
  competitionRules: { title: string; content: string }[]
  scoringCriteria: string[]
  notices: string[]
  processGuide: { title: string; content: string }[]
  awardsDisplay: { title: string; content: string }[]
  createdAt: string
  updatedAt: string
}

export interface CompetitionQueryDTO {
  compName?: string
  compLevel?: string
  page: number
  size: number
}

export interface CompetitionDetailDTO {
  basicInfo?: Record<string, any>
  awards?: string[]
  background?: string
  purposes?: string[]
  competitionRules?: { title: string; content: string }[]
  scoringCriteria?: string[]
  notices?: string[]
  processGuide?: { title: string; content: string }[]
  awardsDisplay?: { title: string; content: string }[]
}

export interface CompetitionAddDTO {
  compName: string
  compLevel?: string
  registrationTime?: string
  detail?: CompetitionDetailDTO
}

export interface CompetitionUpdateDTO extends CompetitionAddDTO {
  id: number
}
```

- [ ] **Step 4: 创建竞赛-专业关联类型文件 `types/certificate/competitionMajor.ts`**

```typescript
export interface CompetitionMajorListVO {
  id: number
  competitionId: number
  majorId: number
  competitionName: string
  majorName: string
  createdAt: string
}

export interface CompetitionMajorQueryDTO {
  competitionId?: number
  majorId?: number
  competitionName?: string
  majorName?: string
  page: number
  size: number
}

export interface CompetitionMajorAddDTO {
  competitionName: string
  majorName: string
}
```

- [ ] **Step 5: 验证类型定义**

```bash
cd apps/admin && npx vue-tsc --noEmit
```
Expected: 无类型错误（可以先忽略，等全部完成后统一验证）

---

### Task 2: 创建 API 层

**Files:**
- Create: `apps/admin/src/api/certificate/certificate.ts`
- Create: `apps/admin/src/api/certificate/competition.ts`
- Create: `apps/admin/src/api/certificate/competitionMajor.ts`

- [ ] **Step 1: 创建证书 API `api/certificate/certificate.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CertificateListVO,
  CertificateDetailVO,
  CertificateQueryDTO,
  CertificateAddDTO,
  CertificateUpdateDTO,
} from '@/types/certificate/certificate'

const PREFIX = '/api/v1/admin/certificate'

export const getCertificatePage = (params: CertificateQueryDTO) => {
  return request.get<R<PageResult<CertificateListVO>>>(`${PREFIX}/list`, { params })
}

export const getCertificateDetail = (id: number) => {
  return request.get<R<CertificateDetailVO>>(`${PREFIX}/${id}`)
}

export const addCertificate = (data: CertificateAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

export const updateCertificate = (data: CertificateUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/update`, data)
}

export const softDeleteCertificate = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/soft/${id}`)
}

export const hardDeleteCertificate = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/hard/${id}`)
}

export const batchDeleteCertificate = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, { ids })
}
```

- [ ] **Step 2: 创建竞赛 API `api/certificate/competition.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CompetitionListVO,
  CompetitionDetailVO,
  CompetitionQueryDTO,
  CompetitionAddDTO,
  CompetitionUpdateDTO,
} from '@/types/certificate/competition'

const PREFIX = '/api/v1/admin/competition'

export const getCompetitionPage = (params: CompetitionQueryDTO) => {
  return request.get<R<PageResult<CompetitionListVO>>>(`${PREFIX}/list`, { params })
}

export const getCompetitionDetail = (id: number) => {
  return request.get<R<CompetitionDetailVO>>(`${PREFIX}/${id}`)
}

export const addCompetition = (data: CompetitionAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

export const updateCompetition = (data: CompetitionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/update`, data)
}

export const softDeleteCompetition = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/soft/${id}`)
}

export const hardDeleteCompetition = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/hard/${id}`)
}

export const batchDeleteCompetition = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, { ids })
}
```

- [ ] **Step 3: 创建竞赛-专业关联 API `api/certificate/competitionMajor.ts`**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CompetitionMajorListVO,
  CompetitionMajorQueryDTO,
  CompetitionMajorAddDTO,
} from '@/types/certificate/competitionMajor'

const PREFIX = '/api/v1/admin/competition-major'

export const getCompetitionMajorPage = (params: CompetitionMajorQueryDTO) => {
  return request.get<R<PageResult<CompetitionMajorListVO>>>(`${PREFIX}/list`, { params })
}

export const getByCompetitionId = (competitionId: number) => {
  return request.get<R<CompetitionMajorListVO[]>>(`${PREFIX}/by-competition/${competitionId}`)
}

export const getByMajorId = (majorId: number) => {
  return request.get<R<CompetitionMajorListVO[]>>(`${PREFIX}/by-major/${majorId}`)
}

export const addCompetitionMajor = (data: CompetitionMajorAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

export const deleteCompetitionMajor = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteCompetitionMajor = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, { ids })
}
```

---

### Task 3: 创建证书管理页面

**Files:**
- Create: `apps/admin/src/views/certificate/certificate/index.vue`

- [ ] **Step 1: 创建证书管理页面**

完整页面，参考 `apps/admin/src/views/home/announcement/index.vue` 的布局模式，包含：

- 搜索栏：certName(模糊输入) + category(下拉选择: IT类/财会类/语言类/工程类) + certLevel(下拉选择: 初级/中级/高级) + applicableMajor(模糊输入)
- 操作栏：新增证书(primary) + 刷新 + 批量硬删除(danger, 选中行时启用)
- 表格：复选框 | ID | 证书名称 | 分类 | 等级 | 适用专业 | 报名时间 | 考试时间 | 考试费用(元) | 更新时间 | 操作
- 操作按钮：详情(primary link) + 修改(warning link) + 软删除(info link) + 硬删除(danger link)
- 分页：el-pagination
- Dialog 三模式：
  - 详情：el-descriptions 展示所有字段，examRequirements 用 el-tag 列表展示
  - 新增/修改：el-form 表单

```vue
<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCertificatePage,
  getCertificateDetail,
  addCertificate,
  updateCertificate,
  softDeleteCertificate,
  hardDeleteCertificate,
  batchDeleteCertificate,
} from '@/api/certificate/certificate'
import type {
  CertificateListVO,
  CertificateDetailVO,
  CertificateQueryDTO,
  CertificateAddDTO,
  CertificateUpdateDTO,
} from '@/types/certificate/certificate'

const loading = ref(false)
const tableData = ref<CertificateListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<CertificateQueryDTO>({
  page: 1,
  size: 10,
  certName: '',
  category: undefined,
  certLevel: undefined,
  applicableMajor: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<CertificateDetailVO | null>(null)

const formData = reactive<CertificateAddDTO>({
  certName: '',
  category: '',
  certLevel: '',
  applicableMajor: '',
  registrationTime: '',
  examTime: '',
  examFee: undefined,
  certIntro: '',
  examRequirements: [],
  examArrangement: '',
  officialWebsite: '',
})

const requirementInput = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.certName) params.certName = queryParams.certName
    if (queryParams.category) params.category = queryParams.category
    if (queryParams.certLevel) params.certLevel = queryParams.certLevel
    if (queryParams.applicableMajor) params.applicableMajor = queryParams.applicableMajor
    const res = await getCertificatePage(params as CertificateQueryDTO)
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
  queryParams.certName = ''
  queryParams.category = undefined
  queryParams.certLevel = undefined
  queryParams.applicableMajor = ''
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

const handleSelectionChange = (val: CertificateListVO[]) => {
  selectedIds.value = val.map(v => v.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增证书'
    formData.certName = ''
    formData.category = ''
    formData.certLevel = ''
    formData.applicableMajor = ''
    formData.registrationTime = ''
    formData.examTime = ''
    formData.examFee = undefined
    formData.certIntro = ''
    formData.examRequirements = []
    formData.examArrangement = ''
    formData.officialWebsite = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改证书'
    formLoading.value = true
    try {
      const res = await getCertificateDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.certName = d.certName
        formData.category = d.category || ''
        formData.certLevel = d.certLevel || ''
        formData.applicableMajor = d.applicableMajor || ''
        formData.registrationTime = d.registrationTime || ''
        formData.examTime = d.examTime || ''
        formData.examFee = d.examFee ?? undefined
        formData.certIntro = d.certIntro || ''
        formData.examRequirements = d.examRequirements || []
        formData.examArrangement = d.examArrangement || ''
        formData.officialWebsite = d.officialWebsite || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '证书详情'
    formLoading.value = true
    try {
      const res = await getCertificateDetail(id)
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

const addRequirement = () => {
  if (requirementInput.value.trim()) {
    formData.examRequirements.push(requirementInput.value.trim())
    requirementInput.value = ''
  }
}

const removeRequirement = (index: number) => {
  formData.examRequirements.splice(index, 1)
}

const handleSubmit = async () => {
  if (!formData.certName) {
    ElMessage.warning('请填写证书名称')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: CertificateAddDTO = {
        certName: formData.certName,
      }
      if (formData.category) data.category = formData.category
      if (formData.certLevel) data.certLevel = formData.certLevel
      if (formData.applicableMajor) data.applicableMajor = formData.applicableMajor
      if (formData.registrationTime) data.registrationTime = formData.registrationTime
      if (formData.examTime) data.examTime = formData.examTime
      if (formData.examFee !== undefined && formData.examFee !== null) data.examFee = formData.examFee
      if (formData.certIntro) data.certIntro = formData.certIntro
      if (formData.examRequirements.length > 0) data.examRequirements = formData.examRequirements
      if (formData.examArrangement) data.examArrangement = formData.examArrangement
      if (formData.officialWebsite) data.officialWebsite = formData.officialWebsite
      res = await addCertificate(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: CertificateUpdateDTO = {
        id: currentId.value,
        certName: formData.certName,
      }
      if (formData.category) data.category = formData.category
      if (formData.certLevel) data.certLevel = formData.certLevel
      if (formData.applicableMajor) data.applicableMajor = formData.applicableMajor
      if (formData.registrationTime) data.registrationTime = formData.registrationTime
      if (formData.examTime) data.examTime = formData.examTime
      if (formData.examFee !== undefined && formData.examFee !== null) data.examFee = formData.examFee
      if (formData.certIntro) data.certIntro = formData.certIntro
      if (formData.examRequirements.length > 0) data.examRequirements = formData.examRequirements
      if (formData.examArrangement) data.examArrangement = formData.examArrangement
      if (formData.officialWebsite) data.officialWebsite = formData.officialWebsite
      res = await updateCertificate(data)
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
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleSoftDelete = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要软删除证书「${name}」吗？数据将保留可恢复。`,
      '提示'
    )
    const res = await softDeleteCertificate(id)
    if (res.data.code === 200) {
      ElMessage.success('软删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleHardDelete = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要硬删除证书「${name}」吗？数据不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定硬删除', cancelButtonText: '取消' }
    )
    const res = await hardDeleteCertificate(id)
    if (res.data.code === 200) {
      ElMessage.success('硬删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的证书')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量硬删除选中的 ${selectedIds.value.length} 条证书记录吗？数据不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCertificate(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
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
        <el-form-item label="证书名称">
          <el-input
            v-model="queryParams.certName"
            placeholder="证书名称模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="queryParams.category"
            placeholder="全部分类"
            clearable
            style="width: 140px"
          >
            <el-option label="IT类" value="IT类" />
            <el-option label="财会类" value="财会类" />
            <el-option label="语言类" value="语言类" />
            <el-option label="工程类" value="工程类" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select
            v-model="queryParams.certLevel"
            placeholder="全部等级"
            clearable
            style="width: 120px"
          >
            <el-option label="初级" value="初级" />
            <el-option label="中级" value="中级" />
            <el-option label="高级" value="高级" />
          </el-select>
        </el-form-item>
        <el-form-item label="适用专业">
          <el-input
            v-model="queryParams.applicableMajor"
            placeholder="适用专业模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增证书</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">
        批量硬删除
      </el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="certName" label="证书名称" width="150" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="100" />
        <el-table-column prop="certLevel" label="等级" width="80" />
        <el-table-column prop="applicableMajor" label="适用专业" width="150" show-overflow-tooltip />
        <el-table-column prop="registrationTime" label="报名时间" width="150" />
        <el-table-column prop="examTime" label="考试时间" width="150" />
        <el-table-column prop="examFee" label="考试费用(元)" width="110">
          <template #default="{ row }">
            {{ row.examFee !== null && row.examFee !== undefined ? row.examFee : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="info" link @click="handleSoftDelete(row.id, row.certName)">软删除</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id, row.certName)">硬删除</el-button>
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
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="750px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="证书名称">{{ detailData.certName }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ detailData.category || '-' }}</el-descriptions-item>
            <el-descriptions-item label="等级">{{ detailData.certLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="适用专业">{{ detailData.applicableMajor || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名时间">{{ detailData.registrationTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试费用(元)">{{ detailData.examFee ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="证书简介">{{ detailData.certIntro || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报考条件">
              <div v-if="detailData.examRequirements && detailData.examRequirements.length > 0">
                <el-tag
                  v-for="(req, i) in detailData.examRequirements"
                  :key="i"
                  size="small"
                  class="mr-1 mb-1"
                >
                  {{ req }}
                </el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="考试安排">{{ detailData.examArrangement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="官方网站">{{ detailData.officialWebsite || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="证书名称" required>
              <el-input v-model="formData.certName" placeholder="请输入证书名称" maxlength="150" show-word-limit />
            </el-form-item>
            <el-form-item label="证书分类">
              <el-select v-model="formData.category" placeholder="请选择分类" clearable style="width: 240px">
                <el-option label="IT类" value="IT类" />
                <el-option label="财会类" value="财会类" />
                <el-option label="语言类" value="语言类" />
                <el-option label="工程类" value="工程类" />
              </el-select>
            </el-form-item>
            <el-form-item label="证书等级">
              <el-select v-model="formData.certLevel" placeholder="请选择等级" clearable style="width: 160px">
                <el-option label="初级" value="初级" />
                <el-option label="中级" value="中级" />
                <el-option label="高级" value="高级" />
              </el-select>
            </el-form-item>
            <el-form-item label="适用专业">
              <el-input v-model="formData.applicableMajor" placeholder="请输入适用专业" maxlength="200" />
            </el-form-item>
            <el-form-item label="报名时间">
              <el-input v-model="formData.registrationTime" placeholder="如：每年3月/9月" maxlength="100" />
            </el-form-item>
            <el-form-item label="考试时间">
              <el-input v-model="formData.examTime" placeholder="如：5月中旬/11月上旬" maxlength="100" />
            </el-form-item>
            <el-form-item label="考试费用">
              <el-input-number v-model="formData.examFee" :min="0" :precision="0" placeholder="元" />
            </el-form-item>
            <el-form-item label="证书简介">
              <el-input v-model="formData.certIntro" type="textarea" :rows="3" placeholder="请输入证书简介" />
            </el-form-item>
            <el-form-item label="报考条件">
              <div class="flex gap-2 mb-2">
                <el-input v-model="requirementInput" placeholder="输入报考条件" style="width: 300px" @keyup.enter="addRequirement" />
                <el-button type="primary" @click="addRequirement">添加</el-button>
              </div>
              <div v-if="formData.examRequirements.length > 0" class="flex flex-wrap gap-1">
                <el-tag
                  v-for="(req, i) in formData.examRequirements"
                  :key="i"
                  closable
                  @close="removeRequirement(i)"
                >
                  {{ req }}
                </el-tag>
              </div>
            </el-form-item>
            <el-form-item label="考试安排">
              <el-input v-model="formData.examArrangement" type="textarea" :rows="3" placeholder="请输入考试安排详情" />
            </el-form-item>
            <el-form-item label="官方网站">
              <el-input v-model="formData.officialWebsite" placeholder="https://" maxlength="500" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 4: 创建竞赛管理页面

**Files:**
- Create: `apps/admin/src/views/certificate/competition/index.vue`

- [ ] **Step 1: 创建竞赛管理页面**

搜索栏、操作栏、表格与其他页面类似，区别在于：
- 详情字段很多，使用 el-collapse 折叠面板分组展示
- 新增/修改时 detail 对象用折叠面板展示

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCompetitionPage,
  getCompetitionDetail,
  addCompetition,
  updateCompetition,
  softDeleteCompetition,
  hardDeleteCompetition,
  batchDeleteCompetition,
} from '@/api/certificate/competition'
import type {
  CompetitionListVO,
  CompetitionDetailVO,
  CompetitionQueryDTO,
  CompetitionAddDTO,
  CompetitionUpdateDTO,
} from '@/types/certificate/competition'

const loading = ref(false)
const tableData = ref<CompetitionListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<CompetitionQueryDTO>({
  page: 1,
  size: 10,
  compName: '',
  compLevel: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<CompetitionDetailVO | null>(null)

const formData = reactive<CompetitionAddDTO>({
  compName: '',
  compLevel: '',
  registrationTime: '',
})

// Dynamic list helpers for detail sub-fields
const newAward = ref('')
const newPurpose = ref('')
const newCriteria = ref('')
const newNotice = ref('')
const newRuleTitle = ref('')
const newRuleContent = ref('')
const newGuideTitle = ref('')
const newGuideContent = ref('')
const newAwardDispTitle = ref('')
const newAwardDispContent = ref('')

const basicInfoKey = ref('')
const basicInfoValue = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.compName) params.compName = queryParams.compName
    if (queryParams.compLevel) params.compLevel = queryParams.compLevel
    const res = await getCompetitionPage(params as CompetitionQueryDTO)
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
  queryParams.compName = ''
  queryParams.compLevel = undefined
  queryParams.page = 1
  fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}
const handleSelectionChange = (val: CompetitionListVO[]) => {
  selectedIds.value = val.map(v => v.id)
}

// Detail sub-field helpers
const addAward = () => { if (newAward.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.awards) formData.detail.awards = []; formData.detail.awards.push(newAward.value.trim()); newAward.value = '' } }
const removeAward = (i: number) => { formData.detail?.awards?.splice(i, 1) }
const addPurpose = () => { if (newPurpose.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.purposes) formData.detail.purposes = []; formData.detail.purposes.push(newPurpose.value.trim()); newPurpose.value = '' } }
const removePurpose = (i: number) => { formData.detail?.purposes?.splice(i, 1) }
const addCriteria = () => { if (newCriteria.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.scoringCriteria) formData.detail.scoringCriteria = []; formData.detail.scoringCriteria.push(newCriteria.value.trim()); newCriteria.value = '' } }
const removeCriteria = (i: number) => { formData.detail?.scoringCriteria?.splice(i, 1) }
const addNotice = () => { if (newNotice.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.notices) formData.detail.notices = []; formData.detail.notices.push(newNotice.value.trim()); newNotice.value = '' } }
const removeNotice = (i: number) => { formData.detail?.notices?.splice(i, 1) }
const addRule = () => {
  if (newRuleTitle.value.trim() && newRuleContent.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.competitionRules) formData.detail.competitionRules = []
    formData.detail.competitionRules.push({ title: newRuleTitle.value.trim(), content: newRuleContent.value.trim() })
    newRuleTitle.value = ''; newRuleContent.value = ''
  }
}
const removeRule = (i: number) => { formData.detail?.competitionRules?.splice(i, 1) }
const addGuide = () => {
  if (newGuideTitle.value.trim() && newGuideContent.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.processGuide) formData.detail.processGuide = []
    formData.detail.processGuide.push({ title: newGuideTitle.value.trim(), content: newGuideContent.value.trim() })
    newGuideTitle.value = ''; newGuideContent.value = ''
  }
}
const removeGuide = (i: number) => { formData.detail?.processGuide?.splice(i, 1) }
const addAwardDisp = () => {
  if (newAwardDispTitle.value.trim() && newAwardDispContent.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.awardsDisplay) formData.detail.awardsDisplay = []
    formData.detail.awardsDisplay.push({ title: newAwardDispTitle.value.trim(), content: newAwardDispContent.value.trim() })
    newAwardDispTitle.value = ''; newAwardDispContent.value = ''
  }
}
const removeAwardDisp = (i: number) => { formData.detail?.awardsDisplay?.splice(i, 1) }
const addBasicInfo = () => {
  if (basicInfoKey.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.basicInfo) formData.detail.basicInfo = {}
    formData.detail.basicInfo[basicInfoKey.value.trim()] = basicInfoValue.value.trim()
    basicInfoKey.value = ''; basicInfoValue.value = ''
  }
}
const removeBasicInfo = (key: string) => {
  if (formData.detail?.basicInfo) {
    delete formData.detail.basicInfo[key]
  }
}

const resetFormData = () => {
  formData.compName = ''
  formData.compLevel = ''
  formData.registrationTime = ''
  formData.detail = undefined
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增竞赛'
    resetFormData()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改竞赛'
    formLoading.value = true
    try {
      const res = await getCompetitionDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.compName = d.compName
        formData.compLevel = d.compLevel || ''
        formData.registrationTime = d.registrationTime || ''
        formData.detail = {
          basicInfo: d.basicInfo || {},
          awards: d.awards || [],
          background: d.background || '',
          purposes: d.purposes || [],
          competitionRules: d.competitionRules || [],
          scoringCriteria: d.scoringCriteria || [],
          notices: d.notices || [],
          processGuide: d.processGuide || [],
          awardsDisplay: d.awardsDisplay || [],
        }
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '竞赛详情'
    formLoading.value = true
    try {
      const res = await getCompetitionDetail(id)
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
  if (!formData.compName) {
    ElMessage.warning('请填写竞赛名称')
    return
  }
  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: CompetitionAddDTO = { compName: formData.compName }
      if (formData.compLevel) data.compLevel = formData.compLevel
      if (formData.registrationTime) data.registrationTime = formData.registrationTime
      if (formData.detail && Object.keys(formData.detail).length > 0) {
        const detail: any = {}
        for (const key of Object.keys(formData.detail) as (keyof typeof formData.detail)[]) {
          const val = formData.detail[key]
          if (Array.isArray(val) && val.length > 0) detail[key] = val
          else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) detail[key] = val
          else if (typeof val === 'string' && val) detail[key] = val
        }
        if (Object.keys(detail).length > 0) data.detail = detail
      }
      res = await addCompetition(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: CompetitionUpdateDTO = { id: currentId.value, compName: formData.compName }
      if (formData.compLevel) data.compLevel = formData.compLevel
      if (formData.registrationTime) data.registrationTime = formData.registrationTime
      if (formData.detail && Object.keys(formData.detail).length > 0) {
        const detail: any = {}
        for (const key of Object.keys(formData.detail) as (keyof typeof formData.detail)[]) {
          const val = formData.detail[key]
          if (Array.isArray(val) && val.length > 0) detail[key] = val
          else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) detail[key] = val
          else if (typeof val === 'string' && val) detail[key] = val
        }
        if (Object.keys(detail).length > 0) data.detail = detail
      }
      res = await updateCompetition(data)
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
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleSoftDelete = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(`确定要软删除竞赛「${name}」吗？关联数据将保留可恢复。`, '提示')
    const res = await softDeleteCompetition(id)
    if (res.data.code === 200) {
      ElMessage.success('软删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要硬删除竞赛「${name}」吗？关联数据将同步删除，不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定硬删除', cancelButtonText: '取消' }
    )
    const res = await hardDeleteCompetition(id)
    if (res.data.code === 200) {
      ElMessage.success('硬删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的竞赛')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量硬删除选中的 ${selectedIds.value.length} 条竞赛记录吗？关联数据将同步删除，不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCompetition(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="竞赛名称">
          <el-input v-model="queryParams.compName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="竞赛级别">
          <el-select v-model="queryParams.compLevel" placeholder="全部级别" clearable style="width: 140px">
            <el-option label="国家级" value="国家级" />
            <el-option label="省级" value="省级" />
            <el-option label="校级" value="校级" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增竞赛</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">批量硬删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="compName" label="竞赛名称" width="200" show-overflow-tooltip />
        <el-table-column prop="compLevel" label="竞赛级别" width="100" />
        <el-table-column prop="registrationTime" label="报名时间" width="150" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="info" link @click="handleSoftDelete(row.id, row.compName)">软删除</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id, row.compName)">硬删除</el-button>
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border class="mb-4">
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="竞赛名称">{{ detailData.compName }}</el-descriptions-item>
            <el-descriptions-item label="竞赛级别">{{ detailData.compLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名时间">{{ detailData.registrationTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>

          <el-collapse>
            <el-collapse-item title="基本信息" name="basicInfo">
              <div v-if="detailData.basicInfo && Object.keys(detailData.basicInfo).length > 0">
                <el-descriptions :column="2" border>
                  <el-descriptions-item v-for="(val, key) in detailData.basicInfo" :key="key" :label="key">
                    {{ val }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="奖项设置" name="awards">
              <div v-if="detailData.awards && detailData.awards.length > 0" class="flex flex-wrap gap-1">
                <el-tag v-for="(a, i) in detailData.awards" :key="i">{{ a }}</el-tag>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="竞赛背景与意义" name="background">
              <div v-if="detailData.background">{{ detailData.background }}</div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="竞赛目的" name="purposes">
              <div v-if="detailData.purposes && detailData.purposes.length > 0">
                <ul class="list-disc pl-5">
                  <li v-for="(p, i) in detailData.purposes" :key="i">{{ p }}</li>
                </ul>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="竞赛规则" name="rules">
              <div v-if="detailData.competitionRules && detailData.competitionRules.length > 0">
                <div v-for="(r, i) in detailData.competitionRules" :key="i" class="mb-2">
                  <strong>{{ r.title }}：</strong>{{ r.content }}
                </div>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="评分标准" name="scoring">
              <div v-if="detailData.scoringCriteria && detailData.scoringCriteria.length > 0">
                <ul class="list-disc pl-5">
                  <li v-for="(s, i) in detailData.scoringCriteria" :key="i">{{ s }}</li>
                </ul>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="注意事项" name="notices">
              <div v-if="detailData.notices && detailData.notices.length > 0">
                <ul class="list-disc pl-5">
                  <li v-for="(n, i) in detailData.notices" :key="i">{{ n }}</li>
                </ul>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="参赛流程指南" name="processGuide">
              <div v-if="detailData.processGuide && detailData.processGuide.length > 0">
                <div v-for="(g, i) in detailData.processGuide" :key="i" class="mb-2">
                  <strong>{{ g.title }}：</strong>{{ g.content }}
                </div>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>
          </el-collapse>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="竞赛名称" required>
              <el-input v-model="formData.compName" placeholder="请输入竞赛名称" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="竞赛级别">
              <el-select v-model="formData.compLevel" placeholder="请选择级别" clearable style="width: 200px">
                <el-option label="国家级" value="国家级" />
                <el-option label="省级" value="省级" />
                <el-option label="校级" value="校级" />
              </el-select>
            </el-form-item>
            <el-form-item label="报名时间">
              <el-input v-model="formData.registrationTime" placeholder="如：每年6月-9月" maxlength="100" />
            </el-form-item>

            <!-- 折叠的 detail 字段 -->
            <el-collapse class="mt-4">
              <el-collapse-item title="竞赛详情（选填）" name="detail">
                <!-- basicInfo -->
                <el-form-item label="基本信息">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="basicInfoKey" placeholder="字段名" style="width: 150px" />
                    <el-input v-model="basicInfoValue" placeholder="字段值" style="width: 200px" />
                    <el-button type="primary" @click="addBasicInfo">添加</el-button>
                  </div>
                  <div v-if="formData.detail?.basicInfo && Object.keys(formData.detail.basicInfo).length > 0" class="flex flex-wrap gap-1">
                    <el-tag v-for="(val, key) in formData.detail.basicInfo" :key="key" closable @close="removeBasicInfo(key)">
                      {{ key }}: {{ val }}
                    </el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="奖项设置">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newAward" placeholder="输入奖项名称" style="width: 300px" @keyup.enter="addAward" />
                    <el-button type="primary" @click="addAward">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(a, i) in formData.detail?.awards || []" :key="i" closable @close="removeAward(i)">{{ a }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="竞赛背景">
                  <el-input v-model="formData.detail!.background" type="textarea" :rows="3" placeholder="竞赛背景与意义" />
                </el-form-item>

                <el-form-item label="竞赛目的">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newPurpose" placeholder="输入竞赛目的" style="width: 300px" @keyup.enter="addPurpose" />
                    <el-button type="primary" @click="addPurpose">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(p, i) in formData.detail?.purposes || []" :key="i" closable @close="removePurpose(i)">{{ p }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="竞赛规则">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newRuleTitle" placeholder="标题" style="width: 150px" />
                    <el-input v-model="newRuleContent" placeholder="内容" style="width: 250px" />
                    <el-button type="primary" @click="addRule">添加</el-button>
                  </div>
                  <div v-for="(r, i) in formData.detail?.competitionRules || []" :key="i" class="mb-1">
                    <el-tag closable @close="removeRule(i)">
                      {{ r.title }}：{{ r.content }}
                    </el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="评分标准">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newCriteria" placeholder="输入评分标准" style="width: 300px" @keyup.enter="addCriteria" />
                    <el-button type="primary" @click="addCriteria">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(s, i) in formData.detail?.scoringCriteria || []" :key="i" closable @close="removeCriteria(i)">{{ s }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="注意事项">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newNotice" placeholder="输入注意事项" style="width: 300px" @keyup.enter="addNotice" />
                    <el-button type="primary" @click="addNotice">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(n, i) in formData.detail?.notices || []" :key="i" closable @close="removeNotice(i)">{{ n }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="参赛流程">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newGuideTitle" placeholder="步骤标题" style="width: 150px" />
                    <el-input v-model="newGuideContent" placeholder="步骤内容" style="width: 250px" />
                    <el-button type="primary" @click="addGuide">添加</el-button>
                  </div>
                  <div v-for="(g, i) in formData.detail?.processGuide || []" :key="i" class="mb-1">
                    <el-tag closable @close="removeGuide(i)">
                      {{ g.title }}：{{ g.content }}
                    </el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="奖项展示">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newAwardDispTitle" placeholder="奖项标题" style="width: 150px" />
                    <el-input v-model="newAwardDispContent" placeholder="奖项详情" style="width: 250px" />
                    <el-button type="primary" @click="addAwardDisp">添加</el-button>
                  </div>
                  <div v-for="(ad, i) in formData.detail?.awardsDisplay || []" :key="i" class="mb-1">
                    <el-tag closable @close="removeAwardDisp(i)">
                      {{ ad.title }}：{{ ad.content }}
                    </el-tag>
                  </div>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 5: 创建竞赛-专业关联管理页面

**Files:**
- Create: `apps/admin/src/views/certificate/competition-major/index.vue`

- [ ] **Step 1: 创建竞赛-专业关联页面**

特点：按竞赛ID查询 / 按专业ID查询 为独立按钮（弹窗输入ID后调用专用接口），新增关联通过输入竞赛名称+专业名称。

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCompetitionMajorPage,
  getByCompetitionId,
  getByMajorId,
  addCompetitionMajor,
  deleteCompetitionMajor,
  batchDeleteCompetitionMajor,
} from '@/api/certificate/competitionMajor'
import type {
  CompetitionMajorListVO,
  CompetitionMajorQueryDTO,
  CompetitionMajorAddDTO,
} from '@/types/certificate/competitionMajor'

const loading = ref(false)
const tableData = ref<CompetitionMajorListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<CompetitionMajorQueryDTO>({
  page: 1,
  size: 10,
  competitionName: '',
  majorName: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const detailData = ref<CompetitionMajorListVO | null>(null)

const addForm = reactive<CompetitionMajorAddDTO>({
  competitionName: '',
  majorName: '',
})

// 按ID查询
const idQueryVisible = ref(false)
const idQueryType = ref<'competition' | 'major'>('competition')
const idQueryValue = ref<number | undefined>(undefined)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.competitionName) params.competitionName = queryParams.competitionName
    if (queryParams.majorName) params.majorName = queryParams.majorName
    const res = await getCompetitionMajorPage(params as CompetitionMajorQueryDTO)
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
  queryParams.competitionName = ''
  queryParams.majorName = ''
  queryParams.competitionId = undefined
  queryParams.majorId = undefined
  queryParams.page = 1
  fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (val: CompetitionMajorListVO[]) => { selectedIds.value = val.map(v => v.id) }

const openIdQuery = (type: 'competition' | 'major') => {
  idQueryType.value = type
  idQueryValue.value = undefined
  idQueryVisible.value = true
}

const handleIdQuery = async () => {
  if (!idQueryValue.value) {
    ElMessage.warning(`请输入${idQueryType.value === 'competition' ? '竞赛' : '专业'}ID`)
    return
  }
  formLoading.value = true
  try {
    let res: any
    if (idQueryType.value === 'competition') {
      res = await getByCompetitionId(idQueryValue.value)
    } else {
      res = await getByMajorId(idQueryValue.value)
    }
    if (res.data.code === 200) {
      tableData.value = res.data.data
      total.value = res.data.data.length
      idQueryVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '查询失败')
    }
  } catch {
    ElMessage.error('查询失败')
  } finally {
    formLoading.value = false
  }
}

const openAddDialog = () => {
  dialogMode.value = 'add'
  dialogTitle.value = '新增关联'
  addForm.competitionName = ''
  addForm.majorName = ''
  detailData.value = null
  dialogVisible.value = true
}

const openDetailDialog = (row: CompetitionMajorListVO) => {
  dialogMode.value = 'detail'
  dialogTitle.value = '关联详情'
  detailData.value = row
  dialogVisible.value = true
}

const handleAddSubmit = async () => {
  if (!addForm.competitionName) {
    ElMessage.warning('请填写竞赛名称')
    return
  }
  if (!addForm.majorName) {
    ElMessage.warning('请填写专业名称')
    return
  }
  try {
    const res = await addCompetitionMajor({
      competitionName: addForm.competitionName,
      majorName: addForm.majorName,
    })
    if (res.data.code === 200) {
      ElMessage.success('新增关联成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (id: number, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除竞赛「${name}」的关联吗？删除后数据保留可恢复。`,
      '提示'
    )
    const res = await deleteCompetitionMajor(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的关联')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条关联记录吗？数据保留可恢复。`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCompetitionMajor(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="竞赛名称">
          <el-input v-model="queryParams.competitionName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.majorName" placeholder="专业名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="openIdQuery('competition')">按竞赛ID查询</el-button>
          <el-button @click="openIdQuery('major')">按专业ID查询</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openAddDialog">新增关联</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchDelete">批量删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="competitionName" label="竞赛名称" width="200" show-overflow-tooltip />
        <el-table-column prop="majorName" label="专业名称" width="180" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetailDialog(row)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row.id, row.competitionName)">软删除</el-button>
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

    <!-- 新增 Dialog -->
    <el-dialog v-model="dialogVisible && dialogMode === 'add'" title="新增关联" width="500px" :close-on-click-modal="false">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="竞赛名称" required>
          <el-input v-model="addForm.competitionName" placeholder="输入竞赛名称，系统自动查找ID" />
        </el-form-item>
        <el-form-item label="专业名称" required>
          <el-input v-model="addForm.majorName" placeholder="输入专业名称，系统自动查找ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情 Dialog -->
    <el-dialog v-model="dialogVisible && dialogMode === 'detail'" title="关联详情" width="500px" :close-on-click-modal="false">
      <div v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="竞赛ID">{{ detailData.competitionId }}</el-descriptions-item>
          <el-descriptions-item label="专业ID">{{ detailData.majorId }}</el-descriptions-item>
          <el-descriptions-item label="竞赛名称">{{ detailData.competitionName }}</el-descriptions-item>
          <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 按ID查询 Dialog -->
    <el-dialog v-model="idQueryVisible" :title="idQueryType === 'competition' ? '按竞赛ID查询' : '按专业ID查询'" width="400px" :close-on-click-modal="false">
      <el-form label-width="100px">
        <el-form-item :label="idQueryType === 'competition' ? '竞赛ID' : '专业ID'" required>
          <el-input-number v-model="idQueryValue" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="idQueryVisible = false">取消</el-button>
        <el-button type="primary" @click="handleIdQuery">查询</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 6: 创建路由模块并注册

**Files:**
- Create: `apps/admin/src/router/modules/certificate.ts`
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: 创建路由模块文件**

```typescript
// apps/admin/src/router/modules/certificate.ts
import type { RouteRecordRaw } from 'vue-router'

const certificateRoutes: RouteRecordRaw = {
  path: '/certificate',
  name: 'Certificate',
  meta: { title: '证书竞赛', icon: 'TrophyBase' },
  redirect: '/certificate/certificate',
  children: [
    {
      path: 'certificate',
      name: 'CertificateInfo',
      component: () => import('@/views/certificate/certificate/index.vue'),
      meta: { title: '证书管理', moduleCode: 'certificate_info' },
    },
    {
      path: 'competition',
      name: 'CertificateComp',
      component: () => import('@/views/certificate/competition/index.vue'),
      meta: { title: '竞赛管理', moduleCode: 'certificate_comp' },
    },
    {
      path: 'competition-major',
      name: 'CertificateCompMajor',
      component: () => import('@/views/certificate/competition-major/index.vue'),
      meta: { title: '竞赛-专业关联', moduleCode: 'cert_comp_major' },
    },
  ],
}

export default certificateRoutes
```

- [ ] **Step 2: 在 router/index.ts 中注册**

在 `apps/admin/src/router/index.ts` 中：
1. 添加 import: `import certificateRoutes from './modules/certificate'`
2. 在 asyncRoutes[0].children 中添加 `certificateRoutes`

```
第 11 行后添加: import certificateRoutes from './modules/certificate'
第 51 行后添加: certificateRoutes,
```

---

### Task 7: 验证

- [ ] **Step 1: TypeScript 编译检查**

```bash
cd apps/admin && npx vue-tsc --noEmit
```

Expected: 无类型错误

- [ ] **Step 2: 构建检查**

```bash
cd apps/admin && npm run build
```

Expected: 构建成功

---

## Plan Self-Review Checklist

- [x] **Spec coverage**: 3 pages covered (certificate, competition, competition-major), all API fields mapped
- [x] **No placeholders**: All code is concrete, no TODOs or TBDs
- [x] **Type consistency**: Types match API DTOs/VOs, cross-file references are consistent
- [x] **Delete mechanism**: Soft/hard/batch delete distinction clear for each page
- [x] **Navigation**: Route structure follows AGENTS.md module hierarchy
