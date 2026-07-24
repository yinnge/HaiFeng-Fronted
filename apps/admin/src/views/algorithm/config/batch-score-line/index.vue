<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getBatchScoreLinePage,
  getBatchScoreLineDetail,
  addBatchScoreLine,
  updateBatchScoreLine,
  deleteBatchScoreLine,
  hardDeleteBatchScoreLine,
  batchDeleteBatchScoreLine,
  batchHardDeleteBatchScoreLine,
  importBatchScoreLine,
} from '@/api/algorithm/config/batch-score-line'
import type {
  BatchScoreLineListVO,
  BatchScoreLineDetailVO,
  BatchScoreLineQueryDTO,
  BatchScoreLineAddDTO,
} from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<BatchScoreLineListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const provinceOptions = [
  '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏',
  '浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西',
  '海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆',
]
const subjectTypeOptions = ['物理类', '历史类', '理科', '文科', '不分文理']

const queryParams = reactive<BatchScoreLineQueryDTO>({
  page: 1,
  size: 10,
  province: undefined,
  year: undefined,
  subjectType: undefined,
  batch: undefined,
  scoreLine: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<BatchScoreLineDetailVO | null>(null)

const formData = reactive<BatchScoreLineAddDTO>({
  province: '',
  year: new Date().getFullYear(),
  subjectType: '',
  batch: '',
  scoreLine: 0,
  rankLine: null,
  remark: null,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.year) params.year = queryParams.year
    if (queryParams.subjectType) params.subjectType = queryParams.subjectType
    if (queryParams.batch) params.batch = queryParams.batch
    if (queryParams.scoreLine !== undefined && queryParams.scoreLine !== null) params.scoreLine = queryParams.scoreLine
    const res = await getBatchScoreLinePage(params as BatchScoreLineQueryDTO)
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
  queryParams.province = undefined
  queryParams.year = undefined
  queryParams.subjectType = undefined
  queryParams.batch = undefined
  queryParams.scoreLine = undefined
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

const handleSelectionChange = (selection: BatchScoreLineListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.province = ''
  formData.year = new Date().getFullYear()
  formData.subjectType = ''
  formData.batch = ''
  formData.scoreLine = 0
  formData.rankLine = null
  formData.remark = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增批次分数线'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getBatchScoreLineDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改批次分数线'
          formData.province = d.province
          formData.year = d.year
          formData.subjectType = d.subjectType
          formData.batch = d.batch
          formData.scoreLine = d.scoreLine
          formData.rankLine = d.rankLine
          formData.remark = d.remark
        } else {
          dialogTitle.value = '批次分数线详情'
          detailData.value = d
        }
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
  if (!formData.province || !formData.year || !formData.subjectType || !formData.batch || formData.scoreLine === undefined) {
    ElMessage.warning('请填写完整信息（带*字段）')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addBatchScoreLine({
        ...formData,
        rankLine: formData.rankLine || null,
        remark: formData.remark || null,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateBatchScoreLine(currentId.value, {
        ...formData,
        rankLine: formData.rankLine || null,
        remark: formData.remark || null,
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

const handleSoftDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要软删除该记录吗？', '提示')
    const res = await deleteBatchScoreLine(id)
    if (res.data.code === 200) {
      ElMessage.success('软删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该记录吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确认永久删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await hardDeleteBatchScoreLine(id)
    if (res.data.code === 200) {
      ElMessage.success('硬删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchSoftDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要软删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteBatchScoreLine(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量软删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条记录吗？此操作不可恢复！`, '警告', {
      confirmButtonText: '确认永久删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await batchHardDeleteBatchScoreLine(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量硬删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleImport = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await importBatchScoreLine(file)
      if (res.data.code === 200) {
        ElMessage.success('导入成功')
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '导入失败')
      }
    } catch {
      ElMessage.error('导入失败')
    }
  }
  input.click()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-row :gutter="16" class="w-full">
          <el-col :span="5">
            <el-form-item label="省份" style="width: 100%; margin-bottom: 16px;">
              <el-select v-model="queryParams.province" placeholder="全部" clearable filterable style="width: 100%;">
                <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="年份" style="width: 100%; margin-bottom: 16px;">
              <el-input-number v-model="queryParams.year" :min="2000" :max="2100" :step="1" controls-position="right" :value-on-clear="undefined" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="科类" style="width: 100%; margin-bottom: 16px;">
              <el-select v-model="queryParams.subjectType" placeholder="全部" clearable style="width: 100%;">
                <el-option v-for="t in subjectTypeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="批次" style="width: 100%; margin-bottom: 16px;">
              <el-input v-model="queryParams.batch" placeholder="全部" clearable style="width: 100%;" @keyup.enter="handleSearch" />
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="分数线" style="width: 100%; margin-bottom: 0;">
              <el-input-number v-model="queryParams.scoreLine" :min="0" :max="900" controls-position="right" :value-on-clear="undefined" style="width: 100%;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row class="mt-4">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </div>

    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增</el-button>
      <el-button @click="handleImport">导入Excel</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="handleBatchSoftDelete">批量软删除</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量硬删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="province" label="省份" width="90" />
        <el-table-column prop="year" label="年份" width="70" />
        <el-table-column prop="subjectType" label="科类" width="100" />
        <el-table-column prop="batch" label="批次" width="120" />
        <el-table-column prop="scoreLine" label="分数线" width="90" />
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="info" link @click="handleSoftDelete(row.id)">软删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="年份">{{ detailData.year }}</el-descriptions-item>
            <el-descriptions-item label="科类">{{ detailData.subjectType }}</el-descriptions-item>
            <el-descriptions-item label="批次">{{ detailData.batch }}</el-descriptions-item>
            <el-descriptions-item label="分数线">{{ detailData.scoreLine }}</el-descriptions-item>
            <el-descriptions-item label="位次线">{{ detailData.rankLine ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="省份" required>
                  <el-select v-model="formData.province" placeholder="请选择" filterable style="width: 100%;">
                    <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="年份" required>
                  <el-input-number v-model="formData.year" :min="2000" :max="2100" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="科类" required>
                  <el-select v-model="formData.subjectType" placeholder="请选择" style="width: 100%;">
                    <el-option v-for="t in subjectTypeOptions" :key="t" :label="t" :value="t" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="批次" required>
                  <el-input v-model="formData.batch" placeholder="请输入批次名称" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="分数线" required>
                  <el-input-number v-model="formData.scoreLine" :min="0" :max="900" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="位次线">
                  <el-input-number v-model="formData.rankLine" :min="0" :max="9999999" :value-on-clear="null" style="width: 100%;" placeholder="选填" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="选填" />
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
