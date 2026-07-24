# 管理端 - 特殊通道模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add the special channel admin module with 4 CRUD pages under the `special` parent route.

**Architecture:** Follow existing admin page pattern (search bar → action buttons → table → pagination → dialog). Each sub-module gets its own API file, type file, and view component. Routes are structured as a parent route with 4 level-2 children.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Pinia, Axios

---

## File Structure

```
apps/admin/src/
├── api/special/
│   ├── channel.ts               # Special channel API
│   ├── channel-univ.ts          # Channel-university API
│   ├── strong-base-score.ts     # Strong base score API
│   └── strong-base-univ.ts      # Strong base univ config API
├── types/special/
│   ├── channel.ts               # Channel types
│   ├── channel-univ.ts          # Channel-univ types
│   ├── strong-base-score.ts     # Score types
│   └── strong-base-univ.ts      # Univ config types
├── views/special/
│   ├── admission/index.vue      # 特殊招生通道 page
│   ├── adm-univ/index.vue       # 通道-大学关联 page
│   ├── sbs-score/index.vue      # 强基计划数据 page
│   └── sbs-config/index.vue     # 强基院校配置 page
└── router/modules/
    └── special.ts               # Route definitions
```

Modified:
- `apps/admin/src/router/index.ts` — add import + register route

---

### Task 1: Create route module + register

**Files:**
- Create: `apps/admin/src/router/modules/special.ts`
- Modify: `apps/admin/src/router/index.ts`

- [ ] **Step 1: Create special route module**

Write to `apps/admin/src/router/modules/special.ts`:

```typescript
import type { RouteRecordRaw } from 'vue-router'

const specialRoutes: RouteRecordRaw = {
  path: '/special',
  name: 'Special',
  meta: { title: '特殊通道', icon: 'School' },
  redirect: '/special/admission',
  children: [
    {
      path: 'admission',
      name: 'SpecialAdmission',
      component: () => import('@/views/special/admission/index.vue'),
      meta: { title: '招生通道管理', moduleCode: 'special_admission' },
    },
    {
      path: 'adm-univ',
      name: 'SpecialAdmUniv',
      component: () => import('@/views/special/adm-univ/index.vue'),
      meta: { title: '通道院校关联管理', moduleCode: 'special_adm_univ' },
    },
    {
      path: 'sbs-score',
      name: 'SpecialSbsScore',
      component: () => import('@/views/special/sbs-score/index.vue'),
      meta: { title: '强基计划分数管理', moduleCode: 'special_sbs_score' },
    },
    {
      path: 'sbs-config',
      name: 'SpecialSbsConfig',
      component: () => import('@/views/special/sbs-config/index.vue'),
      meta: { title: '强基院校配置', moduleCode: 'special_sbs_config' },
    },
  ],
}

export default specialRoutes
```

- [ ] **Step 2: Register route in index.ts**

Edit `apps/admin/src/router/index.ts`:

Insert after line 14 (`import algorithmRoutes from './modules/algorithm'`):
```typescript
import specialRoutes from './modules/special'
```

Insert after line 62 (`algorithmRoutes,`):
```typescript
      specialRoutes,
```

---

### Task 2: Create types (4 files)

**Files:**
- Create: `apps/admin/src/types/special/channel.ts`
- Create: `apps/admin/src/types/special/channel-univ.ts`
- Create: `apps/admin/src/types/special/strong-base-score.ts`
- Create: `apps/admin/src/types/special/strong-base-univ.ts`

- [ ] **Step 1: Create channel types**

Write to `apps/admin/src/types/special/channel.ts`:

```typescript
export interface ChannelListVO {
  id: string
  channelCode: string
  channelName: string
  displayType: string
  isActive: boolean
}

export interface ChannelDetailVO {
  id: string
  channelCode: string
  channelName: string
  subtitle: string | null
  parentCode: string | null
  filterLabel: string | null
  displayType: string
  content: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChannelQueryDTO {
  page: number
  size: number
  displayType?: string
  channelName?: string
}

export interface ChannelAddDTO {
  channelCode: string
  channelName: string
  subtitle?: string
  parentCode?: string
  filterLabel?: string
  displayType: string
  content?: string
  sortOrder?: number
}

export interface ChannelUpdateDTO {
  channelCode: string
  channelName: string
  subtitle?: string
  parentCode?: string
  filterLabel?: string
  displayType: string
  content?: string
  sortOrder?: number
}
```

- [ ] **Step 2: Create channel-univ types**

Write to `apps/admin/src/types/special/channel-univ.ts`:

```typescript
export interface ChannelUnivListVO {
  id: string
  channelName: string
  universityName: string
  year: number | null
  regionTag: string | null
  isActive: boolean
}

export interface ChannelUnivDetailVO {
  id: string
  channelCode: string
  channelName: string
  universityId: string
  universityName: string
  year: number | null
  regionTag: string | null
  signupStart: string | null
  signupEnd: string | null
  officialUrl: string | null
  brochureTitle: string | null
  brochureContent: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChannelUnivQueryDTO {
  page: number
  size: number
}

export interface ChannelUnivAddDTO {
  channelCode: string
  channelName: string
  universityId: number
  universityName: string
  year?: number
  regionTag?: string
  signupStart?: string
  signupEnd?: string
  officialUrl?: string
  brochureTitle?: string
  brochureContent?: string
  sortOrder?: number
}

export interface ChannelUnivUpdateDTO {
  channelCode: string
  channelName: string
  universityId: number
  universityName: string
  year?: number
  regionTag?: string
  signupStart?: string
  signupEnd?: string
  officialUrl?: string
  brochureTitle?: string
  brochureContent?: string
  sortOrder?: number
}
```

