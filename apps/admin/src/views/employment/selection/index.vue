<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getSelectionPage,

  getSelectionDetail,

  updateSelection,

  deleteSelection,

  updateSelectionStatus,

  batchDeleteSelection,

  preValidateSelection,

  importSelection,

} from '@/api/employment/selection'

import type {

  SelectionListVO,

  SelectionDetailVO,

  SelectionQueryDTO,

} from '@/types/employment/selection'



const loading = ref(false)

const tableData = ref<SelectionListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<SelectionQueryDTO>({

  page: 1,

  size: 10,

  positionName: '',

  targetUnit: '',

  organizingDept: '',

  selectionType: '',

  year: '',

  province: '',

  politicalStatus: '',

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<SelectionDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  positionName: '',

  selectionType: '',

  year: '',

  province: '',

  organizingDept: '',

  targetUnit: '',

  workLocation: '',

  trainingDirection: '',

  grassrootsServiceYears: '',

  trainingPlan: '',

  educationRequirement: '',

  degreeRequirement: '',

  majorRequirement: '',

  majorCategories: [],

  universityRequirement: '',

  targetUniversities: [],

  politicalStatus: '中共党员',

  studentCadreRequirement: '',

  awardsRequirement: '',

  ageLimit: null,

  recruitmentCount: null,

  examSubjects: '',

  interviewForm: '',

  regStartDate: '',

  regEndDate: '',

  examTime: '',

  applyLink: '',

  positionStatus: '报名中',

  remark: '',

  contactPhone: '',

  officialLink: '',

  content: '',

  sortOrder: null,

})



const selectionTypeOptions = ['定向选调', '非定向选调', '急需紧缺专业选调']

const politicalStatusOptions = ['中共党员', '中共预备党员', '共青团员', '不限']

const positionStatusOptions = ['报名中', '笔试阶段', '面试阶段', '已结束', '即将开始']

const educationOptions = ['本科', '硕士', '博士', '本科及以上', '硕士及以上']

const degreeOptions = ['学士', '硕士', '博士']

const positionStatusTag: Record<string, 'success' | 'warning' | 'info' | 'primary'> = {

  '报名中': 'success',

  '笔试阶段': 'warning',

  '面试阶段': 'warning',

  '已结束': 'info',

  '即将开始': 'primary',

}



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.targetUnit) params.targetUnit = queryParams.targetUnit

    if (queryParams.organizingDept) params.organizingDept = queryParams.organizingDept

    if (queryParams.selectionType) params.selectionType = queryParams.selectionType

    if (queryParams.year) params.year = queryParams.year

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.politicalStatus) params.politicalStatus = queryParams.politicalStatus

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getSelectionPage(params as SelectionQueryDTO)

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

  queryParams.targetUnit = ''

  queryParams.organizingDept = ''

  queryParams.selectionType = ''

  queryParams.year = ''

  queryParams.province = ''

  queryParams.politicalStatus = ''

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



const handleSelectionChange = (rows: SelectionListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder'].includes(k) ? null : Array.isArray(formData[k]) ? [] : ''

  })

  formData.positionStatus = '报名中'

  formData.politicalStatus = '中共党员'

}



