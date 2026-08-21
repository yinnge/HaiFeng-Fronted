<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import { Search } from '@element-plus/icons-vue'

import {

  getIndustryPage,

  getIndustryDetail,

  addIndustry,

  updateIndustry,

  updateIndustryDetail,

  updateIndustryStatus,

  deleteIndustry,

  batchDeleteIndustry,

  importIndustry,

  importIndustryDetail,

} from '@/api/industry'

import type {

  IndustryListVO,

  IndustryDetailVO,

  IndustryQueryDTO,

} from '@/types/industry'



const loading = ref(false)

const tableData = ref<IndustryListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<IndustryQueryDTO>({

  page: 1,

  size: 10,

  industryName: '',

  category: '',

  talentTrend: undefined,

  isDeleted: undefined,

})

const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<IndustryDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  industryName: '',

  category: '',

  iconClass: '',

  description: '',

  annualGrowthRate: null,

  marketScale: '',

  talentGap: '',

  investmentHeat: null,

  growthTrend: '',

  marketTrend: '',

  talentTrend: '',

  investmentTrend: '',

})



const detailForm = reactive<Record<string, any>>({

  shortDescription: '',

  detailedDescription: '',

  industryScale: {

    scaleValue: null,

    scaleLabel: '',

    scaleDescriptions: [] as string[],

  },

  industryTalentDemand: {

    demandValue: null,

    demandLabel: '',

    demandDescriptions: [] as string[],

  },

  industrySalary: {

    salaryRange: '',

    salaryLabel: '',

    salaryDescriptions: [] as string[],

  },

  policyInfo: {

    policyOverview: '',

    nationalPolicies: [] as string[],

    policyHighlights: '',

  },

  developmentSupportInfo: {

    regionalOverview: '',

    keyCities: [] as string[],

    cityPolicies: [] as string[],

  },

  talentAnalysis: {

    analysisTitle: '',

    shortagePositions: [] as string[],

    educationRequirement: '',

    majorRequirement: '',

    talentTrendDescription: '',

  },

  talentPolicy: {

    policyTitle: '',

    nationalPolicies: [] as string[],

    localPolicies: [] as string[],

    enterpriseDescription: '',

  },

  salaryData: {

    salaryAnalysisTitle: '',

    salaryAnalysisDescription: '',

    regionalSalaryTitle: '',

    regionalSalaryDescription: '',

    salaryTrendAnalysis: '',

  },

})



const importDialogVisible = ref(false)

const importType = ref<'main' | 'detail'>('main')

const importFile = ref<File | null>(null)

const importLoading = ref(false)



const trendOptions = ['上升', '稳定', '下降']

const hotPositionOptions = ['算法工程师', '数据科学家', '软件开发工程师', '架构师', '产品经理', '数据分析师', '测试工程师', '运维工程师', '市场营销', '销售工程师', '项目经理', '智能制造工程师', '新能源研发工程师']

const keyCityOptions = ['北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安', '苏州', '南京']

const nationalPolicyOptions = ['十四五规划', '新基建', '专精特新', '数字中国', '人工智能+', '绿色发展']

const educationRequirementOptions = ['不限', '大专及以上', '本科及以上', '硕士及以上', '博士']

const talentDemandLabelOptions = ['紧缺人才', '高技能人才紧缺', '复合型人才急需', '基础人才充足']



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.industryName) params.industryName = queryParams.industryName

    if (queryParams.category) params.category = queryParams.category

    if (queryParams.talentTrend) params.talentTrend = queryParams.talentTrend

    if (queryParams.isDeleted !== undefined) params.isDeleted = queryParams.isDeleted

    const res = await getIndustryPage(params as IndustryQueryDTO)

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

  queryParams.industryName = ''

  queryParams.category = ''

  queryParams.talentTrend = undefined

  queryParams.isDeleted = undefined

  queryParams.page = 1

  fetchData()

}



const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }



const handleSizeChange = (size: number) => {

  queryParams.size = size

  queryParams.page = 1

  fetchData()

}



const handleSelectionChange = (rows: IndustryListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  formData.industryName = ''

  formData.category = ''

  formData.iconClass = ''

  formData.description = ''

  formData.annualGrowthRate = null

  formData.marketScale = ''

  formData.talentGap = ''

  formData.investmentHeat = null

  formData.growthTrend = ''

  formData.marketTrend = ''

  formData.talentTrend = ''

  formData.investmentTrend = ''

  resetDetailForm()

}

