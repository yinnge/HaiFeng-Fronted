<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCityPage,
  getCityDetail,
  addCity,
  updateCity,
  updateCityDetail,
  updateCityStatus,
  deleteCity,
  batchDeleteCity,
  importCity,
  importCityDetail,
} from '@/api/city'
import type {
  CityListVO,
  CityDetailVO,
  CityQueryDTO,
  CityAddDTO,
} from '@/types/city'

const loading = ref(false)
const tableData = ref<CityListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<CityQueryDTO>({
  page: 1,
  size: 10,
  cityName: '',
  province: '',
  region: '',
  isDeleted: null!,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<CityDetailVO | null>(null)
const activeTab = ref('basic')

const formData = reactive<Record<string, any>>({
  cityName: '',
  province: '',
  region: '',
  cityIntro: '',
  collegeCount: null,
  keyCollegeCount: null,
  residentPopulation: null,
  gdp: null,
})

const detailForm = reactive<Record<string, any>>({
  area: null,
  subtitle: '',
  cityLevel: '',
  adminCode: '',
  perCapitaGdp: null,
  urbanizationRate: null,
  ruralPopRatio: null,
  agingRate: null,
  migrantPopRatio: null,
  gdpGrowthRate: null,
  fortune500Count: null,
  industryDescription: '',
  mainIndustries: '',
  emergingIndustries: '',
  industryStructure: '',
  futurePlan: '',
  highEducation: '',
  basicEducation: '',
  enterpriseStats: '',
  housingPriceLevel: '',
  rentalCost: '',
  housingPolicy: '',
  consumption: '',
  employment: '',
  transportation: '',
  medical: '',
  culture: '',
})

const importDialogVisible = ref(false)
const importType = ref<'main' | 'detail'>('main')
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const cityLevelOptions = ['直辖市', '省会城市', '地级市', '县级市']

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.cityName) params.cityName = queryParams.cityName
    if (queryParams.province) params.province = queryParams.province
    if (queryParams.region) params.region = queryParams.region
    if (queryParams.isDeleted !== null && queryParams.isDeleted !== undefined) params.isDeleted = queryParams.isDeleted
    const res = await getCityPage(params as CityQueryDTO)
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
  queryParams.cityName = ''
  queryParams.province = ''
  queryParams.region = ''
  queryParams.isDeleted = null!
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

const handleSelectionChange = (rows: CityListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'

  if (mode === 'add') {
    dialogTitle.value = '新增城市'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改城市'
    formLoading.value = true
    try {
      const res = await getCityDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        fillForm(d)
        fillDetailForm(d)
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '城市详情'
    formLoading.value = true
    try {
      const res = await getCityDetail(id)
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

const resetForm = () => {
  formData.cityName = ''
  formData.province = ''
  formData.region = ''
  formData.cityIntro = ''
  formData.collegeCount = null
  formData.keyCollegeCount = null
  formData.residentPopulation = null
  formData.gdp = null
  Object.keys(detailForm).forEach((k) => {
    detailForm[k] = k.includes('Count') || k.includes('Gdp') || k.includes('Rate') || k.includes('Ratio') || k === 'area' || k === 'perCapitaGdp' || k === 'urbanizationRate' || k === 'ruralPopRatio' || k === 'agingRate' || k === 'migrantPopRatio' || k === 'gdpGrowthRate' || k === 'fortune500Count' ? null : ''
  })
}

const fillForm = (d: CityDetailVO) => {
  formData.cityName = d.cityName
  formData.province = d.province
  formData.region = d.region || ''
  formData.cityIntro = d.cityIntro || ''
  formData.collegeCount = d.collegeCount
  formData.keyCollegeCount = d.keyCollegeCount
  formData.residentPopulation = d.residentPopulation
  formData.gdp = d.gdp
}

const fillDetailForm = (d: CityDetailVO) => {
  detailForm.area = d.area
  detailForm.subtitle = d.subtitle || ''
  detailForm.cityLevel = d.cityLevel || ''
  detailForm.adminCode = d.adminCode || ''
  detailForm.perCapitaGdp = d.perCapitaGdp
  detailForm.urbanizationRate = d.urbanizationRate
  detailForm.ruralPopRatio = d.ruralPopRatio
  detailForm.agingRate = d.agingRate
  detailForm.migrantPopRatio = d.migrantPopRatio
  detailForm.gdpGrowthRate = d.gdpGrowthRate
  detailForm.fortune500Count = d.fortune500Count
  detailForm.industryDescription = d.industryDescription || ''
  detailForm.mainIndustries = d.mainIndustries?.join(', ') || ''
  detailForm.emergingIndustries = d.emergingIndustries?.join(', ') || ''
  detailForm.industryStructure = d.industryStructure ? JSON.stringify(d.industryStructure, null, 2) : ''
  detailForm.futurePlan = d.futurePlan ? JSON.stringify(d.futurePlan, null, 2) : ''
  detailForm.highEducation = d.highEducation ? JSON.stringify(d.highEducation, null, 2) : ''
  detailForm.basicEducation = d.basicEducation ? JSON.stringify(d.basicEducation, null, 2) : ''
  detailForm.enterpriseStats = d.enterpriseStats ? JSON.stringify(d.enterpriseStats, null, 2) : ''
  detailForm.housingPriceLevel = d.housingPriceLevel ? JSON.stringify(d.housingPriceLevel, null, 2) : ''
  detailForm.rentalCost = d.rentalCost ? JSON.stringify(d.rentalCost, null, 2) : ''
  detailForm.housingPolicy = d.housingPolicy ? JSON.stringify(d.housingPolicy, null, 2) : ''
  detailForm.consumption = d.consumption ? JSON.stringify(d.consumption, null, 2) : ''
  detailForm.employment = d.employment ? JSON.stringify(d.employment, null, 2) : ''
  detailForm.transportation = d.transportation ? JSON.stringify(d.transportation, null, 2) : ''
  detailForm.medical = d.medical ? JSON.stringify(d.medical, null, 2) : ''
  detailForm.culture = d.culture ? JSON.stringify(d.culture, null, 2) : ''
}

const handleSubmitBasic = async () => {
  if (!formData.cityName || !formData.province || !formData.region) {
    ElMessage.warning('请填写城市名称、省份和所属地区')
    return false
  }
  try {
    const data: Record<string, any> = {
      cityName: formData.cityName,
      province: formData.province,
      region: formData.region,
    }
    if (formData.cityIntro) data.cityIntro = formData.cityIntro
    if (formData.collegeCount !== null) data.collegeCount = formData.collegeCount
    if (formData.keyCollegeCount !== null) data.keyCollegeCount = formData.keyCollegeCount
    if (formData.residentPopulation !== null) data.residentPopulation = formData.residentPopulation
    if (formData.gdp !== null) data.gdp = formData.gdp

    let res: any
    if (dialogMode.value === 'add') {
      res = await addCity(data as CityAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateCity(currentId.value, data)
    } else {
      return false
    }

    if (res.data.code === 200) {
      ElMessage.success('基本信息保存成功')
      if (dialogMode.value === 'add' && res.data.data) {
        currentId.value = res.data.data
      }
      return true
    } else {
      ElMessage.error(res.data.msg || '保存失败')
      return false
    }
  } catch {
    ElMessage.error('保存失败')
    return false
  }
}

const handleSubmitDetail = async () => {
  if (!currentId.value) return false
  try {
    const data: Record<string, any> = {}
    if (detailForm.area !== null) data.area = detailForm.area
    if (detailForm.subtitle) data.subtitle = detailForm.subtitle
    if (detailForm.cityLevel) data.cityLevel = detailForm.cityLevel
    if (detailForm.adminCode) data.adminCode = detailForm.adminCode
    if (detailForm.perCapitaGdp !== null) data.perCapitaGdp = detailForm.perCapitaGdp
    if (detailForm.urbanizationRate !== null) data.urbanizationRate = detailForm.urbanizationRate
    if (detailForm.ruralPopRatio !== null) data.ruralPopRatio = detailForm.ruralPopRatio
    if (detailForm.agingRate !== null) data.agingRate = detailForm.agingRate
    if (detailForm.migrantPopRatio !== null) data.migrantPopRatio = detailForm.migrantPopRatio
    if (detailForm.gdpGrowthRate !== null) data.gdpGrowthRate = detailForm.gdpGrowthRate
    if (detailForm.fortune500Count !== null) data.fortune500Count = detailForm.fortune500Count
    if (detailForm.industryDescription) data.industryDescription = detailForm.industryDescription
    if (detailForm.mainIndustries) data.mainIndustries = detailForm.mainIndustries.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
    if (detailForm.emergingIndustries) data.emergingIndustries = detailForm.emergingIndustries.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)

    const jsonbFields = ['industryStructure', 'futurePlan', 'highEducation', 'basicEducation', 'enterpriseStats', 'housingPriceLevel', 'rentalCost', 'housingPolicy', 'consumption', 'employment', 'transportation', 'medical', 'culture']
    jsonbFields.forEach((field) => {
      if (detailForm[field]) {
        try {
          data[field] = JSON.parse(detailForm[field])
        } catch {
          ElMessage.warning(`${field} JSON 格式错误，已跳过`)
        }
      }
    })

    const res = await updateCityDetail(currentId.value, data)
    if (res.data.code === 200) {
      ElMessage.success('详细信息保存成功')
      return true
    } else {
      ElMessage.error(res.data.msg || '保存失败')
      return false
    }
  } catch {
    ElMessage.error('保存失败')
    return false
  }
}

const handleSubmit = async () => {
  if (dialogMode.value === 'detail') return

  if (activeTab.value === 'basic') {
    const ok = await handleSubmitBasic()
    if (ok) {
      dialogVisible.value = false
      fetchData()
    }
  } else {
    const ok = await handleSubmitDetail()
    if (ok) {
      dialogVisible.value = false
      fetchData()
    }
  }
}

const handleToggleStatus = async (row: CityListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该城市吗？`, '提示')
  } catch {
    return
  }
  try {
    const res = await updateCityStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败，请检查网络连接')
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要永久删除该城市吗？此操作不可恢复！',
      '警告',
      { type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消' }
    )
    const res = await deleteCity(id)
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
    ElMessage.warning('请先选择要删除的城市')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要永久删除选中的${selectedIds.value.length} 条城市记录吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteCity(selectedIds.value as unknown as number[])
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
  if (!importFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  importLoading.value = true
  try {
    let res: any
    if (importType.value === 'main') {
      res = await importCity(importFile.value)
    } else {
      res = await importCityDetail(importFile.value)
    }
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    if (err.response?.data?.msg) {
      ElMessage.error(err.response.data.msg)
    } else {
      ElMessage.error('导入失败')
    }
  } finally {
    importLoading.value = false
  }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="page-title">城市列表管理</h2>
      <p class="page-subtitle">管理所有城市的基本信息与详细数据，支持增删改查和批量导入导出</p>
    </div>

    <!-- Search Card -->
    <div class="search-card">
      <span class="section-label">搜索筛选</span>
      <el-form :model="queryParams" inline>
        <el-form-item label="城市名称">
          <el-input v-model="queryParams.cityName" placeholder="城市名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="省份">
          <el-input v-model="queryParams.province" placeholder="省份模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="所属地区">
          <el-input v-model="queryParams.region" placeholder="所属地区模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isDeleted" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button class="search-btn" @click="handleSearch">查询</el-button>
          <el-button class="reset-btn" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="action-bar-left">
        <el-button class="btn-add" @click="openDialog('add')">
          <span class="btn-icon">+</span> 新增城市
        </el-button>
        <el-dropdown class="btn-import" @command="(cmd: string) => openImportDialog(cmd as 'main' | 'detail')">
          <el-button class="btn-outline">
            Excel导入 <span class="btn-arrow">&#9662;</span>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="main">导入城市主表</el-dropdown-item>
              <el-dropdown-item command="detail">导入城市详情</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button class="btn-batch-delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
          批量永久删除
        </el-button>
      </div>
      <el-button class="btn-refresh" @click="fetchData">
        <span class="btn-icon-refresh">&#8635;</span> 刷新
      </el-button>
    </div>

    <!-- Table Card -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="cityName" label="城市名称" min-width="120" />
        <el-table-column prop="province" label="省份" width="120" />
        <el-table-column prop="collegeCount" label="高校数量" width="100" align="center" />
        <el-table-column prop="keyCollegeCount" label="重点高校" width="100" align="center" />
        <el-table-column prop="residentPopulation" label="常住人口(万)" width="120" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.isDeleted ? 'status-disabled' : 'status-active'">
              {{ statusLabel(row.isDeleted) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <span class="action-pill action-detail" @click="openDialog('detail', row.id)">详情</span>
            <span class="action-pill action-edit" @click="openDialog('edit', row.id)">修改</span>
            <span class="action-pill" :class="row.isDeleted ? 'action-enable' : 'action-disable'" @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </span>
            <span class="action-pill action-delete" @click="handleDelete(row.id)">永久删除</span>
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

    <!-- Add/Edit Dialog -->
    <el-dialog class="uni-dialog" v-model="dialogVisible" :title="dialogTitle" width="850px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border :label-class-name="'desc-label'">
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="城市名称">{{ detailData.cityName }}</el-descriptions-item>
            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>
            <el-descriptions-item label="所属地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="高校数量">{{ detailData.collegeCount }}</el-descriptions-item>
            <el-descriptions-item label="重点高校数量">{{ detailData.keyCollegeCount }}</el-descriptions-item>
            <el-descriptions-item label="常住人口(万)">{{ detailData.residentPopulation }}</el-descriptions-item>
            <el-descriptions-item label="GDP(亿元)">{{ detailData.gdp }}</el-descriptions-item>
            <el-descriptions-item label="状态" :span="2">
              <span class="status-pill" :class="detailData.isDeleted ? 'status-disabled' : 'status-active'">
                {{ statusLabel(detailData.isDeleted) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="城市简介" :span="2">
              <div class="max-h-40 overflow-y-auto whitespace-pre-wrap">{{ detailData.cityIntro || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="面积(km²)">{{ detailData.area ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="副标题">{{ detailData.subtitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市级别">{{ detailData.cityLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="行政区划代码">{{ detailData.adminCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="人均GDP(万元)">{{ detailData.perCapitaGdp ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="城镇化率(%)">{{ detailData.urbanizationRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="GDP增长率(%)">{{ detailData.gdpGrowthRate ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="500强企业数">{{ detailData.fortune500Count ?? '-' }}</el-descriptions-item>
            <el-descriptions-item label="主要产业" :span="2">{{ detailData.mainIndustries?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="新兴产业" :span="2">{{ detailData.emergingIndustries?.join(', ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="formData" label-width="120px" class="mt-2">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="城市名称" required>
                      <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="省份" required>
                      <el-input v-model="formData.province" placeholder="请输入省份" maxlength="30" show-word-limit />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="所属地区" required>
                      <el-input v-model="formData.region" placeholder="请输入所属地区" maxlength="20" show-word-limit />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="高校数量">
                      <el-input-number v-model="formData.collegeCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="重点高校数量">
                      <el-input-number v-model="formData.keyCollegeCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="常住人口(万)">
                      <el-input-number v-model="formData.residentPopulation" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="GDP(亿元)">
                      <el-input-number v-model="formData.gdp" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="城市简介">
                  <el-input v-model="formData.cityIntro" type="textarea" :rows="4" placeholder="请输入城市简介" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="详细信息" name="detail">
              <el-form :model="detailForm" label-width="140px" class="mt-2">
                <div class="mb-2 mt-4 text-sm font-medium section-subtitle">基础数据</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="面积(km²)">
                      <el-input-number v-model="detailForm.area" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="副标题">
                      <el-input v-model="detailForm.subtitle" placeholder="城市副标题" maxlength="200" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="城市级别">
                      <el-select v-model="detailForm.cityLevel" placeholder="请选择" clearable style="width: 100%">
                        <el-option v-for="item in cityLevelOptions" :key="item" :label="item" :value="item" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="行政区划代码">
                      <el-input v-model="detailForm.adminCode" placeholder="行政区划代码" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人均GDP(万元)">
                      <el-input-number v-model="detailForm.perCapitaGdp" :min="0" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="城镇化率(%)">
                      <el-input-number v-model="detailForm.urbanizationRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="GDP增长率(%)">
                      <el-input-number v-model="detailForm.gdpGrowthRate" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="农村人口比例(%)">
                      <el-input-number v-model="detailForm.ruralPopRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="老龄化率(%)">
                      <el-input-number v-model="detailForm.agingRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="外来人口比例(%)">
                      <el-input-number v-model="detailForm.migrantPopRatio" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="世界500强企业数">
                      <el-input-number v-model="detailForm.fortune500Count" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="mb-2 mt-4 text-sm font-medium section-subtitle">产业信息</div>
                <el-form-item label="产业描述">
                  <el-input v-model="detailForm.industryDescription" type="textarea" :rows="3" />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="主要产业">
                      <el-input v-model="detailForm.mainIndustries" placeholder="逗号分隔" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="新兴产业">
                      <el-input v-model="detailForm.emergingIndustries" placeholder="逗号分隔" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <div class="mb-2 mt-4 text-sm font-medium section-subtitle">JSONB 数据（请输入合法JSON）</div>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="产业结构">
                      <el-input v-model="detailForm.industryStructure" type="textarea" :rows="3" placeholder='{"first":0.3,"second":16.2,"third":83.5}' />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="未来规划">
                      <el-input v-model="detailForm.futurePlan" type="textarea" :rows="3" placeholder='{"focus":["数字经济"]}' />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="高等教育">
                      <el-input v-model="detailForm.highEducation" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="基础教育">
                      <el-input v-model="detailForm.basicEducation" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="企业统计">
                      <el-input v-model="detailForm.enterpriseStats" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="房价水平">
                      <el-input v-model="detailForm.housingPriceLevel" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="租房成本">
                      <el-input v-model="detailForm.rentalCost" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="住房政策">
                      <el-input v-model="detailForm.housingPolicy" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="消费数据">
                      <el-input v-model="detailForm.consumption" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="就业数据">
                      <el-input v-model="detailForm.employment" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="交通数据">
                      <el-input v-model="detailForm.transportation" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="医疗数据">
                      <el-input v-model="detailForm.medical" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="文化旅游">
                  <el-input v-model="detailForm.culture" type="textarea" :rows="3" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- Import Dialog -->
    <el-dialog v-model="importDialogVisible" :title="importType === 'main' ? '导入城市主表' : '导入城市详情'" width="500px">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="true"
        accept=".xlsx,.xls"
        :on-change="handleImportFileChange"
        :limit="1"
      >
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持.xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ===========================
   Page Wrapper
   =========================== */
.page-wrap {
  background: linear-gradient(135deg, #fff5f0 0%, #fff7ed 50%, #fff1f2 100%);
  min-height: 100vh;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Maple leaf watermarks */
.page-wrap::before,
.page-wrap::after {
  content: '';
  position: absolute;
  width: 320px;
  height: 320px;
  background: url('@/assets/images/logo-main.png') center / contain no-repeat;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}

.page-wrap::before {
  top: -60px;
  right: -60px;
  transform: rotate(18deg);
}

.page-wrap::after {
  bottom: -60px;
  left: -60px;
  transform: rotate(-12deg);
}

/* ===========================
   Page Header
   =========================== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #F97316;
  letter-spacing: 1px;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: #9ca3af;
}

/* ===========================
   Search Card
   =========================== */
.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border: 1px solid #FB923C;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.06);
}

.section-label {
  display: inline-block;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 14px;
  border-radius: 10px;
  margin-bottom: 16px;
  letter-spacing: 1px;
}

.search-card :deep(.el-form) {
  margin-top: 4px;
}

.search-card :deep(.el-input__wrapper),
.search-card :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.search-card :deep(.el-input__wrapper:hover),
.search-card :deep(.el-select:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px #FB923C inset;
}

.search-card :deep(.el-input.is-focus .el-input__wrapper),
.search-card :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-btn {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 8px 22px !important;
  font-weight: 500;
}

.search-btn:hover {
  opacity: 0.9;
}

.reset-btn {
  border: 1px solid #fdba74 !important;
  color: #F97316 !important;
  background: #fff7ed !important;
  border-radius: 8px !important;
  padding: 8px 22px !important;
  font-weight: 500;
}

.reset-btn:hover {
  background: #fff1f2 !important;
  border-color: #F97316 !important;
}

/* ===========================
   Action Bar
   =========================== */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.action-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-add {
  background: linear-gradient(135deg, #F97316, #EA580C) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 8px 18px !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.btn-add:hover {
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
  opacity: 0.95;
}

.btn-icon {
  font-size: 16px;
  margin-right: 2px;
  font-weight: 700;
}

.btn-outline {
  border: 1px solid #F97316 !important;
  color: #F97316 !important;
  background: #fff7ed !important;
  border-radius: 8px !important;
  font-weight: 500;
}

.btn-outline:hover {
  background: #fff1f2 !important;
  border-color: #EA580C !important;
  color: #EA580C !important;
}

.btn-arrow {
  font-size: 10px;
  margin-left: 4px;
}

.btn-batch-delete {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  border: none !important;
  color: #fff !important;
  border-radius: 8px !important;
  padding: 8px 18px !important;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
}

.btn-batch-delete:hover:not(:disabled) {
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.btn-batch-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-refresh {
  border: 1px solid #d1d5db !important;
  color: #6b7280 !important;
  background: #fff !important;
  border-radius: 8px !important;
  font-weight: 500;
}

.btn-refresh:hover {
  border-color: #F97316 !important;
  color: #F97316 !important;
  background: #fff7ed !important;
}

.btn-icon-refresh {
  font-size: 15px;
  margin-right: 2px;
}

/* ===========================
   Table Card
   =========================== */
.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.06);
  border: 1px solid #fed7aa;
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table thead) {
  color: #F97316;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #fff1f2) !important;
  color: #F97316 !important;
  font-weight: 700;
  border-bottom: 2px solid #FB923C !important;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #fefaf5 !important;
}

.table-card :deep(.el-table__body tr:hover > td.el-table__cell) {
  background-color: #fff5f0 !important;
}

/* Status Pills */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border: 1px solid #e5e7eb;
}

/* Action Pills */
.action-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 2px;
  user-select: none;
}

.action-pill:hover {
  transform: translateY(-1px);
}

.action-detail {
  color: #F97316;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.action-detail:hover {
  background: #F97316;
  color: #fff;
}

.action-edit {
  color: #8b5cf6;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
}

.action-edit:hover {
  background: #8b5cf6;
  color: #fff;
}

.action-enable {
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
}

.action-enable:hover {
  background: #059669;
  color: #fff;
}

.action-disable {
  color: #6b7280;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.action-disable:hover {
  background: #6b7280;
  color: #fff;
}

.action-delete {
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.action-delete:hover {
  background: #ef4444;
  color: #fff;
}

/* ===========================
   Custom Pagination
   =========================== */
.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.custom-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
  border: none;
}

.custom-pagination :deep(.el-pagination .el-pager li:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-pagination .btn-prev:hover),
.custom-pagination :deep(.el-pagination .btn-next:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

/* ===========================
   Uni Dialog
   =========================== */
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #FB923C;
  padding-bottom: 16px;
  margin-bottom: 4px;
}

.uni-dialog :deep(.el-dialog__title) {
  color: #F97316;
  font-weight: 700;
  font-size: 17px;
}

.uni-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #fed7aa;
  padding-top: 14px;
}

.uni-dialog :deep(.el-descriptions__label.is-bordered-label) {
  background: #fffbeb !important;
  color: #F97316 !important;
  font-weight: 600;
}

.uni-dialog :deep(.el-tabs__active-bar) {
  background-color: #F97316 !important;
}

.uni-dialog :deep(.el-tabs__item.is-active) {
  color: #F97316 !important;
  font-weight: 600;
}

.uni-dialog :deep(.el-tabs__item:hover) {
  color: #FB923C !important;
}

.uni-dialog :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.uni-dialog :deep(.el-input.is-focus .el-input__wrapper),
.uni-dialog :deep(.el-textarea__inner:focus),
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.uni-dialog :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.uni-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #FB923C inset;
}

.uni-dialog :deep(.el-input-number .el-input__wrapper) {
  box-shadow: 0 0 0 1px #fed7aa inset;
  border-radius: 8px;
}

.uni-dialog :deep(.el-input-number.is-controls-right .el-input__wrapper) {
  padding-right: 32px;
}

.uni-dialog :deep(.el-button--primary) {
  background: linear-gradient(135deg, #F97316, #EA580C) !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 500;
}

.uni-dialog :deep(.el-button--primary:hover) {
  opacity: 0.9;
}

.section-subtitle {
  color: #F97316;
  font-weight: 600;
}
</style>
