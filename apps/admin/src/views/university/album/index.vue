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
  universityId: 0,
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
    formData.universityId = 0
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
  <div>
    <!-- 搜索区 -->
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

    <!-- 操作区 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增图片</el-button>
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
                <div class="flex h-full items-center justify-center text-xs text-gray-400">加载失败</div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '展示' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="400" align="center" fixed="right">
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
          :page-sizes="[10, 20, 30, 50, 100]"
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
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="图片类型">{{ detailData.imageType }}</el-descriptions-item>
            <el-descriptions-item label="排序权重">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                {{ detailData.status === 1 ? '展示' : '下架' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
            <el-descriptions-item label="图片URL" :span="2">
              <div class="flex items-center gap-2">
                <el-image
                  :src="detailData.imageUrl"
                  style="width: 120px; height: 80px; cursor: pointer"
                  fit="cover"
                  :preview-src-list="[detailData.imageUrl]"
                  preview-teleported
                />
                <span class="text-xs text-gray-500 break-all">{{ detailData.imageUrl }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增模式 -->
        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="院校" required>
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
          <el-form :model="editFormData" label-width="100px">
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
