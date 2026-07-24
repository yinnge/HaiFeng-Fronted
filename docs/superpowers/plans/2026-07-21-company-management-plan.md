# 企业管理模块 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现企业管理模块的两个子页面（企业列表、企业-行业关联），含分页查询、搜索、增删改、启用/禁用、Excel导入功能

**Architecture:** 按现有各管理模块的统一模式，每页为单一Vue组件，通过 router/modules/company.ts 注册路由，API封装在 api/company/index.ts，类型定义在 types/company/index.ts

**Tech Stack:** Vue 3 + TypeScript + Element Plus + Pinia

---

### Task 1: 创建路由文件

**Files:**
- Create: `apps/admin/src/router/modules/company.ts`

- [ ] **Step 1: 创建 company.ts**

```typescript
import type { RouteRecordRaw } from 'vue-router'

const companyRoutes: RouteRecordRaw = {
  path: '/company',
  name: 'Company',
  meta: { title: '企业管理', icon: 'Briefcase' },
  redirect: '/company/info',
  children: [
    {
      path: 'info',
      name: 'CompanyInfo',
      component: () => import('@/views/company/info/index.vue'),
      meta: { title: '企业列表', moduleCode: 'company_info' },
    },
    {
      path: 'industry',
      name: 'CompanyIndustry',
      component: () => import('@/views/company/industry/index.vue'),
      meta: { title: '企业-行业关联', moduleCode: 'company_industry' },
    },
  ],
}

export default companyRoutes
```

- [ ] **Step 2: 在 router/index.ts 中导入并注册**

修改 `apps/admin/src/router/index.ts`：

在 import 区域添加：
```typescript
import companyRoutes from './modules/company'
```

在 asyncRoutes 的 children 数组中，`specialRoutes` 下一行添加：
```typescript
      companyRoutes,
```

---

### Task 2: 创建类型定义

**Files:**
- Create: `apps/admin/src/types/company/index.ts`

- [ ] **Step 1: 创建类型文件**

```typescript
export interface EnterpriseListVO {
  id: string
  cityName: string | null
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string | null
  recruitmentStatus: string
  isDeleted: boolean
  createdAt: string
}

export interface PositionVO {
  id: string
  enterpriseId: string
  positionName: string
  recruitmentType: string | null
  positionRequirement: string | null
  positionTags: string[] | null
  province: string | null
  city: string | null
  workLocation: string | null
  educationRequirement: string | null
  majorRequirement: string | null
  workExperience: string | null
  salaryMin: number | null
  salaryMax: number | null
  applyLink: string | null
  deadline: string | null
  positionStatus: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface EnterpriseDetailVO {
  id: string
  cityName: string | null
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string | null
  logoUrl: string | null
  officialWebsite: string | null
  region: string | null
  enterpriseScale: string | null
  mainBusiness: string | null
  enterpriseIntro: string | null
  recruitmentStatus: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  positions: PositionVO[]
}

export interface EnterpriseQueryDTO {
  page: number
  size: number
  cityName?: string
  enterpriseName?: string
  enterpriseNature?: string
  enterpriseType?: string
  recruitmentStatus?: string
  isDeleted?: boolean
}

export interface EnterpriseAddDTO {
  cityName?: string
  enterpriseName: string
  enterpriseNature: string
  enterpriseType?: string
  logoUrl?: string
  officialWebsite?: string
  region?: string
  enterpriseScale?: string
  mainBusiness?: string
  enterpriseIntro?: string
  recruitmentStatus?: string
}

export interface EnterpriseUpdateDTO {
  cityName?: string
  enterpriseName: string
  enterpriseNature: string
  enterpriseType?: string
  logoUrl?: string
  officialWebsite?: string
  region?: string
  enterpriseScale?: string
  mainBusiness?: string
  enterpriseIntro?: string
  recruitmentStatus?: string
}

export interface StatusDTO {
  isDeleted: boolean
}

export interface EnterpriseIndustryListVO {
  id: string
  enterpriseId: string
  enterpriseName: string
  industryId: string
  industryName: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface EnterpriseIndustryDetailVO {
  id: string
  enterpriseId: string
  enterpriseName: string
  industryId: string
  industryName: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface EnterpriseIndustryQueryDTO {
  page: number
  size: number
  enterpriseName?: string
  industryName?: string
}
```

