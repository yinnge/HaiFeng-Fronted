# 院校管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 3-page university management module (院校列表, 校园图册, 院校适应指南) following the existing announcement CRUD pattern.

**Architecture:** Each submodule follows the existing DDD-style structure: `types/{module}/` → `api/{module}/` → `views/{module}/index.vue`. The router gets a new `university.ts` module registered in `router/index.ts`. All pages follow the announcement page's el-table + el-dialog + el-pagination pattern.

**Tech Stack:** Vue 3 Composition API + `<script setup>`, TypeScript, Element Plus, Pinia, Axios

---

### Task 1: Create route module for university

**Files:**
- Create: `apps/admin/src/router/modules/university.ts`
- Modify: `apps/admin/src/router/index.ts:4` (add import), `apps/admin/src/router/index.ts:42` (add to children)

- [ ] **Step 1: Create router module file**

Write `apps/admin/src/router/modules/university.ts`:

```typescript
import type { RouteRecordRaw } from 'vue-router'

const universityRoutes: RouteRecordRaw = {
  path: '/university',
  name: 'University',
  meta: { title: '院校管理', icon: 'School' },
  redirect: '/university/info',
  children: [
    {
      path: 'info',
      name: 'UniversityInfo',
      component: () => import('@/views/university/info/index.vue'),
      meta: { title: '院校列表', moduleCode: 'university_info' },
    },
    {
      path: 'album',
      name: 'UniversityAlbum',
      component: () => import('@/views/university/album/index.vue'),
      meta: { title: '校园图册', moduleCode: 'university_album' },
    },
    {
      path: 'guide',
      name: 'UniversityGuide',
      component: () => import('@/views/university/guide/index.vue'),
      meta: { title: '院校适应指南', moduleCode: 'university_guide' },
    },
  ],
}

export default universityRoutes
```

- [ ] **Step 2: Register route in router/index.ts**

Edit `apps/admin/src/router/index.ts`:

Add import line after `import homeRoutes from './modules/home'`:
```typescript
import universityRoutes from './modules/university'
```

Add `universityRoutes` to the asyncRoutes children array after `homeRoutes`:
```typescript
homeRoutes,
universityRoutes,
```

---

### Task 2: Create types for university info

**Files:**
- Create: `apps/admin/src/types/university/info.ts`

- [ ] **Step 1: Create types file**

Write `apps/admin/src/types/university/info.ts`:

```typescript
export interface UniversityListVO {
  id: number
  name: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  status: number
  createdAt: string
}

export interface RankingsVO {
  ruanke: number | null
  xiaoyouhui: number | null
  wushulian: number | null
  qs: number | null
  usnews: number | null
}

export interface UniversityDetailVO {
  id: number
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  recommendationRate: number | null
  recommendationYear: number | null
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
  tags: string[]
  famousUnion: string
  imageUrl: string
  introduction: string
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
  detailId: number | null
  address: string
  admissionPhone: string
  website: string
  historyGroupScore: number | null
  scienceGroupScore: number | null
  carouselImages: string[]
  detailIntroduction: string
  rankings: RankingsVO
  abroadRate: string
  genderRatio: string
}

export interface UniversityQueryDTO {
  name?: string
  provinceName?: string
  category?: string
  status?: number
  page: number
  size: number
}

export interface UniversityAddDTO {
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount?: number
  educationLevel?: string
  nature?: string
  recommendationRate?: number
  recommendationYear?: number
  hasDoctorate?: boolean
  hasMaster?: boolean
  department?: string
  tags?: string[]
  famousUnion?: string
  imageUrl?: string
  introduction?: string
  sortOrder?: number
}

export interface UniversityUpdateDTO extends UniversityAddDTO {
  status?: number
}

export interface UniversityDetailUpdateDTO {
  address?: string
  admissionPhone?: string
  website?: string
  historyGroupScore?: number
  scienceGroupScore?: number
  carouselImages?: string[]
  introduction?: string
  rankings?: Record<string, number>
  abroadRate?: string
  genderRatio?: string
  sortOrder?: number
  status?: number
}
```

