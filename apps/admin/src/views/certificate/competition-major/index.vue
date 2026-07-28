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
const selectedIds = ref<string[]>([])

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
  if (idQueryValue.value == null) {
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

const handleDelete = async (id: string, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除竞赛"${name}"的关联吗？删除后数据保留可恢复。`,
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
      `确定要批量删除选中的${selectedIds.value.length} 条关联记录吗？数据保留可恢复。`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCompetitionMajor(selectedIds.value as unknown as number[])
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
  <div class="page-wrap">
    <!-- 水印 -->
    <img src="@/assets/images/logo-main.png" class="watermark watermark-tr" />
    <img src="@/assets/images/logo-main.png" class="watermark watermark-bl" />

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">竞赛专业关联</h1>
      <p class="page-subtitle">管理竞赛与专业的关联关系，支持关联的新增、查询和删除</p>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">搜索条件</div>
      <el-form :model="queryParams" inline>
        <el-form-item label="竞赛名称">
          <el-input v-model="queryParams.competitionName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.majorName" placeholder="专业名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <button class="custom-btn search-btn" @click.prevent="handleSearch">
            <span>查询</span>
          </button>
          <button class="custom-btn reset-btn" @click.prevent="handleReset">
            <span>重置</span>
          </button>
        </el-form-item>
        <el-form-item>
          <button class="custom-btn outline-btn" @click.prevent="openIdQuery('competition')">
            <span>按竞赛ID查询</span>
          </button>
          <button class="custom-btn outline-btn" @click.prevent="openIdQuery('major')">
            <span>按专业ID查询</span>
          </button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="custom-btn add-btn" @click="openAddDialog">
        <span>＋ 新增关联</span>
      </button>
      <button class="custom-btn danger-btn" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <span>批量删除</span>
      </button>
      <button class="custom-btn outline-btn" @click="fetchData">
        <span>刷新</span>
      </button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="competitionName" label="竞赛名称" width="200" show-overflow-tooltip />
        <el-table-column prop="majorName" label="专业名称" width="180" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-pill action-info" @click="openDetailDialog(row)">详情</button>
            <button class="action-pill action-danger" @click="handleDelete(row.id, row.competitionName)">软删除</button>
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

    <!-- 新增 Dialog -->
    <el-dialog v-if="dialogMode === 'add'" :model-value="dialogVisible" @update:model-value="dialogVisible = $event" title="新增关联" width="500px" :close-on-click-modal="false" class="uni-dialog">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="竞赛名称" required>
          <el-input v-model="addForm.competitionName" placeholder="输入竞赛名称，系统自动查找ID" />
        </el-form-item>
        <el-form-item label="专业名称" required>
          <el-input v-model="addForm.majorName" placeholder="输入专业名称，系统自动查找ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="dialog-cancel-btn" @click="dialogVisible = false">取消</button>
        <button class="dialog-confirm-btn" @click="handleAddSubmit">确定</button>
      </template>
    </el-dialog>

    <!-- 详情 Dialog -->
    <el-dialog v-if="dialogMode === 'detail'" :model-value="dialogVisible" @update:model-value="dialogVisible = $event" title="关联详情" width="500px" :close-on-click-modal="false" class="uni-dialog">
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
        <button class="dialog-cancel-btn" @click="dialogVisible = false">关闭</button>
      </template>
    </el-dialog>

    <!-- 按ID查询 Dialog -->
    <el-dialog v-model="idQueryVisible" :title="idQueryType === 'competition' ? '按竞赛ID查询' : '按专业ID查询'" width="400px" :close-on-click-modal="false" class="uni-dialog">
      <el-form label-width="100px">
        <el-form-item :label="idQueryType === 'competition' ? '竞赛ID' : '专业ID'" required>
          <el-input-number v-model="idQueryValue" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <button class="dialog-cancel-btn" @click="idQueryVisible = false">取消</button>
        <button class="dialog-confirm-btn" @click="handleIdQuery">查询</button>
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
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
}
.watermark-tr {
  top: 20px;
  right: 20px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: 20px;
  left: 20px;
  transform: rotate(-12deg);
}
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  margin-bottom: 16px;
}
.section-label {
  display: inline-block;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
}

.custom-btn {
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 8px;
  transition: all 0.2s;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.search-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.search-btn:hover {
  box-shadow: 0 2px 8px rgba(249,115,22,0.4);
}
.reset-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.reset-btn:hover {
  border-color: #F97316;
  color: #F97316;
}
.add-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.add-btn:hover {
  box-shadow: 0 2px 8px rgba(249,115,22,0.4);
}
.outline-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.outline-btn:hover {
  border-color: #F97316;
  color: #F97316;
}
.danger-btn {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.danger-btn:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(239,68,68,0.4);
}

.action-bar {
  margin-bottom: 16px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
}

:deep(.table-card .el-table th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  border-bottom: 2px solid #F97316 !important;
}

.action-pill {
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  margin: 0 2px;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-info {
  background: rgba(249,115,22,0.1);
  color: #F97316;
}
.action-info:hover { background: rgba(249,115,22,0.2); }
.action-danger {
  background: rgba(239,68,68,0.1);
  color: #ef4444;
}
.action-danger:hover { background: rgba(239,68,68,0.2); }

.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
:deep(.custom-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
}
:deep(.custom-pagination .btn-prev:hover),
:deep(.custom-pagination .btn-next:hover) {
  color: #F97316 !important;
}

:deep(.uni-dialog .el-dialog__header) {
  border-bottom: 2px solid #F97316;
  padding-bottom: 16px;
  margin-bottom: 0;
}
:deep(.uni-dialog .el-dialog__title) {
  color: #1f2937;
  font-weight: 600;
}
:deep(.uni-dialog .el-descriptions__label) {
  background: rgba(255,247,237,0.5) !important;
}
:deep(.uni-dialog .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
:deep(.uni-dialog .el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}

.dialog-cancel-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.dialog-cancel-btn:hover {
  border-color: #F97316;
  color: #F97316;
}
.dialog-confirm-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.dialog-confirm-btn:hover {
  box-shadow: 0 2px 8px rgba(249,115,22,0.4);
}
</style>
