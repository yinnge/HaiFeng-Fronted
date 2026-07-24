<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getChannelUnivPage,
  getChannelUnivDetail,
  addChannelUniv,
  updateChannelUniv,
  toggleChannelUnivStatus,
  deleteChannelUniv,
  batchDeleteChannelUniv,
} from '@/api/special/channel-univ'
import type {
  ChannelUnivListVO,
  ChannelUnivDetailVO,
  ChannelUnivAddDTO,
  ChannelUnivUpdateDTO,
} from '@/types/special/channel-univ'

const loading = ref(false)
const allData = ref<ChannelUnivListVO[]>([])

const queryParams = reactive({
  page: 1,
  size: 10,
})

// 前端过滤条件
const filterChannelName = ref('')
const filterUniversityName = ref('')
const filterYear = ref<number | undefined>(undefined)

// 前端过滤后的数据
const filteredData = computed(() => {
  return allData.value.filter((item) => {
    if (filterChannelName.value && !item.channelName.includes(filterChannelName.value)) return false
    if (filterUniversityName.value && !item.universityName.includes(filterUniversityName.value)) return false
    if (filterYear.value !== undefined && filterYear.value !== null && item.year !== filterYear.value) return false
    return true
  })
})

const total = computed(() => filteredData.value.length)

// 分页数据
const tableData = computed(() => {
  const start = (queryParams.page - 1) * queryParams.size
  return filteredData.value.slice(start, start + queryParams.size)
})

const selectedIds = ref<string[]>([])

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<ChannelUnivDetailVO | null>(null)

const formData = reactive<ChannelUnivAddDTO>({
  channelCode: '',
  channelName: '',
  universityId: '',
  universityName: '',
  year: undefined,
  regionTag: '',
  signupStart: '',
  signupEnd: '',
  officialUrl: '',
  brochureTitle: '',
  brochureContent: '',
  sortOrder: 0,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getChannelUnivPage({ page: 1, size: 1000 })
    if (res.data.code === 200) {
      allData.value = res.data.data.records
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1 }

const handleReset = () => {
  filterChannelName.value = ''
  filterUniversityName.value = ''
  filterYear.value = undefined
  queryParams.page = 1
}

const handlePageChange = (page: number) => { queryParams.page = page }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
}

const handleSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map((r: any) => r.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增关联'
    formData.channelCode = ''
    formData.channelName = ''
    formData.universityId = ''
    formData.universityName = ''
    formData.year = undefined
    formData.regionTag = ''
    formData.signupStart = ''
    formData.signupEnd = ''
    formData.officialUrl = ''
    formData.brochureTitle = ''
    formData.brochureContent = ''
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改关联'
    formLoading.value = true
    try {
      const res = await getChannelUnivDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.channelCode = d.channelCode
        formData.channelName = d.channelName
        formData.universityId = d.universityId
        formData.universityName = d.universityName
        formData.year = d.year ?? undefined
        formData.regionTag = d.regionTag || ''
        formData.signupStart = d.signupStart || ''
        formData.signupEnd = d.signupEnd || ''
        formData.officialUrl = d.officialUrl || ''
        formData.brochureTitle = d.brochureTitle || ''
        formData.brochureContent = d.brochureContent || ''
        formData.sortOrder = d.sortOrder
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '关联详情'
    formLoading.value = true
    try {
      const res = await getChannelUnivDetail(id)
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
  if (!formData.channelCode || !formData.channelName || !formData.universityId || !formData.universityName) {
    ElMessage.warning('请填写通道代码、名称和大学信息')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addChannelUniv(formData as ChannelUnivAddDTO)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateChannelUniv(currentId.value, formData as ChannelUnivUpdateDTO)
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

const handleToggleStatus = async (row: ChannelUnivListVO) => {
  const actionText = row.isActive ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该关联吗？`, '提示')
    const res = await toggleChannelUnivStatus(row.id)
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
    await ElMessageBox.confirm('确定要删除该关联吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteChannelUniv(id)
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
    ElMessage.warning('请先选择要删除的关联')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 条关联吗？此操作不可恢复！`,
      '警告',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
    const res = await batchDeleteChannelUniv(selectedIds.value)
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
      <el-form inline>
        <el-form-item label="通道名称">
          <el-input
            v-model="filterChannelName"
            placeholder="输入通道名称"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="大学名称">
          <el-input
            v-model="filterUniversityName"
            placeholder="输入大学名称"
            clearable
            style="width: 160px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="年份">
          <el-input-number
            v-model="filterYear"
            :min="2000"
            :max="2099"
            controls-position="right"
            style="width: 130px"
            placeholder="年份"
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
      <el-button type="primary" @click="openDialog('add')">新增关联</el-button>
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
        <el-table-column prop="channelName" label="通道名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="universityName" label="大学名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="year" label="年份" width="100" align="center" />
        <el-table-column prop="regionTag" label="地区标签" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.regionTag" size="small">{{ row.regionTag }}</el-tag>
            <span v-else>-</span>
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
      width="750px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="通道代码">{{ detailData.channelCode }}</el-descriptions-item>
            <el-descriptions-item label="通道名称">{{ detailData.channelName }}</el-descriptions-item>
            <el-descriptions-item label="大学ID">{{ detailData.universityId }}</el-descriptions-item>
            <el-descriptions-item label="大学名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="年份">{{ detailData.year || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地区标签">{{ detailData.regionTag || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名开始">{{ detailData.signupStart || '-' }}</el-descriptions-item>
            <el-descriptions-item label="报名结束">{{ detailData.signupEnd || '-' }}</el-descriptions-item>
            <el-descriptions-item label="官网URL">{{ detailData.officialUrl || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简章标题">{{ detailData.brochureTitle || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简章正文">
              <div class="max-h-40 overflow-y-auto" v-html="detailData.brochureContent || '-'"></div>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.isActive ? 'success' : 'info'" size="small">
                {{ detailData.isActive ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="通道代码" required>
              <el-input v-model="formData.channelCode" placeholder="请输入通道代码" maxlength="30" show-word-limit />
            </el-form-item>
            <el-form-item label="通道名称" required>
              <el-input v-model="formData.channelName" placeholder="请输入通道名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="大学ID" required>
              <el-input-number v-model="formData.universityId" :min="1" style="width: 200px" />
            </el-form-item>
            <el-form-item label="大学名称" required>
              <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
            </el-form-item>
            <el-form-item label="招生年份">
              <el-input-number v-model="formData.year" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
            </el-form-item>
            <el-form-item label="地区标签">
              <el-select v-model="formData.regionTag" placeholder="请选择" clearable style="width: 200px">
                <el-option label="香港" value="香港" />
                <el-option label="澳门" value="澳门" />
              </el-select>
            </el-form-item>
            <el-form-item label="报名开始">
              <el-date-picker
                v-model="formData.signupStart"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="报名截止">
              <el-date-picker
                v-model="formData.signupEnd"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                style="width: 260px"
              />
            </el-form-item>
            <el-form-item label="官网URL">
              <el-input v-model="formData.officialUrl" placeholder="https://" maxlength="500" />
            </el-form-item>
            <el-form-item label="简章标题">
              <el-input v-model="formData.brochureTitle" placeholder="请输入招生简章标题" maxlength="200" show-word-limit />
            </el-form-item>
            <el-form-item label="简章正文">
              <el-input
                v-model="formData.brochureContent"
                type="textarea"
                :rows="4"
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
