<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getEnterprisePage,
  getEnterpriseDetail,
  addEnterprise,
  updateEnterprise,
  updateEnterpriseStatus,
  deleteEnterprise,
  batchDeleteEnterprise,
  importEnterprise,
} from '@/api/company'
import type {
  EnterpriseListVO,
  EnterpriseDetailVO,
  EnterpriseQueryDTO,
} from '@/types/company'

const loading = ref(false)
const tableData = ref<EnterpriseListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<EnterpriseQueryDTO>({
  page: 1,
  size: 10,
  cityName: '',
  enterpriseName: '',
  enterpriseNature: undefined,
  enterpriseType: '',
  recruitmentStatus: undefined,
  isDeleted: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<EnterpriseDetailVO | null>(null)

const formData = reactive<Record<string, any>>({
  cityName: '',
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  logoUrl: '',
  officialWebsite: '',
  region: '',
  enterpriseScale: '',
  mainBusiness: '',
  enterpriseIntro: '',
  recruitmentStatus: '招聘中',
})

const natureOptions = ['央企', '国企', '民企', '外企', '合资']

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.cityName) params.cityName = queryParams.cityName
    if (queryParams.enterpriseName) params.enterpriseName = queryParams.enterpriseName
    if (queryParams.enterpriseNature) params.enterpriseNature = queryParams.enterpriseNature
    if (queryParams.enterpriseType) params.enterpriseType = queryParams.enterpriseType
    if (queryParams.recruitmentStatus) params.recruitmentStatus = queryParams.recruitmentStatus
    if (queryParams.isDeleted !== undefined && queryParams.isDeleted !== null) params.isDeleted = queryParams.isDeleted
    const res = await getEnterprisePage(params as EnterpriseQueryDTO)
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
  queryParams.cityName = ''
  queryParams.enterpriseName = ''
  queryParams.enterpriseNature = undefined
  queryParams.enterpriseType = ''
  queryParams.recruitmentStatus = undefined
  queryParams.isDeleted = undefined
  queryParams.page = 1
  fetchData()
}

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }

const handleSizeChange = (size: number) => {
  queryParams.size = size
  queryParams.page = 1
  fetchData()
}

const handleSelectionChange = (rows: EnterpriseListVO[]) => {
  selectedIds.value = rows.map((r) => r.id)
}

const resetForm = () => {
  formData.cityName = ''
  formData.enterpriseName = ''
  formData.enterpriseNature = ''
  formData.enterpriseType = ''
  formData.logoUrl = ''
  formData.officialWebsite = ''
  formData.region = ''
  formData.enterpriseScale = ''
  formData.mainBusiness = ''
  formData.enterpriseIntro = ''
  formData.recruitmentStatus = '招聘中'
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增企业'
    resetForm()
    detailData.value = null
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改企业'
    formLoading.value = true
    try {
      const res = await getEnterpriseDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        formData.cityName = d.cityName || ''
        formData.enterpriseName = d.enterpriseName
        formData.enterpriseNature = d.enterpriseNature
        formData.enterpriseType = d.enterpriseType || ''
        formData.logoUrl = d.logoUrl || ''
        formData.officialWebsite = d.officialWebsite || ''
        formData.region = d.region || ''
        formData.enterpriseScale = d.enterpriseScale || ''
        formData.mainBusiness = d.mainBusiness || ''
        formData.enterpriseIntro = d.enterpriseIntro || ''
        formData.recruitmentStatus = d.recruitmentStatus
      }
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '企业详情'
    formLoading.value = true
    try {
      const res = await getEnterpriseDetail(id)
      if (res.data.code === 200) detailData.value = res.data.data
    } catch { ElMessage.error('获取详情失败') }
    finally { formLoading.value = false }
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formData.enterpriseName) {
    ElMessage.warning('请填写企业名称')
    return
  }
  if (!formData.enterpriseNature) {
    ElMessage.warning('请选择企业性质')
    return
  }

  try {
    const data: Record<string, any> = {
      enterpriseName: formData.enterpriseName,
      enterpriseNature: formData.enterpriseNature,
    }
    if (formData.cityName) data.cityName = formData.cityName
    if (formData.enterpriseType) data.enterpriseType = formData.enterpriseType
    if (formData.logoUrl) data.logoUrl = formData.logoUrl
    if (formData.officialWebsite) data.officialWebsite = formData.officialWebsite
    if (formData.region) data.region = formData.region
    if (formData.enterpriseScale) data.enterpriseScale = formData.enterpriseScale
    if (formData.mainBusiness) data.mainBusiness = formData.mainBusiness
    if (formData.enterpriseIntro) data.enterpriseIntro = formData.enterpriseIntro
    if (formData.recruitmentStatus) data.recruitmentStatus = formData.recruitmentStatus

    let res: any
    if (dialogMode.value === 'add') {
      res = await addEnterprise(data as any)
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateEnterprise(currentId.value, data)
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

const handleToggleStatus = async (row: EnterpriseListVO) => {
  const newStatus = !row.isDeleted
  const actionText = newStatus ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该企业吗？`, '提示')
    const res = await updateEnterpriseStatus(row.id, { isDeleted: newStatus })
    if (res.data.code === 200) {
      ElMessage.success(`${actionText}成功`)
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch { /* cancel */ }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该企业吗？此操作不可恢复！', '警告', {
      type: 'warning', confirmButtonText: '确定永久删除', cancelButtonText: '取消',
    })
    const res = await deleteEnterprise(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的企业'); return }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条企业记录吗？此操作不可恢复！`, '警告', {
      type: 'warning', confirmButtonText: '确定批量永久删除', cancelButtonText: '取消',
    })
    const res = await batchDeleteEnterprise(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '批量删除失败')
    }
  } catch { /* cancel */ }
}

