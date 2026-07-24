<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getOrderPage,
  getOrderDetail,
  getOrderWechat,
  deleteOrder,
  hardDeleteOrder,
  restoreOrder,
} from '@/api/user/order'
import type { OrderListVO, OrderDetailVO, OrderQueryDTO } from '@/types/user/order'
import { MemberTypeLabel } from '@haifeng/shared'

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

const handleSearch = () => {
  queryParams.page = 1
  fetchData()
}

const handleReset = () => {
  queryParams.phone = ''
  queryParams.wechatId = ''
  queryParams.operatorName = ''
  queryParams.orderType = undefined
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

const openDetail = async (id: string) => {
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

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要禁用该订单吗？', '提示', { type: 'warning' })
    const res = await deleteOrder(id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '禁用失败')
    }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要恢复该订单吗？', '提示', { type: 'warning' })
    const res = await restoreOrder(id)
    if (res.data.code === 200) {
      ElMessage.success('恢复成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '恢复失败')
    }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: string) => {
  try {
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

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="模糊搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="queryParams.wechatId" placeholder="精准匹配" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="queryParams.operatorName" placeholder="模糊搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="订单类型">
          <el-select v-model="queryParams.orderType" placeholder="全部" clearable style="width: 120px">
            <el-option label="新开通" value="new" />
            <el-option label="续费升级" value="renewal" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="orderNo" label="订单号" width="180" show-overflow-tooltip />
        <el-table-column prop="memberName" label="会员名称" min-width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="wechatId" label="微信号" width="130">
          <template #default="{ row }">
            <span class="text-gray-400">{{ row.wechatId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderType" label="订单类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ orderTypeLabel[row.orderType] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="beforeType" label="变更前" width="100" align="center">
          <template #default="{ row }">{{ MemberTypeLabel[row.beforeType as keyof typeof MemberTypeLabel] }}</template>
        </el-table-column>
        <el-table-column prop="afterType" label="变更后" width="100" align="center">
          <template #default="{ row }">{{ MemberTypeLabel[row.afterType as keyof typeof MemberTypeLabel] }}</template>
        </el-table-column>
        <el-table-column prop="durationMonths" label="时长" width="80" align="center">
          <template #default="{ row }">{{ row.durationMonths }}个月</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>
            <el-button type="primary" link @click="handleViewWechatFromTable(row)">查看微信</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">禁用</el-button>
            <el-button type="success" link @click="handleRestore(row.id)">恢复</el-button>
            <el-button type="danger" link @click="handleHardDelete(row.id)">硬删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <el-dialog v-model="dialogVisible" title="订单详情" width="700px" :close-on-click-modal="false" @close="detailData = null">
      <div v-loading="formLoading">
        <template v-if="detailData">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="订单号">{{ detailData.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="会员名称">{{ detailData.memberName }}</el-descriptions-item>
            <el-descriptions-item label="会员ID">{{ detailData.memberId }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
            <el-descriptions-item label="微信号">
              <span>{{ wechatPlaintext || detailData.wechatId || '-' }}</span>
              <el-button v-if="detailData.wechatId && !wechatPlaintext" type="primary" link size="small" @click="handleViewWechat">查看明文</el-button>
            </el-descriptions-item>
            <el-descriptions-item label="订单类型">{{ orderTypeLabel[detailData.orderType] }}</el-descriptions-item>
            <el-descriptions-item label="变更前">{{ MemberTypeLabel[detailData.beforeType as keyof typeof MemberTypeLabel] }}</el-descriptions-item>
            <el-descriptions-item label="变更后">{{ MemberTypeLabel[detailData.afterType as keyof typeof MemberTypeLabel] }}</el-descriptions-item>
            <el-descriptions-item label="开通时长">{{ detailData.durationMonths }}个月</el-descriptions-item>
            <el-descriptions-item label="金额">¥{{ detailData.amount?.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="变更前到期">{{ detailData.beforeExpireAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="变更后到期">{{ detailData.afterExpireAt }}</el-descriptions-item>
            <el-descriptions-item label="操作人">{{ detailData.operatorName }}</el-descriptions-item>
            <el-descriptions-item label="操作人ID">{{ detailData.operatorId }}</el-descriptions-item>
            <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
