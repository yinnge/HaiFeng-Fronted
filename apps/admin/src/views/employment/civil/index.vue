<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getCivilPage,

  getCivilDetail,

  updateCivil,

  deleteCivil,

  updateCivilStatus,

  batchDeleteCivil,

  preValidateCivil,

  importCivil,

} from '@/api/employment/civil'

import type {

  CivilListVO,

  CivilDetailVO,

  CivilQueryDTO,

} from '@/types/employment/civil'



const loading = ref(false)

const tableData = ref<CivilListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<CivilQueryDTO>({

  page: 1,

  size: 10,

  positionName: '',

  recruitingDept: '',

  workLocation: '',

  examType: '',

  regStatus: '',

  minEducation: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<CivilDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  positionName: '',

  examType: '',

  recruitingDept: '',

  deptCode: '',

  positionCode: '',

  affiliatedBureau: '',

  majorRequirement: '',

  minEducation: '',

  degreeRequirement: '',

  politicalStatus: '',

  workExperience: '',

  grassrootsExperience: '',

  examCategory: '',

  interviewRatio: '',

  recruitmentCount: null,

  hasProfessionalTest: false,

  workLocation: '',

  workLocationDetail: '',

  householdRequirement: '',

  householdLocation: '',

  positionIntro: '',

  remark: '',

  officialWebsite: '',

  contactPhone: '',

  regStartDate: '',

  regEndDate: '',

  regStatus: '即将开始,

  applicantCount: null,

  sortOrder: null,

})



const examTypeOptions = ['国家级, '省级]

const regStatusOptions = ['报名中, '已结束, '即将开始]

const educationOptions = ['不限', '大专', '本科', '硕士', '博士']

const politicalStatusOptions = ['不限', '中共党员', '共青团员', '群众']

const degreeOptions = ['不限', '学士', '硕士', '博士']



const regStatusTag: Record<string, 'success' | 'info' | 'warning' | 'primary'> = {

  '报名中: 'success',

  '已结束: 'info',

  '即将开始: 'warning',

}



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.recruitingDept) params.recruitingDept = queryParams.recruitingDept

    if (queryParams.workLocation) params.workLocation = queryParams.workLocation

    if (queryParams.examType) params.examType = queryParams.examType

    if (queryParams.regStatus) params.regStatus = queryParams.regStatus

    if (queryParams.minEducation) params.minEducation = queryParams.minEducation

    const res = await getCivilPage(params as CivilQueryDTO)

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

  queryParams.recruitingDept = ''

  queryParams.workLocation = ''

  queryParams.examType = ''

  queryParams.regStatus = ''

  queryParams.minEducation = ''

  queryParams.page = 1

  fetchData()

}



const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }



const handleSizeChange = (size: number) => {

  queryParams.size = size

  queryParams.page = 1

  fetchData()

}



const handleSelectionChange = (rows: CivilListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = ['recruitmentCount', 'applicantCount', 'sortOrder'].includes(k) ? null : ''

  })

  formData.hasProfessionalTest = false

  formData.regStatus = '即将开始

}



