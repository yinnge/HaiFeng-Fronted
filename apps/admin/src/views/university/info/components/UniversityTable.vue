<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UniversityListVO } from '@/types/university/info'

const props = defineProps<{
  data: UniversityListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'selection-change', ids: string[]): void
  (e: 'detail', id: string): void
  (e: 'edit', id: string): void
  (e: 'toggle-status', row: UniversityListVO): void
  (e: 'hard-delete', id: string): void
  (e: 'add'): void
  (e: 'batch-hard-delete'): void
  (e: 'import-main'): void
  (e: 'import-detail'): void
  (e: 'refresh'): void
}>()

const pageSizes = [10, 20, 30, 50, 100]
const selectedRows = ref<UniversityListVO[]>([])

watch(selectedRows, (val) => {
  emit('selection-change', val.map((r) => r.id))
})

const statusLabel = (status: number) => (status === 1 ? '展示' : '下架')

const handleSelectionChange = (selection: UniversityListVO[]) => {
  selectedRows.value = selection
}
</script>

<template>
  <!-- 操作栏 -->
  <div class="action-bar">
    <button type="button" class="primary-btn" @click="emit('add')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      新增院校
    </button>
    <button type="button" class="outline-btn" @click="emit('import-main')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      导入主表
    </button>
    <button type="button" class="outline-btn" @click="emit('import-detail')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      导入详情
    </button>
    <button
      type="button"
      class="danger-btn"
      :disabled="selectedRows.length === 0"
      @click="emit('batch-hard-delete')"
    >
      批量永久删除
    </button>
    <button type="button" class="refresh-btn" @click="emit('refresh')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      刷新
    </button>
  </div>

  <!-- 表格卡片 -->
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="160" />
        <el-table-column prop="name" label="院校名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="provinceName" label="省份" width="100" />
        <el-table-column prop="cityName" label="城市" width="100" />
        <el-table-column prop="region" label="地区" width="90" />
        <el-table-column prop="category" label="类别" width="90" />
        <el-table-column prop="educationLevel" label="办学层次" width="100">
          <template #default="{ row }">
            <span v-if="row.educationLevel" class="level-pill">{{ row.educationLevel }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="nature" label="性质" width="80">
          <template #default="{ row }">
            <span v-if="row.nature" class="nature-pill">{{ row.nature }}</span>
            <span v-else class="dim-text">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="300" align="center" fixed="right">
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
                {{ row.status === 1 ? '禁用' : '启用' }}
              </button>
              <button type="button" class="action-btn action-delete" @click="emit('hard-delete', row.id)">永久删除</button>
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
/* 操作栏 */
.action-bar {
  position: relative; z-index: 1;
  display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap;
}
.primary-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff; border: none; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.primary-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.primary-btn:active { transform: translateY(0); }

.outline-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; background: #fff; color: #374151;
  border: 1px solid #d1d5db; border-radius: 20px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.25s ease;
}
.outline-btn:hover { color: #F97316; border-color: #F97316; background: rgba(249, 115, 22, 0.04); }
.outline-btn:active { background: rgba(249, 115, 22, 0.08); }

.danger-btn {
  display: inline-flex; align-items: center;
  padding: 8px 20px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff; border: none; border-radius: 20px;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.danger-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
.danger-btn:active { transform: translateY(0); }
.danger-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

.refresh-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px; background: #fff; color: #6b7280;
  border: 1px solid #d1d5db; border-radius: 20px;
  font-size: 13px; font-weight: 500; cursor: pointer;
  transition: all 0.25s ease;
}
.refresh-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.refresh-btn:active { background: #f3f4f6; }

/* 表格卡片 */
.table-card {
  background: #fff; border-radius: 12px; padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.table-card:hover { box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08); }

.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6; --el-table-header-bg-color: transparent;
  border-radius: 8px; overflow: hidden;
}
.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important; font-weight: 600; font-size: 14px; border-bottom: 2px solid #F97316 !important; padding: 14px 0;
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

.dim-text { font-size: 13px; color: #9ca3af; }
.level-pill {
  display: inline-flex; align-items: center; padding: 2px 10px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669; border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 20px; font-size: 12px; font-weight: 500;
}
.nature-pill {
  display: inline-flex; align-items: center; padding: 2px 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(96, 165, 250, 0.12));
  color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px; font-size: 12px; font-weight: 500;
}
.status-pill {
  display: inline-flex; align-items: center; padding: 3px 12px;
  border-radius: 20px; font-size: 12px; font-weight: 500; border: 1px solid transparent;
}
.status-on {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C; border-color: rgba(249, 115, 22, 0.2);
}
.status-off { background: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }

.action-group { display: flex; align-items: center; justify-content: center; gap: 5px; flex-wrap: wrap; }
.action-btn {
  display: inline-flex; align-items: center; padding: 3px 10px;
  border: none; border-radius: 12px; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all 0.2s ease; white-space: nowrap;
}
.action-detail { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; }
.action-detail:hover { box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3); transform: translateY(-1px); }
.action-edit { background: linear-gradient(135deg, #2563eb, #60a5fa); color: #fff; }
.action-edit:hover { box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); transform: translateY(-1px); }
.action-enable { background: linear-gradient(135deg, #10b981, #34d399); color: #fff; }
.action-enable:hover { box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3); transform: translateY(-1px); }
.action-disable { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #fff; }
.action-disable:hover { box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); transform: translateY(-1px); }
.action-delete { background: linear-gradient(135deg, #b91c1c, #dc2626); color: #fff; }
.action-delete:hover { box-shadow: 0 2px 8px rgba(185, 28, 28, 0.3); transform: translateY(-1px); }

.custom-pagination {
  display: flex; justify-content: flex-end; margin-top: 20px; padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}
.custom-pagination :deep(.el-pagination) { --el-pagination-hover-color: #F97316; }
.custom-pagination :deep(.el-pager li) { border-radius: 8px; transition: all 0.2s ease; font-weight: 500; }
.custom-pagination :deep(.el-pager li:hover) { color: #F97316; }
.custom-pagination :deep(.el-pager li.is-active) { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) { border-radius: 8px; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.custom-pagination :deep(.btn-prev), .custom-pagination :deep(.btn-next) { border-radius: 8px; }
.custom-pagination :deep(.btn-prev:hover), .custom-pagination :deep(.btn-next:hover) { color: #F97316; }
</style>
