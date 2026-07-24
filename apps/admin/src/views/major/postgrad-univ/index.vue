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

const queryParams = reactive<PostgradUnivQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  postgradMajorName: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.postgradMajorName) params.postgradMajorName = queryParams.postgradMajorName
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
    await ElMessageBox.confirm('确定要永久删除该关联记录吗？此操作不可恢复！', '警告', { type: 'warning' })
    const res = await hardDeletePostgradUniv(id)
    if (res.data.code === 200) { ElMessage.success('已永久删除'); fetchData() }
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
    await ElMessageBox.confirm(`确定批量软删除选中的${selectedIds.value.length} 条记录吗？软删除后可恢复。`, '确认批量软删除')
    const res = await batchSoftDeletePostgradUniv({ ids: selectedIds.value })
    if (res.data.code === 200) { ElMessage.success('批量软删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要操作的记录'); return }
  try {
    await ElMessageBox.confirm(`确定批量硬删除选中的${selectedIds.value.length} 条记录吗？此操作不可恢复！`, '警告', { type: 'warning' })
    const res = await batchHardDeletePostgradUniv({ ids: selectedIds.value })
    if (res.data.code === 200) { ElMessage.success('批量硬删除成功'); fetchData() }
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
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="大学名称">
          <el-input v-model="queryParams.universityName" placeholder="大学名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="考研专业">
          <el-input v-model="queryParams.postgradMajorName" placeholder="专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询<</el-button>
          <el-button @click="handleReset">重置<</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="handleImport">导入关联数据<</el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-button :disabled="selectedIds.length === 0" @click="handleBatchSoftDelete">批量软删除</el-button>
        <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量硬删除</el-button>
        <el-button @click="fetchData">刷新<</el-button>
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
        <el-table-column prop="universityName" label="大学名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="postgradMajorName" label="考研专业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序权重" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 1" type="info" link @click="handleDelete(row.id)">软删除</el-button>
            <template v-else>
              <el-button type="success" link @click="handleRestore(row.id)">恢复<</el-button>
              <el-button type="warning" link @click="handleDelete(row.id)">软删除</el-button>
            </template>
            <el-button type="danger" link @click="handleHardDelete(row.id)">硬删除</el-button>
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
  </div>
</template>
