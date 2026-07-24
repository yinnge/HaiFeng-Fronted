<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getGroupPage,

  getGroupDetail,

  addGroup,

  updateGroup,

  updateGroupStatus,

  deleteGroup,

  batchDeleteGroup,

  importGroupExcel,

  recalcAllGroups,

} from '@/api/algorithm/admission/group'

import type {

  AdmissionGroupListVO,

  AdmissionGroupDetailVO,

  AdmissionGroupQueryDTO,

  AdmissionGroupAddDTO,

} from '@/types/algorithm/admission'

import type { AxiosResponse } from 'axios'

import type { R } from '@haifeng/shared'



const router = useRouter()

const loading = ref(false)

const tableData = ref<AdmissionGroupListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const provinceOptions = [

  '北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏',

  '浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西',

  '海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆',

]



const requirementTypeOptions = ['不限', '2年', '3年', '必备', '必备', '必备']

const batchOptions = ['本科', '提前', '专科']



const queryParams = reactive<AdmissionGroupQueryDTO>({

  page: 1,

  size: 10,

  universityName: '',

  year: undefined,

  province: '',

  requirementType: '',

  enrollmentCode: '',

  groupCode: '',

  groupName: '',

  isDeleted: false,

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<AdmissionGroupDetailVO | null>(null)



const formData = reactive<AdmissionGroupAddDTO>({

  universityName: '',

  year: new Date().getFullYear(),

  province: '',

  batch: '',

  enrollmentCode: '',

  groupCode: '',

  groupName: '',

  subjects: [],

  requirementType: '',

  description: '',

  constraints: [],

})



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.isDeleted !== undefined && queryParams.isDeleted !== null) params.isDeleted = queryParams.isDeleted

    if (queryParams.universityName) params.universityName = queryParams.universityName

    if (queryParams.year) params.year = queryParams.year

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.requirementType) params.requirementType = queryParams.requirementType

    if (queryParams.enrollmentCode) params.enrollmentCode = queryParams.enrollmentCode

    if (queryParams.groupCode) params.groupCode = queryParams.groupCode

    if (queryParams.groupName) params.groupName = queryParams.groupName

    const res = await getGroupPage(params as AdmissionGroupQueryDTO)

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

  queryParams.universityName = ''

  queryParams.year = undefined

  queryParams.province = ''

  queryParams.requirementType = ''

  queryParams.enrollmentCode = ''

  queryParams.groupCode = ''

  queryParams.groupName = ''

  queryParams.isDeleted = false

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



const handleSelectionChange = (selection: AdmissionGroupListVO[]) => {

  selectedIds.value = selection.map((item) => item.id)

}



const resetFormData = () => {

  formData.universityName = ''

  formData.year = new Date().getFullYear()

  formData.province = ''

  formData.batch = ''

  formData.enrollmentCode = ''

  formData.groupCode = ''

  formData.groupName = ''

  formData.subjects = []

  formData.requirementType = ''

  formData.description = ''

  formData.constraints = []

}



