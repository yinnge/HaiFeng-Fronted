<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getExamGuidePage,

  getExamGuideDetail,

  updateExamGuide,

  deleteExamGuide,

  updateExamGuideStatus,

  batchDeleteExamGuide,

} from '@/api/employment/guide'

import type {

  ExamGuideListVO,

  ExamGuideDetailVO,

  ExamGuideQueryDTO,

  ExamGuideUpdateDTO,

} from '@/types/employment/guide'

import { GuideCategoryLabel, GuideTypeOptions } from '@/types/employment/guide'



const loading = ref(false)

const tableData = ref<ExamGuideListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<ExamGuideQueryDTO>({

  page: 1,

  size: 10,

  title: undefined,

  guideCategory: undefined,

  guideType: undefined,

  isTop: undefined,

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<ExamGuideDetailVO | null>(null)



const formData = reactive<ExamGuideUpdateDTO>({

  guideCategory: '',

  guideType: '备考攻略,

  title: '',

  subtitle: '',

  coverImage: '',

  iconClass: '',

  summary: '',

  content: '',

  tags: [],

  difficultyLevel: '',

  targetAudience: '',

  authorName: '',

  authorTitle: '',

  isTop: false,

  isRecommended: false,

  sortOrder: 0,

})



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.title) params.title = queryParams.title

    if (queryParams.guideCategory) params.guideCategory = queryParams.guideCategory

    if (queryParams.guideType) params.guideType = queryParams.guideType

    if (queryParams.isTop !== undefined) params.isTop = queryParams.isTop

    const res = await getExamGuidePage(params as ExamGuideQueryDTO)

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

  queryParams.title = undefined

  queryParams.guideCategory = undefined

  queryParams.guideType = undefined

  queryParams.isTop = undefined

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



const handleSelectionChange = (rows: ExamGuideListVO[]) => {

  selectedIds.value = rows.map(r => r.id)

}



const openDetail = async (id: string) => {

  dialogMode.value = 'detail'

  dialogTitle.value = '备考指南详情

  formLoading.value = true

  detailData.value = null

  try {

    const res = await getExamGuideDetail(id)

    if (res.data.code === 200) {

      detailData.value = res.data.data

    }

  } catch {

    ElMessage.error('获取详情失败')

  } finally {

    formLoading.value = false

  }

  dialogVisible.value = true

}



const openEdit = async (id: string) => {

  dialogMode.value = 'edit'

  dialogTitle.value = '修改备考指南

  currentId.value = id

  formLoading.value = true

  try {

    const res = await getExamGuideDetail(id)

    if (res.data.code === 200) {

      const d = res.data.data

      formData.guideCategory = d.guideCategory

      formData.guideType = d.guideType

      formData.title = d.title

      formData.subtitle = d.subtitle || ''

      formData.coverImage = d.coverImage || ''

      formData.iconClass = d.iconClass || ''

      formData.summary = d.summary || ''

      formData.content = d.content

      formData.tags = d.tags || []

      formData.difficultyLevel = d.difficultyLevel || ''

      formData.targetAudience = d.targetAudience || ''

      formData.authorName = d.authorName || ''

      formData.authorTitle = d.authorTitle || ''

      formData.isTop = d.isTop

      formData.isRecommended = d.isRecommended

      formData.sortOrder = d.sortOrder

    }

  } catch {

    ElMessage.error('获取详情失败')

  } finally {

    formLoading.value = false

  }

  dialogVisible.value = true

}



const handleSubmit = async () => {

  if (!formData.title || !formData.content) {

    ElMessage.warning('请填写标题和内容')

    return

  }

  if (!formData.guideCategory) {

    ElMessage.warning('请选择指南类别')

    return

  }

  if (!currentId.value) return



  try {

    const res = await updateExamGuide(currentId.value, { ...formData })

    if (res.data.code === 200) {

      ElMessage.success('修改成功')

      dialogVisible.value = false

      fetchData()

    } else {

      ElMessage.error(res.data.msg || '修改失败')

    }

  } catch {

    ElMessage.error('修改失败')

  }

}



const handleToggleStatus = async (row: ExamGuideListVO) => {

  try {

    await ElMessageBox.confirm('确定禁用该备考指南？禁用后将从列表隐藏, '提示', {

      confirmButtonText: '确定禁用',

      cancelButtonText: '取消',

    })

    const res = await updateExamGuideStatus(row.id, { status: 0 })

    if (res.data.code === 200) {

      ElMessage.success('禁用成功')

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

    await ElMessageBox.confirm('确定要永久删除该备考指南？此操作不可恢复！', '警告', {

      type: 'warning',

      confirmButtonText: '确定删除',

      cancelButtonText: '取消',

    })

    const res = await deleteExamGuide(id)

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

    ElMessage.warning('请先选择要删除的条目')

    return

  }

  try {

    await ElMessageBox.confirm(

      `确定要永久删除选中的${selectedIds.value.length} 条记录？此操作不可恢复！`,

      '警告',

      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' },

    )

    const res = await batchDeleteExamGuide(selectedIds.value)

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



const categoryLabel = (cat: string) => GuideCategoryLabel[cat] || cat



onMounted(() => {

  fetchData()

})

</script>



<template>

  <div>

    <div class="mb-4 rounded-lg bg-white p-5">

      <el-form :model="queryParams" inline>

        <el-form-item label="标题">

          <el-input v-model="queryParams.title" placeholder="标题模糊搜索" clearable style="width: 180px" @keyup.enter="handleSearch" />

        </el-form-item>

        <el-form-item label="指南类别">

          <el-select v-model="queryParams.guideCategory" placeholder="全部" clearable style="width: 140px">

            <el-option v-for="(label, key) in GuideCategoryLabel" :key="key" :label="label" :value="key" />

          </el-select>

        </el-form-item>

        <el-form-item label="指南类型">

          <el-select v-model="queryParams.guideType" placeholder="全部" clearable style="width: 140px">

            <el-option v-for="t in GuideTypeOptions" :key="t" :label="t" :value="t" />

          </el-select>

        </el-form-item>

        <el-form-item label="是否置顶">

          <el-select v-model="queryParams.isTop" placeholder="全部" clearable style="width: 120px">

            <el-option label="区域" :value="true" />

            <el-option label="区域" :value="false" />

          </el-select>

        </el-form-item>

        <el-form-item>

          <el-button type="primary" @click="handleSearch">查询</el-button>

          <el-button @click="handleReset">重置</el-button>

        </el-form-item>

      </el-form>

    </div>



    <div class="mb-4 flex items-center gap-2">

      <el-button @click="fetchData">刷新</el-button>

      <el-button v-if="selectedIds.length > 0" type="danger" @click="handleBatchDelete">批量硬删除/el-button>

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

        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />

        <el-table-column prop="subtitle" label="副标题 min-width="160" show-overflow-tooltip />

        <el-table-column label="指南类别" width="120">

          <template #default="{ row }">

            {{ categoryLabel(row.guideCategory) }}

          </template>

        </el-table-column>

        <el-table-column prop="guideType" label="指南类型" width="120" />

        <el-table-column label="置顶" width="70" align="center">

          <template #default="{ row }">

            <el-tag v-if="row.isTop" type="warning" size="small">置顶</el-tag>

          </template>

        </el-table-column>

        <el-table-column label="推荐" width="70" align="center">

          <template #default="{ row }">

            <el-tag v-if="row.isRecommended" type="danger" size="small">推荐</el-tag>

          </template>

        </el-table-column>

        <el-table-column prop="viewCount" label="阅读" width="70" align="center" />

        <el-table-column prop="likeCount" label="点赞" width="70" align="center" />

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>

            <el-button type="warning" link @click="openEdit(row.id)">修改</el-button>

            <el-button type="info" link @click="handleToggleStatus(row)">禁用</el-button>

            <el-button type="danger" link @click="handleDelete(row.id)">硬删除/el-button>

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



    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" :close-on-click-modal="false">

      <div v-loading="formLoading">

        <template v-if="dialogMode === 'detail' && detailData">

          <el-descriptions :column="2" border>

            <el-descriptions-item label="ID" :span="1">{{ detailData.id }}</el-descriptions-item>

            <el-descriptions-item label="标题" :span="1">{{ detailData.title }}</el-descriptions-item>

            <el-descriptions-item label="副标题 :span="1">{{ detailData.subtitle || '-' }}</el-descriptions-item>

            <el-descriptions-item label="指南类别" :span="1">{{ categoryLabel(detailData.guideCategory) }}</el-descriptions-item>

            <el-descriptions-item label="指南类型" :span="1">{{ detailData.guideType }}</el-descriptions-item>

            <el-descriptions-item label="难度" :span="1">{{ detailData.difficultyLevel || '-' }}</el-descriptions-item>

            <el-descriptions-item label="目标读者 :span="1">{{ detailData.targetAudience || '-' }}</el-descriptions-item>

            <el-descriptions-item label="作品" :span="1">{{ detailData.authorName || '-' }}</el-descriptions-item>

            <el-descriptions-item label="作者头像 :span="1">{{ detailData.authorTitle || '-' }}</el-descriptions-item>

            <el-descriptions-item label="置顶" :span="1">

              <el-tag v-if="detailData.isTop" type="warning" size="small">置顶</el-tag>

              <span v-else>无</span>

            </el-descriptions-item>

            <el-descriptions-item label="推荐" :span="1">

              <el-tag v-if="detailData.isRecommended" type="danger" size="small">推荐</el-tag>

              <span v-else>无</span>

            </el-descriptions-item>

            <el-descriptions-item label="阅读量 :span="1">{{ detailData.viewCount }}</el-descriptions-item>

            <el-descriptions-item label="点赞量 :span="1">{{ detailData.likeCount }}</el-descriptions-item>

            <el-descriptions-item label="排序" :span="1">{{ detailData.sortOrder }}</el-descriptions-item>

            <el-descriptions-item label="标签" :span="1">

              <el-tag v-for="tag in detailData.tags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>

              <span v-if="!detailData.tags || detailData.tags.length === 0">-</span>

            </el-descriptions-item>

            <el-descriptions-item label="封面 :span="2">

              <el-image v-if="detailData.coverImage" :src="detailData.coverImage" style="max-height: 120px" fit="contain" />

              <span v-else>-</span>

            </el-descriptions-item>

            <el-descriptions-item label="摘要" :span="2">{{ detailData.summary || '-' }}</el-descriptions-item>

            <el-descriptions-item label="内容" :span="2">

              <div class="max-h-80 overflow-y-auto border rounded p-2" v-html="detailData.content" />

            </el-descriptions-item>

            <el-descriptions-item label="创建时间" :span="1">{{ detailData.createdAt }}</el-descriptions-item>

            <el-descriptions-item label="更新时间" :span="1">{{ detailData.updatedAt }}</el-descriptions-item>

          </el-descriptions>

        </template>



        <template v-if="dialogMode === 'edit'">

          <el-form :model="formData" label-width="100px">

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="指南类别" required>

                  <el-select v-model="formData.guideCategory" placeholder="请选择" style="width: 100%">

                    <el-option v-for="(label, key) in GuideCategoryLabel" :key="key" :label="label" :value="key" />

                  </el-select>

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="指南类型" required>

                  <el-select v-model="formData.guideType" placeholder="请选择" style="width: 100%">

                    <el-option v-for="t in GuideTypeOptions" :key="t" :label="t" :value="t" />

                  </el-select>

                </el-form-item>

              </el-col>

            </el-row>

            <el-form-item label="标题" required>

              <el-input v-model="formData.title" placeholder="请输入标题 maxlength="300" show-word-limit />

            </el-form-item>

            <el-form-item label="副标题>

              <el-input v-model="formData.subtitle" placeholder="请输入副标题" />

            </el-form-item>

            <el-form-item label="封面>

              <el-input v-model="formData.coverImage" placeholder="封面图片 URL" />

            </el-form-item>

            <el-form-item label="图标>

              <el-input v-model="formData.iconClass" placeholder="Font Awesome 类名" />

            </el-form-item>

            <el-form-item label="摘要">

              <el-input v-model="formData.summary" type="textarea" :rows="2" placeholder="请输入摘要 />

            </el-form-item>

            <el-form-item label="内容" required>

              <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入详细内容（支持 HTML />

            </el-form-item>

            <el-row :gutter="20">

              <el-col :span="8">

                <el-form-item label="难度">

                  <el-select v-model="formData.difficultyLevel" placeholder="请选择" clearable style="width: 100%">

                    <el-option label="入门" value="入门" />

                    <el-option label="进阶" value="进阶" />

                    <el-option label="高阶" value="高阶" />

                  </el-select>

                </el-form-item>

              </el-col>

              <el-col :span="8">

                <el-form-item label="目标读者>

                  <el-input v-model="formData.targetAudience" placeholder="目标读者 />

                </el-form-item>

              </el-col>

              <el-col :span="8">

                <el-form-item label="排序">

                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="作者名">

                  <el-input v-model="formData.authorName" placeholder="作者名" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="作者头像>

                  <el-input v-model="formData.authorTitle" placeholder="作者头像 />

                </el-form-item>

              </el-col>

            </el-row>

            <el-form-item label="标签">

              <el-select v-model="formData.tags" multiple filterable allow-create default-first-option placeholder="输入标签后回车 style="width: 100%">

                <el-option v-for="tag in formData.tags" :key="tag" :label="tag" :value="tag" />

              </el-select>

            </el-form-item>

            <el-form-item label="展示控制">

              <el-checkbox v-model="formData.isTop" label="置顶" border />

              <el-checkbox v-model="formData.isRecommended" label="编辑推荐" border style="margin-left: 12px" />

            </el-form-item>

          </el-form>

        </template>

      </div>



      <template #footer>

        <el-button @click="dialogVisible = false">

          {{ dialogMode === 'detail' ? '关闭' : '取消' }}

        </el-button>

        <el-button v-if="dialogMode !== 'detail'" type="primary" @click="handleSubmit">确定</el-button>

      </template>

    </el-dialog>

  </div>

</template>

