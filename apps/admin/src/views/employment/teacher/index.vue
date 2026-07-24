<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getTeacherPage,

  getTeacherDetail,

  updateTeacher,

  deleteTeacher,

  updateTeacherStatus,

  batchDeleteTeacher,

  preValidateTeacher,

  importTeacher,

} from '@/api/employment/teacher'

import type {

  TeacherListVO,

  TeacherDetailVO,

  TeacherQueryDTO,

} from '@/types/employment/teacher'



const loading = ref(false)

const tableData = ref<TeacherListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<TeacherQueryDTO>({

  page: 1,

  size: 10,

  schoolName: '',

  positionName: '',

  schoolType: '',

  schoolNature: '',

  recruitmentType: '',

  province: '',

  city: '',

  district: '',

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<TeacherDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  schoolName: '',

  schoolType: '',

  schoolNature: '',

  supervisingDept: '',

  positionName: '',

  subject: '',

  recruitmentType: '',

  province: '',

  city: '',

  district: '',

  educationRequirement: '',

  degreeRequirement: '',

  majorRequirement: '',

  ageLimit: null,

  recruitmentCount: null,

  teacherCertRequirement: '',

  teacherCertSubject: '',

  putonghuaLevel: '',

  otherCertRequirement: '',

  workExperience: '',

  isNormalMajor: '',

  salaryRange: '',

  benefits: '',

  examContent: '',

  interviewForm: '',

  regStartDate: '',

  regEndDate: '',

  examTime: '',

  positionStatus: '招聘中,

  applyLink: '',

  contactPhone: '',

  remark: '',

  content: '',

  sortOrder: null,

})



const schoolTypeOptions = ['幼儿园, '小学', '初中', '高中', '中职', '高职', '大学', '特殊教育学校']

const schoolNatureOptions = ['公办', '民办']

const recruitmentTypeOptions = ['编制', '合同制, '特岗教师', '人事代理', '编外聘用']

const subjectOptions = ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '音乐', '美术', '体育', '信息技术, '心理健康', '通用技术, '科学', '道德与法律, '综合实践', '学前教育', '特殊教育', '其他']

const educationOptions = ['不限', '大专', '本科', '硕士', '博士']

const putonghuaOptions = ['不限', '二级乙等', '二级甲等', '一级乙等, '一级甲等]

const normalMajorOptions = ['要求', '优先', '不限']

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

    if (queryParams.schoolName) params.schoolName = queryParams.schoolName

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.schoolType) params.schoolType = queryParams.schoolType

    if (queryParams.schoolNature) params.schoolNature = queryParams.schoolNature

    if (queryParams.recruitmentType) params.recruitmentType = queryParams.recruitmentType

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.city) params.city = queryParams.city

    if (queryParams.district) params.district = queryParams.district

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getTeacherPage(params as TeacherQueryDTO)

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

  queryParams.schoolName = ''

  queryParams.positionName = ''

  queryParams.schoolType = ''

  queryParams.schoolNature = ''

  queryParams.recruitmentType = ''

  queryParams.province = ''

  queryParams.city = ''

  queryParams.district = ''

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



const handleSelectionChange = (rows: TeacherListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = ['ageLimit', 'recruitmentCount', 'sortOrder'].includes(k) ? null : ''

  })

  formData.positionStatus = '招聘中

}



