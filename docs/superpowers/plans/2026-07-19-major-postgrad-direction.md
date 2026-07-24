# 考研专业关联管理模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 考研专业关联管理 (Major-Postgrad Direction Association) admin CRUD page with search, add, edit, detail, hard delete, batch hard delete, and Excel import.

**Architecture:** Follows existing `postgrad-univ` pattern with added add/edit dialog. Remote search selects for major/postgrad major foreign keys. No status field in this module.

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), TypeScript, Element Plus, Axios

---

### Task 1: Type Definitions

**Files:**
- Create: `apps/admin/src/types/major/postgrad-direction.ts`
- Modify: `apps/admin/src/types/major/index.ts`

- [ ] **Step 1: Create type definitions**

```typescript
// apps/admin/src/types/major/postgrad-direction.ts

export interface MajorPostgradDirectionListVO {
  id: number
  majorName: string
  postgradMajorName: string
  createdAt: string
}

export interface MajorPostgradDirectionDetailVO {
  id: number
  majorId: number
  postgradMajorId: number
  majorName: string
  postgradMajorName: string
  sortOrder: number
  createdAt: string
}

export interface MajorPostgradDirectionQueryDTO {
  majorName?: string
  postgradMajorName?: string
  page: number
  size: number
}

export interface MajorPostgradDirectionAddDTO {
  majorId: number
  postgradMajorId: number
  sortOrder?: number
}

export interface MajorPostgradDirectionUpdateDTO {
  majorId?: number
  postgradMajorId?: number
  sortOrder?: number
}
```

- [ ] **Step 2: Update barrel export**

In `apps/admin/src/types/major/index.ts`, add the export line:

```typescript
export type { MajorPostgradDirectionListVO, MajorPostgradDirectionDetailVO, MajorPostgradDirectionQueryDTO, MajorPostgradDirectionAddDTO, MajorPostgradDirectionUpdateDTO } from './postgrad-direction'
```

---

### Task 2: API Functions

**Files:**
- Modify: `apps/admin/src/api/major/index.ts`

- [ ] **Step 1: Add API functions for major-postgrad-direction module**

Add after the `// ========== 考研专业-大学关联管理 ==========` section:

```typescript
// ========== 考研专业关联管理 ==========

export const getMajorPostgradDirectionPage = (params: MajorPostgradDirectionQueryDTO) => {
  return request.get<R<PageResult<MajorPostgradDirectionListVO>>>('/api/v1/admin/major-postgrad-direction/list', { params })
}

export const getMajorPostgradDirectionDetail = (id: number) => {
  return request.get<R<MajorPostgradDirectionDetailVO>>(`/api/v1/admin/major-postgrad-direction/${id}`)
}

export const addMajorPostgradDirection = (data: MajorPostgradDirectionAddDTO) => {
  return request.post<R<void>>('/api/v1/admin/major-postgrad-direction/add', data)
}

export const updateMajorPostgradDirection = (id: number, data: MajorPostgradDirectionUpdateDTO) => {
  return request.put<R<void>>(`/api/v1/admin/major-postgrad-direction/${id}`, data)
}

export const deleteMajorPostgradDirection = (id: number) => {
  return request.delete<R<void>>(`/api/v1/admin/major-postgrad-direction/${id}`)
}

export const batchDeleteMajorPostgradDirection = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/major-postgrad-direction/batch-delete', data)
}

export const importMajorPostgradDirection = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>('/api/v1/admin/major-postgrad-direction/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
```

- [ ] **Step 2: Add new type imports at top of file**

Update the import from `@/types/major` to include:

```typescript
import type {
  MajorListVO,
  MajorDetailVO,
  MajorQueryDTO,
  MajorAddDTO,
  MajorUpdateDTO,
  MajorDetailUpdateDTO,
  PostgradMajorListVO,
  PostgradMajorDetailVO,
  PostgradMajorQueryDTO,
  PostgradMajorAddDTO,
  PostgradMajorUpdateDTO,
  PostgradUnivListVO,
  PostgradUnivQueryDTO,
  MajorPostgradDirectionListVO,
  MajorPostgradDirectionDetailVO,
  MajorPostgradDirectionQueryDTO,
  MajorPostgradDirectionAddDTO,
  MajorPostgradDirectionUpdateDTO,
} from '@/types/major'
```