---

### Task 3: 创建 API 封装

**Files:**
- Create: `apps/admin/src/api/company/index.ts`

- [ ] **Step 1: 创建 API 文件**

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  EnterpriseListVO,
  EnterpriseDetailVO,
  EnterpriseQueryDTO,
  EnterpriseAddDTO,
  EnterpriseUpdateDTO,
  StatusDTO,
  EnterpriseIndustryListVO,
  EnterpriseIndustryDetailVO,
  EnterpriseIndustryQueryDTO,
} from '@/types/company'

const ENTERPRISE_PREFIX = '/api/v1/admin/company/enterprise'
const INDUSTRY_PREFIX = '/api/v1/admin/company/enterprise-industry'

// ---- 企业列表 ----

export const getEnterprisePage = (params: EnterpriseQueryDTO) => {
  return request.get<R<PageResult<EnterpriseListVO>>>(`${ENTERPRISE_PREFIX}/list`, { params })
}

export const getEnterpriseDetail = (id: string) => {
  return request.get<R<EnterpriseDetailVO>>(`${ENTERPRISE_PREFIX}/${id}`)
}

export const addEnterprise = (data: EnterpriseAddDTO) => {
  return request.post<R<string>>(ENTERPRISE_PREFIX, data)
}

export const updateEnterprise = (id: string, data: EnterpriseUpdateDTO) => {
  return request.put<R<void>>(`${ENTERPRISE_PREFIX}/${id}`, data)
}

export const updateEnterpriseStatus = (id: string, data: StatusDTO) => {
  return request.put<R<void>>(`${ENTERPRISE_PREFIX}/${id}/status`, data)
}

export const deleteEnterprise = (id: string) => {
  return request.delete<R<void>>(`${ENTERPRISE_PREFIX}/${id}`)
}

export const batchDeleteEnterprise = (ids: string[]) => {
  return request.post<R<void>>(`${ENTERPRISE_PREFIX}/batch/delete`, { ids })
}

