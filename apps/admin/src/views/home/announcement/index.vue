<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getAnnouncementPage,
  getAnnouncementDetail,
  addAnnouncement,
  updateAnnouncement,
  updateAnnouncementStatus,
  deleteAnnouncement,
} from '@/api/home/announcement'
import type {
  AnnouncementListVO,
  AnnouncementDetailVO,
  AnnouncementQueryDTO,
  AnnouncementAddDTO,
  AnnouncementUpdateDTO,
} from '@/types/home/announcement'

const loading = ref(false)
const tableData = ref<AnnouncementListVO[]>([])
const total = ref(0)

const queryParams = reactive<AnnouncementQueryDTO>({
  page: 1,
  size: 10,
  title: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<AnnouncementDetailVO | null>(null)

const formData = reactive<AnnouncementAddDTO>({
  title: '',
  content: '',
  tag: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.title) params.title = queryParams.title
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getAnnouncementPage(params as AnnouncementQueryDTO)
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
  queryParams.title = ''
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

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增公告'
    formData.title = ''
    formData.content = ''
    formData.tag = ''
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改公告'
    formLoading.value = true
    try {
      const res = await getAnnouncementDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.title = d.title
        formData.content = d.content
        formData.tag = d.tag || ''
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '公告详情'
    formLoading.value = true
    try {
      const res = await getAnnouncementDetail(id)
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
  if (!formData.title || !formData.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: AnnouncementAddDTO = {
        title: formData.title,
        content: formData.content,
      }
      if (formData.tag) data.tag = formData.tag
      res = await addAnnouncement(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: AnnouncementUpdateDTO = {
        title: formData.title,
        content: formData.content,
      }
      if (formData.tag) data.tag = formData.tag
      res = await updateAnnouncement(currentId.value, data)
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

const handleToggleStatus = async (row: AnnouncementListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该公告吗？`, '提示')
    const res = await updateAnnouncementStatus(row.id, { status: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    // 取消
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该公告吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteAnnouncement(id)
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

const statusTag = (status: number) => (status === 1 ? 'success' : 'info')
const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- 搜索区 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="标题">
          <el-input
            v-model="queryParams.title"
            placeholder="标题模糊搜索"
            clearable
            style="width: 180px"
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
      <el-button type="primary" @click="openDialog('add')">新增公告</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="tag" label="标签" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.tag" size="small">{{ row.tag }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
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
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
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
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
            <el-descriptions-item label="标签">{{ detailData.tag || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">
                {{ statusLabel(detailData.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="内容">
              <div class="max-h-60 overflow-y-auto" v-html="detailData.content"></div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="80px">
            <el-form-item label="标题" required>
              <el-input v-model="formData.title" placeholder="请输入标题" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="标签">
              <el-input v-model="formData.tag" placeholder="请输入标签" maxlength="20" style="width: 200px" />
            </el-form-item>
            <el-form-item label="内容" required>
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="8"
                placeholder="请输入公告内容（支持 HTML）"
              />
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