- [ ] **Step 3: Create strong-base-score types**

Write to `apps/admin/src/types/special/strong-base-score.ts`:

```typescript
export interface StrongBaseScoreListVO {
  id: string
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  isActive: boolean
}

export interface StrongBaseScoreDetailVO {
  id: string
  universityId: string
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode: string | null
  entryScore: number | null
  entryScoreType: string | null
  entryFormula: string | null
  entryRatio: string | null
  admissionScore: number | null
  admissionFormula: string | null
  planCount: number | null
  admissionCount: number | null
  remark: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StrongBaseScoreQueryDTO {
  page: number
  size: number
  universityName?: string
  year?: number
  province?: string
  subjectType?: string
}

export interface StrongBaseScoreAddDTO {
  universityId: number
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode?: string
  entryScore?: number
  entryScoreType?: string
  entryFormula?: string
  entryRatio?: string
  admissionScore?: number
  admissionFormula?: string
  planCount?: number
  admissionCount?: number
  remark?: string
}

export interface StrongBaseScoreUpdateDTO {
  universityId: number
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode?: string
  entryScore?: number
  entryScoreType?: string
  entryFormula?: string
  entryRatio?: string
  admissionScore?: number
  admissionFormula?: string
  planCount?: number
  admissionCount?: number
  remark?: string
}
```

- [ ] **Step 4: Create strong-base-univ types**

Write to `apps/admin/src/types/special/strong-base-univ.ts`:

```typescript
export interface StrongBaseUnivListVO {
  id: string
  universityName: string
  isPilot: boolean
  pilotYear: number | null
  testBeforeScore: boolean
}

export interface StrongBaseUnivDetailVO {
  id: string
  universityId: string
  universityName: string
  isPilot: boolean
  pilotYear: number | null
  officialUrl: string | null
  signupUrl: string | null
  testBeforeScore: boolean
  defaultEntryRatio: string | null
  defaultAdmissionFormula: string | null
  availableMajors: string[] | null
  specialNotes: string | null
  createdAt: string
  updatedAt: string
}

export interface StrongBaseUnivQueryDTO {
  page: number
  size: number
  universityName?: string
  isPilot?: boolean
  pilotYear?: number
  testBeforeScore?: boolean
}

export interface StrongBaseUnivAddDTO {
  universityId: number
  universityName: string
  isPilot?: boolean
  pilotYear?: number
  officialUrl?: string
  signupUrl?: string
  testBeforeScore?: boolean
  defaultEntryRatio?: string
  defaultAdmissionFormula?: string
  availableMajors?: string[]
  specialNotes?: string
}

export interface StrongBaseUnivUpdateDTO {
  universityId: number
  universityName: string
  isPilot?: boolean
  pilotYear?: number
  officialUrl?: string
  signupUrl?: string
  testBeforeScore?: boolean
  defaultEntryRatio?: string
  defaultAdmissionFormula?: string
  availableMajors?: string[]
  specialNotes?: string
}
```

---

### Task 3: Create API files (4 files)

**Files:**
- Create: `apps/admin/src/api/special/channel.ts`
- Create: `apps/admin/src/api/special/channel-univ.ts`
- Create: `apps/admin/src/api/special/strong-base-score.ts`
- Create: `apps/admin/src/api/special/strong-base-univ.ts`

- [ ] **Step 1: Create channel API**

Write to `apps/admin/src/api/special/channel.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ChannelListVO,
  ChannelDetailVO,
  ChannelQueryDTO,
  ChannelAddDTO,
  ChannelUpdateDTO,
} from '@/types/special/channel'

const PREFIX = '/api/v1/admin/special/channel'

export const getChannelPage = (params: ChannelQueryDTO) => {
  return request.get<R<PageResult<ChannelListVO>>>(`${PREFIX}/page`, { params })
}

export const getChannelDetail = (id: string) => {
  return request.get<R<ChannelDetailVO>>(`${PREFIX}/${id}`)
}

export const addChannel = (data: ChannelAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateChannel = (id: string, data: ChannelUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const toggleChannelStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle`)
}

export const deleteChannel = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteChannel = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
```

- [ ] **Step 2: Create channel-univ API**

Write to `apps/admin/src/api/special/channel-univ.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ChannelUnivListVO,
  ChannelUnivDetailVO,
  ChannelUnivQueryDTO,
  ChannelUnivAddDTO,
  ChannelUnivUpdateDTO,
} from '@/types/special/channel-univ'

const PREFIX = '/api/v1/admin/special/channel-univ'

export const getChannelUnivPage = (params: ChannelUnivQueryDTO) => {
  return request.get<R<PageResult<ChannelUnivListVO>>>(`${PREFIX}/page`, { params })
}

export const getChannelUnivDetail = (id: string) => {
  return request.get<R<ChannelUnivDetailVO>>(`${PREFIX}/${id}`)
}

