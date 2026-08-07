<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getMajorPage,
  getMajorDetail,
  addMajor,
  updateMajor,
  updateMajorDetail,
  updateMajorStatus,
  deleteMajor,
  hardDeleteMajor,
  batchSoftDeleteMajor,
  batchHardDeleteMajor,
  importMajor,
  importMajorDetail,
  restoreMajor,
} from '@/api/major'
import type {
  MajorListVO,
  MajorDetailVO,
  MajorQueryDTO,
  MajorAddDTO,
  MajorUpdateDTO,
  MajorDetailUpdateDTO,
} from '@/types/major'

const loading = ref(false)
const tableData = ref<MajorListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<MajorQueryDTO>({
  page: 1,
  size: 10,
  majorCode: '',
  majorName: '',
  majorType: undefined as unknown as string,
  status: undefined as unknown as number,
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const activeEditTab = ref<'basic' | 'detail'>('basic')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<MajorDetailVO | null>(null)

const formData = reactive<MajorAddDTO>({
  majorCode: '',
  majorName: '',
  majorType: '',
  disciplineName: '',
  majorCategory: '',
  parentCategory: '',
  majorTags: '',
  degreeAwarded: '',
  studyDuration: '',
  employmentRate: undefined,
  salaryMin: undefined,
  salaryMax: undefined,
  description: '',
})

const detailFormData = reactive<MajorDetailUpdateDTO>({
  courseCount: undefined,
  graduateScale: '',
  maleRatio: undefined,
  femaleRatio: undefined,
  majorDescription: '',
  trainingObjective: '',
  trainingRequirement: '',
  subjectRequirement: '',
  careerProspect: '',
})
// 数组型字段用独立 ref，保证 v-for + v-model 回填万无一失（规避嵌套 reactive 数组重赋值 + 模板内 ! 断言的响应式陷阱）
const courseList = ref<string[]>([])
const skillList = ref<string[]>([])

/** 重置「专业详情」tab（新增时必须调用，否则会残留上一次修改留下的脏数据） */
const resetDetailForm = () => {
  detailFormData.courseCount = undefined
  detailFormData.graduateScale = ''
  detailFormData.maleRatio = undefined
  detailFormData.femaleRatio = undefined
  detailFormData.majorDescription = ''
  detailFormData.trainingObjective = ''
  detailFormData.trainingRequirement = ''
  detailFormData.subjectRequirement = ''
  detailFormData.careerProspect = ''
  courseList.value = []
  skillList.value = []
}

/** 「专业详情」tab 是否填了内容（新增时用于决定要不要额外调详情接口） */
const hasDetailInput = () =>
  detailFormData.courseCount != null ||
  !!detailFormData.graduateScale ||
  detailFormData.maleRatio != null ||
  detailFormData.femaleRatio != null ||
  !!detailFormData.majorDescription ||
  !!detailFormData.trainingObjective ||
  !!detailFormData.trainingRequirement ||
  !!detailFormData.subjectRequirement ||
  !!detailFormData.careerProspect ||
  courseList.value.some(s => s.trim()) ||
  skillList.value.some(s => s.trim())

/**
 * 组装专业详情 DTO。
 * 文本字段一律下发（含空串）——后端是 `if (dto.getXxx() != null)` 增量更新，
 * 若前端把空串过滤掉，用户「清空某字段再保存」会被静默忽略，看起来像没保存成功。
 */
const buildDetailDto = (): MajorDetailUpdateDTO => {
  const dto: MajorDetailUpdateDTO = {}
  if (detailFormData.courseCount != null) dto.courseCount = detailFormData.courseCount
  if (detailFormData.maleRatio != null) dto.maleRatio = detailFormData.maleRatio
  if (detailFormData.femaleRatio != null) dto.femaleRatio = detailFormData.femaleRatio
  dto.graduateScale = detailFormData.graduateScale ?? ''
  dto.majorDescription = detailFormData.majorDescription ?? ''
  dto.trainingObjective = detailFormData.trainingObjective ?? ''
  dto.trainingRequirement = detailFormData.trainingRequirement ?? ''
  dto.subjectRequirement = detailFormData.subjectRequirement ?? ''
  dto.careerProspect = detailFormData.careerProspect ?? ''
  dto.mainCourses = courseList.value.map(s => s.trim()).filter(Boolean)
  dto.knowledgeSkills = skillList.value.map(s => s.trim()).filter(Boolean)
  return dto
}

/** 组装基本资料 DTO（同上：可空文本字段一律下发，保证能清空） */
const buildBasicUpdateDto = (): MajorUpdateDTO => {
  const dto: MajorUpdateDTO = {}
  if (formData.majorName) dto.majorName = formData.majorName
  if (formData.majorType) dto.majorType = formData.majorType
  dto.disciplineName = formData.disciplineName ?? ''
  dto.majorCategory = formData.majorCategory ?? ''
  dto.parentCategory = formData.parentCategory ?? ''
  dto.majorTags = formData.majorTags ?? ''
  dto.degreeAwarded = formData.degreeAwarded ?? ''
  dto.studyDuration = formData.studyDuration ?? ''
  dto.description = formData.description ?? ''
  if (formData.employmentRate != null) dto.employmentRate = formData.employmentRate
  if (formData.salaryMin != null) dto.salaryMin = formData.salaryMin
  if (formData.salaryMax != null) dto.salaryMax = formData.salaryMax
  return dto
}

/**
 * 按专业代码回查记录 ID。
 * 后端 POST /major 返回的是原始 Long（雪花 ID 19 位，超出 JS 安全整数 2^53-1），
 * 直接用 res.data.data 会丢精度导致后续接口 404，因此改为回查列表拿字符串 ID。
 */
const findMajorIdByCode = async (majorCode: string): Promise<string | null> => {
  try {
    const res = await getMajorPage({ page: 1, size: 10, majorCode } as MajorQueryDTO)
    if (res.data.code === 200) {
      return res.data.data.records.find(r => r.majorCode === majorCode)?.id ?? null
    }
  } catch {
    // 回查失败按未找到处理
  }
  return null
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.majorCode) params.majorCode = queryParams.majorCode
    if (queryParams.majorName) params.majorName = queryParams.majorName
    if (queryParams.majorType) params.majorType = queryParams.majorType
    if (queryParams.status !== undefined && queryParams.status !== null && queryParams.status !== (undefined as unknown as number)) params.status = queryParams.status
    const res = await getMajorPage(params as MajorQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.majorCode = ''
  queryParams.majorName = ''
  queryParams.majorType = undefined as unknown as string
  queryParams.status = undefined as unknown as number
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (rows: MajorListVO[]) => {
  selectedIds.value = rows.map(r => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增专业'
    formData.majorCode = ''
    formData.majorName = ''
    formData.majorType = ''
    formData.disciplineName = ''
    formData.majorCategory = ''
    formData.parentCategory = ''
    formData.majorTags = ''
    formData.degreeAwarded = ''
    formData.studyDuration = ''
    formData.employmentRate = undefined
    formData.salaryMin = undefined
    formData.salaryMax = undefined
    formData.description = ''
    // 详情 tab 也要一并清空，否则会残留上一次「修改」时回填的数据
    resetDetailForm()
    activeEditTab.value = 'basic'
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改专业'
    activeEditTab.value = 'basic'
    formLoading.value = true
    try {
      const res = await getMajorDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        // 基本资料
        formData.majorCode = d.majorCode
        formData.majorName = d.majorName
        formData.majorType = d.majorType
        formData.disciplineName = d.disciplineName || ''
        formData.majorCategory = d.majorCategory || ''
        formData.parentCategory = d.parentCategory || ''
        formData.majorTags = d.majorTags || ''
        formData.degreeAwarded = d.degreeAwarded || ''
        formData.studyDuration = d.studyDuration || ''
        formData.employmentRate = d.employmentRate ?? undefined
        formData.salaryMin = d.salaryMin ?? undefined
        formData.salaryMax = d.salaryMax ?? undefined
        formData.description = d.description || ''
        // 专业详情
        detailFormData.courseCount = d.courseCount ?? undefined
        // 后端 VO 里 graduateScale 是 Integer（写入 DTO 却是 String），这里统一转成字符串再回填
        detailFormData.graduateScale = d.graduateScale != null ? String(d.graduateScale) : ''
        detailFormData.maleRatio = d.maleRatio ?? undefined
        detailFormData.femaleRatio = d.femaleRatio ?? undefined
        detailFormData.majorDescription = d.majorDescription || ''
        detailFormData.trainingObjective = d.trainingObjective || ''
        detailFormData.trainingRequirement = d.trainingRequirement || ''
        detailFormData.subjectRequirement = d.subjectRequirement || ''
        detailFormData.careerProspect = d.careerProspect || ''
        // 数组字段：用顶层 ref 直接承接，保证回显
        courseList.value = d.mainCourses && d.mainCourses.length ? [...d.mainCourses] : []
        skillList.value = d.knowledgeSkills && d.knowledgeSkills.length ? [...d.knowledgeSkills] : []
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '专业详情'
    formLoading.value = true
    try {
      const res = await getMajorDetail(id)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.majorCode || !formData.majorName || !formData.majorType) {
    ElMessage.warning('请填写专业代码、专业名称和专业类型')
    return
  }

  try {
    if (dialogMode.value === 'add') {
      // 1) 先建主表（后端 add 接口只接收基本资料，不含详情字段）
      const data: MajorAddDTO = {
        majorCode: formData.majorCode,
        majorName: formData.majorName,
        majorType: formData.majorType,
      }
      if (formData.disciplineName) data.disciplineName = formData.disciplineName
      if (formData.majorCategory) data.majorCategory = formData.majorCategory
      if (formData.parentCategory) data.parentCategory = formData.parentCategory
      if (formData.majorTags) data.majorTags = formData.majorTags
      if (formData.degreeAwarded) data.degreeAwarded = formData.degreeAwarded
      if (formData.studyDuration) data.studyDuration = formData.studyDuration
      if (formData.employmentRate != null) data.employmentRate = formData.employmentRate
      if (formData.salaryMin != null) data.salaryMin = formData.salaryMin
      if (formData.salaryMax != null) data.salaryMax = formData.salaryMax
      if (formData.description) data.description = formData.description
      const res = await addMajor(data)
      if (res.data.code !== 200) {
        ElMessage.error(res.data.msg || '新增失败')
        return
      }

      // 2) 「专业详情」tab 有内容时，回查新记录 ID 再补写详情表
      if (hasDetailInput()) {
        const newId = await findMajorIdByCode(formData.majorCode)
        if (!newId) {
          ElMessage.warning('专业已创建，但未能定位新记录，专业详情未保存，请在列表中点「修改」补充')
        } else {
          const res2 = await updateMajorDetail(newId, buildDetailDto())
          if (res2.data.code !== 200) {
            ElMessage.warning(`专业已创建，但专业详情保存失败：${res2.data.msg || '未知错误'}`)
            dialogVisible.value = false
            fetchData()
            return
          }
        }
      }

      ElMessage.success('新增成功')
      dialogVisible.value = false
      fetchData()
    } else if (dialogMode.value === 'edit' && currentId.value) {
      // 1) 保存基本资料
      const res = await updateMajor(currentId.value, buildBasicUpdateDto())
      if (res.data.code !== 200) {
        ElMessage.error(res.data.msg || '保存基本资料失败')
        return
      }
      // 2) 保存专业详情（含主要课程 / 知识技能）——与基本资料同一次提交，切换 tab 不会丢
      const res2 = await updateMajorDetail(currentId.value, buildDetailDto())
      if (res2.data.code !== 200) {
        ElMessage.error(res2.data.msg || '保存专业详情失败')
        return
      }

      ElMessage.success('修改成功')
      dialogVisible.value = false
      fetchData()
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

const handleToggleStatus = async (row: MajorListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该专业吗？`, '提示')
    const res = await updateMajorStatus(row.id, newStatus)
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
    await ElMessageBox.confirm('确定要软删除该专业吗？软删除后可恢复。', '确认软删除', {
      confirmButtonText: '确定软删除',
      cancelButtonText: '取消',
    })
    const res = await deleteMajor(id)
    if (res.data.code === 200) {
      ElMessage.success('软删除成功'),
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该专业吗？此操作不可恢复！', '确认删除', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteMajor(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleRestore = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要恢复该专业吗？', '提示')
    const res = await restoreMajor(id)
    if (res.data.code === 200) {
      ElMessage.success('恢复成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchSoftDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的专业')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定批量禁用选中的${selectedIds.value.length} 条记录吗？禁用后可恢复。`,
      '确认批量禁用',
    )
    const res = await batchSoftDeleteMajor({ ids: selectedIds.value as unknown as number[] })
    if (res.data.code === 200) {
      ElMessage.success('批量禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要操作的专业')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定删除选中的${selectedIds.value.length} 条记录吗？此操作不可恢复！`,
      '确认批量删除',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchHardDeleteMajor({ ids: selectedIds.value as unknown as number[] })
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleImport = async (type: 'main' | 'detail') => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = type === 'main' ? await importMajor(file) : await importMajorDetail(file)
      if (res.data.code === 200 && res.data.data) {
        const { total: t, success: s, failed: f, errors } = res.data.data
        if (f > 0) {
          ElMessage.warning(`导入完成：共 ${t} 条，成功 ${s} 条，失败 ${f} 条\n${errors?.join('\n') || ''}`)
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
  <div class="page-x">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <div class="page-header">
      <h2 class="page-title">专业管理</h2>
      <p class="page-subtitle">管理本科与专科专业信息，包括基本信息与详细信息维护</p>
    </div>

    <div class="search-card">
      <div class="section-label">筛选条件</div>
      <el-form class="search-form" :model="queryParams" inline>

        <div class="filter-fields">
        <el-form-item label="专业代码">
          <el-input v-model="queryParams.majorCode" placeholder="专业代码" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="专业名称">
          <el-input v-model="queryParams.majorName" placeholder="专业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="专业类型">
          <el-select v-model="queryParams.majorType" placeholder="全部" clearable style="width: 120px">
            <el-option label="本科" value="本科" />
            <el-option label="专科" value="专科" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        </div>

        <div class="search-actions">
          <el-button class="search-btn" @click="handleSearch">查询</el-button>
          <el-button class="reset-btn" @click="handleReset">重置</el-button>
        </div>
      </el-form>
    </div>

    <div class="action-bar">
      <div class="action-left">
        <el-button class="btn-primary" @click="openDialog('add')">+ 新增专业</el-button>
        <el-button class="btn-outline" @click="handleImport('main')">导入专业主表</el-button>
        <el-button class="btn-outline" @click="handleImport('detail')">导入专业详情</el-button>
      </div>
      <div class="action-right">
        <el-button class="btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchSoftDelete">批量禁用</el-button>
        <el-button class="btn-danger-solid" :disabled="selectedIds.length === 0" @click="handleBatchHardDelete">批量删除</el-button>
        <el-button class="btn-outline" @click="fetchData">刷新</el-button>
      </div>
    </div>

    <div class="table-card">
      <div class="custom-table">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="majorCode" label="专业代码" min-width="100" />
        <el-table-column prop="majorName" label="专业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="majorCategory" label="学科门类" min-width="100" />
        <el-table-column prop="majorType" label="专业类型" min-width="80" />
        <el-table-column prop="studyDuration" label="学制" min-width="80" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <span class="action-btn action-detail" @click="openDialog('detail', row.id)">详情</span>
              <span class="action-btn action-edit" @click="openDialog('edit', row.id)">修改</span>
              <span class="action-btn action-status" @click="handleToggleStatus(row)">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </span>
              <span class="action-btn action-delete" @click="handleHardDelete(row.id)">删除</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px" :close-on-click-modal="false" class="major-dialog">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border class="uni-descriptions">
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="专业代码">{{ detailData.majorCode }}</el-descriptions-item>
            <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="专业类型">{{ detailData.majorType }}</el-descriptions-item>
            <el-descriptions-item label="学科门类">{{ detailData.majorCategory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学科名称">{{ detailData.disciplineName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业类">{{ detailData.parentCategory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业标签">{{ detailData.majorTags || '-' }}</el-descriptions-item>
            <el-descriptions-item label="授予学位">{{ detailData.degreeAwarded || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学制">{{ detailData.studyDuration || '-' }}</el-descriptions-item>
            <el-descriptions-item label="就业率">{{ detailData.employmentRate != null ? detailData.employmentRate + '%' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="薪资范围">
              {{ detailData.salaryMin != null && detailData.salaryMax != null ? `${detailData.salaryMin}-${detailData.salaryMax} 元/月` : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-pill" :class="detailData.status === 1 ? 'status-on' : 'status-off'">
                {{ statusLabel(detailData.status) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="专业描述" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
            <el-descriptions-item label="课程数量">{{ detailData.courseCount ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="毕业生规模">{{ detailData.graduateScale || '-' }}</el-descriptions-item>
            <el-descriptions-item label="男生比例">{{ detailData.maleRatio != null ? detailData.maleRatio + '%' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="女生比例">{{ detailData.femaleRatio != null ? detailData.femaleRatio + '%' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="培养目标" :span="2">{{ detailData.trainingObjective || '-' }}</el-descriptions-item>
            <el-descriptions-item label="培养要求" :span="2">{{ detailData.trainingRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学科要求" :span="2">{{ detailData.subjectRequirement || '-' }}</el-descriptions-item>
            <el-descriptions-item label="就业前景" :span="2">{{ detailData.careerProspect || '-' }}</el-descriptions-item>
            <el-descriptions-item label="主要课程">
              <div v-if="detailData.mainCourses && detailData.mainCourses.length">
                <el-tag v-for="(item, i) in detailData.mainCourses" :key="i" size="small" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="知识技能">
              <div v-if="detailData.knowledgeSkills && detailData.knowledgeSkills.length">
                <el-tag v-for="(item, i) in detailData.knowledgeSkills" :key="i" size="small" type="success" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-else-if="dialogMode === 'add' || dialogMode === 'edit'">
          <el-tabs v-model="activeEditTab" class="major-edit-tabs">
            <el-tab-pane label="基本资料" name="basic">
              <el-form :model="formData" label-width="110px">
                <el-form-item label="专业代码" required>
                  <el-input
                    v-model="formData.majorCode"
                    placeholder="请输入专业代码"
                    maxlength="20"
                    :disabled="dialogMode === 'edit'"
                  />
                </el-form-item>
                <el-form-item label="专业名称" required>
                  <el-input v-model="formData.majorName" placeholder="请输入专业名称" maxlength="100" />
                </el-form-item>
                <el-form-item label="专业类型" required>
                  <el-select v-model="formData.majorType" placeholder="请选择" style="width: 200px">
                    <el-option label="本科" value="本科" />
                    <el-option label="专科" value="专科" />
                  </el-select>
                </el-form-item>
                <el-form-item label="学科名称">
                  <el-input v-model="formData.disciplineName" placeholder="请输入学科名称" maxlength="100" />
                </el-form-item>
                <el-form-item label="学科门类">
                  <el-input v-model="formData.majorCategory" placeholder="如：工学、理学" maxlength="50" />
                </el-form-item>
                <el-form-item label="专业类">
                  <el-input v-model="formData.parentCategory" placeholder="如：计算机类" maxlength="50" />
                </el-form-item>
                <el-form-item label="专业标签">
                  <el-input v-model="formData.majorTags" placeholder="如：热门、紧缺" maxlength="50" />
                </el-form-item>
                <el-form-item label="授予学位">
                  <el-input v-model="formData.degreeAwarded" placeholder="如：工学学士" maxlength="50" />
                </el-form-item>
                <el-form-item label="学制">
                  <el-input v-model="formData.studyDuration" placeholder="如：四年" maxlength="20" />
                </el-form-item>
                <el-form-item label="就业率(%)">
                  <el-input-number v-model="formData.employmentRate" :min="0" :max="100" :precision="2" controls-position="right" />
                </el-form-item>
                <el-form-item label="薪资下限(元/月)">
                  <el-input-number v-model="formData.salaryMin" :min="0" controls-position="right" />
                </el-form-item>
                <el-form-item label="薪资上限(元/月)">
                  <el-input-number v-model="formData.salaryMax" :min="0" controls-position="right" />
                </el-form-item>
                <el-form-item label="专业描述">
                  <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入专业描述" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="专业详情" name="detail">
              <el-form :model="detailFormData" label-width="120px">
                <el-form-item label="课程数量">
                  <el-input-number v-model="detailFormData.courseCount" :min="0" controls-position="right" />
                </el-form-item>
                <el-form-item label="毕业生规模">
                  <!-- 后端回显 VO 用 Integer.parseInt 解析该字段，填非纯数字会解析失败导致回显为空 -->
                  <el-input v-model="detailFormData.graduateScale" placeholder="如：8000（请填纯数字）" maxlength="20" />
                </el-form-item>
                <el-form-item label="男生比例">
                  <el-input-number v-model="detailFormData.maleRatio" :min="0" :max="100" :precision="2" controls-position="right" />
                </el-form-item>
                <el-form-item label="女生比例">
                  <el-input-number v-model="detailFormData.femaleRatio" :min="0" :max="100" :precision="2" controls-position="right" />
                </el-form-item>
                <el-form-item label="专业描述">
                  <el-input v-model="detailFormData.majorDescription" type="textarea" :rows="3" placeholder="请输入专业详细描述" />
                </el-form-item>
                <el-form-item label="培养目标">
                  <el-input v-model="detailFormData.trainingObjective" type="textarea" :rows="3" placeholder="请输入培养目标" />
                </el-form-item>
                <el-form-item label="培养要求">
                  <el-input v-model="detailFormData.trainingRequirement" type="textarea" :rows="3" placeholder="请输入培养要求" />
                </el-form-item>
                <el-form-item label="学科要求">
                  <el-input v-model="detailFormData.subjectRequirement" type="textarea" :rows="3" placeholder="请输入学科要求" />
                </el-form-item>
                <el-form-item label="就业前景">
                  <el-input v-model="detailFormData.careerProspect" type="textarea" :rows="3" placeholder="请输入就业前景分析" />
                </el-form-item>
                <el-form-item label="主要课程">
                  <div v-for="(item, index) in courseList" :key="index" class="mb-2 flex items-center gap-2">
                    <el-input v-model="courseList[index]" placeholder="请输入课程名称" style="width: 400px" />
                    <el-button type="danger" link @click="courseList.splice(index, 1)">删除</el-button>
                  </div>
                  <el-button type="primary" link @click="courseList.push('')">+ 添加课程</el-button>
                </el-form-item>
                <el-form-item label="知识技能">
                  <div v-for="(item, index) in skillList" :key="index" class="mb-2 flex items-center gap-2">
                    <el-input v-model="skillList[index]" placeholder="请输入技能名称" style="width: 400px" />
                    <el-button type="danger" link @click="skillList.splice(index, 1)">删除</el-button>
                  </div>
                  <el-button type="primary" link @click="skillList.push('')">+ 添加技能</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button class="exit-btn" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
          <el-button v-if="dialogMode !== 'detail'" class="save-btn" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-x {
  position: relative;
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  padding: 24px;
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
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.table-card,
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all .3s ease;
}
.search-card {
  margin-bottom: 16px;
}
.table-card:hover,
.search-card:hover {
  box-shadow: 0 4px 16px rgba(249,115,22,0.08);
}
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.4);
}
.reset-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .25s ease;
}
.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.action-left,
.action-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-right {
  margin-left: auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.4);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .25s ease;
}
.btn-outline:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.btn-outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #fff;
  color: #d97706;
  border: 1px solid #fbbf24;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .25s ease;
}
.btn-danger:hover {
  background: #fffbeb;
}
.btn-danger:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger-solid {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(239,68,68,0.3);
}
.btn-danger-solid:hover {
  transform: translateY(-1px);
}
.btn-danger-solid:hover {
  opacity: 0.9;
}
.btn-danger-solid:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}



.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}
.custom-table :deep(.el-table__body tr) {
  transition: background-color .2s ease;
}
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249,115,22,0.03), rgba(251,146,60,0.07)) !important;
}
.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255,247,237,0.3);
}
.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
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

.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s ease;
  white-space: nowrap;
}
.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
  transform: translateY(-1px);
}
.action-edit {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
  transform: translateY(-1px);
}
.action-status {
  background: #fff;
  color: #d97706;
  border: 1px solid #fbbf24;
}
.action-status:hover {
  background: #fffbeb;
}
.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(239,68,68,0.3);
  transform: translateY(-1px);
}

.custom-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.custom-pagination :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}
.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all .2s ease;
  font-weight: 500;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 8px;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
}
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}

.major-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.major-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249,115,22,0.15);
  padding: 20px 24px;
  margin: 0;
}
.major-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.major-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.major-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}
.major-dialog :deep(.el-input__wrapper),
.major-dialog :deep(.el-textarea__inner),
.major-dialog :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all .25s ease;
}
.major-dialog :deep(.el-input__wrapper:hover),
.major-dialog :deep(.el-textarea__inner:hover),
.major-dialog :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
}
.major-dialog :deep(.el-input__wrapper.is-focus),
.major-dialog :deep(.el-textarea__inner:focus),
.major-dialog :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.major-dialog :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #F97316;
  border-color: #F97316;
}
.major-dialog :deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #F97316;
}

.major-edit-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}
.major-edit-tabs :deep(.el-tabs__nav-wrap::after) {
  background-color: #f3f4f6;
}
.major-edit-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  transition: color .2s ease;
}
.major-edit-tabs :deep(.el-tabs__item.is-active) {
  color: #F97316;
  font-weight: 600;
}
.major-edit-tabs :deep(.el-tabs__item:hover) {
  color: #F97316;
}
.major-edit-tabs :deep(.el-tabs__active-bar) {
  background-color: #F97316;
}

.uni-descriptions :deep(.el-descriptions__label) {
  background: linear-gradient(135deg, #FFF7ED, #FFEDD5) !important;
  color: #9A3412 !important;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.search-form {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.filter-fields {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}
.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all .25s ease;
}
.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset;
}
.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.search-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.exit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .25s ease;
}
.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .25s ease;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249,115,22,0.4);
}
.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
