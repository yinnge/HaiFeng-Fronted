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
  PlannerUpdateDTO,
} from '@/types/home/planner'

const loading = ref(false)
const tableData = ref<PlannerListVO[]>([])
const total = ref(0)

const queryParams = reactive<PlannerQueryDTO>({
  page: 1,
  size: 10,
  name: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<PlannerDetailVO | null>(null)

const formData = reactive<PlannerAddDTO>({
  name: '',
  position: '',
  region: '',
  avatar: '',
  specialty: '',
  douyinName: '',
  douyinUrl: '',
  personalDescription: '',
  experienceJob: '',
  achievements: [],
  expertiseAreas: [],
  sortOrder: 0,
})

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
  } catch {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { queryParams.page = 1; fetchData() }
const handleReset = () => { queryParams.name = ''; queryParams.status = undefined; queryParams.page = 1; fetchData() }
const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增规划师'
    formData.name = ''
    formData.position = ''
    formData.region = ''
    formData.avatar = ''
    formData.specialty = ''
    formData.douyinName = ''
    formData.douyinUrl = ''
    formData.personalDescription = ''
    formData.experienceJob = ''
    formData.achievements = []
    formData.expertiseAreas = []
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改规划师'
    formLoading.value = true
    try {
      const res = await getPlannerDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.name = d.name
        formData.position = d.position || ''
        formData.region = d.region || ''
        formData.avatar = d.avatar || ''
        formData.specialty = d.specialty || ''
        formData.douyinName = d.douyinName || ''
        formData.douyinUrl = d.douyinUrl || ''
        formData.personalDescription = d.personalDescription || ''
        formData.experienceJob = d.experienceJob || ''
        formData.achievements = d.achievements || []
        formData.expertiseAreas = d.expertiseAreas || []
        formData.sortOrder = d.sortOrder || 0
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '规划师详情'
    formLoading.value = true
    try {
      const res = await getPlannerDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
  }

  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.name) {
    ElMessage.warning('请填写姓名')
    return
  }
  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: PlannerAddDTO = { name: formData.name }
      if (formData.position) data.position = formData.position
      if (formData.region) data.region = formData.region
      if (formData.avatar) data.avatar = formData.avatar
      if (formData.specialty) data.specialty = formData.specialty
      if (formData.douyinName) data.douyinName = formData.douyinName
      if (formData.douyinUrl) data.douyinUrl = formData.douyinUrl
      if (formData.personalDescription) data.personalDescription = formData.personalDescription
      if (formData.experienceJob) data.experienceJob = formData.experienceJob
      if (formData.achievements && formData.achievements.length > 0) data.achievements = formData.achievements
      if (formData.expertiseAreas && formData.expertiseAreas.length > 0) data.expertiseAreas = formData.expertiseAreas
      data.sortOrder = formData.sortOrder
      res = await addPlanner(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: PlannerUpdateDTO = { name: formData.name }
      if (formData.position) data.position = formData.position
      if (formData.region) data.region = formData.region
      if (formData.avatar) data.avatar = formData.avatar
      if (formData.specialty) data.specialty = formData.specialty
      if (formData.douyinName) data.douyinName = formData.douyinName
      if (formData.douyinUrl) data.douyinUrl = formData.douyinUrl
      if (formData.personalDescription) data.personalDescription = formData.personalDescription
      if (formData.experienceJob) data.experienceJob = formData.experienceJob
      if (formData.achievements && formData.achievements.length > 0) data.achievements = formData.achievements
      if (formData.expertiseAreas && formData.expertiseAreas.length > 0) data.expertiseAreas = formData.expertiseAreas
      data.sortOrder = formData.sortOrder
      res = await updatePlanner(currentId.value, data)
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该规划师吗？此操作不可恢复！', '警告', { type: 'warning' })
    const res = await deletePlanner(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const addArrayItem = (arr: string[] | undefined) => { if (arr) arr.push('') }
const removeArrayItem = (arr: string[] | undefined, index: number) => { if (arr) arr.splice(index, 1) }
const arrOrEmpty = (arr: string[] | undefined): string[] => arr || []

const statusTag = (status: number) => (status === 1 ? 'success' : 'info')
const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <!-- 搜索区 -->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="姓名">
          <el-input v-model="queryParams.name" placeholder="姓名模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
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
      <el-button type="primary" @click="openDialog('add')">新增规划师</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="position" label="职位" width="140" />
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="specialty" label="专长" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.status === 1 ? 'info' : 'success'" link @click="handleToggleStatus(row)">
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" :close-on-click-modal="false">
      <div v-loading="formLoading">
        <!-- 详情 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="职位">{{ detailData.position || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="头像" v-if="detailData.avatar" :span="2">
              <el-image :src="detailData.avatar" style="width: 80px; height: 80px; border-radius: 50%;" fit="cover" />
            </el-descriptions-item>
            <el-descriptions-item label="专长" :span="2">{{ detailData.specialty || '-' }}</el-descriptions-item>
            <el-descriptions-item label="抖音名称">{{ detailData.douyinName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="抖音链接" v-if="detailData.douyinUrl">
              <el-link :href="detailData.douyinUrl" target="_blank">{{ detailData.douyinUrl }}</el-link>
            </el-descriptions-item>
            <el-descriptions-item label="个人简介" :span="2">{{ detailData.personalDescription || '-' }}</el-descriptions-item>
            <el-descriptions-item label="工作经历" :span="2">{{ detailData.experienceJob || '-' }}</el-descriptions-item>
            <el-descriptions-item label="成就">
              <div v-if="detailData.achievements && detailData.achievements.length">
                <el-tag v-for="(item, i) in detailData.achievements" :key="i" size="small" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="擅长领域">
              <div v-if="detailData.expertiseAreas && detailData.expertiseAreas.length">
                <el-tag v-for="(item, i) in detailData.expertiseAreas" :key="i" size="small" type="success" class="mr-1 mb-1">{{ item }}</el-tag>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">{{ statusLabel(detailData.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" :span="2">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>

        <!-- 新增/修改 -->
        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="110px">
            <el-form-item label="姓名" required>
              <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="50" />
            </el-form-item>
            <el-form-item label="职位">
              <el-input v-model="formData.position" placeholder="请输入职位" maxlength="50" />
            </el-form-item>
            <el-form-item label="地区">
              <el-input v-model="formData.region" placeholder="请输入地区" maxlength="20" />
            </el-form-item>
            <el-form-item label="头像 URL">
              <el-input v-model="formData.avatar" placeholder="请输入头像链接" maxlength="100" />
            </el-form-item>
            <el-form-item label="专长">
              <el-input v-model="formData.specialty" placeholder="请输入专长" maxlength="100" />
            </el-form-item>
            <el-form-item label="抖音名称">
              <el-input v-model="formData.douyinName" placeholder="请输入抖音名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="抖音链接">
              <el-input v-model="formData.douyinUrl" placeholder="请输入抖音链接" maxlength="100" />
            </el-form-item>
            <el-form-item label="个人简介">
              <el-input v-model="formData.personalDescription" type="textarea" :rows="3" placeholder="请输入个人简介" />
            </el-form-item>
            <el-form-item label="工作经历">
              <el-input v-model="formData.experienceJob" type="textarea" :rows="3" placeholder="请输入工作经历" />
            </el-form-item>
            <el-form-item label="成就">
              <div v-for="(item, index) in arrOrEmpty(formData.achievements)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.achievements![index]" placeholder="请输入成就" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.achievements, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.achievements)">+ 添加成就</el-button>
            </el-form-item>
            <el-form-item label="擅长领域">
              <div v-for="(item, index) in arrOrEmpty(formData.expertiseAreas)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.expertiseAreas![index]" placeholder="请输入擅长领域" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.expertiseAreas, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.expertiseAreas)">+ 添加擅长领域</el-button>
            </el-form-item>
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" />
            </el-form-item>
          </el-form>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
