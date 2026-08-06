<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCompetitionPage,
  getCompetitionDetail,
  addCompetition,
  updateCompetition,
  enableCompetition,
  softDeleteCompetition,
  hardDeleteCompetition,
  batchDeleteCompetition,
} from '@/api/certificate/competition'
import type {
  CompetitionListVO,
  CompetitionDetailVO,
  CompetitionQueryDTO,
  CompetitionAddDTO,
  CompetitionUpdateDTO,
} from '@/types/certificate/competition'

const loading = ref(false)
const tableData = ref<CompetitionListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<CompetitionQueryDTO>({
  page: 1,
  size: 10,
  compName: '',
  compLevel: undefined,
  isDeleted: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<CompetitionDetailVO | null>(null)

const formData = reactive<CompetitionAddDTO>({
  compName: '',
  compLevel: '',
  registrationTime: '',
})

// Dynamic list helpers for detail sub-fields
const newAward = ref('')
const newPurpose = ref('')
const newCriteria = ref('')
const newNotice = ref('')
const newRuleTitle = ref('')
const newRuleContent = ref('')
const newGuideTitle = ref('')
const newGuideContent = ref('')
const newAwardDispTitle = ref('')
const newAwardDispContent = ref('')

const basicInfoKey = ref('')
const basicInfoValue = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.compName) params.compName = queryParams.compName
    if (queryParams.compLevel) params.compLevel = queryParams.compLevel
    if (queryParams.isDeleted !== undefined) params.isDeleted = queryParams.isDeleted
    const res = await getCompetitionPage(params as CompetitionQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => {
  queryParams.compName = ''
  queryParams.compLevel = undefined
  queryParams.isDeleted = undefined
  queryParams.page = 1
  fetchData()
}
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}
const handleSelectionChange = (val: CompetitionListVO[]) => {
  selectedIds.value = val.map(v => v.id)
}

// Detail sub-field helpers
const addAward = () => { if (newAward.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.awards) formData.detail.awards = []; formData.detail.awards.push(newAward.value.trim()); newAward.value = '' } }
const removeAward = (i: number) => { formData.detail?.awards?.splice(i, 1) }
const addPurpose = () => { if (newPurpose.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.purposes) formData.detail.purposes = []; formData.detail.purposes.push(newPurpose.value.trim()); newPurpose.value = '' } }
const removePurpose = (i: number) => { formData.detail?.purposes?.splice(i, 1) }
const addCriteria = () => { if (newCriteria.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.scoringCriteria) formData.detail.scoringCriteria = []; formData.detail.scoringCriteria.push(newCriteria.value.trim()); newCriteria.value = '' } }
const removeCriteria = (i: number) => { formData.detail?.scoringCriteria?.splice(i, 1) }
const addNotice = () => { if (newNotice.value.trim()) { if (!formData.detail) formData.detail = {}; if (!formData.detail.notices) formData.detail.notices = []; formData.detail.notices.push(newNotice.value.trim()); newNotice.value = '' } }
const removeNotice = (i: number) => { formData.detail?.notices?.splice(i, 1) }
const addRule = () => {
  if (newRuleTitle.value.trim() && newRuleContent.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.competitionRules) formData.detail.competitionRules = []
    formData.detail.competitionRules.push({ title: newRuleTitle.value.trim(), content: newRuleContent.value.trim() })
    newRuleTitle.value = ''; newRuleContent.value = ''
  }
}
const removeRule = (i: number) => { formData.detail?.competitionRules?.splice(i, 1) }
const addGuide = () => {
  if (newGuideTitle.value.trim() && newGuideContent.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.processGuide) formData.detail.processGuide = []
    formData.detail.processGuide.push({ title: newGuideTitle.value.trim(), content: newGuideContent.value.trim() })
    newGuideTitle.value = ''; newGuideContent.value = ''
  }
}
const removeGuide = (i: number) => { formData.detail?.processGuide?.splice(i, 1) }
const addAwardDisp = () => {
  if (newAwardDispTitle.value.trim() && newAwardDispContent.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.awardsDisplay) formData.detail.awardsDisplay = []
    formData.detail.awardsDisplay.push({ title: newAwardDispTitle.value.trim(), content: newAwardDispContent.value.trim() })
    newAwardDispTitle.value = ''; newAwardDispContent.value = ''
  }
}
const removeAwardDisp = (i: number) => { formData.detail?.awardsDisplay?.splice(i, 1) }
const addBasicInfo = () => {
  if (basicInfoKey.value.trim()) {
    if (!formData.detail) formData.detail = {}
    if (!formData.detail.basicInfo) formData.detail.basicInfo = {}
    formData.detail.basicInfo[basicInfoKey.value.trim()] = basicInfoValue.value.trim()
    basicInfoKey.value = ''; basicInfoValue.value = ''
  }
}
const removeBasicInfo = (key: string) => {
  if (formData.detail?.basicInfo) {
    delete formData.detail.basicInfo[key]
  }
}

