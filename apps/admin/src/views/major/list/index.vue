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
const dialogMode = ref<'detail' | 'add' | 'edit' | 'editDetail'>('detail')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<MajorDetailVO | null>(null)

const formData = reactive<MajorAddDTO>({
  majorCode: '',
  majorName: '',
  majorType: '',
  disciplineName: '',
  majorCategory: '',
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
  mainCourses: [],
  knowledgeSkills: [],
})

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
  } catch {
    ElMessage.error('获取列表失败')
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

const openDialog = async (mode: 'detail' | 'add' | 'edit' | 'editDetail', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增专业'
    formData.majorCode = ''
    formData.majorName = ''
    formData.majorType = ''
    formData.disciplineName = ''
    formData.majorCategory = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改专业'
    formLoading.value = true
    try {
      const res = await getMajorDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.majorCode = d.majorCode
        formData.majorName = d.majorName
        formData.majorType = d.majorType
        formData.disciplineName = d.disciplineName || ''
        formData.majorCategory = d.majorCategory || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'editDetail' && id) {
    dialogTitle.value = '修改专业详情'
    formLoading.value = true
    try {
      const res = await getMajorDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        detailFormData.courseCount = d.courseCount ?? undefined
        detailFormData.graduateScale = d.graduateScale || ''
        detailFormData.maleRatio = d.maleRatio ?? undefined
        detailFormData.femaleRatio = d.femaleRatio ?? undefined
        detailFormData.majorDescription = d.majorDescription || ''
        detailFormData.trainingObjective = d.trainingObjective || ''
        detailFormData.trainingRequirement = d.trainingRequirement || ''
        detailFormData.subjectRequirement = d.subjectRequirement || ''
        detailFormData.careerProspect = d.careerProspect || ''
        detailFormData.mainCourses = d.mainCourses || []
        detailFormData.knowledgeSkills = d.knowledgeSkills || []
      }
    } catch {
      ElMessage.error('获取详情失败')
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
    } catch {
      ElMessage.error('获取详情失败')
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
    let res: any
    if (dialogMode.value === 'add') {
      const data: MajorAddDTO = {
        majorCode: formData.majorCode,
        majorName: formData.majorName,
        majorType: formData.majorType,
      }
      if (formData.disciplineName) data.disciplineName = formData.disciplineName
      if (formData.majorCategory) data.majorCategory = formData.majorCategory
      res = await addMajor(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: MajorUpdateDTO = {}
      if (formData.majorCode) data.majorCode = formData.majorCode
      if (formData.majorName) data.majorName = formData.majorName
      if (formData.majorType) data.majorType = formData.majorType
      if (formData.disciplineName) data.disciplineName = formData.disciplineName
      if (formData.majorCategory) data.majorCategory = formData.majorCategory
      res = await updateMajor(currentId.value, data)
    } else if (dialogMode.value === 'editDetail' && currentId.value) {
      const data: MajorDetailUpdateDTO = {}
      if (detailFormData.courseCount !== undefined) data.courseCount = detailFormData.courseCount
      if (detailFormData.graduateScale) data.graduateScale = detailFormData.graduateScale
      if (detailFormData.maleRatio !== undefined) data.maleRatio = detailFormData.maleRatio
      if (detailFormData.femaleRatio !== undefined) data.femaleRatio = detailFormData.femaleRatio
      if (detailFormData.majorDescription) data.majorDescription = detailFormData.majorDescription
      if (detailFormData.trainingObjective) data.trainingObjective = detailFormData.trainingObjective
      if (detailFormData.trainingRequirement) data.trainingRequirement = detailFormData.trainingRequirement
      if (detailFormData.subjectRequirement) data.subjectRequirement = detailFormData.subjectRequirement
      if (detailFormData.careerProspect) data.careerProspect = detailFormData.careerProspect
      if (detailFormData.mainCourses && detailFormData.mainCourses.length > 0) data.mainCourses = detailFormData.mainCourses
      if (detailFormData.knowledgeSkills && detailFormData.knowledgeSkills.length > 0) data.knowledgeSkills = detailFormData.knowledgeSkills
      res = await updateMajorDetail(currentId.value, data)
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
    const res = await batchSoftDeleteMajor({ ids: selectedIds.value })
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
    const res = await batchHardDeleteMajor({ ids: selectedIds.value })
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

const addArrayItem = (arr: string[] | undefined) => { if (arr) arr.push('') }
const removeArrayItem = (arr: string[] | undefined, index: number) => { if (arr) arr.splice(index, 1) }
const arrOrEmpty = (arr: string[] | undefined): string[] => arr || []

const statusTag = (status: number) => status === 1 ? 'success' : 'info'
const statusLabel = (status: number) => status === 1 ? '启用' : '禁用'

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增专业</el-button>
        <el-button @click="handleImport('main')">导入专业主表</el-button>
        <el-button @click="handleImport('detail')">导入专业详情</el-button>
      </div>
      <div class="flex items-center gap-2">
        <el-button :disabled="selectedIds.length === 0" @click="handleBatchSoftDelete">批量禁用</el-button>
        <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量删除</el-button>
        <el-button @click="fetchData">刷新</el-button>
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
        <el-table-column prop="majorCode" label="专业代码" width="100" />
        <el-table-column prop="majorName" label="专业名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="majorCategory" label="学科门类" width="100" />
        <el-table-column prop="majorType" label="专业类型" width="80" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button type="success" link @click="openDialog('editDetail', row.id)">修改详情</el-button>
            <el-button
              v-if="row.status === 1"
              type="info"
              link
              @click="handleToggleStatus(row)"
            >禁用</el-button>
            <el-button
              v-else
              type="success"
              link
              @click="handleRestore(row.id)"
            >恢复</el-button>
            <el-button type="warning" link @click="handleDelete(row.id)">软删除</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id)">删除</el-button>
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
            <el-descriptions-item label="专业代码">{{ detailData.majorCode }}</el-descriptions-item>
            <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
            <el-descriptions-item label="专业类型">{{ detailData.majorType }}</el-descriptions-item>
            <el-descriptions-item label="学科门类">{{ detailData.majorCategory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学科名称">{{ detailData.disciplineName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业类">{{ detailData.parentCategory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="专业标签">{{ detailData.majorTags || '-' }}</el-descriptions-item>
            <el-descriptions-item label="授予学位">{{ detailData.degreeAwarded || '-' }}</el-descriptions-item>
            <el-descriptions-item label="就业率">{{ detailData.employmentRate != null ? detailData.employmentRate + '%' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="薪资范围">
              {{ detailData.salaryMin != null && detailData.salaryMax != null ? `${detailData.salaryMin}-${detailData.salaryMax} 元/月` : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">{{ statusLabel(detailData.status) }}</el-tag>
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

        <template v-if="dialogMode === 'add' || dialogMode === 'edit'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="专业代码" required>
              <el-input v-model="formData.majorCode" placeholder="请输入专业代码" maxlength="20" />
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
          </el-form>
        </template>

        <template v-if="dialogMode === 'editDetail'">
          <el-form :model="detailFormData" label-width="120px">
            <el-form-item label="课程数量">
              <el-input-number v-model="detailFormData.courseCount" :min="0" controls-position="right" />
            </el-form-item>
            <el-form-item label="毕业生规模">
              <el-input v-model="detailFormData.graduateScale" placeholder="如：5000-10000人" maxlength="20" />
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
              <div v-for="(item, index) in arrOrEmpty(detailFormData.mainCourses)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="detailFormData.mainCourses![index]" placeholder="请输入课程名称" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(detailFormData.mainCourses, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(detailFormData.mainCourses)">+ 添加课程</el-button>
            </el-form-item>
            <el-form-item label="知识技能">
              <div v-for="(item, index) in arrOrEmpty(detailFormData.knowledgeSkills)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="detailFormData.knowledgeSkills![index]" placeholder="请输入技能名称" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(detailFormData.knowledgeSkills, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(detailFormData.knowledgeSkills)">+ 添加技能</el-button>
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
