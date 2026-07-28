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
const selectedIds = ref<string[]>([])

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
const currentId = ref<string | null>(null)
const detailData = ref<MajorPostgradDirectionDetailVO | null>(null)

const formData = reactive<MajorPostgradDirectionAddDTO>({
  majorId: '',
  postgradMajorId: '',
  sortOrder: 0,
})

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

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增关联'
    formData.majorId = ''
    formData.postgradMajorId = ''
    formData.sortOrder = 0
    majorOptions.value = []
    postgradMajorOptions.value = []
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修��关联'
    formLoading.value = true
    try {
      const res = await getMajorPostgradDirectionDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.majorId = d.majorId
        formData.postgradMajorId = d.postgradMajorId
        formData.sortOrder = d.sortOrder ?? 0
        majorOptions.value = [{ value: d.majorId as any, label: d.majorName }]
        postgradMajorOptions.value = [{ value: d.postgradMajorId as any, label: d.postgradMajorName }]
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
      if (formData.majorId) data.majorId = formData.majorId as any
      if (formData.postgradMajorId) data.postgradMajorId = formData.postgradMajorId as any
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该关联记录吗？此操作不可恢复！', '确认删除', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteMajorPostgradDirection(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
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
      `确定删除选中的${selectedIds.value.length} 条记录吗？此操作不可恢复！`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteMajorPostgradDirection({ ids: selectedIds.value as unknown as number[] })
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
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
  <div class="page-wrap">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <div class="page-header">
      <h2 class="page-title">考研方向关联管理</h2>
      <p class="page-subtitle">管理本科专业与考研方向的关联关系，支持批量导入导出</p>
    </div>

    <div class="search-card">
      <div class="section-label">筛选条件</div>
      <el-form :model="queryParams" inline>
        <el-form-item label="本科专业名称">
          <el-input v-model="queryParams.majorName" placeholder="本科专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="考研专业名称">
          <el-input v-model="queryParams.postgradMajorName" placeholder="考研专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button class="btn-search" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-bar">
      <div class="action-left">
        <el-button class="btn-add" @click="openDialog('add')">+ 新增关联</el-button>
        <el-button class="btn-outline" @click="handleImport">导入关联数据</el-button>
      </div>
      <div class="action-right">
        <el-button class="btn-danger-solid" :disabled="selectedIds.length === 0" @click="handleBatchHardDelete">批量删除</el-button>
        <el-button class="btn-outline" @click="fetchData">刷新</el-button>
      </div>
    </div>

    <div class="table-card">
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
            <span class="action-link" @click="openDialog('detail', row.id)">详情</span>
            <span class="action-link" @click="openDialog('edit', row.id)">修改</span>
            <span class="action-link action-danger" @click="handleDelete(row.id)">删除</span>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" class="uni-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border class="uni-descriptions">
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
                placeholder="请输入专业搜索"
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
                placeholder="请输入专业搜索"
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
        <span class="dialog-footer">
          <el-button class="btn-outline" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
          <el-button v-if="dialogMode !== 'detail'" class="btn-add" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-wrap {
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-right {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
}

.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #9A3412;
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #C2410C;
  margin: 0;
}

.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  box-shadow: 0 2px 12px rgba(249,115,22,0.08);
}
.section-label {
  display: inline-block;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 12px;
  padding: 3px 12px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 500;
}

.btn-search {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 6px !important;
  padding: 8px 20px !important;
}
.btn-search:hover {
  opacity: 0.9;
}
.btn-reset {
  background: #fff !important;
  border: 1px solid #F97316 !important;
  color: #F97316 !important;
  border-radius: 6px !important;
  padding: 8px 20px !important;
}
.btn-reset:hover {
  background: #FFF7ED !important;
}

.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.action-left, .action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 20px !important;
  padding: 8px 20px !important;
  font-weight: 500;
}
.btn-add:hover {
  opacity: 0.9;
}

.btn-outline {
  background: #fff !important;
  border: 1px solid #F97316 !important;
  color: #F97316 !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}
.btn-outline:hover {
  background: #FFF7ED !important;
  border-color: #FB923C !important;
}
.btn-outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  background: #fff !important;
  border: 1px solid #DC2626 !important;
  color: #DC2626 !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}
.btn-danger:hover {
  background: #FEF2F2 !important;
}
.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger-solid {
  background: linear-gradient(135deg, #DC2626, #EF4444) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 6px !important;
  padding: 8px 16px !important;
}
.btn-danger-solid:hover {
  opacity: 0.9;
}
.btn-danger-solid:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #FED7AA;
  box-shadow: 0 2px 12px rgba(249,115,22,0.06);
}

.table-card :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.table-card :deep(.el-table__header th .cell) {
  color: #1f2937;
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.status-on {
  background: #DCFCE7;
  color: #15803D;
}
.status-off {
  background: #F3F4F6;
  color: #6B7280;
}

.action-link {
  color: #F97316;
  cursor: pointer;
  font-size: 13px;
  margin: 0 6px;
  transition: color 0.2s;
}
.action-link:hover {
  color: #FB923C;
}
.action-danger {
  color: #DC2626;
}
.action-danger:hover {
  color: #EF4444;
}

.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pagination .el-pager li.is-active:hover) {
  color: #fff !important;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316 !important;
}

.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #F97316;
  padding-bottom: 16px;
  margin-bottom: 20px;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 600;
  color: #9A3412;
}

.uni-descriptions :deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5) !important;
  color: #9A3412 !important;
  font-weight: 500;
}

.uni-dialog :deep(.el-form-item__label) {
  color: #9A3412;
  font-weight: 500;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-textarea__inner:focus) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316;
}
.uni-dialog :deep(.el-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
