<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getUserPage } from '@/api/user'
import { getSystemSettings } from '@/api/system/settings'
import type { MemberListVO, MemberQueryDTO } from '@/types/user'
import UserSearch from './components/UserSearch.vue'
import UserTable from './components/UserTable.vue'
import UserDetailModal from './components/UserDetailModal.vue'
import UserUpgradeModal from './components/UserUpgradeModal.vue'

const loading = ref(false)
const tableData = ref<MemberListVO[]>([])
const total = ref(0)

const queryParams = reactive<MemberQueryDTO>({
  page: 1,
  size: 10,
  phone: '',
  inviteCode: '',
  memberType: undefined,
  status: undefined,
  wechatId: '',
})

const showDetailModal = ref(false)
const showUpgradeModal = ref(false)
const currentUser = ref<MemberListVO | null>(null)

const proPrice = ref(199)
const vipPrice = ref(599)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserPage(queryParams)
    if (res.data.code === 200) {
      tableData.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchPrices = async () => {
  try {
    const res = await getSystemSettings()
    if (res.data.code === 200) {
      proPrice.value = res.data.data.proPrice || 199
      vipPrice.value = res.data.data.vipPrice || 599
    }
  } catch (error) {
    console.error('获取价格配置失败:', error)
  }
}

const handleSearch = (params: MemberQueryDTO) => {
  queryParams.phone = params.phone
  queryParams.inviteCode = params.inviteCode
  queryParams.memberType = params.memberType
  queryParams.status = params.status
  queryParams.wechatId = params.wechatId
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.phone = ''
  queryParams.inviteCode = ''
  queryParams.memberType = undefined
  queryParams.status = undefined
  queryParams.wechatId = ''
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

const handleDetail = (row: MemberListVO) => {
  currentUser.value = row
  showDetailModal.value = true
}

const handleUpgrade = (row: MemberListVO) => {
  currentUser.value = row
  showUpgradeModal.value = true
}

const handleUpgradeSuccess = () => {
  fetchData()
}

onMounted(() => {
  fetchData()
  fetchPrices()
})
</script>

<template>
  <div class="user-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">用户管理</div>
      <div class="page-subtitle">查看用户信息及会员状态</div>
    </div>

    <UserSearch @search="handleSearch" @reset="handleReset" />

    <UserTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @upgrade="handleUpgrade"
      @refresh="fetchData"
    />

    <UserDetailModal
      v-model:visible="showDetailModal"
      :user="currentUser"
    />

    <UserUpgradeModal
      v-model:visible="showUpgradeModal"
      :user="currentUser"
      :pro-price="proPrice"
      :vip-price="vipPrice"
      @success="handleUpgradeSuccess"
    />
  </div>
</template>

<style scoped>
.user-page {
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
</style>