export const addChannelUniv = (data: ChannelUnivAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateChannelUniv = (id: string, data: ChannelUnivUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const toggleChannelUnivStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle`)
}

export const deleteChannelUniv = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteChannelUniv = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
```

- [ ] **Step 3: Create strong-base-score API**

Write to `apps/admin/src/api/special/strong-base-score.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  StrongBaseScoreListVO,
  StrongBaseScoreDetailVO,
  StrongBaseScoreQueryDTO,
  StrongBaseScoreAddDTO,
  StrongBaseScoreUpdateDTO,
} from '@/types/special/strong-base-score'

const PREFIX = '/api/v1/admin/special/strong-base-score'

export const getScorePage = (params: StrongBaseScoreQueryDTO) => {
  return request.get<R<PageResult<StrongBaseScoreListVO>>>(`${PREFIX}/page`, { params })
}

export const getScoreDetail = (id: string) => {
  return request.get<R<StrongBaseScoreDetailVO>>(`${PREFIX}/${id}`)
}

export const addScore = (data: StrongBaseScoreAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateScore = (id: string, data: StrongBaseScoreUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const toggleScoreStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle`)
}

export const deleteScore = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteScore = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
```

- [ ] **Step 4: Create strong-base-univ API**

Write to `apps/admin/src/api/special/strong-base-univ.ts`:

```typescript
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  StrongBaseUnivListVO,
  StrongBaseUnivDetailVO,
  StrongBaseUnivQueryDTO,
  StrongBaseUnivAddDTO,
  StrongBaseUnivUpdateDTO,
} from '@/types/special/strong-base-univ'

const PREFIX = '/api/v1/admin/special/strong-base-univ'

export const getStrongBaseUnivPage = (params: StrongBaseUnivQueryDTO) => {
  return request.get<R<PageResult<StrongBaseUnivListVO>>>(`${PREFIX}/page`, { params })
}

export const getStrongBaseUnivDetail = (id: string) => {
  return request.get<R<StrongBaseUnivDetailVO>>(`${PREFIX}/${id}`)
}

