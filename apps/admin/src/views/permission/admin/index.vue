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
  <div class="admin-page">
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">管理员管理</div>
      <div class="page-subtitle">管理系统管理员账号及权限分配</div>
    </div>

    <div class="action-bar">
      <button type="button" class="add-btn" @click="handleAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增管理员
      </button>
    </div>

    <AdminSearch @search="handleSearch" @reset="handleReset" />

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

    <AdminDetailModal
      v-model:visible="showDetailModal"
      :admin-id="currentAdminId"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.admin-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

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

.action-bar {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.add-btn {
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
.add-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.add-btn:active {
  transform: translateY(0);
}
</style>
