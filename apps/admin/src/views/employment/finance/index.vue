<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getFinancePage,

  getFinanceDetail,

  updateFinance,

  deleteFinance,

  updateFinanceStatus,

  batchDeleteFinance,

  importFinance,

} from '@/api/employment/finance'

import type {

  FinanceListVO,

  FinanceDetailVO,

  FinanceQueryDTO,

} from '@/types/employment/finance'



const loading = ref(false)

const tableData = ref<FinanceListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<FinanceQueryDTO>({

  page: 1,

  size: 10,

  institutionName: '',

  positionName: '',

  institutionCategory: '',

  institutionType: '',

  province: '',

  city: '',

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<FinanceDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  institutionName: '',

  institutionCategory: '',

  institutionType: '',

  institutionLogo: '',

  branchName: '',

  positionName: '',

  positionCategory: '',

  recruitmentType: '',

  province: '',

  city: '',

  workLocation: '',

  isRemote: false,

  educationRequirement: '',

  degreeRequirement: '',

  majorRequirement: '',

  majorPreference: '',

  ageLimit: null,

  workExperience: '',

  recruitmentCount: null,

  certRequirements: '',

  languageRequirement: '',

  computerRequirement: '',

  otherRequirement: '',

  salaryMin: null,

  salaryMax: null,

  salaryText: '',

  benefits: '',

  examContent: '',

  examTime: '',

  interviewRounds: '',

  regStartDate: '',

  regEndDate: '',

  applyLink: '',

  positionStatus: '招聘中,

  contactInfo: '',

  remark: '',

  content: '',

  sortOrder: null,

})



const institutionCategoryOptions = ['银行', '证券', '保险', '基金', '信托', '期货', '监管机构', '金融科技']

const recruitmentTypeOptions = ['秋招', '春招', '社招', '实习', '定向']

const educationOptions = ['不限', '大专', '本科', '硕士', '博士']

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

    if (queryParams.institutionName) params.institutionName = queryParams.institutionName

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.institutionCategory) params.institutionCategory = queryParams.institutionCategory

    if (queryParams.institutionType) params.institutionType = queryParams.institutionType

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.city) params.city = queryParams.city

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getFinancePage(params as FinanceQueryDTO)

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

  queryParams.institutionName = ''

  queryParams.positionName = ''

  queryParams.institutionCategory = ''

  queryParams.institutionType = ''

  queryParams.province = ''

  queryParams.city = ''

  queryParams.positionStatus = ''

  queryParams.page = 1

  fetchData()

}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (rows: FinanceListVO[]) => { selectedIds.value = rows.map((r) => r.id) }



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    if (k === 'isRemote') { formData[k] = false; return }

    formData[k] = ['ageLimit', 'recruitmentCount', 'salaryMin', 'salaryMax', 'sortOrder'].includes(k) ? null : ''

  })

  formData.positionStatus = '招聘中

}



