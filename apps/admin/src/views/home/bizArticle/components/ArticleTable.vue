<script setup lang="ts">
import type { BizArticleListVO } from '@/types/home/bizArticle'

defineProps<{
  data: BizArticleListVO[]
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
  (e: 'delete', id: string): void
}>()

const pageSizes = [10, 20, 30, 50, 100]

/** 时间格式化：兼容 ISO（2026-10-15T10:00:00+08:00）与后端已格式化字符串 */
const formatTime = (s: string | null) => (s ? s.replace('T', ' ').slice(0, 16) : '-')
</script>

<template>
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe>
        <el-table-column prop="moduleName" label="模块" width="110" align="center">
          <template #default="{ row }">
            <span class="tag-pill">{{ row.moduleName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="columnName" label="专栏" width="130" align="center">
          <template #default="{ row }">
            <span v-if="row.columnName" class="stage-pill">{{ row.columnName }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="240" show-overflow-tooltip />
        <el-table-column prop="province" label="省份" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.province" class="tag-pill">{{ row.province }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="year" label="年份" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.year != null">{{ row.year }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 1" class="status-pill status-off">下架</span>
            <span v-else class="status-pill status-on">已发布</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="70" align="center" />
        <el-table-column prop="viewCount" label="浏览量" width="80" align="center" />
        <el-table-column prop="publishTime" label="发布时间" width="150" align="center">
          <template #default="{ row }">{{ formatTime(row.publishTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row.id)">详情</button>
              <button type="button" class="action-btn action-edit" @click="emit('edit', row.id)">修改</button>
              <button type="button" class="action-btn action-delete" @click="emit('delete', row.id)">删除</button>
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

/* 模块/省份药丸 */
.tag-pill {
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

/* 专栏药丸 */
.stage-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(96, 165, 250, 0.12));
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 状态药丸 */
.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.16));
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

/* 操作按钮组 */
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

.action-edit {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
}
.action-edit:hover {
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
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