const fillForm = (d: TeacherDetailVO) => {

  formData.schoolName = d.schoolName || ''

  formData.schoolType = d.schoolType || ''

  formData.schoolNature = d.schoolNature || ''

  formData.supervisingDept = d.supervisingDept || ''

  formData.positionName = d.positionName || ''

  formData.subject = d.subject || ''

  formData.recruitmentType = d.recruitmentType || ''

  formData.province = d.province || ''

  formData.city = d.city || ''

  formData.district = d.district || ''

  formData.educationRequirement = d.educationRequirement || ''

  formData.degreeRequirement = d.degreeRequirement || ''

  formData.majorRequirement = d.majorRequirement || ''

  formData.ageLimit = d.ageLimit ?? null

  formData.recruitmentCount = d.recruitmentCount ?? null

  formData.teacherCertRequirement = d.teacherCertRequirement || ''

  formData.teacherCertSubject = d.teacherCertSubject || ''

  formData.putonghuaLevel = d.putonghuaLevel || ''

  formData.otherCertRequirement = d.otherCertRequirement || ''

  formData.workExperience = d.workExperience || ''

  formData.isNormalMajor = d.isNormalMajor || ''

  formData.salaryRange = d.salaryRange || ''

  formData.benefits = d.benefits || ''

  formData.examContent = d.examContent || ''

  formData.interviewForm = d.interviewForm || ''

  formData.regStartDate = d.regStartDate || ''

  formData.regEndDate = d.regEndDate || ''

  formData.examTime = d.examTime || ''

  formData.positionStatus = d.positionStatus || '招聘中

  formData.applyLink = d.applyLink || ''

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

    dialogTitle.value = '修改教师招聘岗位'

    formLoading.value = true

    try {

      const res = await getTeacherDetail(id)

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

    dialogTitle.value = '教师招聘详情'

    formLoading.value = true

    try {

      const res = await getTeacherDetail(id)

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

    const stringFields = ['schoolName', 'schoolType', 'schoolNature', 'supervisingDept', 'positionName', 'subject', 'recruitmentType', 'province', 'city', 'district', 'educationRequirement', 'degreeRequirement', 'majorRequirement', 'teacherCertRequirement', 'teacherCertSubject', 'putonghuaLevel', 'otherCertRequirement', 'workExperience', 'isNormalMajor', 'salaryRange', 'benefits', 'examContent', 'interviewForm', 'regStartDate', 'regEndDate', 'examTime', 'positionStatus', 'applyLink', 'contactPhone', 'remark', 'content']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    const numberFields = ['ageLimit', 'recruitmentCount', 'sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })



    const res = await updateTeacher(currentId.value, data)

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

    await ElMessageBox.confirm('确定删除该教师招聘岗位吗, '提示')

    const res = await deleteTeacher(id)

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

    const res = await batchDeleteTeacher(selectedIds.value)

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



const handleStatusChange = async (row: TeacherListVO, newStatus: string) => {

  try {

    const res = await updateTeacherStatus(row.id, { positionStatus: newStatus })

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

    const res = await preValidateTeacher(preValidateFile.value)

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

    const res = await importTeacher(importFile.value)

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

        <el-form-item label="学校名称">

          <el-input v-model="queryParams.schoolName" placeholder="学校名称" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="岗位名称">

          <el-input v-model="queryParams.positionName" placeholder="岗位名称" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="学校类型">

          <el-select v-model="queryParams.schoolType" placeholder="全部" clearable style="width: 120px">

            <el-option v-for="item in schoolTypeOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="学校性质">

          <el-select v-model="queryParams.schoolNature" placeholder="全部" clearable style="width: 100px">

            <el-option v-for="item in schoolNatureOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="招聘类型">

          <el-select v-model="queryParams.recruitmentType" placeholder="全部" clearable style="width: 120px">

            <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />

          </el-select>

        </el-form-item>

        <el-form-item label="省份">

          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 100px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="城市">

          <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 100px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="区域">

          <el-input v-model="queryParams.district" placeholder="请输入区域" clearable style="width: 100px" @keyup.enter="handleSearch" />

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

        <el-table-column prop="schoolName" label="学校名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="schoolType" label="学校类型" width="100" />

        <el-table-column prop="schoolNature" label="性质" width="80" />

        <el-table-column prop="positionName" label="岗位名称" min-width="200" show-overflow-tooltip />

        <el-table-column prop="recruitmentType" label="招聘类型" width="100" />

        <el-table-column prop="province" label="省份" width="80" />

        <el-table-column prop="city" label="城市" width="80" />

        <el-table-column prop="district" label="区域" width="80" />

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

            <el-descriptions-item label="学校名称">{{ detailData.schoolName }}</el-descriptions-item>

            <el-descriptions-item label="学校类型">{{ detailData.schoolType }}</el-descriptions-item>

            <el-descriptions-item label="学校性质">{{ detailData.schoolNature }}</el-descriptions-item>

            <el-descriptions-item label="主管教育部门">{{ detailData.supervisingDept || '-' }}</el-descriptions-item>

            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="学科">{{ detailData.subject }}</el-descriptions-item>

            <el-descriptions-item label="招聘类型">{{ detailData.recruitmentType }}</el-descriptions-item>

            <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>

            <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>

            <el-descriptions-item label="区域">{{ detailData.district || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学位要求">{{ detailData.degreeRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年龄上限">{{ detailData.ageLimit ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="招聘人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="教师资格>{{ detailData.teacherCertRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="资格证学历>{{ detailData.teacherCertSubject || '-' }}</el-descriptions-item>

            <el-descriptions-item label="普通话等级">{{ detailData.putonghuaLevel || '-' }}</el-descriptions-item>

            <el-descriptions-item label="其他证书要求">{{ detailData.otherCertRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="教学经验">{{ detailData.workExperience || '-' }}</el-descriptions-item>

            <el-descriptions-item label="师范专业要求">{{ detailData.isNormalMajor || '-' }}</el-descriptions-item>

            <el-descriptions-item label="薪资待遇">{{ detailData.salaryRange || '-' }}</el-descriptions-item>

            <el-descriptions-item label="福利待遇">{{ detailData.benefits || '-' }}</el-descriptions-item>

            <el-descriptions-item label="笔试内容" :span="2">{{ detailData.examContent || '-' }}</el-descriptions-item>

            <el-descriptions-item label="面试形式">{{ detailData.interviewForm || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始>{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="状态>

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="报名链接">

              <template v-if="detailData.applyLink">

                <el-link type="primary" :href="detailData.applyLink" target="_blank">{{ detailData.applyLink }}</el-link>

              </template>

              <template v-else>-</template>

            </el-descriptions-item>

            <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>

            <el-descriptions-item label="详细说明" :span="2">{{ detailData.content || '-' }}</el-descriptions-item>

            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-tabs v-model="activeTab">

            <el-tab-pane label="学校与岗位信息 name="basic">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="学校名称">

                      <el-input v-model="formData.schoolName" placeholder="学校名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="学校类型">

                      <el-select v-model="formData.schoolType" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in schoolTypeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="学校性质">

                      <el-select v-model="formData.schoolNature" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in schoolNatureOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="主管教育部门">

                      <el-input v-model="formData.supervisingDept" placeholder="主管教育部门" maxlength="200" show-word-limit />

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

                    <el-form-item label="学科">

                      <el-select v-model="formData.subject" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in subjectOptions" :key="item" :label="item" :value="item" />

                      </el-select>

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

                    <el-form-item label="区域">

                      <el-input v-model="formData.district" placeholder="请输入区域" maxlength="50" />

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

                    <el-form-item label="学位要求">

                      <el-input v-model="formData.degreeRequirement" placeholder="学位要求" maxlength="30" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="专业要求">

                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />

                </el-form-item>

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

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="资质与待遇 name="cert">

              <el-form :model="formData" label-width="140px" class="mt-2">

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="教师资格证要求>

                      <el-input v-model="formData.teacherCertRequirement" placeholder="教师资格证要求 maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="资格证学科要求>

                      <el-input v-model="formData.teacherCertSubject" placeholder="资格证学科要求 maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="普通话等级">

                      <el-select v-model="formData.putonghuaLevel" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in putonghuaOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="其他证书要求">

                      <el-input v-model="formData.otherCertRequirement" placeholder="其他证书要求" maxlength="200" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="教学经验要求">

                      <el-input v-model="formData.workExperience" placeholder="教学经验要求" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="师范专业要求">

                      <el-select v-model="formData.isNormalMajor" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in normalMajorOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="薪资待遇">

                      <el-input v-model="formData.salaryRange" placeholder="薪资待遇" maxlength="50" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="排序">

                      <el-input-number v-model="formData.sortOrder" style="width: 100%" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="福利待遇">

                  <el-input v-model="formData.benefits" type="textarea" :rows="3" placeholder="福利待遇" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="考试与补录 name="exam">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="笔试内容">

                  <el-input v-model="formData.examContent" type="textarea" :rows="3" placeholder="笔试内容" maxlength="500" show-word-limit />

                </el-form-item>

                <el-form-item label="面试形式">

                  <el-input v-model="formData.interviewForm" placeholder="面试形式" maxlength="100" />

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

                    <el-form-item label="考试时间">

                      <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />

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

                <el-form-item label="报名链接">

                  <el-input v-model="formData.applyLink" placeholder="报名链接" maxlength="500" />

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

