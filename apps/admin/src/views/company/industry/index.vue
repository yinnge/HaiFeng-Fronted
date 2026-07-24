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