const fillForm = (d: FinanceDetailVO) => {

  formData.institutionName = d.institutionName || ''

  formData.institutionCategory = d.institutionCategory || ''

  formData.institutionType = d.institutionType || ''

  formData.institutionLogo = d.institutionLogo || ''

  formData.branchName = d.branchName || ''

  formData.positionName = d.positionName || ''

  formData.positionCategory = d.positionCategory || ''

  formData.recruitmentType = d.recruitmentType || ''

  formData.province = d.province || ''

  formData.city = d.city || ''

  formData.workLocation = d.workLocation || ''

  formData.isRemote = d.isRemote ?? false

  formData.educationRequirement = d.educationRequirement || ''

  formData.degreeRequirement = d.degreeRequirement || ''

  formData.majorRequirement = d.majorRequirement || ''

  formData.majorPreference = d.majorPreference?.join(', ') || ''

  formData.ageLimit = d.ageLimit ?? null

  formData.workExperience = d.workExperience || ''

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.certRequirements = d.certRequirements?.join(', ') || ''

  formData.languageRequirement = d.languageRequirement || ''

  formData.computerRequirement = d.computerRequirement || ''

  formData.otherRequirement = d.otherRequirement || ''

  formData.salaryMin = d.salaryMin ?? null

  formData.salaryMax = d.salaryMax ?? null

  formData.salaryText = d.salaryText || ''

  formData.benefits = d.benefits || ''

  formData.examContent = d.examContent || ''

  formData.examTime = d.examTime || ''

  formData.interviewRounds = d.interviewRounds || ''

  formData.regStartDate = d.regStartDate || ''

  formData.regEndDate = d.regEndDate || ''

  formData.applyLink = d.applyLink || ''

  formData.positionStatus = d.positionStatus || '招聘中

  formData.contactInfo = d.contactInfo || ''

  formData.remark = d.remark || ''

  formData.content = d.content || ''

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'

  if (mode === 'edit' && id) {

    dialogTitle.value = '修改银行/金融岗位'

    formLoading.value = true

    try {

      const res = await getFinanceDetail(id)

      if (res.data.code === 200) fillForm(res.data.data)

    } catch { ElMessage.error('获取详情失败') }

    finally { formLoading.value = false }

    detailData.value = null

  } else if (mode === 'detail' && id) {

    dialogTitle.value = '银行/金融岗位详情'

    formLoading.value = true

    try {

      const res = await getFinanceDetail(id)

      if (res.data.code === 200) detailData.value = res.data.data

    } catch { ElMessage.error('获取详情失败') }

    finally { formLoading.value = false }

  }

  dialogVisible.value = true

}



const handleSubmit = async () => {

  if (!currentId.value) return

  try {

    const data: Record<string, any> = {}

    const stringFields = ['institutionName', 'institutionCategory', 'institutionType', 'institutionLogo', 'branchName', 'positionName', 'positionCategory', 'recruitmentType', 'province', 'city', 'workLocation', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'workExperience', 'languageRequirement', 'computerRequirement', 'otherRequirement', 'salaryText', 'benefits', 'examContent', 'examTime', 'interviewRounds', 'regStartDate', 'regEndDate', 'applyLink', 'positionStatus', 'contactInfo', 'remark', 'content']

    stringFields.forEach((f) => { if (formData[f]) data[f] = formData[f] })

    const numberFields = ['ageLimit', 'recruitmentCount', 'salaryMin', 'salaryMax', 'sortOrder']

    numberFields.forEach((f) => { if (formData[f] !== null && formData[f] !== '') data[f] = formData[f] })

    if (formData.isRemote) data.isRemote = true



    if (formData.majorPreference) {

      data.majorPreference = formData.majorPreference.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)

    }

    if (formData.certRequirements) {

      data.certRequirements = formData.certRequirements.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)

    }



    const res = await updateFinance(currentId.value, data)

    if (res.data.code === 200) {

      ElMessage.success('修改成功')

      dialogVisible.value = false

      fetchData()

    } else { ElMessage.error(res.data.msg || '操作失败') }

  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }

}



