<script setup lang="ts">
/**
 * 培训机构 - 列表表格
 */
import type { InstitutionListVO } from '@/types/home/institution'
import { INSTITUTION_CATEGORY_TONE } from '../../constants'

defineProps<{
  data: InstitutionListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', id: string): void
  (e: 'edit', id: string): void
  (e: 'toggle-status', row: InstitutionListVO): void
  (e: 'delete', row: InstitutionListVO): void
}>()

const pageSizes = [10, 20, 30, 50, 100]
</script>

<template>
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe>
        <el-table-column prop="name" label="机构名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="130" align="center">
          <template #default="{ row }">
            <span class="category-pill" :class="INSTITUTION_CATEGORY_TONE[row.category] || 'tone-default'">
              {{ row.category }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="province" label="省份" width="90" align="center">
          <template #default="{ row }">
            <span class="province-pill">{{ row.province }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="foundedYear" label="创办时间" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.foundedYear" class="dim-text">{{ row.foundedYear }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="managerUsername" label="管理账号" width="120">
          <template #default="{ row }">
            <span v-if="row.managerUsername" class="dim-text">{{ row.managerUsername }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130">
          <template #default="{ row }">
            <span v-if="row.phone" class="dim-text">{{ row.phone }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row.id)">详情</button>
              <button type="button" class="action-btn action-edit" @click="emit('edit', row.id)">修改</button>
              <button
                type="button"
                class="action-btn"
                :class="row.status === 1 ? 'action-disable' : 'action-enable'"
                @click="emit('toggle-status', row)"
              >
                {{ row.status === 1 ? '下架' : '上架' }}
              </button>
              <button type="button" class="action-btn action-delete" @click="emit('delete', row)">删除</button>
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
.custom-table :deep(.el-table__header th .cell) { color: #1f2937; }
.custom-table :deep(.el-table__body tr) { transition: background-color 0.2s ease; }
.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}
.custom-table :deep(.el-table__body td) { border-bottom: 1px solid #f3f4f6; padding: 12px 0; }
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}
.custom-table :deep(.el-table__empty-block) { min-height: 200px; }

.dim-text {
  font-size: 13px;
  color: #9ca3af;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.tone-orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(251, 146, 60, 0.16));
  color: #c2410c;
  border-color: rgba(249, 115, 22, 0.25);
}
.tone-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}
.tone-red {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.1), rgba(244, 63, 94, 0.15));
  color: #be123c;
  border-color: rgba(225, 29, 72, 0.25);
}
.tone-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(34, 211, 238, 0.15));
  color: #0e7490;
  border-color: rgba(6, 182, 212, 0.25);
}
.tone-default {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

.province-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.12));
  color: #2563eb;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid transparent;
}
.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}
.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border-color: #e5e7eb;
}

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
.action-detail { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; }
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}
.action-edit { background: linear-gradient(135deg, #2563eb, #60a5fa); color: #fff; }
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}
.action-enable { background: linear-gradient(135deg, #10b981, #34d399); color: #fff; }
.action-enable:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}
.action-disable { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #fff; }
.action-disable:hover {
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}
.action-delete { background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; }
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
.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}
.custom-pagination :deep(.el-pager li:hover) { color: #F97316; }
.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) { border-radius: 8px; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}
.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) { border-radius: 8px; }
.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) { color: #F97316; }
</style>
