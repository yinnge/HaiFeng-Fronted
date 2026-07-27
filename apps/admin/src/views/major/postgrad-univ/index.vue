<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getPostgradUnivPage,
  deletePostgradUniv,
  hardDeletePostgradUniv,
  batchSoftDeletePostgradUniv,
  batchHardDeletePostgradUniv,
  importPostgradUniv,
  restorePostgradUniv,
} from '@/api/major'
import type { PostgradUnivListVO, PostgradUnivQueryDTO } from '@/types/major'

const loading = ref(false)
const tableData = ref<PostgradUnivListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
  universityName: '',
  postgradMajorName: '',
  status: undefined as any,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      page: queryParams.page,
      size: queryParams.size,
    }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.postgradMajorName) params.postgradMajorName = queryParams.postgradMajorName
    if (queryParams.status !== undefined && queryParams.status !== null && queryParams.status !== '') params.status = queryParams.status
    const res = await getPostgradUnivPage(params as PostgradUnivQueryDTO)
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
  queryParams.postgradMajorName = ''
  queryParams.status = undefined as any
  queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: PostgradUnivListVO[]) => { selectedIds.value = rows.map(r => r.id) }

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要软删除该关联记录吗？软删除后可恢复。', '确认软删除')
    const res = await deletePostgradUniv(id)
    if (res.data.code === 200) { ElMessage.success('软删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该关联记录吗？此操作不可恢复！', '确认删除', { type: 'warning' })
    const res = await hardDeletePostgradUniv(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要恢复该关联记录吗？', '提示')
    const res = await restorePostgradUniv(id)
    if (res.data.code === 200) { ElMessage.success('恢复成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleBatchSoftDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要操作的记录'); return }
  try {
    await ElMessageBox.confirm(`确定批量禁用选中的${selectedIds.value.length} 条记录吗？禁用后可恢复。`, '确认批量禁用')
    const res = await batchSoftDeletePostgradUniv({ ids: selectedIds.value as unknown as number[] })
    if (res.data.code === 200) { ElMessage.success('批量禁用成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要操作的记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length} 条记录吗？此操作不可恢复！`, '确认批量删除', { type: 'warning' })
    const res = await batchHardDeletePostgradUniv({ ids: selectedIds.value as unknown as number[] })
    if (res.data.code === 200) { ElMessage.success('批量删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
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
      const res = await importPostgradUniv(file)
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

const statusTag = (status: number) => status === 1 ? 'success' : 'info'
const statusLabel = (status: number) => status === 1 ? '启用' : '禁用'

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-wrap">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <div class="page-header">
      <h2 class="page-title">考研院校关联管理</h2>
      <p class="page-subtitle">管理考研专业与招生院校的关联信息，支持启用/禁用状态控制</p>
    </div>

    <div class="search-card">
      <div class="section-label">筛选条件</div>
      <el-form :model="queryParams" inline>
        <el-form-item label="大学名称">
          <el-input v-model="queryParams.universityName" placeholder="大学名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="考研专业">
          <el-input v-model="queryParams.postgradMajorName" placeholder="专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="btn-search" @click="handleSearch">查询</el-button>
          <el-button class="btn-reset" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="action-bar">
      <div class="action-left">
        <el-button class="btn-add" @click="handleImport">导入关联数据</el-button>
      </div>
      <div class="action-right">
        <el-button class="btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchSoftDelete">批量禁用</el-button>
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
        :header-cell-style="{
          background: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
          color: '#9A3412',
          fontWeight: 600,
        }"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="universityName" label="大学名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="postgradMajorName" label="考研专业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序权重" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row.status === 1">
              <span class="action-link" @click="handleDelete(row.id)">软删除</span>
            </template>
            <template v-else>
              <span class="action-link" @click="handleRestore(row.id)">恢复</span>
              <span class="action-link" @click="handleDelete(row.id)">软删除</span>
            </template>
            <span class="action-link action-danger" @click="handleHardDelete(row.id)">删除</span>
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
</style>
