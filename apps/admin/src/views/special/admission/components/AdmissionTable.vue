<script setup lang="ts">
import { computed } from 'vue'
import type { ChannelListVO } from '@/types/special/channel'

const props = defineProps<{
  data: ChannelListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  displayTypeOptions: { label: string; value: string }[]
  selectedIds: string[]
}>()

const emit = defineEmits<{
  (e: 'detail', row: ChannelListVO): void
  (e: 'edit', row: ChannelListVO): void
  (e: 'toggle-status', row: ChannelListVO): void
  (e: 'delete', id: string): void
  (e: 'batch-delete'): void
  (e: 'add'): void
  (e: 'refresh'): void
  (e: 'selection-change', rows: ChannelListVO[]): void
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

const displayTypeLabel = (type: string) => {
  const opt = props.displayTypeOptions.find((o) => o.value === type)
  return opt ? opt.label : type
}

const displayTypeColorMap: Record<string, { bg: string; color: string; border: string }> = {
  UNIVERSITY_LIST: { bg: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.12))', color: '#C2410C', border: 'rgba(249,115,22,0.2)' },
  ARTICLE_ONLY: { bg: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(96,165,250,0.12))', color: '#2563eb', border: 'rgba(59,130,246,0.2)' },
  MAJOR_DATA: { bg: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.12))', color: '#059669', border: 'rgba(16,185,129,0.2)' },
  GROUP: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(167,139,250,0.12))', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
}
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
          通道列表
        </span>
        <span class="record-count">{{ total }} 条记录</span>
      </div>
      <div class="toolbar-right">
        <button type="button" class="btn-primary" @click="emit('add')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          新增通道
        </button>
        <button type="button" class="toolbar-btn batch-delete-btn" :disabled="selectedIds.length === 0" @click="emit('batch-delete')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          批量删除
        </button>
        <button type="button" class="toolbar-btn refresh-btn" @click="emit('refresh')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <el-table
      :data="data"
      v-loading="loading"
      stripe
      class="custom-table"
      @selection-change="emit('selection-change', $event)"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="channelCode" label="通道代码" width="160" />
      <el-table-column prop="channelName" label="通道名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="displayType" label="展示类型" width="120">
        <template #default="{ row }">
          <span
            class="type-pill"
            :style="{
              background: (displayTypeColorMap[row.displayType] || displayTypeColorMap.GROUP).bg,
              color: (displayTypeColorMap[row.displayType] || displayTypeColorMap.GROUP).color,
              borderColor: (displayTypeColorMap[row.displayType] || displayTypeColorMap.GROUP).border,
            }"
          >
            {{ displayTypeLabel(row.displayType) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态" width="100" align="center">
        <template #default="{ row }">
          <span :class="['status-pill', row.isActive ? 'status-on' : 'status-off']">
            {{ row.isActive ? '启用' : '禁用' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-group">
            <button type="button" class="action-btn action-detail" @click="emit('detail', row)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              详情
            </button>
            <button type="button" class="action-btn action-edit" @click="emit('edit', row)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              修改
            </button>
            <button type="button" class="action-btn action-status" @click="emit('toggle-status', row)">
              <svg v-if="row.isActive" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ row.isActive ? '禁用' : '启用' }}
            </button>
            <button type="button" class="action-btn action-delete" @click="emit('delete', row.id)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              删除
            </button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="custom-pagination">
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

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
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

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.batch-delete-btn {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.12));
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.batch-delete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.batch-delete-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.refresh-btn {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.refresh-btn:hover {
  color: #F97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.04);
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
.custom-table :deep(.el-table__header th .cell) { color: #1f2937; }
.custom-table :deep(.el-table__body tr) { transition: background-color 0.2s ease; }
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
.custom-table :deep(.el-table__empty-block) { min-height: 200px; }

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

.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: 1px solid;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
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

.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}
.action-edit {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}
.action-status {
  background: #fff;
  color: #d97706;
  border: 1px solid #fbbf24;
}
.action-status:hover {
  background: #fffbeb;
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
.custom-pagination :deep(.el-pagination) { --el-pagination-hover-color: #F97316; }
.custom-pagination :deep(.el-pager li) { border-radius: 8px; transition: all 0.2s ease; font-weight: 500; }
.custom-pagination :deep(.el-pager li:hover) { color: #F97316; }
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) { border-radius: 8px; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) { border-radius: 8px; }
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) { color: #F97316; }
</style>
