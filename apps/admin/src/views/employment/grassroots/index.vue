<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getGrassrootsPage,

  getGrassrootsDetail,

  updateGrassroots,

  deleteGrassroots,

  updateGrassrootsStatus,

  batchDeleteGrassroots,

  preValidateGrassroots,

  importGrassroots,

} from '@/api/employment/grassroots'

import type {

  GrassrootsListVO,

  GrassrootsDetailVO,

  GrassrootsQueryDTO,

} from '@/types/employment/grassroots'



const loading = ref(false)

const tableData = ref<GrassrootsListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<GrassrootsQueryDTO>({

  page: 1,

  size: 10,

  positionName: '',

  organizingDept: '',

  serviceUnit: '',

  projectType: '',

  year: '',

  serviceType: '',

  province: '',

  city: '',

  county: '',

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<GrassrootsDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  projectType: '',

  year: '',

  positionName: '',

  serviceType: '',

  organizingDept: '',

  serviceUnit: '',

  province: '',

  city: '',

  county: '',

  township: '',

  servicePeriod: '',

  serviceStartDate: '',

  serviceEndDate: '',

  educationRequirement: '',

  majorRequirement: '',

  ageLimit: null,

  recruitmentCount: null,

  gradYearRequirement: '',

  householdRequirement: '',

  politicalStatus: '',

  otherRequirement: '',

  examContent: '',

  examTime: '',

  interviewForm: '',

  monthlySubsidy: '',

  socialInsurance: '',

  housingInfo: '',

  otherBenefits: '',

  afterServicePolicy: '',

  canTransferToCivil: false,

  canTransferToInstitution: false,

  examBonusPoints: '',

  tuitionCompensation: '',

  postgradBonus: '',

  regStartDate: '',

  regEndDate: '',

  applyLink: '',

  positionStatus: '招募中',

  contactPhone: '',

  remark: '',

  content: '',

  sortOrder: null,

})



const projectTypeOptions = ['三支一扶', '西部计划']

const serviceTypeOptions = ['支教', '支农', '支医', '帮扶乡村振兴', '基础教育', '服务三农', '医疗卫生', '基层青年工作', '基层社会管理', '服务新疆', '服务西藏']

const educationOptions = ['大专', '本科', '硕士', '大专及以上', '本科及以上']

const positionStatusOptions = ['招募中', '已结束', '即将开始']



const positionStatusTag: Record<string, 'success' | 'info' | 'warning'> = {

  '招募中': 'success',

  '已结束': 'info',

  '即将开始': 'warning',

}



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.organizingDept) params.organizingDept = queryParams.organizingDept

    if (queryParams.serviceUnit) params.serviceUnit = queryParams.serviceUnit

    if (queryParams.projectType) params.projectType = queryParams.projectType

    if (queryParams.year) params.year = queryParams.year

    if (queryParams.serviceType) params.serviceType = queryParams.serviceType

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.city) params.city = queryParams.city

    if (queryParams.county) params.county = queryParams.county

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getGrassrootsPage(params as GrassrootsQueryDTO)

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

  queryParams.organizingDept = ''

  queryParams.serviceUnit = ''

  queryParams.projectType = ''

  queryParams.year = ''

  queryParams.serviceType = ''

  queryParams.province = ''

  queryParams.city = ''

  queryParams.county = ''

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



const handleSelectionChange = (rows: GrassrootsListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder'].includes(k) ? null : ''

  })

  formData.positionStatus = '招募中'

  formData.canTransferToCivil = false

  formData.canTransferToInstitution = false

}