---

### Task 3: Page Component

**Files:**
- Create: `apps/admin/src/views/major/postgrad-direction/index.vue`
- Note: parent directory `apps/admin/src/views/major/postgrad-direction/` must exist

- [ ] **Step 1: Create directory if needed**

```powershell
New-Item -ItemType Directory -Path "apps/admin/src/views/major/postgrad-direction" -Force
```

- [ ] **Step 2: Create the Vue page component**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getMajorPostgradDirectionPage,
  getMajorPostgradDirectionDetail,
  addMajorPostgradDirection,
  updateMajorPostgradDirection,
  deleteMajorPostgradDirection,
  batchDeleteMajorPostgradDirection,
  importMajorPostgradDirection,
  getMajorPage,
  getPostgradMajorPage,
} from '@/api/major'
import type {
  MajorPostgradDirectionListVO,
  MajorPostgradDirectionDetailVO,
  MajorPostgradDirectionQueryDTO,
  MajorPostgradDirectionAddDTO,
  MajorPostgradDirectionUpdateDTO,
} from '@/types/major'

const loading = ref(false)
const tableData = ref<MajorPostgradDirectionListVO[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])

const queryParams = reactive<MajorPostgradDirectionQueryDTO>({
  page: 1,
  size: 10,
  majorName: '',
  postgradMajorName: '',
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const formLoading = ref(false)
const currentId = ref<number | null>(null)
const detailData = ref<MajorPostgradDirectionDetailVO | null>(null)

const formData = reactive<MajorPostgradDirectionAddDTO>({
  majorId: 0,
  postgradMajorId: 0,
  sortOrder: 0,
})

// 远程搜索
const majorOptions = ref<{ value: number; label: string }[]>([])
const postgradMajorOptions = ref<{ value: number; label: string }[]>([])

const searchMajor = async (query: string) => {
  if (!query) { majorOptions.value = []; return }
  try {
    const res = await getMajorPage({ page: 1, size: 20, majorName: query } as any)
    if (res.data.code === 200) {
      majorOptions.value = (res.data.data.records || []).map((r: any) => ({
        value: r.id,
        label: r.majorName,
      }))
    }
  } catch { /* ignore */ }
}

const searchPostgradMajor = async (query: string) => {
  if (!query) { postgradMajorOptions.value = []; return }
  try {
    const res = await getPostgradMajorPage({ page: 1, size: 20, majorName: query } as any)
    if (res.data.code === 200) {
      postgradMajorOptions.value = (res.data.data.records || []).map((r: any) => ({
        value: r.id,
        label: r.majorName,
      }))
    }
  } catch { /* ignore */ }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.majorName) params.majorName = queryParams.majorName
    if (queryParams.postgradMajorName) params.postgradMajorName = queryParams.postgradMajorName
    const res = await getMajorPostgradDirectionPage(params as MajorPostgradDirectionQueryDTO)
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
  queryParams.majorName = ''
  queryParams.postgradMajorName = ''
  queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: MajorPostgradDirectionListVO[]) => { selectedIds.value = rows.map(r => r.id) }

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: number) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增关联'
    formData.majorId = 0
    formData.postgradMajorId = 0
    formData.sortOrder = 0
    majorOptions.value = []
    postgradMajorOptions.value = []
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改关联'
    formLoading.value = true
    try {
      const res = await getMajorPostgradDirectionDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.majorId = d.majorId
        formData.postgradMajorId = d.postgradMajorId
        formData.sortOrder = d.sortOrder ?? 0
        majorOptions.value = [{ value: d.majorId, label: d.majorName }]
        postgradMajorOptions.value = [{ value: d.postgradMajorId, label: d.postgradMajorName }]
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
      const res = await getMajorPostgradDirectionDetail(id)
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
  if (!formData.majorId || !formData.postgradMajorId) {
    ElMessage.warning('请选择本科专业和考研专业')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: MajorPostgradDirectionAddDTO = {
        majorId: formData.majorId,
        postgradMajorId: formData.postgradMajorId,
      }
      if (formData.sortOrder !== undefined && formData.sortOrder !== null) data.sortOrder = formData.sortOrder
      res = await addMajorPostgradDirection(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: MajorPostgradDirectionUpdateDTO = {}
      if (formData.majorId) data.majorId = formData.majorId
      if (formData.postgradMajorId) data.postgradMajorId = formData.postgradMajorId
      if (formData.sortOrder !== undefined && formData.sortOrder !== null) data.sortOrder = formData.sortOrder
      res = await updateMajorPostgradDirection(currentId.value, data)
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

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该关联记录吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await deleteMajorPostgradDirection(id)
    if (res.data.code === 200) {
      ElMessage.success('已永久删除')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的记录')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量硬删除选中的 ${selectedIds.value.length} 条记录吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteMajorPostgradDirection({ ids: selectedIds.value })
    if (res.data.code === 200) {
      ElMessage.success('批量硬删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await importMajorPostgradDirection(file)
      if (res.data.code === 200 && res.data.data) {
        const { total: t, success: s, failed: f, errors } = res.data.data
        if (f > 0) {
          ElMessage.warning(`导入完成：共 ${t} 条，成功 ${s} 条，失败 ${f} 条${errors?.length ? '\n' + errors.join('\n') : ''}`)
        } else {
          ElMessage.success(`导入成功：共 ${t} 条，全部导入成功`)
        }
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '导入失败')
      }
    } catch (err: any) {
      ElMessage.error(err?.message || '导入失败')
    }
  }
  input.click()
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="本科专业名称">
          <el-input v-model="queryParams.majorName" placeholder="本科专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="考研专业名称">
          <el-input v-model="queryParams.postgradMajorName" placeholder="考研专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增关联</el-button>
        <el-button @click="handleImport">导入关联数据</el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量硬删除</el-button>
        <el-button @click="fetchData">刷新</el-button>
      </div>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="majorName" label="本科专业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="postgradMajorName" label="考研专业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">硬删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="本科专业名称">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="考研专业名称">{{ detailData.postgradMajorName }}</el-descriptions-item>
            <el-descriptions-item label="排序权重">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'add' || dialogMode === 'edit'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="本科专业" required>
              <el-select
                v-model="formData.majorId"
                filterable
                remote
                reserve-keyword
                placeholder="输入关键字搜索专业"
                :remote-method="searchMajor"
                style="width: 100%"
              >
                <el-option v-for="item in majorOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="考研专业" required>
              <el-select
                v-model="formData.postgradMajorId"
                filterable
                remote
                reserve-keyword
                placeholder="输入关键字搜索专业"
                :remote-method="searchPostgradMajor"
                style="width: 100%"
              >
                <el-option v-for="item in postgradMajorOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="排序权重">
              <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" />
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

### Task 4: Route Registration

**Files:**
- Modify: `apps/admin/src/router/modules/major.ts`

- [ ] **Step 1: Add the new child route**

Add to the `children` array in `apps/admin/src/router/modules/major.ts`:

```typescript
    {
      path: 'postgrad-direction',
      name: 'MajorPostgradDirection',
      component: () => import('@/views/major/postgrad-direction/index.vue'),
      meta: { title: '专业考研关联', moduleCode: 'major_postgraduate' },
    },
```

Place it after the `postgrad-univ` entry.

---

## Verification

After all tasks are complete:

1. Run dev server: `pnpm --filter @haifeng/admin dev`
2. Navigate to `/major/postgrad-direction`
3. Verify: search, add, edit, detail, delete, batch delete, import all work
4. Check console for any TypeScript or runtime errors
