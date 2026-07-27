<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getGalleryPage,
  getGalleryDetail,
  addGallery,
  updateGallery,
  updateGalleryStatus,
  deleteGallery,
  hardDeleteGallery,
  batchDeleteGallery,
  batchHardDeleteGallery,
  importGallery,
} from '@/api/university/gallery'
import { getUniversityPage } from '@/api/university/info'
import type {
  CampusGalleryListVO,
  CampusGalleryDetailVO,
  CampusGalleryQueryDTO,
  CampusGalleryAddDTO,
  CampusGalleryUpdateDTO,
} from '@/types/university/gallery'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<CampusGalleryListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const universityOptions = ref<{ label: string; value: number }[]>([])

const queryParams = reactive<CampusGalleryQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  imageType: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<CampusGalleryDetailVO | null>(null)

const formData = reactive<CampusGalleryAddDTO>({
  universityId: '',
  imageType: '',
  imageUrl: '',
  sortOrder: undefined,
})

const editFormData = reactive<CampusGalleryUpdateDTO>({
  imageType: '',
  imageUrl: '',
  sortOrder: undefined,
  status: 1,
})

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
    if (queryParams.imageType) params.imageType = queryParams.imageType
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getGalleryPage(params as CampusGalleryQueryDTO)
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
  queryParams.imageType = ''
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

