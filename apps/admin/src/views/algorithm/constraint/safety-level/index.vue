<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getSafetyPage,
  getSafetyDetail,
  addSafety,
  updateSafety,
  deleteSafety,
  batchDeleteSafety,
} from '@/api/algorithm/constraint'
import type {
  SafetyLevelListVO,
  SafetyLevelDetailVO,
  SafetyLevelAddDTO,
  SafetyLevelUpdateDTO,
} from '@/types/algorithm/constraint'

const loading = ref(false)
const tableData = ref<SafetyLevelListVO[]>([])
const total = ref(0)
const selectedLevels = ref<string[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentLevel = ref<number | null>(null)
const detailData = ref<SafetyLevelDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  level: null,
  code: '',
  name: '',
  nameShort: '',
  minCoefficient: null,
  maxCoefficient: null,
  color: '',
  confidence: '',
  confidenceReason: '',
  description: '',
})

const confidenceOptions = [
  { label: '�?, value: 'HIGH' },
  { label: '�?, value: 'MEDIUM' },
  { label: '�?, value: 'LOW' },
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSafetyPage({ page: queryParams.page, size: queryParams.size })
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

const handlePageChange = (page: number) => {
  queryParams.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: SafetyLevelListVO[]) => {
  selectedLevels.value = rows.map((r) => r.level)
}

const resetForm = () => {
  formData.level = null
  formData.code = ''
  formData.name = ''
  formData.nameShort = ''
  formData.minCoefficient = null
  formData.maxCoefficient = null
  formData.color = ''
  formData.confidence = ''
  formData.confidenceReason = ''
  formData.description = ''
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', level?: number) => {
  dialogMode.value = mode
  currentLevel.value = level || null

  if (mode === 'add') {
    dialogTitle.value = '新增安全系数等级'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && level) {
    dialogTitle.value = '修改安全系数等级'
    formLoading.value = true
    try {
      const res = await getSafetyDetail(level)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.level = d.level
        formData.code = d.code
        formData.name = d.name
        formData.nameShort = d.nameShort
        formData.minCoefficient = d.minCoefficient
        formData.maxCoefficient = d.maxCoefficient
        formData.color = d.color || ''
        formData.confidence = d.confidence || ''
        formData.confidenceReason = d.confidenceReason || ''
        formData.description = d.description || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && level) {
    dialogTitle.value = '安全系数等级详情'
    formLoading.value = true
    try {
      const res = await getSafetyDetail(level)
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
  if (!formData.level || !formData.code || !formData.name || !formData.nameShort) {
    ElMessage.warning('请填写等级编号、代码、名称和简�?)
    return
  }
  if (formData.minCoefficient === null || formData.maxCoefficient === null) {
    ElMessage.warning('请填写系数范�?)
    return
  }
  if (formData.minCoefficient >= formData.maxCoefficient) {
    ElMessage.warning('系数下界必须小于系数上界')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: SafetyLevelAddDTO = {
        level: formData.level,
        code: formData.code,
        name: formData.name,
        nameShort: formData.nameShort,
        minCoefficient: formData.minCoefficient,
        maxCoefficient: formData.maxCoefficient,
      }
      if (formData.color) data.color = formData.color
      if (formData.confidence) data.confidence = formData.confidence
      if (formData.confidenceReason) data.confidenceReason = formData.confidenceReason
      if (formData.description) data.description = formData.description
      res = await addSafety(data)
    } else if (dialogMode.value === 'edit' && currentLevel.value) {
      const data: SafetyLevelUpdateDTO = {
        level: formData.level,
        code: formData.code,
        name: formData.name,
        nameShort: formData.nameShort,
        minCoefficient: formData.minCoefficient,
        maxCoefficient: formData.maxCoefficient,
      }
      if (formData.color) data.color = formData.color
      if (formData.confidence) data.confidence = formData.confidence
      if (formData.confidenceReason) data.confidenceReason = formData.confidenceReason
      if (formData.description) data.description = formData.description
      res = await updateSafety(currentLevel.value, data)
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
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (level: number) => {
  try {
    await ElMessageBox.confirm(
      '确定删除该安全系数等级吗？删除后可恢复�?,
      '确认删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await deleteSafety(level)
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
  if (selectedLevels.value.length === 0) {
    ElMessage.warning('请先选择要删除的等级')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量删除选中�?${selectedLevels.value.length} 个等级吗？删除后可恢复。`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteSafety(selectedLevels.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedLevels.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

const confidenceTag = (val: string | null) => {
  if (val === 'HIGH') return 'success'
  if (val === 'MEDIUM') return 'warning'
  if (val === 'LOW') return 'danger'
  return 'info'
}
const confidenceLabel = (val: string | null) => {
  if (val === 'HIGH') return '�?
  if (val === 'MEDIUM') return '�?
  if (val === 'LOW') return '�?
  return val || '-'
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增等级</el-button>
        <el-button type="danger" :disabled="selectedLevels.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="level" label="等级编号" width="90" align="center" />
        <el-table-column prop="code" label="代码" width="140" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="nameShort" label="简�? width="70" align="center" />
        <el-table-column label="系数范围" width="160" align="center">
          <template #default="{ row }">
            {{ row.minCoefficient.toFixed(2) }} ~ {{ row.maxCoefficient.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="confidence" label="置信�? width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="confidenceTag(row.confidence)" size="small">{{ confidenceLabel(row.confidence) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.level)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.level)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row.level)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="等级编号">{{ detailData.level }}</el-descriptions-item>
            <el-descriptions-item label="代码">{{ detailData.code }}</el-descriptions-item>
            <el-descriptions-item label="名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="简�?>{{ detailData.nameShort }}</el-descriptions-item>
            <el-descriptions-item label="系数范围">
              {{ detailData.minCoefficient.toFixed(2) }} ~ {{ detailData.maxCoefficient.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="显示颜色">
              <span v-if="detailData.color" :style="{ color: detailData.color }">�?/span>
              {{ detailData.color || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="置信�?>
              <el-tag :type="confidenceTag(detailData.confidence)" size="small">{{ confidenceLabel(detailData.confidence) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="置信度说�?>{{ detailData.confidenceReason || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细说明" :span="2">
              <div class="max-h-32 overflow-y-auto whitespace-pre-wrap">{{ detailData.description || '-' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="等级编号" required>
                  <el-input-number v-model="formData.level" :min="1" :max="10" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="代码" required>
                  <el-input v-model="formData.code" placeholder="�?REACH_HIGH" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="名称" required>
                  <el-input v-model="formData.name" placeholder="�?大胆冲刺" maxlength="30" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="简�? required>
                  <el-input v-model="formData.nameShort" placeholder="�?�? maxlength="10" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="系数下界" required>
                  <el-input-number v-model="formData.minCoefficient" :min="0" :max="1" :precision="2" :step="0.05" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系数上界" required>
                  <el-input-number v-model="formData.maxCoefficient" :min="0" :max="1" :precision="2" :step="0.05" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="显示颜色">
                  <el-color-picker v-model="formData.color" show-alpha />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="置信�?>
                  <el-select v-model="formData.confidence" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="item in confidenceOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="置信度说�?>
              <el-input v-model="formData.confidenceReason" placeholder="置信度说�? maxlength="150" show-word-limit />
            </el-form-item>
            <el-form-item label="详细说明">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="详细说明" />
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
