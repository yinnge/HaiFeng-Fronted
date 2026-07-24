<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getScorePage,
  getScoreDetail,
  addScore,
  updateScore,
  toggleScoreStatus,
  deleteScore,
  batchDeleteScore,
} from '@/api/special/strong-base-score'
import type {
  StrongBaseScoreListVO,
  StrongBaseScoreDetailVO,
  StrongBaseScoreQueryDTO,
  StrongBaseScoreAddDTO,
  StrongBaseScoreUpdateDTO,
} from '@/types/special/strong-base-score'

const loading = ref(false)
const tableData = ref<StrongBaseScoreListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<StrongBaseScoreQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  year: undefined,
  province: '',
  subjectType: undefined,
})

const subjectTypeOptions = [
  { label: '物理类', value: '物理类' },
  { label: '历史类', value: '历史类' },
  { label: '理科', value: '理科' },
  { label: '文科', value: '文科' },
  { label: '综合改革', value: '综合改革' },
]

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<StrongBaseScoreDetailVO | null>(null)

const formData = reactive<StrongBaseScoreAddDTO>({
  universityId: '',
  universityName: '',
  year: undefined,
  province: '',
  subjectType: '',
  majorName: '',
  majorCode: '',
  entryScore: undefined,
  entryScoreType: '高考成绩',
  entryFormula: '',
  entryRatio: '',
  admissionScore: undefined,
  admissionFormula: '',
  planCount: undefined,
  admissionCount: undefined,
  remark: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.year) params.year = queryParams.year
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.subjectType) params.subjectType = queryParams.subjectType
    const res = await getScorePage(params as StrongBaseScoreQueryDTO)
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
  queryParams.year = undefined
  queryParams.province = ''
  queryParams.subjectType = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: StrongBaseScoreListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增数据'
    formData.universityId = ''
    formData.universityName = ''
    formData.year = undefined
    formData.province = ''
    formData.subjectType = ''
    formData.majorName = ''
    formData.majorCode = ''
    formData.entryScore = undefined
    formData.entryScoreType = '高考成绩'
    formData.entryFormula = ''
    formData.entryRatio = ''
    formData.admissionScore = undefined
    formData.admissionFormula = ''
    formData.planCount = undefined
    formData.admissionCount = undefined
    formData.remark = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改数据'
    formLoading.value = true
    try {
      const res = await getScoreDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.universityId = d.universityId
        formData.universityName = d.universityName
        formData.year = d.year
        formData.province = d.province
        formData.subjectType = d.subjectType
        formData.majorName = d.majorName
        formData.majorCode = d.majorCode || ''
        formData.entryScore = d.entryScore ?? undefined
        formData.entryScoreType = d.entryScoreType || '高考成绩'
        formData.entryFormula = d.entryFormula || ''
        formData.entryRatio = d.entryRatio || ''
        formData.admissionScore = d.admissionScore ?? undefined
        formData.admissionFormula = d.admissionFormula || ''
        formData.planCount = d.planCount ?? undefined
        formData.admissionCount = d.admissionCount ?? undefined
        formData.remark = d.remark || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '数据详情'
    formLoading.value = true
    try {
      const res = await getScoreDetail(id)
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
  if (!formData.universityId || !formData.universityName || !formData.year || !formData.province || !formData.subjectType || !formData.majorName) {
    ElMessage.warning('请填写必填字段')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addScore(formData as StrongBaseScoreAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateScore(currentId.value, formData as StrongBaseScoreUpdateDTO)
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

const handleToggleStatus = async (row: StrongBaseScoreListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该数据吗？`, '提示')
    const res = await toggleScoreStatus(row.id)
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该数据吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteScore(id)
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
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条数据吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteScore(selectedIds.value)
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

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="大学名称">
          <el-input
            v-model="queryParams.universityName"
            placeholder="大学名称模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number
            v-model="queryParams.year"
            :min="2000"
            :max="2099"
            controls-position="right"
            style="width: 130px"
            placeholder="年份"
          />
        </el-form-item>
        <el-form-item label="省份">
          <el-input
            v-model="queryParams.province"
            placeholder="输入省份"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="科类">
          <el-select
            v-model="queryParams.subjectType"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in subjectTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增数据</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
      </el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="universityName" label="大学名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="year" label="年份" width="80" align="center" />
        <el-table-column prop="province" label="省份" width="100" align="center" />
        <el-table-column prop="subjectType" label="科类" width="100" align="center" />
        <el-table-column prop="majorName" label="专业名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.isActive ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
            </el-button>
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

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="750px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="大学ID" :span="1">{{ detailData.universityId }}</el-descriptions-item>
            <el-descriptions-item label="大学名称" :span="1">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="年份" :span="1">{{ detailData.year }}</el-descriptions-item>
            <el-descriptions-item label="省份" :span="1">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="科类" :span="1">{{ detailData.subjectType }}</el-descriptions-item>
            <el-descriptions-item label="专业名称" :span="1">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="专业代码">{{ detailData.majorCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围分数类型">{{ detailData.entryScoreType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围分数线" :span="1">{{ detailData.entryScore ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围公式" :span="1">{{ detailData.entryFormula || '-' }}</el-descriptions-item>
            <el-descriptions-item label="入围比例">{{ detailData.entryRatio || '-' }}</el-descriptions-item>
            <el-descriptions-item label="录取综合分">{{ detailData.admissionScore ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="录取公式" :span="2">{{ detailData.admissionFormula || '-' }}</el-descriptions-item>
            <el-descriptions-item label="计划数">{{ detailData.planCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="录取数">{{ detailData.admissionCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.isActive ? 'success' : 'info'" size="small">
                {{ detailData.isActive ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="大学ID" required>
              <el-input-number v-model="formData.universityId" :min="1" style="width: 200px" />
            </el-form-item>
            <el-form-item label="大学名称" required>
              <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="年份" required>
              <el-input-number v-model="formData.year" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
            </el-form-item>
            <el-form-item label="省份" required>
              <el-input v-model="formData.province" placeholder="请输入省份" maxlength="20" />
            </el-form-item>
            <el-form-item label="科类" required>
              <el-select v-model="formData.subjectType" placeholder="请选择" style="width: 200px">
                <el-option
                  v-for="opt in subjectTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="专业名称" required>
              <el-input v-model="formData.majorName" placeholder="请输入专业名称" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="专业代码">
              <el-input v-model="formData.majorCode" placeholder="请输入专业代码" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="入围分数线">
              <el-input-number v-model="formData.entryScore" :precision="2" :min="0" :max="750" style="width: 160px" />
            </el-form-item>
            <el-form-item label="入围类型">
              <el-input v-model="formData.entryScoreType" placeholder="默认：高考成绩" maxlength="30" style="width: 200px" />
            </el-form-item>
            <el-form-item label="入围公式">
              <el-input v-model="formData.entryFormula" placeholder="入围计算公式" maxlength="500" />
            </el-form-item>
            <el-form-item label="入围比例">
              <el-input v-model="formData.entryRatio" placeholder="如 1:5" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="录取综合分">
              <el-input-number v-model="formData.admissionScore" :precision="2" :min="0" :max="100" style="width: 160px" />
            </el-form-item>
            <el-form-item label="录取公式">
              <el-input v-model="formData.admissionFormula" placeholder="录取综合分公式" maxlength="500" />
            </el-form-item>
            <el-form-item label="计划数">
              <el-input-number v-model="formData.planCount" :min="0" style="width: 160px" />
            </el-form-item>
            <el-form-item label="录取数">
              <el-input-number v-model="formData.admissionCount" :min="0" style="width: 160px" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                placeholder="备注信息"
                maxlength="500"
                show-word-limit
              />
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
