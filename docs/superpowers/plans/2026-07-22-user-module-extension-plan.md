# 用户管理模块扩展 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有用户管理模块下扩展4个子页面：订单管理、佣金管理、通知管理、提现管理，支持分页查询、详情查看、软删除/恢复/硬删除、微信明文查看、提现处理、群发公告等操作。

**Architecture:** 每个子模块独立页面 + 独立 API 层 + 独立类型定义，复用现有 `home/announcement` 的搜索栏+操作栏+表格+弹窗 4段式模式。路由保持 `/user` 路径前缀，5个子路由平铺。

**Tech Stack:** Vue 3 Composition API, Element Plus, TypeScript, Pinia

---

## 文件清单

### 新建文件

| 文件 | 说明 |
|------|------|
| `apps/admin/src/types/user/order.ts` | 订单类型定义 |
| `apps/admin/src/types/user/commission.ts` | 佣金类型定义 |
| `apps/admin/src/types/user/notification.ts` | 通知类型定义 |
| `apps/admin/src/types/user/withdraw.ts` | 提现类型定义 |
| `apps/admin/src/api/user/order.ts` | 订单 API |
| `apps/admin/src/api/user/commission.ts` | 佣金 API |
| `apps/admin/src/api/user/notification.ts` | 通知 API |
| `apps/admin/src/api/user/withdraw.ts` | 提现 API |
| `apps/admin/src/views/user/order/index.vue` | 订单管理页 |
| `apps/admin/src/views/user/commission/index.vue` | 佣金管理页 |
| `apps/admin/src/views/user/notification/index.vue` | 通知管理页 |
| `apps/admin/src/views/user/withdraw/index.vue` | 提现管理页 |

### 修改文件

| 文件 | 说明 |
|------|------|
| `apps/admin/src/router/modules/user.ts` | 添加4个新子路由 |

---

### Task 1: 定义4个新子模块的类型

**Files:**
- Create: `apps/admin/src/types/user/order.ts`
- Create: `apps/admin/src/types/user/commission.ts`
- Create: `apps/admin/src/types/user/notification.ts`
- Create: `apps/admin/src/types/user/withdraw.ts`

- [ ] **Step 1: 创建订单类型**

```typescript
// apps/admin/src/types/user/order.ts
import type { BasePageQuery } from '@haifeng/shared'

export interface OrderListVO {
  id: number
  orderNo: string
  memberName: string
  phone: string
  wechatId: string
  orderType: 'new' | 'renewal'
  beforeType: 'normal' | 'pro' | 'vip'
  afterType: 'normal' | 'pro' | 'vip'
  durationMonths: number
  amount: number
  createdAt: string
}

export interface OrderDetailVO extends OrderListVO {
  memberId: number
  beforeExpireAt: string | null
  afterExpireAt: string
  operatorId: number
  operatorName: string
  remark: string | null
  updatedAt: string
}

export interface OrderQueryDTO extends BasePageQuery {
  phone?: string
  wechatId?: string
  operatorName?: string
  orderType?: 'new' | 'renewal'
}
```

- [ ] **Step 2: 创建佣金类型**

```typescript
// apps/admin/src/types/user/commission.ts
import type { BasePageQuery } from '@haifeng/shared'

export interface CommissionListVO {
  id: number
  referrerName: string
  referrerPhone: string
  refereeName: string
  refereePhone: string
  orderId: number
  orderAmount: number
  commissionRate: number
  commissionAmount: number
  createdAt: string
}

export interface CommissionQueryDTO extends BasePageQuery {
  referrerPhone?: string
  referrerName?: string
  refereePhone?: string
  refereeName?: string
  orderNo?: string
}
```

- [ ] **Step 3: 创建通知类型**

```typescript
// apps/admin/src/types/user/notification.ts
import type { BasePageQuery } from '@haifeng/shared'

export interface NotificationListVO {
  id: number
  memberId: number
  memberName: string
  notificationType: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationQueryDTO extends BasePageQuery {
  memberId?: number
  notificationType?: string
  isRead?: boolean
}

export interface BroadcastDTO {
  title: string
  content: string
}
```