export const addStrongBaseUniv = (data: StrongBaseUnivAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateStrongBaseUniv = (id: string, data: StrongBaseUnivUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const deleteStrongBaseUniv = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteStrongBaseUniv = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
```

---

### Task 4: Create 特殊招生通道 page (special_admission)

**Files:**
- Create: `apps/admin/src/views/special/admission/index.vue`

- [ ] **Step 1: Write the full page component**

Write to `apps/admin/src/views/special/admission/index.vue`:

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getChannelPage,
  getChannelDetail,
  addChannel,
  updateChannel,
  toggleChannelStatus,
  deleteChannel,
  batchDeleteChannel,
} from '@/api/special/channel'
import type {
  ChannelListVO,
  ChannelDetailVO,
  ChannelQueryDTO,
  ChannelAddDTO,
  ChannelUpdateDTO,
} from '@/types/special/channel'

const loading = ref(false)
const tableData = ref<ChannelListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<ChannelQueryDTO>({
  page: 1,
  size: 10,
  displayType: undefined,
  channelName: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ChannelDetailVO | null>(null)

const formData = reactive<ChannelAddDTO>({
  channelCode: '',
  channelName: '',
  subtitle: '',
  parentCode: '',
  filterLabel: '',
  displayType: 'UNIVERSITY_LIST',
  content: '',
  sortOrder: 0,
})

const displayTypeOptions = [
  { label: '院校列表', value: 'UNIVERSITY_LIST' },
  { label: '仅文章', value: 'ARTICLE_ONLY' },
  { label: '专业数据', value: 'MAJOR_DATA' },
  { label: '分组节点', value: 'GROUP' },
]

const displayTypeLabel = (type: string) => {
  const opt = displayTypeOptions.find((o) => o.value === type)
  return opt ? opt.label : type
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.displayType) params.displayType = queryParams.displayType
    if (queryParams.channelName) params.channelName = queryParams.channelName
    const res = await getChannelPage(params as ChannelQueryDTO)
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
  queryParams.displayType = undefined
  queryParams.channelName = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: ChannelListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增通道'
    formData.channelCode = ''
    formData.channelName = ''
    formData.subtitle = ''
    formData.parentCode = ''
    formData.filterLabel = ''
    formData.displayType = 'UNIVERSITY_LIST'
    formData.content = ''
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改通道'
    formLoading.value = true
    try {
      const res = await getChannelDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.channelCode = d.channelCode
        formData.channelName = d.channelName
        formData.subtitle = d.subtitle || ''
        formData.parentCode = d.parentCode || ''
        formData.filterLabel = d.filterLabel || ''
        formData.displayType = d.displayType
        formData.content = d.content || ''
        formData.sortOrder = d.sortOrder
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '通道详情'
    formLoading.value = true
    try {
      const res = await getChannelDetail(id)
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
  if (!formData.channelCode || !formData.channelName) {
    ElMessage.warning('请填写通道代码和名称')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addChannel({
        ...formData,
        channelCode: formData.channelCode,
        channelName: formData.channelName,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateChannel(currentId.value, {
        ...formData,
        channelCode: formData.channelCode,
        channelName: formData.channelName,
      })
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

const handleToggleStatus = async (row: ChannelListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该通道吗？`, '提示')
    const res = await toggleChannelStatus(row.id)
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该通道吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteChannel(id)
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
    ElMessage.warning('请先选择要删除的通道')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条通道吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteChannel(selectedIds.value)
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

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="展示类型">
          <el-select
            v-model="queryParams.displayType"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in displayTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通道名称">
          <el-input
            v-model="queryParams.channelName"
            placeholder="通道名称模糊搜索"
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
      <el-button type="primary" @click="openDialog('add')">新增通道</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
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
        <el-table-column prop="channelCode" label="通道代码" width="160" />
        <el-table-column prop="channelName" label="通道名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="displayType" label="展示类型" width="120">
          <template #default="{ row }">
            {{ displayTypeLabel(row.displayType) }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.isActive ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
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

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="通道代码">{{ detailData.channelCode }}</el-descriptions-item>
            <el-descriptions-item label="通道名称">{{ detailData.channelName }}</el-descriptions-item>
            <el-descriptions-item label="副标题">{{ detailData.subtitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="父级通道">{{ detailData.parentCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="筛选标签">{{ detailData.filterLabel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="展示类型">{{ displayTypeLabel(detailData.displayType) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.isActive ? 'success' : 'info'" size="small">
                {{ detailData.isActive ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="内容">
              <div class="max-h-60 overflow-y-auto" v-html="detailData.content || '-'"></div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="通道代码" required>
              <el-input v-model="formData.channelCode" placeholder="请输入通道代码" maxlength="30" show-word-limit />
            </el-form-item>
            <el-form-item label="通道名称" required>
              <el-input v-model="formData.channelName" placeholder="请输入通道名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model="formData.subtitle" placeholder="请输入副标题" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="父级通道">
              <el-input v-model="formData.parentCode" placeholder="父级通道代码" maxlength="30" />
            </el-form-item>
            <el-form-item label="筛选标签">
              <el-input v-model="formData.filterLabel" placeholder="筛选按钮文字" maxlength="30" />
            </el-form-item>
            <el-form-item label="展示类型" required>
              <el-select v-model="formData.displayType" placeholder="请选择" style="width: 200px">
                <el-option
                  v-for="opt in displayTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="富文本内容">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="6"
                placeholder="支持 HTML"
              />
            </el-form-item>
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 120px" />
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

### Task 5: Create 通道-大学关联 page (special_adm_univ)

- [ ] **Step 1: Write the full page component**

Write to `apps/admin/src/views/special/adm-univ/index.vue`:

```vue
<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getChannelUnivPage,
  getChannelUnivDetail,
  addChannelUniv,
  updateChannelUniv,
  toggleChannelUnivStatus,
  deleteChannelUniv,
  batchDeleteChannelUniv,
} from '@/api/special/channel-univ'
import type {
  ChannelUnivListVO,
  ChannelUnivDetailVO,
  ChannelUnivAddDTO,
  ChannelUnivUpdateDTO,
} from '@/types/special/channel-univ'

const loading = ref(false)
const allData = ref<ChannelUnivListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
})

// 前端过滤条件
const filterChannelName = ref('')
const filterUniversityName = ref('')
const filterYear = ref<number | undefined>(undefined)

// 前端过滤后的数据
const filteredData = computed(() => {
  return allData.value.filter((item) => {
    if (filterChannelName.value && !item.channelName.includes(filterChannelName.value)) return false
    if (filterUniversityName.value && !item.universityName.includes(filterUniversityName.value)) return false
    if (filterYear.value !== undefined && item.year !== filterYear.value) return false
    return true
  })
})

// 分页数据
const tableData = computed(() => {
  const start = (queryParams.page - 1) * queryParams.size
  return filteredData.value.slice(start, start + queryParams.size)
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ChannelUnivDetailVO | null>(null)

const formData = reactive<ChannelUnivAddDTO>({
  channelCode: '',
  channelName: '',
  universityId: 0,
  universityName: '',
  year: undefined,
  regionTag: '',
  signupStart: '',
  signupEnd: '',
  officialUrl: '',
  brochureTitle: '',
  brochureContent: '',
  sortOrder: 0,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getChannelUnivPage({ page: 1, size: 1000 })
    if (res.data.code === 200) {
      allData.value = res.data.data.records
      total.value = filteredData.value.length
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
  total.value = filteredData.value.length
}

const handleReset = () => {
  filterChannelName.value = ''
  filterUniversityName.value = ''
  filterYear.value = undefined
  queryParams.page = 1
  total.value = allData.value.length
}

const handlePageChange = (page: number) => { queryParams.page = page }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
}

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map((r: any) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增关联'
    formData.channelCode = ''
    formData.channelName = ''
    formData.universityId = 0
    formData.universityName = ''
    formData.year = undefined
    formData.regionTag = ''
    formData.signupStart = ''
    formData.signupEnd = ''
    formData.officialUrl = ''
    formData.brochureTitle = ''
    formData.brochureContent = ''
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改关联'
    formLoading.value = true
    try {
      const res = await getChannelUnivDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.channelCode = d.channelCode
        formData.channelName = d.channelName
        formData.universityId = Number(d.universityId)
        formData.universityName = d.universityName
        formData.year = d.year || undefined
        formData.regionTag = d.regionTag || ''
        formData.signupStart = d.signupStart || ''
        formData.signupEnd = d.signupEnd || ''
        formData.officialUrl = d.officialUrl || ''
        formData.brochureTitle = d.brochureTitle || ''
        formData.brochureContent = d.brochureContent || ''
        formData.sortOrder = d.sortOrder
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '关联详情'
    formLoading.value = true
    try {
      const res = await getChannelUnivDetail(id)
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
  if (!formData.channelCode || !formData.channelName || !formData.universityId || !formData.universityName) {
    ElMessage.warning('请填写通道代码、名称和大学信息')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addChannelUniv(formData as ChannelUnivAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateChannelUniv(currentId.value, formData as ChannelUnivUpdateDTO)
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

const handleToggleStatus = async (row: ChannelUnivListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该关联吗？`, '提示')
    const res = await toggleChannelUnivStatus(row.id)
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该关联吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteChannelUniv(id)
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
      `确定要批量删除选中的 ${selectedIds.value.length} 条关联吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteChannelUniv(selectedIds.value)
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

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form inline>
        <el-form-item label="通道名称">
          <el-input
            v-model="filterChannelName"
            placeholder="输入通道名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="大学名称">
          <el-input
            v-model="filterUniversityName"
            placeholder="输入大学名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number
            v-model="filterYear"
            placeholder="年份"
            :min="2000"
            :max="2099"
            controls-position="right"
            style="width: 130px"
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
      <el-button type="primary" @click="openDialog('add')">新增关联</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
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
        <el-table-column prop="channelName" label="通道名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="universityName" label="大学名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="year" label="年份" width="100" align="center" />
        <el-table-column prop="regionTag" label="地区标签" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.regionTag" size="small">{{ row.regionTag }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.isActive ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
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
            <el-descriptions-item label="通道代码">{{ detailData.channelCode }}</el-descriptions-item>
            <el-descriptions-item label="通道名称">{{ detailData.channelName }}</el-descriptions-item>
            <el-descriptions-item label="大学ID">{{ detailData.universityId }}</el-descriptions-item>
            <el-descriptions-item label="大学名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="年份">{{ detailData.year || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地区标签">{{ detailData.regionTag || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名开始">{{ detailData.signupStart || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名结束">{{ detailData.signupEnd || '-' }}</el-descriptions-item>
            <el-descriptions-item label="官网URL">{{ detailData.officialUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简章标题">{{ detailData.brochureTitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简章正文">
              <div class="max-h-40 overflow-y-auto" v-html="detailData.brochureContent || '-'"></div>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.isActive ? 'success' : 'info'" size="small">
                {{ detailData.isActive ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="通道代码" required>
              <el-input v-model="formData.channelCode" placeholder="请输入通道代码" maxlength="30" show-word-limit />
            </el-form-item>
            <el-form-item label="通道名称" required>
              <el-input v-model="formData.channelName" placeholder="请输入通道名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="大学ID" required>
              <el-input-number v-model="formData.universityId" :min="1" style="width: 200px" />
            </el-form-item>
            <el-form-item label="大学名称" required>
              <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="招生年份">
              <el-input-number v-model="formData.year" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
            </el-form-item>
            <el-form-item label="地区标签">
              <el-select v-model="formData.regionTag" placeholder="请选择" clearable style="width: 200px">
                <el-option label="香港" value="香港" />
                <el-option label="澳门" value="澳门" />
              </el-select>
            </el-form-item>
            <el-form-item label="报名开始">
              <el-date-picker
                v-model="formData.signupStart"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="报名截止">
              <el-date-picker
                v-model="formData.signupEnd"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="官网URL">
              <el-input v-model="formData.officialUrl" placeholder="https://" maxlength="500" />
            </el-form-item>
            <el-form-item label="简章标题">
              <el-input v-model="formData.brochureTitle" placeholder="请输入招生简章标题" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="简章正文">
              <el-input
                v-model="formData.brochureContent"
                type="textarea"
                :rows="4"
                placeholder="支持 HTML"
              />
            </el-form-item>
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 120px" />
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

### Task 6: Create 强基计划数据 page (special_sbs_score)

**Files:**
- Create: `apps/admin/src/views/special/sbs-score/index.vue`

- [ ] **Step 1: Write the full page component**

Write to `apps/admin/src/views/special/sbs-score/index.vue`:

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getScorePage,
  getScoreDetail,
  addScore,
  updateScore,
  toggleScoreStatus,
  deleteScore,
  batchDeleteScore,
} from '@/api/special/strong-base-score'
import type {
  StrongBaseScoreListVO,
  StrongBaseScoreDetailVO,
  StrongBaseScoreQueryDTO,
  StrongBaseScoreAddDTO,
  StrongBaseScoreUpdateDTO,
} from '@/types/special/strong-base-score'

const loading = ref(false)
const tableData = ref<StrongBaseScoreListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<StrongBaseScoreQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  year: undefined,
  province: '',
  subjectType: undefined,
})

const subjectTypeOptions = [
  { label: '全部', value: '' },
  { label: '物理类', value: '物理类' },
  { label: '历史类', value: '历史类' },
  { label: '理科', value: '理科' },
  { label: '文科', value: '文科' },
  { label: '综合改革', value: '综合改革' },
]

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<StrongBaseScoreDetailVO | null>(null)

const formData = reactive<StrongBaseScoreAddDTO>({
  universityId: 0,
  universityName: '',
  year: undefined,
  province: '',
  subjectType: '',
  majorName: '',
  majorCode: '',
  entryScore: undefined,
  entryScoreType: '高考成绩',
  entryFormula: '',
  entryRatio: '',
  admissionScore: undefined,
  admissionFormula: '',
  planCount: undefined,
  admissionCount: undefined,
  remark: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.year) params.year = queryParams.year
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.subjectType) params.subjectType = queryParams.subjectType
    const res = await getScorePage(params as StrongBaseScoreQueryDTO)
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
  queryParams.universityName = ''
  queryParams.year = undefined
  queryParams.province = ''
  queryParams.subjectType = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: StrongBaseScoreListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增数据'
    formData.universityId = 0
    formData.universityName = ''
    formData.year = undefined
    formData.province = ''
    formData.subjectType = ''
    formData.majorName = ''
    formData.majorCode = ''
    formData.entryScore = undefined
    formData.entryScoreType = '高考成绩'
    formData.entryFormula = ''
    formData.entryRatio = ''
    formData.admissionScore = undefined
    formData.admissionFormula = ''
    formData.planCount = undefined
    formData.admissionCount = undefined
    formData.remark = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改数据'
    formLoading.value = true
    try {
      const res = await getScoreDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.universityId = Number(d.universityId)
        formData.universityName = d.universityName
        formData.year = d.year
        formData.province = d.province
        formData.subjectType = d.subjectType
        formData.majorName = d.majorName
        formData.majorCode = d.majorCode || ''
        formData.entryScore = d.entryScore ?? undefined
        formData.entryScoreType = d.entryScoreType || '高考成绩'
        formData.entryFormula = d.entryFormula || ''
        formData.entryRatio = d.entryRatio || ''
        formData.admissionScore = d.admissionScore ?? undefined
        formData.admissionFormula = d.admissionFormula || ''
        formData.planCount = d.planCount ?? undefined
        formData.admissionCount = d.admissionCount ?? undefined
        formData.remark = d.remark || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '数据详情'
    formLoading.value = true
    try {
      const res = await getScoreDetail(id)
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
  if (!formData.universityId || !formData.universityName || !formData.year || !formData.province || !formData.subjectType || !formData.majorName) {
    ElMessage.warning('请填写必填字段')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addScore(formData as StrongBaseScoreAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateScore(currentId.value, formData as StrongBaseScoreUpdateDTO)
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

const handleToggleStatus = async (row: StrongBaseScoreListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该数据吗？`, '提示')
    const res = await toggleScoreStatus(row.id)
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该数据吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteScore(id)
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
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条数据吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteScore(selectedIds.value)
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

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="大学名称">
          <el-input
            v-model="queryParams.universityName"
            placeholder="大学名称模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number
            v-model="queryParams.year"
            placeholder="年份"
            :min="2000"
            :max="2099"
            controls-position="right"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item label="省份">
          <el-input
            v-model="queryParams.province"
            placeholder="输入省份"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="科类">
          <el-select
            v-model="queryParams.subjectType"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in subjectTypeOptions.filter((o) => o.value !== '')"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
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
      <el-button type="primary" @click="openDialog('add')">新增数据</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
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
        <el-table-column prop="universityName" label="大学名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="year" label="年份" width="80" align="center" />
        <el-table-column prop="province" label="省份" width="100" align="center" />
        <el-table-column prop="subjectType" label="科类" width="100" align="center" />
        <el-table-column prop="majorName" label="专业名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.isActive ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
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
          <el-descriptions :column="2" border>
            <el-descriptions-item label="大学ID" :span="1">{{ detailData.universityId }}</el-descriptions-item>
            <el-descriptions-item label="大学名称" :span="1">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="年份" :span="1">{{ detailData.year }}</el-descriptions-item>
            <el-descriptions-item label="省份" :span="1">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="科类" :span="1">{{ detailData.subjectType }}</el-descriptions-item>
            <el-descriptions-item label="专业名称" :span="1">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="专业代码">{{ detailData.majorCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围分数类型">{{ detailData.entryScoreType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围分数线" :span="1">{{ detailData.entryScore ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围公式" :span="1">{{ detailData.entryFormula || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围比例">{{ detailData.entryRatio || '-' }}</el-descriptions-item>
            <el-descriptions-item label="录取综合分">{{ detailData.admissionScore ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="录取公式" :span="2">{{ detailData.admissionFormula || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计划数">{{ detailData.planCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="录取数">{{ detailData.admissionCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.isActive ? 'success' : 'info'" size="small">
                {{ detailData.isActive ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="大学ID" required>
              <el-input-number v-model="formData.universityId" :min="1" style="width: 200px" />
            </el-form-item>
            <el-form-item label="大学名称" required>
              <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="年份" required>
              <el-input-number v-model="formData.year" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
            </el-form-item>
            <el-form-item label="省份" required>
              <el-input v-model="formData.province" placeholder="请输入省份" maxlength="20" />
            </el-form-item>
            <el-form-item label="科类" required>
              <el-select v-model="formData.subjectType" placeholder="请选择" style="width: 200px">
                <el-option
                  v-for="opt in subjectTypeOptions.filter((o) => o.value !== '')"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="专业名称" required>
              <el-input v-model="formData.majorName" placeholder="请输入专业名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="专业代码">
              <el-input v-model="formData.majorCode" placeholder="请输入专业代码" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="入围分数线">
              <el-input-number v-model="formData.entryScore" :precision="2" :min="0" :max="750" style="width: 160px" />
            </el-form-item>
            <el-form-item label="入围类型">
              <el-input v-model="formData.entryScoreType" placeholder="默认：高考成绩" maxlength="30" style="width: 200px" />
            </el-form-item>
            <el-form-item label="入围公式">
              <el-input v-model="formData.entryFormula" placeholder="入围计算公式" maxlength="500" />
            </el-form-item>
            <el-form-item label="入围比例">
              <el-input v-model="formData.entryRatio" placeholder="如 1:5" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="录取综合分">
              <el-input-number v-model="formData.admissionScore" :precision="2" :min="0" :max="100" style="width: 160px" />
            </el-form-item>
            <el-form-item label="录取公式">
              <el-input v-model="formData.admissionFormula" placeholder="录取综合分公式" maxlength="500" />
            </el-form-item>
            <el-form-item label="计划数">
              <el-input-number v-model="formData.planCount" :min="0" style="width: 160px" />
            </el-form-item>
            <el-form-item label="录取数">
              <el-input-number v-model="formData.admissionCount" :min="0" style="width: 160px" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="备注信息"
                maxlength="500"
                show-word-limit
              />
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

### Task 7: Create 强基院校配置 page (special_sbs_config)

**Files:**
- Create: `apps/admin/src/views/special/sbs-config/index.vue`

- [ ] **Step 1: Write the full page component**

Write to `apps/admin/src/views/special/sbs-config/index.vue`:

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getStrongBaseUnivPage,
  getStrongBaseUnivDetail,
  addStrongBaseUniv,
  updateStrongBaseUniv,
  deleteStrongBaseUniv,
  batchDeleteStrongBaseUniv,
} from '@/api/special/strong-base-univ'
import type {
  StrongBaseUnivListVO,
  StrongBaseUnivDetailVO,
  StrongBaseUnivQueryDTO,
  StrongBaseUnivAddDTO,
  StrongBaseUnivUpdateDTO,
} from '@/types/special/strong-base-univ'

const loading = ref(false)
const tableData = ref<StrongBaseUnivListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<StrongBaseUnivQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  isPilot: undefined,
  pilotYear: undefined,
  testBeforeScore: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<StrongBaseUnivDetailVO | null>(null)

const formData = reactive<StrongBaseUnivAddDTO>({
  universityId: 0,
  universityName: '',
  isPilot: true,
  pilotYear: undefined,
  officialUrl: '',
  signupUrl: '',
  testBeforeScore: false,
  defaultEntryRatio: '1:5',
  defaultAdmissionFormula: '',
  availableMajors: [],
  specialNotes: '',
})

// 用于输入专业列表的临时字符串
const availableMajorsStr = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.isPilot !== undefined && queryParams.isPilot !== null) params.isPilot = queryParams.isPilot
    if (queryParams.pilotYear) params.pilotYear = queryParams.pilotYear
    if (queryParams.testBeforeScore !== undefined && queryParams.testBeforeScore !== null) params.testBeforeScore = queryParams.testBeforeScore
    const res = await getStrongBaseUnivPage(params as StrongBaseUnivQueryDTO)
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
  queryParams.universityName = ''
  queryParams.isPilot = undefined
  queryParams.pilotYear = undefined
  queryParams.testBeforeScore = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: StrongBaseUnivListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增配置'
    formData.universityId = 0
    formData.universityName = ''
    formData.isPilot = true
    formData.pilotYear = undefined
    formData.officialUrl = ''
    formData.signupUrl = ''
    formData.testBeforeScore = false
    formData.defaultEntryRatio = '1:5'
    formData.defaultAdmissionFormula = ''
    formData.availableMajors = []
    formData.specialNotes = ''
    availableMajorsStr.value = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改配置'
    formLoading.value = true
    try {
      const res = await getStrongBaseUnivDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.universityId = Number(d.universityId)
        formData.universityName = d.universityName
        formData.isPilot = d.isPilot
        formData.pilotYear = d.pilotYear || undefined
        formData.officialUrl = d.officialUrl || ''
        formData.signupUrl = d.signupUrl || ''
        formData.testBeforeScore = d.testBeforeScore
        formData.defaultEntryRatio = d.defaultEntryRatio || '1:5'
        formData.defaultAdmissionFormula = d.defaultAdmissionFormula || ''
        formData.availableMajors = d.availableMajors || []
        formData.specialNotes = d.specialNotes || ''
        availableMajorsStr.value = (d.availableMajors || []).join(', ')
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '配置详情'
    formLoading.value = true
    try {
      const res = await getStrongBaseUnivDetail(id)
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
  if (!formData.universityId || !formData.universityName) {
    ElMessage.warning('请填写大学ID和名称')
    return
  }

  // 处理专业列表
  const submitData = {
    ...formData,
    availableMajors: availableMajorsStr.value
      ? availableMajorsStr.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
      : [],
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addStrongBaseUniv(submitData as StrongBaseUnivAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateStrongBaseUniv(currentId.value, submitData as StrongBaseUnivUpdateDTO)
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该配置吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteStrongBaseUniv(id)
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
    ElMessage.warning('请先选择要删除的配置')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条配置吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteStrongBaseUniv(selectedIds.value)
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

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="大学名称">
          <el-input
            v-model="queryParams.universityName"
            placeholder="大学名称模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="试点校">
          <el-select
            v-model="queryParams.isPilot"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="试点年份">
          <el-input-number
            v-model="queryParams.pilotYear"
            placeholder="年份"
            :min="2000"
            :max="2099"
            controls-position="right"
            style="width: 130px"
          />
        </el-form-item>
        <el-form-item label="出分前校测">
          <el-select
            v-model="queryParams.testBeforeScore"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
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
      <el-button type="primary" @click="openDialog('add')">新增配置</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
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
        <el-table-column prop="universityName" label="大学名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isPilot" label="试点校" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isPilot ? 'success' : 'info'" size="small">
              {{ row.isPilot ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pilotYear" label="试点年份" width="120" align="center">
          <template #default="{ row }">
            {{ row.pilotYear || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="testBeforeScore" label="出分前校测" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.testBeforeScore ? 'warning' : 'info'" size="small">
              {{ row.testBeforeScore ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
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
          <el-descriptions :column="2" border>
            <el-descriptions-item label="大学ID" :span="1">{{ detailData.universityId }}</el-descriptions-item>
            <el-descriptions-item label="大学名称" :span="1">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="试点校" :span="1">
              <el-tag :type="detailData.isPilot ? 'success' : 'info'" size="small">
                {{ detailData.isPilot ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="首次试点年份" :span="1">{{ detailData.pilotYear || '-' }}</el-descriptions-item>
            <el-descriptions-item label="出分前校测" :span="1">
              <el-tag :type="detailData.testBeforeScore ? 'warning' : 'info'" size="small">
                {{ detailData.testBeforeScore ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="官方页面URL" :span="1">{{ detailData.officialUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名入口URL" :span="2">{{ detailData.signupUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="默认入围比例">{{ detailData.defaultEntryRatio || '-' }}</el-descriptions-item>
            <el-descriptions-item label="默认录取公式">{{ detailData.defaultAdmissionFormula || '-' }}</el-descriptions-item>
            <el-descriptions-item label="可选专业" :span="2">
              <template v-if="detailData.availableMajors && detailData.availableMajors.length > 0">
                <el-tag
                  v-for="(m, i) in detailData.availableMajors"
                  :key="i"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ m }}
                </el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="特殊说明" :span="2">{{ detailData.specialNotes || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="130px">
            <el-form-item label="大学ID" required>
              <el-input-number v-model="formData.universityId" :min="1" style="width: 200px" />
            </el-form-item>
            <el-form-item label="大学名称" required>
              <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="试点校">
              <el-radio-group v-model="formData.isPilot">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="首次试点年份">
              <el-input-number v-model="formData.pilotYear" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
            </el-form-item>
            <el-form-item label="出分前校测">
              <el-radio-group v-model="formData.testBeforeScore">
                <el-radio :value="true">是</el-radio>
                <el-radio :value="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="官方页面URL">
              <el-input v-model="formData.officialUrl" placeholder="https://" maxlength="500" />
            </el-form-item>
            <el-form-item label="报名入口URL">
              <el-input v-model="formData.signupUrl" placeholder="https://" maxlength="500" />
            </el-form-item>
            <el-form-item label="默认入围比例">
              <el-input v-model="formData.defaultEntryRatio" placeholder="默认1:5" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="默认录取公式">
              <el-input v-model="formData.defaultAdmissionFormula" placeholder="录取综合分公式" maxlength="500" />
            </el-form-item>
            <el-form-item label="可选专业">
              <el-input
                v-model="availableMajorsStr"
                type="textarea"
                :rows="3"
                placeholder="多个专业用逗号分隔，如：数学与应用数学, 物理学, 化学"
              />
            </el-form-item>
            <el-form-item label="特殊说明">
              <el-input
                v-model="formData.specialNotes"
                type="textarea"
                :rows="3"
                placeholder="特殊说明"
              />
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

### Self-Review

Check each spec requirement against tasks:

| Spec requirement | Task(s) covering it |
|---|---|
| Route for special module (4 children) | Task 1: Step 1-2 |
| Types for all 4 sub-modules | Task 2: Steps 1-4 |
| API for all 4 sub-modules | Task 3: Steps 1-4 |
| Page: 特殊招生通道 (search, CRUD, toggle, batch delete) | Task 4: Step 1 |
| Page: 通道-大学关联 (frontend filter, CRUD, toggle, batch delete) | Task 5: Step 1 |
| Page: 强基计划数据 (search, CRUD, toggle, batch delete) | Task 6: Step 1 |
| Page: 强基院校配置 (no toggle, search, CRUD, batch delete) | Task 7: Step 1 |
| Search bar on each page | All 4 page tasks include search bar |
| No `sortOrder` in table, status shown as tag | All pages use `el-tag` for status, no sortOrder column |
| Error messages from API shown via `ElMessage.error` | All `handleSubmit` etc catch with `ElMessage.error` |
| Batch delete with confirmation | `handleBatchDelete` in all pages |
| Module 4 (sbs-config) has no toggle button | Task 7: No `handleToggleStatus`, no toggle button in operations column |
