<script setup lang="ts">
import { computed } from 'vue'
import type { HealthcareListVO } from '@/types/employment/healthcare'

const props = defineProps<{
  data: HealthcareListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  selectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'detail', row: HealthcareListVO): void
  (e: 'edit', row: HealthcareListVO): void
  (e: 'delete', id: string): void
  (e: 'status-change', row: HealthcareListVO, val: string): void
  (e: 'batch-delete'): void
  (e: 'preview'): void
  (e: 'import'): void
  (e: 'refresh'): void
  (e: 'selection-change', rows: HealthcareListVO[]): void
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

const positionStatusOptions = ['招聘中', '已结束', '即将开始']

const statusPill: Record<string, string> = {
  '招聘中': 'pill-success',
  '已结束': 'pill-gray',
  '即将开始': 'pill-warning',
}
</script>

<template>
  <div class="table-toolbar">
    <div class="toolbar-left">
      <button type="button" class="toolbar-btn toolbar-btn--add" @click="emit('add')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        新增岗位
      </button>
      <button type="button" class="toolbar-btn toolbar-btn--outline" @click="emit('preview')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Excel预览
      </button>
      <button type="button" class="toolbar-btn toolbar-btn--success" @click="emit('import')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
        Excel导入
      </button>
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

      <el-table-column prop="institutionName" label="机构名称" min-width="200" show-overflow-tooltip />

      <el-table-column prop="institutionType" label="机构类型" width="110" show-overflow-tooltip />

      <el-table-column prop="institutionLevel" label="机构等级" width="90" />

      <el-table-column prop="institutionNature" label="机构性质" width="80" />

      <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />

      <el-table-column prop="positionCategory" label="岗位类别" width="100" />

      <el-table-column prop="department" label="科室" width="100" show-overflow-tooltip />

      <el-table-column prop="recruitmentType" label="招聘类型" width="90" />

      <el-table-column prop="province" label="省份" width="80" />

      <el-table-column prop="city" label="城市" width="80" />

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <span :class="['pill', statusPill[row.positionStatus] || 'pill-gray']">{{ row.positionStatus }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="updatedAt" label="更新时间" width="180" />

      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <button type="button" class="op-btn op-btn--orange" @click="emit('detail', row)">详情</button>
          <button type="button" class="op-btn op-btn--yellow" @click="emit('edit', row)">修改</button>

          <el-dropdown @command="(val: string) => emit('status-change', row, val)">
            <button type="button" class="op-btn op-btn--blue">
              {{ row.positionStatus }}
              <el-icon class="op-btn-icon"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="opt in positionStatusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

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

.toolbar-btn--add {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.25);
}

.toolbar-btn--add:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.35);
}

.toolbar-btn--success {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.25);
}

.toolbar-btn--success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.35);
}

.toolbar-btn--outline {
  background: #fff;
  color: #F97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.toolbar-btn--outline:hover {
  background: rgba(249, 115, 22, 0.05);
  border-color: #F97316;
  transform: translateY(-1px);
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

.pill-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.pill-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.12));
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.pill-gray {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
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

.op-btn-icon {
  font-size: 12px;
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
