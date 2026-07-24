<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getInstitutionPage,
  getInstitutionDetail,
  addInstitution,
  updateInstitution,
  updateInstitutionStatus,
  deleteInstitution,
} from '@/api/home/institution'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionAddDTO,
  InstitutionUpdateDTO,
} from '@/types/home/institution'

const loading = ref(false)
const tableData = ref<InstitutionListVO[]>([])
const total = ref(0)

const queryParams = reactive<InstitutionQueryDTO>({
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
const detailData = ref<InstitutionDetailVO | null>(null)

const formData = reactive<InstitutionAddDTO>({
  name: '',
  type: '',
  phone: '',
  address: '',
  description: '',
  courses: [],
  images: [],
  logo: '',
  sortOrder: 0,
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getInstitutionPage(params as InstitutionQueryDTO)
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
    dialogTitle.value = '新增培训机构'
    formData.name = ''
    formData.type = ''
    formData.phone = ''
    formData.address = ''
    formData.description = ''
    formData.courses = []
    formData.images = []
    formData.logo = ''
    formData.sortOrder = 0
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改培训机构'
    formLoading.value = true
    try {
      const res = await getInstitutionDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.name = d.name
        formData.type = d.type
        formData.phone = d.phone || ''
        formData.address = d.address || ''
        formData.description = d.description || ''
        formData.courses = d.courses || []
        formData.images = d.images || []
        formData.logo = d.logo || ''
        formData.sortOrder = d.sortOrder || 0
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '培训机构详情'
    formLoading.value = true
    try {
      const res = await getInstitutionDetail(id)
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
  if (!formData.name || !formData.type) {
    ElMessage.warning('请填写机构名称和类别')
    return
  }
  try {
    let res: any
    if (dialogMode.value === 'add') {
      const data: InstitutionAddDTO = { name: formData.name, type: formData.type }
      if (formData.phone) data.phone = formData.phone
      if (formData.address) data.address = formData.address
      if (formData.description) data.description = formData.description
      if (formData.courses && formData.courses.length > 0) data.courses = formData.courses
      if (formData.images && formData.images.length > 0) data.images = formData.images
      if (formData.logo) data.logo = formData.logo
      data.sortOrder = formData.sortOrder
      res = await addInstitution(data)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      const data: InstitutionUpdateDTO = { name: formData.name, type: formData.type }
      if (formData.phone) data.phone = formData.phone
      if (formData.address) data.address = formData.address
      if (formData.description) data.description = formData.description
      if (formData.courses && formData.courses.length > 0) data.courses = formData.courses
      if (formData.images && formData.images.length > 0) data.images = formData.images
      if (formData.logo) data.logo = formData.logo
      data.sortOrder = formData.sortOrder
      res = await updateInstitution(currentId.value, data)
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

const handleToggleStatus = async (row: InstitutionListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该机构吗？`, '提示')
    const res = await updateInstitutionStatus(row.id, { status: newStatus })
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
    await ElMessageBox.confirm('确定要删除该机构吗？此操作不可恢复！', '警告', { type: 'warning' })
    const res = await deleteInstitution(id)
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
        <el-form-item label="名称">
          <el-input v-model="queryParams.name" placeholder="名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
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
      <el-button type="primary" @click="openDialog('add')">新增机构</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="type" label="类别" width="140" />
        <el-table-column prop="phone" label="电话" width="140" />
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
            <el-descriptions-item label="名称">{{ detailData.name }}</el-descriptions-item>
            <el-descriptions-item label="类别">{{ detailData.type }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ detailData.phone || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ detailData.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="简介" :span="2">{{ detailData.description || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Logo" v-if="detailData.logo">
              <el-image :src="detailData.logo" style="width: 80px; height: 80px;" fit="contain" />
            </el-descriptions-item>
            <el-descriptions-item label="课程" v-if="detailData.courses && detailData.courses.length">
              <el-tag v-for="(item, i) in detailData.courses" :key="i" size="small" class="mr-1 mb-1">{{ item }}</el-tag>
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
            <el-form-item label="名称" required>
              <el-input v-model="formData.name" placeholder="请输入机构名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="类别" required>
              <el-input v-model="formData.type" placeholder="请输入机构类别" maxlength="100" />
            </el-form-item>
            <el-form-item label="电话">
              <el-input v-model="formData.phone" placeholder="请输入联系电话" maxlength="20" />
            </el-form-item>
            <el-form-item label="地址">
              <el-input v-model="formData.address" placeholder="请输入地址" maxlength="100" />
            </el-form-item>
            <el-form-item label="简介">
              <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入机构简介" />
            </el-form-item>
            <el-form-item label="Logo URL">
              <el-input v-model="formData.logo" placeholder="请输入 Logo 链接" maxlength="200" />
            </el-form-item>
            <el-form-item label="课程">
              <div v-for="(item, index) in arrOrEmpty(formData.courses)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.courses![index]" placeholder="请输入课程名称" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.courses, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.courses)">+ 添加课程</el-button>
            </el-form-item>
            <el-form-item label="图片 URL">
              <div v-for="(item, index) in arrOrEmpty(formData.images)" :key="index" class="mb-2 flex items-center gap-2">
                <el-input v-model="formData.images![index]" placeholder="请输入图片链接" style="width: 400px" />
                <el-button type="danger" link @click="removeArrayItem(formData.images, index)">删除</el-button>
              </div>
              <el-button type="primary" link @click="addArrayItem(formData.images)">+ 添加图片</el-button>
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
