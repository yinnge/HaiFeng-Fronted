<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getMajorPage,
  getMajorDetail,
  addMajor,
  deleteMajor,
  batchDeleteMajor,
  importMajorExcel,
} from '@/api/algorithm/constraint'
import type {
  MajorConstraintListVO,
  MajorConstraintDetailVO,
  MajorConstraintQueryDTO,
  MajorConstraintAddDTO,
} from '@/types/algorithm/constraint'

const loading = ref(false)
const tableData = ref<MajorConstraintListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<MajorConstraintQueryDTO>({
  page: 1,
  size: 10,
  majorCode: '',
  majorName: '',
  constraintCode: '',
  constraintName: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<MajorConstraintDetailVO | null>(null)

const formData = reactive({
  majorName: '',
  constraintName: '',
  remark: '',
})

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.majorCode) params.majorCode = queryParams.majorCode
    if (queryParams.majorName) params.majorName = queryParams.majorName
    if (queryParams.constraintCode) params.constraintCode = queryParams.constraintCode
    if (queryParams.constraintName) params.constraintName = queryParams.constraintName
    const res = await getMajorPage(params as MajorConstraintQueryDTO)
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

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.majorCode = ''
  queryParams.majorName = ''
  queryParams.constraintCode = ''
  queryParams.constraintName = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: MajorConstraintListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增关联'
    formData.majorName = ''
    formData.constraintName = ''
    formData.remark = ''
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '关联详情'
    formLoading.value = true
    try {
      const res = await getMajorDetail(id)
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
  if (!formData.majorName || !formData.constraintName) {
    ElMessage.warning('请填写专业名称和约束名称')
    return
  }

  try {
    const data: MajorConstraintAddDTO = {
      majorName: formData.majorName,
      constraintName: formData.constraintName,
    }
    if (formData.remark) data.remark = formData.remark

    const res = await addMajor(data)
    if (res.data.code === 200) {
      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '新增失败')
    }
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('新增失败')
    }
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该关联吗？删除后可恢复。',
      '确认删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteMajor(id)
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
      `确定批量删除选中的 ${selectedIds.value.length} 条关联吗？删除后可恢复。`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteMajor(selectedIds.value)
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

const openImportDialog = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handleImportSubmit = async () => {
  if (!importFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  importLoading.value = true
  try {
    const res = await importMajorExcel(importFile.value)
    if (res.data.code === 200) {
      ElMessage.success(`导入成功，共处理 ${res.data.data} 条`)
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    const msg = err.response?.data?.msg
    if (msg) {
      ElMessage.error(msg)
    } else {
      ElMessage.error('导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="专业代码">
          <el-input v-model="queryParams.majorCode" placeholder="精确搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.majorName" placeholder="精确搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="约束代码">
          <el-input v-model="queryParams.constraintCode" placeholder="精确搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="约束名称">
          <el-input v-model="queryParams.constraintName" placeholder="精确搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
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
        <el-button type="success" @click="openImportDialog">Excel导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />
        <el-table-column prop="majorCode" label="专业代码" width="120" />
        <el-table-column prop="majorName" label="专业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="constraintCode" label="约束代码" width="180" show-overflow-tooltip />
        <el-table-column prop="constraintName" label="约束名称" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="650px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="专业代码">{{ detailData.majorCode }}</el-descriptions-item>
            <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="约束代码">{{ detailData.constraintCode }}</el-descriptions-item>
            <el-descriptions-item label="约束名称">{{ detailData.constraintName }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="专业名称" required>
              <el-input v-model="formData.majorName" placeholder="请输入专业名称（系统自动查找对应代码）" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="约束名称" required>
              <el-input v-model="formData.constraintName" placeholder="请输入约束名称（系统自动查找对应代码）" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注说明" maxlength="200" show-word-limit />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode === 'add'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel导入专业约束关联" width="500px">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        accept=".xlsx,.xls"
        :on-change="handleImportFileChange"
        :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .xlsx / .xls 格式，模板列：专业名称、约束名称、备注（可选）
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