// 提交前把输入框中"待添加"的值自动落入 formData.detail，防止漏点"添加"导致数据静默丢失
const flushPendingDetailInputs = () => {
  addAward()
  addPurpose()
  addCriteria()
  addNotice()
  addRule()
  addGuide()
  addAwardDisp()
  addBasicInfo()
}

const resetFormData = () => {
  formData.compName = ''
  formData.compLevel = ''
  formData.registrationTime = ''
  formData.detail = {
    basicInfo: {},
    awards: [],
    background: '',
    purposes: [],
    competitionRules: [],
    scoringCriteria: [],
    notices: [],
    processGuide: [],
    awardsDisplay: [],
  }
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增竞赛'
    resetFormData()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改竞赛'
    formLoading.value = true
    try {
      const res = await getCompetitionDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.compName = d.compName
        formData.compLevel = d.compLevel || ''
        formData.registrationTime = d.registrationTime || ''
        formData.detail = {
          basicInfo: d.basicInfo || {},
          awards: d.awards || [],
          background: d.background || '',
          purposes: d.purposes || [],
          competitionRules: d.competitionRules || [],
          scoringCriteria: d.scoringCriteria || [],
          notices: d.notices || [],
          processGuide: d.processGuide || [],
          awardsDisplay: d.awardsDisplay || [],
        }
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '竞赛详情'
    formLoading.value = true
    try {
      const res = await getCompetitionDetail(id)
      if (res.data.code === 200) {
        detailData.value = res.data.data
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.compName) {
    ElMessage.warning('请填写竞赛名称')
    return
  }
  try {
    flushPendingDetailInputs()
    let res: any
    if (dialogMode.value === 'add') {
      const data: CompetitionAddDTO = { compName: formData.compName }
      if (formData.compLevel) data.compLevel = formData.compLevel
      if (formData.registrationTime) data.registrationTime = formData.registrationTime
      if (formData.detail && Object.keys(formData.detail).length > 0) {
        const detail: any = {}
        for (const key of Object.keys(formData.detail) as (keyof typeof formData.detail)[]) {
          const val = formData.detail[key]
          if (Array.isArray(val) && val.length > 0) detail[key] = val
          else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) detail[key] = val
          else if (typeof val === 'string' && val) detail[key] = val
        }
        if (Object.keys(detail).length > 0) data.detail = detail
      }
      res = await addCompetition(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: CompetitionUpdateDTO = { id: currentId.value, compName: formData.compName }
      if (formData.compLevel) data.compLevel = formData.compLevel
      if (formData.registrationTime) data.registrationTime = formData.registrationTime
      if (formData.detail && Object.keys(formData.detail).length > 0) {
        const detail: any = {}
        for (const key of Object.keys(formData.detail) as (keyof typeof formData.detail)[]) {
          const val = formData.detail[key]
          if (Array.isArray(val) && val.length > 0) detail[key] = val
          else if (typeof val === 'object' && val !== null && Object.keys(val).length > 0) detail[key] = val
          else if (typeof val === 'string' && val) detail[key] = val
        }
        if (Object.keys(detail).length > 0) data.detail = detail
      }
      res = await updateCompetition(data)
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
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

const handleToggleStatus = async (row: CompetitionListVO) => {
  const id = row.id
  const name = row.compName
  const isDisable = !row.isDeleted
  try {
    await ElMessageBox.confirm(
      isDisable
        ? `确定要禁用竞赛"${name}"吗？禁用后用户端不可见，可再次启用。`
        : `确定要启用竞赛"${name}"吗？`,
      '提示'
    )
  } catch {
    return
  }
  try {
    const res = isDisable ? await softDeleteCompetition(id) : await enableCompetition(id)
    if (res.data.code === 200) {
      ElMessage.success(isDisable ? '禁用成功' : '启用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

const handleHardDelete = async (id: string, name: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除竞赛"${name}"吗？关联数据将同步删除，不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    const res = await hardDeleteCompetition(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的竞赛')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的${selectedIds.value.length} 条竞赛记录吗？关联数据将同步删除，不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定批量删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    const res = await batchDeleteCompetition(selectedIds.value as unknown as number[])
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-wrap">
    <!-- 水印 -->
    <img src="@/assets/images/logo-main.png" class="watermark watermark-tr" />
    <img src="@/assets/images/logo-main.png" class="watermark watermark-bl" />

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">竞赛信息</h1>
      <p class="page-subtitle">管理竞赛信息，支持竞赛的新增、修改、查询和删除</p>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">
        <span class="label-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        筛选条件
      </div>
      <el-form :model="queryParams" inline class="search-form">
        <div class="filter-fields">
          <el-form-item label="竞赛名称">
            <el-input v-model="queryParams.compName" placeholder="竞赛名称模糊搜索" clearable style="width: 200px" @keyup.enter="handleSearch" />
          </el-form-item>
          <el-form-item label="竞赛级别">
            <el-select v-model="queryParams.compLevel" placeholder="全部级别" clearable style="width: 140px">
              <el-option label="国家级" value="国家级" />
              <el-option label="省级" value="省级" />
              <el-option label="校级" value="校级" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.isDeleted" placeholder="全部状态" clearable style="width: 130px">
              <el-option label="启用" :value="false" />
              <el-option label="禁用" :value="true" />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-actions">
          <button type="button" class="search-btn" @click.prevent="handleSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            查询
          </button>
          <button type="button" class="reset-btn" @click.prevent="handleReset">
            <span>重置</span>
          </button>
        </div>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button class="custom-btn add-btn" @click="openDialog('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>新增竞赛</span>
      </button>
      <button class="custom-btn danger-btn" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        <span>批量删除</span>
      </button>
      <button class="custom-btn outline-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.5 16.5A9 9 0 1 0 2 12"/><polyline points="23 4 23 10 17 10"/></svg>
        <span>刷新</span>
      </button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="compName" label="竞赛名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="compLevel" label="竞赛级别" min-width="140">
          <template #default="{ row }">
            <span v-if="row.compLevel" :class="['status-pill', row.compLevel === '国家级' ? 'status-national' : row.compLevel === '省级' ? 'status-provincial' : 'status-school']">{{ row.compLevel }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="registrationTime" label="报名时间" min-width="160" />
        <el-table-column label="状态" min-width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.isDeleted" class="status-pill status-disabled">禁用</span>
            <span v-else class="status-pill status-enabled">启用</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="320" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="openDialog('detail', row.id)">详情</button>
              <button type="button" class="action-btn action-edit" @click="openDialog('edit', row.id)">修改</button>
              <button v-if="!row.isDeleted" type="button" class="action-btn action-soft-delete" @click="handleToggleStatus(row)">禁用</button>
              <button v-else type="button" class="action-btn action-enable" @click="handleToggleStatus(row)">启用</button>
              <button type="button" class="action-btn action-hard-delete" @click="handleHardDelete(row.id, row.compName)">删除</button>
            </div>
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
          <el-descriptions :column="1" border class="mb-4">
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="竞赛名称">{{ detailData.compName }}</el-descriptions-item>
            <el-descriptions-item label="竞赛级别">{{ detailData.compLevel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名时间">{{ detailData.registrationTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>

          <el-collapse>
            <el-collapse-item title="基本信息" name="basicInfo">
              <div v-if="detailData.basicInfo && Object.keys(detailData.basicInfo).length > 0">
                <el-descriptions :column="2" border>
                  <el-descriptions-item v-for="(val, key) in detailData.basicInfo" :key="key" :label="key">
                    {{ val }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="奖项设置" name="awards">
              <div v-if="detailData.awards && detailData.awards.length > 0" class="flex flex-wrap gap-1">
                <el-tag v-for="(a, i) in detailData.awards" :key="i">{{ a }}</el-tag>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="竞赛背景与意义" name="background">
              <div v-if="detailData.background">{{ detailData.background }}</div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="竞赛目的" name="purposes">
              <div v-if="detailData.purposes && detailData.purposes.length > 0">
                <ul class="list-disc pl-5">
                  <li v-for="(p, i) in detailData.purposes" :key="i">{{ p }}</li>
                </ul>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="竞赛规则" name="rules">
              <div v-if="detailData.competitionRules && detailData.competitionRules.length > 0">
                <div v-for="(r, i) in detailData.competitionRules" :key="i" class="mb-2">
                  <strong>{{ r.title }}</strong>{{ r.content }}
                </div>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="评分标准" name="scoring">
              <div v-if="detailData.scoringCriteria && detailData.scoringCriteria.length > 0">
                <ul class="list-disc pl-5">
                  <li v-for="(s, i) in detailData.scoringCriteria" :key="i">{{ s }}</li>
                </ul>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="注意事项" name="notices">
              <div v-if="detailData.notices && detailData.notices.length > 0">
                <ul class="list-disc pl-5">
                  <li v-for="(n, i) in detailData.notices" :key="i">{{ n }}</li>
                </ul>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>

            <el-collapse-item title="参赛流程指南" name="processGuide">
              <div v-if="detailData.processGuide && detailData.processGuide.length > 0">
                <div v-for="(g, i) in detailData.processGuide" :key="i" class="mb-2">
                  <strong>{{ g.title }}</strong>{{ g.content }}
                </div>
              </div>
              <span v-else class="text-gray-400">暂无</span>
            </el-collapse-item>
          </el-collapse>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-form-item label="竞赛名称" required>
              <el-input v-model="formData.compName" placeholder="请输入竞赛名称" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="竞赛级别">
              <el-select v-model="formData.compLevel" placeholder="请选择级别" clearable style="width: 200px">
                <el-option label="国家级" value="国家级" />
                <el-option label="省级" value="省级" />
                <el-option label="校级" value="校级" />
              </el-select>
            </el-form-item>
            <el-form-item label="报名时间">
              <el-input v-model="formData.registrationTime" placeholder="如：每年6月9月" maxlength="100" />
            </el-form-item>

            <!-- 折叠detail 字段 -->
            <el-collapse class="mt-4">
              <el-collapse-item title="竞赛详情（选填）" name="detail">
                <!-- basicInfo -->
                <el-form-item label="基本信息">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="basicInfoKey" placeholder="字段" style="width: 150px" />
                    <el-input v-model="basicInfoValue" placeholder="字段" style="width: 200px" @keyup.enter="addBasicInfo" />
                    <el-button type="primary" @click="addBasicInfo">添加</el-button>
                  </div>
                  <div v-if="formData.detail?.basicInfo && Object.keys(formData.detail.basicInfo).length > 0" class="flex flex-wrap gap-1">
                    <el-tag v-for="(val, key) in formData.detail.basicInfo" :key="key" closable @close="removeBasicInfo(key)">
                      {{ key }}: {{ val }}
                    </el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="奖项设置">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newAward" placeholder="输入奖项名称" style="width: 300px" @keyup.enter="addAward" />
                    <el-button type="primary" @click="addAward">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(a, i) in formData.detail?.awards || []" :key="i" closable @close="removeAward(i)">{{ a }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="竞赛背景">
                  <el-input v-model="formData.detail!.background" type="textarea" :rows="3" placeholder="竞赛背景与意义" />
                </el-form-item>

                <el-form-item label="竞赛目的">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newPurpose" placeholder="输入竞赛目的" style="width: 300px" @keyup.enter="addPurpose" />
                    <el-button type="primary" @click="addPurpose">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(p, i) in formData.detail?.purposes || []" :key="i" closable @close="removePurpose(i)">{{ p }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="竞赛规则">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newRuleTitle" placeholder="标题" style="width: 150px" />
                    <el-input v-model="newRuleContent" placeholder="内容" style="width: 250px" @keyup.enter="addRule" />
                    <el-button type="primary" @click="addRule">添加</el-button>
                  </div>
                  <div v-for="(r, i) in formData.detail?.competitionRules || []" :key="i" class="mb-1">
                    <el-tag closable @close="removeRule(i)">
                      {{ r.title }}：{{ r.content }}
                    </el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="评分标准">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newCriteria" placeholder="输入评分标准" style="width: 300px" @keyup.enter="addCriteria" />
                    <el-button type="primary" @click="addCriteria">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(s, i) in formData.detail?.scoringCriteria || []" :key="i" closable @close="removeCriteria(i)">{{ s }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="注意事项">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newNotice" placeholder="输入注意事项" style="width: 300px" @keyup.enter="addNotice" />
                    <el-button type="primary" @click="addNotice">添加</el-button>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <el-tag v-for="(n, i) in formData.detail?.notices || []" :key="i" closable @close="removeNotice(i)">{{ n }}</el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="参赛流程">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newGuideTitle" placeholder="步骤标题" style="width: 150px" />
                    <el-input v-model="newGuideContent" placeholder="步骤内容" style="width: 250px" @keyup.enter="addGuide" />
                    <el-button type="primary" @click="addGuide">添加</el-button>
                  </div>
                  <div v-for="(g, i) in formData.detail?.processGuide || []" :key="i" class="mb-1">
                    <el-tag closable @close="removeGuide(i)">
                      {{ g.title }}：{{ g.content }}
                    </el-tag>
                  </div>
                </el-form-item>

                <el-form-item label="奖项展示">
                  <div class="flex gap-2 mb-2">
                    <el-input v-model="newAwardDispTitle" placeholder="奖项标题" style="width: 150px" />
                    <el-input v-model="newAwardDispContent" placeholder="奖项详情" style="width: 250px" @keyup.enter="addAwardDisp" />
                    <el-button type="primary" @click="addAwardDisp">添加</el-button>
                  </div>
                  <div v-for="(ad, i) in formData.detail?.awardsDisplay || []" :key="i" class="mb-1">
                    <el-tag closable @close="removeAwardDisp(i)">
                      {{ ad.title }}：{{ ad.content }}
                    </el-tag>
                  </div>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
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
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 水印 */
.watermark {
  position: absolute;
  width: 180px;
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
  z-index: 0;
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

/* 页面标题 */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
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

/* 搜索卡片 */
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}
.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}

.label-icon {
  display: flex;
  align-items: center;
}

/* 搜索表单 */
.search-form {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-fields {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.search-btn {
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
.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.search-btn:active {
  transform: translateY(0);
}

.reset-btn {
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
.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.reset-btn:active {
  background: #f3f4f6;
}

/* 自定义按钮 */
.custom-btn {
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 20px;
  border-radius: 20px;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.custom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.add-btn:active {
  transform: translateY(0);
}

.outline-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.outline-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.danger-btn {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.danger-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* 操作栏 */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}
.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

/* 表格 */
.table-card :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}

.table-card :deep(.el-table__header th .cell) {
  color: #1f2937;
}

.table-card :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.table-card :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

.table-card :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}

/* 状态标签 */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-national {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.status-provincial {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.status-school {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}
.status-enabled {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.status-disabled {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* 操作按钮组 */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.action-edit {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.action-soft-delete {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.action-soft-delete:hover {
  background: #fde68a;
}

.action-enable {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.action-enable:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.action-hard-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-hard-delete:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

/* 分页 */
.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.custom-pagination :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}

.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 8px;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}

/* Dialog */
:deep(.uni-dialog .el-dialog__header) {
  border-bottom: 2px solid #F97316;
  padding-bottom: 16px;
  margin-bottom: 0;
}

:deep(.uni-dialog .el-dialog__title) {
  color: #1f2937;
  font-weight: 600;
}

:deep(.uni-dialog .el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06) !important;
}

:deep(.uni-dialog .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}

:deep(.uni-dialog .el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}

/* Dialog 底部按钮 */
.dialog-cancel-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.25s ease;
}
.dialog-cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.dialog-confirm-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}
.dialog-confirm-btn:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
  transform: translateY(-1px);
}
.dialog-confirm-btn:active {
  transform: translateY(0);
}
</style>