const fillForm = (d: GrassrootsDetailVO) => {

  formData.projectType = d.projectType || ''

  formData.year = d.year || ''

  formData.positionName = d.positionName || ''

  formData.serviceType = d.serviceType || ''

  formData.organizingDept = d.organizingDept || ''

  formData.serviceUnit = d.serviceUnit || ''

  formData.province = d.province || ''

  formData.city = d.city || ''

  formData.county = d.county || ''

  formData.township = d.township || ''

  formData.servicePeriod = d.servicePeriod || ''

  formData.serviceStartDate = d.serviceStartDate || ''

  formData.serviceEndDate = d.serviceEndDate || ''

  formData.educationRequirement = d.educationRequirement || ''

  formData.majorRequirement = d.majorRequirement || ''

  formData.ageLimit = d.ageLimit ?? null

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.gradYearRequirement = d.gradYearRequirement || ''

  formData.householdRequirement = d.householdRequirement || ''

  formData.politicalStatus = d.politicalStatus || ''

  formData.otherRequirement = d.otherRequirement || ''

  formData.examContent = d.examContent || ''

  formData.examTime = d.examTime || ''

  formData.interviewForm = d.interviewForm || ''

  formData.monthlySubsidy = d.monthlySubsidy || ''

  formData.socialInsurance = d.socialInsurance || ''

  formData.housingInfo = d.housingInfo || ''

  formData.otherBenefits = d.otherBenefits || ''

  formData.afterServicePolicy = d.afterServicePolicy || ''

  formData.canTransferToCivil = d.canTransferToCivil ?? false

  formData.canTransferToInstitution = d.canTransferToInstitution ?? false

  formData.examBonusPoints = d.examBonusPoints || ''

  formData.tuitionCompensation = d.tuitionCompensation || ''

  formData.postgradBonus = d.postgradBonus || ''

  formData.regStartDate = d.regStartDate || ''

  formData.regEndDate = d.regEndDate || ''

  formData.applyLink = d.applyLink || ''

      formData.positionStatus = d.positionStatus || '招募中'


  formData.contactPhone = d.contactPhone || ''

  formData.remark = d.remark || ''

  formData.content = d.content || ''

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'edit' && id) {

    dialogTitle.value = '修改基层服务项目岗位'

    formLoading.value = true

    try {

      const res = await getGrassrootsDetail(id)

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

    dialogTitle.value = '基层服务项目详情'

    formLoading.value = true

    try {

      const res = await getGrassrootsDetail(id)

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

    const stringFields = ['projectType', 'year', 'positionName', 'serviceType', 'organizingDept', 'serviceUnit', 'province', 'city', 'county', 'township', 'servicePeriod', 'serviceStartDate', 'serviceEndDate', 'educationRequirement', 'majorRequirement', 'gradYearRequirement', 'householdRequirement', 'politicalStatus', 'otherRequirement', 'examContent', 'examTime', 'interviewForm', 'monthlySubsidy', 'socialInsurance', 'housingInfo', 'otherBenefits', 'afterServicePolicy', 'examBonusPoints', 'tuitionCompensation', 'postgradBonus', 'regStartDate', 'regEndDate', 'applyLink', 'positionStatus', 'contactPhone', 'remark', 'content']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })

    const booleanFields = ['canTransferToCivil', 'canTransferToInstitution']

    booleanFields.forEach((f) => {

      data[f] = !!formData[f]

    })



    const res = await updateGrassroots(currentId.value, data)

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

    await ElMessageBox.confirm('确定删除该基层服务项目岗位吗', '提示')

    const res = await deleteGrassroots(id)

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

    const res = await batchDeleteGrassroots(selectedIds.value)

    if (res.data.code === 200) {

      ElMessage.success('批量软删除成功')

      selectedIds.value = []

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '批量软删除失败')

    }

  } catch {

    // cancel

  }

}