const resetDetailForm = () => {

  detailForm.shortDescription = ''

  detailForm.detailedDescription = ''

  detailForm.industryScale = { scaleValue: null, scaleLabel: '', scaleDescriptions: [] }

  detailForm.industryTalentDemand = { demandValue: null, demandLabel: '', demandDescriptions: [] }

  detailForm.industrySalary = { salaryRange: '', salaryLabel: '', salaryDescriptions: [] }

  detailForm.policyInfo = { policyOverview: '', nationalPolicies: [], policyHighlights: '' }

  detailForm.developmentSupportInfo = { regionalOverview: '', keyCities: [], cityPolicies: [] }

  detailForm.talentAnalysis = { analysisTitle: '', shortagePositions: [], educationRequirement: '', majorRequirement: '', talentTrendDescription: '' }

  detailForm.talentPolicy = { policyTitle: '', nationalPolicies: [], localPolicies: [], enterpriseDescription: '' }

  detailForm.salaryData = { salaryAnalysisTitle: '', salaryAnalysisDescription: '', regionalSalaryTitle: '', regionalSalaryDescription: '', salaryTrendAnalysis: '' }

}



const fillForm = (d: IndustryDetailVO) => {

  formData.industryName = d.industryName

  formData.category = d.category || ''

  formData.iconClass = d.iconClass || ''

  formData.description = d.description || ''

  formData.annualGrowthRate = d.annualGrowthRate

  formData.marketScale = d.marketScale || ''

  formData.talentGap = d.talentGap || ''

  formData.investmentHeat = d.investmentHeat

  formData.growthTrend = d.growthTrend || ''

  formData.marketTrend = d.marketTrend || ''

  formData.talentTrend = d.talentTrend || ''

  formData.investmentTrend = d.investmentTrend || ''

}



const fillDetailForm = (d: IndustryDetailVO) => {

  detailForm.shortDescription = d.shortDescription || ''

  detailForm.detailedDescription = d.detailedDescription || ''

  const obj = d as any

  const pick = (field: string, defaults: Record<string, any>) => {

    const src = obj[field]

    if (src && typeof src === 'object' && !Array.isArray(src)) {

      const out: Record<string, any> = {}

      Object.keys(defaults).forEach((k) => {

        const v = src[k]

        out[k] = Array.isArray(defaults[k]) ? (Array.isArray(v) ? v : []) : (v ?? defaults[k])

      })

      return out

    }

    return { ...defaults }

  }

  detailForm.industryScale = pick('industryScale', { scaleValue: null, scaleLabel: '', scaleDescriptions: [] })

  detailForm.industryTalentDemand = pick('industryTalentDemand', { demandValue: null, demandLabel: '', demandDescriptions: [] })

  detailForm.industrySalary = pick('industrySalary', { salaryRange: '', salaryLabel: '', salaryDescriptions: [] })

  detailForm.policyInfo = pick('policyInfo', { policyOverview: '', nationalPolicies: [], policyHighlights: '' })

  detailForm.developmentSupportInfo = pick('developmentSupportInfo', { regionalOverview: '', keyCities: [], cityPolicies: [] })

  detailForm.talentAnalysis = pick('talentAnalysis', { analysisTitle: '', shortagePositions: [], educationRequirement: '', majorRequirement: '', talentTrendDescription: '' })

  detailForm.talentPolicy = pick('talentPolicy', { policyTitle: '', nationalPolicies: [], localPolicies: [], enterpriseDescription: '' })

  detailForm.salaryData = pick('salaryData', { salaryAnalysisTitle: '', salaryAnalysisDescription: '', regionalSalaryTitle: '', regionalSalaryDescription: '', salaryTrendAnalysis: '' })

}



