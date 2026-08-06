<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getUniversityPage,
  getUniversityDetail,
  addUniversity,
  updateUniversity,
  updateUniversityDetail,
  updateUniversityStatus,
  hardDeleteUniversity,
  batchHardDeleteUniversity,
  importUniversityMain,
  importUniversityDetail,
} from '@/api/university/info'
import type {
  UniversityListVO,
  UniversityDetailVO,
  UniversityQueryDTO,
  UniversityAddDTO,
  UniversityDetailUpdateDTO,
} from '@/types/university/info'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'
import UniversitySearch from './components/UniversitySearch.vue'
import UniversityTable from './components/UniversityTable.vue'
import UniversityDetailModal from './components/UniversityDetailModal.vue'
import UniversityFormModal from './components/UniversityFormModal.vue'
import type { UniversityFormData, UniversityDetailFormData } from './components/UniversityFormModal.vue'

const loading = ref(false)
const tableData = ref<UniversityListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<UniversityQueryDTO>({
  page: 1,
  size: 10,
  name: '',
  provinceName: '',
  category: '',
  status: undefined,
})

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<UniversityDetailVO | null>(null)

// 新增/修改弹窗
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const initialForm = ref<UniversityFormData | null>(null)
const initialDetail = ref<UniversityDetailFormData | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.provinceName) params.provinceName = queryParams.provinceName
    if (queryParams.category) params.category = queryParams.category
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getUniversityPage(params as UniversityQueryDTO)
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

const handleSearch = (params: Pick<UniversityQueryDTO, 'name' | 'provinceName' | 'category' | 'status'>) => {
  queryParams.name = params.name
  queryParams.provinceName = params.provinceName
  queryParams.category = params.category
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.provinceName = ''
  queryParams.category = ''
  queryParams.status = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }
const handleSelectionChange = (ids: string[]) => { selectedIds.value = ids }