const handleStatusChange = async (row: GrassrootsListVO, newStatus: string) => {

  try {

    const res = await updateGrassrootsStatus(row.id, { positionStatus: newStatus })

    if (res.data.code === 200) {

      ElMessage.success('状态更新成功')

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

    const res = await preValidateGrassroots(preValidateFile.value)

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

    const res = await importGrassroots(importFile.value)

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

            <el-form-item label="组织单位">

              <el-input v-model="queryParams.organizingDept" placeholder="组织单位" clearable style="width: 160px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="服务单位">

              <el-input v-model="queryParams.serviceUnit" placeholder="服务单位" clearable style="width: 160px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="项目类型">

              <el-select v-model="queryParams.projectType" placeholder="全部" clearable style="width: 120px">

                <el-option v-for="item in projectTypeOptions" :key="item" :label="item" :value="item" />

              </el-select>

            </el-form-item>

          </el-col>

        </el-row>

        <el-row :gutter="10">

          <el-col :span="6">

            <el-form-item label="招募年份">

              <el-input v-model="queryParams.year" placeholder="招募年份" clearable style="width: 160px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="服务类型">

              <el-select v-model="queryParams.serviceType" placeholder="全部" clearable style="width: 160px">

                <el-option v-for="item in serviceTypeOptions" :key="item" :label="item" :value="item" />

              </el-select>

            </el-form-item>

          </el-col>

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

        </el-row>

        <el-row :gutter="10">

          <el-col :span="6">

            <el-form-item label="区域">

              <el-input v-model="queryParams.county" placeholder="请输入区域" clearable style="width: 100px" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="状态">

              <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 110px">

                <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />

              </el-select>

            </el-form-item>

          </el-col>

          <el-col :span="12">

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

        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量软删除</el-button>

      </div>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="projectType" label="项目类型" width="100" />

        <el-table-column prop="year" label="招募年份" width="90" />

        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="serviceType" label="服务类型" width="100" show-overflow-tooltip />

        <el-table-column prop="organizingDept" label="组织单位" width="140" show-overflow-tooltip />

        <el-table-column prop="serviceUnit" label="服务单位" width="140" show-overflow-tooltip />

        <el-table-column prop="province" label="省份" width="80" />

        <el-table-column prop="city" label="城市" width="80" />

        <el-table-column prop="county" label="区域" width="80" />

        <el-table-column prop="positionStatus" label="状态" width="100" align="center">

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

            <el-descriptions-item label="项目类型">{{ detailData.projectType }}</el-descriptions-item>

            <el-descriptions-item label="招募年份">{{ detailData.year }}</el-descriptions-item>

            <el-descriptions-item label="岗位名称" :span="2">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="服务类型">{{ detailData.serviceType }}</el-descriptions-item>

            <el-descriptions-item label="组织单位">{{ detailData.organizingDept || '-' }}</el-descriptions-item>

            <el-descriptions-item label="服务单位">{{ detailData.serviceUnit || '-' }}</el-descriptions-item>

            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>

            <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>

            <el-descriptions-item label="区域">{{ detailData.county || '-' }}</el-descriptions-item>

            <el-descriptions-item label="乡镇/街道">{{ detailData.township || '-' }}</el-descriptions-item>

            <el-descriptions-item label="服务期限">{{ detailData.servicePeriod || '-' }}</el-descriptions-item>

            <el-descriptions-item label="服务开始日期">{{ detailData.serviceStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="服务结束日期">{{ detailData.serviceEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="招募人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="毕业年份要求">{{ detailData.gradYearRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="户籍要求">{{ detailData.householdRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="政治面貌">{{ detailData.politicalStatus || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他要求" :span="2">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="笔试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="面试形式">{{ detailData.interviewForm || '-' }}</el-descriptions-item>

            <el-descriptions-item label="月补贴标准">{{ detailData.monthlySubsidy || '-' }}</el-descriptions-item>

            <el-descriptions-item label="社保缴纳">{{ detailData.socialInsurance || '-' }}</el-descriptions-item>

            <el-descriptions-item label="住房安排">{{ detailData.housingInfo || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他待遇" :span="2">{{ detailData.otherBenefits || '-' }}</el-descriptions-item>

            <el-descriptions-item label="期满政策" :span="2">{{ detailData.afterServicePolicy || '-' }}</el-descriptions-item>

            <el-descriptions-item label="可定向考公">{{ detailData.canTransferToCivil ? '是' : '否' }}</el-descriptions-item>

            <el-descriptions-item label="可转事业编">{{ detailData.canTransferToInstitution ? '是' : '否' }}</el-descriptions-item>

            <el-descriptions-item label="考试加分">{{ detailData.examBonusPoints || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学费补偿">{{ detailData.tuitionCompensation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考研加分">{{ detailData.postgradBonus || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名链接">

              <template v-if="detailData.applyLink">

                <el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link>

              </template>

              <template v-else>-</template>

            </el-descriptions-item>

            <el-descriptions-item label="状态">

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>

            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="项目与岗位信息" name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="项目类型">

                      <el-select v-model="formData.projectType" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in projectTypeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="招募年份">

                      <el-input v-model="formData.year" placeholder="招募年份" maxlength="10" show-word-limit />

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

                    <el-form-item label="服务类型">

                      <el-select v-model="formData.serviceType" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in serviceTypeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="组织单位">

                      <el-input v-model="formData.organizingDept" placeholder="组织单位" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="服务单位">

                      <el-input v-model="formData.serviceUnit" placeholder="服务单位" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="服务地点与要求" name="location">

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

                      <el-input v-model="formData.county" placeholder="请输入区域" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="乡镇/街道">

                      <el-input v-model="formData.township" placeholder="乡镇/街道" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="服务期限">

                      <el-input v-model="formData.servicePeriod" placeholder="服务期限" maxlength="30" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="服务开始日期">

                      <el-input v-model="formData.serviceStartDate" placeholder="服务开始日期" maxlength="30" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="服务结束日期">

                      <el-input v-model="formData.serviceEndDate" placeholder="服务结束日期" maxlength="30" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="学历要求">

                      <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="年龄上限">

                      <el-input-number v-model="formData.ageLimit" :min="18" :max="35" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="招募人数">

                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="毕业年份要求">

                      <el-input v-model="formData.gradYearRequirement" placeholder="毕业年份要求" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="专业要求">

                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="户籍要求">

                      <el-input v-model="formData.householdRequirement" placeholder="户籍要求" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="政治面貌">

                      <el-input v-model="formData.politicalStatus" placeholder="政治面貌" maxlength="30" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="其他要求">

                  <el-input v-model="formData.otherRequirement" type="textarea" :rows="2" placeholder="其他要求" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="待遇与期满政策" name="benefits">

              <el-form :model="formData" label-width="140px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="月补贴标准">

                      <el-input v-model="formData.monthlySubsidy" placeholder="月补贴标准" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="社保缴纳">

                      <el-input v-model="formData.socialInsurance" placeholder="社保缴纳" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="住房安排">

                      <el-input v-model="formData.housingInfo" placeholder="住房安排" maxlength="200" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="考试加分">

                      <el-input v-model="formData.examBonusPoints" placeholder="考试加分" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="学费补偿">

                      <el-input v-model="formData.tuitionCompensation" placeholder="学费补偿" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="考研加分">

                      <el-input v-model="formData.postgradBonus" placeholder="考研加分" maxlength="100" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="其他待遇">

                  <el-input v-model="formData.otherBenefits" type="textarea" :rows="2" placeholder="其他待遇" />

                </el-form-item>

                <el-form-item label="期满政策">

                  <el-input v-model="formData.afterServicePolicy" type="textarea" :rows="2" placeholder="期满政策" />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="可定向考公">

                      <el-switch v-model="formData.canTransferToCivil" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="可转事业编">

                      <el-switch v-model="formData.canTransferToInstitution" />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="考试与报名" name="exam">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="笔试内容">

                  <el-input v-model="formData.examContent" type="textarea" :rows="2" placeholder="笔试内容" maxlength="500" show-word-limit />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="考试时间">

                      <el-input v-model="formData.examTime" placeholder="考试时间" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="面试形式">

                      <el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="100" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="报名开始">

                      <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="报名截止">

                      <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名截止" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="排序">

                      <el-input-number v-model="formData.sortOrder" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

            <el-form-item label="状态">

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

                <el-form-item label="报名链接">

                  <el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" />

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

        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

        <template #tip>

          <div class="el-upload__tip">仅支持.xlsx / .xls 格式</div>

        </template>

      </el-upload>

      <template #footer>

        <el-button @click="preValidateDialogVisible = false">取消</el-button>

        <el-button type="warning" :loading="preValidateLoading" @click="handlePreValidateSubmit">开始校验</el-button>

      </template>

    </el-dialog>



    <el-dialog v-model="importDialogVisible" title="Excel导入" width="500px">

      <el-upload

        drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls"

        :on-change="handleImportFileChange" :limit="1"

      >

        <el-icon class="el-icon--upload" style="font-size: 48px"><UploadFilled /></el-icon>

        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

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