const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'add') {

    dialogTitle.value = '新增行业'

    resetForm()

    detailData.value = null

  } else if (mode === 'edit' && id) {

    dialogTitle.value = '修改行业'

    formLoading.value = true

    try {

      const res = await getIndustryDetail(id)

      if (res.data.code === 200) {

        fillForm(res.data.data)

        fillDetailForm(res.data.data)

      }

    } catch { ElMessage.error('获取详情失败') }

    finally { formLoading.value = false }

    detailData.value = null

  } else if (mode === 'detail' && id) {

    dialogTitle.value = '行业详情'

    formLoading.value = true

    try {

      const res = await getIndustryDetail(id)

      if (res.data.code === 200) detailData.value = res.data.data

    } catch { ElMessage.error('获取详情失败') }

    finally { formLoading.value = false }

  }

  dialogVisible.value = true

}



const buildBasicData = () => {

  const data: Record<string, any> = { industryName: formData.industryName }

  if (formData.category) data.category = formData.category

  if (formData.iconClass) data.iconClass = formData.iconClass

  if (formData.description) data.description = formData.description

  if (formData.annualGrowthRate !== null) data.annualGrowthRate = formData.annualGrowthRate

  if (formData.marketScale) data.marketScale = formData.marketScale

  if (formData.talentGap) data.talentGap = formData.talentGap

  if (formData.investmentHeat !== null) data.investmentHeat = formData.investmentHeat

  if (formData.growthTrend) data.growthTrend = formData.growthTrend

  if (formData.marketTrend) data.marketTrend = formData.marketTrend

  if (formData.talentTrend) data.talentTrend = formData.talentTrend

  if (formData.investmentTrend) data.investmentTrend = formData.investmentTrend

  return data

}



const buildDetailData = () => {

  const data: Record<string, any> = {}

  if (detailForm.shortDescription) data.shortDescription = detailForm.shortDescription

  if (detailForm.detailedDescription) data.detailedDescription = detailForm.detailedDescription

  const build = (field: string, defs: Record<string, 'string' | 'number' | 'array'>) => {

    const src = detailForm[field]

    if (!src || typeof src !== 'object') return

    const out: Record<string, any> = {}

    let has = false

    Object.keys(defs).forEach((k) => {

      const v = src[k]

      if (defs[k] === 'array') {

        if (Array.isArray(v) && v.length) { out[k] = v; has = true }

      } else if (v !== null && v !== undefined && v !== '') {

        out[k] = v; has = true

      }

    })

    if (has) data[field] = out

  }

  build('industryScale', { scaleValue: 'number', scaleLabel: 'string', scaleDescriptions: 'array' })

  build('industryTalentDemand', { demandValue: 'number', demandLabel: 'string', demandDescriptions: 'array' })

  build('industrySalary', { salaryRange: 'string', salaryLabel: 'string', salaryDescriptions: 'array' })

  build('policyInfo', { policyOverview: 'string', nationalPolicies: 'array', policyHighlights: 'string' })

  build('developmentSupportInfo', { regionalOverview: 'string', keyCities: 'array', cityPolicies: 'array' })

  build('talentAnalysis', { analysisTitle: 'string', shortagePositions: 'array', educationRequirement: 'string', majorRequirement: 'string', talentTrendDescription: 'string' })

  build('talentPolicy', { policyTitle: 'string', nationalPolicies: 'array', localPolicies: 'array', enterpriseDescription: 'string' })

  build('salaryData', { salaryAnalysisTitle: 'string', salaryAnalysisDescription: 'string', regionalSalaryTitle: 'string', regionalSalaryDescription: 'string', salaryTrendAnalysis: 'string' })

  return data

}



const handleSubmit = async () => {

  if (dialogMode.value === 'detail') return

  if (!formData.industryName) { ElMessage.warning('请填写行业名称'); return }

  if (!formData.category) { ElMessage.warning('请填写行业分类'); return }

  const basicData = buildBasicData()

  const detailData = buildDetailData()

  try {

    if (dialogMode.value === 'add') {

      const res = await addIndustry({ ...basicData, ...detailData } as any)

      if (res.data.code !== 200) { ElMessage.error(res.data.msg || '新增失败'); return }

      ElMessage.success('新增行业成功')

    } else if (dialogMode.value === 'edit' && currentId.value) {

      const res = await updateIndustry(currentId.value, basicData)

      if (res.data.code !== 200) { ElMessage.error(res.data.msg || '保存失败'); return }

      const detailRes = await updateIndustryDetail(currentId.value, detailData)

      if (detailRes.data.code !== 200) { ElMessage.error(detailRes.data.msg || '保存失败'); return }

      ElMessage.success('保存成功')

    } else {

      return

    }

    dialogVisible.value = false

    fetchData()

  } catch (err: any) {

    ElMessage.error(err?.message || '保存失败')

  }

}



