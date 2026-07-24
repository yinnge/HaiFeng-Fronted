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
  <div>
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
</template>
