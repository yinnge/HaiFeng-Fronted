<script setup lang="ts">
import { computed } from 'vue'
import type { NoticeListVO } from '@/types/employment/notice'
import { NoticeCategoryLabel } from '@/types/employment/notice'

const props = defineProps<{
  data: NoticeListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  selectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'detail', id: string): void
  (e: 'edit', id: string): void
  (e: 'delete', id: string): void
  (e: 'disable', row: NoticeListVO): void
  (e: 'batch-delete'): void
  (e: 'refresh'): void
  (e: 'selection-change', rows: NoticeListVO[]): void
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

const categoryLabel = (cat: string) => NoticeCategoryLabel[cat] || cat
</script>

<template>
  <div class="table-toolbar">
    <div class="toolbar-left">
      <button
        type="button"
        class="toolbar-btn toolbar-btn--danger"
        :disabled="!hasSelection"
        @click="emit('batch-delete')"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        批量删除
      </button>
    </div>
    <button type="button" class="toolbar-btn toolbar-btn--refresh" @click="emit('refresh')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
      刷新
    </button>
  </div>

  <div class="table-card">
    <el-table
      :data="data"
      v-loading="loading"
      stripe
      @selection-change="emit('selection-change', $event)"
    >
      <el-table-column type="selection" width="50" />

      <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />

      <el-table-column label="公告类别" width="120">
        <template #default="{ row }">
          {{ categoryLabel(row.noticeCategory) }}
        </template>
      </el-table-column>

      <el-table-column prop="noticeType" label="公告类型" width="120" />

      <el-table-column prop="province" label="省份" width="110" />

      <el-table-column prop="city" label="城市" width="110" />

      <el-table-column prop="year" label="年份" width="80" align="center" />

      <el-table-column label="置顶" width="70" align="center">
        <template #default="{ row }">
          <span v-if="row.isTop" class="pill pill-warning">置顶</span>
        </template>
      </el-table-column>

      <el-table-column label="重要" width="70" align="center">
        <template #default="{ row }">
          <span v-if="row.isImportant" class="pill pill-danger">重要</span>
        </template>
      </el-table-column>

      <el-table-column prop="viewCount" label="阅读" width="70" align="center" />

      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <button type="button" class="op-btn op-btn--orange" @click="emit('detail', row.id)">详情</button>
          <button type="button" class="op-btn op-btn--yellow" @click="emit('edit', row.id)">修改</button>
          <button type="button" class="op-btn op-btn--blue" @click="emit('disable', row)">禁用</button>
          <button type="button" class="op-btn op-btn--red" @click="emit('delete', row.id)">删除</button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="currentPageSize"
        :page-sizes="[10, 20, 30, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next"
      />
    </div>
  </div>
</template>

<style scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  white-space: nowrap;
}

.toolbar-btn svg {
  width: 14px;
  height: 14px;
}

.toolbar-btn--danger {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
}

.toolbar-btn--danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.35);
}

.toolbar-btn--danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn--refresh {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.toolbar-btn--refresh:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  padding: 20px;
  transition: box-shadow 0.25s ease;
}

.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937;
  font-weight: 600;
  border-bottom: 2px solid #F97316;
}

.table-card :deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(249, 115, 22, 0.06);
}

.table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 247, 237, 0.3);
}

.table-card :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: rgba(249, 115, 22, 0.04) !important;
}

.table-card :deep(.el-table__empty-block) {
  min-height: 200px;
}

.table-card :deep(.el-table .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #F97316;
  border-color: #F97316;
}

.table-card :deep(.el-table .el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #FB923C;
  border-color: #FB923C;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pill-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.12));
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.pill-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.12));
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.op-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  background: transparent;
}

.op-btn--orange {
  color: #F97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.05);
}

.op-btn--orange:hover {
  background: #F97316;
  color: #fff;
  border-color: #F97316;
}

.op-btn--yellow {
  color: #d97706;
  border-color: rgba(217, 119, 6, 0.3);
  background: rgba(217, 119, 6, 0.05);
}

.op-btn--yellow:hover {
  background: #d97706;
  color: #fff;
  border-color: #d97706;
}

.op-btn--blue {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.05);
}

.op-btn--blue:hover {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.op-btn--red {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.op-btn--red:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.pagination-wrapper :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}

.pagination-wrapper :deep(.el-pagination .is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff !important;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}
</style>
