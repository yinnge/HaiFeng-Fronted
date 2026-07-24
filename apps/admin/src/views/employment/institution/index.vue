<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getInstitutionPage,

  getInstitutionDetail,

  updateInstitution,

  deleteInstitution,

  updateInstitutionStatus,

  batchDeleteInstitution,

  preValidateInstitution,

  importInstitution,

} from '@/api/employment/institution'

import type {

  InstitutionListVO,

  InstitutionDetailVO,

  InstitutionQueryDTO,

} from '@/types/employment/institution'



const loading = ref(false)

const tableData = ref<InstitutionListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<InstitutionQueryDTO>({

  page: 1,

  size: 10,

  positionName: '',

  supervisingDept: '',

  institution: '',

  province: '',

  examCategory: '',

  positionType: '',

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<InstitutionDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  positionName: '',

  supervisingDept: '',

  institution: '',

  workLocation: '',

  province: '',

  examCategory: '',

  positionType: '',

  subCategory: '',

  educationRequirement: '',

  degreeRequirement: '',

  ageLimit: null,

  recruitmentCount: null,

  salaryRange: '',

  regDeadline: '',

  majorRequirements: [],

  specialPosition: '',

  otherRequirement: '',

  otherRequirementDesc: '',

  remarkType: '',

  remarkDesc: '',

  consultationPhone: '',

  supervisionPhone: '',

  positionStatus: '招聘中,

  positionTag: '是',

  tagText: '',

  sortOrder: null,

})



const positionStatusOptions = ['招聘中, '已结束]

const educationOptions = ['无要求, '大专', '本科', '硕士', '博士']

const degreeOptions = ['无要求, '学士', '硕士', '博士']

const positionTagOptions = ['热门', '急招']

const positionStatusTag: Record<string, 'success' | 'info'> = {

  '招聘中: 'success',

  '已结束: 'info',

}



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.supervisingDept) params.supervisingDept = queryParams.supervisingDept

    if (queryParams.institution) params.institution = queryParams.institution

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.examCategory) params.examCategory = queryParams.examCategory

    if (queryParams.positionType) params.positionType = queryParams.positionType

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getInstitutionPage(params as InstitutionQueryDTO)

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

  queryParams.positionName = ''

  queryParams.supervisingDept = ''

  queryParams.institution = ''

  queryParams.province = ''

  queryParams.examCategory = ''

  queryParams.positionType = ''

  queryParams.positionStatus = ''

  queryParams.page = 1

  fetchData()

}



const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }



const handleSizeChange = (size: number) => {

  queryParams.size = size

  queryParams.page = 1

  fetchData()

}



const handleSelectionChange = (rows: InstitutionListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder'].includes(k) ? null : ''

  })

  formData.positionStatus = '招聘中

  formData.positionTag = '是

  formData.majorRequirements = []

}



