<script setup lang="ts">
import type { OrderListVO } from '@/types/user/order'
import { MemberTypeLabel } from '@haifeng/shared'

defineProps<{
  data: OrderListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  orderTypeLabel: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', id: string): void
  (e: 'wechat', row: OrderListVO): void
  (e: 'disable', id: string): void
  (e: 'restore', id: string): void
  (e: 'hard-delete', id: string): void
}>()

const pageSizes = [10, 20, 30, 50, 100]
</script>

<template>
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe>
        <el-table-column prop="id" label="ID" width="140" />
        <el-table-column prop="orderNo" label="订单号" width="180" show-overflow-tooltip />
        <el-table-column prop="memberName" label="会员名称" min-width="100" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="wechatId" label="微信号" width="130">
          <template #default="{ row }">
            <span class="dim-text">{{ row.wechatId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderType" label="订单类型" width="100" align="center">
          <template #default="{ row }">
            <span class="type-tag">{{ orderTypeLabel[row.orderType] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeType" label="变更前" width="100" align="center">
          <template #default="{ row }">
            <span class="dim-text">{{ MemberTypeLabel[row.beforeType as keyof typeof MemberTypeLabel] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="afterType" label="变更后" width="100" align="center">
          <template #default="{ row }">
            <span class="bold-text">{{ MemberTypeLabel[row.afterType as keyof typeof MemberTypeLabel] }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="durationMonths" label="时长" width="80" align="center">
          <template #default="{ row }">{{ row.durationMonths }}个月</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.amount?.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row.id)">详情</button>
              <button type="button" class="action-btn action-wechat" @click="emit('wechat', row)">查看微信</button>
              <button type="button" class="action-btn action-disable" @click="emit('disable', row.id)">禁用</button>
              <button type="button" class="action-btn action-restore" @click="emit('restore', row.id)">恢复</button>
              <button type="button" class="action-btn action-hard-delete" @click="emit('hard-delete', row.id)">硬删除</button>
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

/* 表格自定义样式 */
.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  border-bottom: none;
  padding: 14px 0;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #fff;
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

/* 文字样式 */
.dim-text {
  font-size: 13px;
  color: #9ca3af;
}

.bold-text {
  font-weight: 600;
  color: #1f2937;
}

.amount-text {
  font-size: 14px;
  font-weight: 700;
  color: #F97316;
}

.type-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 操作按钮组 */
.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
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

.action-disable {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-disable:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.action-restore {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.action-restore:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.action-hard-delete {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
  color: #fff;
}
.action-hard-delete:hover {
  box-shadow: 0 2px 8px rgba(185, 28, 28, 0.3);
  transform: translateY(-1px);
}

/* 自定义分页 */
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