const handleSelectionChange = (selection: CampusGalleryListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增校园图片'
    formData.universityId = ''
    formData.imageType = ''
    formData.imageUrl = ''
    formData.sortOrder = undefined
    detailData.value = null
    await fetchUniversityOptions()
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改校园图片'
    formLoading.value = true
    try {
      const res = await getGalleryDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        editFormData.imageType = d.imageType
        editFormData.imageUrl = d.imageUrl
        editFormData.sortOrder = d.sortOrder
        editFormData.status = d.status
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '校园图片详情'
    formLoading.value = true
    try {
      const res = await getGalleryDetail(id)
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
  if (dialogMode.value === 'add') {
    if (!formData.universityId || !formData.imageType || !formData.imageUrl) {
      ElMessage.warning('请填写完整信息')
      return
    }
    try {
      const res = await addGallery({
        universityId: formData.universityId,
        imageType: formData.imageType,
        imageUrl: formData.imageUrl,
        sortOrder: formData.sortOrder,
      })
      if (res.data.code === 200) {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    } catch {
      ElMessage.error('操作失败')
    }
  } else if (dialogMode.value === 'edit' && currentId.value) {
    if (!editFormData.imageType || !editFormData.imageUrl) {
      ElMessage.warning('请填写完整信息')
      return
    }
    try {
      const res = await updateGallery(currentId.value, {
        imageType: editFormData.imageType,
        imageUrl: editFormData.imageUrl,
        sortOrder: editFormData.sortOrder,
        status: editFormData.status,
      })
      if (res.data.code === 200) {
        ElMessage.success('修改成功')
        dialogVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    } catch {
      ElMessage.error('操作失败')
    }
  }
}

const handleToggleStatus = async (row: CampusGalleryListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该图片吗？`, '提示')
    const res = await updateGalleryStatus(row.id, { status: newStatus })
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
    await ElMessageBox.confirm('确定要永久删除该图片吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteGallery(id)
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
    ElMessage.warning('请先选择要永久删除的图片')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 张图片吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteGallery(selectedIds.value)
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
      const res = await importGallery(file)
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
  <div class="album-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">校园图片管理</div>
      <div class="page-subtitle">维护院校校园图片及展示状态</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="primary-btn" @click="openDialog('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        新增图片
      </button>
      <button type="button" class="outline-btn" @click="handleImport">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        导入Excel
      </button>
      <button type="button" class="danger-btn" :disabled="selectedIds.length === 0" @click="handleBatchHardDelete">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        批量永久删除
      </button>
      <button type="button" class="outline-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        刷新
      </button>
    </div>

    <!-- 搜索区 -->
    <div class="search-card">
      <div class="section-label">
        <span class="label-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        筛选条件
      </div>
      <el-form :model="queryParams" inline class="search-form">
        <div class="filter-fields">
          <el-form-item label="院校名称">
            <el-input
              v-model="queryParams.universityName"
              placeholder="模糊搜索"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="图片类型">
            <el-input
              v-model="queryParams.imageType"
              placeholder="精准匹配"
              clearable
              style="width: 140px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
              <el-option label="展示" :value="1" />
              <el-option label="下架" :value="0" />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-actions">
          <button type="button" class="search-btn" @click="handleSearch">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            查询
          </button>
          <button type="button" class="reset-btn" @click="handleReset">重置</button>
        </div>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="custom-table" v-loading="loading">
        <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="id" label="ID" width="140" />
          <el-table-column prop="universityName" label="院校名称" min-width="160" show-overflow-tooltip />
          <el-table-column prop="imageType" label="图片类型" width="120" />
          <el-table-column label="图片" width="120" align="center">
            <template #default="{ row }">
              <el-image
                :src="row.imageUrl"
                style="width: 80px; height: 60px; cursor: pointer"
                fit="cover"
                :preview-src-list="[row.imageUrl]"
                preview-teleported
              >
                <template #error>
                  <div class="img-error">加载失败</div>
                </template>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <span class="status-tag" :class="row.status === 1 ? 'status-on' : 'status-off'">{{ row.status === 1 ? '展示' : '禁用' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="400" align="center" fixed="right">
            <template #default="{ row }">
              <div class="action-group">
                <button type="button" class="action-btn action-detail" @click="openDialog('detail', row.id)">详情</button>
                <button type="button" class="action-btn action-edit" @click="openDialog('edit', row.id)">修改</button>
                <button
                  type="button"
                  class="action-btn"
                  :class="row.status === 1 ? 'action-disable' : 'action-enable'"
                  @click="handleToggleStatus(row)"
                >
                  {{ row.status === 1 ? '禁用' : '启用' }}
                </button>
                <button type="button" class="action-btn action-delete" @click="handleHardDelete(row.id)">永久删除</button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" class="detail-dialog" :close-on-click-modal="false">
      <div v-loading="formLoading" class="detail-content">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="图片类型">
              <span class="type-tag">{{ detailData.imageType }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="排序权重">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <span class="status-tag" :class="detailData.status === 1 ? 'status-on' : 'status-off'">{{ detailData.status === 1 ? '展示' : '下架' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="图片URL" :span="2">
              <div class="detail-image-wrap">
                <el-image
                  :src="detailData.imageUrl"
                  style="width: 120px; height: 80px; cursor: pointer"
                  fit="cover"
                  :preview-src-list="[detailData.imageUrl]"
                  preview-teleported
                />
                <span class="image-url-text">{{ detailData.imageUrl }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增模式 -->
        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px" class="form-content">
            <el-form-item label="院校" required>
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
            <el-form-item label="图片类型" required>
              <el-input v-model="formData.imageType" placeholder="如：教学楼、宿舍、食堂" maxlength="30" />
            </el-form-item>
            <el-form-item label="图片URL" required>
              <el-input v-model="formData.imageUrl" placeholder="请输入图片地址" maxlength="500" />
            </el-form-item>
            <el-form-item label="排序权重">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 200px" />
            </el-form-item>
          </el-form>
        </template>

        <!-- 修改模式 -->
        <template v-if="dialogMode === 'edit'">
          <el-form :model="editFormData" label-width="100px" class="form-content">
            <el-form-item label="图片类型" required>
              <el-input v-model="editFormData.imageType" placeholder="如：教学楼、宿舍、食堂" maxlength="30" />
            </el-form-item>
            <el-form-item label="图片URL" required>
              <el-input v-model="editFormData.imageUrl" placeholder="请输入图片地址" maxlength="500" />
            </el-form-item>
            <el-form-item label="排序权重">
              <el-input-number v-model="editFormData.sortOrder" :min="0" style="width: 200px" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="editFormData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-form>
        </template>
      </div>
      <template #footer>
        <button v-if="dialogMode === 'detail'" type="button" class="submit-btn" @click="dialogVisible = false">关闭</button>
        <template v-else>
          <button type="button" class="cancel-btn" @click="dialogVisible = false">取消</button>
          <button type="button" class="submit-btn" @click="handleSubmit">确定</button>
        </template>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.album-page {
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

.primary-btn,
.outline-btn,
.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border-radius: 20px;
}

.primary-btn {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.primary-btn:active {
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
.outline-btn:active {
  background: #f3f4f6;
}

.danger-btn {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.danger-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.danger-btn:active {
  transform: translateY(0);
}
.danger-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
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

/* 表格卡片 */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  border-bottom: none;
  padding: 14px 0;
}
.custom-table :deep(.el-table__header th .cell) {
  color: #fff;
}
.custom-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}
.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}
.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
}

/* 复选框品牌色 */
.custom-table :deep(.el-checkbox__input.is-checked .el-checkbox__inner),
.custom-table :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #F97316;
  border-color: #F97316;
}
.custom-table :deep(.el-checkbox__input.is-checked .el-checkbox__inner:hover) {
  border-color: #F97316;
}
.custom-table :deep(.el-checkbox__inner:hover) {
  border-color: #F97316;
}

/* 图片加载失败 */
.img-error {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #9ca3af;
}

/* 状态标签 */
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}
.status-off {
  background: linear-gradient(135deg, rgba(156, 163, 175, 0.1), rgba(209, 213, 219, 0.15));
  color: #6b7280;
  border-color: rgba(156, 163, 175, 0.25);
}

/* 类型标签 */
.type-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 操作按钮组 */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
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
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}
.action-enable {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.action-enable:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}
.action-disable {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-disable:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}
.action-delete {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(185, 28, 28, 0.3);
  transform: translateY(-1px);
}

/* 自定义分页 */
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

/* 弹窗 */
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
}
.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.detail-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}
.detail-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}
.detail-content :deep(.el-descriptions__content) {
  color: #1f2937;
}
.detail-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}
.detail-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

/* 详情图片 */
.detail-image-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.image-url-text {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}

/* 表单 */
.form-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.form-content :deep(.el-input__wrapper),
.form-content :deep(.el-select__wrapper),
.form-content :deep(.el-input-number) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.form-content :deep(.el-input__wrapper:hover),
.form-content :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.form-content :deep(.el-input__wrapper.is-focus),
.form-content :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.form-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}
.form-content :deep(.el-textarea__inner:hover) {
  border-color: rgba(249, 115, 22, 0.3);
}
.form-content :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
  border-color: #F97316;
}
.form-content :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #F97316;
  border-color: #F97316;
}

/* 弹窗底部按钮 */
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
  margin-left: 12px;
}
.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.submit-btn:active {
  transform: translateY(0);
}
</style>