const fillForm = (d: SelectionDetailVO) => {

  formData.positionName = d.positionName || ''

  formData.selectionType = d.selectionType || ''

  formData.year = d.year || ''

  formData.province = d.province || ''

  formData.organizingDept = d.organizingDept || ''

  formData.targetUnit = d.targetUnit || ''

  formData.workLocation = d.workLocation || ''

  formData.trainingDirection = d.trainingDirection || ''

  formData.grassrootsServiceYears = d.grassrootsServiceYears || ''

  formData.trainingPlan = d.trainingPlan || ''

  formData.educationRequirement = d.educationRequirement || ''

  formData.degreeRequirement = d.degreeRequirement || ''

  formData.majorRequirement = d.majorRequirement || ''

  formData.majorCategories = d.majorCategories || []

  formData.universityRequirement = d.universityRequirement || ''

  formData.targetUniversities = d.targetUniversities || []

  formData.politicalStatus = d.politicalStatus || '中共党员'

  formData.studentCadreRequirement = d.studentCadreRequirement || ''

  formData.awardsRequirement = d.awardsRequirement || ''

  formData.ageLimit = d.ageLimit ?? null

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.examSubjects = d.examSubjects || ''

  formData.interviewForm = d.interviewForm || ''

  formData.regStartDate = d.regStartDate || ''

  formData.regEndDate = d.regEndDate || ''

  formData.examTime = d.examTime || ''

  formData.applyLink = d.applyLink || ''

  formData.positionStatus = d.positionStatus || '报名中'

  formData.remark = d.remark || ''

  formData.contactPhone = d.contactPhone || ''

  formData.officialLink = d.officialLink || ''

  formData.content = d.content || ''

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'edit' && id) {

    dialogTitle.value = '修改选调生岗位'

    formLoading.value = true

    try {

      const res = await getSelectionDetail(id)

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

    dialogTitle.value = '选调生岗位详情'

    formLoading.value = true

    try {

      const res = await getSelectionDetail(id)

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

    const stringFields = ['positionName', 'selectionType', 'year', 'province', 'organizingDept', 'targetUnit', 'workLocation', 'trainingDirection', 'grassrootsServiceYears', 'trainingPlan', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'universityRequirement', 'politicalStatus', 'studentCadreRequirement', 'awardsRequirement', 'examSubjects', 'interviewForm', 'regStartDate', 'regEndDate', 'examTime', 'applyLink', 'positionStatus', 'remark', 'contactPhone', 'officialLink', 'content']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    if (formData.majorCategories && formData.majorCategories.length > 0) data.majorCategories = formData.majorCategories

    if (formData.targetUniversities && formData.targetUniversities.length > 0) data.targetUniversities = formData.targetUniversities

    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })



    const res = await updateSelection(currentId.value, data)

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

    await ElMessageBox.confirm('确定删除该选调生岗位吗？', '提示')

    const res = await deleteSelection(id)

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

    const res = await batchDeleteSelection(selectedIds.value)

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



const handleStatusChange = async (row: SelectionListVO, newStatus: string) => {

  try {

    const res = await updateSelectionStatus(row.id, { positionStatus: newStatus })

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

    const res = await preValidateSelection(preValidateFile.value)

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

    const res = await importSelection(importFile.value)

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

        <el-form-item label="岗位名称">

          <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="目标单位">

          <el-input v-model="queryParams.targetUnit" placeholder="目标单位" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="组织部门">

          <el-input v-model="queryParams.organizingDept" placeholder="组织部门" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="选调类型">

          <el-select v-model="queryParams.selectionType" placeholder="全部" clearable style="width: 150px">

            <el-option v-for="item in selectionTypeOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <br>

        <el-form-item label="年份">

          <el-input v-model="queryParams.year" placeholder="年份" clearable style="width: 100px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="省份">

          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="政治面貌">

          <el-select v-model="queryParams.politicalStatus" placeholder="全部" clearable style="width: 130px">

            <el-option v-for="item in politicalStatusOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="状态">

          <el-select v-model="queryParams.positionStatus" placeholder="全部" clearable style="width: 130px">

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

        <el-button type="warning" @click="openPreValidateDialog">Excel预览</el-button>

        <el-button type="success" @click="openImportDialog">Excel导入</el-button>

        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>

      </div>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="140" />

        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="selectionType" label="选调类型" width="120" />

        <el-table-column prop="year" label="年份" width="80" />

        <el-table-column prop="province" label="省份" width="80" />

        <el-table-column prop="organizingDept" label="组织部门" min-width="180" show-overflow-tooltip />

        <el-table-column prop="targetUnit" label="目标单位" min-width="180" show-overflow-tooltip />

        <el-table-column prop="workLocation" label="工作地点" width="120" show-overflow-tooltip />

        <el-table-column prop="politicalStatus" label="政治面貌" width="100" />

        <el-table-column prop="regStartDate" label="报名开始" width="180" />

        <el-table-column prop="regEndDate" label="报名截止" width="180" />

        <el-table-column prop="positionStatus" label="状态" width="110" align="center">

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

            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="选调类型">{{ detailData.selectionType }}</el-descriptions-item>

            <el-descriptions-item label="年份">{{ detailData.year }}</el-descriptions-item>

            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>

            <el-descriptions-item label="组织部门">{{ detailData.organizingDept }}</el-descriptions-item>

            <el-descriptions-item label="目标单位">{{ detailData.targetUnit }}</el-descriptions-item>

            <el-descriptions-item label="工作地点">{{ detailData.workLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="培养方向">{{ detailData.trainingDirection || '-' }}</el-descriptions-item>

            <el-descriptions-item label="基层服务年限">{{ detailData.grassrootsServiceYears || '-' }}</el-descriptions-item>

            <el-descriptions-item label="培养计划">{{ detailData.trainingPlan || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业大类" :span="2">{{ (detailData.majorCategories || []).join('、') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="高校要求">{{ detailData.universityRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="目标院校" :span="2">{{ (detailData.targetUniversities || []).join('、') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="政治面貌">{{ detailData.politicalStatus || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学生干部要求">{{ detailData.studentCadreRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="奖励要求">{{ detailData.awardsRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="计划招录人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试科目" :span="2">{{ detailData.examSubjects || '-' }}</el-descriptions-item>

            <el-descriptions-item label="面试形式">{{ detailData.interviewForm || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="状态">

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="报名链接">

              <template v-if="detailData.applyLink">

                <el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link>

              </template>

              <template v-else>-</template>

            </el-descriptions-item>

            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="官方链接">

              <template v-if="detailData.officialLink">

                <el-link type="primary" :href="detailData.officialLink" target="_blank">{{ detailData.officialLink }}</el-link>

              </template>

              <template v-else>-</template>

            </el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>

            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="招录信息" name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="岗位名称">

                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="选调类型">

                      <el-select v-model="formData.selectionType" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in selectionTypeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="年份">

                      <el-input v-model="formData.year" placeholder="年份" maxlength="20" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="省份">

                      <el-input v-model="formData.province" placeholder="省份" maxlength="30" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="组织部门">

                  <el-input v-model="formData.organizingDept" placeholder="组织部门" maxlength="200" show-word-limit />

                </el-form-item>

                <el-form-item label="目标单位">

                  <el-input v-model="formData.targetUnit" placeholder="目标单位" maxlength="200" show-word-limit />

                </el-form-item>

                <el-form-item label="工作地点">

                  <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="200" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="培养信息" name="training">

              <el-form :model="formData" label-width="140px" class="mt-2">

                <el-form-item label="培养方向">

                  <el-input v-model="formData.trainingDirection" placeholder="培养方向" maxlength="200" show-word-limit />

                </el-form-item>

                <el-form-item label="基层服务年限">

                  <el-input v-model="formData.grassrootsServiceYears" placeholder="基层服务年限" maxlength="50" />

                </el-form-item>

                <el-form-item label="培养计划">

                  <el-input v-model="formData.trainingPlan" type="textarea" :rows="3" placeholder="培养计划" maxlength="500" show-word-limit />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="报考要求" name="requirements">

              <el-form :model="formData" label-width="140px" class="mt-2">

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

                <el-form-item label="专业要求">

                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />

                </el-form-item>

                <el-form-item label="专业大类">

                  <el-select v-model="formData.majorCategories" multiple filterable allow-create placeholder="请输入专业大类" style="width: 100%" default-first-option :popper-append-to-body="false">

                    <el-option v-for="item in formData.majorCategories" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

                <el-form-item label="高校要求">

                  <el-input v-model="formData.universityRequirement" placeholder="高校要求" maxlength="200" />

                </el-form-item>

                <el-form-item label="目标院校">

                  <el-select v-model="formData.targetUniversities" multiple filterable allow-create placeholder="请输入目标院校" style="width: 100%" default-first-option :popper-append-to-body="false">

                    <el-option v-for="item in formData.targetUniversities" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

                <el-form-item label="政治面貌">

                  <el-select v-model="formData.politicalStatus" placeholder="请选择" clearable style="width: 100%">

                    <el-option v-for="item in politicalStatusOptions" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

                <el-form-item label="学生干部要求">

                  <el-input v-model="formData.studentCadreRequirement" placeholder="学生干部要求" maxlength="200" />

                </el-form-item>

                <el-form-item label="奖励要求">

                  <el-input v-model="formData.awardsRequirement" placeholder="奖励要求" maxlength="200" />

                </el-form-item>

                <el-form-item label="年龄上限">

                  <el-input-number v-model="formData.ageLimit" :min="18" :max="60" style="width: 100%" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="考试与时间" name="exam">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="考试科目">

                  <el-input v-model="formData.examSubjects" type="textarea" :rows="3" placeholder="考试科目" maxlength="500" show-word-limit />

                </el-form-item>

                <el-form-item label="面试形式">

                  <el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="100" />

                </el-form-item>

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

                    <el-form-item label="考试时间">

                      <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="计划招录人数">

                  <el-input-number v-model="formData.recruitmentCount" :min="1" style="width: 100%" />

                </el-form-item>

                <el-form-item label="报名链接">

                  <el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="补充信息" name="supplement">

              <el-form :model="formData" label-width="120px" class="mt-2">

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

                <el-form-item label="官方链接">

                  <el-input v-model="formData.officialLink" placeholder="官方链接" maxlength="500" />

                </el-form-item>

                <el-form-item label="排序">

                  <el-input-number v-model="formData.sortOrder" style="width: 100%" />

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



    <el-dialog v-model="preValidateDialogVisible" title="Excel预览" width="500px">

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

