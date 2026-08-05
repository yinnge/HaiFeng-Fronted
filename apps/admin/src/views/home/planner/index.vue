<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getPlannerPage,
  getPlannerDetail,
  addPlanner,
  updatePlanner,
  updatePlannerStatus,
  deletePlanner,
} from '@/api/home/planner'
import type {
  PlannerListVO,
  PlannerDetailVO,
  PlannerQueryDTO,
  PlannerAddDTO,
} from '@/types/home/planner'
import PlannerSearch from './components/PlannerSearch.vue'
import PlannerTable from './components/PlannerTable.vue'
import PlannerDetailModal from './components/PlannerDetailModal.vue'
import PlannerFormModal from './components/PlannerFormModal.vue'

const loading = ref(false)
const tableData = ref<PlannerListVO[]>([])
const total = ref(0)

const queryParams = reactive<PlannerQueryDTO>({
  page: 1,
  size: 10,
  name: '',
  status: undefined,
})

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<PlannerDetailVO | null>(null)

// 新增/修改弹窗
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const initialFormData = ref<PlannerAddDTO | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getPlannerPage(params as PlannerQueryDTO)
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

const handleSearch = (params: Pick<PlannerQueryDTO, 'name' | 'status'>) => {
  queryParams.name = params.name
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

// 详情
const handleDetail = async (id: string) => {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    const res = await getPlannerDetail(id)
    if (res.data.code === 200) {
      detailData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleDetailClose = () => {
  detailData.value = null
}

// 新增
const handleAdd = () => {
  formMode.value = 'add'
  currentId.value = null
  initialFormData.value = { name: '' }
  formVisible.value = true
}

// 修改
const handleEdit = async (id: string) => {
  formMode.value = 'edit'
  currentId.value = id
  formLoading.value = true
  formVisible.value = true
  try {
    const res = await getPlannerDetail(id)
    if (res.data.code === 200) {
      const d = res.data.data
      initialFormData.value = {
        name: d.name,
        position: d.position || '',
        region: d.region || '',
        avatar: d.avatar || '',
        specialty: d.specialty || '',
        douyinName: d.douyinName || '',
        douyinUrl: d.douyinUrl || '',
        personalDescription: d.personalDescription || '',
        experienceJob: d.experienceJob || '',
        achievements: d.achievements || [],
        expertiseAreas: d.expertiseAreas || [],
        sortOrder: d.sortOrder || 0,
      }
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
  } finally {
    formLoading.value = false
  }
}

// 提交新增/修改
const handleSubmit = async (data: PlannerAddDTO) => {
  if (!data.name) {
    ElMessage.warning('请填写姓名')
    return
  }

  try {
    let res: any
    if (formMode.value === 'add') {
      const payload: PlannerAddDTO = { name: data.name }
      if (data.position) payload.position = data.position
      if (data.region) payload.region = data.region
      if (data.avatar) payload.avatar = data.avatar
      if (data.specialty) payload.specialty = data.specialty
      if (data.douyinName) payload.douyinName = data.douyinName
      if (data.douyinUrl) payload.douyinUrl = data.douyinUrl
      if (data.personalDescription) payload.personalDescription = data.personalDescription
      if (data.experienceJob) payload.experienceJob = data.experienceJob
      if (data.achievements && data.achievements.length > 0) payload.achievements = data.achievements
      if (data.expertiseAreas && data.expertiseAreas.length > 0) payload.expertiseAreas = data.expertiseAreas
      payload.sortOrder = data.sortOrder ?? 0
      res = await addPlanner(payload)
    } else if (formMode.value === 'edit' && currentId.value) {
      const payload: any = { name: data.name }
      if (data.position) payload.position = data.position
      if (data.region) payload.region = data.region
      if (data.avatar) payload.avatar = data.avatar
      if (data.specialty) payload.specialty = data.specialty
      if (data.douyinName) payload.douyinName = data.douyinName
      if (data.douyinUrl) payload.douyinUrl = data.douyinUrl
      if (data.personalDescription) payload.personalDescription = data.personalDescription
      if (data.experienceJob) payload.experienceJob = data.experienceJob
      if (data.achievements && data.achievements.length > 0) payload.achievements = data.achievements
      if (data.expertiseAreas && data.expertiseAreas.length > 0) payload.expertiseAreas = data.expertiseAreas
      payload.sortOrder = data.sortOrder ?? 0
      res = await updatePlanner(currentId.value, payload)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(formMode.value === 'add' ? '新增成功' : '修改成功')
      formVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

// 启用/禁用切换
const handleToggleStatus = async (row: PlannerListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该规划师吗？`, '提示')
    const res = await updatePlannerStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* 取消 */ }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该规划师吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deletePlanner(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="planner-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">规划师管理</div>
      <div class="page-subtitle">管理首页规划师展示，支持新增、修改、上下架与删除</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="primary-btn" @click="handleAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增规划师
      </button>
      <button type="button" class="refresh-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <PlannerSearch @search="handleSearch" @reset="handleReset" />

    <PlannerTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @edit="handleEdit"
      @toggle-status="handleToggleStatus"
      @delete="handleDelete"
    />

    <PlannerDetailModal
      v-model:visible="detailVisible"
      :detail-data="detailData"
      :form-loading="detailLoading"
      @close="handleDetailClose"
    />

    <PlannerFormModal
      v-model:visible="formVisible"
      :mode="formMode"
      :form-loading="formLoading"
      :initial-data="initialFormData"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.planner-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 枫叶水印 */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-right {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
  height: auto;
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
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* 操作栏 */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
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
.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.primary-btn:active {
  transform: translateY(0);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
.refresh-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
.refresh-btn:active {
  background: #f3f4f6;
}
</style>
