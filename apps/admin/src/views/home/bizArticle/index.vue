<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getBizArticlePage,
  getBizArticleDetail,
  addBizArticle,
  updateBizArticle,
  deleteBizArticle,
} from '@/api/home/bizArticle'
import type {
  BizArticleListVO,
  BizArticleDetailVO,
  BizArticleQueryDTO,
  BizArticleAddDTO,
  BizArticleUpdateDTO,
  ArticleSearchParams,
  ArticleFormPayload,
} from '@/types/home/bizArticle'
import ArticleSearch from './components/ArticleSearch.vue'
import ArticleTable from './components/ArticleTable.vue'
import ArticleFormDialog from './components/ArticleFormDialog.vue'
import ArticleDetailDialog from './components/ArticleDetailDialog.vue'

const loading = ref(false)
const tableData = ref<BizArticleListVO[]>([])
const total = ref(0)

const queryParams = reactive<BizArticleQueryDTO>({
  page: 1,
  size: 10,
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getBizArticlePage(queryParams as BizArticleQueryDTO)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '获取列表失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: ArticleSearchParams) => {
  queryParams.moduleName = params.moduleName || undefined
  queryParams.province = params.province || undefined
  queryParams.year = params.year?.trim() ? Number(params.year.trim()) : undefined
  queryParams.columnName = params.columnName || undefined
  queryParams.title = params.title || undefined
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.moduleName = undefined
  queryParams.province = undefined
  queryParams.year = undefined
  queryParams.columnName = undefined
  queryParams.title = undefined
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

// 详情
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref<BizArticleDetailVO | null>(null)

const handleDetail = async (id: string) => {
  detailVisible.value = true
  detailLoading.value = true
  detailData.value = null
  try {
    const res = await getBizArticleDetail(id)
    if (res.data.code === 200) {
      detailData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const handleDetailClose = () => {
  detailData.value = null
}

// 新增/修改
const formVisible = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const formLoading = ref(false)
const currentId = ref<string | null>(null)
const initialFormData = ref<BizArticleDetailVO | null>(null)

const handleAdd = () => {
  formMode.value = 'add'
  currentId.value = null
  initialFormData.value = null
  formVisible.value = true
}

/** 修改：先取详情再开弹窗（富文本编辑器挂载时需要拿到 content） */
const handleEdit = async (id: string) => {
  try {
    const res = await getBizArticleDetail(id)
    if (res.data.code === 200) {
      initialFormData.value = res.data.data
      formMode.value = 'edit'
      currentId.value = id
      formVisible.value = true
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
  }
}

const handleSubmit = async (payload: ArticleFormPayload) => {
  formLoading.value = true
  try {
    let res: any
    if (formMode.value === 'add') {
      res = await addBizArticle(payload as BizArticleAddDTO)
    } else if (currentId.value) {
      res = await updateBizArticle(currentId.value, payload as BizArticleUpdateDTO)
    } else {
      return
    }
    if (res.data.code === 200) {
      ElMessage.success(formMode.value === 'add' ? '新增成功' : '修改成功')
      formVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  } finally {
    formLoading.value = false
  }
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该资讯吗？删除后将无法恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await deleteBizArticle(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      // 当前页删空后回退一页
      if (tableData.value.length === 1 && queryParams.page > 1) {
        queryParams.page -= 1
      }
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 取消
  }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="biz-article-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">热点资讯</div>
      <div class="page-subtitle">管理高考 / 考公 / 考研 / 中考 / 英语四六级五大模块的资讯文章</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="primary-btn" @click="handleAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增资讯
      </button>
      <button type="button" class="refresh-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <ArticleSearch @search="handleSearch" @reset="handleReset" />

    <ArticleTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <ArticleDetailDialog
      v-model:visible="detailVisible"
      :detail-data="detailData"
      :form-loading="detailLoading"
      @close="handleDetailClose"
    />

    <ArticleFormDialog
      v-model:visible="formVisible"
      :mode="formMode"
      :form-loading="formLoading"
      :initial-data="initialFormData"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.biz-article-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 枫叶水印 */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-right {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
  height: auto;
}

/* 页面标题 */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

/* 操作栏 */
.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.primary-btn:active {
  transform: translateY(0);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.refresh-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.refresh-btn:active {
  background: #f3f4f6;
}
</style>
