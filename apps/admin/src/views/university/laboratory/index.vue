<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getLaboratoryPage,
  getLaboratoryDetail,
  addLaboratory,
  updateLaboratory,
  updateLaboratoryStatus,
  deleteLaboratory,
  hardDeleteLaboratory,
  batchDeleteLaboratory,
  batchHardDeleteLaboratory,
  importLaboratory,
} from '@/api/university/laboratory'
import { getUniversityPage } from '@/api/university/info'
import type {
  LaboratoryListVO,
  LaboratoryDetailVO,
  LaboratoryQueryDTO,
  LaboratoryAddDTO,
  LaboratoryUpdateDTO,
  CoreTeamItem,
  StatisticsItem,
} from '@/types/university/laboratory'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const labTypeOptions = [
  '国家重点实验室',
  '教育部重点实验室',
  '省级重点实验室',
  '国家工程实验室',
  '国家工程研究中心',
]

const loading = ref(false)
const tableData = ref<LaboratoryListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const universityOptions = ref<{ label: string; value: number }[]>([])

const queryParams = reactive<LaboratoryQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  name: '',
  labType: '',
  region: '',
  department: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<LaboratoryDetailVO | null>(null)

const activeTab = ref('basic')

const formData = reactive<LaboratoryAddDTO>({
  universityId: 0,
  name: '',
  labType: '',
  establishedYear: '',
  region: '',
  department: '',
  director: '',
  staffCount: '',
  studentCount: '',
  email: '',
  phone: '',
  introduction: '',
  researchDescription: '',
  labSpace: '',
  openTopics: '',
  cooperation: '',
  visitingScholars: '',
  researchFields: [],
  majorEquipment: [],
  coreTeam: [],
  statistics: [],
  sortOrder: undefined,
})

const editFormStatus = ref(1)

const addCoreTeamRow = (list: CoreTeamItem[] | undefined) => {
  if (!list) return
  list.push({ name: '', position: '', title: '' })
}

const removeCoreTeamRow = (list: CoreTeamItem[] | undefined, index: number) => {
  if (!list) return
  list.splice(index, 1)
}

const addStatisticsRow = (list: StatisticsItem[] | undefined) => {
  if (!list) return
  list.push({ label: '', count: 0 })
}

const removeStatisticsRow = (list: StatisticsItem[] | undefined, index: number) => {
  if (!list) return
  list.splice(index, 1)
}

const resetFormData = () => {
  formData.universityId = 0
  formData.name = ''
  formData.labType = ''
  formData.establishedYear = ''
  formData.region = ''
  formData.department = ''
  formData.director = ''
  formData.staffCount = ''
  formData.studentCount = ''
  formData.email = ''
  formData.phone = ''
  formData.introduction = ''
  formData.researchDescription = ''
  formData.labSpace = ''
  formData.openTopics = ''
  formData.cooperation = ''
  formData.visitingScholars = ''
  formData.researchFields = []
  formData.majorEquipment = []
  formData.coreTeam = []
  formData.statistics = []
  formData.sortOrder = undefined
  editFormStatus.value = 1
}

const fetchUniversityOptions = async () => {
  try {
    const res = await getUniversityPage({ page: 1, size: 1000 } as any)
    console.log('院校列表响应:', res.data)
    if (res.data.code === 200) {
      universityOptions.value = res.data.data.records.map((r: any) => ({
        label: r.name,
        value: r.id,
      }))
    } else {
      ElMessage.error(res.data.msg || '获取院校列表失败')
    }
  } catch (e) {
    console.error('获取院校列表失败:', e)
    ElMessage.error('获取院校列表失败，请检查网络或登录状态')
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.universityName) params.universityName = queryParams.universityName
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.labType) params.labType = queryParams.labType
    if (queryParams.region) params.region = queryParams.region
    if (queryParams.department) params.department = queryParams.department
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getLaboratoryPage(params as LaboratoryQueryDTO)
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
  queryParams.name = ''
  queryParams.labType = ''
  queryParams.region = ''
  queryParams.department = ''
  queryParams.status = undefined
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

