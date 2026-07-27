<script setup lang="ts">
import { computed } from 'vue'
import type { CommissionListVO } from '@/types/user/commission'

const props = defineProps<{
  data: CommissionListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'detail', row: CommissionListVO): void
  (e: 'disable', id: string): void
  (e: 'restore', id: string): void
  (e: 'hardDelete', id: string): void
  (e: 'refresh'): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('page-change', val),
})

const pageSize = computed({
  get: () => props.size,
  set: (val) => emit('size-change', val),
})
</script>

<template>
  <div class="table-card">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          佣金列表
        </span>
        <span class="record-count">{{ total }} 条记录</span>
      </div>
      <button type="button" class="refresh-btn" @click="emit('refresh')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        刷新
      </button>
    </div>

    <el-table :data="data" v-loading="loading" stripe class="custom-table">
      <el-table-column prop="id" label="ID" width="140" />
      <el-table-column prop="referrerName" label="推荐人" min-width="100" />
      <el-table-column prop="referrerPhone" label="推荐人手机号" width="130" />
      <el-table-column prop="refereeName" label="被推荐人" min-width="100" />
      <el-table-column prop="refereePhone" label="被推荐人手机号" width="130" />
      <el-table-column prop="orderAmount" label="订单金额" width="100" align="right">
        <template #default="{ row }">
          <span class="money-highlight">¥{{ row.orderAmount?.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="commissionRate" label="佣金比例" width="100" align="center">
        <template #default="{ row }">
          <span class="rate-highlight">{{ row.commissionRate }}%</span>
        </template>
      </el-table-column>
      <el-table-column prop="commissionAmount" label="佣金金额" width="100" align="right">
        <template #default="{ row }">
          <span class="money-highlight primary">¥{{ row.commissionAmount?.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="300" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-group">
            <button type="button" class="action-btn detail-btn" @click="emit('detail', row)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              详情
            </button>
            <button type="button" class="action-btn disable-btn" @click="emit('disable', row.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              禁用
            </button>
            <button type="button" class="action-btn restore-btn" @click="emit('restore', row.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
              恢复
            </button>
            <button type="button" class="action-btn hard-delete-btn" @click="emit('hardDelete', row.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              硬删除
            </button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 12px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  padding: 20px 24px;
  transition: box-shadow 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #F97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

.record-count {
  font-size: 12px;
  color: #9ca3af;
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.refresh-btn:hover {
  color: #F97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.04);
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-bottom: none;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #fff;
  font-weight: 600;
}

.custom-table :deep(.el-table__row:hover > td) {
  background: rgba(249, 115, 22, 0.03) !important;
}

.custom-table :deep(.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3) !important;
}

.custom-table :deep(.el-table__body td) {
  border-bottom-color: rgba(249, 115, 22, 0.06);
}

.custom-table :deep(.el-table--border::after),
.custom-table :deep(.el-table--border::before),
.custom-table :deep(.el-table__inner-wrapper::before) {
  background-color: rgba(249, 115, 22, 0.08);
}

.money-highlight {
  font-weight: 600;
  color: #374151;
}

.money-highlight.primary {
  color: #F97316;
  font-size: 14px;
  font-weight: 700;
}

.rate-highlight {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 146, 60, 0.1));
  color: #C2410C;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.detail-btn {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #F97316;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.detail-btn:hover {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.disable-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.12));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.disable-btn:hover {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.restore-btn {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.restore-btn:hover {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.hard-delete-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.12));
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.hard-delete-btn:hover {
  background: linear-gradient(135deg, #dc2626, #ef4444);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.pagination-wrapper :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
}

.pagination-wrapper :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
}

.pagination-wrapper :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.pagination-wrapper :deep(.el-pager li:hover) {
  color: #F97316;
}

.pagination-wrapper :deep(.el-pagination .btn-prev),
.pagination-wrapper :deep(.el-pagination .btn-next) {
  border-radius: 8px;
}

.pagination-wrapper :deep(.el-pagination .btn-prev:hover),
.pagination-wrapper :deep(.el-pagination .btn-next:hover) {
  color: #F97316;
}

.pagination-wrapper :deep(.el-pagination .el-select .el-input .el-input__wrapper) {
  border-radius: 8px;
}
</style>