const importDialogVisible = ref(false)
const importFile = ref<File | null>(null)
const importLoading = ref(false)

const openImportDialog = () => {
  importFile.value = null
  importDialogVisible.value = true
}

const handleImportFileChange = (uploadFile: any) => {
  importFile.value = uploadFile.raw
  return false
}

const handleImportSubmit = async () => {
  if (!importFile.value) { ElMessage.warning('请选择文件'); return }
  importLoading.value = true
  try {
    const res = await importEnterprise(importFile.value)
    if (res.data.code === 200) {
      ElMessage.success('导入成功')
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '导入失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.msg || '导入失败')
  } finally {
    importLoading.value = false
  }
}

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

onMounted(() => { fetchData() })
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="企业名称">
          <el-input v-model="queryParams.enterpriseName" placeholder="企业名称模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="城市名称">
          <el-input v-model="queryParams.cityName" placeholder="城市名称模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="企业性质">
          <el-select v-model="queryParams.enterpriseNature" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业类型">
          <el-input v-model="queryParams.enterpriseType" placeholder="类型模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="招聘状态">
          <el-select v-model="queryParams.recruitmentStatus" placeholder="全部" clearable style="width: 120px">
            <el-option label="招聘中" value="招聘中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.isDeleted" placeholder="全部" clearable style="width: 100px">
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button type="primary" @click="openDialog('add')">新增企业</el-button>
        <el-button type="success" @click="openImportDialog">Excel批量导入</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量永久删除</el-button>
      </div>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="cityName" label="城市名称" width="120" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="enterpriseNature" label="企业性质" width="100" />
        <el-table-column prop="enterpriseType" label="企业类型" width="150" show-overflow-tooltip />
        <el-table-column prop="recruitmentStatus" label="招聘状态" width="100" />
        <el-table-column prop="isDeleted" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.isDeleted)" size="small">{{ statusLabel(row.isDeleted) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog('detail', row.id)">详情</el-button>
            <el-button type="warning" link @click="openDialog('edit', row.id)">修改</el-button>
            <el-button :type="row.isDeleted ? 'success' : 'info'" link @click="handleToggleStatus(row)">
              {{ row.isDeleted ? '启用' : '禁用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">永久删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px" :close-on-click-modal="false" :destroy-on-close="true">
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID" :span="2">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ detailData.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="城市名称">{{ detailData.cityName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业性质">{{ detailData.enterpriseNature }}</el-descriptions-item>
            <el-descriptions-item label="企业类型">{{ detailData.enterpriseType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="招聘状态">{{ detailData.recruitmentStatus }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.isDeleted)" size="small">{{ statusLabel(detailData.isDeleted) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="总部地区">{{ detailData.region || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业规模">{{ detailData.enterpriseScale || '-' }}</el-descriptions-item>
            <el-descriptions-item label="Logo地址">
              <template v-if="detailData.logoUrl">
                <el-link type="primary" :href="detailData.logoUrl" target="_blank">{{ detailData.logoUrl }}</el-link>
              </template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="官网">
              <template v-if="detailData.officialWebsite">
                <el-link type="primary" :href="detailData.officialWebsite" target="_blank">{{ detailData.officialWebsite }}</el-link>
              </template>
              <template v-else>-</template>
            </el-descriptions-item>
            <el-descriptions-item label="主营业务" :span="2">{{ detailData.mainBusiness || '-' }}</el-descriptions-item>
            <el-descriptions-item label="企业简介" :span="2">{{ detailData.enterpriseIntro || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>

          <div class="mt-4">
            <h3 class="mb-2 text-base font-medium">关联岗位</h3>
            <el-table :data="detailData.positions" border stripe size="small" v-if="detailData.positions?.length">
              <el-table-column prop="positionName" label="岗位名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
              <el-table-column prop="province" label="省份" width="80" />
              <el-table-column prop="city" label="城市" width="80" />
              <el-table-column prop="workLocation" label="工作地点" width="140" show-overflow-tooltip />
              <el-table-column prop="educationRequirement" label="学历要求" width="90" />
              <el-table-column prop="majorRequirement" label="专业要求" width="120" show-overflow-tooltip />
              <el-table-column prop="workExperience" label="工作经验" width="90" />
              <el-table-column label="薪资(k/月)" width="120">
                <template #default="{ row }">
                  {{ row.salaryMin ?? '-' }} - {{ row.salaryMax ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="positionStatus" label="岗位状态" width="90" />
              <el-table-column prop="deadline" label="截止日期" width="100" />
            </el-table>
            <div v-else class="py-8 text-center text-gray-400">暂无关联岗位</div>
          </div>
        </template>

        <template v-if="dialogMode !== 'detail'">
          <el-form :model="formData" label-width="120px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业名称" required>
                  <el-input v-model="formData.enterpriseName" placeholder="请输入企业名称" maxlength="200" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业性质" required>
                  <el-select v-model="formData.enterpriseNature" placeholder="请选择" style="width: 100%">
                    <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="城市名称">
                  <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业类型">
                  <el-input v-model="formData.enterpriseType" placeholder="请输入企业类型" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Logo地址">
                  <el-input v-model="formData.logoUrl" placeholder="请输入Logo图片URL" maxlength="500" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="官网">
                  <el-input v-model="formData.officialWebsite" placeholder="请输入企业官网" maxlength="500" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="总部地区">
                  <el-input v-model="formData.region" placeholder="如: 广东省深圳市" maxlength="100" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业规模">
                  <el-input v-model="formData.enterpriseScale" placeholder="如: 10000人以上" maxlength="50" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="招聘状态">
                  <el-select v-model="formData.recruitmentStatus" placeholder="请选择招聘状态" style="width: 100%">
                    <el-option label="招聘中" value="招聘中" />
                    <el-option label="已结束" value="已结束" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主营业务">
                  <el-input v-model="formData.mainBusiness" placeholder="请输入主营业务" maxlength="500" show-word-limit />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="企业简介">
              <el-input v-model="formData.enterpriseIntro" type="textarea" :rows="4" placeholder="请输入企业简介" />
            </el-form-item>
          </el-form>
        </template>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ dialogMode === 'detail' ? '关闭' : '取消' }}</el-button>
        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="Excel批量导入" width="550px">
      <div>
        <div class="mb-3 text-sm text-gray-500">
          导入企业数据及关联岗位（单文件多Sheet）。企业名称必填且唯一，企业性质必填（央企/国企/民企/外企/合资）。
        </div>
        <el-upload drag :auto-upload="false" :show-file-list="true" accept=".xlsx,.xls" :on-change="handleImportFileChange" :limit="1">
          <el-icon class="el-icon--upload" style="font-size: 48px;"><UploadFilled /></el-icon>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .xlsx / .xls 格式，单Sheet不超过500行</div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="importLoading" @click="handleImportSubmit">确定导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>
