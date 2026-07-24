<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getUniversityPage,
  getUniversityDetail,
  addUniversity,
  updateUniversity,
  updateUniversityDetail,
  updateUniversityStatus,
  deleteUniversity,
  hardDeleteUniversity,
  batchDeleteUniversity,
  batchHardDeleteUniversity,
  importUniversityMain,
  importUniversityDetail,
} from '@/api/university/info'
import type {
  UniversityListVO,
  UniversityDetailVO,
  UniversityQueryDTO,
  UniversityAddDTO,
  UniversityDetailUpdateDTO,
} from '@/types/university/info'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'

const loading = ref(false)
const tableData = ref<UniversityListVO[]>([])
const total = ref(0)
const selectedIds = ref<string[]>([])

const queryParams = reactive<UniversityQueryDTO>({
  page: 1,
  size: 10,
  name: '',
  provinceName: '',
  category: '',
  status: undefined,
})

const dialogVisible = ref(false)
const dialogMode = ref<'detail' | 'add' | 'edit'>('detail')
const dialogTitle = ref('')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const detailData = ref<UniversityDetailVO | null>(null)

const formData = reactive<UniversityAddDTO>({
  name: '',
  nameEn: '',
  provinceName: '',
  cityName: '',
  region: '华东',
  category: '',
  majorCount: undefined,
  educationLevel: '',
  nature: '',
  recommendationRate: undefined,
  recommendationYear: undefined,
  hasDoctorate: false,
  hasMaster: false,
  department: '',
  tags: [],
  famousUnion: '',
  imageUrl: '',
  introduction: '',
})

const detailFormData = reactive({
  address: '',
  admissionPhone: '',
  website: '',
  historyGroupScore: undefined as number | undefined,
  scienceGroupScore: undefined as number | undefined,
  carouselImagesStr: '',
  detailIntroduction: '',
  rankings: {
    ruanke: undefined as number | undefined,
    xiaoyouhui: undefined as number | undefined,
    wushulian: undefined as number | undefined,
    qs: undefined as number | undefined,
    usnews: undefined as number | undefined,
  },
  abroadRate: '',
  genderRatio: '',
})

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.name) params.name = queryParams.name
    if (queryParams.provinceName) params.provinceName = queryParams.provinceName
    if (queryParams.category) params.category = queryParams.category
    if (queryParams.status !== undefined && queryParams.status !== null) params.status = queryParams.status
    const res = await getUniversityPage(params as UniversityQueryDTO)
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
  queryParams.name = ''
  queryParams.provinceName = ''
  queryParams.category = ''
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