---

### Task 3: Create types for campus gallery

**Files:**
- Create: `apps/admin/src/types/university/gallery.ts`

- [ ] **Step 1: Create types file**

Write `apps/admin/src/types/university/gallery.ts`:

```typescript
export interface CampusGalleryListVO {
  id: number
  universityId: number
  universityName: string
  imageType: string
  imageUrl: string
  sortOrder: number
  status: number
  createdAt: string
}

export interface CampusGalleryDetailVO {
  id: number
  universityId: number
  universityName: string
  imageType: string
  imageUrl: string
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface CampusGalleryQueryDTO {
  universityName?: string
  imageType?: string
  status?: number
  page: number
  size: number
}

export interface CampusGalleryAddDTO {
  universityId: number
  imageType: string
  imageUrl: string
  sortOrder?: number
}

export interface CampusGalleryUpdateDTO {
  imageType: string
  imageUrl: string
  sortOrder?: number
  status?: number
}
```

---

### Task 4: Create types for university guide

**Files:**
- Create: `apps/admin/src/types/university/guide.ts`

- [ ] **Step 1: Create types file**

Write `apps/admin/src/types/university/guide.ts`:

```typescript
export interface UniversityGuideListVO {
  id: number
  universityId: number
  universityName: string
  customTags: string[]
  remark: string
  status: number
  createdAt: string
}

export interface UniversityGuideDetailVO {
  id: number
  universityId: number
  universityName: string
  customTags: string[]
  campusFacilities: Record<string, any>
  dormitoryServices: Record<string, any>
  campusTransportation: Record<string, any>
  academicGuidance: Record<string, any>
  majorTransferGuidelines: Record<string, any>
  majorTransferConstriction: Record<string, any>
  academicSupportResources: Record<string, any>
  studentOrganizations: Record<string, any>
  campusEvents: Record<string, any>
  classDormSocial: Record<string, any>
  financialAid: Record<string, any>
  campusSecurity: Record<string, any>
  healthServices: Record<string, any>
  lifeServices: Record<string, any>
  remark: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface UniversityGuideQueryDTO {
  universityName?: string
  status?: number
  page: number
  size: number
}

export interface UniversityGuideAddDTO {
  universityId: number
  customTags?: string[]
  remark?: string
}

export interface UniversityGuideUpdateDTO {
  customTags?: string[]
  remark?: string
  status?: number
}
```

---

### Task 5: Create types barrel export

**Files:**
- Create: `apps/admin/src/types/university/index.ts`

- [ ] **Step 1: Create barrel export**

Write `apps/admin/src/types/university/index.ts`:

```typescript
export * from './info'
export * from './gallery'
export * from './guide'
```

---

### Task 6: Create API service for university info

**Files:**
- Create: `apps/admin/src/api/university/info.ts`

- [ ] **Step 1: Create API file**

Write `apps/admin/src/api/university/info.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { UniversityListVO, UniversityDetailVO, UniversityQueryDTO, UniversityAddDTO, UniversityUpdateDTO, UniversityDetailUpdateDTO } from '@/types/university/info'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university'

export const getUniversityPage = (params: UniversityQueryDTO): AxiosResponse<PageResponse<UniversityListVO>> =>
  request.get(`${PREFIX}/list`, { params })

export const getUniversityDetail = (id: number): AxiosResponse<R<UniversityDetailVO>> =>
  request.get(`${PREFIX}/${id}`)

export const addUniversity = (data: UniversityAddDTO): AxiosResponse<R<number>> =>
  request.post(PREFIX, data)

export const updateUniversity = (id: number, data: UniversityUpdateDTO): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateUniversityDetail = (id: number, data: UniversityDetailUpdateDTO): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}/detail`, data)

export const updateUniversityStatus = (id: number, data: { status: number }): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteUniversity = (id: number): AxiosResponse<R<void>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteUniversity = (id: number): AxiosResponse<R<void>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteUniversity = (ids: number[]): AxiosResponse<R<void>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteUniversity = (ids: number[]): AxiosResponse<R<void>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importUniversity = (file: File): AxiosResponse<R<void>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importUniversityDetail = (file: File): AxiosResponse<R<void>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import-detail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 7: Create API service for campus gallery