- [ ] **Step 4: 创建提现类型**

```typescript
// apps/admin/src/types/user/withdraw.ts
import type { BasePageQuery } from '@haifeng/shared'

export interface WithdrawListVO {
  id: number
  memberId: number
  memberName: string
  phone: string
  wechatId: string
  amount: number
  status: 'pending' | 'paid' | 'rejected'
  operatorName: string | null
  remark: string | null
  createdAt: string
  updatedAt: string | null
}

export interface WithdrawQueryDTO extends BasePageQuery {
  memberName?: string
  phone?: string
  wechatId?: string
  status?: 'pending' | 'paid' | 'rejected'
}

export interface WithdrawProcessDTO {
  action: 'paid' | 'rejected'
  remark?: string
}
```

---

### Task 2: 定义4个新子模块的 API

**Files:**
- Create: `apps/admin/src/api/user/order.ts`
- Create: `apps/admin/src/api/user/commission.ts`
- Create: `apps/admin/src/api/user/notification.ts`
- Create: `apps/admin/src/api/user/withdraw.ts`

- [ ] **Step 1: 创建订单 API**

```typescript
// apps/admin/src/api/user/order.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { OrderListVO, OrderDetailVO, OrderQueryDTO } from '@/types/user/order'

const PREFIX = '/api/v1/admin/user/order'

export const getOrderPage = (params: OrderQueryDTO) =>
  request.get<R<PageResult<OrderListVO>>>(`${PREFIX}/list`, { params })

export const getOrderDetail = (id: number) =>
  request.get<R<OrderDetailVO>>(`${PREFIX}/${id}`)

export const getOrderWechat = (id: number) =>
  request.get<R<string>>(`${PREFIX}/${id}/wechat`)

export const deleteOrder = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteOrder = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreOrder = (id: number) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
```

- [ ] **Step 2: 创建佣金 API**

```typescript
// apps/admin/src/api/user/commission.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { CommissionListVO, CommissionQueryDTO } from '@/types/user/commission'

const PREFIX = '/api/v1/admin/user/commission'

export const getCommissionPage = (params: CommissionQueryDTO) =>
  request.get<R<PageResult<CommissionListVO>>>(`${PREFIX}/list`, { params })

export const deleteCommission = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteCommission = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreCommission = (id: number) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
```

- [ ] **Step 3: 创建通知 API**

```typescript
// apps/admin/src/api/user/notification.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { NotificationListVO, NotificationQueryDTO, BroadcastDTO } from '@/types/user/notification'

const PREFIX = '/api/v1/admin/user/notification'

export const getNotificationPage = (params: NotificationQueryDTO) =>
  request.get<R<PageResult<NotificationListVO>>>(`${PREFIX}/list`, { params })

export const broadcastNotification = (data: BroadcastDTO) =>
  request.post<R<string>>(`${PREFIX}/broadcast`, data)

export const deleteNotification = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteNotification = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreNotification = (id: number) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
```

- [ ] **Step 4: 创建提现 API**

```typescript
// apps/admin/src/api/user/withdraw.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { WithdrawListVO, WithdrawQueryDTO, WithdrawProcessDTO } from '@/types/user/withdraw'

const PREFIX = '/api/v1/admin/user/withdraw'

export const getWithdrawPage = (params: WithdrawQueryDTO) =>
  request.get<R<PageResult<WithdrawListVO>>>(`${PREFIX}/list`, { params })

export const getWithdrawWechat = (id: number) =>
  request.get<R<string>>(`${PREFIX}/${id}/wechat`)

export const processWithdraw = (id: number, data: WithdrawProcessDTO) =>
  request.put<R<void>>(`${PREFIX}/${id}/process`, data)

export const deleteWithdraw = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteWithdraw = (id: number) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreWithdraw = (id: number) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
```

---

### Task 3: 订单管理页面

**Files:**
- Create: `apps/admin/src/views/user/order/index.vue`

