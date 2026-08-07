<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getEnterpriseDetail,
  addEnterprise,
  updateEnterprise,
  getEnterprisePositionPage,
  addEnterprisePosition,
  updateEnterprisePosition,
  deleteEnterprisePosition,
  batchDeleteEnterprisePosition,
} from '@/api/company'
import type {
  EnterpriseDetailVO,
  EnterpriseAddDTO,
  EnterpriseUpdateDTO,
  PositionVO,
  EnterprisePositionAddDTO,
  EnterprisePositionUpdateDTO,
} from '@/types/company'

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'add' | 'edit'
  currentId: string | null
  natureOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formLoading = ref(false)
const detailData = ref<EnterpriseDetailVO | null>(null)

const activeTab = ref<'basic' | 'positions'>('basic')

const formData = ref<EnterpriseAddDTO>({
  cityName: '',
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  logoUrl: '',
  officialWebsite: '',
  region: '',
  enterpriseScale: '',
  mainBusiness: '',
  enterpriseIntro: '',
  recruitmentStatus: '招聘中',
})

const dialogTitle = (() => {
  if (props.mode === 'add') return '新增企业'
  if (props.mode === 'edit') return '修改企业'
  return '企业详情'
})()

// ===== 企业岗位 =====
const positions = ref<PositionVO[]>([])
const positionLoading = ref(false)
const positionPage = ref(1)
const positionTotal = ref(0)
const POSITION_PAGE_SIZE = 100

// 岗位批量删除：选中的行
const selectedPositionIds = ref<string[]>([])
const handlePositionSelectionChange = (rows: PositionVO[]) => {
  selectedPositionIds.value = rows.map((r) => r.id)
}

// 新增模式：岗位先本地暂存（企业暂无 id），保存企业后再批量落库
const pendingPositions = ref<EnterprisePositionAddDTO[]>([])
const editingPositionIndex = ref<number | null>(null)

const positionFormVisible = ref(false)
const positionFormLoading = ref(false)
const positionFormMode = ref<'add' | 'edit'>('add')
const editingPositionId = ref<string | null>(null)
const positionForm = ref<EnterprisePositionAddDTO>({
  positionName: '',
  recruitmentType: '',
  positionRequirement: '',
  positionTags: [],
  province: '',
  city: '',
  workLocation: '',
  educationRequirement: '',
  majorRequirement: '',
  workExperience: '',
  salaryMin: null,
  salaryMax: null,
  applyLink: '',
  deadline: null,
  positionStatus: '招聘中',
})

const recruitmentTypeOptions = ['校招', '社招', '实习']
const educationRequirementOptions = ['不限', '大专', '本科', '硕士', '博士']
const positionStatusOptions = ['招聘中', '已结束']