const fillForm = (d: InstitutionDetailVO) => {

  formData.positionName = d.positionName || ''

  formData.supervisingDept = d.supervisingDept || ''

  formData.institution = d.institution || ''

  formData.workLocation = d.workLocation || ''

  formData.province = d.province || ''

  formData.examCategory = d.examCategory || ''

  formData.positionType = d.positionType || ''

  formData.subCategory = d.subCategory || ''

  formData.educationRequirement = d.educationRequirement || ''

  formData.degreeRequirement = d.degreeRequirement || ''

  formData.ageLimit = d.ageLimit ?? null

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.salaryRange = d.salaryRange || ''

  formData.regDeadline = d.regDeadline || ''

  formData.majorRequirements = d.majorRequirements || []

  formData.specialPosition = d.specialPosition || ''

  formData.otherRequirement = d.otherRequirement || ''

  formData.otherRequirementDesc = d.otherRequirementDesc || ''

  formData.remarkType = d.remarkType || ''

  formData.remarkDesc = d.remarkDesc || ''

  formData.consultationPhone = d.consultationPhone || ''

  formData.supervisionPhone = d.supervisionPhone || ''

  formData.positionStatus = d.positionStatus || '招聘中

  formData.positionTag = d.positionTag || '是

  formData.tagText = d.tagText || ''

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'edit' && id) {

    dialogTitle.value = '修改事业编职位

    formLoading.value = true

    try {

      const res = await getInstitutionDetail(id)

      if (res.data.code === 200) {

        fillForm(res.data.data)

      }

    } catch {

      ElMessage.error('获取详情失败')

    } finally {

      formLoading.value = false

    }

    detailData.value = null

  } else if (mode === 'detail' && id) {

    dialogTitle.value = '事业编职位详情

    formLoading.value = true

    try {

      const res = await getInstitutionDetail(id)

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

  if (!currentId.value) return

  try {

    const data: Record<string, any> = {}

    const stringFields = ['positionName', 'supervisingDept', 'institution', 'workLocation', 'province', 'examCategory', 'positionType', 'subCategory', 'educationRequirement', 'degreeRequirement', 'salaryRange', 'regDeadline', 'specialPosition', 'otherRequirement', 'otherRequirementDesc', 'remarkType', 'remarkDesc', 'consultationPhone', 'supervisionPhone', 'positionStatus', 'positionTag', 'tagText']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })

    if (formData.majorRequirements && formData.majorRequirements.length > 0) {

      data.majorRequirements = formData.majorRequirements

    }



    const res = await updateInstitution(currentId.value, data)

    if (res.data.code === 200) {

      ElMessage.success('修改成功')

      dialogVisible.value = false

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch (err: any) {

    ElMessage.error(err.response?.data?.msg || '操作失败')

  }

}



const handleDelete = async (id: string) => {

  try {

    await ElMessageBox.confirm('确定删除该事业编职位吗？', '提示')

    const res = await deleteInstitution(id)

    if (res.data.code === 200) {

      ElMessage.success('删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '删除失败')

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

    await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length} 条记录吗？`, '提示')

    const res = await batchDeleteInstitution(selectedIds.value)

    if (res.data.code === 200) {

      ElMessage.success('批量删除成功')

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '批量删除失败')

    }

  } catch {

    // cancel

  }

}



const handleStatusChange = async (row: InstitutionListVO, newStatus: string) => {

  try {

    const statusVal = newStatus === '招聘中 ? 0 : 1

    const res = await updateInstitutionStatus(row.id, { status: statusVal })

    if (res.data.code === 200) {

      ElMessage.success('状态更新成功)

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch (err: any) {

    ElMessage.error(err.response?.data?.msg || '操作失败')

  }

}



const preValidateDialogVisible = ref(false)

const preValidateFile = ref<File | null>(null)

const preValidateLoading = ref(false)



const importDialogVisible = ref(false)

const importFile = ref<File | null>(null)

const importLoading = ref(false)



const openPreValidateDialog = () => {

  preValidateFile.value = null

  preValidateDialogVisible.value = true

}



const openImportDialog = () => {

  importFile.value = null

  importDialogVisible.value = true

}



const handlePreValidateFileChange = (uploadFile: any) => {

  preValidateFile.value = uploadFile.raw

  return false

}



const handleImportFileChange = (uploadFile: any) => {

  importFile.value = uploadFile.raw

  return false

}



const handlePreValidateSubmit = async () => {

  if (!preValidateFile.value) { ElMessage.warning('请选择文件'); return }

  preValidateLoading.value = true

  try {

    const res = await preValidateInstitution(preValidateFile.value)

    if (res.data.code === 200) {

      ElMessage.success('校验通过')

      preValidateDialogVisible.value = false

    } else {

      ElMessage.error(res.data.msg || '校验失败')

    }

  } catch (err: any) {

    ElMessage.error(err.response?.data?.msg || '校验失败')

  } finally {

    preValidateLoading.value = false

  }

}



const handleImportSubmit = async () => {

  if (!importFile.value) { ElMessage.warning('请选择文件'); return }

  importLoading.value = true

  try {

    const res = await importInstitution(importFile.value)

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



onMounted(() => { fetchData() })

</script>



<template>

  <div>

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-form-item label="职位名称">

          <el-input v-model="queryParams.positionName" placeholder="职位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="主管部门">

          <el-input v-model="queryParams.supervisingDept" placeholder="主管部门" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="事业单位">

          <el-input v-model="queryParams.institution" placeholder="事业单位" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="省份">

          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="考试类别">

          <el-input v-model="queryParams.examCategory" placeholder="考试类别" clearable style="width: 120px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="岗位类型">

          <el-input v-model="queryParams.positionType" placeholder="岗位类型" clearable style="width: 120px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="状态>

          <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 110px">

            <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />

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

        <el-button type="warning" @click="openPreValidateDialog">Excel预览/el-button>

        <el-button type="success" @click="openImportDialog">Excel导入</el-button>

        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>

      </div>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="positionName" label="职位名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="supervisingDept" label="主管部门" min-width="150" show-overflow-tooltip />

        <el-table-column prop="institution" label="事业单位" min-width="180" show-overflow-tooltip />

        <el-table-column prop="province" label="省份" width="100" />

        <el-table-column prop="examCategory" label="考试类别" width="120" />

        <el-table-column prop="positionType" label="岗位类型" width="100" />

        <el-table-column prop="subCategory" label="子分类 width="100" />

        <el-table-column prop="salaryRange" label="薪资范围" width="120" />

        <el-table-column prop="positionStatus" label="状态 width="100" align="center">

          <template #default="{ row }">

            <el-tag :type="positionStatusTag[row.positionStatus] || 'info'" size="small">{{ row.positionStatus }}</el-tag>

          </template>

        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>

            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>

            <el-dropdown @command="(val: string) => handleStatusChange(row, val)">

              <el-button type="primary" link>

                {{ row.positionStatus }}

                <el-icon><ArrowDown /></el-icon>

              </el-button>

              <template #dropdown>

                <el-dropdown-menu>

                  <el-dropdown-item v-for="opt in positionStatusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>

                </el-dropdown-menu>

              </template>

            </el-dropdown>

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



    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">

      <div v-loading="formLoading">

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="2" border>

            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="职位名称">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="主管部门">{{ detailData.supervisingDept || '-' }}</el-descriptions-item>

            <el-descriptions-item label="事业单位">{{ detailData.institution }}</el-descriptions-item>

            <el-descriptions-item label="工作地点">{{ detailData.workLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>

            <el-descriptions-item label="考试类别">{{ detailData.examCategory || '-' }}</el-descriptions-item>

            <el-descriptions-item label="岗位类型">{{ detailData.positionType || '-' }}</el-descriptions-item>

            <el-descriptions-item label="子分类>{{ detailData.subCategory || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="薪资范围">{{ detailData.salaryRange || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regDeadline || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirements?.join('、') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="特殊职位">{{ detailData.specialPosition || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他要求">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他要求说明" :span="2">{{ detailData.otherRequirementDesc || '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注类型">{{ detailData.remarkType || '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注说明" :span="2">{{ detailData.remarkDesc || '-' }}</el-descriptions-item>

            <el-descriptions-item label="咨询电话">{{ detailData.consultationPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="监督电话">{{ detailData.supervisionPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="状态>

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="职位标签">{{ detailData.positionTag || '-' }}</el-descriptions-item>

            <el-descriptions-item label="标签文字">{{ detailData.tagText || '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="基本信息" name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="职位名称">

                      <el-input v-model="formData.positionName" placeholder="职位名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="主管部门">

                      <el-input v-model="formData.supervisingDept" placeholder="主管部门" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="事业单位">

                      <el-input v-model="formData.institution" placeholder="事业单位" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="工作地点">

                      <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="省份">

                      <el-input v-model="formData.province" placeholder="省份" maxlength="30" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="考试类别">

                      <el-input v-model="formData.examCategory" placeholder="考试类别" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="岗位类型">

                      <el-input v-model="formData.positionType" placeholder="岗位类型" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="子分类>

                  <el-input v-model="formData.subCategory" placeholder="子分类 maxlength="50" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="报考要求 name="requirements">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="学历要求">

                      <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="学位要求">

                      <el-select v-model="formData.degreeRequirement" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in degreeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="年龄上限">

                      <el-input-number v-model="formData.ageLimit" :min="18" :max="60" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="招聘人数">

                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="薪资范围">

                      <el-input v-model="formData.salaryRange" placeholder="薪资范围" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="报名截止">

                      <el-date-picker v-model="formData.regDeadline" type="datetime" placeholder="报名截止" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="专业要求">

                  <el-select v-model="formData.majorRequirements" multiple placeholder="输入专业，回车添加 filterable allow-create default-first-option style="width: 100%">

                    <el-option v-for="item in formData.majorRequirements" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="备注信息" name="remarks">

              <el-form :model="formData" label-width="140px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="备注类型">

                      <el-input v-model="formData.remarkType" placeholder="备注类型" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="备注说明">

                      <el-input v-model="formData.remarkDesc" placeholder="备注说明" maxlength="500" show-word-limit />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="咨询电话">

                      <el-input v-model="formData.consultationPhone" placeholder="咨询电话" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="监督电话">

                      <el-input v-model="formData.supervisionPhone" placeholder="监督电话" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="特殊职位">

                      <el-input v-model="formData.specialPosition" placeholder="特殊职位" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="其他要求">

                      <el-input v-model="formData.otherRequirement" placeholder="其他要求" maxlength="100" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="其他要求说明">

                  <el-input v-model="formData.otherRequirementDesc" type="textarea" :rows="3" placeholder="其他要求说明" maxlength="500" show-word-limit />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="状态与标签" name="status">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="状态>

                      <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">

                        <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="职位标签">

                      <el-select v-model="formData.positionTag" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in positionTagOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="标签文字">

                      <el-input v-model="formData.tagText" placeholder="标签文字" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="排序">

                      <el-input-number v-model="formData.sortOrder" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>

          </el-tabs>

        </template>

      </div>



      <template #footer>

        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>

        <el-button v-if="dialogMode === 'edit'" type="primary" @click="handleSubmit">确定</el-button>

      </template>

    </el-dialog>



    <el-dialog v-model="preValidateDialogVisible" title="Excel预览 width="500px">

      <el-upload

        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"

        :on-change="handlePreValidateFileChange" :limit="1"

      >

        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>

        <div class="el-upload__text">将文件拖到此处，或em>点击上传</em></div>

        <template #tip>

          <div class="el-upload__tip">仅支持.xlsx / .xls 格式</div>

        </template>

      </el-upload>

      <template #footer>

        <el-button @click="preValidateDialogVisible = false">取消</el-button>

        <el-button type="warning" :loading="preValidateLoading" @click="handlePreValidateSubmit">开始校验/el-button>

      </template>

    </el-dialog>



    <el-dialog v-model="importDialogVisible" title="Excel导入" width="500px">

      <el-upload

        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"

        :on-change="handleImportFileChange" :limit="1"

      >

        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>

        <div class="el-upload__text">将文件拖到此处，或em>点击上传</em></div>

        <template #tip>

          <div class="el-upload__tip">仅支持.xlsx / .xls 格式</div>

        </template>

      </el-upload>

      <template #footer>

        <el-button @click="importDialogVisible = false">取消</el-button>

        <el-button type="success" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>

      </template>

    </el-dialog>

  </div>

</template>