- [ ] **Step 1: 创建订单管理页面**

```vue
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

const openDetail = async (id: number) => {
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

const handleDelete = async (id: number) => {
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

const handleRestore = async (id: number) => {
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

const handleHardDelete = async (id: number) => {
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
          <template #default="{ row }">{{ MemberTypeLabel[row.beforeType] }}</template>
        </el-table-column>
        <el-table-column prop="afterType" label="变更后" width="100" align="center">
          <template #default="{ row }">{{ MemberTypeLabel[row.afterType] }}</template>
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
            <el-descriptions-item label="变更前">{{ MemberTypeLabel[detailData.beforeType] }}</el-descriptions-item>
            <el-descriptions-item label="变更后">{{ MemberTypeLabel[detailData.afterType] }}</el-descriptions-item>
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
```

---

### Task 4: 佣金管理页面

**Files:**
- Create: `apps/admin/src/views/user/commission/index.vue`

- [ ] **Step 1: 创建佣金管理页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getCommissionPage,
  deleteCommission,
  hardDeleteCommission,
  restoreCommission,
} from '@/api/user/commission'
import type { CommissionListVO, CommissionQueryDTO } from '@/types/user/commission'

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
    const res = await getCommissionPage(params as CommissionQueryDTO)
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
  queryParams.referrerPhone = ''
  queryParams.referrerName = ''
  queryParams.refereePhone = ''
  queryParams.refereeName = ''
  queryParams.orderNo = ''
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

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要禁用该佣金记录吗？', '提示', { type: 'warning' })
    const res = await deleteCommission(id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '禁用失败')
    }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要恢复该佣金记录吗？', '提示', { type: 'warning' })
    const res = await restoreCommission(id)
    if (res.data.code === 200) {
      ElMessage.success('恢复成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '恢复失败')
    }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该佣金记录吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteCommission(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="推荐人手机号">
          <el-input v-model="queryParams.referrerPhone" placeholder="前缀匹配" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="推荐人名称">
          <el-input v-model="queryParams.referrerName" placeholder="模糊搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="被推荐人手机号">
          <el-input v-model="queryParams.refereePhone" placeholder="前缀匹配" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="被推荐人名称">
          <el-input v-model="queryParams.refereeName" placeholder="模糊搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" placeholder="模糊搜索" clearable style="width: 160px" @keyup.enter="handleSearch" />
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
        <el-table-column prop="referrerName" label="推荐人" min-width="100" />
        <el-table-column prop="referrerPhone" label="推荐人手机号" width="130" />
        <el-table-column prop="refereeName" label="被推荐人" min-width="100" />
        <el-table-column prop="refereePhone" label="被推荐人手机号" width="130" />
        <el-table-column prop="orderAmount" label="订单金额" width="100" align="right">
          <template #default="{ row }">¥{{ row.orderAmount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="commissionRate" label="佣金比例" width="100" align="center">
          <template #default="{ row }">{{ row.commissionRate }}%</template>
        </el-table-column>
        <el-table-column prop="commissionAmount" label="佣金金额" width="100" align="right">
          <template #default="{ row }">¥{{ row.commissionAmount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">详情</el-button>
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

    <el-dialog v-model="dialogVisible" title="佣金详情" width="600px" :close-on-click-modal="false">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="推荐人">{{ detailData.referrerName }}</el-descriptions-item>
          <el-descriptions-item label="推荐人手机号">{{ detailData.referrerPhone }}</el-descriptions-item>
          <el-descriptions-item label="被推荐人">{{ detailData.refereeName }}</el-descriptions-item>
          <el-descriptions-item label="被推荐人手机号">{{ detailData.refereePhone }}</el-descriptions-item>
          <el-descriptions-item label="关联订单ID">{{ detailData.orderId }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ detailData.orderAmount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="佣金比例">{{ detailData.commissionRate }}%</el-descriptions-item>
          <el-descriptions-item label="佣金金额">¥{{ detailData.commissionAmount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 5: 通知管理页面

**Files:**
- Create: `apps/admin/src/views/user/notification/index.vue`

- [ ] **Step 1: 创建通知管理页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getNotificationPage,
  broadcastNotification,
  deleteNotification,
  hardDeleteNotification,
  restoreNotification,
} from '@/api/user/notification'
import type { NotificationListVO, NotificationQueryDTO, BroadcastDTO } from '@/types/user/notification'

const loading = ref(false)
const tableData = ref<NotificationListVO[]>([])
const total = ref(0)

const queryParams = reactive<NotificationQueryDTO>({
  page: 1,
  size: 10,
  memberId: undefined,
  notificationType: undefined,
  isRead: undefined,
})

const dialogVisible = ref(false)
const broadcastVisible = ref(false)
const formLoading = ref(false)
const detailData = ref<NotificationListVO | null>(null)
const broadcastForm = reactive<BroadcastDTO>({ title: '', content: '' })
const broadcasting = ref(false)

const notificationTypeLabel: Record<string, string> = {
  member_expire_soon: '会员即将到期',
  member_expired: '会员已过期',
  commission_earned: '佣金到账',
  commission_paid: '佣金已发放',
  commission_rejected: '提现被拒绝',
  system_notice: '系统公告',
  member_renewed: '会员续费成功',
  member_activation_success: '会员开通成功',
}

const fetchData = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = { page: queryParams.page, size: queryParams.size }
    if (queryParams.memberId) params.memberId = queryParams.memberId
    if (queryParams.notificationType) params.notificationType = queryParams.notificationType
    if (queryParams.isRead !== undefined && queryParams.isRead !== null) params.isRead = queryParams.isRead
    const res = await getNotificationPage(params as NotificationQueryDTO)
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
  queryParams.memberId = undefined
  queryParams.notificationType = undefined
  queryParams.isRead = undefined
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

const openDetail = (row: NotificationListVO) => {
  detailData.value = row
  dialogVisible.value = true
}

const openBroadcast = () => {
  broadcastForm.title = ''
  broadcastForm.content = ''
  broadcastVisible.value = true
}

const handleBroadcast = async () => {
  if (!broadcastForm.title || !broadcastForm.content) {
    ElMessage.warning('请填写公告标题和内容')
    return
  }
  broadcasting.value = true
  try {
    const res = await broadcastNotification({ title: broadcastForm.title, content: broadcastForm.content })
    if (res.data.code === 200) {
      ElMessage.success('群发任务已提交')
      broadcastVisible.value = false
    } else {
      ElMessage.error(res.data.msg || '群发失败')
    }
  } catch {
    ElMessage.error('群发失败')
  } finally {
    broadcasting.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要禁用该通知吗？', '提示', { type: 'warning' })
    const res = await deleteNotification(id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '禁用失败')
    }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要恢复该通知吗？', '提示', { type: 'warning' })
    const res = await restoreNotification(id)
    if (res.data.code === 200) {
      ElMessage.success('恢复成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '恢复失败')
    }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该通知吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteNotification(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="用户ID">
          <el-input-number v-model="queryParams.memberId" :min="1" placeholder="精确查询" clearable style="width: 160px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="queryParams.notificationType" placeholder="全部" clearable style="width: 160px">
            <el-option v-for="(label, val) in notificationTypeLabel" :key="val" :label="label" :value="val" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否已读">
          <el-select v-model="queryParams.isRead" placeholder="全部" clearable style="width: 100px">
            <el-option label="已读" :value="true" />
            <el-option label="未读" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="mb-4">
      <el-button type="primary" @click="openBroadcast">群发公告</el-button>
      <el-button @click="fetchData">刷新</el-button>
    </div>

    <div class="rounded-lg bg-white p-5">
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="memberId" label="用户ID" width="100" />
        <el-table-column prop="memberName" label="用户名" width="100" />
        <el-table-column prop="notificationType" label="通知类型" width="130">
          <template #default="{ row }">
            <el-tag size="small">{{ notificationTypeLabel[row.notificationType] || row.notificationType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isRead" label="已读状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'success' : 'info'" size="small">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="260" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">详情</el-button>
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

    <el-dialog v-model="dialogVisible" title="通知详情" width="700px" :close-on-click-modal="false">
      <template v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.memberId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.memberName }}</el-descriptions-item>
          <el-descriptions-item label="通知类型">{{ notificationTypeLabel[detailData.notificationType] || detailData.notificationType }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ detailData.title }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ detailData.content }}</el-descriptions-item>
          <el-descriptions-item label="已读状态">{{ detailData.isRead ? '已读' : '未读' }}</el-descriptions-item>
          <el-descriptions-item label="阅读时间">{{ detailData.readAt || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="broadcastVisible" title="群发系统公告" width="500px" :close-on-click-modal="false">
      <el-form :model="broadcastForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="broadcastForm.title" placeholder="请输入公告标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="broadcastForm.content" type="textarea" :rows="6" placeholder="请输入公告内容" maxlength="5000" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="broadcastVisible = false">取消</el-button>
        <el-button type="primary" :loading="broadcasting" @click="handleBroadcast">确认群发</el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 6: 提现管理页面

**Files:**
- Create: `apps/admin/src/views/user/withdraw/index.vue`

- [ ] **Step 1: 创建提现管理页面**

```vue
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  getWithdrawPage,
  getWithdrawWechat,
  processWithdraw,
  deleteWithdraw,
  hardDeleteWithdraw,
  restoreWithdraw,
} from '@/api/user/withdraw'
import type { WithdrawListVO, WithdrawQueryDTO, WithdrawProcessDTO } from '@/types/user/withdraw'

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

const dialogVisible = ref(false)
const processVisible = ref(false)
const formLoading = ref(false)
const detailData = ref<WithdrawListVO | null>(null)
const wechatPlaintext = ref<string | null>(null)

const processAction = ref<'paid' | 'rejected'>('paid')
const processRemark = ref('')
const processing = ref(false)
const currentProcessId = ref<number | null>(null)

const statusLabel: Record<string, string> = {
  pending: '待处理',
  paid: '已支付',
  rejected: '已拒绝',
}

const statusTag: Record<string, string> = {
  pending: 'warning',
  paid: 'success',
  rejected: 'danger',
}

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

const openDetail = (id: number) => {
  wechatPlaintext.value = null
  formLoading.value = true
  dialogVisible.value = true
  detailData.value = tableData.value.find(r => r.id === id) || null
  formLoading.value = false
}

const handleViewWechat = async (row: WithdrawListVO) => {
  try {
    const res = await getWithdrawWechat(row.id)
    if (res.data.code === 200) {
      ElMessage.success(`微信号: ${res.data.data}`)
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch {
    ElMessage.error('获取微信号失败')
  }
}

const openProcess = (row: WithdrawListVO) => {
  currentProcessId.value = row.id
  processAction.value = 'paid'
  processRemark.value = ''
  processVisible.value = true
}

const handleProcess = async () => {
  if (!currentProcessId.value) return
  processing.value = true
  try {
    const data: WithdrawProcessDTO = { action: processAction.value }
    if (processRemark.value) data.remark = processRemark.value
    const res = await processWithdraw(currentProcessId.value, data)
    if (res.data.code === 200) {
      ElMessage.success(processAction.value === 'paid' ? '打款成功' : '已拒绝')
      processVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '处理失败')
    }
  } catch {
    ElMessage.error('处理失败')
  } finally {
    processing.value = false
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要禁用该提现记录吗？', '提示', { type: 'warning' })
    const res = await deleteWithdraw(id)
    if (res.data.code === 200) {
      ElMessage.success('禁用成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '禁用失败')
    }
  } catch { /* 取消 */ }
}

const handleRestore = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要恢复该提现记录吗？', '提示', { type: 'warning' })
    const res = await restoreWithdraw(id)
    if (res.data.code === 200) {
      ElMessage.success('恢复成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '恢复失败')
    }
  } catch { /* 取消 */ }
}

const handleHardDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要永久删除该提现记录吗？此操作不可恢复！', '警告', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
    })
    const res = await hardDeleteWithdraw(id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      fetchData()
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div>
    <div class="mb-4 rounded-lg bg-white p-5">
      <el-form :model="queryParams" inline>
        <el-form-item label="用户名">
          <el-input v-model="queryParams.memberName" placeholder="模糊搜索" clearable style="width: 140px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="模糊搜索" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="微信号">
          <el-input v-model="queryParams.wechatId" placeholder="精准匹配" clearable style="width: 150px" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已拒绝" value="rejected" />
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
        <el-table-column prop="memberName" label="用户名" width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="wechatId" label="微信号" width="130">
          <template #default="{ row }">
            <span class="text-gray-400">{{ row.wechatId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="100" align="right">
          <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status]" size="small">{{ statusLabel[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="处理人" width="100">
          <template #default="{ row }">{{ row.operatorName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.id)">详情</el-button>
            <el-button type="primary" link @click="handleViewWechat(row)">查看微信</el-button>
            <el-button v-if="row.status === 'pending'" type="warning" link @click="openProcess(row)">处理提现</el-button>
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

    <el-dialog v-model="dialogVisible" title="提现详情" width="600px" :close-on-click-modal="false">
      <template v-if="detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ detailData.memberId }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detailData.memberName }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
          <el-descriptions-item label="微信号">{{ detailData.wechatId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="提现金额">¥{{ detailData.amount?.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTag[detailData.status]" size="small">{{ statusLabel[detailData.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理人">{{ detailData.operatorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="processVisible" title="处理提现" width="480px" :close-on-click-modal="false">
      <div class="mb-4">
        <el-radio-group v-model="processAction">
          <el-radio value="paid" class="mb-2">确认打款</el-radio>
          <el-radio value="rejected">拒绝退款</el-radio>
        </el-radio-group>
      </div>
      <el-form>
        <el-form-item label="备注">
          <el-input v-model="processRemark" type="textarea" :rows="3" placeholder="请输入处理备注（可选）" maxlength="500" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="processVisible = false">取消</el-button>
        <el-button type="primary" :loading="processing" @click="handleProcess">
          {{ processAction === 'paid' ? '确认打款' : '确认拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
```

---

### Task 7: 更新路由配置

**Files:**
- Modify: `apps/admin/src/router/modules/user.ts`

- [ ] **Step 1: 添加4个新子路由**

```typescript
// apps/admin/src/router/modules/user.ts
import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw = {
  path: '/user',
  name: 'User',
  meta: { title: '用户管理', icon: 'User' },
  redirect: '/user/list',
  children: [
    {
      path: 'list',
      name: 'UserList',
      component: () => import('@/views/user/list/index.vue'),
      meta: { title: '用户列表', moduleCode: 'user_member' },
    },
    {
      path: 'order',
      name: 'UserOrder',
      component: () => import('@/views/user/order/index.vue'),
      meta: { title: '订单管理', moduleCode: 'user_order' },
    },
    {
      path: 'commission',
      name: 'UserCommission',
      component: () => import('@/views/user/commission/index.vue'),
      meta: { title: '佣金管理', moduleCode: 'user_commission' },
    },
    {
      path: 'notification',
      name: 'UserNotification',
      component: () => import('@/views/user/notification/index.vue'),
      meta: { title: '通知管理', moduleCode: 'user_notification' },
    },
    {
      path: 'withdraw',
      name: 'UserWithdraw',
      component: () => import('@/views/user/withdraw/index.vue'),
      meta: { title: '提现管理', moduleCode: 'user_withdraw' },
    },
  ],
}

export default userRoutes
```

---

### Task 8: 验证

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
cd apps/admin && npx vue-tsc --noEmit
```

- [ ] **Step 2: 启动 dev server 验证**

```bash
pnpm dev:admin
```

验证：导航栏显示5个子菜单，每个页面可正常渲染、搜索、分页、弹窗。
