<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getGuidePage,
  getGuideDetail,
  addGuide,
  updateGuide,
  updateGuideStatus,
  deleteGuide,
  hardDeleteGuide,
  batchDeleteGuide,
  batchHardDeleteGuide,
  importGuide,
} from '@/api/university/guide'
import { getUniversityPage } from '@/api/university/info'
import type {
  UniversityGuideListVO,
  UniversityGuideDetailVO,
  UniversityGuideQueryDTO,
  UniversityGuideAddDTO,
  UniversityGuideUpdateDTO,
} from '@/types/university/guide'

const loading = ref(false)
const tableData = ref<UniversityGuideListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const universityOptions = ref<{ label: string; value: number }[]>([])

const queryParams = reactive<UniversityGuideQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<UniversityGuideDetailVO | null>(null)

const formData = reactive<UniversityGuideAddDTO>({
  universityId: '',
  customTags: [],
  remark: '',
})

const editFormData = reactive<UniversityGuideUpdateDTO>({
  customTags: [],
  remark: '',
  status: 1,
})

const JSONB_FIELDS: { key: string; label: string }[] = [
  { key: 'campusFacilities', label: '校园设施' },
  { key: 'dormitoryServices', label: '水电网与宿舍管理' },
  { key: 'campusTransportation', label: '校园通勤与校外交通' },
  { key: 'academicGuidance', label: '专业与课程核心信息' },
  { key: 'majorTransferGuidelines', label: '转专业原则' },
  { key: 'majorTransferConstriction', label: '转专业限制' },
  { key: 'academicSupportResources', label: '学习支持资源' },
  { key: 'studentOrganizations', label: '学生组织与社团' },
  { key: 'campusEvents', label: '校园活动与竞赛' },
  { key: 'classDormSocial', label: '班级与宿舍社交' },
  { key: 'financialAid', label: '奖助勤贷与权益保障' },
  { key: 'campusSecurity', label: '校园安全与应急处理' },
  { key: 'healthServices', label: '医保与心理健康' },
  { key: 'lifeServices', label: '生活服务' },
]

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
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getGuidePage(params as UniversityGuideQueryDTO)
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

const handleSelectionChange = (selection: UniversityGuideListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增院校适应指南'
    formData.universityId = ''
    formData.customTags = []
    formData.remark = ''
    detailData.value = null
    await fetchUniversityOptions()
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改院校适应指南'
    formLoading.value = true
    try {
      const res = await getGuideDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        editFormData.customTags = d.customTags || []
        editFormData.remark = d.remark || ''
        editFormData.status = d.status
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '院校适应指南详情'
    formLoading.value = true
    try {
      const res = await getGuideDetail(id)
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
    if (!formData.universityId) {
      ElMessage.warning('请选择院校')
      return
    }
    try {
      const res = await addGuide({
        universityId: formData.universityId,
        customTags: formData.customTags?.length ? formData.customTags : undefined,
        remark: formData.remark || undefined,
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
    try {
      const data: UniversityGuideUpdateDTO = {}
      if (editFormData.customTags?.length) data.customTags = editFormData.customTags
      if (editFormData.remark) data.remark = editFormData.remark
      data.status = editFormData.status
      const res = await updateGuide(currentId.value, data)
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

const handleToggleStatus = async (row: UniversityGuideListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该指南吗？`, '提示')
    const res = await updateGuideStatus(row.id, { status: newStatus })
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
    await ElMessageBox.confirm('确定要永久删除该指南吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteGuide(id)
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
    ElMessage.warning('请先选择要永久删除的指南')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 条指南吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteGuide(selectedIds.value)
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
      const res = await importGuide(file)
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

const formatJsonbValue = (value: any): string => {
  if (!value) return '-'
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join('、')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
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
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增指南</el-button>
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
        <el-table-column label="自定义标签" min-width="200">
          <template #default="{ row }">
            <template v-if="row.customTags && row.customTags.length > 0">
              <el-tag
                v-for="tag in row.customTags"
                :key="tag"
                size="small"
                style="margin-right: 4px; margin-bottom: 2px"
              >
                {{ tag }}
              </el-tag>
            </template>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
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
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border style="margin-bottom: 16px">
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="自定义标签" :span="2">
              <template v-if="detailData.customTags && detailData.customTags.length > 0">
                <el-tag v-for="tag in detailData.customTags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>
              </template>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                {{ detailData.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>

          <!-- JSONB 折叠面板 -->
          <el-collapse>
            <el-collapse-item
              v-for="field in JSONB_FIELDS"
              :key="field.key"
              :title="field.label"
              :name="field.key"
            >
              <template v-if="detailData[field.key as keyof UniversityGuideDetailVO]">
                <el-descriptions :column="1" border size="small">
                  <el-descriptions-item
                    v-for="(value, key) in detailData[field.key as keyof UniversityGuideDetailVO] as Record<string, any>"
                    :key="key"
                    :label="key"
                  >
                    {{ formatJsonbValue(value) }}
                  </el-descriptions-item>
                </el-descriptions>
              </template>
              <span v-else class="text-gray-400">暂无数据</span>
            </el-collapse-item>
          </el-collapse>
        </template>

        <!-- 新增模式 -->
        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="100px">
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
            <el-form-item label="自定义标签">
              <el-select
                v-model="formData.customTags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入标签后回车"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="备注信息" />
            </el-form-item>
          </el-form>
        </template>

        <!-- 修改模式 -->
        <template v-if="dialogMode === 'edit'">
          <el-form :model="editFormData" label-width="100px">
            <el-form-item label="自定义标签">
              <el-select
                v-model="editFormData.customTags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="输入标签后回车"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="editFormData.remark" type="textarea" :rows="3" placeholder="备注信息" />
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
