<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getChannelPage,
  getChannelDetail,
  addChannel,
  updateChannel,
  toggleChannelStatus,
  deleteChannel,
  batchDeleteChannel,
} from '@/api/special/channel'
import type {
  ChannelListVO,
  ChannelDetailVO,
  ChannelQueryDTO,
  ChannelAddDTO,
  ChannelUpdateDTO,
} from '@/types/special/channel'

const loading = ref(false)
const tableData = ref<ChannelListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<ChannelQueryDTO>({
  page: 1,
  size: 10,
  displayType: undefined,
  channelName: '',
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ChannelDetailVO | null>(null)

const formData = reactive<ChannelAddDTO>({
  channelCode: '',
  channelName: '',
  subtitle: '',
  parentCode: '',
  filterLabel: '',
  displayType: 'UNIVERSITY_LIST',
  content: '',
  sortOrder: 0,
})

const displayTypeOptions = [
  { label: '院校列表', value: 'UNIVERSITY_LIST' },
  { label: '仅文章', value: 'ARTICLE_ONLY' },
  { label: '专业数据', value: 'MAJOR_DATA' },
  { label: '分组节点', value: 'GROUP' },
]

const displayTypeLabel = (type: string) => {
  const opt = displayTypeOptions.find((o) => o.value === type)
  return opt ? opt.label : type
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.displayType) params.displayType = queryParams.displayType
    if (queryParams.channelName) params.channelName = queryParams.channelName
    const res = await getChannelPage(params as ChannelQueryDTO)
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

const handleSearch = () => { queryParams.page = 1; fetchData() }

const handleReset = () => {
  queryParams.displayType = undefined
  queryParams.channelName = ''
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: ChannelListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增通道'
    formData.channelCode = ''
    formData.channelName = ''
    formData.subtitle = ''
    formData.parentCode = ''
    formData.filterLabel = ''
    formData.displayType = 'UNIVERSITY_LIST'
    formData.content = ''
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改通道'
    formLoading.value = true
    try {
      const res = await getChannelDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.channelCode = d.channelCode
        formData.channelName = d.channelName
        formData.subtitle = d.subtitle || ''
        formData.parentCode = d.parentCode || ''
        formData.filterLabel = d.filterLabel || ''
        formData.displayType = d.displayType
        formData.content = d.content || ''
        formData.sortOrder = d.sortOrder
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '通道详情'
    formLoading.value = true
    try {
      const res = await getChannelDetail(id)
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
  if (!formData.channelCode || !formData.channelName) {
    ElMessage.warning('请填写通道代码和名称')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addChannel({
        ...formData,
        channelCode: formData.channelCode,
        channelName: formData.channelName,
      })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateChannel(currentId.value, {
        ...formData,
        channelCode: formData.channelCode,
        channelName: formData.channelName,
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

const handleToggleStatus = async (row: ChannelListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该通道吗？`, '提示')
    const res = await toggleChannelStatus(row.id)
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
    await ElMessageBox.confirm('确定要删除该通道吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteChannel(id)
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

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的通道')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条通道吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteChannel(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch {
    // 取消
  }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="展示类型">
          <el-select
            v-model="queryParams.displayType"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in displayTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="通道名称">
          <el-input
            v-model="queryParams.channelName"
            placeholder="通道名称模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增通道</el-button>
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除
      </el-button>
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
        <el-table-column prop="channelCode" label="通道代码" width="160" />
        <el-table-column prop="channelName" label="通道名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="displayType" label="展示类型" width="120">
          <template #default="{ row }">
            {{ displayTypeLabel(row.displayType) }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'" size="small">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button
              :type="row.isActive ? 'info' : 'success'"
              link
              @click="handleToggleStatus(row)"
            >
              {{ row.isActive ? '禁用' : '启用' }}
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
            <el-descriptions-item label="通道代码">{{ detailData.channelCode }}</el-descriptions-item>
            <el-descriptions-item label="通道名称">{{ detailData.channelName }}</el-descriptions-item>
            <el-descriptions-item label="副标题">{{ detailData.subtitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="父级通道">{{ detailData.parentCode || '-' }}</el-descriptions-item>
            <el-descriptions-item label="筛选标签">{{ detailData.filterLabel || '-' }}</el-descriptions-item>
            <el-descriptions-item label="展示类型">{{ displayTypeLabel(detailData.displayType) }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.isActive ? 'success' : 'info'" size="small">
                {{ detailData.isActive ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="内容">
              <div class="max-h-60 overflow-y-auto" v-html="detailData.content || '-'"></div>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="100px">
            <el-form-item label="通道代码" required>
              <el-input v-model="formData.channelCode" placeholder="请输入通道代码" maxlength="30" show-word-limit />
            </el-form-item>
            <el-form-item label="通道名称" required>
              <el-input v-model="formData.channelName" placeholder="请输入通道名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="副标题">
              <el-input v-model="formData.subtitle" placeholder="请输入副标题" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="父级通道">
              <el-input v-model="formData.parentCode" placeholder="父级通道代码" maxlength="30" />
            </el-form-item>
            <el-form-item label="筛选标签">
              <el-input v-model="formData.filterLabel" placeholder="筛选按钮文字" maxlength="30" />
            </el-form-item>
            <el-form-item label="展示类型" required>
              <el-select v-model="formData.displayType" placeholder="请选择" style="width: 200px">
                <el-option
                  v-for="opt in displayTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="富文本内容">
              <el-input
                v-model="formData.content"
                type="textarea"
                :rows="6"
                placeholder="支持 HTML"
              />
            </el-form-item>
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 120px" />
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
