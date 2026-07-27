<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getLogPage } from '@/api/system/log'
import type { AdminLogListVO, AdminLogQueryDTO } from '@/types/system/log'
import LogSearch from './components/LogSearch.vue'
import LogTable from './components/LogTable.vue'
import LogDetailModal from './components/LogDetailModal.vue'

const loading = ref(false)
const tableData = ref<AdminLogListVO[]>([])
const total = ref(0)

const queryParams = reactive<AdminLogQueryDTO>({
  page: 1,
  size: 10,
  adminName: '',
  result: undefined,
  requestMethod: undefined,
})

const showDetailModal = ref(false)
const currentLogId = ref<string | undefined>()

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getLogPage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取操作日志失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: AdminLogQueryDTO) => {
  queryParams.adminName = params.adminName
  queryParams.result = params.result
  queryParams.requestMethod = params.requestMethod
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.adminName = ''
  queryParams.result = undefined
  queryParams.requestMethod = undefined
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

const handleDetail = (id: string) => {
  currentLogId.value = id
  showDetailModal.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div v-loading="loading" class="log-page">
    <div class="log-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">操作日志</h1>
        <p class="page-subtitle">查看系统操作记录和管理员行为日志</p>
      </div>

      <LogSearch @search="handleSearch" @reset="handleReset" />

      <LogTable
        :data="tableData"
        :loading="loading"
        :total="total"
        :page="queryParams.page"
        :size="queryParams.size"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @detail="handleDetail"
        @refresh="fetchData"
      />

      <LogDetailModal
        v-model:visible="showDetailModal"
        :log-id="currentLogId"
      />
    </div>

    <!-- 品牌装饰：枫叶水印 -->
    <div class="brand-watermark brand-watermark-1"></div>
    <div class="brand-watermark brand-watermark-2"></div>
  </div>
</template>

<style scoped>
.log-page {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(255, 247, 237, 0.6) 0%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 247, 237, 0.3) 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.log-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* 品牌装饰：枫叶水印 */
.brand-watermark {
  position: absolute;
  width: 300px;
  height: 300px;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

.brand-watermark-1 {
  top: -50px;
  right: -50px;
  background-image: url('@/assets/images/logo-main.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.brand-watermark-2 {
  bottom: -80px;
  left: -80px;
  background-image: url('@/assets/images/logo-main.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transform: rotate(15deg);
}
</style>
