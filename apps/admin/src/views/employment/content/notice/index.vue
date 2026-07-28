<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getNoticePage,
  deleteNotice,
  updateNoticeStatus,
  batchDeleteNotice,
} from '@/api/employment/notice'
import type { NoticeListVO, NoticeQueryDTO } from '@/types/employment/notice'
import NoticeSearch from './components/NoticeSearch.vue'
import NoticeTable from './components/NoticeTable.vue'
import NoticeDialog from './components/NoticeDialog.vue'

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
const currentId = ref<string | null>(null)

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

const handleSearch = () => { queryParams.page = 1; fetchData() }

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

const handlePageChange = (page: number) => { queryParams.page = page; fetchData() }
const handleSizeChange = (size: number) => { queryParams.size = size; queryParams.page = 1; fetchData() }

const handleSelectionChange = (rows: NoticeListVO[]) => {
  selectedIds.value = rows.map(r => r.id)
}

const openDetail = (id: string) => {
  dialogMode.value = 'detail'
  currentId.value = id
  dialogVisible.value = true
}

const openEdit = (id: string) => {
  dialogMode.value = 'edit'
  currentId.value = id
  dialogVisible.value = true
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
  } catch { /* cancel */ }
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) { ElMessage.warning('请先选择要删除的条目'); return }
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
  } catch { /* cancel */ }
}

const handleDisable = async (row: NoticeListVO) => {
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
  } catch { /* cancel */ }
}

onMounted(() => { fetchData() })
</script>

<template>
  <div class="page-wrapper">
    <div class="watermark-top-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-bottom-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title-group">
        <h1 class="page-title">公告管理</h1>
        <p class="page-subtitle">管理招聘公告、政策通知等内容</p>
      </div>
    </div>

    <NoticeSearch
      :title="queryParams.title"
      :notice-category="queryParams.noticeCategory"
      :notice-type="queryParams.noticeType"
      :province="queryParams.province"
      :city="queryParams.city"
      :year="queryParams.year"
      :is-top="queryParams.isTop"
      :is-important="queryParams.isImportant"
      @update:title="queryParams.title = $event"
      @update:notice-category="queryParams.noticeCategory = $event"
      @update:notice-type="queryParams.noticeType = $event"
      @update:province="queryParams.province = $event"
      @update:city="queryParams.city = $event"
      @update:year="queryParams.year = $event"
      @update:is-top="queryParams.isTop = $event"
      @update:is-important="queryParams.isImportant = $event"
      @search="handleSearch"
      @reset="handleReset"
    />

    <NoticeTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :selected-ids="selectedIds"
      @detail="openDetail"
      @edit="openEdit"
      @delete="handleDelete"
      @disable="handleDisable"
      @batch-delete="handleBatchDelete"
      @refresh="fetchData"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <NoticeDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :current-id="currentId"
      @saved="fetchData"
    />
  </div>
</template>

<style scoped>
.page-wrapper {
  position: relative;
  min-height: calc(100vh - 120px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px 32px 40px;
  overflow: hidden;
}

.watermark-top-right {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 320px;
  height: 320px;
  opacity: 0.05;
  pointer-events: none;
}

.watermark-bottom-left {
  position: absolute;
  bottom: -30px;
  left: -30px;
  width: 320px;
  height: 320px;
  opacity: 0.05;
  pointer-events: none;
}

.watermark-top-right img,
.watermark-bottom-left img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
}
</style>
