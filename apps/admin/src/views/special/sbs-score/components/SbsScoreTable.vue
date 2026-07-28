<script setup lang="ts">
import { computed } from 'vue'
import type { StrongBaseScoreListVO } from '@/types/special/strong-base-score'

const props = defineProps<{
  data: StrongBaseScoreListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  selectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'detail', row: StrongBaseScoreListVO): void
  (e: 'edit', row: StrongBaseScoreListVO): void
  (e: 'toggle-status', row: StrongBaseScoreListVO): void
  (e: 'delete', id: string): void
  (e: 'batch-delete'): void
  (e: 'add'): void
  (e: 'refresh'): void
  (e: 'selection-change', rows: StrongBaseScoreListVO[]): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
}>()

const currentPage = computed({
  get: () => props.page,
  set: (val: number) => emit('page-change', val),
})

const currentPageSize = computed({
  get: () => props.size,
  set: (val: number) => emit('size-change', val),
})

const hasSelection = computed(() => props.selectedIds.length > 0)

const subjectTypeStyle = (type: string) => {
  const map: Record<string, string> = {
    '物理类': 'tag-blue',
    '历史类': 'tag-purple',
    '理科': 'tag-green',
    '文科': 'tag-orange',
    '综合改革': 'tag-teal',
  }
  return map[type] || 'tag-default'
}
</script>

<template>
  <div class="table-wrapper">
    <!-- 工具栏 -->
    <div class="toolbar">
      <button type="button" class="action-btn primary" @click="emit('add')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        新增数据
      </button>
      <button
        type="button"
        class="action-btn danger"
        :disabled="!hasSelection"
        @click="emit('batch-delete')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        批量删除
      </button>
      <button type="button" class="action-btn outline" @click="emit('refresh')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        刷新
      </button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table
        :data="data"
        v-loading="loading"
        stripe
        @selection-change="emit('selection-change', $event)"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="universityName" label="大学名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="year" label="年份" width="80" align="center" />
        <el-table-column prop="province" label="省份" width="100" align="center" />
        <el-table-column prop="subjectType" label="科类" width="100" align="center">
          <template #default="{ row }">
            <span :class="['tag-pill', subjectTypeStyle(row.subjectType)]">
              {{ row.subjectType }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="majorName" label="专业名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="isActive" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span :class="['status-pill', row.isActive ? 'status-on' : 'status-off']">
              {{ row.isActive ? '启用' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <button type="button" class="op-btn orange" @click="emit('detail', row)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              详情
            </button>
            <button type="button" class="op-btn yellow" @click="emit('edit', row)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              修改
            </button>
            <button
              type="button"
              :class="['op-btn', row.isActive ? 'gray' : 'green']"
              @click="emit('toggle-status', row)"
            >
              <svg v-if="row.isActive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {{ row.isActive ? '禁用' : '启用' }}
            </button>
            <button type="button" class="op-btn red" @click="emit('delete', row.id)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              删除
            </button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="currentPageSize"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-wrapper {
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.action-btn svg {
  width: 15px;
  height: 15px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.action-btn.danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.action-btn.danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.action-btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.outline {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.action-btn.outline:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

.table-card :deep(.el-table) {
  --el-table-border-color: rgba(249, 115, 22, 0.1);
  --el-table-header-bg-color: transparent;
  --el-table-header-text-color: #1f2937;
  --el-table-row-hover-bg-color: transparent;
  --el-table-bg-color: #fff;
  --el-table-tr-bg-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937;
  font-weight: 600;
  font-size: 13px;
  border-bottom: 2px solid #F97316;
}

.table-card :deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(249, 115, 22, 0.06);
  color: #374151;
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 247, 237, 0.3);
}

.table-card :deep(.el-table .el-table__body tr:hover > td.el-table__cell) {
  background: rgba(249, 115, 22, 0.05) !important;
}

.table-card :deep(.el-table .el-table__cell) {
  transition: background 0.2s ease;
}

.table-card :deep(.el-table--border::after),
.table-card :deep(.el-table--group::after),
.table-card :deep(.el-table::before) {
  background-color: rgba(249, 115, 22, 0.08);
}

.table-card :deep(.el-table .selection .cell) {
  padding-left: 10px;
}

.table-card :deep(.el-table .selection .el-checkbox__inner) {
  border-color: #d1d5db;
  border-radius: 4px;
}

.table-card :deep(.el-table .selection .el-checkbox__input.is-checked .el-checkbox__inner) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-color: #F97316;
}

.table-card :deep(.el-table-fixed-column--right) {
  background: #fff;
}

.table-card :deep(.el-table .el-table__fixed-right-patch) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5);
}

.table-card :deep(.el-table__empty-text) {
  color: #9ca3af;
}

.table-card :deep(.el-table .cell) {
  padding: 0 12px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.tag-blue {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.12));
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.tag-purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(167, 139, 250, 0.12));
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.tag-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tag-orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.tag-teal {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), rgba(94, 234, 212, 0.12));
  color: #0d9488;
  border: 1px solid rgba(20, 184, 166, 0.2);
}

.tag-default {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.op-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.op-btn svg {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
}

.op-btn + .op-btn {
  margin-left: 4px;
}

.op-btn.orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #EA580C;
  border-color: rgba(249, 115, 22, 0.2);
}

.op-btn.orange:hover {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  transform: translateY(-1px);
}

.op-btn.yellow {
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.08), rgba(250, 204, 21, 0.12));
  color: #a16207;
  border-color: rgba(234, 179, 8, 0.2);
}

.op-btn.yellow:hover {
  background: linear-gradient(135deg, #eab308, #facc15);
  color: #fff;
  transform: translateY(-1px);
}

.op-btn.green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

.op-btn.green:hover {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  transform: translateY(-1px);
}

.op-btn.gray {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.op-btn.gray:hover {
  background: #e5e7eb;
  color: #374151;
}

.op-btn.red {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.12));
  color: #dc2626;
  border-color: rgba(239, 68, 68, 0.2);
}

.op-btn.red:hover {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  transform: translateY(-1px);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(249, 115, 22, 0.06);
}

.pagination-wrap :deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
  --el-pagination-button-color: #374151;
  --el-pagination-hover-color: #F97316;
  font-size: 13px;
}

.pagination-wrap :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

.pagination-wrap :deep(.el-pagination.is-background .el-pager li:not(.is-disabled):not(.is-active):hover) {
  color: #F97316;
  background: rgba(249, 115, 22, 0.06);
  border-radius: 8px;
}

.pagination-wrap :deep(.el-pagination.is-background .btn-prev),
.pagination-wrap :deep(.el-pagination.is-background .btn-next) {
  border-radius: 8px;
}

.pagination-wrap :deep(.el-pagination.is-background .btn-prev:not(:disabled):hover),
.pagination-wrap :deep(.el-pagination.is-background .btn-next:not(:disabled):hover) {
  color: #F97316;
  background: rgba(249, 115, 22, 0.06);
}
</style>
