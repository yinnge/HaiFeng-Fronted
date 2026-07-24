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

const handleDelete = async (id: string) => {
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

const handleRestore = async (id: string) => {
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

const handleHardDelete = async (id: string) => {
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
