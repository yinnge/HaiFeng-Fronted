<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getPostgradMajorPage,
  getPostgradMajorDetail,
  addPostgradMajor,
  updatePostgradMajor,
  updatePostgradMajorStatus,
  deletePostgradMajor,
  hardDeletePostgradMajor,
  batchSoftDeletePostgradMajor,
  batchHardDeletePostgradMajor,
  importPostgradMajor,
  restorePostgradMajor,
} from '@/api/major'
import type {
  PostgradMajorListVO,
  PostgradMajorDetailVO,
  PostgradMajorQueryDTO,
  PostgradMajorAddDTO,
  PostgradMajorUpdateDTO,
} from '@/types/major'

const loading = ref(false)
const tableData = ref<PostgradMajorListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<PostgradMajorQueryDTO>({
  page: 1,
  size: 10,
  majorName: '',
  degreeType: undefined as unknown as string,
  popularity: undefined as unknown as string,
  status: undefined as unknown as number,
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<PostgradMajorDetailVO | null>(null)

const formData = reactive<PostgradMajorAddDTO>({
  majorName: '',
  majorCode: '',
  degreeType: '',
  disciplineCategory: '',
  popularity: '',
  difficulty: '',
  brief: '',
  introduction: '',
  examSubjects: [],
  admissionRequirements: [],
  crossExamDifficulty: '',
  crossExamDescription: '',
  crossExamFactors: [],
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.majorName) params.majorName = queryParams.majorName
    if (queryParams.degreeType) params.degreeType = queryParams.degreeType
    if (queryParams.popularity) params.popularity = queryParams.popularity
    if (queryParams.status !== undefined && queryParams.status !== null && queryParams.status !== (undefined as unknown as number)) params.status = queryParams.status
    const res = await getPostgradMajorPage(params as PostgradMajorQueryDTO)
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
  queryParams.majorName = ''
  queryParams.degreeType = undefined as unknown as string
  queryParams.popularity = undefined as unknown as string
  queryParams.status = undefined as unknown as number
  queryParams.page = 1; fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (rows: PostgradMajorListVO[]) => { selectedIds.value = rows.map(r => r.id) }

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增考研专业'
    formData.majorName = ''
    formData.majorCode = ''
    formData.degreeType = ''
    formData.disciplineCategory = ''
    formData.popularity = ''
    formData.difficulty = ''
    formData.brief = ''
    formData.introduction = ''
    formData.examSubjects = []
    formData.admissionRequirements = []
    formData.crossExamDifficulty = ''
    formData.crossExamDescription = ''
    formData.crossExamFactors = []
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改考研专业'
    formLoading.value = true
    try {
      const res = await getPostgradMajorDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.majorName = d.majorName
        formData.majorCode = d.majorCode
        formData.degreeType = d.degreeType
        formData.disciplineCategory = d.disciplineCategory
        formData.popularity = d.popularity || ''
        formData.difficulty = d.difficulty || ''
        formData.brief = d.brief || ''
        formData.introduction = d.introduction || ''
        formData.examSubjects = d.examSubjects || []
        formData.admissionRequirements = d.admissionRequirements || []
        formData.crossExamDifficulty = d.crossExamDifficulty || ''
        formData.crossExamDescription = d.crossExamDescription || ''
        formData.crossExamFactors = d.crossExamFactors || []
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '考研专业详情'
    formLoading.value = true
    try {
      const res = await getPostgradMajorDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.majorName || !formData.majorCode || !formData.degreeType || !formData.disciplineCategory) {
    ElMessage.warning('请填写专业名称、专业代码、学位类型和学科门类')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: PostgradMajorAddDTO = {
        majorName: formData.majorName,
        majorCode: formData.majorCode,
        degreeType: formData.degreeType,
        disciplineCategory: formData.disciplineCategory,
      }
      if (formData.popularity) data.popularity = formData.popularity
      if (formData.difficulty) data.difficulty = formData.difficulty
      if (formData.brief) data.brief = formData.brief
      if (formData.introduction) data.introduction = formData.introduction
      if (formData.examSubjects && formData.examSubjects.length > 0) data.examSubjects = formData.examSubjects
      if (formData.admissionRequirements && formData.admissionRequirements.length > 0) data.admissionRequirements = formData.admissionRequirements
      if (formData.crossExamDifficulty) data.crossExamDifficulty = formData.crossExamDifficulty
      if (formData.crossExamDescription) data.crossExamDescription = formData.crossExamDescription
      if (formData.crossExamFactors && formData.crossExamFactors.length > 0) data.crossExamFactors = formData.crossExamFactors
      res = await addPostgradMajor(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: PostgradMajorUpdateDTO = {
        majorName: formData.majorName,
        majorCode: formData.majorCode,
        degreeType: formData.degreeType,
        disciplineCategory: formData.disciplineCategory,
      }
      if (formData.popularity) data.popularity = formData.popularity
      if (formData.difficulty) data.difficulty = formData.difficulty
      if (formData.brief) data.brief = formData.brief
      if (formData.introduction) data.introduction = formData.introduction
      if (formData.examSubjects && formData.examSubjects.length > 0) data.examSubjects = formData.examSubjects
      if (formData.admissionRequirements && formData.admissionRequirements.length > 0) data.admissionRequirements = formData.admissionRequirements
      if (formData.crossExamDifficulty) data.crossExamDifficulty = formData.crossExamDifficulty
      if (formData.crossExamDescription) data.crossExamDescription = formData.crossExamDescription
      if (formData.crossExamFactors && formData.crossExamFactors.length > 0) data.crossExamFactors = formData.crossExamFactors
      res = await updatePostgradMajor(currentId.value, data)
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

const handleToggleStatus = async (row: PostgradMajorListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该考研专业吗？`, '提示')
    const res = await updatePostgradMajorStatus(row.id, newStatus)
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要软删除该考研专业吗？软删除后可恢复。', '确认软删除')
    const res = await deletePostgradMajor(id)
    if (res.data.code === 200) { ElMessage.success('软删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该考研专业吗？此操作不可恢复！', '确认删除', { type: 'warning' })
    const res = await hardDeletePostgradMajor(id)
    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要恢复该考研专业吗？', '提示')
    const res = await restorePostgradMajor(id)
    if (res.data.code === 200) { ElMessage.success('恢复成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleBatchSoftDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要操作的记录'); return }
  try {
    await ElMessageBox.confirm(`确定批量禁用选中的${selectedIds.value.length} 条记录吗？禁用后可恢复。`, '确认批量禁用')
    const res = await batchSoftDeletePostgradMajor({ ids: selectedIds.value as unknown as number[] })
    if (res.data.code === 200) { ElMessage.success('批量禁用成功'); fetchData() }
    else { ElMessage.error(res.data.msg || '操作失败') }
  } catch { /* 取消 */ }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要操作的记录'); return }
  try {
    await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length} 条记录吗？此操作不可恢复！`, '确认批量删除', { type: 'warning' })
    const res = await batchHardDeletePostgradMajor({ ids: selectedIds.value as unknown as number[] })
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
      const res = await importPostgradMajor(file)
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

const addArrayItem = (arr: string[] | undefined) => { if (arr) arr.push('') }
const removeArrayItem = (arr: string[] | undefined, index: number) => { if (arr) arr.splice(index, 1) }
const arrOrEmpty = (arr: string[] | undefined): string[] => arr || []

const statusTag = (status: number) => status === 1 ? 'success' : 'info'
const statusLabel = (status: number) => status === 1 ? '启用' : '禁用'

const popularityTag = (v: string | null) => v === '热门' ? 'danger' : v === '一般' ? 'warning' : 'info'
const difficultyTag = (v: string | null) => v === '高' ? 'danger' : v === '中' ? 'warning' : 'info'

const popularityPillClass = (v: string | null) => v === '热门' ? 'status-hot' : v === '一般' ? 'status-warn' : 'status-info'
const difficultyPillClass = (v: string | null) => v === '高' ? 'status-hard' : v === '中' ? 'status-mid' : 'status-low'

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-wrap">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <div class="page-header">
      <h2 class="page-title">考研专业管理</h2>
      <p class="page-subtitle">管理研究生考试专业信息，包括考试科目、录取条件与跨考分析</p>
    </div>

    <div class="search-card">
      <div class="section-label">筛选条件</div>
      <el-form :model="queryParams" inline>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.majorName" placeholder="名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="学位类型">
          <el-select v-model="queryParams.degreeType" placeholder="全部" clearable style="width: 140px">
            <el-option label="学术学位" value="学术学位" />
            <el-option label="专业学位" value="专业学位" />
          </el-select>
        </el-form-item>
        <el-form-item label="热门程度">
          <el-select v-model="queryParams.popularity" placeholder="全部" clearable style="width: 120px">
            <el-option label="热门" value="热门" />
            <el-option label="一般" value="一般" />
            <el-option label="冷门" value="冷门" />
          </el-select>
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
        <el-button class="btn-add" @click="openDialog('add')">+ 新增考研专业</el-button>
        <el-button class="btn-outline" @click="handleImport">导入考研专业</el-button>
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
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="majorName" label="专业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="majorCode" label="专业代码" width="90" />
        <el-table-column prop="degreeType" label="学位类型" width="100" />
        <el-table-column prop="disciplineCategory" label="学科门类" width="90" />
        <el-table-column prop="popularity" label="热门程度" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.popularity" class="status-pill" :class="popularityPillClass(row.popularity)">{{ row.popularity }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度等级" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.difficulty" class="status-pill" :class="difficultyPillClass(row.difficulty)">{{ row.difficulty }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <span class="action-link" @click="openDialog('detail', row.id)">详情</span>
            <span class="action-link" @click="openDialog('edit', row.id)">修改</span>
            <span v-if="row.status === 1" class="action-link" @click="handleToggleStatus(row)">禁用</span>
            <span v-else class="action-link" @click="handleRestore(row.id)">恢复</span>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false" class="uni-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border class="uni-descriptions">
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="专业代码">{{ detailData.majorCode }}</el-descriptions-item>
            <el-descriptions-item label="学位类型">{{ detailData.degreeType }}</el-descriptions-item>
            <el-descriptions-item label="学科门类">{{ detailData.disciplineCategory }}</el-descriptions-item>
            <el-descriptions-item label="热门程度">{{ detailData.popularity || '-' }}</el-descriptions-item>
            <el-descriptions-item label="难度等级">{{ detailData.difficulty || '-' }}</el-descriptions-item>
            <el-descriptions-item label="跨考难度">{{ detailData.crossExamDifficulty || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
                {{ statusLabel(detailData.status) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="专业简介" :span="2">{{ detailData.brief || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细介绍" :span="2">{{ detailData.introduction || '-' }}</el-descriptions-item>
            <el-descriptions-item label="跨考说明" :span="2">{{ detailData.crossExamDescription || '-' }}</el-descriptions-item>
            <el-descriptions-item label="考试科目">
              <div v-if="detailData.examSubjects && detailData.examSubjects.length">
                <el-tag v-for="(item, i) in detailData.examSubjects" :key="i" size="small" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="录取条件">
              <div v-if="detailData.admissionRequirements && detailData.admissionRequirements.length">
                <el-tag v-for="(item, i) in detailData.admissionRequirements" :key="i" size="small" type="success" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="跨考因素">
              <div v-if="detailData.crossExamFactors && detailData.crossExamFactors.length">
                <el-tag v-for="(item, i) in detailData.crossExamFactors" :key="i" size="small" type="warning" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode === 'add' || dialogMode === 'edit'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="专业名称" required>
              <el-input v-model="formData.majorName" placeholder="请输入专业名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="专业代码" required>
              <el-input v-model="formData.majorCode" placeholder="请输入专业代码" maxlength="20" />
            </el-form-item>
            <el-form-item label="学位类型" required>
              <el-select v-model="formData.degreeType" placeholder="请选择" style="width: 200px">
                <el-option label="学术学位" value="学术学位" />
                <el-option label="专业学位" value="专业学位" />
              </el-select>
            </el-form-item>
            <el-form-item label="学科门类" required>
              <el-input v-model="formData.disciplineCategory" placeholder="如：工学、理学" maxlength="50" />
            </el-form-item>
            <el-form-item label="热门程度">
              <el-select v-model="formData.popularity" placeholder="请选择" clearable style="width: 140px">
                <el-option label="热门" value="热门" />
                <el-option label="一般" value="一般" />
                <el-option label="冷门" value="冷门" />
              </el-select>
            </el-form-item>
            <el-form-item label="难度等级">
              <el-select v-model="formData.difficulty" placeholder="请选择" clearable style="width: 140px">
                <el-option label="高" value="高" />
                <el-option label="中" value="中" />
                <el-option label="低" value="低" />
              </el-select>
            </el-form-item>
            <el-form-item label="跨考难度">
              <el-select v-model="formData.crossExamDifficulty" placeholder="请选择" clearable style="width: 140px">
                <el-option label="较易" value="较易" />
                <el-option label="中等" value="中等" />
                <el-option label="较难" value="较难" />
              </el-select>
            </el-form-item>
            <el-form-item label="专业简介">
              <el-input v-model="formData.brief" type="textarea" :rows="2" placeholder="请输入简短介绍" />
            </el-form-item>
            <el-form-item label="详细介绍">
              <el-input v-model="formData.introduction" type="textarea" :rows="3" placeholder="请输入详细介绍" />
            </el-form-item>
            <el-form-item label="跨考说明">
              <el-input v-model="formData.crossExamDescription" type="textarea" :rows="2" placeholder="请输入跨考说明" />
            </el-form-item>
            <el-form-item label="考试科目">
              <div v-for="(item, index) in arrOrEmpty(formData.examSubjects)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.examSubjects![index]" placeholder="请输入考试科目" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.examSubjects, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.examSubjects)">+ 添加考试科目</el-button>
            </el-form-item>
            <el-form-item label="录取条件">
              <div v-for="(item, index) in arrOrEmpty(formData.admissionRequirements)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.admissionRequirements![index]" placeholder="请输入录取条件" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.admissionRequirements, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.admissionRequirements)">+ 添加录取条件</el-button>
            </el-form-item>
            <el-form-item label="跨考因素">
              <div v-for="(item, index) in arrOrEmpty(formData.crossExamFactors)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.crossExamFactors![index]" placeholder="请输入跨考因素" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.crossExamFactors, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.crossExamFactors)">+ 添加跨考因素</el-button>
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-outline" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
          <el-button v-if="dialogMode !== 'detail'" class="btn-add" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
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

.table-card :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.table-card :deep(.el-table__header th .cell) {
  color: #1f2937;
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
.status-hot {
  background: #FEE2E2;
  color: #DC2626;
}
.status-warn {
  background: #FEF3C7;
  color: #D97706;
}
.status-info {
  background: #F3F4F6;
  color: #6B7280;
}
.status-hard {
  background: #FEE2E2;
  color: #DC2626;
}
.status-mid {
  background: #FEF3C7;
  color: #D97706;
}
.status-low {
  background: #DCFCE7;
  color: #15803D;
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

.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #F97316;
  padding-bottom: 16px;
  margin-bottom: 20px;
}
.uni-dialog :deep(.el-dialog__title) {
  font-size: 17px;
  font-weight: 600;
  color: #9A3412;
}

.uni-descriptions :deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5) !important;
  color: #9A3412 !important;
  font-weight: 500;
}

.uni-dialog :deep(.el-form-item__label) {
  color: #9A3412;
  font-weight: 500;
}
.uni-dialog :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-textarea__inner:focus) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316;
}
.uni-dialog :deep(.el-input-number .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