const handleSelectionChange = (selection: UniversityListVO[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

const resetFormData = () => {
  formData.name = ''
  formData.nameEn = ''
  formData.provinceName = ''
  formData.cityName = ''
  formData.region = '华东'
  formData.category = ''
  formData.majorCount = undefined
  formData.educationLevel = ''
  formData.nature = ''
  formData.recommendationRate = undefined
  formData.recommendationYear = undefined
  formData.hasDoctorate = false
  formData.hasMaster = false
  formData.department = ''
  formData.tags = []
  formData.famousUnion = ''
  formData.imageUrl = ''
  formData.introduction = ''
  detailFormData.address = ''
  detailFormData.admissionPhone = ''
  detailFormData.website = ''
  detailFormData.historyGroupScore = undefined
  detailFormData.scienceGroupScore = undefined
  detailFormData.carouselImagesStr = ''
  detailFormData.detailIntroduction = ''
  detailFormData.rankings = { ruanke: undefined, xiaoyouhui: undefined, wushulian: undefined, qs: undefined, usnews: undefined }
  detailFormData.abroadRate = ''
  detailFormData.genderRatio = ''
}

const openDialog = async (mode: 'detail' | 'add' | 'edit', id?: string) => {
  dialogMode.value = mode
  currentId.value = id || null

  if (mode === 'add') {
    dialogTitle.value = '新增院校'
    resetFormData()
    detailData.value = null
  } else if ((mode === 'edit' || mode === 'detail') && id) {
    formLoading.value = true
    try {
      const res = await getUniversityDetail(id)
      if (res.data.code === 200) {
        const d = res.data.data
        if (mode === 'edit') {
          dialogTitle.value = '修改院校'
          formData.name = d.name
          formData.nameEn = d.nameEn
          formData.provinceName = d.provinceName
          formData.cityName = d.cityName
          formData.region = d.region
          formData.category = d.category
          formData.majorCount = d.majorCount
          formData.educationLevel = d.educationLevel || ''
          formData.nature = d.nature || ''
          formData.recommendationRate = d.recommendationRate ?? undefined
          formData.recommendationYear = d.recommendationYear ?? undefined
          formData.hasDoctorate = d.hasDoctorate
          formData.hasMaster = d.hasMaster
          formData.department = d.department || ''
          formData.tags = d.tags || []
          formData.famousUnion = d.famousUnion || ''
          formData.imageUrl = d.imageUrl || ''
          formData.introduction = d.introduction || ''
          detailFormData.address = d.address || ''
          detailFormData.admissionPhone = d.admissionPhone || ''
          detailFormData.website = d.website || ''
          detailFormData.historyGroupScore = d.historyGroupScore ?? undefined
          detailFormData.scienceGroupScore = d.scienceGroupScore ?? undefined
          detailFormData.carouselImagesStr = (d.carouselImages || []).join(',')
          detailFormData.detailIntroduction = d.detailIntroduction || ''
          detailFormData.rankings = {
            ruanke: d.rankings?.ruanke ?? undefined,
            xiaoyouhui: d.rankings?.xiaoyouhui ?? undefined,
            wushulian: d.rankings?.wushulian ?? undefined,
            qs: d.rankings?.qs ?? undefined,
            usnews: d.rankings?.usnews ?? undefined,
          }
          detailFormData.abroadRate = d.abroadRate || ''
          detailFormData.genderRatio = d.genderRatio || ''
        } else {
          dialogTitle.value = '院校详情'
          detailData.value = d
        }
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
  if (!formData.name || !formData.nameEn || !formData.provinceName || !formData.cityName || !formData.region || !formData.category) {
    ElMessage.warning('请填写完整的基础信息（带*字段）')
    return
  }

  try {
    let res: any
    if (dialogMode.value === 'add') {
      res = await addUniversity({ ...formData })
    } else if (dialogMode.value === 'edit' && currentId.value) {
      res = await updateUniversity(currentId.value, { ...formData, status: 1 })
      const detailPayload: UniversityDetailUpdateDTO = {
        address: detailFormData.address || undefined,
        admissionPhone: detailFormData.admissionPhone || undefined,
        website: detailFormData.website || undefined,
        historyGroupScore: detailFormData.historyGroupScore ?? undefined,
        scienceGroupScore: detailFormData.scienceGroupScore ?? undefined,
        carouselImages: detailFormData.carouselImagesStr ? detailFormData.carouselImagesStr.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        introduction: detailFormData.detailIntroduction || undefined,
        rankings: Object.values(detailFormData.rankings).some((v) => v !== undefined) ? detailFormData.rankings as Record<string, number> : undefined,
        abroadRate: detailFormData.abroadRate || undefined,
        genderRatio: detailFormData.genderRatio || undefined,
      }
      await updateUniversityDetail(currentId.value, detailPayload)
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

const handleToggleStatus = async (row: UniversityListVO) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定${actionText}该院校吗？`, '提示')
    const res = await updateUniversityStatus(row.id, { status: newStatus })
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
    await ElMessageBox.confirm('确定要下架该院校吗？', '提示')
    const res = await deleteUniversity(id)
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
    await ElMessageBox.confirm('确定要永久删除该院校吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteUniversity(id)
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
    ElMessage.warning('请先选择要下架的院校')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要下架选中的${selectedIds.value.length} 所院校吗？`, '提示')
    const res = await batchDeleteUniversity(selectedIds.value)
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
    ElMessage.warning('请先选择要永久删除的院校')
    return
  }
  try {
    await ElMessageBox.confirm(`确定要永久删除选中的${selectedIds.value.length} 所院校吗？此操作不可恢复！`, '警告', {
      type: 'warning',
      confirmButtonText: '确定永久删除',
      cancelButtonText: '取消',
    })
    const res = await batchHardDeleteUniversity(selectedIds.value)
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

const handleImport = async (importFn: (file: File) => Promise<AxiosResponse<R<void>>>) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const res = await importFn(file)
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
    <!-- 搜索栏-->
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="院校名称">
          <el-input
            v-model="queryParams.name"
            placeholder="模糊搜索"
            clearable
            style="width: 180px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="省份">
          <el-input
            v-model="queryParams.provinceName"
            placeholder="精确匹配"
            clearable
            style="width: 140px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="院校类别">
          <el-select
            v-model="queryParams.category"
            placeholder="全部"
            clearable
            style="width: 140px"
          >
            <el-option label="综合" value="综合" />
            <el-option label="理工" value="理工" />
            <el-option label="师范" value="师范" />
            <el-option label="农林" value="农林" />
            <el-option label="医药" value="医药" />
            <el-option label="财经" value="财经" />
            <el-option label="政法" value="政法" />
            <el-option label="体育" value="体育" />
            <el-option label="艺术" value="艺术" />
            <el-option label="民族" value="民族" />
            <el-option label="军事" value="军事" />
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

    <!-- 操作栏-->
    <div class="mb-4">
      <el-button type="primary" @click="openDialog('add')">新增院校</el-button>
      <el-button @click="handleImport(importUniversityMain)">导入主表</el-button>
      <el-button @click="handleImport(importUniversityDetail)">导入详情</el-button>
      <el-button :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量下架</el-button>
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
        <el-table-column prop="name" label="院校名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="provinceName" label="省份" width="100" />
        <el-table-column prop="cityName" label="城市" width="100" />
        <el-table-column prop="region" label="地区" width="90" />
        <el-table-column prop="category" label="类别" width="90" />
        <el-table-column prop="educationLevel" label="办学层次" width="100" />
        <el-table-column prop="nature" label="性质" width="80" />
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '展示' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="450" align="center" fixed="right">
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
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-loading="formLoading">
        <!-- 详情模式 -->
        <template v-if="dialogMode === 'detail' && detailData">
          <el-tabs>
            <el-tab-pane label="基础信息">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
                <el-descriptions-item label="院校名称">{{ detailData.name }}</el-descriptions-item>
                <el-descriptions-item label="英文名称">{{ detailData.nameEn }}</el-descriptions-item>
                <el-descriptions-item label="省份">{{ detailData.provinceName }}</el-descriptions-item>
                <el-descriptions-item label="城市">{{ detailData.cityName }}</el-descriptions-item>
                <el-descriptions-item label="地区">{{ detailData.region }}</el-descriptions-item>
                <el-descriptions-item label="院校类别">{{ detailData.category }}</el-descriptions-item>
                <el-descriptions-item label="专业数量">{{ detailData.majorCount }}</el-descriptions-item>
                <el-descriptions-item label="办学层次">{{ detailData.educationLevel || '-' }}</el-descriptions-item>
                <el-descriptions-item label="院校性质">{{ detailData.nature || '-' }}</el-descriptions-item>
                <el-descriptions-item label="推免率">
                  {{ detailData.recommendationRate != null ? detailData.recommendationRate + '%' : '-' }}
                  {{ detailData.recommendationYear ? '(' + detailData.recommendationYear + '年）' : '' }}
                </el-descriptions-item>
                <el-descriptions-item label="博士点">{{ detailData.hasDoctorate ? '有' : '无' }}</el-descriptions-item>
                <el-descriptions-item label="硕士点">{{ detailData.hasMaster ? '有' : '无' }}</el-descriptions-item>
                <el-descriptions-item label="隶属部门">{{ detailData.department || '-' }}</el-descriptions-item>
                <el-descriptions-item label="院校标签" :span="2">
                  <template v-if="detailData.tags && detailData.tags.length > 0">
                    <el-tag v-for="tag in detailData.tags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>
                  </template>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="知名联盟">{{ detailData.famousUnion || '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
                    {{ detailData.status === 1 ? '展示' : '下架' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="院校简介" :span="2">
                  <div class="max-h-40 overflow-y-auto">{{ detailData.introduction || '-' }}</div>
                </el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
            <el-tab-pane label="详细信息">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
                <el-descriptions-item label="招生电话">{{ detailData.admissionPhone || '-' }}</el-descriptions-item>
                <el-descriptions-item label="官方网站">{{ detailData.website || '-' }}</el-descriptions-item>
                <el-descriptions-item label="历史组分数线">{{ detailData.historyGroupScore ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="物理组分数线">{{ detailData.scienceGroupScore ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="出国比例">{{ detailData.abroadRate || '-' }}</el-descriptions-item>
                <el-descriptions-item label="男女比例">{{ detailData.genderRatio || '-' }}</el-descriptions-item>
                <el-descriptions-item label="软科排名">{{ detailData.rankings?.ruanke ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="校友会排名">{{ detailData.rankings?.xiaoyouhui ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="武书连排名">{{ detailData.rankings?.wushulian ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="QS排名">{{ detailData.rankings?.qs ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="USNEWS排名">{{ detailData.rankings?.usnews ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="轮播图片" :span="2">
                  <template v-if="detailData.carouselImages && detailData.carouselImages.length > 0">
                    <el-image
                      v-for="(img, idx) in detailData.carouselImages"
                      :key="idx"
                      :src="img"
                      style="width: 80px; height: 60px; margin-right: 8px; cursor: pointer"
                      :preview-src-list="detailData.carouselImages"
                      preview-teleported
                    />
                  </template>
                  <span v-else>-</span>
                </el-descriptions-item>
                <el-descriptions-item label="院校详细介绍" :span="2">
                  <div class="max-h-40 overflow-y-auto">{{ detailData.detailIntroduction || '-' }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- 新增/修改模式 -->
        <template v-if="dialogMode !== 'detail'">
          <el-tabs>
            <el-tab-pane label="基础信息">
              <el-form :model="formData" label-width="120px">
                <el-form-item label="院校名称" required>
                  <el-input v-model="formData.name" placeholder="请输入院校名称" maxlength="50" show-word-limit />
                </el-form-item>
                <el-form-item label="英文名称" required>
                  <el-input v-model="formData.nameEn" placeholder="请输入英文名称" maxlength="50" show-word-limit />
                </el-form-item>
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="省份" required>
                      <el-input v-model="formData.provinceName" placeholder="请输入" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="城市" required>
                      <el-input v-model="formData.cityName" placeholder="请输入" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="地区" required>
                      <el-select v-model="formData.region" placeholder="请选择" style="width: 100%">
                        <el-option label="华东" value="华东" />
                        <el-option label="华北" value="华北" />
                        <el-option label="华中" value="华中" />
                        <el-option label="华南" value="华南" />
                        <el-option label="西南" value="西南" />
                        <el-option label="西北" value="西北" />
                        <el-option label="东北" value="东北" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="院校类别" required>
                      <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
                        <el-option label="综合" value="综合" />
                        <el-option label="理工" value="理工" />
                        <el-option label="师范" value="师范" />
                        <el-option label="农林" value="农林" />
                        <el-option label="医药" value="医药" />
                        <el-option label="财经" value="财经" />
                        <el-option label="政法" value="政法" />
                        <el-option label="体育" value="体育" />
                        <el-option label="艺术" value="艺术" />
                        <el-option label="民族" value="民族" />
                        <el-option label="军事" value="军事" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="专业数量">
                      <el-input-number v-model="formData.majorCount" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="办学层次">
                      <el-select v-model="formData.educationLevel" placeholder="请选择" style="width: 100%">
                        <el-option label="本科" value="本科" />
                        <el-option label="专科" value="专科" />
                        <el-option label="本专兼招" value="本专兼招" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="院校性质">
                      <el-select v-model="formData.nature" placeholder="请选择" style="width: 100%">
                        <el-option label="公办" value="公办" />
                        <el-option label="民办" value="民办" />
                        <el-option label="中外合作" value="中外合作" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="推免率">
                      <el-input-number v-model="formData.recommendationRate" :min="0" :max="100" :precision="2" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="推免年份">
                      <el-input-number v-model="formData.recommendationYear" :min="2000" :max="2099" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="博士点">
                      <el-switch v-model="formData.hasDoctorate" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="硕士点">
                      <el-switch v-model="formData.hasMaster" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="隶属部门">
                      <el-select v-model="formData.department" placeholder="请选择" style="width: 100%">
                        <el-option label="教育部" value="教育部" />
                        <el-option label="省教育厅" value="省教育厅" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="院校标签">
                  <el-select
                    v-model="formData.tags"
                    multiple
                    filterable
                    allow-create
                    default-first-option
                    placeholder="输入标签后回车"
                    style="width: 100%"
                  >
                    <el-option label="985" value="985" />
                    <el-option label="211" value="211" />
                    <el-option label="双一流" value="双一流" />
                  </el-select>
                </el-form-item>
                <el-form-item label="知名联盟">
                  <el-input v-model="formData.famousUnion" placeholder="如：C9、华东五校" maxlength="50" />
                </el-form-item>
                <el-form-item label="院校图片">
                  <el-input v-model="formData.imageUrl" placeholder="图片URL地址" maxlength="500" />
                </el-form-item>
                <el-form-item label="院校简介">
                  <el-input v-model="formData.introduction" type="textarea" :rows="3" maxlength="5000" show-word-limit />
                </el-form-item>
              </el-form>
            </el-tab-pane>

            <el-tab-pane label="详细信息">
              <el-form :model="detailFormData" label-width="120px">
                <el-form-item label="地址">
                  <el-input v-model="detailFormData.address" placeholder="详细校区地址" maxlength="200" />
                </el-form-item>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="招生电话">
                      <el-input v-model="detailFormData.admissionPhone" maxlength="50" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="官方网站">
                      <el-input v-model="detailFormData.website" maxlength="500" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="历史组分数线">
                      <el-input-number v-model="detailFormData.historyGroupScore" :min="0" :max="750" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="物理组分数线">
                      <el-input-number v-model="detailFormData.scienceGroupScore" :min="0" :max="750" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="轮播图片">
                  <el-input
                    v-model="detailFormData.carouselImagesStr"
                    type="textarea"
                    :rows="2"
                    placeholder="多张图片URL用逗号分隔"
                  />
                </el-form-item>
                <el-form-item label="院校详细介绍">
                  <el-input v-model="detailFormData.detailIntroduction" type="textarea" :rows="3" maxlength="5000" show-word-limit />
                </el-form-item>

                <el-divider>排名信息</el-divider>
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="软科排名">
                      <el-input-number v-model="detailFormData.rankings.ruanke" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="校友会排名">
                      <el-input-number v-model="detailFormData.rankings.xiaoyouhui" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="武书连排名">
                      <el-input-number v-model="detailFormData.rankings.wushulian" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="QS排名">
                      <el-input-number v-model="detailFormData.rankings.qs" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="USNEWS排名">
                      <el-input-number v-model="detailFormData.rankings.usnews" :min="0" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="出国比例">
                      <el-input v-model="detailFormData.abroadRate" placeholder="如：30%" maxlength="10" />
                    </el-form-item>
                  </el-col>
                </el-row>
                <el-form-item label="男女比例">
                  <el-input v-model="detailFormData.genderRatio" placeholder="如：6:4" maxlength="10" style="width: 200px" />
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
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