**Files:**
- Create: `apps/admin/src/api/university/gallery.ts`

- [ ] **Step 1: Create API file**

Write `apps/admin/src/api/university/gallery.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { CampusGalleryListVO, CampusGalleryDetailVO, CampusGalleryQueryDTO, CampusGalleryAddDTO, CampusGalleryUpdateDTO } from '@/types/university/gallery'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/gallery'

export const getGalleryPage = (params: CampusGalleryQueryDTO): AxiosResponse<PageResponse<CampusGalleryListVO>> =>
  request.get(`${PREFIX}/list`, { params })

export const getGalleryDetail = (id: number): AxiosResponse<R<CampusGalleryDetailVO>> =>
  request.get(`${PREFIX}/${id}`)

export const addGallery = (data: CampusGalleryAddDTO): AxiosResponse<R<number>> =>
  request.post(PREFIX, data)

export const updateGallery = (id: number, data: CampusGalleryUpdateDTO): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateGalleryStatus = (id: number, data: { status: number }): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteGallery = (id: number): AxiosResponse<R<void>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteGallery = (id: number): AxiosResponse<R<void>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteGallery = (ids: number[]): AxiosResponse<R<void>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteGallery = (ids: number[]): AxiosResponse<R<void>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importGallery = (file: File): AxiosResponse<R<void>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 8: Create API service for university guide

**Files:**
- Create: `apps/admin/src/api/university/guide.ts`

- [ ] **Step 1: Create API file**

Write `apps/admin/src/api/university/guide.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { UniversityGuideListVO, UniversityGuideDetailVO, UniversityGuideQueryDTO, UniversityGuideAddDTO, UniversityGuideUpdateDTO } from '@/types/university/guide'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/guide'

export const getGuidePage = (params: UniversityGuideQueryDTO): AxiosResponse<PageResponse<UniversityGuideListVO>> =>
  request.get(`${PREFIX}/list`, { params })

export const getGuideDetail = (id: number): AxiosResponse<R<UniversityGuideDetailVO>> =>
  request.get(`${PREFIX}/${id}`)

export const addGuide = (data: UniversityGuideAddDTO): AxiosResponse<R<number>> =>
  request.post(PREFIX, data)

export const updateGuide = (id: number, data: UniversityGuideUpdateDTO): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateGuideStatus = (id: number, data: { status: number }): AxiosResponse<R<void>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteGuide = (id: number): AxiosResponse<R<void>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteGuide = (id: number): AxiosResponse<R<void>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteGuide = (ids: number[]): AxiosResponse<R<void>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteGuide = (ids: number[]): AxiosResponse<R<void>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importGuide = (file: File): AxiosResponse<R<void>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

---

### Task 9: Create the university list page (院校列表)

**Files:**
- Create: `apps/admin/src/views/university/info/index.vue`

- [ ] **Step 1: Create the Vue component**

Note: This is a large CRUD page (~500 lines). The template follows the exact same structure as the announcement page (`apps/admin/src/views/home/announcement/index.vue`) but with:

- Search fields: 院校名称, 省份, 院校类别, 状态
- Action bar: 新增院校, 导入主表, 导入详情, 批量下架, 批量永久删除, 刷新
- Table columns: checkbox + ID, 院校名称, 省份, 城市, 地区, 类别, 办学层次, 性质, 状态, 创建时间, 操作
- Operation buttons: 详情, 修改, 禁用/启用, 下架, 永久删除
- Dialog with tabs: Tab1=基础信息, Tab2=详细信息
- Batch operations: checkbox selection + batch delete buttons
- Import: hidden file input triggered by button

Key implementation details:
```typescript
// Batch selection
const selectedIds = ref<number[]>([])
const handleSelectionChange = (selection: UniversityListVO[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// Import helper
const handleImport = async (importFn: (file: File) => Promise<AxiosResponse<R<void>>>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await importFn(file)
      if (res.data.code === 200) {
        ElMessage.success('导入成功')
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '导入失败')
      }
    } catch {
      ElMessage.error('导入失败')
    }
  }
  input.click()
}

// Status toggle (same as announcement)
const handleToggleStatus = async (row: UniversityListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该院校吗？`, '提示')
    const res = await updateUniversityStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}