const handleDelete = async (id: string) => {

  try {

    await ElMessageBox.confirm('确定删除该银行金融岗位吗？', '提示')

    const res = await deleteFinance(id)

    if (res.data.code === 200) { ElMessage.success('删除成功'); fetchData() }

    else { ElMessage.error(res.data.msg || '删除失败') }

  } catch { /* cancel */ }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的记录'); return }

  try {

    await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length} 条记录吗？`, '提示')

    const res = await batchDeleteFinance(selectedIds.value)

    if (res.data.code === 200) { ElMessage.success('批量删除成功'); selectedIds.value = []; fetchData() }

    else { ElMessage.error(res.data.msg || '批量删除失败') }

  } catch { /* cancel */ }

}



const handleStatusChange = async (row: FinanceListVO, newStatus: string) => {

  try {

    const res = await updateFinanceStatus(row.id, { positionStatus: newStatus })

    if (res.data.code === 200) { ElMessage.success('状态更新成功); fetchData() }

    else { ElMessage.error(res.data.msg || '操作失败') }

  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '操作失败') }

}



const importDialogVisible = ref(false)

const importFile = ref<File | null>(null)

const importLoading = ref(false)



const openImportDialog = () => { importFile.value = null; importDialogVisible.value = true }

const handleImportFileChange = (uploadFile: any) => { importFile.value = uploadFile.raw; return false }



const handleImportSubmit = async () => {

  if (!importFile.value) { ElMessage.warning('请选择文件'); return }

  importLoading.value = true

  try {

    const res = await importFinance(importFile.value)

    if (res.data.code === 200) { ElMessage.success('导入成功'); importDialogVisible.value = false; fetchData() }

    else { ElMessage.error(res.data.msg || '导入失败') }

  } catch (err: any) { ElMessage.error(err.response?.data?.msg || '导入失败') }

  finally { importLoading.value = false }

}



onMounted(() => { fetchData() })

</script>



<template>

  <div>

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-form-item label="机构名称">

          <el-input v-model="queryParams.institutionName" placeholder="机构名称" clearable style="width: 200px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="岗位名称">

          <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="机构大类">

          <el-select v-model="queryParams.institutionCategory" placeholder="全部" clearable style="width: 120px">

            <el-option v-for="item in institutionCategoryOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="机构类型">

          <el-input v-model="queryParams.institutionType" placeholder="机构类型" clearable style="width: 120px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="省份">

          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="城市">

          <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 100px" @keyup.enter="handleSearch" />

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

        <el-button type="success" @click="openImportDialog">Excel导入</el-button>

        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>

      </div>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="institutionName" label="机构名称" min-width="200" show-overflow-tooltip />

        <el-table-column prop="institutionCategory" label="机构大类" width="90" />

        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="positionCategory" label="岗位类别" width="100" />

        <el-table-column prop="recruitmentType" label="招聘类型" width="90" />

        <el-table-column prop="province" label="省份" width="80" />

        <el-table-column prop="city" label="城市" width="80" />

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



    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">

      <div v-loading="formLoading">

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="2" border>

            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="机构名称">{{ detailData.institutionName }}</el-descriptions-item>

            <el-descriptions-item label="机构大类">{{ detailData.institutionCategory }}</el-descriptions-item>

            <el-descriptions-item label="机构类型">{{ detailData.institutionType || '-' }}</el-descriptions-item>

            <el-descriptions-item label="分支机构">{{ detailData.branchName || '-' }}</el-descriptions-item>

            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="岗位类别">{{ detailData.positionCategory || '-' }}</el-descriptions-item>

            <el-descriptions-item label="招聘类型">{{ detailData.recruitmentType }}</el-descriptions-item>

            <el-descriptions-item label="是否远程">{{ detailData.isRemote ? '是' : '否' }}</el-descriptions-item>

            <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>

            <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>

            <el-descriptions-item label="工作地点" :span="2">{{ detailData.workLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="优先专业" :span="2">{{ detailData.majorPreference?.join(', ') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="工作经验">{{ detailData.workExperience || '-' }}</el-descriptions-item>

            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="证书要求" :span="2">{{ detailData.certRequirements?.join(', ') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="语言要求">{{ detailData.languageRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="计算机要求>{{ detailData.computerRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他要求" :span="2">{{ detailData.otherRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="月薪范围">

              {{ detailData.salaryMin != null ? detailData.salaryMin : '-' }} - {{ detailData.salaryMax != null ? detailData.salaryMax : '-' }} k/月            </el-descriptions-item>

            <el-descriptions-item label="薪资说明">{{ detailData.salaryText || '-' }}</el-descriptions-item>

            <el-descriptions-item label="福利待遇" :span="2">{{ detailData.benefits || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="面试轮次">{{ detailData.interviewRounds || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始>{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="网申链接" :span="2">

              <template v-if="detailData.applyLink"><el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link></template>

              <template v-else>-</template>

            </el-descriptions-item>

            <el-descriptions-item label="状态>

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="联系方式">{{ detailData.contactInfo || '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>

            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="机构与岗位信息 name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="机构名称">

                      <el-input v-model="formData.institutionName" placeholder="机构名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="机构大类">

                      <el-select v-model="formData.institutionCategory" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in institutionCategoryOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="机构细分类型">

                      <el-input v-model="formData.institutionType" placeholder="机构细分类型" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="分支机构名称">

                      <el-input v-model="formData.branchName" placeholder="分支机构名称" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="机构Logo">

                  <el-input v-model="formData.institutionLogo" placeholder="机构Logo URL" maxlength="500" />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="岗位名称">

                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="岗位类别">

                      <el-input v-model="formData.positionCategory" placeholder="岗位类别" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="招聘类型">

                  <el-select v-model="formData.recruitmentType" placeholder="请选择" clearable style="width: 100%">

                    <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="地区与报考要求 name="location">

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

                    <el-form-item label="详细工作地点">

                      <el-input v-model="formData.workLocation" placeholder="详细工作地点" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item>

                  <el-checkbox v-model="formData.isRemote" label="支持远程办公" />

                </el-form-item>

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

                      <el-input v-model="formData.degreeRequirement" placeholder="学位要求" maxlength="30" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="专业要求">

                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="年龄上限">

                      <el-input-number v-model="formData.ageLimit" :min="18" :max="45" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="招聘人数">

                      <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="8">

                    <el-form-item label="工作经验">

                      <el-input v-model="formData.workExperience" placeholder="工作经验" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="资质要求" name="cert">

              <el-form :model="formData" label-width="140px" class="mt-2">

                <el-form-item label="优先专业">

                  <el-input v-model="formData.majorPreference" placeholder="多个专业用逗号分隔" />

                  <span class="ml-2 text-xs text-gray-400">支持中英文逗号</span>

                </el-form-item>

                <el-form-item label="证书要求">

                  <el-input v-model="formData.certRequirements" placeholder="多个证书用逗号分隔（如 CFA,CPA />

                  <span class="ml-2 text-xs text-gray-400">支持中英文逗号</span>

                </el-form-item>

                <el-form-item label="语言要求">

                  <el-input v-model="formData.languageRequirement" placeholder="语言要求" maxlength="100" />

                </el-form-item>

                <el-form-item label="计算机要求>

                  <el-input v-model="formData.computerRequirement" placeholder="计算机要求 maxlength="100" />

                </el-form-item>

                <el-form-item label="其他要求">

                  <el-input v-model="formData.otherRequirement" type="textarea" :rows="3" placeholder="其他要求" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="薪资与福利 name="salary">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="最低月薪k)">

                      <el-input-number v-model="formData.salaryMin" :min="0" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="最高月薪k)">

                      <el-input-number v-model="formData.salaryMax" :min="0" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="薪资文本说明">

                  <el-input v-model="formData.salaryText" placeholder="薪资文本说明" maxlength="100" />

                </el-form-item>

                <el-form-item label="福利待遇">

                  <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />

                </el-form-item>

                <el-form-item label="排序">

                  <el-input-number v-model="formData.sortOrder" style="width: 100%" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="考试与补录 name="exam">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="考试内容">

                  <el-input v-model="formData.examContent" type="textarea" :rows="3" placeholder="考试内容" maxlength="500" show-word-limit />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="8">

                    <el-form-item label="考试时间">

                      <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />

                    </el-form-item>

                  </el-col>

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

                </el-row>

                <el-form-item label="面试轮次">

                  <el-input v-model="formData.interviewRounds" placeholder="面试轮次说明" maxlength="100" />

                </el-form-item>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="状态>

                      <el-select v-model="formData.positionStatus" placeholder="请选择" style="width: 100%">

                        <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="联系方式">

                      <el-input v-model="formData.contactInfo" placeholder="联系方式" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="网申链接">

                  <el-input v-model="formData.applyLink" placeholder="网申链接" maxlength="500" />

                </el-form-item>

                <el-form-item label="备注">

                  <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注" />

                </el-form-item>

                <el-form-item label="详细说明">

                  <el-input v-model="formData.content" type="textarea" :rows="4" placeholder="详细说明" />

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

