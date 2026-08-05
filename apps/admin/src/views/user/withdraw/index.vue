<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getWithdrawPage } from '@/api/user/withdraw'
import type { WithdrawListVO, WithdrawQueryDTO } from '@/types/user/withdraw'
import WithdrawSearch from './components/WithdrawSearch.vue'
import WithdrawTable from './components/WithdrawTable.vue'
import WithdrawDetailModal from './components/WithdrawDetailModal.vue'
import WithdrawProcessModal from './components/WithdrawProcessModal.vue'

const route = useRoute()

const loading = ref(false)
const tableData = ref<WithdrawListVO[]>([])
const total = ref(0)

const queryParams = reactive<WithdrawQueryDTO>({
  page: 1,
  size: 10,
  memberName: '',
  phone: '',
  wechatId: '',
  status: undefined,
})

const showDetailModal = ref(false)
const detailRow = ref<WithdrawListVO | null>(null)
const showProcessModal = ref(false)
const processId = ref<string | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.memberName) params.memberName = queryParams.memberName
    if (queryParams.phone) params.phone = queryParams.phone
    if (queryParams.wechatId) params.wechatId = queryParams.wechatId
    if (queryParams.status) params.status = queryParams.status
    const res = await getWithdrawPage(params as WithdrawQueryDTO)
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

const handleSearch = (params: WithdrawQueryDTO) => {
  queryParams.memberName = params.memberName
  queryParams.phone = params.phone
  queryParams.wechatId = params.wechatId
  queryParams.status = params.status
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.memberName = ''
  queryParams.phone = ''
  queryParams.wechatId = ''
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

const handleDetail = (row: WithdrawListVO) => {
  detailRow.value = row
  showDetailModal.value = true
}

const handleProcess = (row: WithdrawListVO) => {
  processId.value = row.id
  showProcessModal.value = true
}

const handleSuccess = () => {
  fetchData()
}

onMounted(() => {
  const statusQuery = route.query.status as string | undefined
  if (statusQuery && ['pending', 'paid', 'rejected'].includes(statusQuery)) {
    queryParams.status = statusQuery as WithdrawQueryDTO['status']
  }
  fetchData()
})
</script>

<template>
  <div class="withdraw-page">
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">提现管理</div>
      <div class="page-subtitle">管理用户提现申请与打款处理</div>
    </div>

    <WithdrawSearch @search="handleSearch" @reset="handleReset" />

    <WithdrawTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @process="handleProcess"
      @refresh="fetchData"
    />

    <WithdrawDetailModal
      v-model:visible="showDetailModal"
      :data="detailRow"
    />

    <WithdrawProcessModal
      v-model:visible="showProcessModal"
      :withdraw-id="processId"
      @success="handleSuccess"
    />
  </div>
</template>

<style scoped>
.withdraw-page {
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
</style>
