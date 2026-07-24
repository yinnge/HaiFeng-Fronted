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
  universityId: 0,
  departmentName: '',
  departmentType: '',
  pageTitle: '',
  tags: [],
  sortOrder: undefined,
})
const editFormData = reactive<DepartmentUpdateDTO>({
  universityId: 0,
  departmentName: '',
  departmentType: '',
  pageTitle: '',
  tags: [],
  sortOrder: undefined,
  status: 1,
})
const fetchUniversityOptions = async () => {
  try {
    const res = await getUniversityPage({ page: 1, size: 1000 } as any)
    if (res.data.code === 200) {
      universityOptions.value = res.data.data.records.map((r: any) => ({
        label: r.name,
        value: r.id,
      }))
    }
  } catch {
    // silent
  }
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
    formData.universityId = 0
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
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要下架该院系吗？', '提示')
    const res = await deleteDepartment(id)
    if (res.data.code === 200) {
      ElMessage.success('下架成功')
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
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要下架的院系')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要下架选中的${selectedIds.value.length} 个院系吗？`, '提示')
    const res = await batchDeleteDepartment(selectedIds.value)
    if (res.data.code === 200) {
      ElMessage.success('批量下架成功')
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
    const res = await batchHardDeleteDepartment(selectedIds.value)
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
  <div>
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
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增院系</el-button>
      <el-button @click="handleImport">导入Excel</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量下架</el-button>
      <el-button :disabled="selectedIds.length === 0" type="danger" @click="handleBatchHardDelete">批量永久删除</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>
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
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '展示' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="480" align="center" fixed="right">
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
            <el-button type="danger" link @click="handleDelete(row.id)">下架</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id)">永久删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex justify-end">
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
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
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
                {{ detailData.status === 1 ? '展示' : '下架' }}
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
