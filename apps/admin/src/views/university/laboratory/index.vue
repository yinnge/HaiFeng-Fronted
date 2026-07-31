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
  universityId: '',
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
  formData.universityId = ''
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

const fetchUniversityOptions = async (name?: string) => {
  try {
    const params: Record<string, any> = { page: 1, size: 100 }
    if (name) params.name = name
    const res = await getUniversityPage(params as any)
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

let searchTimer: ReturnType<typeof setTimeout> | null = null
const handleUniversitySearch = (query: string) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchUniversityOptions(query || undefined)
  }, 300)
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
    const res = await batchHardDeleteLaboratory(selectedIds.value as unknown as number[])
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
  <div class="page-wrap">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">实验室管理</div>
      <div class="page-subtitle">管理各院校的实验室信息</div>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        筛选条件
      </div>
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
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <button class="btn-search" @click="handleSearch">查询</button>
          <button class="btn-outline" @click="handleReset">重置</button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <button class="btn-primary" @click="openDialog('add')">新增实验室</button>
      <button class="btn-outline" @click="handleImport">导入Excel</button>
      <button class="btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchHardDelete">批量永久删除</button>
      <button class="btn-outline" @click="fetchData">刷新</button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        class="custom-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="universityName" label="院校名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="name" label="实验室名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="labType" label="实验室类型" width="130" show-overflow-tooltip />
        <el-table-column prop="region" label="所在地区" width="100" />
        <el-table-column prop="department" label="主管部门" width="100" show-overflow-tooltip />
        <el-table-column prop="director" label="主任" width="90" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="430" align="center" fixed="right">
          <template #default="{ row }">
            <button class="btn-op btn-op-detail" @click="openDialog('detail', row.id)">详情</button>
            <button class="btn-op btn-op-edit" @click="openDialog('edit', row.id)">修改</button>
            <button
              class="btn-op"
              :class="row.status === 1 ? 'btn-op-disable' : 'btn-op-enable'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </button>
            <button class="btn-op btn-op-delete" @click="handleHardDelete(row.id)">永久删除</button>
          </template>
        </el-table-column>
      </el-table>

      <div class="custom-pagination">
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
      class="uni-dialog"
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
                {{ detailData.status === 1 ? '启用' : '禁用' }}
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
                    placeholder="请输入院校名称搜索"
                    filterable
                    remote
                    :remote-method="handleUniversitySearch"
                    :loading="formLoading"
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
                          <button class="btn-op btn-op-delete" @click="removeCoreTeamRow(formData.coreTeam, $index)">删除</button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <button class="mt-2 btn-outline" style="padding:5px 14px;font-size:12px" @click="addCoreTeamRow(formData.coreTeam)">添加成员</button>
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
                          <button class="btn-op btn-op-delete" @click="removeStatisticsRow(formData.statistics, $index)">删除</button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <button class="mt-2 btn-outline" style="padding:5px 14px;font-size:12px" @click="addStatisticsRow(formData.statistics)">添加统计项</button>
                  </div>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </template>
      </div>

      <template #footer>
        <button class="btn-outline" @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="dialogMode !== 'detail'" class="btn-primary" @click="handleSubmit">
          确定
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ========== 页面整体 ========== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ========== 水印 ========== */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  left: -60px;
  top: -60px;
  transform: rotate(18deg);
}
.watermark-right {
  right: -40px;
  bottom: -40px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
}

/* ========== 页面头部 ========== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

/* ========== 搜索卡片 ========== */
.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  margin-bottom: 16px;
}
.section-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}

/* ========== 操作栏 ========== */
.action-bar {
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ========== 按钮 ========== */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transition: all 0.3s;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-outline:hover {
  border-color: #F97316;
  color: #F97316;
}

.btn-search {
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
}
.btn-search:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ========== 表格卡片 ========== */
.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

/* 表格头 */
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}

/* 行 hover */
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

/* 斑马纹 */
.custom-table :deep(.el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}

/* ========== 状态胶囊 ========== */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-on {
  background: rgba(249, 115, 22, 0.12);
  color: #F97316;
}
.status-off {
  background: #f3f4f6;
  color: #9ca3af;
}

/* ========== 操作按钮 ========== */
.btn-op {
  padding: 3px 10px;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  margin: 0 2px;
}
.btn-op:hover {
  opacity: 0.85;
}
.btn-op-detail {
  color: #F97316;
  background: rgba(249, 115, 22, 0.08);
}
.btn-op-edit {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}
.btn-op-enable {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}
.btn-op-disable {
  color: #eab308;
  background: rgba(234, 179, 8, 0.08);
}
.btn-op-delete {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

/* ========== 分页 ========== */
.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pagination .is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pagination .is-active .el-pager li) {
  color: #fff !important;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}

/* ========== Dialog ========== */
.uni-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
}
.uni-dialog :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}
.uni-dialog :deep(.el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06) !important;
}
.uni-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
}
.uni-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* ========== Tabs ========== */
.uni-dialog :deep(.el-tabs__active-bar) {
  background: #F97316;
}
.uni-dialog :deep(.el-tabs__item:hover) {
  color: #F97316;
}
.uni-dialog :deep(.el-tabs__item.is-active) {
  color: #F97316;
}
</style>
