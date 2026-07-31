<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import type { WelfareListVO } from '@/types/employment/welfare'

const props = defineProps<{
  data: WelfareListVO[]
  loading: boolean
  total: number
  page: number
  size: number
  selectedIds: string[]
}>()

const emit = defineEmits<{
  detail: [id: string]
  edit: [id: string]
  delete: [id: string]
  'status-change': [row: WelfareListVO, status: string]
  'batch-delete': []
  'pre-validate': []
  import: []
  refresh: []
  'selection-change': [rows: WelfareListVO[]]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const statusOptions = ['招聘中', '已结束', '即将开始']
const statusTag: Record<string, string> = { '招聘中': 'success', '已结束': 'info', '即将开始': 'warning' }
const currentPage = computed({ get: () => props.page, set: (val: number) => emit('page-change', val) })
const currentPageSize = computed({ get: () => props.size, set: (val: number) => emit('size-change', val) })
</script>

<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <button type="button" class="btn-tool btn-orange" @click="emit('pre-validate')">Excel预览</button>
        <button type="button" class="btn-tool btn-green" @click="emit('import')">Excel导入</button>
        <button type="button" class="btn-tool btn-red" :disabled="selectedIds.length === 0" @click="emit('batch-delete')">批量删除</button>
      </div>
      <button type="button" class="btn-tool btn-outline" @click="emit('refresh')">刷新</button>
    </div>
    <div class="custom-table">
      <el-table :data="data" v-loading="loading" stripe @selection-change="emit('selection-change', $event)">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="developingUnit" label="开发单位" min-width="140" show-overflow-tooltip />
        <el-table-column prop="employingUnit" label="用工单位" min-width="140" show-overflow-tooltip />
        <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="positionCategory" label="岗位类别" width="100" />
        <el-table-column prop="province" label="省份" width="80" />
        <el-table-column prop="city" label="城市" width="80" />
        <el-table-column prop="district" label="区域" width="80" />
        <el-table-column prop="monthlySalary" label="月工资" min-width="120" show-overflow-tooltip />
        <el-table-column label="报名起止" min-width="200">
          <template #default="{ row }">
            <span>{{ row.regStartDate ? row.regStartDate.slice(0, 10) : '-' }} ~ {{ row.regEndDate ? row.regEndDate.slice(0, 10) : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="positionStatus" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="status-pill" :class="statusTag[row.positionStatus] || 'info'">{{ row.positionStatus }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row.id)">详情</button>
              <button type="button" class="action-btn action-edit" @click="emit('edit', row.id)">修改</button>
              <el-dropdown @command="(val: string) => emit('status-change', row, val)">
                <button type="button" class="action-btn action-status">{{ row.positionStatus }}<el-icon><ArrowDown /></el-icon></button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="opt in statusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; position: relative; z-index: 1; }
.toolbar-left { display: flex; gap: 8px; }
.btn-tool { border-radius: 20px; padding: 8px 20px; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; position: relative; z-index: 1; }
.btn-tool:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-tool:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-orange { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; }
.btn-green { background: linear-gradient(135deg, #22c55e, #4ade80); color: #fff; }
.btn-red { background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; }
.btn-outline { background: #fff; color: #6b7280; border: 1px solid #d1d5db; }
.btn-outline:hover { border-color: #F97316; color: #F97316; }
.status-pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.status-pill.success { background: #dcfce7; color: #16a34a; }
.status-pill.warning { background: #fef3c7; color: #d97706; }
.status-pill.info { background: #f3f4f6; color: #6b7280; }
.custom-table :deep(.el-table) { --el-table-border-color:#f3f4f6; --el-table-header-bg-color:transparent; border-radius:8px; overflow:hidden; }
.custom-table :deep(.el-table__header th) { background:linear-gradient(180deg,#fff7ed,#ffedd5) !important; color:#1f2937 !important; font-weight:600; font-size:14px; border-bottom:2px solid #F97316 !important; padding:14px 0; }
.custom-table :deep(.el-table__header th .cell) { color:#1f2937; }
.custom-table :deep(.el-table__body tr) { transition:background-color .2s ease; }
.custom-table :deep(.el-table__body tr:hover > td) { background:linear-gradient(90deg,rgba(249,115,22,0.03),rgba(251,146,60,0.07)) !important; }
.custom-table :deep(.el-table__body td) { border-bottom:1px solid #f3f4f6; padding:12px 0; }
.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) { background:rgba(255,247,237,0.3); }
.custom-table :deep(.el-table__empty-block) { min-height:200px; }
.action-group { display:flex; align-items:center; justify-content:center; gap:6px; flex-wrap:wrap; }
.action-btn { display:inline-flex; align-items:center; padding:3px 12px; border:none; border-radius:12px; font-size:12px; font-weight:500; cursor:pointer; transition:all .2s ease; white-space:nowrap; }
.action-detail { background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; }
.action-detail:hover { box-shadow:0 2px 8px rgba(249,115,22,0.3); transform:translateY(-1px); }
.action-edit { background:linear-gradient(135deg,#3b82f6,#60a5fa); color:#fff; }
.action-edit:hover { box-shadow:0 2px 8px rgba(59,130,246,0.3); transform:translateY(-1px); }
.action-status { background:#fff; color:#d97706; border:1px solid #fbbf24; }
.action-status:hover { background:#fffbeb; }
.action-delete { background:linear-gradient(135deg,#ef4444,#f87171); color:#fff; }
.action-delete:hover { box-shadow:0 2px 8px rgba(239,68,68,0.3); transform:translateY(-1px); }
.custom-pagination { display:flex; justify-content:flex-end; margin-top:20px; padding-top:16px; border-top:1px solid #f3f4f6; }
.custom-pagination :deep(.el-pagination) { --el-pagination-hover-color:#F97316; }
.custom-pagination :deep(.el-pager li) { border-radius:8px; transition:all .2s ease; font-weight:500; }
.custom-pagination :deep(.el-pager li:hover) { color:#F97316; }
.custom-pagination :deep(.el-pager li.is-active) { background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) { border-radius:8px; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) { box-shadow:0 0 0 1px rgba(249,115,22,0.3) inset; }
.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) { box-shadow:0 0 0 1px #F97316 inset; }
.custom-pagination :deep(.btn-prev), .custom-pagination :deep(.btn-next) { border-radius:8px; }
.custom-pagination :deep(.btn-prev:hover), .custom-pagination :deep(.btn-next:hover) { color:#F97316; }
</style>
