<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getOrderPage,
  getOrderDetail,
  getOrderWechat,
  hardDeleteOrder,
  confirmOrder,
  cancelOrder,
  revokeOrder,
} from '@/api/user/order'
import type { OrderListVO, OrderDetailVO, OrderQueryDTO } from '@/types/user/order'
import OrderSearch from './components/OrderSearch.vue'
import OrderTable from './components/OrderTable.vue'
import OrderDetailModal from './components/OrderDetailModal.vue'

const loading = ref(false)
const tableData = ref<OrderListVO[]>([])
const total = ref(0)

const queryParams = reactive<OrderQueryDTO>({
  page: 1,
  size: 10,
  phone: '',
  wechatId: '',
  operatorName: '',
  orderType: undefined,
  orderStatus: undefined,
})

const dialogVisible = ref(false)
const formLoading = ref(false)
const detailData = ref<OrderDetailVO | null>(null)
const wechatPlaintext = ref<string | null>(null)

const orderTypeLabel: Record<string, string> = {
  new: '新开通',
  renewal: '续费升级',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.phone) params.phone = queryParams.phone
    if (queryParams.wechatId) params.wechatId = queryParams.wechatId
    if (queryParams.operatorName) params.operatorName = queryParams.operatorName
    if (queryParams.orderType) params.orderType = queryParams.orderType
    if (queryParams.orderStatus) params.orderStatus = queryParams.orderStatus
    const res = await getOrderPage(params as OrderQueryDTO)
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

const handleSearch = (params: OrderQueryDTO) => {
  queryParams.phone = params.phone
  queryParams.wechatId = params.wechatId
  queryParams.operatorName = params.operatorName
  queryParams.orderType = params.orderType
  queryParams.orderStatus = params.orderStatus
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.phone = ''
  queryParams.wechatId = ''
  queryParams.operatorName = ''
  queryParams.orderType = undefined
  queryParams.orderStatus = undefined
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

const handleDetail = async (id: string) => {
  wechatPlaintext.value = null
  formLoading.value = true
  dialogVisible.value = true
  try {
    const res = await getOrderDetail(id)
    if (res.data.code === 200) {
      detailData.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取详情失败')
    }
  } catch {
    ElMessage.error('获取详情失败')
  } finally {
    formLoading.value = false
  }
}

const handleViewWechat = async () => {
  if (!detailData.value) return
  try {
    const res = await getOrderWechat(detailData.value.id)
    if (res.data.code === 200) {
      wechatPlaintext.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch {
    ElMessage.error('获取微信号失败')
  }
}

const handleHardDelete = async (id: string) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm('确定要永久删除该订单吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteOrder(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const handleViewWechatFromTable = async (row: OrderListVO) => {
  try {
    const res = await getOrderWechat(row.id)
    if (res.data.code === 200) {
      ElMessage.success(`微信号: ${res.data.data}`)
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch {
    ElMessage.error('获取微信号失败')
  }
}

const handleConfirm = async (id: string) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm('确认用户已付款？确认后将自动升级会员。', '确认支付', { type: 'warning' })
    const res = await confirmOrder(id)
    if (res.data.code === 200) {
      ElMessage.success('已确认支付，会员升级成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '确认失败')
    }
  } catch { /* 取消 */ }
}

const handleCancel = async (id: string) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', { type: 'warning' })
    const res = await cancelOrder(id)
    if (res.data.code === 200) {
      ElMessage.success('订单已取消')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '取消失败')
    }
  } catch { /* 取消 */ }
}

const handleRevoke = async (id: string) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    const { value: remark } = await ElMessageBox.prompt('请输入撤销原因', '撤销订单', {
      type: 'warning',
      inputPlaceholder: '撤销原因（选填）',
      inputValidator: () => true,
    })
    const res = await revokeOrder(id, remark || undefined)
    if (res.data.code === 200) {
      ElMessage.success('订单已撤销，会员已回退')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '撤销失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="order-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>
    <div class="watermark-right">
      <img src="@/assets/images/logo-main.png" alt="" />
    </div>

    <div class="page-header">
      <div class="page-title">订单管理</div>
      <div class="page-subtitle">查看用户订单记录及变更详情</div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <button type="button" class="refresh-btn" @click="fetchData">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
    </div>

    <OrderSearch @search="handleSearch" @reset="handleReset" />

    <OrderTable
      :data="tableData"
      :loading="loading"
      :total="total"
      :page="queryParams.page"
      :size="queryParams.size"
      :order-type-label="orderTypeLabel"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @detail="handleDetail"
      @wechat="handleViewWechatFromTable"
      @confirm="handleConfirm"
      @cancel="handleCancel"
      @revoke="handleRevoke"
      @hard-delete="handleHardDelete"
    />

    <OrderDetailModal
      v-model:visible="dialogVisible"
      :detail-data="detailData"
      :form-loading="formLoading"
      :wechat-plaintext="wechatPlaintext"
      @view-wechat="handleViewWechat"
      @close="detailData = null"
    />
  </div>
</template>

<style scoped>
.order-page {
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

.refresh-btn {
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
.refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}
.refresh-btn:active {
  transform: translateY(0);
}
</style>