// Single soft delete
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要下架该院校吗？', '提示')
    const res = await deleteUniversity(id)
    if (res.data.code === 200) {
      ElMessage.success('下架成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}

// Single hard delete
const handleHardDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该院校吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteUniversity(id)
    if (res.data.code === 200) {
      ElMessage.success('永久删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}

// Batch soft delete
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要下架的院校')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要下架选中的 ${selectedIds.value.length} 所院校吗？`, '提示')
    const res = await batchDeleteUniversity(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量下架成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}

// Batch hard delete
const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要永久删除的院校')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 所院校吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteUniversity(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量永久删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}
```

Template structure outline:
```html
<div>
  <!-- Search bar -->
  <div class="mb-4 rounded-lg bg-white p-5">
    <el-form :model="queryParams" inline>
      <el-form-item label="院校名称">
        <el-input v-model="queryParams.name" placeholder="模糊搜索" clearable style="width:180px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="省份">
        <el-input v-model="queryParams.provinceName" placeholder="精确匹配" clearable style="width:140px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="院校类别">
        <el-input v-model="queryParams.category" placeholder="精确匹配" clearable style="width:140px" @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width:120px">
          <el-option label="展示" :value="1" />
          <el-option label="下架" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- Action bar -->
  <div class="mb-4">
    <el-button type="primary" @click="openDialog('add')">新增院校</el-button>
    <el-button @click="handleImport(importUniversity)">导入主表</el-button>
    <el-button @click="handleImport(importUniversityDetail)">导入详情</el-button>
    <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量下架</el-button>
    <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量永久删除</el-button>
    <el-button @click="fetchData">刷新</el-button>
  </div>

  <!-- Table -->
  <div class="rounded-lg bg-white p-5">
    <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="140" />
      <el-table-column prop="name" label="院校名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="provinceName" label="省份" width="120" />
      <el-table-column prop="cityName" label="城市" width="120" />
      <el-table-column prop="region" label="地区" width="100" />
      <el-table-column prop="category" label="类别" width="100" />
      <el-table-column prop="educationLevel" label="办学层次" width="100" />
      <el-table-column prop="nature" label="性质" width="80" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '展示' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="450" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
          <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
          <el-button :type="row.status === 1 ? 'info' : 'success'" link @click="handleToggleStatus(row)">
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(row.id)">下架</el-button>
          <el-button type="danger" link @click="handleHardDelete(row.id)">永久删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Pagination -->
    <div class="mt-4 flex justify-end">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 30, 50, 100]" :total="total" layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange" @size-change="handleSizeChange" />
    </div>
  </div>

  <!-- Dialog -->
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false">
    <div v-loading="formLoading">
      <!-- Detail mode -->
      <template v-if="dialogMode === 'detail' && detailData">
        <el-tabs>
          <el-tab-pane label="基础信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
              <el-descriptions-item label="院校名称">{{ detailData.name }}</el-descriptions-item>
              <el-descriptions-item label="英文名称">{{ detailData.nameEn }}</el-descriptions-item>
              <el-descriptions-item label="省份">{{ detailData.provinceName }}</el-descriptions-item>
              <el-descriptions-item label="城市">{{ detailData.cityName }}</el-descriptions-item>
              <el-descriptions-item label="地区">{{ detailData.region }}</el-descriptions-item>
              <el-descriptions-item label="院校类别">{{ detailData.category }}</el-descriptions-item>
              <el-descriptions-item label="专业数量">{{ detailData.majorCount }}</el-descriptions-item>
              <el-descriptions-item label="办学层次">{{ detailData.educationLevel }}</el-descriptions-item>
              <el-descriptions-item label="院校性质">{{ detailData.nature }}</el-descriptions-item>
              <el-descriptions-item label="推免率">{{ detailData.recommendationRate }}% ({{ detailData.recommendationYear }}年)</el-descriptions-item>
              <el-descriptions-item label="博士点">{{ detailData.hasDoctorate ? '有' : '无' }}</el-descriptions-item>
              <el-descriptions-item label="硕士点">{{ detailData.hasMaster ? '有' : '无' }}</el-descriptions-item>
              <el-descriptions-item label="隶属部门">{{ detailData.department }}</el-descriptions-item>
              <el-descriptions-item label="院校标签" :span="2">
                <el-tag v-for="tag in detailData.tags" :key="tag" size="small" style="margin-right:4px">{{ tag }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="知名联盟">{{ detailData.famousUnion }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                  {{ detailData.status === 1 ? '展示' : '下架' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="院校简介" :span="2">
                <div class="max-h-40 overflow-y-auto">{{ detailData.introduction }}</div>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="详细信息">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
              <el-descriptions-item label="招生电话">{{ detailData.admissionPhone || '-' }}</el-descriptions-item>
              <el-descriptions-item label="官方网站">{{ detailData.website || '-' }}</el-descriptions-item>
              <el-descriptions-item label="历史组分数线">{{ detailData.historyGroupScore ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="物理组分数线">{{ detailData.scienceGroupScore ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="出国比例">{{ detailData.abroadRate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="男女比例">{{ detailData.genderRatio || '-' }}</el-descriptions-item>
              <el-descriptions-item label="软科排名">{{ detailData.rankings?.ruanke ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="校友会排名">{{ detailData.rankings?.xiaoyouhui ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="武书连排名">{{ detailData.rankings?.wushulian ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="QS排名">{{ detailData.rankings?.qs ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="USNEWS排名">{{ detailData.rankings?.usnews ?? '-' }}</el-descriptions-item>
              <el-descriptions-item label="轮播图片" :span="2">
                <template v-if="detailData.carouselImages?.length">
                  <el-image v-for="(img, idx) in detailData.carouselImages" :key="idx" :src="img" style="width:80px;height:60px;margin-right:8px" :preview-src-list="detailData.carouselImages" preview-teleported />
                </template>
                <span v-else>-</span>
              </el-descriptions-item>
              <el-descriptions-item label="院校详细介绍" :span="2">
                <div class="max-h-40 overflow-y-auto">{{ detailData.detailIntroduction || '-' }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
        </el-tabs>
      </template>

      <!-- Add/Edit mode -->
      <template v-if="dialogMode !== 'detail'">
        <el-tabs>
          <el-tab-pane label="基础信息">
            <el-form :model="formData" label-width="120px">
              <el-form-item label="院校名称" required>
                <el-input v-model="formData.name" placeholder="请输入院校名称" maxlength="50" show-word-limit />
              </el-form-item>
              <el-form-item label="英文名称" required>
                <el-input v-model="formData.nameEn" placeholder="请输入英文名称" maxlength="50" show-word-limit />
              </el-form-item>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="省份" required>
                    <el-input v-model="formData.provinceName" placeholder="请输入" maxlength="50" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="城市" required>
                    <el-input v-model="formData.cityName" placeholder="请输入" maxlength="50" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="地区" required>
                    <el-select v-model="formData.region" placeholder="请选择" style="width:100%">
                      <el-option label="华东" value="华东" />
                      <el-option label="华北" value="华北" />
                      <el-option label="华中" value="华中" />
                      <el-option label="华南" value="华南" />
                      <el-option label="西南" value="西南" />
                      <el-option label="西北" value="西北" />
                      <el-option label="东北" value="东北" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="院校类别" required>
                <el-select v-model="formData.category" placeholder="请选择" style="width:240px">
                  <el-option label="综合" value="综合" />
                  <el-option label="理工" value="理工" />
                  <el-option label="师范" value="师范" />
                  <el-option label="农林" value="农林" />
                  <el-option label="医药" value="医药" />
                  <el-option label="财经" value="财经" />
                  <el-option label="政法" value="政法" />
                  <el-option label="体育" value="体育" />
                  <el-option label="艺术" value="艺术" />
                  <el-option label="民族" value="民族" />
                  <el-option label="军事" value="军事" />
                </el-select>
              </el-form-item>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="专业数量">
                    <el-input-number v-model="formData.majorCount" :min="0" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="办学层次">
                    <el-select v-model="formData.educationLevel" placeholder="请选择" style="width:100%">
                      <el-option label="本科" value="本科" />
                      <el-option label="专科" value="专科" />
                      <el-option label="本专兼招" value="本专兼招" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="院校性质">
                    <el-select v-model="formData.nature" placeholder="请选择" style="width:100%">
                      <el-option label="公办" value="公办" />
                      <el-option label="民办" value="民办" />
                      <el-option label="中外合作" value="中外合作" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="推免率">
                    <el-input-number v-model="formData.recommendationRate" :min="0" :max="100" :precision="2" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="推免年份">
                    <el-input-number v-model="formData.recommendationYear" :min="2000" :max="2099" style="width:100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="博士点">
                    <el-switch v-model="formData.hasDoctorate" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="硕士点">
                    <el-switch v-model="formData.hasMaster" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="隶属部门">
                <el-select v-model="formData.department" placeholder="请选择" style="width:240px">
                  <el-option label="教育部" value="教育部" />
                  <el-option label="省教育厅" value="省教育厅" />
                  <el-option label="市教育厅" value="市教育厅" />
                </el-select>
              </el-form-item>
              <el-form-item label="院校标签">
                <el-select v-model="formData.tags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width:100%">
                  <el-option label="985" value="985" />
                  <el-option label="211" value="211" />
                  <el-option label="双一流" value="双一流" />
                </el-select>
              </el-form-item>
              <el-form-item label="知名联盟">
                <el-input v-model="formData.famousUnion" placeholder="如：C9、华东五校" maxlength="50" />
              </el-form-item>
              <el-form-item label="院校图片">
                <el-input v-model="formData.imageUrl" placeholder="图片URL地址" maxlength="500" />
              </el-form-item>
              <el-form-item label="院校简介">
                <el-input v-model="formData.introduction" type="textarea" :rows="4" maxlength="5000" show-word-limit />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="详细信息">
            <el-form :model="detailFormData" label-width="120px">
              <el-form-item label="地址">
                <el-input v-model="detailFormData.address" placeholder="详细校区地址" maxlength="200" />
              </el-form-item>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="招生电话">
                    <el-input v-model="detailFormData.admissionPhone" maxlength="50" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="官方网站">
                    <el-input v-model="detailFormData.website" maxlength="500" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="历史组分数线">
                    <el-input-number v-model="detailFormData.historyGroupScore" :min="0" :max="750" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="物理组分数线">
                    <el-input-number v-model="detailFormData.scienceGroupScore" :min="0" :max="750" style="width:100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="轮播图片">
                <el-input v-model="detailFormData.carouselImagesStr" type="textarea" :rows="2" placeholder="多张图片URL用逗号分隔" />
              </el-form-item>
              <el-form-item label="院校详细介绍">
                <el-input v-model="detailFormData.detailIntroduction" type="textarea" :rows="4" maxlength="5000" show-word-limit />
              </el-form-item>
              <el-divider>排名信息</el-divider>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="软科排名">
                    <el-input-number v-model="detailFormData.rankings.ruanke" :min="0" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="校友会排名">
                    <el-input-number v-model="detailFormData.rankings.xiaoyouhui" :min="0" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="武书连排名">
                    <el-input-number v-model="detailFormData.rankings.wushulian" :min="0" style="width:100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="8">
                  <el-form-item label="QS排名">
                    <el-input-number v-model="detailFormData.rankings.qs" :min="0" style="width:100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="USNEWS排名">
                    <el-input-number v-model="detailFormData.rankings.usnews" :min="0" style="width:100%" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="出国比例">
                    <el-input v-model="detailFormData.abroadRate" placeholder="如：30%" maxlength="10" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="男女比例">
                    <el-input v-model="detailFormData.genderRatio" placeholder="如：6:4" maxlength="10" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">
        {{ dialogMode === 'detail' ? '关闭' : '取消' }}
      </el-button>
      <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</div>
```

Script structure:
```typescript
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getUniversityPage, getUniversityDetail, addUniversity,
  updateUniversity, updateUniversityDetail, updateUniversityStatus,
  deleteUniversity, hardDeleteUniversity,
  batchDeleteUniversity, batchHardDeleteUniversity,
  importUniversity, importUniversityDetail,
} from '@/api/university/info'
import type { UniversityListVO, UniversityDetailVO, UniversityQueryDTO, UniversityAddDTO } from '@/types/university/info'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<UniversityListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<UniversityQueryDTO>({
  page: 1, size: 10, name: '', provinceName: '', category: '', status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<UniversityDetailVO | null>(null)

// Basic info form
const formData = reactive<UniversityAddDTO>({
  name: '', nameEn: '', provinceName: '', cityName: '', region: '华东',
  category: '', majorCount: undefined, educationLevel: '', nature: '',
  recommendationRate: undefined, recommendationYear: undefined,
  hasDoctorate: false, hasMaster: false, department: '',
  tags: [], famousUnion: '', imageUrl: '', introduction: '',
})

// Detail info form
const detailFormData = reactive({
  address: '', admissionPhone: '', website: '',
  historyGroupScore: undefined as number | undefined,
  scienceGroupScore: undefined as number | undefined,
  carouselImagesStr: '',
  detailIntroduction: '',
  rankings: { ruanke: undefined, xiaoyouhui: undefined, wushulian: undefined, qs: undefined, usnews: undefined },
  abroadRate: '', genderRatio: '',
})

// ... all functions (fetchData, handleSearch, handleReset, handlePageChange, handleSizeChange,
//    handleSelectionChange, openDialog, handleSubmit, handleToggleStatus, handleDelete,
//    handleHardDelete, handleBatchDelete, handleBatchHardDelete, handleImport)

onMounted(fetchData)
</script>
```

---

### Task 10: Create the campus gallery page (校园图册)

**Files:**
- Create: `apps/admin/src/views/university/album/index.vue`

- [ ] **Step 1: Create the page**

Following the same pattern as Task 9 but with gallery-specific fields:

Search: universityName(input), imageType(select), status(select)
Actions: 新增图片, 导入Excel, 批量下架, 批量永久删除, 刷新
Table: checkbox, ID, 院校名称, 图片类型, 图片(el-image thumbnail), 状态, 创建时间, 操作
Dialog (add/edit): universityId(select from API), imageType(input), imageUrl(input), sortOrder(input-number)
Dialog (detail): el-descriptions showing all fields

Key differences from info page:
- Image column uses el-image with `:preview-src-list`
- No tab splitting in dialog (simple form)
- University selector loads options from getUniversityPage

---

### Task 11: Create the university guide page (院校适应指南)

**Files:**
- Create: `apps/admin/src/views/university/guide/index.vue`

- [ ] **Step 1: Create the page**

Following the same pattern as Task 9 but with guide-specific fields:

Search: universityName(input), status(select)
Actions: 新增指南, 导入Excel, 批量下架, 批量永久删除, 刷新
Table: checkbox, ID, 院校名称, 自定义标签(el-tag list), 备注, 状态, 创建时间, 操作
Dialog (add/edit): universityId(select from API), customTags(multiple select), remark(textarea)
Dialog (detail): 
  - Base info in el-descriptions
  - 14 JSONB fields in el-collapse panels, each showing key-value pairs

---

### Self-Review Checklist

1. **Spec coverage:** The plan covers all 3 pages (院校列表, 校园图册, 院校适应指南) from the spec. Each implements search, CRUD, batch operations, Excel import, pagination.
2. **Placeholder scan:** No TBD or TODOs. All code blocks are complete.
3. **Type consistency:** Types in Tasks 2-4 match API files in Tasks 6-8, and match the Vue page implementations in Tasks 9-11. Module codes in router (Task 1) match backend annotations.
4. **No tests skipped:** The project has no test infrastructure, so TDD steps are replaced with implementation steps.
