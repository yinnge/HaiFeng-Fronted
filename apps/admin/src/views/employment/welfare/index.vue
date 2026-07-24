<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getWelfarePage,

  getWelfareDetail,

  updateWelfare,

  deleteWelfare,

  updateWelfareStatus,

  batchDeleteWelfare,

  preValidateWelfare,

  importWelfare,

} from '@/api/employment/welfare'

import type {

  WelfareListVO,

  WelfareDetailVO,

  WelfareQueryDTO,

} from '@/types/employment/welfare'



const loading = ref(false)

const tableData = ref<WelfareListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<WelfareQueryDTO>({

  page: 1,

  size: 10,

  positionName: '',

  developingUnit: '',

  employingUnit: '',

  positionCategory: '',

  province: '',

  city: '',

  district: '',

  maxServiceYears: undefined,

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<WelfareDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  developingUnit: '',

  employingUnit: '',

  positionName: '',

  positionCategory: '',

  workContent: '',

  province: '',

  city: '',

  district: '',

  workLocation: '',

  targetGroup: [],

  educationRequirement: '不限',

  ageRange: '',

  healthRequirement: '',

  recruitmentCount: null,

  householdRequirement: '',

  employmentDifficultyCert: false,

  otherRequirement: '',

  contractPeriod: '',

  isRenewable: false,

  maxServiceYears: null,

  monthlySalary: '',

  salarySource: '',

  subsidyStandard: '',

  socialInsuranceInfo: '',

  otherBenefits: '',

  workSchedule: '',

  isShiftWork: false,

  regStartDate: '',

  regEndDate: '',

  applyMethod: '',

  applyAddress: '',

  requiredDocuments: '',

  positionStatus: '招聘中,

  contactPhone: '',

  contactPerson: '',

  remark: '',

  content: '',

  sortOrder: null,

})



const positionCategoryOptions = ['公共管理, '公共服务, '公共环境, '公共安全, '设施维护, '其他']

const educationOptions = ['不限', '初中', '高中', '大专', '本科']

const positionStatusOptions = ['招聘中, '已结束, '即将开始]



const positionStatusTag: Record<string, 'success' | 'info' | 'warning'> = {

  '招聘中: 'success',

  '已结束: 'info',

  '即将开始: 'warning',

}



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.developingUnit) params.developingUnit = queryParams.developingUnit

    if (queryParams.employingUnit) params.employingUnit = queryParams.employingUnit

    if (queryParams.positionCategory) params.positionCategory = queryParams.positionCategory

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.city) params.city = queryParams.city

    if (queryParams.district) params.district = queryParams.district

    if (queryParams.maxServiceYears) params.maxServiceYears = queryParams.maxServiceYears

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getWelfarePage(params as WelfareQueryDTO)

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

  queryParams.developingUnit = ''

  queryParams.employingUnit = ''

  queryParams.positionCategory = ''

  queryParams.province = ''

  queryParams.city = ''

  queryParams.district = ''

  queryParams.maxServiceYears = undefined

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



const handleSelectionChange = (rows: WelfareListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder', 'maxServiceYears'].includes(k) ? null : ''

  })

  formData.positionStatus = '招聘中

  formData.educationRequirement = '不限'

  formData.employmentDifficultyCert = false

  formData.isRenewable = false

  formData.isShiftWork = false

  formData.targetGroup = []

}