export const importEnterprise = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${ENTERPRISE_PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ---- 企业-行业关联 ----

export const getEnterpriseIndustryPage = (params: EnterpriseIndustryQueryDTO) => {
  return request.get<R<PageResult<EnterpriseIndustryListVO>>>(`${INDUSTRY_PREFIX}/list`, { params })
}

export const getEnterpriseIndustryDetail = (id: string) => {
  return request.get<R<EnterpriseIndustryDetailVO>>(`${INDUSTRY_PREFIX}/${id}`)
}

export const deleteEnterpriseIndustry = (id: string) => {
  return request.delete<R<void>>(`${INDUSTRY_PREFIX}/${id}`)
}

export const batchDeleteEnterpriseIndustry = (ids: string[]) => {
  return request.post<R<void>>(`${INDUSTRY_PREFIX}/batch/delete`, { ids })
}

export const importEnterpriseIndustry = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${INDUSTRY_PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 4: 创建企业列表页面

**Files:**
- Create: `apps/admin/src/views/company/info/index.vue`

参考 `apps/admin/src/views/industry/list/index.vue` 的完整模式，实现：

- 搜索栏：企业名称、城市名称(模糊)、企业性质(精确下拉)、企业类型(模糊)、招聘状态(精确下拉)、状态(启用/禁用下拉)
- 操作按钮：新增企业(primary)、Excel批量导入(success split-button)、批量永久删除(danger)、刷新
- 表格：多选 + ID/城市名称/企业名称/企业性质/企业类型/招聘状态/状态(Tag)/创建时间 + 操作(详情/修改/启用禁用/永久删除)
- 分页组件
- 详情弹窗：el-descriptions column=2 展示全部字段 + 岗位子表格
- 新增/编辑弹窗：表单含全部 11 个字段
- 导入弹窗：el-upload 拖拽上传

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getEnterprisePage,
  getEnterpriseDetail,
  addEnterprise,
  updateEnterprise,
  updateEnterpriseStatus,
  deleteEnterprise,
  batchDeleteEnterprise,
  importEnterprise,
} from '@/api/company'
import type {
  EnterpriseListVO,
  EnterpriseDetailVO,
  EnterpriseQueryDTO,
} from '@/types/company'

const loading = ref(false)
const tableData = ref<EnterpriseListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<EnterpriseQueryDTO>({
  page: 1,
  size: 10,
  cityName: '',
  enterpriseName: '',
  enterpriseNature: undefined,
  enterpriseType: '',
  recruitmentStatus: undefined,
  isDeleted: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<EnterpriseDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  cityName: '',
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  logoUrl: '',
  officialWebsite: '',
  region: '',
  enterpriseScale: '',
  mainBusiness: '',
  enterpriseIntro: '',
  recruitmentStatus: '招聘中',
})

const natureOptions = ['央企', '国企', '民企', '外企', '合资']
const natureLabels: Record<string, string> = {
  '央企': '央企',
  '国企': '国企',
  '民企': '民企',
  '外企': '外企',
  '合资': '合资',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.cityName) params.cityName = queryParams.cityName
    if (queryParams.enterpriseName) params.enterpriseName = queryParams.enterpriseName
    if (queryParams.enterpriseNature) params.enterpriseNature = queryParams.enterpriseNature
    if (queryParams.enterpriseType) params.enterpriseType = queryParams.enterpriseType
    if (queryParams.recruitmentStatus) params.recruitmentStatus = queryParams.recruitmentStatus
    if (queryParams.isDeleted !== undefined && queryParams.isDeleted !== null) params.isDeleted = queryParams.isDeleted
    const res = await getEnterprisePage(params as EnterpriseQueryDTO)
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
  queryParams.cityName = ''
  queryParams.enterpriseName = ''
  queryParams.enterpriseNature = undefined
  queryParams.enterpriseType = ''
  queryParams.recruitmentStatus = undefined
  queryParams.isDeleted = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: EnterpriseListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const resetForm = () => {
  formData.cityName = ''
  formData.enterpriseName = ''
  formData.enterpriseNature = ''
  formData.enterpriseType = ''
  formData.logoUrl = ''
  formData.officialWebsite = ''
  formData.region = ''
  formData.enterpriseScale = ''
  formData.mainBusiness = ''
  formData.enterpriseIntro = ''
  formData.recruitmentStatus = '招聘中'
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增企业'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改企业'
    formLoading.value = true
    try {
      const res = await getEnterpriseDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.cityName = d.cityName || ''
        formData.enterpriseName = d.enterpriseName
        formData.enterpriseNature = d.enterpriseNature
        formData.enterpriseType = d.enterpriseType || ''
        formData.logoUrl = d.logoUrl || ''
        formData.officialWebsite = d.officialWebsite || ''
        formData.region = d.region || ''
        formData.enterpriseScale = d.enterpriseScale || ''
        formData.mainBusiness = d.mainBusiness || ''
        formData.enterpriseIntro = d.enterpriseIntro || ''
        formData.recruitmentStatus = d.recruitmentStatus
      }
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '企业详情'
    formLoading.value = true
    try {
      const res = await getEnterpriseDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.enterpriseName) {
    ElMessage.warning('请填写企业名称')
    return
  }
  if (!formData.enterpriseNature) {
    ElMessage.warning('请选择企业性质')
    return
  }

  try {
    const data: Record<string, any> = {
      enterpriseName: formData.enterpriseName,
      enterpriseNature: formData.enterpriseNature,
    }
    if (formData.cityName) data.cityName = formData.cityName
    if (formData.enterpriseType) data.enterpriseType = formData.enterpriseType
    if (formData.logoUrl) data.logoUrl = formData.logoUrl
    if (formData.officialWebsite) data.officialWebsite = formData.officialWebsite
    if (formData.region) data.region = formData.region
    if (formData.enterpriseScale) data.enterpriseScale = formData.enterpriseScale
    if (formData.mainBusiness) data.mainBusiness = formData.mainBusiness
    if (formData.enterpriseIntro) data.enterpriseIntro = formData.enterpriseIntro
    if (formData.recruitmentStatus) data.recruitmentStatus = formData.recruitmentStatus

    let res: any
    if (dialogMode.value === 'add') {
      res = await addEnterprise(data as any)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateEnterprise(currentId.value, data)
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

const handleToggleStatus = async (row: EnterpriseListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该企业吗？`, '提示')
    const res = await updateEnterpriseStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该企业吗？此操作不可恢复！', '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await deleteEnterprise(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的企业'); return }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条企业记录吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消',
    })
    const res = await batchDeleteEnterprise(selectedIds.value)
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
    const res = await importEnterprise(importFile.value)
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

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="企业名称">
          <el-input v-model="queryParams.enterpriseName" placeholder="企业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="城市名称">
          <el-input v-model="queryParams.cityName" placeholder="城市名称模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="企业性质">
          <el-select v-model="queryParams.enterpriseNature" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业类型">
          <el-input v-model="queryParams.enterpriseType" placeholder="类型模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="招聘状态">
          <el-select v-model="queryParams.recruitmentStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="招聘中" value="招聘中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 100px">
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增企业</el-button>
        <el-button type="success" @click="openImportDialog">Excel批量导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="cityName" label="城市名称" width="120" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="enterpriseNature" label="企业性质" width="100" />
        <el-table-column prop="enterpriseType" label="企业类型" width="150" show-overflow-tooltip />
        <el-table-column prop="recruitmentStatus" label="招聘状态" width="100" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">永久删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ detailData.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="城市名称">{{ detailData.cityName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业性质">{{ detailData.enterpriseNature }}</el-descriptions-item>
            <el-descriptions-item label="企业类型">{{ detailData.enterpriseType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="招聘状态">{{ detailData.recruitmentStatus }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总部地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业规模">{{ detailData.enterpriseScale || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Logo地址">
              <template v-if="detailData.logoUrl">
                <el-link type="primary" :href="detailData.logoUrl" target="_blank">{{ detailData.logoUrl }}</el-link>
              </template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="官网">
              <template v-if="detailData.officialWebsite">
                <el-link type="primary" :href="detailData.officialWebsite" target="_blank">{{ detailData.officialWebsite }}</el-link>
              </template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="主营业务" :span="2">{{ detailData.mainBusiness || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业简介" :span="2">{{ detailData.enterpriseIntro || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>

          <div class="mt-4">
            <h3 class="mb-2 text-base font-medium">关联岗位</h3>
            <el-table :data="detailData.positions" border stripe size="small" v-if="detailData.positions.length">
              <el-table-column prop="positionName" label="岗位名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
              <el-table-column prop="province" label="省份" width="80" />
              <el-table-column prop="city" label="城市" width="80" />
              <el-table-column prop="workLocation" label="工作地点" width="140" show-overflow-tooltip />
              <el-table-column prop="educationRequirement" label="学历要求" width="90" />
              <el-table-column prop="majorRequirement" label="专业要求" width="120" show-overflow-tooltip />
              <el-table-column prop="workExperience" label="工作经验" width="90" />
              <el-table-column label="薪资(k/月)" width="120">
                <template #default="{ row }">
                  {{ row.salaryMin ?? '-' }} - {{ row.salaryMax ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="positionStatus" label="岗位状态" width="90" />
              <el-table-column prop="deadline" label="截止日期" width="100" />
            </el-table>
            <div v-else class="py-8 text-center text-gray-400">暂无关联岗位</div>
          </div>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业名称" required>
                  <el-input v-model="formData.enterpriseName" placeholder="请输入企业名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业性质" required>
                  <el-select v-model="formData.enterpriseNature" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="城市名称">
                  <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业类型">
                  <el-input v-model="formData.enterpriseType" placeholder="请输入企业类型" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Logo地址">
                  <el-input v-model="formData.logoUrl" placeholder="请输入Logo图片URL" maxlength="500" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="官网">
                  <el-input v-model="formData.officialWebsite" placeholder="请输入企业官网" maxlength="500" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="总部地区">
                  <el-input v-model="formData.region" placeholder="如: 广东省深圳市" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业规模">
                  <el-input v-model="formData.enterpriseScale" placeholder="如: 10000人以上" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="招聘状态">
                  <el-input v-model="formData.recruitmentStatus" placeholder="默认: 招聘中" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主营业务">
                  <el-input v-model="formData.mainBusiness" placeholder="请输入主营业务" maxlength="500" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="企业简介">
              <el-input v-model="formData.enterpriseIntro" type="textarea" :rows="4" placeholder="请输入企业简介" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel批量导入" width="550px">
      <div>
        <div class="mb-3 text-sm text-gray-500">
          导入企业数据及关联岗位（单文件多Sheet）。企业名称必填且唯一，企业性质必填（央企/国企/民企/外企/合资）。
        </div>
        <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">
          <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .xlsx / .xls 格式，单Sheet不超过500行</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 5: 创建企业-行业关联页面

**Files:**
- Create: `apps/admin/src/views/company/industry/index.vue`

模式和企业列表页类似，但更简洁——无新增编辑表单、无启用/禁用、搜索只有企业名称和行业名称。

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getEnterpriseIndustryPage,
  getEnterpriseIndustryDetail,
  deleteEnterpriseIndustry,
  batchDeleteEnterpriseIndustry,
  importEnterpriseIndustry,
} from '@/api/company'
import type {
  EnterpriseIndustryListVO,
  EnterpriseIndustryDetailVO,
  EnterpriseIndustryQueryDTO,
} from '@/types/company'

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
const dialogTitle = ref('')
const formLoading = ref(false)
const detailData = ref<EnterpriseIndustryDetailVO | null>(null)

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

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

const openDetail = async (id: string) => {
  dialogTitle.value = '关联详情'
  formLoading.value = true
  try {
    const res = await getEnterpriseIndustryDetail(id)
    if (res.data.code === 200) {
      detailData.value = res.data.data
      dialogVisible.value = true
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch {
    ElMessage.error('获取详情失败')
  } finally {
    formLoading.value = false
  }
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

const primaryTag = (val: boolean) => (val ? 'success' : 'info')
const primaryLabel = (val: boolean) => (val ? '主行业' : '普通')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="企业名称">
          <el-input v-model="queryParams.enterpriseName" placeholder="企业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="行业名称">
          <el-input v-model="queryParams.industryName" placeholder="行业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="success" @click="openImportDialog">Excel批量导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="industryName" label="行业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="isPrimary" label="是否主行业" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="primaryTag(row.isPrimary)" size="small">{{ primaryLabel(row.isPrimary) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">永久删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ detailData.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="行业名称">{{ detailData.industryName }}</el-descriptions-item>
            <el-descriptions-item label="是否主行业">
              <el-tag :type="primaryTag(detailData.isPrimary)" size="small">{{ primaryLabel(detailData.isPrimary) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel批量导入" width="550px">
      <div>
        <div class="mb-3 text-sm text-gray-500">
          导入企业-行业关联数据。企业名称必填且必须在企业表中存在，行业名称必填且必须在行业表中存在。
        </div>
        <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">
          <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .xlsx / .xls 格式，单次导入不超过500行</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

## 自审检查

| Spec 需求 | 对应任务 |
|-----------|---------|
| 导航/路由 | Task 1: 路由文件 + 注册 |
| 类型定义 | Task 2: 类型文件 |
| API 封装 | Task 3: API 文件 |
| 企业列表(搜索/增删改/启用禁用/导入) | Task 4: 企业列表页面 |
| 企业-行业关联(搜索/删/导入) | Task 5: 企业-行业关联页面 |
| isPrimary Tag 展示 | Task 5: primaryTag/primaryLabel |
| sortOrder 隐藏 | Task 5: 表格列不含 sortOrder |
| 错误提示 | 所有页面使用 ElMessage 统一处理 |
| 权限(moduleCode) | Task 1: 路由中设 meta.moduleCode |
