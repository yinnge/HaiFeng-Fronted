<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getMilitaryPage,

  getMilitaryDetail,

  updateMilitary,

  deleteMilitary,

  updateMilitaryStatus,

  batchDeleteMilitary,

  preValidateMilitary,

  importMilitary,

} from '@/api/employment/military'

import type {

  MilitaryListVO,

  MilitaryDetailVO,

  MilitaryQueryDTO,

} from '@/types/employment/military'



const loading = ref(false)

const tableData = ref<MilitaryListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<MilitaryQueryDTO>({

  page: 1,

  size: 10,

  positionName: '',

  employerUnit: '',

  department: '',

  positionType: '',

  positionStatus: '',

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<MilitaryDetailVO | null>(null)

const activeTab = ref('basic')



const formData = reactive<Record<string, any>>({

  positionName: '',

  employerUnit: '',

  department: '',

  positionType: '',

  workLocation: '',

  salaryRange: '',

  majorRequirement: '',

  educationRequirement: '',

  regDeadline: '',

  positionStatus: '进行中,

  positionDescription: '',

  responsibilities: [],

  qualifications: [],

  sortOrder: null,

})



const positionTypeOptions = ['专业技术岗', '管理]

const positionStatusOptions = ['进行中, '已结束]

const educationOptions = ['本科及以上, '硕士及以上, '博士']



const positionStatusTag: Record<string, 'success' | 'info'> = {

  '进行中: 'success',

  '已结束: 'info',

}



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.positionName) params.positionName = queryParams.positionName

    if (queryParams.employerUnit) params.employerUnit = queryParams.employerUnit

    if (queryParams.department) params.department = queryParams.department

    if (queryParams.positionType) params.positionType = queryParams.positionType

    if (queryParams.positionStatus) params.positionStatus = queryParams.positionStatus

    const res = await getMilitaryPage(params as MilitaryQueryDTO)

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

  queryParams.employerUnit = ''

  queryParams.department = ''

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



const handleSelectionChange = (rows: MilitaryListVO[]) => {

  selectedIds.value = rows.map((r) => r.id)

}



const resetForm = () => {

  Object.keys(formData).forEach((k) => {

    formData[k] = k === 'sortOrder' ? null : ''

  })

  formData.responsibilities = []

  formData.qualifications = []

  formData.positionStatus = '进行中

}



const fillForm = (d: MilitaryDetailVO) => {

  formData.positionName = d.positionName || ''

  formData.employerUnit = d.employerUnit || ''

  formData.department = d.department || ''

  formData.positionType = d.positionType || ''

  formData.workLocation = d.workLocation || ''

  formData.salaryRange = d.salaryRange || ''

  formData.majorRequirement = d.majorRequirement || ''

  formData.educationRequirement = d.educationRequirement || ''

  formData.regDeadline = d.regDeadline || ''

  formData.positionStatus = d.positionStatus || '进行中

  formData.positionDescription = d.positionDescription || ''

  formData.responsibilities = d.responsibilities || []

  formData.qualifications = d.qualifications || []

  formData.sortOrder = d.sortOrder ?? null

}



const openDialog = async (mode: 'detail' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null

  activeTab.value = 'basic'



  if (mode === 'edit' && id) {

    dialogTitle.value = '修改部队文职岗位'

    formLoading.value = true

    try {

      const res = await getMilitaryDetail(id)

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

    dialogTitle.value = '部队文职详情'

    formLoading.value = true

    try {

      const res = await getMilitaryDetail(id)

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

    const stringFields = ['positionName', 'employerUnit', 'department', 'positionType', 'workLocation', 'salaryRange', 'majorRequirement', 'educationRequirement', 'regDeadline', 'positionStatus', 'positionDescription']

    stringFields.forEach((f) => {

      if (formData[f]) data[f] = formData[f]

    })

    const arrayFields = ['responsibilities', 'qualifications']

    arrayFields.forEach((f) => {

      if (formData[f] && formData[f].length > 0) data[f] = formData[f]

    })

    const numberFields = ['sortOrder']

    numberFields.forEach((f) => {

      if (formData[f] !== null && formData[f] !== '') data[f] = formData[f]

    })



    const res = await updateMilitary(currentId.value, data)

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

    await ElMessageBox.confirm('确定删除该部队文职岗位吗, '提示')

    const res = await deleteMilitary(id)

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

    const res = await batchDeleteMilitary(selectedIds.value)

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



const handleStatusChange = async (row: MilitaryListVO, newStatus: string) => {

  try {

    const res = await updateMilitaryStatus(row.id, { positionStatus: newStatus })

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

    const res = await preValidateMilitary(preValidateFile.value)

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

    const res = await importMilitary(importFile.value)

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

        <el-form-item label="用人单位">

          <el-input v-model="queryParams.employerUnit" placeholder="用人单位" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="科室">

          <el-input v-model="queryParams.department" placeholder="科室" clearable style="width: 160px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="岗位类型">

          <el-select v-model="queryParams.positionType" placeholder="全部" clearable style="width: 130px">

            <el-option v-for="item in positionTypeOptions" :key="item" :label="item" :value="item" />

          </el-select>

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

        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />

        <el-table-column prop="employerUnit" label="用人单位" min-width="180" show-overflow-tooltip />

        <el-table-column prop="department" label="科室" min-width="150" show-overflow-tooltip />

        <el-table-column prop="positionType" label="岗位类型" width="120" />

        <el-table-column prop="workLocation" label="工作地点" width="120" />

        <el-table-column prop="salaryRange" label="薪资待遇" width="120" />

        <el-table-column prop="regDeadline" label="报名截止" width="180" />

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

            <el-descriptions-item label="岗位名称">{{ detailData.positionName }}</el-descriptions-item>

            <el-descriptions-item label="用人单位">{{ detailData.employerUnit }}</el-descriptions-item>

            <el-descriptions-item label="科室">{{ detailData.department || '-' }}</el-descriptions-item>

            <el-descriptions-item label="岗位类型">{{ detailData.positionType }}</el-descriptions-item>

            <el-descriptions-item label="工作地点">{{ detailData.workLocation || '-' }}</el-descriptions-item>

            <el-descriptions-item label="薪资待遇">{{ detailData.salaryRange || '-' }}</el-descriptions-item>

            <el-descriptions-item label="学历要求">{{ detailData.educationRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="专业要求" :span="2">{{ detailData.majorRequirement || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名截止">{{ detailData.regDeadline || '-' }}</el-descriptions-item>

            <el-descriptions-item label="排序">{{ detailData.sortOrder ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="状态>

              <el-tag :type="positionStatusTag[detailData.positionStatus] || 'info'" size="small">{{ detailData.positionStatus }}</el-tag>

            </el-descriptions-item>

            <el-descriptions-item label="岗位职责" :span="2">{{ (detailData.responsibilities || []).join('、') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="任职资格" :span="2">{{ (detailData.qualifications || []).join('、') || '-' }}</el-descriptions-item>

            <el-descriptions-item label="岗位描述" :span="2">{{ detailData.positionDescription || '-' }}</el-descriptions-item>

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

                    <el-form-item label="岗位名称">

                      <el-input v-model="formData.positionName" placeholder="岗位名称" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="用人单位">

                      <el-input v-model="formData.employerUnit" placeholder="用人单位" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="科室">

                      <el-input v-model="formData.department" placeholder="科室" maxlength="200" show-word-limit />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="岗位类型">

                      <el-select v-model="formData.positionType" placeholder="请选择" clearable style="width: 100%">

                        <el-option v-for="item in positionTypeOptions" :key="item" :label="item" :value="item" />

                      </el-select>

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-row :gutter="20">

                  <el-col :span="12">

                    <el-form-item label="工作地点">

                      <el-input v-model="formData.workLocation" placeholder="工作地点" maxlength="100" />

                    </el-form-item>

                  </el-col>

                  <el-col :span="12">

                    <el-form-item label="薪资待遇">

                      <el-input v-model="formData.salaryRange" placeholder="薪资待遇" maxlength="50" />

                    </el-form-item>

                  </el-col>

                </el-row>

                <el-form-item label="报名截止">

                  <el-date-picker v-model="formData.regDeadline" type="datetime" placeholder="报名截止时间" style="width: 100%" />

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="报考要求 name="requirements">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="学历要求">

                  <el-select v-model="formData.educationRequirement" placeholder="请选择" clearable style="width: 100%">

                    <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

                <el-form-item label="专业要求">

                  <el-input v-model="formData.majorRequirement" placeholder="专业要求" maxlength="500" show-word-limit />

                </el-form-item>

                <el-form-item label="岗位职责">

                  <el-select v-model="formData.responsibilities" multiple placeholder="输入职责，回车添加 filterable allow-create default-first-option style="width: 100%">

                    <el-option v-for="item in formData.responsibilities" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

                <el-form-item label="任职资格">

                  <el-select v-model="formData.qualifications" multiple placeholder="输入资格，回车添加 filterable allow-create default-first-option style="width: 100%">

                    <el-option v-for="item in formData.qualifications" :key="item" :label="item" :value="item" />

                  </el-select>

                </el-form-item>

              </el-form>

            </el-tab-pane>



            <el-tab-pane label="描述信息" name="description">

              <el-form :model="formData" label-width="120px" class="mt-2">

                <el-form-item label="岗位描述">

                  <el-input v-model="formData.positionDescription" type="textarea" :rows="4" placeholder="岗位描述" maxlength="2000" show-word-limit />

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

