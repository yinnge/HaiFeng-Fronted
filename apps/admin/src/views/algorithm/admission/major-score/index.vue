<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getMajorScorePage,
  getMajorScoreDetail,
  addMajorScore,
  updateMajorScore,
  updateMajorScoreStatus,
  deleteMajorScore,
  batchDeleteMajorScore,
} from '@/api/algorithm/admission/major-score'
import { getGroupPage } from '@/api/algorithm/admission/group'
import type {
  AdmissionMajorScoreListVO,
  AdmissionMajorScoreDetailVO,
  AdmissionMajorScoreQueryDTO,
  AdmissionMajorScoreAddDTO,
} from '@/types/algorithm/admission'

const route = useRoute()
const loading = ref(false)
const tableData = ref<AdmissionMajorScoreListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const groupOptions = ref<{ id: string; label: string }[]>([])
const educationLevelOptions = ['本科', '专科']

const queryParams = reactive<AdmissionMajorScoreQueryDTO>({
  page: 1,
  size: 10,
  groupId: undefined,
  majorCode: '',
  majorName: '',
  educationLevel: '',
  isDeleted: false,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<AdmissionMajorScoreDetailVO | null>(null)

const formData = reactive<AdmissionMajorScoreAddDTO>({
  groupId: '',
  majorCode: '',
  majorName: '',
  educationLevel: '',
  duration: '',
  tuition: '',
  description: '',
  admissionCount: undefined,
  minScore: undefined,
  minRank: undefined,
  avgScore: undefined,
  avgRank: undefined,
  maxScore: undefined,
  maxRank: undefined,
  constraints: [],
})

const fetchGroupOptions = async () => {
  try {
    const res = await getGroupPage({ page: 1, size: 1000, isDeleted: false })
    if (res.data.code === 200) {
      groupOptions.value = res.data.data.records.map((g) => ({
        id: g.id,
        label: `${g.universityName} - ${g.groupName || g.groupCode} (${g.year})`,
      }))
    }
  } catch {
    // silent fail for dropdown
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.isDeleted !== undefined && queryParams.isDeleted !== null) params.isDeleted = queryParams.isDeleted
    if (queryParams.groupId) params.groupId = queryParams.groupId
    if (queryParams.majorCode) params.majorCode = queryParams.majorCode
    if (queryParams.majorName) params.majorName = queryParams.majorName
    if (queryParams.educationLevel) params.educationLevel = queryParams.educationLevel
    const res = await getMajorScorePage(params as AdmissionMajorScoreQueryDTO)
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
  queryParams.groupId = undefined
  queryParams.majorCode = ''
  queryParams.majorName = ''
  queryParams.educationLevel = ''
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

const handleSelectionChange = (selection: AdmissionMajorScoreListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.groupId = queryParams.groupId ? String(queryParams.groupId) : ''
  formData.majorCode = ''
  formData.majorName = ''
  formData.educationLevel = ''
  formData.duration = ''
  formData.tuition = ''
  formData.description = ''
  formData.admissionCount = undefined
  formData.minScore = undefined
  formData.minRank = undefined
  formData.avgScore = undefined
  formData.avgRank = undefined
  formData.maxScore = undefined
  formData.maxRank = undefined
  formData.constraints = []
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增专业明细'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getMajorScoreDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改专业明细'
          formData.groupId = d.groupId
          formData.majorCode = d.majorCode
          formData.majorName = d.majorName
          formData.educationLevel = d.educationLevel || ''
          formData.duration = d.duration || ''
          formData.tuition = d.tuition || ''
          formData.description = d.description || ''
          formData.admissionCount = d.admissionCount ?? undefined
          formData.minScore = d.minScore ?? undefined
          formData.minRank = d.minRank ?? undefined
          formData.avgScore = d.avgScore ?? undefined
          formData.avgRank = d.avgRank ?? undefined
          formData.maxScore = d.maxScore ?? undefined
          formData.maxRank = d.maxRank ?? undefined
          formData.constraints = d.constraints || []
        } else {
          dialogTitle.value = '专业明细详情'
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
  if (!formData.groupId || !formData.majorCode || !formData.majorName) {
    ElMessage.warning('请填写完整信息（必填字段）')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addMajorScore({
        ...formData,
        educationLevel: formData.educationLevel || undefined,
        duration: formData.duration || undefined,
        tuition: formData.tuition || undefined,
        description: formData.description || undefined,
        admissionCount: formData.admissionCount ?? undefined,
        minScore: formData.minScore ?? undefined,
        minRank: formData.minRank ?? undefined,
        avgScore: formData.avgScore ?? undefined,
        avgRank: formData.avgRank ?? undefined,
        maxScore: formData.maxScore ?? undefined,
        maxRank: formData.maxRank ?? undefined,
        constraints: formData.constraints && formData.constraints.length > 0 ? formData.constraints : undefined,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateMajorScore(currentId.value, {
        ...formData,
        educationLevel: formData.educationLevel || undefined,
        duration: formData.duration || undefined,
        tuition: formData.tuition || undefined,
        description: formData.description || undefined,
        admissionCount: formData.admissionCount ?? undefined,
        minScore: formData.minScore ?? undefined,
        minRank: formData.minRank ?? undefined,
        avgScore: formData.avgScore ?? undefined,
        avgRank: formData.avgRank ?? undefined,
        maxScore: formData.maxScore ?? undefined,
        maxRank: formData.maxRank ?? undefined,
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

const handleToggleStatus = async (row: AdmissionMajorScoreListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该专业明细吗？`, '提示')
    const res = await updateMajorScoreStatus(row.id, newStatus)
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
    await ElMessageBox.confirm('确定要软删除该专业明细吗？', '提示')
    const res = await deleteMajorScore(id)
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
    ElMessage.warning('请先选择要删除的专业明细')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要删除选中的${selectedIds.value.length} 条专业明细吗？`, '提示')
    const res = await batchDeleteMajorScore(selectedIds.value as unknown as number[])
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

watch(() => route.query.groupId, (val) => {
  if (val) {
    queryParams.groupId = Number(val)
    handleSearch()
  }
})

onMounted(() => {
  fetchGroupOptions()
  if (route.query.groupId) {
    queryParams.groupId = Number(route.query.groupId)
  }
  fetchData()
})
</script>

<template>
  <div class="page-wrap">
    <!-- 水印 -->
    <img src="@/assets/images/logo-main.png" class="watermark watermark-tr" />
    <img src="@/assets/images/logo-main.png" class="watermark watermark-bl" />

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">专业分数明细</h1>
      <p class="page-subtitle">管理招生专业的分数明细信息，支持专业明细的新增、修改、查询和状态管理</p>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        筛选条件
      </div>
      <div class="filter-wrapper">
        <div class="filter-fields">
          <el-form :model="queryParams" inline>
            <el-row :gutter="16" class="w-full">
              <el-col :span="6">
                <el-form-item label="所属专业组" style="width: 100%; margin-bottom: 16px;">
                  <el-select v-model="queryParams.groupId" placeholder="请选择" clearable filterable style="width: 100%;">
                    <el-option v-for="g in groupOptions" :key="g.id" :label="g.label" :value="g.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="专业代码" style="width: 100%; margin-bottom: 16px;">
                  <el-input v-model="queryParams.majorCode" placeholder="模糊搜索" clearable style="width: 100%;" @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="专业名称" style="width: 100%; margin-bottom: 16px;">
                  <el-input v-model="queryParams.majorName" placeholder="模糊搜索" clearable style="width: 100%;" @keyup.enter="handleSearch" />
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="层次" style="width: 100%; margin-bottom: 16px;">
                  <el-select v-model="queryParams.educationLevel" placeholder="全部" clearable style="width: 100%;">
                    <el-option v-for="e in educationLevelOptions" :key="e" :label="e" :value="e" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="3">
                <el-form-item label="状态" style="width: 100%; margin-bottom: 16px;">
                  <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 100%;">
                    <el-option label="启用" :value="false" />
                    <el-option label="禁用" :value="true" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="search-actions">
          <button class="custom-btn search-btn" @click.prevent="handleSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>查询</span>
          </button>
          <button class="custom-btn reset-btn" @click.prevent="handleReset">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            <span>重置</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="custom-btn add-btn" @click="openDialog('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>新增专业明细</span>
      </button>
      <button class="custom-btn danger-btn" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        <span>批量软删除</span>
      </button>
      <button class="custom-btn outline-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        <span>刷新</span>
      </button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" min-width="70" />
        <el-table-column prop="groupId" label="专业组ID" min-width="90" />
        <el-table-column prop="majorCode" label="专业代码" min-width="120" />
        <el-table-column prop="majorName" label="专业名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="educationLevel" label="层次" min-width="80" />
        <el-table-column prop="admissionCount" label="录取人数" min-width="90" />
        <el-table-column prop="minScore" label="最低分" min-width="80" />
        <el-table-column prop="minRank" label="最低位次" min-width="90" />
        <el-table-column prop="avgScore" label="平均分" min-width="80" />
        <el-table-column label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <span :class="['status-pill', row.isDeleted ? 'status-disabled' : 'status-enabled']">
              {{ row.isDeleted ? '禁用' : '启用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <button class="action-pill action-info" @click="openDialog('detail', row.id)">详情</button>
            <button class="action-pill action-edit" @click="openDialog('edit', row.id)">修改</button>
            <button :class="['action-pill', row.isDeleted ? 'action-enabled' : 'action-disabled']" @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </button>
            <button class="action-pill action-danger" @click="handleDelete(row.id)">软删除</button>
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

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false" class="uni-dialog">
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-tabs>
            <el-tab-pane label="基本信息">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
                <el-descriptions-item label="专业组ID">{{ detailData.groupId }}</el-descriptions-item>
                <el-descriptions-item label="专业ID">{{ detailData.majorId ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="专业代码">{{ detailData.majorCode }}</el-descriptions-item>
                <el-descriptions-item label="专业名称">{{ detailData.majorName }}</el-descriptions-item>
                <el-descriptions-item label="层次">{{ detailData.educationLevel || '-' }}</el-descriptions-item>
                <el-descriptions-item label="学制">{{ detailData.duration || '-' }}</el-descriptions-item>
                <el-descriptions-item label="学费">{{ detailData.tuition || '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <span :class="['status-pill', detailData.isDeleted ? 'status-disabled' : 'status-enabled']">
                    {{ detailData.isDeleted ? '禁用' : '启用' }}
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="约束条件" :span="2">
                  <template v-if="detailData.constraints && detailData.constraints.length > 0">
                    <el-tag v-for="c in detailData.constraints" :key="c" size="small" style="margin-right: 4px">{{ c }}</el-tag>
                  </template>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="专业简介" :span="2">
                  <div class="max-h-40 overflow-y-auto">{{ detailData.description || '-' }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="分数信息">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="录取人数">{{ detailData.admissionCount ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="最低分">{{ detailData.minScore ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="最低位次">{{ detailData.minRank ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="中位分">{{ detailData.avgScore ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="中位位次">{{ detailData.avgRank ?? '-' }}</el-descriptions-item>
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
            <el-form-item label="所属专业组" required class="dialog-form-item">
              <el-select v-model="formData.groupId" placeholder="请选择专业组" filterable style="width: 100%;">
                <el-option v-for="g in groupOptions" :key="g.id" :label="g.label" :value="g.id" />
              </el-select>
            </el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="专业代码" required class="dialog-form-item">
                  <el-input v-model="formData.majorCode" placeholder="请输入" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="专业名称" required class="dialog-form-item">
                  <el-input v-model="formData.majorName" placeholder="请输入" maxlength="100" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="层次" class="dialog-form-item">
                  <el-select v-model="formData.educationLevel" placeholder="请选择" clearable style="width: 100%;">
                    <el-option v-for="e in educationLevelOptions" :key="e" :label="e" :value="e" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="学制" class="dialog-form-item">
                  <el-input v-model="formData.duration" placeholder="如：四年" maxlength="20" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="学费" class="dialog-form-item">
                  <el-input v-model="formData.tuition" placeholder="如：5000元/年" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-divider>分数信息</el-divider>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="录取人数" class="dialog-form-item">
                  <el-input-number v-model="formData.admissionCount" :min="0" :max="99999" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="最低分" class="dialog-form-item">
                  <el-input-number v-model="formData.minScore" :min="0" :max="900" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="中位分" class="dialog-form-item">
                  <el-input-number v-model="formData.avgScore" :min="0" :precision="2" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="最高分" class="dialog-form-item">
                  <el-input-number v-model="formData.maxScore" :min="0" :max="900" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-form-item label="最低位次" class="dialog-form-item">
                  <el-input-number v-model="formData.minRank" :min="0" :max="9999999" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="中位位次" class="dialog-form-item">
                  <el-input-number v-model="formData.avgRank" :min="0" :max="9999999" style="width: 100%;" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="最高位次" class="dialog-form-item">
                  <el-input-number v-model="formData.maxRank" :min="0" :max="9999999" style="width: 100%;" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="约束条件" class="dialog-form-item">
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
            <el-form-item label="专业简介" class="dialog-form-item">
              <el-input v-model="formData.description" type="textarea" :rows="3" maxlength="2000" show-word-limit />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <button class="dialog-cancel-btn" @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="dialogMode !== 'detail'" class="dialog-confirm-btn" @click="handleSubmit">
          确定
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-wrap {
  background: linear-gradient(180deg, rgba(255,247,237,0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
}
.watermark-tr {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-bl {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.page-header {
  margin-bottom: 24px;
  z-index: 1;
  position: relative;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
}

.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  margin-bottom: 16px;
  position: relative;
}
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 20px;
}

.filter-wrapper {
  display: flex;
  align-items: flex-start;
}
.filter-fields {
  flex: 1;
  min-width: 0;
}
.search-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding-top: 6px;
  flex-shrink: 0;
}

.custom-btn {
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.2s;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}
.custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.search-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-weight: 600;
  padding: 8px 24px;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.search-btn:hover {
  box-shadow: 0 4px 12px rgba(249,115,22,0.45);
}
.reset-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 20px;
}
.reset-btn:hover {
  border-color: #F97316;
  color: #F97316;
}
.add-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 20px;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.add-btn:hover {
  box-shadow: 0 4px 12px rgba(249,115,22,0.45);
}
.outline-btn {
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
}
.outline-btn:hover {
  border-color: #F97316;
  color: #F97316;
}
.danger-btn {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.danger-btn:hover:not(:disabled) {
  box-shadow: 0 2px 8px rgba(239,68,68,0.4);
}

.action-bar {
  margin-bottom: 16px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249,115,22,0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

:deep(.table-card .el-table th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
:deep(.table-card .el-table__row--striped td) {
  background: rgba(255,247,237,0.3) !important;
}
:deep(.table-card .el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249,115,22,0.03), rgba(251,146,60,0.07)) !important;
}

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-enabled {
  background: #d1fae5;
  color: #065f46;
}
.status-disabled {
  background: #f3f4f6;
  color: #9ca3af;
}

.action-pill {
  border: none;
  cursor: pointer;
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  margin: 0 2px;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-info {
  background: rgba(249,115,22,0.1);
  color: #F97316;
}
.action-info:hover { background: rgba(249,115,22,0.2); }
.action-edit {
  background: rgba(59,130,246,0.1);
  color: #3b82f6;
}
.action-edit:hover { background: rgba(59,130,246,0.2); }
.action-enabled {
  background: rgba(16,185,129,0.1);
  color: #059669;
}
.action-enabled:hover { background: rgba(16,185,129,0.2); }
.action-disabled {
  background: rgba(234,179,8,0.1);
  color: #ca8a04;
}
.action-disabled:hover { background: rgba(234,179,8,0.2); }
.action-danger {
  background: rgba(239,68,68,0.1);
  color: #ef4444;
}
.action-danger:hover { background: rgba(239,68,68,0.2); }

.custom-pagination {
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
:deep(.custom-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 8px;
}
:deep(.custom-pagination .btn-prev:hover),
:deep(.custom-pagination .btn-next:hover) {
  color: #F97316 !important;
}

:deep(.uni-dialog .el-dialog__header) {
  border-bottom: 2px solid rgba(249,115,22,0.15);
  padding: 20px 24px;
}
:deep(.uni-dialog .el-dialog__title) {
  color: #1f2937;
  font-weight: 600;
}
:deep(.uni-dialog .el-descriptions__label) {
  background: rgba(249,115,22,0.06) !important;
  font-weight: 600;
  color: #374151;
}
:deep(.uni-dialog .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
:deep(.uni-dialog .el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
:deep(.uni-dialog .el-input-number__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
:deep(.uni-dialog .el-input__wrapper) {
  border-radius: 8px;
}
:deep(.uni-dialog .el-select__wrapper) {
  border-radius: 8px;
}
:deep(.uni-dialog .el-input-number__wrapper) {
  border-radius: 8px;
}
.dialog-form-item {
  margin-bottom: 18px !important;
}

.dialog-cancel-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}
.dialog-cancel-btn:hover {
  border-color: #F97316;
  color: #F97316;
}
.dialog-confirm-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(249,115,22,0.3);
}
.dialog-confirm-btn:hover {
  box-shadow: 0 4px 12px rgba(249,115,22,0.45);
}
</style>