// 详情
const handleDetail = async (id: string) => {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    const res = await getUniversityDetail(id)
    if (res.data.code === 200) detailData.value = res.data.data
    else ElMessage.error(res.data.msg || '获取详情失败')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleDetailClose = () => { detailData.value = null }

// 新增
const handleAdd = () => {
  formMode.value = 'add'
  currentId.value = null
  initialForm.value = { name: '', nameEn: '', provinceName: '', cityName: '', region: '华东', category: '' }
  initialDetail.value = null as unknown as UniversityDetailFormData
  formVisible.value = true
}

// 修改
const handleEdit = async (id: string) => {
  formMode.value = 'edit'
  currentId.value = id
  formLoading.value = true
  formVisible.value = true
  try {
    const res = await getUniversityDetail(id)
    if (res.data.code === 200) {
      const d = res.data.data
      initialForm.value = {
        name: d.name, nameEn: d.nameEn, provinceName: d.provinceName,
        cityName: d.cityName, region: d.region, category: d.category,
        majorCount: d.majorCount, educationLevel: d.educationLevel || '',
        nature: d.nature || '', recommendationRate: d.recommendationRate ?? undefined,
        recommendationYear: d.recommendationYear ?? undefined,
        hasDoctorate: d.hasDoctorate, hasMaster: d.hasMaster,
        department: d.department || '', tags: d.tags || [],
        famousUnion: d.famousUnion || '', imageUrl: d.imageUrl || '',
        introduction: d.introduction || '',
      }
      initialDetail.value = {
        address: d.address || '', admissionPhone: d.admissionPhone || '',
        website: d.website || '',
        historyGroupScore: d.historyGroupScore ?? undefined,
        scienceGroupScore: d.scienceGroupScore ?? undefined,
        carouselImages: d.carouselImages || [],
        detailIntroduction: d.detailIntroduction || '',
        rankings: {
          ruanke: d.rankings?.ruanke ?? undefined,
          xiaoyouhui: d.rankings?.xiaoyouhui ?? undefined,
          wushulian: d.rankings?.wushulian ?? undefined,
          qs: d.rankings?.qs ?? undefined,
          usnews: d.rankings?.usnews ?? undefined,
        },
        abroadRate: d.abroadRate || '', genderRatio: d.genderRatio || '',
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
const handleSubmit = async (form: UniversityFormData, detail: UniversityDetailFormData) => {
  if (!form.name || !form.nameEn || !form.provinceName || !form.cityName || !form.region || !form.category) {
    ElMessage.warning('请填写完整的基础信息（带*字段）')
    return
  }
  try {
    let res: any
    if (formMode.value === 'add') {
      res = await addUniversity({ ...form })
    } else if (formMode.value === 'edit' && currentId.value) {
      res = await updateUniversity(currentId.value, { ...form })
      const detailPayload: UniversityDetailUpdateDTO = {
        address: detail.address || undefined,
        admissionPhone: detail.admissionPhone || undefined,
        website: detail.website || undefined,
        historyGroupScore: detail.historyGroupScore ?? undefined,
        scienceGroupScore: detail.scienceGroupScore ?? undefined,
        carouselImages: detail.carouselImages?.length ? detail.carouselImages : undefined,
        introduction: detail.detailIntroduction || undefined,
        rankings: Object.values(detail.rankings).some(v => v !== undefined) ? detail.rankings as Record<string, number> : undefined,
        abroadRate: detail.abroadRate || undefined,
        genderRatio: detail.genderRatio || undefined,
      }
      await updateUniversityDetail(currentId.value, detailPayload)
    } else return

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

// 启用/禁用
const handleToggleStatus = async (row: UniversityListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该院校吗？`, '提示')
    const res = await updateUniversityStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else ElMessage.error(res.data.msg || '操作失败')
  } catch { /* cancel */ }
}

// 永久删除
const handleHardDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该院校吗？此操作不可恢复！', '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await hardDeleteUniversity(id)
    if (res.data.code === 200) {
      ElMessage.success('永久删除成功')
      fetchData()
    } else ElMessage.error(res.data.msg || '操作失败')
  } catch { /* cancel */ }
}

// 批量永久删除
const handleBatchHardDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要永久删除的院校')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 所院校吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await batchHardDeleteUniversity(selectedIds.value as unknown as number[])
    if (res.data.code === 200) {
      ElMessage.success('批量永久删除成功')
      fetchData()
    } else ElMessage.error(res.data.msg || '操作失败')
  } catch { /* cancel */ }
}

// 导��
const handleImport = async (importFn: (file: File) => Promise<AxiosResponse<R<void>>>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await importFn(file)
      if (res.data.code === 200) {
        ElMessage.success('导入成功')
        fetchData()
      } else ElMessage.error(res.data.msg || '导入失败')
    } catch { ElMessage.error('导入失败') }
  }
  input.click()
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="university-page">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>

    <div class="page-header">
      <div class="page-title">院校信息管理</div>
      <div class="page-subtitle">管理院校基础信息与详细信息，支持导入、批量操作</div>
    </div>

    <UniversitySearch @search="handleSearch" @reset="handleReset" />

    <UniversityTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @selection-change="handleSelectionChange"
      @detail="handleDetail"
      @edit="handleEdit"
      @toggle-status="handleToggleStatus"
      @hard-delete="handleHardDelete"
      @add="handleAdd"
      @batch-hard-delete="handleBatchHardDelete"
      @import-main="handleImport(importUniversityMain)"
      @import-detail="handleImport(importUniversityDetail)"
      @refresh="fetchData"
    />

    <UniversityDetailModal
      v-model:visible="detailVisible"
      :detail-data="detailData"
      :form-loading="detailLoading"
      @close="handleDetailClose"
    />

    <UniversityFormModal
      v-model:visible="formVisible"
      :mode="formMode"
      :form-loading="formLoading"
      :initial-form="initialForm"
      :initial-detail="initialDetail"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.university-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.watermark-left,
.watermark-right {
  position: absolute; opacity: 0.05; pointer-events: none; z-index: 0;
}
.watermark-left { top: -60px; right: 40px; transform: rotate(18deg); }
.watermark-right { bottom: -40px; left: 30px; transform: rotate(-12deg); }
.watermark-left img,
.watermark-right img { width: 180px; height: auto; }
.page-header { position: relative; z-index: 1; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: #9ca3af; }
</style>
