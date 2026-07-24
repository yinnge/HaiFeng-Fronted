<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
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
  industryScale: '',
  industryTalentDemand: '',
  industrySalary: '',
  policyInfo: '',
  developmentSupportInfo: '',
  talentAnalysis: '',
  talentPolicy: '',
  salaryData: '',
})

const importDialogVisible = ref(false)
const importType = ref<'main' | 'detail'>('main')
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const trendOptions = ['上升', '稳定', '下降']

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.industryName) params.industryName = queryParams.industryName
    if (queryParams.category) params.category = queryParams.category
    if (queryParams.talentTrend) params.talentTrend = queryParams.talentTrend
    const res = await getIndustryPage(params as IndustryQueryDTO)
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
  queryParams.industryName = ''
  queryParams.category = ''
  queryParams.talentTrend = undefined
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
  Object.keys(detailForm).forEach((k) => { detailForm[k] = '' })
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
  const jsonFields = ['industryScale', 'industryTalentDemand', 'industrySalary', 'policyInfo', 'developmentSupportInfo', 'talentAnalysis', 'talentPolicy', 'salaryData']
  jsonFields.forEach((f) => {
    detailForm[f] = (d as any)[f] ? JSON.stringify((d as any)[f], null, 2) : ''
  })
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

const handleSubmitBasic = async () => {
  if (!formData.industryName) {
    ElMessage.warning('请填写行业名称')
    return false
  }
  try {
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

    let res: any
    if (dialogMode.value === 'add') {
      res = await addIndustry(data as any)
      if (res.data.code === 200 && res.data.data) {
        currentId.value = res.data.data
      }
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateIndustry(currentId.value, data)
    } else {
      return false
    }

    if (res.data.code === 200) { ElMessage.success('基本信息保存成功'); return true }
    else { ElMessage.error(res.data.msg || '保存失败'); return false }
  } catch { ElMessage.error('保存失败'); return false }
}

const handleSubmitDetail = async () => {
  if (!currentId.value) return false
  try {
    const data: Record<string, any> = {}
    if (detailForm.shortDescription) data.shortDescription = detailForm.shortDescription
    if (detailForm.detailedDescription) data.detailedDescription = detailForm.detailedDescription
    const jsonFields = ['industryScale', 'industryTalentDemand', 'industrySalary', 'policyInfo', 'developmentSupportInfo', 'talentAnalysis', 'talentPolicy', 'salaryData']
    jsonFields.forEach((f) => {
      if (detailForm[f]) {
        try { data[f] = JSON.parse(detailForm[f]) }
        catch { ElMessage.warning(`${f} JSON格式错误，已跳过`) }
      }
    })

    const res = await updateIndustryDetail(currentId.value, data)
    if (res.data.code === 200) { ElMessage.success('详细信息保存成功'); return true }
    else { ElMessage.error(res.data.msg || '保存失败'); return false }
  } catch { ElMessage.error('保存失败'); return false }
}

const handleSubmit = async () => {
  if (dialogMode.value === 'detail') return
  if (activeTab.value === 'basic') {
    const ok = await handleSubmitBasic()
    if (ok) { dialogVisible.value = false; fetchData() }
  } else {
    const ok = await handleSubmitDetail()
    if (ok) { dialogVisible.value = false; fetchData() }
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
    const res = await batchDeleteIndustry(selectedIds.value)
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
  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }
  finally { importLoading.value = false }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')
const trendTag = (val: string) => val === '上升' ? 'success' : val === '稳定' ? 'warning' : val === '下降' ? 'danger' : 'info'

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
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
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增行业</el-button>
        <el-dropdown split-button type="success" @click="openImportDialog('main')">
          Excel导入
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openImportDialog('main')">导入行业主表</el-dropdown-item>
              <el-dropdown-item @click="openImportDialog('detail')">导入行业详情</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="industryName" label="行业名称" min-width="180" />
        <el-table-column prop="category" label="行业分类" width="120" />
        <el-table-column prop="talentTrend" label="人才趋势" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.talentTrend" :type="trendTag(row.talentTrend)" size="small">{{ row.talentTrend }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="annualGrowthRate" label="年增长率(%)" width="110" align="right" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">永久删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="850px" :close-on-click-modal="false" :destroy-on-close="true">
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
              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>
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
                    <el-form-item label="行业分类">
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
                <el-form-item label="发展规模(JSON)">
                  <el-input v-model="detailForm.industryScale" type="textarea" :rows="3" placeholder='{"value":18000,"unit":"亿元"}' />
                </el-form-item>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人才需求(JSON)">
                      <el-input v-model="detailForm.industryTalentDemand" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="行业薪资(JSON)">
                      <el-input v-model="detailForm.industrySalary" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="政策信息(JSON)">
                      <el-input v-model="detailForm.policyInfo" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="发展支持(JSON)">
                      <el-input v-model="detailForm.developmentSupportInfo" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-form-item label="人才分析(JSON)">
                      <el-input v-model="detailForm.talentAnalysis" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="人才政策(JSON)">
                      <el-input v-model="detailForm.talentPolicy" type="textarea" :rows="3" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="薪资数据(JSON)">
                  <el-input v-model="detailForm.salaryData" type="textarea" :rows="3" />
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

    <el-dialog v-model="importDialogVisible" :title="importType === 'main' ? '导入行业主表' : '导入行业详情'" width="500px">
      <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">
        <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">仅支持 .xlsx / .xls 格式文件</div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
