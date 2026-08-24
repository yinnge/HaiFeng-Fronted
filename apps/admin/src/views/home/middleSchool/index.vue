<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  uploadFileLoad,
  getFileLoadPage,
  getFileLoadDetail,
  updateFileLoad,
  deleteFileLoad,
} from '@/api/home/fileload'
import type {
  FileLoadListVO,
  FileLoadDetailVO,
  FileLoadQueryDTO,
  FileLoadUploadDTO,
} from '@/types/home/fileload'
import MiddleSchoolSearch from './components/MiddleSchoolSearch.vue'
import MiddleSchoolTable from './components/MiddleSchoolTable.vue'
import MiddleSchoolFormModal from './components/MiddleSchoolFormModal.vue'
import MiddleSchoolDetailModal from './components/MiddleSchoolDetailModal.vue'

/** 初中资源：固定面向人群 */
const AUDIENCE = 'middle_school' as const

const loading = ref(false)
const tableData = ref<FileLoadListVO[]>([])
const total = ref(0)

const queryParams = reactive<FileLoadQueryDTO>({
  page: 1,
  size: 10,
  fileName: '',
  subject: '',
  applicableStage: '',
  tag: '',
})

// 详情弹窗
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<FileLoadDetailVO | null>(null)

// 上传/修改弹窗
const formVisible = ref(false)
const formMode = ref<'upload' | 'edit'>('upload')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const initialFormData = ref<FileLoadUploadDTO | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.fileName) params.fileName = queryParams.fileName
    if (queryParams.subject) params.subject = queryParams.subject
    if (queryParams.applicableStage) params.applicableStage = queryParams.applicableStage
    if (queryParams.tag) params.tag = queryParams.tag
    const res = await getFileLoadPage(AUDIENCE, params as FileLoadQueryDTO)
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

const handleSearch = (params: Pick<FileLoadQueryDTO, 'fileName' | 'subject' | 'applicableStage' | 'tag'>) => {
  queryParams.fileName = params.fileName
  queryParams.subject = params.subject
  queryParams.applicableStage = params.applicableStage
  queryParams.tag = params.tag
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.fileName = ''
  queryParams.subject = ''
  queryParams.applicableStage = ''
  queryParams.tag = ''
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

// 详情
const handleDetail = async (id: string) => {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    const res = await getFileLoadDetail(AUDIENCE, id)
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

// 下载（预签名 URL 动态生成，需先取详情）
const handleDownload = async (id: string) => {
  try {
    const res = await getFileLoadDetail(AUDIENCE, id)
    if (res.data.code === 200 && res.data.data.fileUrl) {
      window.open(res.data.data.fileUrl, '_blank')
    } else {
      ElMessage.error(res.data.msg || '获取下载地址失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取下载地址失败')
  }
}

// 上传
const handleUpload = () => {
  formMode.value = 'upload'
  currentId.value = null
  initialFormData.value = null
  formVisible.value = true
}

// 修改
const handleEdit = async (id: string) => {
  formMode.value = 'edit'
  currentId.value = id
  formLoading.value = true
  formVisible.value = true
  try {
    const res = await getFileLoadDetail(AUDIENCE, id)
    if (res.data.code === 200) {
      const d = res.data.data
      initialFormData.value = {
        targetAudience: d.targetAudience,
        subject: d.subject,
        applicableStage: d.applicableStage || '',
        version: d.version,
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

// 提交上传/修改
const handleSubmit = async (data: { file?: File; subject: string; applicableStage: string; description?: string; tag?: string }) => {
  if (!data.subject) {
    ElMessage.warning('请选择学科')
    return
  }

  try {
    let res: any
    if (formMode.value === 'upload') {
      if (!data.file) {
        ElMessage.warning('请选择要上传的文件')
        return
      }
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('targetAudience', AUDIENCE)
      formData.append('subject', data.subject)
      if (data.applicableStage) formData.append('applicableStage', data.applicableStage)
      if (data.description) formData.append('description', data.description)
      if (data.tag) formData.append('tag', data.tag)
      res = await uploadFileLoad(AUDIENCE, formData)
    } else if (formMode.value === 'edit' && currentId.value) {
      const payload: FileLoadUploadDTO = {
        targetAudience: AUDIENCE,
        subject: data.subject,
        applicableStage: data.applicableStage || undefined,
        description: data.description || undefined,
        tag: data.tag || undefined,
        version: initialFormData.value?.version,
      }
      res = await updateFileLoad(AUDIENCE, currentId.value, payload)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(formMode.value === 'upload' ? '上传成功' : '修改成功')
      formVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？删除后将无法恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteFileLoad(AUDIENCE, id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="middle-school-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">初中资源</div>
      <div class="page-subtitle">管理初中学习资料文件，支持上传、下载、修改与删除</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="primary-btn" @click="handleUpload">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        上传文件
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

    <MiddleSchoolSearch
      :audience="AUDIENCE"
      @search="handleSearch"
      @reset="handleReset"
    />

    <MiddleSchoolTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @edit="handleEdit"
      @download="handleDownload"
      @delete="handleDelete"
    />

    <MiddleSchoolDetailModal
      v-model:visible="detailVisible"
      :detail-data="detailData"
      :form-loading="detailLoading"
      @close="handleDetailClose"
    />

    <MiddleSchoolFormModal
      v-model:visible="formVisible"
      :mode="formMode"
      :form-loading="formLoading"
      :initial-data="initialFormData"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.middle-school-page {
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
