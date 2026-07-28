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
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-title">竞赛专业关联</div>
      <div class="page-subtitle">管理竞赛与专业的关联关系，支持关联的新增、查询和删除</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="add-btn" @click="openAddDialog">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增关联
      </button>
      <button type="button" class="batch-delete-btn" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        批量删除
      </button>
      <button type="button" class="add-btn outline-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        刷新
      </button>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">
        <span class="label-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        筛选条件
      </div>
      <el-form :model="queryParams" inline class="search-form">
        <div class="filter-fields">
          <el-form-item label="竞赛名称">
            <el-input v-model="queryParams.competitionName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item label="专业名称">
            <el-input v-model="queryParams.majorName" placeholder="专业名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item>
            <button type="button" class="id-query-btn" @click.prevent="openIdQuery('competition')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              按竞赛ID查询
            </button>
            <button type="button" class="id-query-btn" @click.prevent="openIdQuery('major')">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              按专业ID查询
            </button>
          </el-form-item>
        </div>
        <div class="search-actions">
          <button type="button" class="search-btn" @click.prevent="handleSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            查询
          </button>
          <button type="button" class="reset-btn" @click.prevent="handleReset">重置</button>
        </div>
      </el-form>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <div class="custom-table" v-loading="loading">
        <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="id" label="ID" min-width="140" />
          <el-table-column prop="competitionName" label="竞赛名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="majorName" label="专业名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="createdAt" label="创建时间" min-width="180" />
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-group">
                <button class="action-btn action-detail" @click="openDetailDialog(row)">详情</button>
                <button class="action-btn action-soft-delete" @click="handleDelete(row.id, row.competitionName)">软删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
    <el-dialog v-if="dialogMode === 'add'" :model-value="dialogVisible" @update:model-value="dialogVisible = $event" title="新增关联" width="500px" :close-on-click-modal="false" class="detail-dialog">
      <el-form :model="addForm" label-width="100px">
        <el-form-item label="竞赛名称" required>
          <el-input v-model="addForm.competitionName" placeholder="输入竞赛名称，系统自动查找ID" />
        </el-form-item>
        <el-form-item label="专业名称" required>
          <el-input v-model="addForm.majorName" placeholder="输入专业名称，系统自动查找ID" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="exit-btn" @click="dialogVisible = false">退出</button>
          <button type="button" class="save-btn" @click="handleAddSubmit">确定</button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情 Dialog -->
    <el-dialog v-if="dialogMode === 'detail'" :model-value="dialogVisible" @update:model-value="dialogVisible = $event" title="关联详情" width="500px" :close-on-click-modal="false" class="detail-dialog">
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
        <div class="dialog-footer">
          <button type="button" class="exit-btn" @click="dialogVisible = false">关闭</button>
        </div>
      </template>
    </el-dialog>

    <!-- 按ID查询 Dialog -->
    <el-dialog v-model="idQueryVisible" :title="idQueryType === 'competition' ? '按竞赛ID查询' : '按专业ID查���'" width="400px" :close-on-click-modal="false" class="detail-dialog">
      <el-form label-width="100px">
        <el-form-item :label="idQueryType === 'competition' ? '竞赛ID' : '专业ID'" required>
          <el-input-number v-model="idQueryValue" :min="1" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="exit-btn" @click="idQueryVisible = false">取消</button>
          <button type="button" class="save-btn" @click="handleIdQuery">查询</button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-wrap {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ====== 水印 ====== */
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
  height: auto;
}

/* ====== 页面标题 ====== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* ====== 操作栏 ====== */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.add-btn:active {
  transform: translateY(0);
}
.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.outline-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  box-shadow: none;
}
.outline-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
  transform: none;
  box-shadow: none;
}
.batch-delete-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.batch-delete-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.batch-delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ====== 搜索卡片 ====== */
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}
.label-icon {
  display: flex;
  align-items: center;
}
.search-form {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.filter-fields {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}
.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.id-query-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-right: 8px;
  white-space: nowrap;
}
.id-query-btn:hover {
  color: #F97316;
  border-color: #F97316;
}
.search-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}
.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.search-btn:active {
  transform: translateY(0);
}
.reset-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.reset-btn:active {
  background: #f3f4f6;
}

/* ====== 表格卡片 ====== */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}
.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}
.custom-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}
.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}
.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
}

/* ====== 操作按钮 ====== */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}
.action-soft-delete {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.action-soft-delete:hover {
  background: #fde68a;
}

/* ====== 分页 ====== */
.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.custom-pagination :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}
.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 8px;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}

/* ====== Dialog ====== */
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}
.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}
.detail-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.detail-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.detail-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.detail-dialog :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.detail-dialog :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.detail-dialog :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.detail-dialog :deep(.el-descriptions__label) {
  background: rgba(255, 247, 237, 0.5) !important;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.exit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.save-btn:active {
  transform: translateY(0);
}
</style>
