<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getSubjectEvaluationPage,
  getSubjectEvaluationDetail,
  addSubjectEvaluation,
  updateSubjectEvaluation,
  updateSubjectEvaluationStatus,
  deleteSubjectEvaluation,
  hardDeleteSubjectEvaluation,
  batchDeleteSubjectEvaluation,
  batchHardDeleteSubjectEvaluation,
  importSubjectEvaluation,
} from '@/api/university/subject-evaluation'
import { getUniversityPage } from '@/api/university/info'
import type {
  SubjectEvaluationListVO,
  SubjectEvaluationDetailVO,
  SubjectEvaluationQueryDTO,
  SubjectEvaluationAddDTO,
  SubjectEvaluationUpdateDTO,
} from '@/types/university/subject-evaluation'
import { EVALUATION_GRADES } from '@/types/university/subject-evaluation'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<SubjectEvaluationListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const universityOptions = ref<{ label: string; value: number }[]>([])

const queryParams = reactive<SubjectEvaluationQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  disciplineCode: '',
  disciplineName: '',
  evaluationRound: '',
  evaluationGrade: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<SubjectEvaluationDetailVO | null>(null)

const formData = reactive<SubjectEvaluationAddDTO>({
  universityId: 0,
  disciplineCode: '',
  disciplineName: '',
  evaluationRound: '',
  evaluationGrade: '',
  sortOrder: undefined,
})

const editFormData = reactive<SubjectEvaluationUpdateDTO>({
  disciplineCode: '',
  disciplineName: '',
  evaluationRound: '',
  evaluationGrade: '',
  sortOrder: undefined,
  status: 1,
})

const getGradeTagType = (grade: string) => {
  if (['A+', 'A', 'A-'].includes(grade)) return 'success'
  if (['B+', 'B', 'B-'].includes(grade)) return 'warning'
  return 'info'
}