const handleToggleStatus = async (row: IndustryListVO) => {

  const newStatus = !row.isDeleted

  const actionText = newStatus ? '禁用' : '启用'

  try {

    await ElMessageBox.confirm(`确定${actionText}该行业吗？`, '提示')

    const res = await updateIndustryStatus(row.id, { isDeleted: newStatus })

    if (res.data.code === 200) { ElMessage.success(`${actionText}成功`); fetchData() }

    else { ElMessage.error(res.data.msg || '操作失败') }

  } catch { /* cancel */ }

}



const handleDelete = async (id: string) => {

  try {

    await ElMessageBox.confirm('确定要永久删除该行业吗？此操作不可恢复！', '警告', {

      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',

    })

    const res = await deleteIndustry(id)

    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }

    else { ElMessage.error(res.data.msg || '删除失败') }

  } catch { /* cancel */ }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的行业'); return }

  try {

    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 条行业记录吗？此操作不可恢复！`, '警告', {

      type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消',

    })

    const res = await batchDeleteIndustry(selectedIds.value as unknown as number[])

    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() }

    else { ElMessage.error(res.data.msg || '批量删除失败') }

  } catch { /* cancel */ }

}



const openImportDialog = (type: 'main' | 'detail') => {

  importType.value = type

  importFile.value = null

  importDialogVisible.value = true

}



const handleImportFileChange = (uploadFile: any) => {

  importFile.value = uploadFile.raw

  return false

}



const handleImportSubmit = async () => {

  if (!importFile.value) { ElMessage.warning('请选择文件'); return }

  importLoading.value = true

  try {

    const fn = importType.value === 'main' ? importIndustry : importIndustryDetail

    const res = await fn(importFile.value)

    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }

    else { ElMessage.error(res.data.msg || '导入失败') }

  } catch (err: any) { ElMessage.error(err.response?.data?.msg || err.message || '导入失败') }

  finally { importLoading.value = false }

}



const statusTag = (val: boolean) => (val ? 'info' : 'success')

const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

const trendTag = (val: string) => val === '上升' ? 'success' : val === '稳定' ? 'warning' : val === '下降' ? 'danger' : 'info'



onMounted(() => { fetchData() })

</script>



<template>

  <div class="page-wrap">

    <!-- Watermarks -->

    <img src="@/assets/images/logo-main.png" class="watermark watermark-tr" alt="" />

    <img src="@/assets/images/logo-main.png" class="watermark watermark-bl" alt="" />



    <!-- Page Header -->

    <div class="page-header">

      <h1 class="page-title">行业管理</h1>

      <p class="page-subtitle">管理行业信息、查看行业详情、导入导出数据</p>

    </div>



    <!-- Search Card -->

    <div class="search-card">

      <div class="section-label">

        <el-icon :size="14"><Search /></el-icon>

        <span style="margin-left: 6px;">搜索筛选</span>

      </div>

      <el-form :model="queryParams" inline>

        <el-form-item label="行业名称">

          <el-input v-model="queryParams.industryName" placeholder="行业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="行业分类">

          <el-input v-model="queryParams.category" placeholder="分类模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="人才趋势">

          <el-select v-model="queryParams.talentTrend" placeholder="全部" clearable style="width: 120px">

            <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="状态">

          <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 100px">

            <el-option label="启用" :value="false" />

            <el-option label="禁用" :value="true" />

          </el-select>

        </el-form-item>

        <el-form-item>

          <button type="button" class="btn-search" @click="handleSearch">查询</button>

          <button type="button" class="btn-reset" @click="handleReset">重置</button>

        </el-form-item>

      </el-form>

    </div>



    <!-- Action Bar -->

    <div class="action-bar">

      <div class="action-left">

        <button type="button" class="btn-primary" @click="openDialog('add')">新增行业</button>

        <el-dropdown trigger="click">

          <button type="button" class="btn-outline">

            Excel导入

            <span class="dropdown-arrow">▼</span>

          </button>

          <template #dropdown>

            <el-dropdown-menu>

              <el-dropdown-item @click="openImportDialog('main')">导入行业主表</el-dropdown-item>

              <el-dropdown-item @click="openImportDialog('detail')">导入行业详情</el-dropdown-item>

            </el-dropdown-menu>

          </template>

        </el-dropdown>

        <button type="button" class="btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</button>

      </div>

      <button type="button" class="btn-refresh" @click="fetchData">刷新</button>

    </div>



    <!-- Table Card -->

    <div class="table-card">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange" class="industry-table">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="industryName" label="行业名称" min-width="180" />

        <el-table-column prop="category" label="行业分类" width="120" />

        <el-table-column prop="talentTrend" label="人才趋势" width="100" align="center">

          <template #default="{ row }">

            <span v-if="row.talentTrend" :class="['trend-pill', `trend-${trendTag(row.talentTrend)}`]">{{ row.talentTrend }}</span>

          </template>

        </el-table-column>

        <el-table-column prop="annualGrowthRate" label="年增长率(%)" width="110" align="right" />

        <el-table-column prop="isDeleted" label="状态" width="80" align="center">

          <template #default="{ row }">

            <span :class="['status-pill', row.isDeleted ? 'status-disabled' : 'status-enabled']">

              {{ statusLabel(row.isDeleted) }}

            </span>

          </template>

        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="180" />

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <button type="button" class="btn-action btn-action-detail" @click="openDialog('detail', row.id)">详情</button>

            <button type="button" class="btn-action btn-action-edit" @click="openDialog('edit', row.id)">修改</button>

            <button type="button" :class="['btn-action', row.isDeleted ? 'btn-action-enable' : 'btn-action-disable']" @click="handleToggleStatus(row)">

              {{ row.isDeleted ? '启用' : '禁用' }}

            </button>

            <button type="button" class="btn-action btn-action-delete" @click="handleDelete(row.id)">永久删除</button>

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



    <!-- Main Dialog -->

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="850px" :close-on-click-modal="false" :destroy-on-close="true" class="uni-dialog">

      <div v-loading="formLoading">

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="2" border>

            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="行业名称">{{ detailData.industryName }}</el-descriptions-item>

            <el-descriptions-item label="行业分类">{{ detailData.category || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年增长率(%)">{{ detailData.annualGrowthRate ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="市场规模">{{ detailData.marketScale || '-' }}</el-descriptions-item>

            <el-descriptions-item label="人才缺口">{{ detailData.talentGap || '-' }}</el-descriptions-item>

            <el-descriptions-item label="投资热度(%)">{{ detailData.investmentHeat ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="增长趋势">{{ detailData.growthTrend || '-' }}</el-descriptions-item>

            <el-descriptions-item label="市场趋势">{{ detailData.marketTrend || '-' }}</el-descriptions-item>

            <el-descriptions-item label="人才趋势">{{ detailData.talentTrend || '-' }}</el-descriptions-item>

            <el-descriptions-item label="投资趋势">{{ detailData.investmentTrend || '-' }}</el-descriptions-item>

            <el-descriptions-item label="状态" :span="2">

              <span :class="['status-pill', detailData.isDeleted ? 'status-disabled' : 'status-enabled']">

                {{ statusLabel(detailData.isDeleted) }}

              </span>

            </el-descriptions-item>

            <el-descriptions-item label="行业描述" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>

            <el-descriptions-item label="简短描述" :span="2">{{ detailData.shortDescription || '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode !== 'detail'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="基本信息" name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="行业名称" required>

                  <el-input v-model="formData.industryName" placeholder="请输入行业名称" maxlength="100" show-word-limit />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="行业分类" required>

                      <el-input v-model="formData.category" placeholder="行业分类" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="图标样式类名">

                      <el-input v-model="formData.iconClass" placeholder="如: fa-solid fa-robot" maxlength="100" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="年增长率(%)">

                      <el-input-number v-model="formData.annualGrowthRate" :min="-100" :max="1000" :precision="2" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="投资热度(%)">

                      <el-input-number v-model="formData.investmentHeat" :min="0" :max="100" :precision="2" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="市场规模">

                      <el-input v-model="formData.marketScale" placeholder="如: 1.8万亿" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="人才缺口">

                      <el-input v-model="formData.talentGap" placeholder="如: 120万" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="6">

                    <el-form-item label="增长趋势">

                      <el-select v-model="formData.growthTrend" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="6">

                    <el-form-item label="市场趋势">

                      <el-select v-model="formData.marketTrend" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="6">

                    <el-form-item label="人才趋势">

                      <el-select v-model="formData.talentTrend" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="6">

                    <el-form-item label="投资趋势">

                      <el-select v-model="formData.investmentTrend" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in trendOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="行业描述">

                  <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入行业描述" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="详细信息" name="detail">

              <el-form :model="detailForm" label-width="140px" class="mt-2">

                <el-form-item label="简短描述">

                  <el-input v-model="detailForm.shortDescription" maxlength="500" show-word-limit />

                </el-form-item>

                <el-form-item label="详细描述">

                  <el-input v-model="detailForm.detailedDescription" type="textarea" :rows="4" />

                </el-form-item>

                <el-form-item label="发展规模">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">规模(万亿元)</span>

                      <el-input-number v-model="detailForm.industryScale.scaleValue" :min="0" :precision="2" placeholder="如：1.8" style="width: 100%" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">标签</span>

                      <el-input v-model="detailForm.industryScale.scaleLabel" placeholder="如：万亿级市场" maxlength="50" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">描述</span>

                      <el-select v-model="detailForm.industryScale.scaleDescriptions" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%">

                        <el-option v-for="item in hotPositionOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="人才需求">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">需求量(万人)</span>

                      <el-input-number v-model="detailForm.industryTalentDemand.demandValue" :min="0" :precision="2" placeholder="如：500" style="width: 100%" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">标签</span>

                      <el-select v-model="detailForm.industryTalentDemand.demandLabel" filterable allow-create default-first-option :reserve-keyword="false" placeholder="可选择或输入新增" style="width: 100%">

                        <el-option v-for="item in talentDemandLabelOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">描述</span>

                      <el-select v-model="detailForm.industryTalentDemand.demandDescriptions" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="热门岗位/缺口描述，可多选或输入新增" style="width: 100%">

                        <el-option v-for="item in hotPositionOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="行业薪资">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">薪资范围(万元)</span>

                      <el-input v-model="detailForm.industrySalary.salaryRange" placeholder="如：15-25" maxlength="50" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">标签</span>

                      <el-input v-model="detailForm.industrySalary.salaryLabel" placeholder="如：行业薪酬领先" maxlength="50" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">描述</span>

                      <el-select v-model="detailForm.industrySalary.salaryDescriptions" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="薪资描述，可多选或输入新增" style="width: 100%" />

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="政策信息">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">政策概览</span>

                      <el-input v-model="detailForm.policyInfo.policyOverview" type="textarea" :rows="2" placeholder="政策概览" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">国家政策</span>

                      <el-select v-model="detailForm.policyInfo.nationalPolicies" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%">

                        <el-option v-for="item in nationalPolicyOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">政策亮点</span>

                      <el-input v-model="detailForm.policyInfo.policyHighlights" placeholder="如：研发费用加计扣除" maxlength="200" />

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="发展支持">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">地域概述</span>

                      <el-input v-model="detailForm.developmentSupportInfo.regionalOverview" type="textarea" :rows="2" placeholder="地域发展概述" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">重点城市</span>

                      <el-select v-model="detailForm.developmentSupportInfo.keyCities" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%">

                        <el-option v-for="item in keyCityOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">城市政策</span>

                      <el-select v-model="detailForm.developmentSupportInfo.cityPolicies" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%" />

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="人才分析">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">分析标题</span>

                      <el-input v-model="detailForm.talentAnalysis.analysisTitle" placeholder="如：人才供需分析" maxlength="100" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">紧缺岗位</span>

                      <el-select v-model="detailForm.talentAnalysis.shortagePositions" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%">

                        <el-option v-for="item in hotPositionOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">学历要求</span>

                      <el-select v-model="detailForm.talentAnalysis.educationRequirement" filterable allow-create default-first-option :reserve-keyword="false" placeholder="可选择或输入新增" style="width: 100%">

                        <el-option v-for="item in educationRequirementOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">专业要求</span>

                      <el-input v-model="detailForm.talentAnalysis.majorRequirement" placeholder="如：计算机、电子信息类" maxlength="100" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">人才趋势</span>

                      <el-input v-model="detailForm.talentAnalysis.talentTrendDescription" type="textarea" :rows="2" placeholder="人才趋势描述" />

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="人才政策">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">政策标题</span>

                      <el-input v-model="detailForm.talentPolicy.policyTitle" placeholder="如：人才引进政策" maxlength="100" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">国家级政策</span>

                      <el-select v-model="detailForm.talentPolicy.nationalPolicies" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%">

                        <el-option v-for="item in nationalPolicyOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">地方级政策</span>

                      <el-select v-model="detailForm.talentPolicy.localPolicies" multiple filterable allow-create default-first-option :reserve-keyword="false" placeholder="可多选或输入新增" style="width: 100%" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">企业层面</span>

                      <el-input v-model="detailForm.talentPolicy.enterpriseDescription" type="textarea" :rows="2" placeholder="企业层面描述" />

                    </div>

                  </div>

                </el-form-item>

                <el-form-item label="薪资数据">

                  <div class="jsonb-group">

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">薪资分析标题</span>

                      <el-input v-model="detailForm.salaryData.salaryAnalysisTitle" placeholder="如：行业薪资水平分析" maxlength="100" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">薪资分析描述</span>

                      <el-input v-model="detailForm.salaryData.salaryAnalysisDescription" type="textarea" :rows="2" placeholder="薪资分析描述" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">地域差异标题</span>

                      <el-input v-model="detailForm.salaryData.regionalSalaryTitle" placeholder="如：地域薪资差异" maxlength="100" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">地域差异描述</span>

                      <el-input v-model="detailForm.salaryData.regionalSalaryDescription" type="textarea" :rows="2" placeholder="地域薪资差异描述" />

                    </div>

                    <div class="jsonb-item">

                      <span class="jsonb-sub-label">趋势分析</span>

                      <el-input v-model="detailForm.salaryData.salaryTrendAnalysis" type="textarea" :rows="2" placeholder="薪资趋势分析" />

                    </div>

                  </div>

                </el-form-item>

              </el-form>

            </el-tab-pane>

          </el-tabs>

        </template>

      </div>



      <template #footer>

        <button type="button" class="btn-cancel" @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</button>

        <button v-if="dialogMode !== 'detail'" type="button" class="btn-confirm" @click="handleSubmit">确定</button>

      </template>

    </el-dialog>



    <!-- Import Dialog -->

    <el-dialog v-model="importDialogVisible" :title="importType === 'main' ? '导入行业主表' : '导入行业详情'" width="500px" class="uni-dialog">

      <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">

        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>

        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

        <template #tip>

          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>

        </template>

      </el-upload>

      <template #footer>

        <button type="button" class="btn-cancel" @click="importDialogVisible = false">取消</button>

        <button type="button" class="btn-confirm" :disabled="importLoading" @click="handleImportSubmit">{{ importLoading ? '导入中...' : '确定导入' }}</button>

      </template>

    </el-dialog>

  </div>

</template>



<style scoped>
/* ========== Page Wrapper ========== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ========== Watermarks ========== */
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-tr {
  top: 20px;
  right: 20px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: 20px;
  left: 20px;
  transform: rotate(-12deg);
}

/* ========== Page Header ========== */
.page-header {
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

/* ========== Section Label ========== */
.section-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}
.section-label :deep(.el-icon) {
  color: #fff;
}

/* ========== Search Card ========== */
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  position: relative;
  z-index: 1;
}

/* ========== Search Buttons ========== */
.btn-search {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 8px;
  transition: all 0.3s;
}
.btn-search:hover {
  opacity: 0.9;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-reset:hover {
  color: #F97316;
  border-color: #F97316;
}

/* ========== Action Bar ========== */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}
.action-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Primary Button (新增行业) */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 22px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-primary:hover {
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.45);
  opacity: 0.92;
}

/* Outline Button (Excel导入) */
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 18px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-outline:hover {
  color: #F97316;
  border-color: #F97316;
}

.dropdown-arrow {
  margin-left: 6px;
  font-size: 10px;
  color: #9ca3af;
}

/* Danger Button (批量删除) */
.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 22px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45);
  opacity: 0.92;
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Refresh Button */
.btn-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 16px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-refresh:hover {
  color: #F97316;
  border-color: #F97316;
}

/* ========== Table Card ========== */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  position: relative;
  z-index: 1;
}

/* Table Header */
:deep(.industry-table .el-table__header-wrapper th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
:deep(.industry-table .el-table__header-wrapper th .cell) {
  color: #1f2937;
  font-weight: 600;
}

/* Row hover */
:deep(.industry-table .el-table__body tr:hover > td.el-table__cell) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

/* Striped rows */
:deep(.industry-table.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 247, 237, 0.3) !important;
}

/* Selection column background */
:deep(.industry-table .el-table-column--selection .cell) {
  color: #fff;
}

/* ========== Status Pills ========== */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.status-enabled {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}
.status-disabled {
  background: rgba(156, 163, 175, 0.15);
  color: #6b7280;
}

/* ========== Trend Pills ========== */
.trend-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.trend-success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}
.trend-warning {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}
.trend-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.trend-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

/* ========== Action Buttons (Table) ========== */
.btn-action {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  margin: 0 2px;
  transition: all 0.2s;
}
.btn-action-detail {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}
.btn-action-detail:hover {
  background: rgba(249, 115, 22, 0.2);
}
.btn-action-edit {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.btn-action-edit:hover {
  background: rgba(59, 130, 246, 0.2);
}
.btn-action-enable {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}
.btn-action-enable:hover {
  background: rgba(34, 197, 94, 0.2);
}
.btn-action-disable {
  background: rgba(234, 179, 8, 0.1);
  color: #ca8a04;
}
.btn-action-disable:hover {
  background: rgba(234, 179, 8, 0.2);
}
.btn-action-delete {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.btn-action-delete:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* ========== Custom Pagination ========== */
.custom-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2) inset;
}

/* ========== Dialog ========== */
.uni-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin-right: 0;
}
.uni-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #1f2937;
}
.uni-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.uni-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid rgba(249, 115, 22, 0.1);
}

/* Dialog Footer Buttons */
.btn-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 22px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-cancel:hover {
  color: #F97316;
  border-color: #F97316;
}
.btn-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 22px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.3s;
}
.btn-confirm:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
}
.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Form Inputs in Dialog */
.uni-dialog :deep(.el-input .el-input__wrapper),
.uni-dialog :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s;
}
.uni-dialog :deep(.el-textarea .el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s;
}
.uni-dialog :deep(.el-input .el-input__wrapper:hover),
.uni-dialog :deep(.el-input-number .el-input__wrapper:hover),
.uni-dialog :deep(.el-textarea .el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2) inset;
}
.uni-dialog :deep(.el-input.is-focus .el-input__wrapper),
.uni-dialog :deep(.el-input-number.is-focus .el-input__wrapper),
.uni-dialog :deep(.el-textarea.is-focus .el-textarea__inner) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.35) inset;
}
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.35) inset;
}
.uni-dialog :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2) inset;
}

/* Descriptions */
.uni-dialog :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}
.uni-dialog :deep(.el-descriptions__label.is-bordered-label) {
  background: rgba(249, 115, 22, 0.06) !important;
}

/* Tabs */
.uni-dialog :deep(.el-tabs__active-bar) {
  background-color: #F97316;
}
.uni-dialog :deep(.el-tabs__item.is-active) {
  color: #F97316;
}
.uni-dialog :deep(.el-tabs__item:hover) {
  color: #F97316;
}

/* Upload drag area */
.uni-dialog :deep(.el-upload-dragger) {
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  transition: all 0.3s;
}
.uni-dialog :deep(.el-upload-dragger:hover) {
  border-color: #F97316;
}

/* JSONB structured fields */
.jsonb-group {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 12px;
  background: rgba(255, 247, 237, 0.3);
}
.jsonb-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.jsonb-item:last-child {
  margin-bottom: 0;
}
.jsonb-sub-label {
  flex-shrink: 0;
  width: 88px;
  font-size: 13px;
  color: #6b7280;
  text-align: right;
}
.jsonb-item :deep(.el-input),
.jsonb-item :deep(.el-input-number),
.jsonb-item :deep(.el-select),
.jsonb-item :deep(.el-textarea) {
  flex: 1;
}
</style>
