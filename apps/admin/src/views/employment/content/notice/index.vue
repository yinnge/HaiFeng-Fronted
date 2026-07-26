<script setup lang="ts">

import { ref, reactive, onMounted } from 'vue'

import { ElMessageBox, ElMessage } from 'element-plus'

import {

  getNoticePage,

  getNoticeDetail,

  updateNotice,

  deleteNotice,

  updateNoticeStatus,

  batchDeleteNotice,

} from '@/api/employment/notice'

import type {

  NoticeListVO,

  NoticeDetailVO,

  NoticeQueryDTO,

  NoticeUpdateDTO,

} from '@/types/employment/notice'

import { NoticeCategoryLabel, NoticeTypeOptions } from '@/types/employment/notice'



const loading = ref(false)

const tableData = ref<NoticeListVO[]>([])

const total = ref(0)

const selectedIds = ref<string[]>([])



const queryParams = reactive<NoticeQueryDTO>({

  page: 1,

  size: 10,

  title: undefined,

  noticeCategory: undefined,

  noticeType: undefined,

  province: undefined,

  city: undefined,

  year: undefined,

  isTop: undefined,

  isImportant: undefined,

})



const dialogVisible = ref(false)

const dialogMode = ref<'detail' | 'edit'>('detail')

const dialogTitle = ref('')

const formLoading = ref(false)

const currentId = ref<string | null>(null)

const detailData = ref<NoticeDetailVO | null>(null)



const formData = reactive<NoticeUpdateDTO>({

  noticeCategory: '',

  noticeType: '招聘公告',

  title: '',

  summary: '',

  content: '',

  province: '',

  city: '',

  tags: [],

  year: '',

  source: '',

  sourceUrl: '',

  publishDate: '',

  publishUnit: '',

  regStartDate: undefined,

  regEndDate: undefined,

  examTime: undefined,

  recruitmentCount: undefined,

  isTop: false,

  isImportant: false,

  sortOrder: 0,

})



