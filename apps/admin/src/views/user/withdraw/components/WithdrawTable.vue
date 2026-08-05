<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { getWithdrawWechat, hardDeleteWithdraw } from '@/api/user/withdraw'
import type { WithdrawListVO } from '@/types/user/withdraw'

defineProps<{
  data: WithdrawListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', row: WithdrawListVO): void
  (e: 'process', row: WithdrawListVO): void
  (e: 'refresh'): void
}>()

const handleViewWechat = async (row: WithdrawListVO) => {
  try {
    const res = await getWithdrawWechat(row.id)
    if (res.data.code === 200) {
      ElMessage.success(`微信号: ${res.data.data}`)
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取微信号失败')
  }
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
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch { /* 取消 */ }
}

const pageSizes = [10, 20, 30, 50, 100]
</script>

<template>
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe>
        <el-table-column prop="memberName" label="用户名" width="110" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="wechatId" label="微信号" width="130">
          <template #default="{ row }">
            <span class="text-gray-400">{{ row.wechatId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="110" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'pending'" class="status-tag status-pending">待处理</span>
            <span v-else-if="row.status === 'paid'" class="status-tag status-paid">已支付</span>
            <span v-else-if="row.status === 'rejected'" class="status-tag status-rejected">已拒绝</span>
          </template>
        </el-table-column>
        <el-table-column prop="operatorName" label="处理人" width="100">
          <template #default="{ row }">{{ row.operatorName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row)">详情</button>
              <button type="button" class="action-btn action-wechat" @click="handleViewWechat(row)">查看微信</button>
              <button
                v-if="row.status === 'pending'"
                type="button"
                class="action-btn action-process"
                @click="emit('process', row)"
              >
                处理提现
              </button>
              <button type="button" class="action-btn action-delete" @click="handleHardDelete(row.id)">硬删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="custom-pagination">
      <el-pagination
        :current-page="page"
        :page-size="size"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="emit('page-change', $event)"
        @size-change="emit('size-change', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}

.custom-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}

.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}

.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
}

.amount-text {
  font-weight: 600;
  color: #F97316;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-pending {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #fff;
}

.status-paid {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.status-rejected {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}

.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.action-wechat {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.action-wechat:hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.action-process {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.action-process:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.custom-pagination :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}

.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 8px;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}
</style>
