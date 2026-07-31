<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getDepartmentPage,
  getDepartmentDetail,
  addDepartment,
  updateDepartment,
  updateDepartmentStatus,
  deleteDepartment,
  hardDeleteDepartment,
  batchDeleteDepartment,
  batchHardDeleteDepartment,
  importDepartment,
} from '@/api/university/department'
import { getUniversityPage } from '@/api/university/info'
import type {
  DepartmentListVO,
  DepartmentDetailVO,
  DepartmentQueryDTO,
  DepartmentAddDTO,
  DepartmentUpdateDTO,
} from '@/types/university/department'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'
const departmentTypeOptions = ['工学院', '理学院', '文学院', '商学院', '法学院', '医学院', '艺术学院', '农学院', '教育学院']
const loading = ref(false)
const tableData = ref<DepartmentListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])
const universityOptions = ref<{ label: string; value: number }[]>([])
const queryParams = reactive<DepartmentQueryDTO>({
  page: 1,
  size: 10,
  universityName: '',
  departmentName: '',
  departmentType: '',
  status: undefined,
})
const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<DepartmentDetailVO | null>(null)
const formData = reactive<DepartmentAddDTO>({
  universityId: '',
  departmentName: '',
  departmentType: '',
  pageTitle: '',
  tags: [],
  sortOrder: undefined,
})
const editFormData = reactive<DepartmentUpdateDTO>({
  universityId: '',
  departmentName: '',
  departmentType: '',
  pageTitle: '',
  tags: [],
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
    if (queryParams.departmentName) params.departmentName = queryParams.departmentName
    if (queryParams.departmentType) params.departmentType = queryParams.departmentType
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getDepartmentPage(params as DepartmentQueryDTO)
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
  queryParams.departmentName = ''
  queryParams.departmentType = ''
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
const handleSelectionChange = (selection: DepartmentListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}
const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null
  if (mode === 'add') {
    dialogTitle.value = '新增院系'
    formData.universityId = ''
    formData.departmentName = ''
    formData.departmentType = ''
    formData.pageTitle = ''
    formData.tags = []
    formData.sortOrder = undefined
    detailData.value = null
    await fetchUniversityOptions()
  } else if (mode === 'edit' && id) {
    dialogTitle.value = '修改院系'
    formLoading.value = true
    try {
      const res = await getDepartmentDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        editFormData.universityId = d.universityId
        editFormData.departmentName = d.departmentName
        editFormData.departmentType = d.departmentType
        editFormData.pageTitle = d.pageTitle
        editFormData.tags = d.tags || []
        editFormData.sortOrder = d.sortOrder
        editFormData.status = d.status
        await fetchUniversityOptions()
      }
    } catch {
      ElMessage.error('获取详情失败')
    } finally {
      formLoading.value = false
    }
    detailData.value = null
  } else if (mode === 'detail' && id) {
    dialogTitle.value = '院系详情'
    formLoading.value = true
    try {
      const res = await getDepartmentDetail(id)
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
    if (!formData.universityId || !formData.departmentName || !formData.departmentType) {
      ElMessage.warning('请填写完整信息')
      return
    }
    try {
      const res = await addDepartment({
        universityId: formData.universityId,
        departmentName: formData.departmentName,
        departmentType: formData.departmentType,
        pageTitle: formData.pageTitle,
        tags: formData.tags,
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
    if (!editFormData.universityId || !editFormData.departmentName || !editFormData.departmentType) {
      ElMessage.warning('请填写完整信息')
      return
    }
    try {
      const res = await updateDepartment(currentId.value, {
        universityId: editFormData.universityId,
        departmentName: editFormData.departmentName,
        departmentType: editFormData.departmentType,
        pageTitle: editFormData.pageTitle,
        tags: editFormData.tags,
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
const handleToggleStatus = async (row: DepartmentListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该院系吗？`, '提示')
    const res = await updateDepartmentStatus(row.id, { status: newStatus })
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
    await ElMessageBox.confirm('确定要永久删除该院系吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteDepartment(id)
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
    ElMessage.warning('请先选择要永久删除的院系')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 个院系吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteDepartment(selectedIds.value as unknown as number[])
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
      const res = await importDepartment(file)
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
  <div class="page-wrap">
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" /></div>

    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title">院系管理</div>
      <div class="page-subtitle">管理学院下的各个院系信息</div>
    </div>

    <!-- 搜索卡片 -->
    <div class="search-card">
      <div class="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        筛选条件
      </div>
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
        <el-form-item label="院系名称">
          <el-input
            v-model="queryParams.departmentName"
            placeholder="模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="院系类型">
          <el-select
            v-model="queryParams.departmentType"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in departmentTypeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
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
          <button class="btn-search" @click="handleSearch">查询</button>
          <button class="btn-outline" @click="handleReset">重置</button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <button class="btn-primary" @click="openDialog('add')">新增院系</button>
      <button class="btn-outline" @click="handleImport">导入Excel</button>
      <button class="btn-danger" :disabled="selectedIds.length === 0" @click="handleBatchHardDelete">批量永久删除</button>
      <button class="btn-outline" @click="fetchData">刷新</button>
    </div>

    <!-- 表格卡片 -->
    <div class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        class="custom-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="universityName" label="院校名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="departmentName" label="院系名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="departmentType" label="院系类型" width="120" />
        <el-table-column label="标签" width="180">
          <template #default="{ row }">
            <el-tag
              v-for="(tag, idx) in row.tags"
              :key="idx"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px"
            >
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="430" align="center" fixed="right">
          <template #default="{ row }">
            <button class="btn-op btn-op-detail" @click="openDialog('detail', row.id)">详情</button>
            <button class="btn-op btn-op-edit" @click="openDialog('edit', row.id)">修改</button>
            <button
              class="btn-op"
              :class="row.status === 1 ? 'btn-op-disable' : 'btn-op-enable'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </button>
            <button class="btn-op btn-op-delete" @click="handleHardDelete(row.id)">永久删除</button>
          </template>
        </el-table-column>
      </el-table>
      <div class="custom-pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100, 200, 500, 1000]"
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
      class="uni-dialog"
    >
      <div v-loading="formLoading">
        <template v-if="dialogMode === 'detail' && detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="院校名称">{{ detailData.universityName }}</el-descriptions-item>
            <el-descriptions-item label="院系名称">{{ detailData.departmentName }}</el-descriptions-item>
            <el-descriptions-item label="院系类型">{{ detailData.departmentType }}</el-descriptions-item>
            <el-descriptions-item label="页面主标题">{{ detailData.pageTitle }}</el-descriptions-item>
            <el-descriptions-item label="排序权重">{{ detailData.sortOrder }}</el-descriptions-item>
            <el-descriptions-item label="标签" :span="2">
              <el-tag
                v-for="(tag, idx) in detailData.tags"
                :key="idx"
                size="small"
                style="margin-right: 4px"
              >
                {{ tag }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                {{ detailData.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间" :span="2">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
          <div v-if="detailData.report" class="mt-4">
            <el-collapse>
              <el-collapse-item title="概况 (overview)" name="overview">
                <p class="mb-2 text-sm">{{ detailData.report.overview.title }}</p>
                <p v-for="(desc, idx) in detailData.report.overview.descriptions" :key="idx" class="mb-1 text-sm">{{ desc }}</p>
              </el-collapse-item>
              <el-collapse-item title="前景数据 (prospects)" name="prospects">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="就业率">{{ detailData.report.prospects.employmentRate }}</el-descriptions-item>
                  <el-descriptions-item label="平均薪资">{{ detailData.report.prospects.masterSalary }}</el-descriptions-item>
                  <el-descriptions-item label="深造率">{{ detailData.report.prospects.furtherStudyRate }}</el-descriptions-item>
                  <el-descriptions-item label="500强就职率">{{ detailData.report.prospects.fortune500Rate }}</el-descriptions-item>
                  <el-descriptions-item label="薪资增长率">{{ detailData.report.prospects.salaryGrowthRate }}</el-descriptions-item>
                  <el-descriptions-item label="海外留学率">{{ detailData.report.prospects.overseasRate }}</el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>
              <el-collapse-item title="趋势分析 (trends)" name="trends">
                <div class="space-y-2 text-sm">
                  <div><strong>高增长领域：</strong>{{ detailData.report.trends.highGrowthTracks?.join('、') }}</div>
                  <div><strong>政策导向：</strong>{{ detailData.report.trends.policyOrientations?.join('、') }}</div>
                  <div><strong>环境分析：</strong></div>
                  <p v-for="(e, idx) in detailData.report.trends.environmentAnalysis" :key="idx" class="ml-2">{{ e }}</p>
                </div>
              </el-collapse-item>
              <el-collapse-item title="城市薪资 (citySalary)" name="citySalary">
                <el-table :data="detailData.report.citySalary" size="small" stripe>
                  <el-table-column prop="cityName" label="城市" />
                  <el-table-column prop="minSalary" label="最低薪资" />
                  <el-table-column prop="maxSalary" label="最高薪资" />
                </el-table>
              </el-collapse-item>
              <el-collapse-item title="薪资数据 (salary)" name="salary">
                <el-table :data="detailData.report.salary" size="small" stripe>
                  <el-table-column prop="majorName" label="专业" />
                  <el-table-column prop="minSalary" label="最低薪资" />
                  <el-table-column prop="maxSalary" label="最高薪资" />
                </el-table>
              </el-collapse-item>
              <el-collapse-item title="考研方向 (postgraduate)" name="postgraduate">
                <div class="text-sm">
                  <p><strong>{{ detailData.report.postgraduate.title }}</strong></p>
                  <p v-for="(d, idx) in detailData.report.postgraduate.directions" :key="idx">{{ d }}</p>
                </div>
              </el-collapse-item>
              <el-collapse-item title="职业路径 (career)" name="career">
                <div v-for="(c, idx) in detailData.report.career" :key="idx" class="mb-4">
                  <p class="font-medium">{{ c.pathTitle }}</p>
                  <p class="mb-2 text-sm text-gray-500">{{ c.pathDesc }}</p>
                  <el-table :data="c.stages" size="small" stripe>
                    <el-table-column prop="stageTitle" label="阶段" />
                    <el-table-column prop="workYears" label="工作年限" />
                    <el-table-column prop="position" label="职位" />
                    <el-table-column prop="coreGoal" label="核心目标" />
                    <el-table-column prop="salaryRange" label="薪资范围" />
                  </el-table>
                </div>
              </el-collapse-item>
              <el-collapse-item title="学科明细 (subjectsDetail)" name="subjectsDetail">
                <div v-for="(s, idx) in detailData.report.subjectsDetail" :key="idx" class="mb-4 rounded border p-3">
                  <p class="font-medium">{{ s.majorName }}</p>
                  <div class="mt-2 text-sm">
                    <p><strong>核心学科：</strong>{{ s.coreSubject }}</p>
                    <p><strong>支持学科：</strong>{{ s.supportSubject }}</p>
                    <p><strong>定位：</strong>{{ s.positioning }}</p>
                    <div class="mt-1"><strong>核心课程：</strong>{{ s.coreCourses?.join('、') }}</div>
                    <div><strong>能力要求：</strong>{{ s.abilities?.join('、') }}</div>
                    <div><strong>证书：</strong>{{ s.certificates?.join('、') }}</div>
                    <div v-if="s.tags?.length" class="mt-1">
                      <el-tag v-for="(t, ti) in s.tags" :key="ti" size="small" style="margin-right: 4px">{{ t }}</el-tag>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="专业构成 (majorCompose)" name="majorCompose">
                <el-table :data="detailData.report.majorCompose" size="small" stripe>
                  <el-table-column prop="subjectName" label="学科名称" />
                  <el-table-column prop="percentage" label="占比(%)" />
                </el-table>
              </el-collapse-item>
              <el-collapse-item title="副标题及免责声明" name="misc">
                <div class="text-sm">
                  <p><strong>副标题：</strong>{{ detailData.report.subtitle }}</p>
                  <p><strong>声明：</strong>{{ detailData.report.disclaimer?.text }}</p>
                  <p><strong>更新时间：</strong>{{ detailData.report.disclaimer?.updateTime }}</p>
                  <p><strong>版本：</strong>{{ detailData.report.disclaimer?.version }}</p>
                  <p><strong>编制单位：</strong>{{ detailData.report.disclaimer?.compileUnit }}</p>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </template>
        <template v-if="dialogMode === 'add'">
          <el-form :model="formData" label-width="110px">
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
            <el-form-item label="院系名称" required>
              <el-input v-model="formData.departmentName" placeholder="请输入院系名称" maxlength="50" />
            </el-form-item>
            <el-form-item label="院系类型" required>
              <el-select v-model="formData.departmentType" placeholder="请选择院系类型" style="width: 100%">
                <el-option
                  v-for="item in departmentTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="页面主标题">
              <el-input v-model="formData.pageTitle" placeholder="如不填则使用院系名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="院系标签">
              <el-select
                v-model="formData.tags"
                multiple
                allow-create
                filterable
                placeholder="输入标签后回车"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 200px" />
            </el-form-item>
          </el-form>
        </template>
        <template v-if="dialogMode === 'edit'">
          <el-form :model="editFormData" label-width="110px">
            <el-form-item label="院校" required>
              <el-select
                v-model="editFormData.universityId"
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
            <el-form-item label="院系名称" required>
              <el-input v-model="editFormData.departmentName" placeholder="请输入院系名称" maxlength="50" />
            </el-form-item>
            <el-form-item label="院系类型" required>
              <el-select v-model="editFormData.departmentType" placeholder="请选择院系类型" style="width: 100%">
                <el-option
                  v-for="item in departmentTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="页面主标题">
              <el-input v-model="editFormData.pageTitle" placeholder="如不填则使用院系名称" maxlength="100" />
            </el-form-item>
            <el-form-item label="院系标签">
              <el-select
                v-model="editFormData.tags"
                multiple
                allow-create
                filterable
                placeholder="输入标签后回车"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number v-model="editFormData.sortOrder" :min="0" style="width: 200px" />
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="editFormData.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-form>
        </template>
      </div>
      <template #footer>
        <button class="btn-outline" @click="dialogVisible = false">
          {{ dialogMode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="dialogMode !== 'detail'" class="btn-primary" @click="handleSubmit">
          确定
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* ========== 页面整体 ========== */
.page-wrap {
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  min-height: calc(100vh - 60px);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* ========== 水印 ========== */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  left: -60px;
  top: -60px;
  transform: rotate(18deg);
}
.watermark-right {
  right: -40px;
  bottom: -40px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
}

/* ========== 页面头部 ========== */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
}

/* ========== 搜索卡片 ========== */
.search-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  margin-bottom: 16px;
}
.section-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}

/* ========== 操作栏 ========== */
.action-bar {
  position: relative;
  z-index: 1;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ========== 按钮 ========== */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transition: all 0.3s;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: #fff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-outline:hover {
  border-color: #F97316;
  color: #F97316;
}

.btn-search {
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
}
.btn-search:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}
.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ========== 表格卡片 ========== */
.table-card {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
}

/* 表格头 */
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600 !important;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}
.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}

/* 行 hover */
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

/* 斑马纹 */
.custom-table :deep(.el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}

/* ========== 状态胶囊 ========== */
.status-pill {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}
.status-on {
  background: rgba(249, 115, 22, 0.12);
  color: #F97316;
}
.status-off {
  background: #f3f4f6;
  color: #9ca3af;
}

/* ========== 操作按钮 ========== */
.btn-op {
  padding: 3px 10px;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
  margin: 0 2px;
}
.btn-op:hover {
  opacity: 0.85;
}
.btn-op-detail {
  color: #F97316;
  background: rgba(249, 115, 22, 0.08);
}
.btn-op-edit {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}
.btn-op-enable {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}
.btn-op-disable {
  color: #eab308;
  background: rgba(234, 179, 8, 0.08);
}
.btn-op-delete {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

/* ========== 分页 ========== */
.custom-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
.custom-pagination :deep(.el-pagination .is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  border-radius: 6px;
}
.custom-pagination :deep(.el-pagination .is-active .el-pager li) {
  color: #fff !important;
}
.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}

/* ========== Dialog ========== */
.uni-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}
.uni-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
}
.uni-dialog :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}
.uni-dialog :deep(.el-descriptions__label) {
  background: rgba(249, 115, 22, 0.06) !important;
}
.uni-dialog :deep(.el-input__wrapper) {
  border-radius: 8px;
}
.uni-dialog :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.uni-dialog :deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #F97316 inset !important;
}
.uni-dialog :deep(.el-dialog__footer) {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