const fetchUniversityOptions = async () => {
  try {
    const res = await getUniversityPage({ page: 1, size: 1000 } as any)
    if (res.data.code === 200) {
      universityOptions.value = res.data.data.records.map((r: any) => ({
        label: r.name,
        value: r.id,
      }))
    }
  } catch {
    // silent
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.disciplineCode) params.disciplineCode = queryParams.disciplineCode
    if (queryParams.disciplineName) params.disciplineName = queryParams.disciplineName
    if (queryParams.evaluationRound) params.evaluationRound = queryParams.evaluationRound
    if (queryParams.evaluationGrade) params.evaluationGrade = queryParams.evaluationGrade
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getSubjectEvaluationPage(params as SubjectEvaluationQueryDTO)
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
  queryParams.universityName = ''
  queryParams.disciplineCode = ''
  queryParams.disciplineName = ''
  queryParams.evaluationRound = ''
  queryParams.evaluationGrade = ''
  queryParams.status = undefined
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

const handleSelectionChange = (selection: SubjectEvaluationListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增评估'
    formData.universityId = 0
    formData.disciplineCode = ''
    formData.disciplineName = ''
    formData.evaluationRound = ''
    formData.evaluationGrade = ''
    formData.sortOrder = undefined
    detailData.value = null
    await fetchUniversityOptions()
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改评估'
    formLoading.value = true
    try {
      const res = await getSubjectEvaluationDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        editFormData.disciplineCode = d.disciplineCode
        editFormData.disciplineName = d.disciplineName
        editFormData.evaluationRound = d.evaluationRound
        editFormData.evaluationGrade = d.evaluationGrade
        editFormData.sortOrder = d.sortOrder
        editFormData.status = d.status
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '评估详情'
    formLoading.value = true
    try {
      const res = await getSubjectEvaluationDetail(id)
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
  if (dialogMode.value === 'add') {
    if (!formData.universityId || !formData.disciplineCode || !formData.disciplineName || !formData.evaluationGrade) {
      ElMessage.warning('请填写完整信息')
      return
    }
    try {
      const res = await addSubjectEvaluation({
        universityId: formData.universityId,
        disciplineCode: formData.disciplineCode,
        disciplineName: formData.disciplineName,
        evaluationRound: formData.evaluationRound,
        evaluationGrade: formData.evaluationGrade,
        sortOrder: formData.sortOrder,
      })
      if (res.data.code === 200) {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    } catch {
      ElMessage.error('操作失败')
    }
  } else if (dialogMode.value === 'edit' && currentId.value) {
    if (!editFormData.disciplineCode || !editFormData.disciplineName || !editFormData.evaluationGrade) {
      ElMessage.warning('请填写完整信息')
      return
    }
    try {
      const res = await updateSubjectEvaluation(currentId.value, {
        disciplineCode: editFormData.disciplineCode,
        disciplineName: editFormData.disciplineName,
        evaluationRound: editFormData.evaluationRound,
        evaluationGrade: editFormData.evaluationGrade,
        sortOrder: editFormData.sortOrder,
        status: editFormData.status,
      })
      if (res.data.code === 200) {
        ElMessage.success('修改成功')
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    } catch {
      ElMessage.error('操作失败')
    }
  }
}

const handleToggleStatus = async (row: SubjectEvaluationListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该评估记录吗？`, '提示')
    const res = await updateSubjectEvaluationStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要禁用该评估记录吗？', '提示')
    const res = await deleteSubjectEvaluation(id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
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
    await ElMessageBox.confirm('确定要永久删除该评估记录吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteSubjectEvaluation(id)
    if (res.data.code === 200) {
      ElMessage.success('永久删除成功')
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
    ElMessage.warning('请先选择要禁用的评估记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要禁用选中的${selectedIds.value.length} 条评估记录吗？`, '提示')
    const res = await batchDeleteSubjectEvaluation(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量禁用成功')
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
    ElMessage.warning('请先选择要永久删除的评估记录')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 条评估记录吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteSubjectEvaluation(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量永久删除成功')
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
      const res = await importSubjectEvaluation(file)
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
    <!-- 搜索栏-->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="院校名称">
          <el-input
            v-model="queryParams.universityName"
            placeholder="模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="学科代码">
          <el-input
            v-model="queryParams.disciplineCode"
            placeholder="精确匹配"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="学科名称">
          <el-input
            v-model="queryParams.disciplineName"
            placeholder="模糊搜索"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="评估轮次">
          <el-input
            v-model="queryParams.evaluationRound"
            placeholder="精确匹配"
            clearable
            style="width: 120px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="评估等级">
          <el-select
            v-model="queryParams.evaluationGrade"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="g in EVALUATION_GRADES"
              :key="g"
              :label="g"
              :value="g"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮-->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增评估</el-button>
      <el-button @click="handleImport">导入Excel</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量禁用</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量永久删除</el-button>
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
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="universityName" label="院校名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="disciplineCode" label="学科代码" width="100" />
        <el-table-column prop="disciplineName" label="学科名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="evaluationRound" label="评估轮次" width="100" />
        <el-table-column prop="evaluationGrade" label="评估等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getGradeTagType(row.evaluationGrade)" size="small">
              {{ row.evaluationGrade }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="480" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.status === 1 ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">禁用</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id)">永久删除</el-button>
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
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="学科代码">{{ detailData.disciplineCode }}</el-descriptions-item>
            <el-descriptions-item label="学科名称">{{ detailData.disciplineName }}</el-descriptions-item>
            <el-descriptions-item label="评估轮次">{{ detailData.evaluationRound }}</el-descriptions-item>
            <el-descriptions-item label="评估等级">
              <el-tag :type="getGradeTagType(detailData.evaluationGrade)" size="small">
                {{ detailData.evaluationGrade }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="排序">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                {{ detailData.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增模式 -->
        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="院校" required>
              <el-select
                v-model="formData.universityId"
                placeholder="请选择院校"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in universityOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="学科代码" required>
              <el-input v-model="formData.disciplineCode" placeholder="请输入学科代码" maxlength="50" />
            </el-form-item>
            <el-form-item label="学科名称" required>
              <el-input v-model="formData.disciplineName" placeholder="请输入学科名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="评估轮次">
              <el-input v-model="formData.evaluationRound" placeholder="如：第五轮" maxlength="50" />
            </el-form-item>
            <el-form-item label="评估等级" required>
              <el-select v-model="formData.evaluationGrade" placeholder="请选择评估等级" style="width: 100%">
                <el-option
                  v-for="g in EVALUATION_GRADES"
                  :key="g"
                  :label="g"
                  :value="g"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 200px" />
            </el-form-item>
          </el-form>
        </template>

        <!-- 修改模式 -->
        <template v-if="dialogMode === 'edit'">
          <el-form :model="editFormData" label-width="100px">
            <el-form-item label="学科代码" required>
              <el-input v-model="editFormData.disciplineCode" placeholder="请输入学科代码" maxlength="50" />
            </el-form-item>
            <el-form-item label="学科名称" required>
              <el-input v-model="editFormData.disciplineName" placeholder="请输入学科名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="评估轮次">
              <el-input v-model="editFormData.evaluationRound" placeholder="如：第五轮" maxlength="50" />
            </el-form-item>
            <el-form-item label="评估等级" required>
              <el-select v-model="editFormData.evaluationGrade" placeholder="请选择评估等级" style="width: 100%">
                <el-option
                  v-for="g in EVALUATION_GRADES"
                  :key="g"
                  :label="g"
                  :value="g"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="editFormData.sortOrder" :min="0" style="width: 200px" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="editFormData.status" :active-value="1" :inactive-value="0" />
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