const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {

  dialogMode.value = mode

  currentId.value = id || null



  if (mode === 'add') {

    dialogTitle.value = '新增专业组'

    resetFormData()

    detailData.value = null

  } else if ((mode === 'edit' || mode === 'detail') && id) {

    formLoading.value = true

    try {

      const res = await getGroupDetail(id)

      if (res.data.code === 200) {

        const d = res.data.data

        if (mode === 'edit') {

          dialogTitle.value = '修改专业组'

          formData.universityName = d.universityName

          formData.year = d.year

          formData.province = d.province

          formData.batch = d.batch

          formData.enrollmentCode = d.enrollmentCode || ''

          formData.groupCode = d.groupCode

          formData.groupName = d.groupName || ''

          formData.subjects = d.subjects || []

          formData.requirementType = d.requirementType

          formData.description = d.description || ''

          formData.constraints = d.constraints || []

        } else {

          dialogTitle.value = '专业组详情'

          detailData.value = d

        }

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

  if (!formData.universityName || !formData.year || !formData.province || !formData.batch || !formData.groupCode) {

    ElMessage.warning('请填写完整信息（字段）')

    return

  }



  try {

    let res: any

    if (dialogMode.value === 'add') {

      res = await addGroup({

        ...formData,

        enrollmentCode: formData.enrollmentCode || undefined,

        groupName: formData.groupName || undefined,

        subjects: formData.subjects && formData.subjects.length > 0 ? formData.subjects : undefined,

        requirementType: formData.requirementType || undefined,

        description: formData.description || undefined,

        constraints: formData.constraints && formData.constraints.length > 0 ? formData.constraints : undefined,

      })

    } else if (dialogMode.value === 'edit' && currentId.value) {

      res = await updateGroup(currentId.value, {

        ...formData,

        enrollmentCode: formData.enrollmentCode || undefined,

        groupName: formData.groupName || undefined,

        subjects: formData.subjects && formData.subjects.length > 0 ? formData.subjects : undefined,

        requirementType: formData.requirementType || undefined,

        description: formData.description || undefined,

        constraints: formData.constraints && formData.constraints.length > 0 ? formData.constraints : undefined,

      })

    } else {

      return

    }



    if (res.data.code === 200) {

      ElMessage.success(dialogMode.value === 'add' ? '新增成功' : '修改成功')

      dialogVisible.value = false

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    ElMessage.error('操作失败')

  }

}



const handleToggleStatus = async (row: AdmissionGroupListVO) => {

  const newStatus = !row.isDeleted

  const actionText = newStatus ? '禁用' : '启用'

  try {

    await ElMessageBox.confirm(`确定${actionText}该专业组吗？`, '提示')

    const res = await updateGroupStatus(row.id, newStatus)

    if (res.data.code === 200) {

      ElMessage.success(`${actionText}成功`)

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // cancel

  }

}



const handleDelete = async (id: string) => {

  try {

    await ElMessageBox.confirm('确定要软删除该专业组吗？（级联删除其下所有专业明细）', '提示')

    const res = await deleteGroup(id)

    if (res.data.code === 200) {

      ElMessage.success('删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // cancel

  }

}



const handleBatchDelete = async () => {

  if (selectedIds.value.length === 0) {

    ElMessage.warning('请先选择要删除的专业')

    return

  }

  try {

    await ElMessageBox.confirm(`确定要删除选中的${selectedIds.value.length} 个专业组吗？`, '提示')

    const res = await batchDeleteGroup(selectedIds.value)

    if (res.data.code === 200) {

      ElMessage.success('批量删除成功')

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '操作失败')

    }

  } catch {

    // cancel

  }

}



const handleImport = async () => {

  const input = document.createElement('input')

  input.type = 'file'

  input.accept = '.xlsx,.xls'

  input.onchange = async () => {

    const file = input.files?.[0]

    if (!file) return

    try {

      const res = await importGroupExcel(file)

      if (res.data.code === 200) {

        ElMessage.success('导入成功')

        fetchData()

      } else {

        ElMessage.error(res.data.msg || '导入失败')

      }

    } catch {

      ElMessage.error('导入失败')

    }

  }

  input.click()

}



const handleRecalcAll = async () => {

  try {

    await ElMessageBox.confirm('确定要全量重算所有专业组的聚合数据吗？此操作不可撤销', '提示', {

      type: 'warning',

    })

    const res = await recalcAllGroups()

    if (res.data.code === 200) {

      ElMessage.success(`全量重算完成，共处理 ${res.data.data} 个专业组`)

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '重算失败')

    }

  } catch {

    // cancel

  }

}



const goToMajorScore = (groupId: number) => {

  router.push({ path: '/algorithm/admission/major-score', query: { groupId: String(groupId) } })

}



const formatSubjects = (subjects: string[], requirementType: string) => {

  if (!subjects || subjects.length === 0) return requirementType || '不限'

  return `${requirementType}:${subjects.join('、')}`

}



onMounted(() => {

  fetchData()

})

</script>



<template>

  <div>

    <!-- 搜索-->

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-row :gutter="16" class="w-full">

          <el-col :span="8">

            <el-form-item label="大学名称" style="width: 100%; margin-bottom: 16px;">

              <el-input v-model="queryParams.universityName" placeholder="模糊搜索" clearable style="width: 100%;" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="4">

            <el-form-item label="年份" style="width: 100%; margin-bottom: 16px;">

              <el-input-number v-model="queryParams.year" :min="2000" :max="2100" :step="1" controls-position="right" style="width: 100%;" />

            </el-form-item>

          </el-col>

          <el-col :span="5">

            <el-form-item label="省份" style="width: 100%; margin-bottom: 16px;">

              <el-select v-model="queryParams.province" placeholder="全部" clearable filterable style="width: 100%;">

                <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />

              </el-select>

            </el-form-item>

          </el-col>

          <el-col :span="7">

            <el-form-item label="选科类型" style="width: 100%; margin-bottom: 16px;">

              <el-select v-model="queryParams.requirementType" placeholder="全部" clearable style="width: 100%;">

                <el-option v-for="t in requirementTypeOptions" :key="t" :label="t" :value="t" />

              </el-select>

            </el-form-item>

          </el-col>

        </el-row>

        <el-row :gutter="16" class="w-full">

          <el-col :span="6">

            <el-form-item label="省招代码" style="width: 100%; margin-bottom: 0;">

              <el-input v-model="queryParams.enrollmentCode" placeholder="模糊搜索" clearable style="width: 100%;" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="专业组代码" style="width: 100%; margin-bottom: 0;">

              <el-input v-model="queryParams.groupCode" placeholder="模糊搜索" clearable style="width: 100%;" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="专业组名称" style="width: 100%; margin-bottom: 0;">

              <el-input v-model="queryParams.groupName" placeholder="模糊搜索" clearable style="width: 100%;" @keyup.enter="handleSearch" />

            </el-form-item>

          </el-col>

          <el-col :span="6">

            <el-form-item label="状态" style="width: 100%; margin-bottom: 0;">

              <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 100%;">

                <el-option label="启用" :value="false" />

                <el-option label="禁用" :value="true" />

              </el-select>

            </el-form-item>

          </el-col>

        </el-row>

        <el-row class="mt-4">

          <el-form-item>

            <el-button type="primary" @click="handleSearch">查询</el-button>

            <el-button @click="handleReset">重置</el-button>

          </el-form-item>

        </el-row>

      </el-form>

    </div>



    <!-- 操作-->

    <div class="mb-4">

      <el-button type="primary" @click="openDialog('add')">新增专业组</el-button>

      <el-button @click="handleImport">导入Excel</el-button>

      <el-button @click="handleRecalcAll">全量重算</el-button>

      <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量软删除</el-button>

      <el-button @click="fetchData">刷新</el-button>

    </div>



    <!-- 表格 -->

    <div class="rounded-lg bg-white p-5">

      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">

        <el-table-column type="selection" width="50" />

        <el-table-column prop="id" label="ID" width="70" />

        <el-table-column prop="universityName" label="大学名称" min-width="130" show-overflow-tooltip />

        <el-table-column prop="cityName" label="城市" width="90" />

        <el-table-column prop="year" label="年份" width="70" />

        <el-table-column prop="province" label="省份" width="80" />

        <el-table-column prop="batch" label="批次" width="90" />

        <el-table-column prop="enrollmentCode" label="省招代码" width="110" />

        <el-table-column prop="groupCode" label="专业组代码" width="100" />

        <el-table-column prop="groupName" label="专业组名称" width="130" show-overflow-tooltip />

        <el-table-column label="选科要求" min-width="160">

          <template #default="{ row }">

            <span class="text-xs">{{ formatSubjects(row.subjects, row.requirementType) }}</span>

          </template>

        </el-table-column>

        <el-table-column prop="majorCount" label="专业数量" width="80" />

        <el-table-column prop="admissionCount" label="录取人数" width="80" />

        <el-table-column prop="minScore" label="最低分" width="70" />

        <el-table-column prop="minRank" label="最低位次" width="80" />

        <el-table-column prop="avgScore" label="平均分" width="70" />

        <el-table-column label="状态" width="80" align="center">

          <template #default="{ row }">

            <el-tag :type="row.isDeleted ? 'info' : 'success'" size="small">

              {{ row.isDeleted ? '禁用' : '启用' }}

            </el-tag>

          </template>

        </el-table-column>

        <el-table-column label="操作" width="320" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>

            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>

            <el-button type="primary" link @click="goToMajorScore(row.id)">明细</el-button>

            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">

              {{ row.isDeleted ? '启用' : '禁用' }}

            </el-button>

            <el-button type="danger" link @click="handleDelete(row.id)">软删除</el-button>

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



    <!-- Dialog -->

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false">

      <div v-loading="formLoading">

        <!-- 详情模式 -->

        <template v-if="dialogMode === 'detail' && detailData">

          <el-tabs>

            <el-tab-pane label="基本信息">

              <el-descriptions :column="2" border>

                <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>

                <el-descriptions-item label="大学名称">{{ detailData.universityName }}</el-descriptions-item>

                <el-descriptions-item label="城市">{{ detailData.cityName }}</el-descriptions-item>

                <el-descriptions-item label="年份">{{ detailData.year }}</el-descriptions-item>

                <el-descriptions-item label="省份">{{ detailData.province }}</el-descriptions-item>

                <el-descriptions-item label="批次">{{ detailData.batch }}</el-descriptions-item>

                <el-descriptions-item label="省招代码">{{ detailData.enrollmentCode || '-' }}</el-descriptions-item>

                <el-descriptions-item label="专业组代码">{{ detailData.groupCode }}</el-descriptions-item>

                <el-descriptions-item label="专业组名称">{{ detailData.groupName || '-' }}</el-descriptions-item>

                <el-descriptions-item label="选科要求" :span="2">

                  {{ formatSubjects(detailData.subjects, detailData.requirementType) }}

                </el-descriptions-item>

                <el-descriptions-item label="约束条件" :span="2">

                  <template v-if="detailData.constraints && detailData.constraints.length > 0">

                    <el-tag v-for="c in detailData.constraints" :key="c" size="small" style="margin-right: 4px">{{ c }}</el-tag>

                  </template>

                  <span v-else>-</span>

                </el-descriptions-item>

                <el-descriptions-item label="状态">

                  <el-tag :type="detailData.isDeleted ? 'info' : 'success'" size="small">

                    {{ detailData.isDeleted ? '禁用' : '启用' }}

                  </el-tag>

                </el-descriptions-item>

                <el-descriptions-item label="专业组简介" :span="2">

                  <div class="max-h-40 overflow-y-auto">{{ detailData.description || '-' }}</div>

                </el-descriptions-item>

              </el-descriptions>

            </el-tab-pane>

            <el-tab-pane label="分数统计">

              <el-descriptions :column="2" border>

                <el-descriptions-item label="专业数量">{{ detailData.majorCount }}</el-descriptions-item>

                <el-descriptions-item label="专业门类数量">{{ detailData.categoryCount }}</el-descriptions-item>

                <el-descriptions-item label="录取人数">{{ detailData.admissionCount ?? '-' }}</el-descriptions-item>

                <el-descriptions-item label="最低分">{{ detailData.minScore ?? '-' }}</el-descriptions-item>

                <el-descriptions-item label="最低位次">{{ detailData.minRank ?? '-' }}</el-descriptions-item>

                <el-descriptions-item label="平均分">{{ detailData.avgScore ?? '-' }}</el-descriptions-item>

                <el-descriptions-item label="平均位次">{{ detailData.avgRank ?? '-' }}</el-descriptions-item>

                <el-descriptions-item label="最高分">{{ detailData.maxScore ?? '-' }}</el-descriptions-item>

                <el-descriptions-item label="最高位次">{{ detailData.maxRank ?? '-' }}</el-descriptions-item>

              </el-descriptions>

            </el-tab-pane>

            <el-tab-pane label="时间信息">

              <el-descriptions :column="2" border>

                <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>

                <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>

              </el-descriptions>

            </el-tab-pane>

          </el-tabs>

        </template>



        <!-- 新增/修改模式 -->

        <template v-if="dialogMode !== 'detail'">

          <el-form :model="formData" label-width="120px">

            <el-row :gutter="16">

              <el-col :span="12">

                <el-form-item label="大学名称" required>

                  <el-input v-model="formData.universityName" placeholder="请输入" maxlength="50" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="年份" required>

                  <el-input-number v-model="formData.year" :min="2000" :max="2100" style="width: 100%;" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="16">

              <el-col :span="12">

                <el-form-item label="省份" required>

                  <el-select v-model="formData.province" placeholder="请选择" filterable style="width: 100%;">

                    <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />

                  </el-select>

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="批次" required>

                  <el-select v-model="formData.batch" placeholder="请选择" style="width: 100%;">

                    <el-option v-for="b in batchOptions" :key="b" :label="b" :value="b" />

                  </el-select>

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="16">

              <el-col :span="12">

                <el-form-item label="专业组代码" required>

                  <el-input v-model="formData.groupCode" placeholder="请输入" maxlength="30" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="专业组名称">

                  <el-input v-model="formData.groupName" placeholder="为空则使用组代码" maxlength="100" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="16">

              <el-col :span="12">

                <el-form-item label="省招代码">

                  <el-input v-model="formData.enrollmentCode" placeholder="请输入" maxlength="30" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="选科类型">

                  <el-select v-model="formData.requirementType" placeholder="请选择" clearable style="width: 100%;">

                    <el-option v-for="t in requirementTypeOptions" :key="t" :label="t" :value="t" />

                  </el-select>

                </el-form-item>

              </el-col>

            </el-row>

            <el-form-item label="科目">

              <el-select

                v-model="formData.subjects"

                multiple

                filterable

                placeholder="请选择科目（为空则表示不限）"

                style="width: 100%;"

              >

                <el-option label="物理" value="物理" />

                <el-option label="化学" value="化学" />

                <el-option label="生物" value="生物" />

                <el-option label="历史" value="历史" />

                <el-option label="地理" value="地理" />

                <el-option label="政治" value="政治" />

              </el-select>

            </el-form-item>

            <el-form-item label="约束条件">

              <el-select

                v-model="formData.constraints"

                multiple

                filterable

                allow-create

                default-first-option

                placeholder="输入约束条件后回车"

                style="width: 100%;"

              />

            </el-form-item>

            <el-form-item label="专业组简介">

              <el-input v-model="formData.description" type="textarea" :rows="3" maxlength="2000" show-word-limit />

            </el-form-item>

          </el-form>

        </template>

      </div>



      <template #footer>

        <el-button @click="dialogVisible = false">

          {{ dialogMode === 'detail' ? '关闭' : '取消' }}

        </el-button>

        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">

          确定

        </el-button>

      </template>

    </el-dialog>

  </div>

</template>