const fillForm = (d: CivilDetailVO) => {

  formData.positionName = d.positionName || ''

  formData.examType = d.examType || ''

  formData.recruitingDept = d.recruitingDept || ''

  formData.deptCode = d.deptCode || ''

  formData.positionCode = d.positionCode || ''

  formData.affiliatedBureau = d.affiliatedBureau || ''

  formData.majorRequirement = d.majorRequirement || ''

  formData.minEducation = d.minEducation || ''

  formData.degreeRequirement = d.degreeRequirement || ''

  formData.politicalStatus = d.politicalStatus || ''

  formData.workExperience = d.workExperience || ''

  formData.grassrootsExperience = d.grassrootsExperience || ''

  formData.examCategory = d.examCategory || ''

  formData.interviewRatio = d.interviewRatio || ''

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.hasProfessionalTest = d.hasProfessionalTest ?? false

  formData.workLocation = d.workLocation || ''

  formData.workLocationDetail = d.workLocationDetail || ''

  formData.householdRequirement = d.householdRequirement || ''

  formData.householdLocation = d.householdLocation || ''

  formData.positionIntro = d.positionIntro || ''

  formData.remark = d.remark || ''

  formData.officialWebsite = d.officialWebsite || ''

  formData.contactPhone = d.contactPhone || ''

  formData.regStartDate = d.regStartDate || ''

  formData.regEndDate = d.regEndDate || ''

  formData.regStatus = d.regStatus || '即将开始

  formData.applicantCount = d.applicantCount ?? null

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'edit' && id) {

    dialogTitle.value = '修改公务员职位

    formLoading.value = true

    try {

      const res = await getCivilDetail(id)

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

    dialogTitle.value = '公务员职位详情

    formLoading.value = true

    try {

      const res = await getCivilDetail(id)

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

    const stringFields = ['positionName', 'examType', 'recruitingDept', 'deptCode', 'positionCode', 'affiliatedBureau', 'majorRequirement', 'minEducation', 'degreeRequirement', 'politicalStatus', 'workExperience', 'grassrootsExperience', 'examCategory', 'interviewRatio', 'workLocation', 'workLocationDetail', 'householdRequirement', 'householdLocation', 'positionIntro', 'remark', 'officialWebsite', 'contactPhone', 'regStartDate', 'regEndDate', 'regStatus']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    const numberFields = ['recruitmentCount', 'applicantCount', 'sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })

    data.hasProfessionalTest = formData.hasProfessionalTest ?? false



    const res = await updateCivil(currentId.value, data)

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

    await ElMessageBox.confirm('确定删除该公务员职位吗？', '提示')

    const res = await deleteCivil(id)

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

    const res = await batchDeleteCivil(selectedIds.value)

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



const handleStatusChange = async (row: CivilListVO, newStatus: string) => {

  try {

    const statusVal = newStatus === '报名中 ? 0 : 1

    const res = await updateCivilStatus(row.id, { status: statusVal })

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

    const res = await preValidateCivil(preValidateFile.value)

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

    const res = await importCivil(importFile.value)

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

        <el-form-item label="招录部门">

          <el-input v-model="queryParams.recruitingDept" placeholder="招录部门" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="工作地点">

          <el-input v-model="queryParams.workLocation" placeholder="工作地点" clearable style="width: 120px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="考试类型">

          <el-select v-model="queryParams.examType" placeholder="全部" clearable style="width: 100px">

            <el-option v-for="item in examTypeOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="报名状态>

          <el-select v-model="queryParams.regStatus" placeholder="全部" clearable style="width: 110px">

            <el-option v-for="item in regStatusOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="最低学历>

          <el-select v-model="queryParams.minEducation" placeholder="全部" clearable style="width: 100px">

            <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />

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

        <el-table-column prop="examType" label="考试类型" width="100" />

        <el-table-column prop="recruitingDept" label="招录部门" min-width="180" show-overflow-tooltip />

        <el-table-column prop="minEducation" label="最低学历 width="100" />

        <el-table-column prop="workLocation" label="工作地点" width="120" />

        <el-table-column prop="regStartDate" label="报名开始 width="180" />

        <el-table-column prop="regEndDate" label="报名截止" width="180" />

        <el-table-column prop="regStatus" label="报名状态 width="100" align="center">

          <template #default="{ row }">

            <el-tag :type="regStatusTag[row.regStatus] || 'info'" size="small">{{ row.regStatus }}</el-tag>

          </template>

        </el-table-column>

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>

            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>

            <el-dropdown @command="(val: string) => handleStatusChange(row, val)">

              <el-button type="primary" link>

                {{ row.regStatus }}

                <el-icon><ArrowDown /></el-icon>

              </el-button>

              <template #dropdown>

                <el-dropdown-menu>

                  <el-dropdown-item v-for="opt in regStatusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>

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

            <el-descriptions-item label="考试类型">{{ detailData.examType }}</el-descriptions-item>

            <el-descriptions-item label="招录部门">{{ detailData.recruitingDept }}</el-descriptions-item>

            <el-descriptions-item label="部门代码">{{ detailData.deptCode || '-' }}</el-descriptions-item>

            <el-descriptions-item label="职位代码">{{ detailData.positionCode || '-' }}</el-descriptions-item>

            <el-descriptions-item label="所属局/>{{ detailData.affiliatedBureau || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="最低学历>{{ detailData.minEducation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="政治面貌">{{ detailData.politicalStatus || '-' }}</el-descriptions-item>

            <el-descriptions-item label="工作年限">{{ detailData.workExperience || '-' }}</el-descriptions-item>

            <el-descriptions-item label="基层经验">{{ detailData.grassrootsExperience || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试类别">{{ detailData.examCategory || '-' }}</el-descriptions-item>

            <el-descriptions-item label="面试比例">{{ detailData.interviewRatio || '-' }}</el-descriptions-item>

            <el-descriptions-item label="招录人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业科目考试">

              <el-tag :type="detailData.hasProfessionalTest ? 'success' : 'info'" size="small">{{ detailData.hasProfessionalTest ? '是' : '否' }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="工作地点">{{ detailData.workLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="工作地点详情">{{ detailData.workLocationDetail || '-' }}</el-descriptions-item>

            <el-descriptions-item label="落户要求">{{ detailData.householdRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="落户地点">{{ detailData.householdLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="职位简介 :span="2">{{ detailData.positionIntro || '-' }}</el-descriptions-item>

            <el-descriptions-item label="官方网站">

              <template v-if="detailData.officialWebsite">

                <el-link type="primary" :href="detailData.officialWebsite" target="_blank">{{ detailData.officialWebsite }}</el-link>

              </template>

              <template v-else>-</template>

            </el-descriptions-item>

            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始>{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名状态>

              <el-tag :type="regStatusTag[detailData.regStatus] || 'info'" size="small">{{ detailData.regStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="报名人数">{{ detailData.applicantCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>

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

                    <el-form-item label="考试类型">

                      <el-select v-model="formData.examType" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in examTypeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="招录部门">

                      <el-input v-model="formData.recruitingDept" placeholder="招录部门" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="部门代码">

                      <el-input v-model="formData.deptCode" placeholder="部门代码" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="职位代码">

                      <el-input v-model="formData.positionCode" placeholder="职位代码" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="所属局/>

                      <el-input v-model="formData.affiliatedBureau" placeholder="所属局/ maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="报考要求 name="requirements">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="最低学历>

                      <el-select v-model="formData.minEducation" placeholder="请选择" clearable style="width: 100%">

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

                    <el-form-item label="政治面貌">

                      <el-select v-model="formData.politicalStatus" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in politicalStatusOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="工作年限">

                      <el-input v-model="formData.workExperience" placeholder="工作年限" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="基层经验要求">

                      <el-input v-model="formData.grassrootsExperience" placeholder="基层经验要求" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="招录人数">

                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="专业要求">

                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="考试与地点 name="exam">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="考试类别">

                      <el-input v-model="formData.examCategory" placeholder="考试类别" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="面试比例">

                      <el-input v-model="formData.interviewRatio" placeholder="面试比例" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="专业科目考试">

                  <el-switch v-model="formData.hasProfessionalTest" />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="工作地点">

                      <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="工作地点详情">

                      <el-input v-model="formData.workLocationDetail" placeholder="工作地点详情" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="落户要求">

                      <el-input v-model="formData.householdRequirement" placeholder="落户要求" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="落户地点">

                      <el-input v-model="formData.householdLocation" placeholder="落户地点" maxlength="100" />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="补充信息" name="extra">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="官方网站">

                      <el-input v-model="formData.officialWebsite" placeholder="官方网站" maxlength="500" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="联系电话">

                      <el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="职位简介>

                  <el-input v-model="formData.positionIntro" type="textarea" :rows="3" placeholder="职位简介 maxlength="500" show-word-limit />

                </el-form-item>

                <el-form-item label="备注">

                  <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="报名开始>

                      <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始 style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="报名截止">

                      <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="报名状态>

                      <el-select v-model="formData.regStatus" placeholder="请选择" style="width: 100%">

                        <el-option v-for="item in regStatusOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="报名人数">

                      <el-input-number v-model="formData.applicantCount" :min="0" style="width: 100%" />

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

