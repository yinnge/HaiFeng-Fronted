<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getCommissionPage } from '@/api/user/commission'
import type { CommissionListVO, CommissionQueryDTO } from '@/types/user/commission'
import CommissionSearch from './components/CommissionSearch.vue'
import CommissionTable from './components/CommissionTable.vue'
import CommissionDetailModal from './components/CommissionDetailModal.vue'

const loading = ref(false)
const tableData = ref<CommissionListVO[]>([])
const total = ref(0)

const queryParams = reactive<CommissionQueryDTO>({
  page: 1,
  size: 10,
  referrerPhone: '',
  referrerName: '',
  refereePhone: '',
  refereeName: '',
  orderNo: '',
  status: null,
})

const dialogVisible = ref(false)
const detailData = ref<CommissionListVO | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.referrerPhone) params.referrerPhone = queryParams.referrerPhone
    if (queryParams.referrerName) params.referrerName = queryParams.referrerName
    if (queryParams.refereePhone) params.refereePhone = queryParams.refereePhone
    if (queryParams.refereeName) params.refereeName = queryParams.refereeName
    if (queryParams.orderNo) params.orderNo = queryParams.orderNo
    if (queryParams.status) params.status = queryParams.status
    const res = await getCommissionPage(params as CommissionQueryDTO)
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

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.referrerPhone = ''
  queryParams.referrerName = ''
  queryParams.refereePhone = ''
  queryParams.refereeName = ''
  queryParams.orderNo = ''
  queryParams.status = null
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

const openDetail = (row: CommissionListVO) => {
  detailData.value = row
  dialogVisible.value = true
}

onMounted(() => {
  fetchData()
})
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
        <h1 class="page-title">佣金管理</h1>
        <p class="page-subtitle">查看和管理用户推荐佣金记录</p>
      </div>
    </div>

    <CommissionSearch
      :model-value="queryParams"
      @update:model-value="Object.assign(queryParams, $event)"
      @search="handleSearch"
      @reset="handleReset"
    />

    <CommissionTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @detail="openDetail"
      @refresh="fetchData"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <CommissionDetailModal
      v-model:visible="dialogVisible"
      :data="detailData"
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