const fetchData = async () => {

  loading.value = true

  try {

    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }

    if (queryParams.title) params.title = queryParams.title

    if (queryParams.noticeCategory) params.noticeCategory = queryParams.noticeCategory

    if (queryParams.noticeType) params.noticeType = queryParams.noticeType

    if (queryParams.province) params.province = queryParams.province

    if (queryParams.city) params.city = queryParams.city

    if (queryParams.year) params.year = queryParams.year

    if (queryParams.isTop !== undefined) params.isTop = queryParams.isTop

    if (queryParams.isImportant !== undefined) params.isImportant = queryParams.isImportant

    const res = await getNoticePage(params as NoticeQueryDTO)

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

  queryParams.noticeCategory = undefined

  queryParams.noticeType = undefined

  queryParams.province = undefined

  queryParams.city = undefined

  queryParams.year = undefined

  queryParams.isTop = undefined

  queryParams.isImportant = undefined

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



const handleSelectionChange = (rows: NoticeListVO[]) => {

  selectedIds.value = rows.map(r => r.id)

}



const openDetail = async (id: string) => {

  dialogMode.value = 'detail'

  dialogTitle.value = '公告详情'

  formLoading.value = true

  detailData.value = null

  try {

    const res = await getNoticeDetail(id)

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

  dialogTitle.value = '修改公告'

  currentId.value = id

  formLoading.value = true

  try {

    const res = await getNoticeDetail(id)

    if (res.data.code === 200) {

      const d = res.data.data

      formData.noticeCategory = d.noticeCategory

      formData.noticeType = d.noticeType

      formData.title = d.title

      formData.summary = d.summary || ''

      formData.content = d.content

      formData.province = d.province || ''

      formData.city = d.city || ''

      formData.tags = d.tags || []

      formData.year = d.year || ''

      formData.source = d.source || ''

      formData.sourceUrl = d.sourceUrl || ''

      formData.publishDate = d.publishDate

      formData.publishUnit = d.publishUnit || ''

      formData.regStartDate = d.regStartDate || undefined

      formData.regEndDate = d.regEndDate || undefined

      formData.examTime = d.examTime || undefined

      formData.recruitmentCount = d.recruitmentCount || undefined

      formData.isTop = d.isTop

      formData.isImportant = d.isImportant

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

  if (!formData.noticeCategory) {

    ElMessage.warning('请选择公告类别')

    return

  }

  if (!currentId.value) return



  try {

    const res = await updateNotice(currentId.value, { ...formData })

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



const handleToggleStatus = async (row: NoticeListVO) => {

  try {

    await ElMessageBox.confirm('确定禁用该公告？禁用后将从列表隐藏？', '提示', {

      confirmButtonText: '确定禁用',

      cancelButtonText: '取消',

    })

    const res = await updateNoticeStatus(row.id, { status: 0 })

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

    await ElMessageBox.confirm('确定要永久删除该公告？此操作不可恢复！', '警告', {

      type: 'warning',

      confirmButtonText: '确定删除',

      cancelButtonText: '取消',

    })

    const res = await deleteNotice(id)

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

    const res = await batchDeleteNotice(selectedIds.value)

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



const categoryLabel = (cat: string) => NoticeCategoryLabel[cat] || cat



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

        <el-form-item label="公告类别">

          <el-select v-model="queryParams.noticeCategory" placeholder="全部" clearable style="width: 140px">

            <el-option v-for="(label, key) in NoticeCategoryLabel" :key="key" :label="label" :value="key" />

          </el-select>

        </el-form-item>

        <el-form-item label="公告类型">

          <el-select v-model="queryParams.noticeType" placeholder="全部" clearable style="width: 140px">

            <el-option v-for="t in NoticeTypeOptions" :key="t" :label="t" :value="t" />

          </el-select>

        </el-form-item>

        <el-form-item label="省份">

          <el-input v-model="queryParams.province" placeholder="省份" clearable style="width: 120px" />

        </el-form-item>

        <el-form-item label="城市">

          <el-input v-model="queryParams.city" placeholder="城市" clearable style="width: 120px" />

        </el-form-item>

        <el-form-item label="年份">

          <el-select v-model="queryParams.year" placeholder="全部" clearable style="width: 110px">

            <el-option label="2026" value="2026" />

            <el-option label="2025" value="2025" />

            <el-option label="2024" value="2024" />

            <el-option label="2023" value="2023" />

            <el-option label="2022" value="2022" />

          </el-select>

        </el-form-item>

        <el-form-item label="置顶">

          <el-select v-model="queryParams.isTop" placeholder="全部" clearable style="width: 100px">

            <el-option label="区域" :value="true" />

            <el-option label="区域" :value="false" />

          </el-select>

        </el-form-item>

        <el-form-item label="重要">

          <el-select v-model="queryParams.isImportant" placeholder="全部" clearable style="width: 100px">

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

      <el-button v-if="selectedIds.length > 0" type="danger" @click="handleBatchDelete">批量硬删除</el-button>

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

        <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />

        <el-table-column label="公告类别" width="120">

          <template #default="{ row }">

            {{ categoryLabel(row.noticeCategory) }}

          </template>

        </el-table-column>

        <el-table-column prop="noticeType" label="公告类型" width="120" />

        <el-table-column prop="province" label="省份" width="110" />

        <el-table-column prop="city" label="城市" width="110" />

        <el-table-column prop="year" label="年份" width="80" align="center" />

        <el-table-column label="置顶" width="65" align="center">

          <template #default="{ row }">

            <el-tag v-if="row.isTop" type="warning" size="small">置顶</el-tag>

          </template>

        </el-table-column>

        <el-table-column label="重要" width="65" align="center">

          <template #default="{ row }">

            <el-tag v-if="row.isImportant" type="danger" size="small">重要</el-tag>

          </template>

        </el-table-column>

        <el-table-column prop="viewCount" label="阅读" width="70" align="center" />

        <el-table-column label="操作" width="280" align="center" fixed="right">

          <template #default="{ row }">

            <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>

            <el-button type="warning" link @click="openEdit(row.id)">修改</el-button>

            <el-button type="info" link @click="handleToggleStatus(row)">禁用</el-button>

            <el-button type="danger" link @click="handleDelete(row.id)">硬删除</el-button>

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

            <el-descriptions-item label="公告类别" :span="1">{{ categoryLabel(detailData.noticeCategory) }}</el-descriptions-item>

            <el-descriptions-item label="公告类型" :span="1">{{ detailData.noticeType }}</el-descriptions-item>

            <el-descriptions-item label="省份" :span="1">{{ detailData.province || '-' }}</el-descriptions-item>

            <el-descriptions-item label="城市" :span="1">{{ detailData.city || '-' }}</el-descriptions-item>

            <el-descriptions-item label="年份" :span="1">{{ detailData.year || '-' }}</el-descriptions-item>

            <el-descriptions-item label="来源" :span="1">{{ detailData.source || '-' }}</el-descriptions-item>

            <el-descriptions-item label="发布单位" :span="1">{{ detailData.publishUnit || '-' }}</el-descriptions-item>

            <el-descriptions-item label="来源链接" :span="1">

              <el-link v-if="detailData.sourceUrl" :href="detailData.sourceUrl" type="primary" target="_blank">查看原文</el-link>

              <span v-else>-</span>

            </el-descriptions-item>

            <el-descriptions-item label="发布日期" :span="1">{{ detailData.publishDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名开始" :span="1">{{ detailData.regStartDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="报名结束" :span="1">{{ detailData.regEndDate || '-' }}</el-descriptions-item>

            <el-descriptions-item label="考试时间" :span="1">{{ detailData.examTime || '-' }}</el-descriptions-item>

            <el-descriptions-item label="招录人数" :span="1">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>

            <el-descriptions-item label="置顶" :span="1">

              <el-tag v-if="detailData.isTop" type="warning" size="small">置顶</el-tag>

              <span v-else>无</span>

            </el-descriptions-item>

            <el-descriptions-item label="重要" :span="1">

              <el-tag v-if="detailData.isImportant" type="danger" size="small">重要</el-tag>

              <span v-else>无</span>

            </el-descriptions-item>

            <el-descriptions-item label="阅读量" :span="1">{{ detailData.viewCount }}</el-descriptions-item>

            <el-descriptions-item label="排序" :span="1">{{ detailData.sortOrder }}</el-descriptions-item>

            <el-descriptions-item label="标签" :span="2">

              <el-tag v-for="tag in detailData.tags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>

              <span v-if="!detailData.tags || detailData.tags.length === 0">-</span>

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

          <el-form :model="formData" label-width="110px">

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="公告类别" required>

                  <el-select v-model="formData.noticeCategory" placeholder="请选择" style="width: 100%">

                    <el-option v-for="(label, key) in NoticeCategoryLabel" :key="key" :label="label" :value="key" />

                  </el-select>

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="公告类型" required>

                  <el-select v-model="formData.noticeType" placeholder="请选择" style="width: 100%">

                    <el-option v-for="t in NoticeTypeOptions" :key="t" :label="t" :value="t" />

                  </el-select>

                </el-form-item>

              </el-col>

            </el-row>

            <el-form-item label="标题" required>

              <el-input v-model="formData.title" placeholder="请输入标题" maxlength="500" show-word-limit />

            </el-form-item>

            <el-form-item label="摘要">

              <el-input v-model="formData.summary" type="textarea" :rows="2" placeholder="请输入摘要" />

            </el-form-item>

            <el-form-item label="内容" required>

              <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入公告内容（支持 HTML）" />

            </el-form-item>

            <el-row :gutter="20">

              <el-col :span="8">

                <el-form-item label="省份">

                  <el-input v-model="formData.province" placeholder="省份" />

                </el-form-item>

              </el-col>

              <el-col :span="8">

                <el-form-item label="城市">

                  <el-input v-model="formData.city" placeholder="城市" />

                </el-form-item>

              </el-col>

              <el-col :span="8">

                <el-form-item label="年份">

                  <el-input v-model="formData.year" placeholder="年份" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="来源">

                  <el-input v-model="formData.source" placeholder="来源名称" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="原文链接">

                  <el-input v-model="formData.sourceUrl" placeholder="原文 URL" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="发布单位">

                  <el-input v-model="formData.publishUnit" placeholder="发布单位" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="发布日期">

                  <el-date-picker v-model="formData.publishDate" type="datetime" placeholder="选择日期" style="width: 100%" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="20">

              <el-col :span="8">

                <el-form-item label="报名开始">

                  <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />

                </el-form-item>

              </el-col>

              <el-col :span="8">

                <el-form-item label="报名结束">

                  <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名结束" style="width: 100%" />

                </el-form-item>

              </el-col>

              <el-col :span="8">

                <el-form-item label="考试时间">

                  <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-row :gutter="20">

              <el-col :span="12">

                <el-form-item label="招录人数">

                  <el-input-number v-model="formData.recruitmentCount" :min="0" style="width: 100%" />

                </el-form-item>

              </el-col>

              <el-col :span="12">

                <el-form-item label="排序">

                  <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />

                </el-form-item>

              </el-col>

            </el-row>

            <el-form-item label="标签">

              <el-select v-model="formData.tags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width: 100%">

                <el-option v-for="tag in formData.tags" :key="tag" :label="tag" :value="tag" />

              </el-select>

            </el-form-item>

            <el-form-item label="展示控制">

              <el-checkbox v-model="formData.isTop" label="置顶" border />

              <el-checkbox v-model="formData.isImportant" label="重要" border style="margin-left: 12px" />

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

