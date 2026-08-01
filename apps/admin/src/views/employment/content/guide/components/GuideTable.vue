<script setup lang="ts">
import { computed } from 'vue'
import type { ExamGuideListVO } from '@/types/employment/guide'
import { GuideCategoryLabel } from '@/types/employment/guide'

const props = defineProps<{
  data: ExamGuideListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  selectedIds: string[]
}>()

const emit = defineEmits<{
  detail: [id: string]
  edit: [id: string]
  add: []
  disable: [row: ExamGuideListVO]
  enable: [row: ExamGuideListVO]
  delete: [id: string]
  'batch-delete': []
  refresh: []
  'selection-change': [rows: ExamGuideListVO[]]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const currentPage = computed({ get: () => props.page, set: (val: number) => emit('page-change', val) })
const currentPageSize = computed({ get: () => props.size, set: (val: number) => emit('size-change', val) })
const categoryLabel = (cat: string) => GuideCategoryLabel[cat] || cat
</script>

<template>
  <div>
    <div class="toolbar">
      <button type="button" class="btn-tool btn-orange" @click="emit('add')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新增备考指南
      </button>
      <button type="button" class="btn-tool btn-outline" @click="emit('refresh')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        刷新
      </button>
      <button v-if="selectedIds.length > 0" type="button" class="btn-tool btn-red" @click="emit('batch-delete')">批量删除</button>
    </div>
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe @selection-change="emit('selection-change', $event)">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="subtitle" label="副标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="指南类别" min-width="130">
          <template #default="{ row }">{{ categoryLabel(row.guideCategory) }}</template>
        </el-table-column>
        <el-table-column prop="guideType" label="指南类型" min-width="130" />
        <el-table-column label="置顶" width="70" align="center">
          <template #default="{ row }">
            <span v-if="row.isTop" class="pill pill-orange">置顶</span>
          </template>
        </el-table-column>
        <el-table-column label="推荐" width="70" align="center">
          <template #default="{ row }">
            <span v-if="row.isRecommended" class="pill pill-red">推荐</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读" width="70" align="center" />
        <el-table-column prop="likeCount" label="点赞" width="70" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <span :class="['pill', row.isDeleted ? 'pill-gray' : 'pill-orange']">{{ row.isDeleted ? '禁用' : '启用' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row.id)">详情</button>
              <button type="button" class="action-btn action-edit" @click="emit('edit', row.id)">修改</button>
              <button v-if="!row.isDeleted" type="button" class="action-btn action-disable" @click="emit('disable', row)">禁用</button>
              <button v-else type="button" class="action-btn action-enable" @click="emit('enable', row)">启用</button>
              <button type="button" class="action-btn action-delete" @click="emit('delete', row.id)">删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="custom-pagination">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="currentPageSize" :page-sizes="[10, 20, 30, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" />
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.btn-tool { display: inline-flex; align-items: center; gap: 6px; border-radius: 20px; padding: 8px 20px; font-size: 13px; cursor: pointer; border: none; transition: all 0.25s ease; }
.btn-tool:hover { transform: translateY(-1px); }
.btn-outline { background: #fff; color: #6b7280; border: 1px solid #d1d5db; }
.btn-outline:hover { border-color: #F97316; color: #F97316; }
.btn-orange { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; }
.btn-orange:hover { box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3); }
.btn-red { background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; }
.btn-red:hover { box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3); }

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

.pill { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.pill-orange { background: linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.12)); color: #C2410C; border: 1px solid rgba(249,115,22,0.2); }
.pill-red { background: linear-gradient(135deg, rgba(239,68,68,0.08), rgba(248,113,113,0.12)); color: #DC2626; border: 1px solid rgba(239,68,68,0.2); }
.pill-gray { background: linear-gradient(135deg, rgba(107,114,128,0.08), rgba(156,163,175,0.12)); color: #6b7280; border: 1px solid rgba(107,114,128,0.2); }

.action-group { display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; }

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

.action-edit {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.action-disable {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.action-disable:hover {
  background: #fde68a;
}

.action-enable {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.action-enable:hover {
  background: #bbf7d0;
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
