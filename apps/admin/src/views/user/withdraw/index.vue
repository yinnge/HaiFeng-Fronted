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

const processAction = ref<'paid' | 'rejected'>('paid')
const processRemark = ref('')
const processing = ref(false)
const currentProcessId = ref<string | null>(null)

const statusLabel: Record<string, string> = {
  pending: '待处理',
  paid: '已支付',
  rejected: '已拒绝',
}

const statusTag: Record<string, 'warning' | 'success' | 'danger'> = {
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

const openDetail = (id: string) => {
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

const handleDelete = async (id: string) => {
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

const handleRestore = async (id: string) => {
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

const handleHardDelete = async (id: string) => {
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
          <el-radio value="rejected">拒绝提现</el-radio>
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
