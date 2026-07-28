<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import type { CommunityListVO } from '@/types/employment/community'

const props = defineProps<{
  data: CommunityListVO[]
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
  'status-change': [row: CommunityListVO, status: string]
  'batch-delete': []
  'pre-validate': []
  import: []
  refresh: []
  'selection-change': [rows: CommunityListVO[]]
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
    <el-table :data="data" v-loading="loading" stripe @selection-change="emit('selection-change', $event)">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="communityName" label="社区名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="positionName" label="岗位名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="supervisingDept" label="主管部门" width="140" show-overflow-tooltip />
      <el-table-column prop="positionType" label="岗位类型" width="120" show-overflow-tooltip />
      <el-table-column prop="province" label="省份" width="80" />
      <el-table-column prop="city" label="城市" width="80" />
      <el-table-column prop="positionStatus" label="状态" width="100" align="center">
        <template #default="{ row }">
          <span class="status-pill" :class="statusTag[row.positionStatus] || 'info'">{{ row.positionStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <button type="button" class="btn-action btn-detail" @click="emit('detail', row.id)">详情</button>
          <button type="button" class="btn-action btn-edit" @click="emit('edit', row.id)">修改</button>
          <el-dropdown @command="(val: string) => emit('status-change', row, val)">
            <button type="button" class="btn-action btn-status">{{ row.positionStatus }}<el-icon><ArrowDown /></el-icon></button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="opt in statusOptions" :key="opt" :command="opt">{{ opt }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <button type="button" class="btn-action btn-delete" @click="emit('delete', row.id)">删除</button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="currentPageSize" :page-sizes="[10, 20, 30, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" />
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.toolbar-left { display: flex; gap: 8px; }
.btn-tool { border-radius: 20px; padding: 8px 20px; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; }
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
.btn-action { background: none; border: 1px solid; border-radius: 16px; padding: 4px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s; margin: 0 2px; }
.btn-detail { color: #F97316; border-color: #F97316; }
.btn-detail:hover { background: #F97316; color: #fff; }
.btn-edit { color: #eab308; border-color: #eab308; }
.btn-edit:hover { background: #eab308; color: #fff; }
.btn-status { color: #3b82f6; border-color: #3b82f6; background: none; }
.btn-status:hover { background: #3b82f6; color: #fff; }
.btn-delete { color: #ef4444; border-color: #ef4444; }
.btn-delete:hover { background: #ef4444; color: #fff; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
