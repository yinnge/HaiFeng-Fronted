<!-- apps/admin/src/views/permission/admin/index.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getAdminPage } from '@/api/permission/admin'
import type { AdminVO, AdminQueryDTO } from '@/types/permission/admin'
import AdminSearch from './components/AdminSearch.vue'
import AdminTable from './components/AdminTable.vue'
import AdminDetailModal from './components/AdminDetailModal.vue'

const loading = ref(false)
const tableData = ref<AdminVO[]>([])
const total = ref(0)

const queryParams = reactive<AdminQueryDTO>({
  page: 1,
  size: 10,
  username: '',
  phone: '',
  realName: '',
  status: undefined,
})

const showDetailModal = ref(false)
const currentAdminId = ref<string | undefined>()

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAdminPage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取管理员列表失败', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = (params: AdminQueryDTO) => {
  queryParams.username = params.username
  queryParams.phone = params.phone
  queryParams.realName = params.realName
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.username = ''
  queryParams.phone = ''
  queryParams.realName = ''
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

const handleAdd = () => {
  currentAdminId.value = undefined
  showDetailModal.value = true
}

const handleDetail = (id: string) => {
  currentAdminId.value = id
  showDetailModal.value = true
}

const handleSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <AdminSearch @search="handleSearch" @reset="handleReset" />

    <div class="bg-white rounded-lg p-5">
      <div class="mb-4">
        <el-button type="primary" @click="handleAdd">+ 新增管理员</el-button>
      </div>

      <AdminTable
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
    </div>

    <AdminDetailModal
      v-model:visible="showDetailModal"
      :admin-id="currentAdminId"
      @success="handleSuccess"
    />
  </div>
</template>