const fetchPositions = async () => {
  if (!props.currentId || props.mode === 'add') return
  positionLoading.value = true
  try {
    const res = await getEnterprisePositionPage(props.currentId, {
      page: positionPage.value,
      size: POSITION_PAGE_SIZE,
    })
    if (res.data.code === 200) {
      positions.value = res.data.data.records
      positionTotal.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取岗位列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取岗位列表失败')
  } finally {
    positionLoading.value = false
  }
}

const openPositionForm = (mode: 'add' | 'edit', row?: any, index?: number) => {
  positionFormMode.value = mode
  if (mode === 'add') {
    editingPositionIndex.value = null
    positionForm.value = {
      positionName: '',
      recruitmentType: '',
      positionRequirement: '',
      positionTags: [],
      province: '',
      city: '',
      workLocation: '',
      educationRequirement: '',
      majorRequirement: '',
      workExperience: '',
      salaryMin: null,
      salaryMax: null,
      applyLink: '',
      deadline: null,
      positionStatus: '招聘中',
    }
  } else if (row) {
    editingPositionIndex.value = index ?? null
    positionForm.value = {
      positionName: row.positionName,
      recruitmentType: row.recruitmentType || '',
      positionRequirement: row.positionRequirement || '',
      positionTags: row.positionTags ? [...row.positionTags] : [],
      province: row.province || '',
      city: row.city || '',
      workLocation: row.workLocation || '',
      educationRequirement: row.educationRequirement || '',
      majorRequirement: row.majorRequirement || '',
      workExperience: row.workExperience || '',
      salaryMin: row.salaryMin ?? null,
      salaryMax: row.salaryMax ?? null,
      applyLink: row.applyLink || '',
      deadline: row.deadline || null,
      positionStatus: row.positionStatus || '招聘中',
    }
  }
  positionFormVisible.value = true
}

const buildPositionData = (): EnterprisePositionAddDTO => ({
  positionName: positionForm.value.positionName,
  recruitmentType: positionForm.value.recruitmentType || undefined,
  positionRequirement: positionForm.value.positionRequirement || undefined,
  positionTags: positionForm.value.positionTags?.length ? positionForm.value.positionTags : undefined,
  province: positionForm.value.province || undefined,
  city: positionForm.value.city || undefined,
  workLocation: positionForm.value.workLocation || undefined,
  educationRequirement: positionForm.value.educationRequirement || undefined,
  majorRequirement: positionForm.value.majorRequirement || undefined,
  workExperience: positionForm.value.workExperience || undefined,
  salaryMin: positionForm.value.salaryMin ?? null,
  salaryMax: positionForm.value.salaryMax ?? null,
  applyLink: positionForm.value.applyLink || undefined,
  deadline: positionForm.value.deadline || null,
  positionStatus: positionForm.value.positionStatus || undefined,
})

const handlePositionSubmit = async () => {
  if (!positionForm.value.positionName) { ElMessage.warning('请填写岗位名称'); return }
  positionFormLoading.value = true
  const data = buildPositionData()
  try {
    // 新增模式：先本地暂存，保存企业后再批量落库
    if (props.mode === 'add') {
      if (editingPositionIndex.value === null) {
        pendingPositions.value.push(data)
      } else {
        pendingPositions.value[editingPositionIndex.value] = data
      }
      ElMessage.success(editingPositionIndex.value === null ? '岗位已加入待保存列表' : '岗位修改成功')
      positionFormVisible.value = false
      return
    }
    if (!props.currentId) { ElMessage.warning('企业ID不存在'); return }
    let res: any
    if (positionFormMode.value === 'add') {
      res = await addEnterprisePosition(props.currentId, data)
    } else if (editingPositionId.value) {
      res = await updateEnterprisePosition(props.currentId, editingPositionId.value, data as EnterprisePositionUpdateDTO)
    } else {
      return
    }
    if (res.data.code === 200) {
      ElMessage.success(positionFormMode.value === 'add' ? '岗位新增成功' : '岗位修改成功')
      positionFormVisible.value = false
      fetchPositions()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  } finally {
    positionFormLoading.value = false
  }
}

const handlePositionDelete = async (row: any, index?: number) => {
  // 新增模式：仅从本地暂存列表移除
  if (props.mode === 'add') {
    if (index === undefined) return
    pendingPositions.value.splice(index, 1)
    return
  }
  if (!props.currentId) return
  try {
    await ElMessageBox.confirm(`确定要永久删除岗位「${row.positionName}」吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await deleteEnterprisePosition(props.currentId, row.id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchPositions()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* cancel */ }
}

// 批量删除岗位（级联的岗位级批量删除入口，复用后端的 /position/batch/delete）
const handleBatchDeletePosition = async () => {
  if (!props.currentId || selectedPositionIds.value.length === 0) return
  const count = selectedPositionIds.value.length
  try {
    await ElMessageBox.confirm(
      `确定要永久删除选中的 ${count} 个岗位吗？此操作不可恢复！`,
      '批量删除岗位',
      { type: 'warning', confirmButtonText: `确定删除(${count})`, cancelButtonText: '取消' },
    )
    const res = await batchDeleteEnterprisePosition(props.currentId, selectedPositionIds.value)
    if (res.data.code === 200) {
      ElMessage.success(`已批量删除 ${count} 个岗位`)
      selectedPositionIds.value = []
      fetchPositions()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* cancel */ }
}

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      formLoading.value = true
      detailData.value = null
      activeTab.value = 'basic'

      if (props.mode === 'add') {
        formData.value = {
          cityName: '',
          enterpriseName: '',
          enterpriseNature: '',
          enterpriseType: '',
          logoUrl: '',
          officialWebsite: '',
          region: '',
          enterpriseScale: '',
          mainBusiness: '',
          enterpriseIntro: '',
          recruitmentStatus: '招聘中',
        }
        pendingPositions.value = []
        editingPositionIndex.value = null
        formLoading.value = false
      } else if (props.mode === 'edit' && props.currentId) {
        try {
          const res = await getEnterpriseDetail(props.currentId)
          if (res.data.code === 200) {
            const d = res.data.data
            formData.value = {
              cityName: d.cityName || '',
              enterpriseName: d.enterpriseName,
              enterpriseNature: d.enterpriseNature,
              enterpriseType: d.enterpriseType || '',
              logoUrl: d.logoUrl || '',
              officialWebsite: d.officialWebsite || '',
              region: d.region || '',
              enterpriseScale: d.enterpriseScale || '',
              mainBusiness: d.mainBusiness || '',
              enterpriseIntro: d.enterpriseIntro || '',
              recruitmentStatus: d.recruitmentStatus,
            }
          }
        } catch (e: any) { ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败') }
        finally { formLoading.value = false }
        fetchPositions()
      } else if (props.mode === 'detail' && props.currentId) {
        try {
          const res = await getEnterpriseDetail(props.currentId)
          if (res.data.code === 200) detailData.value = res.data.data
        } catch (e: any) { ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败') }
        finally { formLoading.value = false }
      }
    }
  }
)

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

const handleSubmit = async () => {
  if (!formData.value.enterpriseName) {
    ElMessage.warning('请填写企业名称')
    return
  }
  if (!formData.value.enterpriseNature) {
    ElMessage.warning('请选择企业性质')
    return
  }

  formLoading.value = true
  try {
    const data: Record<string, any> = {
      enterpriseName: formData.value.enterpriseName,
      enterpriseNature: formData.value.enterpriseNature,
    }
    if (formData.value.cityName) data.cityName = formData.value.cityName
    if (formData.value.enterpriseType) data.enterpriseType = formData.value.enterpriseType
    if (formData.value.logoUrl) data.logoUrl = formData.value.logoUrl
    if (formData.value.officialWebsite) data.officialWebsite = formData.value.officialWebsite
    if (formData.value.region) data.region = formData.value.region
    if (formData.value.enterpriseScale) data.enterpriseScale = formData.value.enterpriseScale
    if (formData.value.mainBusiness) data.mainBusiness = formData.value.mainBusiness
    if (formData.value.enterpriseIntro) data.enterpriseIntro = formData.value.enterpriseIntro
    if (formData.value.recruitmentStatus) data.recruitmentStatus = formData.value.recruitmentStatus

    let res: any
    if (props.mode === 'add') {
      res = await addEnterprise(data as EnterpriseAddDTO)
      if (res.data.code === 200) {
        const newId = res.data.data as string | undefined
        // 新建企业成功后，把本地暂存的岗位批量落库
        if (newId && pendingPositions.value.length) {
          let okCount = 0
          for (const p of pendingPositions.value) {
            try {
              const r = await addEnterprisePosition(newId, p)
              if (r.data.code === 200) okCount++
            } catch {
              // 单条岗位保存失败不阻断其余岗位
            }
          }
          if (okCount < pendingPositions.value.length) {
            ElMessage.warning(`企业已创建，但有 ${pendingPositions.value.length - okCount} 个岗位保存失败`)
          }
        }
        ElMessage.success('新增成功')
        emit('update:visible', false)
        emit('success')
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
      return
    } else if (props.mode === 'edit' && props.currentId) {
      res = await updateEnterprise(props.currentId, data as EnterpriseUpdateDTO)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success('修改成功')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="900px"
    class="detail-dialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <!-- 详情模式 -->
      <template v-if="mode === 'detail' && detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="企业名称">{{ detailData.enterpriseName }}</el-descriptions-item>
          <el-descriptions-item label="城市名称">{{ detailData.cityName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业性质">{{ detailData.enterpriseNature }}</el-descriptions-item>
          <el-descriptions-item label="企业类型">{{ detailData.enterpriseType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招聘状态">
            <span :class="['tag-pill', detailData.recruitmentStatus === '招聘中' ? 'tag-green' : 'tag-gray']">
              {{ detailData.recruitmentStatus }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status-pill', detailData.isDeleted ? 'status-off' : 'status-on']">
              {{ statusLabel(detailData.isDeleted) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="总部地区">{{ detailData.region || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业规模">{{ detailData.enterpriseScale || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Logo地址">
            <a v-if="detailData.logoUrl" :href="detailData.logoUrl" target="_blank" class="link-orange">
              {{ detailData.logoUrl }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="官网">
            <a v-if="detailData.officialWebsite" :href="detailData.officialWebsite" target="_blank" class="link-orange">
              {{ detailData.officialWebsite }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="主营业务" :span="2">{{ detailData.mainBusiness || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业简介" :span="2">{{ detailData.enterpriseIntro || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>

        <!-- 关联岗位子表格 -->
        <div class="positions-section">
          <h3 class="positions-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            关联岗位
          </h3>
          <div v-if="detailData.positions?.length" class="positions-table">
            <el-table :data="detailData.positions" stripe size="small">
              <el-table-column prop="positionName" label="岗位名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
              <el-table-column prop="province" label="省份" width="80" />
              <el-table-column prop="city" label="城市" width="80" />
              <el-table-column prop="workLocation" label="工作地点" width="140" show-overflow-tooltip />
              <el-table-column prop="educationRequirement" label="学历要求" width="90" />
              <el-table-column prop="majorRequirement" label="专业要求" width="120" show-overflow-tooltip />
              <el-table-column prop="workExperience" label="工作经验" width="90" />
              <el-table-column label="薪资(k/月)" width="120">
                <template #default="{ row }">
                  {{ row.salaryMin ?? '-' }} - {{ row.salaryMax ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="positionStatus" label="岗位状态" width="90" />
              <el-table-column prop="deadline" label="截止日期" width="100" />
            </el-table>
          </div>
          <div v-else class="positions-empty">暂无关联岗位</div>
        </div>
      </template>

      <!-- 新增/修改模式 -->
      <template v-if="mode !== 'detail'">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form :model="formData" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="企业名称" required>
                    <el-input v-model="formData.enterpriseName" placeholder="请输入企业名称" maxlength="200" show-word-limit />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="企业性质" required>
                    <el-select v-model="formData.enterpriseNature" placeholder="请选择" style="width: 100%">
                      <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="城市名称">
                    <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="企业类型">
                    <el-input v-model="formData.enterpriseType" placeholder="请输入企业类型" maxlength="50" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Logo地址">
                    <el-input v-model="formData.logoUrl" placeholder="请输入Logo图片URL" maxlength="500" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="官网">
                    <el-input v-model="formData.officialWebsite" placeholder="请输入企业官网" maxlength="500" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="总部地区">
                    <el-input v-model="formData.region" placeholder="如: 广东省深圳市" maxlength="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="企业规模">
                    <el-input v-model="formData.enterpriseScale" placeholder="如: 10000人以上" maxlength="50" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="招聘状态">
                    <el-select v-model="formData.recruitmentStatus" placeholder="请选择招聘状态" style="width: 100%">
                      <el-option label="招聘中" value="招聘中" />
                      <el-option label="已结束" value="已结束" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="主营业务">
                    <el-input v-model="formData.mainBusiness" placeholder="请输入主营业务" maxlength="500" show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="企业简介">
                <el-input v-model="formData.enterpriseIntro" type="textarea" :rows="4" placeholder="请输入企业简介" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="企业岗位" name="positions">
            <!-- 新增模式：岗位本地暂存，保存企业后批量落库 -->
            <div v-if="mode === 'add'">
              <div class="positions-toolbar">
                <div class="positions-toolbar-left">
                  <button type="button" class="position-add-btn" @click="openPositionForm('add')">
                    新增岗位
                  </button>
                </div>
                <span class="positions-count">待保存 {{ pendingPositions.length }} 个岗位</span>
              </div>
              <div class="positions-edit-list">
                <el-table
                  :data="pendingPositions"
                  stripe
                  size="small"
                  empty-text="暂无岗位，点击「新增岗位」添加"
                >
                  <el-table-column prop="positionName" label="岗位名称" min-width="140" show-overflow-tooltip />
                  <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
                  <el-table-column prop="educationRequirement" label="学历要求" width="90" />
                  <el-table-column prop="city" label="城市" width="90" />
                  <el-table-column prop="workLocation" label="工作地点" width="120" show-overflow-tooltip />
                  <el-table-column label="薪资(k/月)" width="120">
                    <template #default="{ row }">
                      {{ row.salaryMin ?? '-' }} - {{ row.salaryMax ?? '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="positionStatus" label="状态" width="90" />
                  <el-table-column label="操作" width="140" align="center" fixed="right">
                    <template #default="{ row, $index }">
                      <div class="pos-actions">
                        <button type="button" class="op-btn orange" @click="openPositionForm('edit', row, $index)">编辑</button>
                        <button type="button" class="op-btn red" @click="handlePositionDelete(row, $index)">删除</button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 修改/详情模式：维护后端已存在的岗位 -->
            <template v-else>
              <div class="positions-toolbar">
                <div class="positions-toolbar-left">
                  <button type="button" class="position-add-btn" @click="openPositionForm('add')">
                    新增岗位
                  </button>
                  <button
                    type="button"
                    class="position-batch-del-btn"
                    :disabled="selectedPositionIds.length === 0"
                    @click="handleBatchDeletePosition"
                  >
                    批量删除{{ selectedPositionIds.length ? `(${selectedPositionIds.length})` : '' }}
                  </button>
                </div>
                <span class="positions-count">共 {{ positionTotal }} 个岗位</span>
              </div>
              <div v-loading="positionLoading" class="positions-edit-list">
                <el-table
                  :data="positions"
                  stripe
                  size="small"
                  empty-text="暂无岗位，点击「新增岗位」添加"
                  @selection-change="handlePositionSelectionChange"
                >
                  <el-table-column type="selection" width="45" />
                  <el-table-column prop="positionName" label="岗位名称" min-width="140" show-overflow-tooltip />
                  <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
                  <el-table-column prop="educationRequirement" label="学历要求" width="90" />
                  <el-table-column prop="city" label="城市" width="90" />
                  <el-table-column prop="workLocation" label="工作地点" width="120" show-overflow-tooltip />
                  <el-table-column label="薪资(k/月)" width="120">
                    <template #default="{ row }">
                      {{ row.salaryMin ?? '-' }} - {{ row.salaryMax ?? '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="positionStatus" label="状态" width="90" />
                  <el-table-column label="操作" width="140" align="center" fixed="right">
                    <template #default="{ row }">
                      <div class="pos-actions">
                        <button type="button" class="op-btn orange" @click="openPositionForm('edit', row)">编辑</button>
                        <button type="button" class="op-btn red" @click="handlePositionDelete(row)">删除</button>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">
          {{ mode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="mode !== 'detail'" type="button" class="submit-btn" :disabled="formLoading" @click="handleSubmit">
          <span v-if="formLoading" class="loading-spinner"></span>
          确定
        </button>
      </div>
    </template>

    <!-- 岗位新增/编辑弹窗 -->
    <el-dialog
      :model-value="positionFormVisible"
      :title="positionFormMode === 'add' ? '新增岗位' : '编辑岗位'"
      width="720px"
      class="position-dialog"
      :close-on-click-modal="false"
      append-to-body
      @close="positionFormVisible = false"
    >
      <div v-loading="positionFormLoading">
        <el-form :model="positionForm" label-width="110px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="岗位名称" required>
                <el-input v-model="positionForm.positionName" placeholder="请输入岗位名称" maxlength="200" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="招聘类型">
                <el-select v-model="positionForm.recruitmentType" placeholder="请选择" clearable style="width: 100%">
                  <el-option v-for="opt in recruitmentTypeOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="学历要求">
                <el-select v-model="positionForm.educationRequirement" placeholder="请选择" clearable style="width: 100%">
                  <el-option v-for="opt in educationRequirementOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="岗位状态">
                <el-select v-model="positionForm.positionStatus" placeholder="请选择" clearable style="width: 100%">
                  <el-option v-for="opt in positionStatusOptions" :key="opt" :label="opt" :value="opt" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="省份">
                <el-input v-model="positionForm.province" placeholder="如: 广东省" maxlength="30" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="城市">
                <el-input v-model="positionForm.city" placeholder="如: 深圳市" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="工作地点">
            <el-input v-model="positionForm.workLocation" placeholder="详细工作地点" maxlength="200" />
          </el-form-item>
          <el-form-item label="专业要求">
            <el-input v-model="positionForm.majorRequirement" placeholder="如: 计算机科学与技术、软件工程" maxlength="500" />
          </el-form-item>
          <el-form-item label="工作经验">
            <el-input v-model="positionForm.workExperience" placeholder="如: 3年以上" maxlength="50" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="薪资下限(k)">
                <el-input-number v-model="positionForm.salaryMin" :min="0" :precision="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="薪资上限(k)">
                <el-input-number v-model="positionForm.salaryMax" :min="0" :precision="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="截止日期">
            <el-date-picker
              v-model="positionForm.deadline"
              type="date"
              value-format="YYYY-MM-DDTHH:mm:ss"
              placeholder="选择截止日期"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="申请链接">
            <el-input v-model="positionForm.applyLink" placeholder="https://..." maxlength="500" />
          </el-form-item>
          <el-form-item label="岗位要求">
            <el-input v-model="positionForm.positionRequirement" type="textarea" :rows="3" placeholder="岗位职责、任职要求等" maxlength="500" />
          </el-form-item>
          <el-form-item label="岗位标签">
            <el-select
              v-model="positionForm.positionTags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="输入后回车添加标签"
              style="width: 100%"
            >
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <button type="button" class="cancel-btn" @click="positionFormVisible = false">取消</button>
          <button type="button" class="submit-btn" :disabled="positionFormLoading" @click="handlePositionSubmit">
            <span v-if="positionFormLoading" class="loading-spinner"></span>
            确定
          </button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.dialog-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.dialog-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}

.dialog-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.dialog-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.dialog-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.dialog-content :deep(.el-input__wrapper),
.dialog-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-input__wrapper:hover),
.dialog-content :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-input__wrapper.is-focus),
.dialog-content :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.dialog-content :deep(.el-select__wrapper) {
  border-radius: 8px;
}

.dialog-content :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.positions-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(249, 115, 22, 0.1);
}

.positions-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.positions-title svg {
  width: 18px;
  height: 18px;
  color: #F97316;
}

.positions-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.positions-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #F97316;
}

.positions-table :deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(249, 115, 22, 0.06);
}

.positions-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 247, 237, 0.3);
}

.positions-table :deep(.el-table .el-table__body tr:hover > td.el-table__cell) {
  background: rgba(249, 115, 22, 0.05) !important;
}

.positions-empty {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
  background: rgba(255, 247, 237, 0.3);
  border-radius: 8px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tag-gray {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.link-orange {
  color: #F97316;
  text-decoration: none;
  word-break: break-all;
  font-size: 13px;
}

.link-orange:hover {
  text-decoration: underline;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== 企业岗位 tab ===== */
.detail-dialog :deep(.el-tabs__item.is-active) {
  color: #F97316;
  font-weight: 600;
}
.detail-dialog :deep(.el-tabs__active-bar) {
  background: #F97316;
}
.detail-dialog :deep(.el-tabs__item:hover) {
  color: #F97316;
}

.positions-add-hint {
  padding: 40px 0;
  text-align: center;
  color: #9ca3af;
  background: rgba(255, 247, 237, 0.3);
  border-radius: 8px;
}

.positions-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.positions-count {
  font-size: 13px;
  color: #6b7280;
}

.position-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.position-add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.positions-toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.position-batch-del-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.position-batch-del-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.16);
  transform: translateY(-1px);
}
.position-batch-del-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.positions-edit-list {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.1);
}
.positions-edit-list :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #F97316;
}
.positions-edit-list :deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(249, 115, 22, 0.06);
}
.positions-edit-list :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 247, 237, 0.3);
}
.positions-edit-list :deep(.el-table .el-table__body tr:hover > td.el-table__cell) {
  background: rgba(249, 115, 22, 0.05) !important;
}

.pos-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.op-btn {
  padding: 3px 12px;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.op-btn.orange {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}
.op-btn.orange:hover {
  background: rgba(249, 115, 22, 0.18);
}
.op-btn.red {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.op-btn.red:hover {
  background: rgba(239, 68, 68, 0.16);
}

.position-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.position-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}
.position-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}
.position-dialog :deep(.el-dialog__body) {
  padding: 24px;
}
.position-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}
.position-dialog :deep(.el-input__wrapper),
.position-dialog :deep(.el-textarea__inner),
.position-dialog :deep(.el-select__wrapper) {
  border-radius: 8px;
}
.position-dialog :deep(.el-input__wrapper:hover),
.position-dialog :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.position-dialog :deep(.el-input__wrapper.is-focus),
.position-dialog :deep(.el-textarea__inner:focus),
.position-dialog :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.position-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>