const handleSelectionChange = (selection: LaboratoryListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  activeTab.value = 'basic'

  if (mode === 'add') {
    dialogTitle.value = '新增实验室'
    resetFormData()
    detailData.value = null
    await fetchUniversityOptions()
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改实验室'
    formLoading.value = true
    try {
      const res = await getLaboratoryDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.universityId = d.universityId
        formData.name = d.name
        formData.labType = d.labType
        formData.establishedYear = d.establishedYear || ''
        formData.region = d.region || ''
        formData.department = d.department || ''
        formData.director = d.director || ''
        formData.staffCount = d.staffCount || ''
        formData.studentCount = d.studentCount || ''
        formData.email = d.email || ''
        formData.phone = d.phone || ''
        formData.introduction = d.introduction || ''
        formData.researchDescription = d.researchDescription || ''
        formData.labSpace = d.labSpace || ''
        formData.openTopics = d.openTopics || ''
        formData.cooperation = d.cooperation || ''
        formData.visitingScholars = d.visitingScholars || ''
        formData.researchFields = d.researchFields || []
        formData.majorEquipment = d.majorEquipment || []
        formData.sortOrder = d.sortOrder
        editFormStatus.value = d.status
        formData.coreTeam = (d.coreTeam || []).map((item) => ({ ...item }))
        formData.statistics = (d.statistics || []).map((item) => ({ ...item }))
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '实验室详情'
    formLoading.value = true
    try {
      const res = await getLaboratoryDetail(id)
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
  if (!formData.name || !formData.labType) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      if (!formData.universityId) {
        ElMessage.warning('请选择院校')
        return
      }
      res = await addLaboratory({
        universityId: formData.universityId,
        name: formData.name,
        labType: formData.labType,
        establishedYear: formData.establishedYear || undefined,
        region: formData.region || undefined,
        department: formData.department || undefined,
        director: formData.director || undefined,
        staffCount: formData.staffCount || undefined,
        studentCount: formData.studentCount || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        introduction: formData.introduction || undefined,
        researchDescription: formData.researchDescription || undefined,
        labSpace: formData.labSpace || undefined,
        openTopics: formData.openTopics || undefined,
        cooperation: formData.cooperation || undefined,
        visitingScholars: formData.visitingScholars || undefined,
        researchFields: formData.researchFields || undefined,
        majorEquipment: formData.majorEquipment || undefined,
        coreTeam: formData.coreTeam || undefined,
        statistics: formData.statistics || undefined,
        sortOrder: formData.sortOrder,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateLaboratory(currentId.value, {
        universityId: formData.universityId,
        name: formData.name,
        labType: formData.labType,
        establishedYear: formData.establishedYear || undefined,
        region: formData.region || undefined,
        department: formData.department || undefined,
        director: formData.director || undefined,
        staffCount: formData.staffCount || undefined,
        studentCount: formData.studentCount || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        introduction: formData.introduction || undefined,
        researchDescription: formData.researchDescription || undefined,
        labSpace: formData.labSpace || undefined,
        openTopics: formData.openTopics || undefined,
        cooperation: formData.cooperation || undefined,
        visitingScholars: formData.visitingScholars || undefined,
        researchFields: formData.researchFields || undefined,
        majorEquipment: formData.majorEquipment || undefined,
        coreTeam: formData.coreTeam || undefined,
        statistics: formData.statistics || undefined,
        sortOrder: formData.sortOrder,
        status: editFormStatus.value,
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

const handleToggleStatus = async (row: LaboratoryListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该实验室吗？`, '提示')
    const res = await updateLaboratoryStatus(row.id, { status: newStatus })
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

const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该实验室吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteLaboratory(id)
    if (res.data.code === 200) {
      ElMessage.success('永久删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // cancel
  }
}

const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要永久删除的实验室')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 个实验室吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteLaboratory(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量永久删除成功')
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
      const res = await importLaboratory(file)
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="院校名称">
          <el-input
            v-model="queryParams.universityName"
            placeholder="模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="实验室名称">
          <el-input
            v-model="queryParams.name"
            placeholder="模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="实验室类型">
          <el-select
            v-model="queryParams.labType"
            placeholder="全部"
            clearable
            style="width: 160px"
          >
            <el-option
              v-for="item in labTypeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所在地区">
          <el-input
            v-model="queryParams.region"
            placeholder="精确匹配"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="主管部门">
          <el-input
            v-model="queryParams.department"
            placeholder="精确匹配"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="展示" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增实验室</el-button>
      <el-button @click="handleImport">导入Excel</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量永久删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="universityName" label="院校名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="name" label="实验室名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="labType" label="实验室类型" width="130" show-overflow-tooltip />
        <el-table-column prop="region" label="所在地区" width="100" />
        <el-table-column prop="department" label="主管部门" width="100" show-overflow-tooltip />
        <el-table-column prop="director" label="主任" width="90" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '展示' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="430" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.status === 1 ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id)">永久删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100, 200, 500, 1000]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="实验室名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="实验室类型">{{ detailData.labType }}</el-descriptions-item>
            <el-descriptions-item label="成立时间">{{ detailData.establishedYear || '-' }}</el-descriptions-item>
            <el-descriptions-item label="所在地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="主管部门">{{ detailData.department || '-' }}</el-descriptions-item>
            <el-descriptions-item label="主任">{{ detailData.director || '-' }}</el-descriptions-item>
            <el-descriptions-item label="人员规模">{{ detailData.staffCount || '-' }}</el-descriptions-item>
            <el-descriptions-item label="学生规模">{{ detailData.studentCount || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ detailData.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="实验室空间">{{ detailData.labSpace || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排序权重">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                {{ detailData.status === 1 ? '展示' : '下架' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="实验室简介" :span="2">
              <div class="max-h-32 overflow-y-auto">{{ detailData.introduction || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="研究方向" :span="2">
              <div class="max-h-32 overflow-y-auto">{{ detailData.researchDescription || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="开放课题" :span="2">
              <div class="max-h-32 overflow-y-auto">{{ detailData.openTopics || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="合作交流" :span="2">
              <div class="max-h-32 overflow-y-auto">{{ detailData.cooperation || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="访问学者" :span="2">
              <div class="max-h-32 overflow-y-auto">{{ detailData.visitingScholars || '-' }}</div>
            </el-descriptions-item>
            <el-descriptions-item label="研究领域">
              <template v-if="detailData.researchFields && detailData.researchFields.length > 0">
                <el-tag v-for="(f, i) in detailData.researchFields" :key="i" size="small" style="margin-right: 4px">{{ f }}</el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="主要设备">
              <template v-if="detailData.majorEquipment && detailData.majorEquipment.length > 0">
                <el-tag v-for="(e, i) in detailData.majorEquipment" :key="i" size="small" style="margin-right: 4px">{{ e }}</el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 核心团队 -->
          <div class="mt-4">
            <h4 class="mb-2 font-medium">核心团队</h4>
            <el-table :data="detailData.coreTeam || []" size="small" stripe>
              <el-table-column prop="name" label="成员姓名" width="150" />
              <el-table-column prop="position" label="职务" width="150" />
              <el-table-column prop="title" label="岗位名称" width="150" />
            </el-table>
            <div v-if="!detailData.coreTeam || detailData.coreTeam.length === 0" class="py-4 text-center text-sm text-gray-400">
              暂无数据
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="mt-4">
            <h4 class="mb-2 font-medium">统计数据</h4>
            <el-table :data="detailData.statistics || []" size="small" stripe>
              <el-table-column prop="label" label="统计标签" width="200" />
              <el-table-column prop="count" label="数量" width="100" />
            </el-table>
            <div v-if="!detailData.statistics || detailData.statistics.length === 0" class="py-4 text-center text-sm text-gray-400">
              暂无数据
            </div>
          </div>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-tabs v-model="activeTab">
            <!-- Tab1 基础信息 -->
            <el-tab-pane label="基础信息" name="basic">
              <el-form :model="formData" label-width="110px">
                <el-form-item label="所属院校" required>
                  <el-select
                    v-model="formData.universityId"
                    placeholder="请选择院校"
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in universityOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="实验室名称" required>
                  <el-input v-model="formData.name" placeholder="请输入实验室名称" maxlength="100" />
                </el-form-item>
                <el-form-item label="实验室类型" required>
                  <el-select v-model="formData.labType" placeholder="请选择" style="width: 100%">
                    <el-option
                      v-for="item in labTypeOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="成立时间">
                  <el-input v-model="formData.establishedYear" placeholder="如：2005年" maxlength="20" />
                </el-form-item>
                <el-form-item label="所在地区">
                  <el-input v-model="formData.region" placeholder="省市信息" maxlength="100" />
                </el-form-item>
                <el-form-item label="主管部门">
                  <el-input v-model="formData.department" placeholder="如：教育部、科技部" maxlength="100" />
                </el-form-item>
                <el-form-item label="实验室主任">
                  <el-input v-model="formData.director" placeholder="主任姓名" maxlength="50" />
                </el-form-item>
                <el-form-item label="排序权重">
                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 200px" />
                </el-form-item>
                <el-form-item v-if="dialogMode === 'edit'" label="状态">
                  <el-switch v-model="editFormStatus" :active-value="1" :inactive-value="0" />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <!-- Tab2 详细信息 -->
            <el-tab-pane label="详细信息" name="detail">
              <el-form :model="formData" label-width="110px">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="人员规模">
                      <el-input v-model="formData.staffCount" placeholder="总人数" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="学生规模">
                      <el-input v-model="formData.studentCount" placeholder="学生人数" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="联系邮箱">
                      <el-input v-model="formData.email" placeholder="官方邮箱" maxlength="200" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="联系电话">
                      <el-input v-model="formData.phone" placeholder="联系电话" maxlength="50" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="实验室简介">
                  <el-input v-model="formData.introduction" type="textarea" :rows="3" maxlength="2000" />
                </el-form-item>
                <el-form-item label="研究方向描述">
                  <el-input v-model="formData.researchDescription" type="textarea" :rows="3" maxlength="2000" />
                </el-form-item>
                <el-form-item label="实验室空间">
                  <el-input v-model="formData.labSpace" placeholder="如：5000平方米" maxlength="50" />
                </el-form-item>
                <el-form-item label="开放课题">
                  <el-input v-model="formData.openTopics" type="textarea" :rows="2" maxlength="2000" />
                </el-form-item>
                <el-form-item label="合作交流">
                  <el-input v-model="formData.cooperation" type="textarea" :rows="2" maxlength="2000" />
                </el-form-item>
                <el-form-item label="访问学者">
                  <el-input v-model="formData.visitingScholars" type="textarea" :rows="2" maxlength="2000" />
                </el-form-item>
                <el-form-item label="研究领域">
                  <el-select
                    v-model="formData.researchFields"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入后回车添加"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="主要设备">
                  <el-select
                    v-model="formData.majorEquipment"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入后回车添加"
                    style="width: 100%"
                  />
                </el-form-item>

                <!-- 核心团队 -->
                <el-form-item label="核心团队">
                  <div class="w-full">
                    <el-table :data="formData.coreTeam" size="small" stripe>
                      <el-table-column label="成员姓名" width="160">
                        <template #default="{ row, $index }">
                          <el-input v-model="row.name" placeholder="姓名" size="small" />
                        </template>
                      </el-table-column>
                      <el-table-column label="职务" width="160">
                        <template #default="{ row, $index }">
                          <el-input v-model="row.position" placeholder="如：教授" size="small" />
                        </template>
                      </el-table-column>
                      <el-table-column label="岗位名称" width="160">
                        <template #default="{ row, $index }">
                          <el-input v-model="row.title" placeholder="如：课题负责人" size="small" />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="60" align="center">
                        <template #default="{ $index }">
                          <el-button type="danger" link @click="removeCoreTeamRow(formData.coreTeam, $index)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-button class="mt-2" size="small" @click="addCoreTeamRow(formData.coreTeam)">添加成员</el-button>
                  </div>
                </el-form-item>

                <!-- 统计数据 -->
                <el-form-item label="统计数据">
                  <div class="w-full">
                    <el-table :data="formData.statistics" size="small" stripe>
                      <el-table-column label="统计标签" width="200">
                        <template #default="{ row, $index }">
                          <el-input v-model="row.label" placeholder="如：发表论文数" size="small" />
                        </template>
                      </el-table-column>
                      <el-table-column label="数量" width="120">
                        <template #default="{ row, $index }">
                          <el-input-number v-model="row.count" :min="0" size="small" style="width: 120px" />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="60" align="center">
                        <template #default="{ $index }">
                          <el-button type="danger" link @click="removeStatisticsRow(formData.statistics, $index)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-button class="mt-2" size="small" @click="addStatisticsRow(formData.statistics)">添加统计项</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
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