const fillForm = (d: WelfareDetailVO) => {

  formData.developingUnit = d.developingUnit || ''

  formData.employingUnit = d.employingUnit || ''

  formData.positionName = d.positionName || ''

  formData.positionCategory = d.positionCategory || ''

  formData.workContent = d.workContent || ''

  formData.province = d.province || ''

  formData.city = d.city || ''

  formData.district = d.district || ''

  formData.workLocation = d.workLocation || ''

  formData.targetGroup = d.targetGroup || []

  formData.educationRequirement = d.educationRequirement || '不限'

  formData.ageRange = d.ageRange || ''

  formData.healthRequirement = d.healthRequirement || ''

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.householdRequirement = d.householdRequirement || ''

  formData.employmentDifficultyCert = d.employmentDifficultyCert ?? false

  formData.otherRequirement = d.otherRequirement || ''

  formData.contractPeriod = d.contractPeriod || ''

  formData.isRenewable = d.isRenewable ?? false

  formData.maxServiceYears = d.maxServiceYears ?? null

  formData.monthlySalary = d.monthlySalary || ''

  formData.salarySource = d.salarySource || ''

  formData.subsidyStandard = d.subsidyStandard || ''

  formData.socialInsuranceInfo = d.socialInsuranceInfo || ''

  formData.otherBenefits = d.otherBenefits || ''

  formData.workSchedule = d.workSchedule || ''

  formData.isShiftWork = d.isShiftWork ?? false

  formData.regStartDate = d.regStartDate || ''

  formData.regEndDate = d.regEndDate || ''

  formData.applyMethod = d.applyMethod || ''

  formData.applyAddress = d.applyAddress || ''

  formData.requiredDocuments = d.requiredDocuments || ''

  formData.positionStatus = d.positionStatus || '招聘中

  formData.contactPhone = d.contactPhone || ''

  formData.contactPerson = d.contactPerson || ''

  formData.remark = d.remark || ''

  formData.content = d.content || ''

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'edit' && id) {

    dialogTitle.value = '修改公益性岗位

    formLoading.value = true

    try {

      const res = await getWelfareDetail(id)

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

    dialogTitle.value = '公益性岗位详情

    formLoading.value = true

    try {

      const res = await getWelfareDetail(id)

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

    const stringFields = ['developingUnit', 'employingUnit', 'positionName', 'positionCategory', 'workContent', 'province', 'city', 'district', 'workLocation', 'educationRequirement', 'ageRange', 'healthRequirement', 'householdRequirement', 'otherRequirement', 'contractPeriod', 'monthlySalary', 'salarySource', 'subsidyStandard', 'socialInsuranceInfo', 'otherBenefits', 'workSchedule', 'regStartDate', 'regEndDate', 'applyMethod', 'applyAddress', 'requiredDocuments', 'positionStatus', 'contactPhone', 'contactPerson', 'remark', 'content']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    const numberFields = ['recruitmentCount', 'maxServiceYears', 'sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })

    const booleanFields = ['employmentDifficultyCert', 'isRenewable', 'isShiftWork']

    booleanFields.forEach((f) => {

      data[f] = !!formData[f]

    })

    if (formData.targetGroup && formData.targetGroup.length > 0) {

      data.targetGroup = formData.targetGroup

    }



    const res = await updateWelfare(currentId.value, data)

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

    await ElMessageBox.confirm('确定删除该公益性岗位吗, '提示')

    const res = await deleteWelfare(id)

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

    await ElMessageBox.confirm(`确定软删除选中的${selectedIds.value.length} 条记录吗？`, '提示')

    const res = await batchDeleteWelfare(selectedIds.value)

    if (res.data.code === 200) {

      ElMessage.success('批量软删除成功)

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '批量软删除失败)

    }

  } catch {

    // cancel

  }

}



const handleStatusChange = async (row: WelfareListVO, newStatus: string) => {

  try {

    const res = await updateWelfareStatus(row.id, { positionStatus: newStatus })

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

    const res = await preValidateWelfare(preValidateFile.value)

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

    const res = await importWelfare(importFile.value)

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

        <el-row :gutter="10">

          <el-col :span="6">

            <el-form-item label="岗位名称">

              <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="开发单位>

              <el-input v-model="queryParams.developingUnit" placeholder="开发单位 clearable style="width: 160px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="用工单位">

              <el-input v-model="queryParams.employingUnit" placeholder="用工单位" clearable style="width: 160px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="岗位类别">

              <el-select v-model="queryParams.positionCategory" placeholder="全部" clearable style="width: 140px">

                <el-option v-for="item in positionCategoryOptions" :key="item" :label="item" :value="item" />

              </el-select>

            </el-form-item>

          </el-col>

        </el-row>

        <el-row :gutter="10">

          <el-col :span="6">

            <el-form-item label="省份">

              <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="城市">

              <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 100px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="区域">

              <el-input v-model="queryParams.district" placeholder="请输入区域" clearable style="width: 100px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="最长服务年限>

              <el-input-number v-model="queryParams.maxServiceYears" :min="1" style="width: 120px" />

            </el-form-item>

          </el-col>

        </el-row>

        <el-row :gutter="10">

          <el-col :span="6">

            <el-form-item label="状态>

              <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 110px">

                <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />

              </el-select>

            </el-form-item>

          </el-col>

          <el-col :span="18">

            <el-form-item>

              <el-button type="primary" @click="handleSearch">查询</el-button>

              <el-button @click="handleReset">重置</el-button>

            </el-form-item>

          </el-col>

        </el-row>

      </el-form>

    </div>



    <div class="mb-4 flex items-center justify-between">

      <div class="flex items-center gap-2">

        <el-button type="warning" @click="openPreValidateDialog">Excel校验</el-button>

        <el-button type="success" @click="openImportDialog">Excel导入</el-button>

        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量软删除/el-button>

      </div>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="developingUnit" label="开发单位 width="140" show-overflow-tooltip />

        <el-table-column prop="employingUnit" label="用工单位" width="140" show-overflow-tooltip />

        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="positionCategory" label="岗位类别" width="100" />

        <el-table-column prop="province" label="省份" width="80" />

        <el-table-column prop="city" label="城市" width="80" />

        <el-table-column prop="district" label="区域" width="80" />

        <el-table-column prop="monthlySalary" label="月工资 width="120" show-overflow-tooltip />

        <el-table-column label="报名起止" width="200">

          <template #default="{ row }">

            <span>{{ row.regStartDate ? row.regStartDate.slice(0, 10) : '-' }} ~ {{ row.regEndDate ? row.regEndDate.slice(0, 10) : '-' }}</span>

          </template>

        </el-table-column>

        <el-table-column prop="positionStatus" label="状态 width="100" align="center">

          <template #default="{ row }">

            <el-tag :type="positionStatusTag[row.positionStatus] || 'info'" size="small">{{ row.positionStatus }}</el-tag>

          </template>

        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="180" />

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



    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="1000px" :close-on-click-modal="false" :destroy-on-close="true">

      <div v-loading="formLoading">

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="2" border>

            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="开发单位>{{ detailData.developingUnit }}</el-descriptions-item>

            <el-descriptions-item label="用工单位">{{ detailData.employingUnit || '-' }}</el-descriptions-item>

            <el-descriptions-item label="岗位名称" :span="2">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="岗位类别">{{ detailData.positionCategory }}</el-descriptions-item>

            <el-descriptions-item label="工作内容" :span="2">{{ detailData.workContent || '-' }}</el-descriptions-item>

            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>

            <el-descriptions-item label="城市">{{ detailData.city }}</el-descriptions-item>

            <el-descriptions-item label="区域">{{ detailData.district || '-' }}</el-descriptions-item>

            <el-descriptions-item label="工作地点" :span="2">{{ detailData.workLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="面向人群">{{ (detailData.targetGroup || []).join('、') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年龄范围">{{ detailData.ageRange || '-' }}</el-descriptions-item>

            <el-descriptions-item label="身体条件">{{ detailData.healthRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="户籍要求">{{ detailData.householdRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="困难认定">{{ detailData.employmentDifficultyCert ? '是' : '否' }}</el-descriptions-item>

            <el-descriptions-item label="其他要求" :span="2">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="合同期限">{{ detailData.contractPeriod || '-' }}</el-descriptions-item>

            <el-descriptions-item label="可续期">{{ detailData.isRenewable ? '是' : '否' }}</el-descriptions-item>

            <el-descriptions-item label="最长服务年限">{{ detailData.maxServiceYears ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="月工资">{{ detailData.monthlySalary || '-' }}</el-descriptions-item>

            <el-descriptions-item label="工资来源">{{ detailData.salarySource || '-' }}</el-descriptions-item>

            <el-descriptions-item label="补贴标准">{{ detailData.subsidyStandard || '-' }}</el-descriptions-item>

            <el-descriptions-item label="社保缴纳">{{ detailData.socialInsuranceInfo || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他福利" :span="2">{{ detailData.otherBenefits || '-' }}</el-descriptions-item>

            <el-descriptions-item label="工作时间">{{ detailData.workSchedule || '-' }}</el-descriptions-item>

            <el-descriptions-item label="是否倒班">{{ detailData.isShiftWork ? '是' : '否' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名方式">{{ detailData.applyMethod || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名地址" :span="2">{{ detailData.applyAddress || '-' }}</el-descriptions-item>

            <el-descriptions-item label="所需材料" :span="2">{{ detailData.requiredDocuments || '-' }}</el-descriptions-item>

            <el-descriptions-item label="状态>

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="联系人>{{ detailData.contactPerson || '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>

            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="单位与岗位信息 name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="开发单位>

                      <el-input v-model="formData.developingUnit" placeholder="开发单位 maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="用工单位">

                      <el-input v-model="formData.employingUnit" placeholder="用工单位" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="岗位名称">

                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="岗位类别">

                      <el-select v-model="formData.positionCategory" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in positionCategoryOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="工作内容">

                  <el-input v-model="formData.workContent" type="textarea" :rows="2" placeholder="工作内容" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="地区与报名要求 name="location">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="省份">

                      <el-input v-model="formData.province" placeholder="省份" maxlength="30" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="城市">

                      <el-input v-model="formData.city" placeholder="城市" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="区域">

                      <el-input v-model="formData.district" placeholder="请输入区域" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="工作地点">

                      <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="200" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="面向人群">

                      <el-select v-model="formData.targetGroup" placeholder="请选择" multiple clearable style="width: 100%">

                        <el-option label="低保" value="低保" />

                        <el-option label="残疾" value="残疾" />

                        <el-option label="零就业家庭 value="零就业家庭 />

                        <el-option label="退役军人 value="退役军人 />

                        <el-option label="高校毕业生 value="高校毕业生 />

                        <el-option label="其他" value="其他" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="学历要求">

                      <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="年龄范围">

                      <el-input v-model="formData.ageRange" placeholder="年龄范围" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="招聘人数">

                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="户籍要求">

                      <el-input v-model="formData.householdRequirement" placeholder="户籍要求" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="困难认定">

                      <el-switch v-model="formData.employmentDifficultyCert" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="身体条件">

                  <el-input v-model="formData.healthRequirement" placeholder="身体条件" maxlength="200" />

                </el-form-item>

                <el-form-item label="其他要求">

                  <el-input v-model="formData.otherRequirement" type="textarea" :rows="2" placeholder="其他要求" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="岗位期限与待遇 name="benefits">

              <el-form :model="formData" label-width="140px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="合同期限">

                      <el-input v-model="formData.contractPeriod" placeholder="合同期限" maxlength="30" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="可续期>

                      <el-switch v-model="formData.isRenewable" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="最长服务年限>

                      <el-input-number v-model="formData.maxServiceYears" :min="1" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="月工资>

                      <el-input v-model="formData.monthlySalary" placeholder="月工资 maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="工资来源">

                      <el-input v-model="formData.salarySource" placeholder="工资来源" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="补贴标准">

                      <el-input v-model="formData.subsidyStandard" placeholder="补贴标准" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="社保缴纳">

                      <el-input v-model="formData.socialInsuranceInfo" placeholder="社保缴纳" maxlength="200" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="排序">

                      <el-input-number v-model="formData.sortOrder" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="其他福利">

                  <el-input v-model="formData.otherBenefits" type="textarea" :rows="2" placeholder="其他福利" />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="工作时间">

                      <el-input v-model="formData.workSchedule" placeholder="工作时间" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="是否倒班">

                      <el-switch v-model="formData.isShiftWork" />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="报名与补录 name="exam">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="报名开始>

                      <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始 style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="报名截止">

                      <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="状态>

                      <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">

                        <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="联系电话">

                      <el-input v-model="formData.contactPhone" placeholder="联系电话" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="联系人>

                      <el-input v-model="formData.contactPerson" placeholder="联系人 maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="报名方式">

                  <el-input v-model="formData.applyMethod" placeholder="报名方式" />

                </el-form-item>

                <el-form-item label="报名地址">

                  <el-input v-model="formData.applyAddress" placeholder="报名地址" maxlength="200" />

                </el-form-item>

                <el-form-item label="所需材料">

                  <el-input v-model="formData.requiredDocuments" type="textarea" :rows="2" placeholder="所需材料" />

                </el-form-item>

                <el-form-item label="备注">

                  <el-input v-model="formData.remark" type="textarea" :rows="2" placeholder="备注" />

                </el-form-item>

                <el-form-item label="详细说明">

                  <el-input v-model="formData.content" type="textarea" :rows="3" placeholder="详细说明" />

                </el-form-item>

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



    <el-dialog v-model="preValidateDialogVisible" title="Excel校验" width="500px">

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

