<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getScoreRankPage,
  getScoreRankDetail,
  addScoreRank,
  updateScoreRank,
  deleteScoreRank,
  batchDeleteScoreRank,
  importScoreRank,
} from '@/api/algorithm/config/score-rank'
import type {
  ScoreRankListVO,
  ScoreRankDetailVO,
  ScoreRankQueryDTO,
  ScoreRankAddDTO,
} from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<ScoreRankListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const provinceOptions = [
  '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏',
  '浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西',
  '海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆',
]
const subjectTypeOptions = ['物理类', '历史类', '理科', '文科', '不分文理']

const queryParams = reactive<ScoreRankQueryDTO>({
  page: 1,
  size: 10,
  province: undefined,
  year: undefined,
  subjectType: undefined,
  score: undefined,
  rank: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ScoreRankDetailVO | null>(null)

const formData = reactive<ScoreRankAddDTO>({
  province: '',
  year: new Date().getFullYear(),
  subjectType: '',
  score: 0,
  rank: 0,
  sameScoreCount: null,
  cumulativeCount: null,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.year) params.year = queryParams.year
    if (queryParams.subjectType) params.subjectType = queryParams.subjectType
    if (queryParams.score !== undefined && queryParams.score !== null) params.score = queryParams.score
    if (queryParams.rank !== undefined && queryParams.rank !== null) params.rank = queryParams.rank
    const res = await getScoreRankPage(params as ScoreRankQueryDTO)
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
  queryParams.score = undefined
  queryParams.rank = undefined
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

const handleSelectionChange = (selection: ScoreRankListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.province = ''
  formData.year = new Date().getFullYear()
  formData.subjectType = ''
  formData.score = 0
  formData.rank = 0
  formData.sameScoreCount = null
  formData.cumulativeCount = null
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增一分一段记录'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getScoreRankDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改一分一段记录'
          formData.province = d.province
          formData.year = d.year
          formData.subjectType = d.subjectType
          formData.score = d.score
          formData.rank = d.rank
          formData.sameScoreCount = d.sameScoreCount
          formData.cumulativeCount = d.cumulativeCount
        } else {
          dialogTitle.value = '一分一段记录详情'
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
  if (!formData.province || !formData.year || !formData.subjectType || formData.score === undefined || formData.rank === undefined) {
    ElMessage.warning('请填写完整信息（带*字段）')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addScoreRank({
        ...formData,
        sameScoreCount: formData.sameScoreCount || null,
        cumulativeCount: formData.cumulativeCount || null,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateScoreRank(currentId.value, {
        ...formData,
        sameScoreCount: formData.sameScoreCount || null,
        cumulativeCount: formData.cumulativeCount || null,
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要软删除该记录吗？', '提示')
    const res = await deleteScoreRank(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要软删除选中的 ${selectedIds.value.length} 条记录吗？`, '提示')
    const res = await batchDeleteScoreRank(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
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
      const res = await importScoreRank(file)
      if (res.data.code === 200) {
        ElMessage.success(`导入成功，共处理 ${res.data.data} 条记录`)
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
          <el-col :span="4">
            <el-form-item label="分数" style="width: 100%; margin-bottom: 16px;">
              <el-input-number v-model="queryParams.score" :min="0" :max="750" controls-position="right" :value-on-clear="undefined" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="位次" style="width: 100%; margin-bottom: 0;">
              <el-input-number v-model="queryParams.rank" :min="0" controls-position="right" :value-on-clear="undefined" style="width: 100%;" />
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
      <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量软删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="province" label="省份" width="90" />
        <el-table-column prop="year" label="年份" width="70" />
        <el-table-column prop="subjectType" label="科类" width="100" />
        <el-table-column prop="score" label="分数" width="80" />
        <el-table-column prop="rank" label="位次" width="100" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">软删除</el-button>
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
            <el-descriptions-item label="分数">{{ detailData.score }}</el-descriptions-item>
            <el-descriptions-item label="位次">{{ detailData.rank }}</el-descriptions-item>
            <el-descriptions-item label="同分人数">{{ detailData.sameScoreCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="累计人数">{{ detailData.cumulativeCount ?? '-' }}</el-descriptions-item>
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
                <el-form-item label="分数" required>
                  <el-input-number v-model="formData.score" :min="0" :max="750" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="位次" required>
                  <el-input-number v-model="formData.rank" :min="0" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="同分人数">
                  <el-input-number v-model="formData.sameScoreCount" :min="0" :value-on-clear="null" style="width: 100%;" placeholder="选填" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="累计人数">
              <el-input-number v-model="formData.cumulativeCount" :min="0" :value-on-clear="null" style="width: 100%;" placeholder="选填" />
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
