<script setup lang="ts">
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
  disable: [row: ExamGuideListVO]
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
      <button type="button" class="btn-tool btn-outline" @click="emit('refresh')">刷新</button>
      <button v-if="selectedIds.length > 0" type="button" class="btn-tool btn-red" @click="emit('batch-delete')">批量硬删除</button>
    </div>
    <el-table :data="data" v-loading="loading" stripe @selection-change="emit('selection-change', $event)">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="subtitle" label="副标题" min-width="160" show-overflow-tooltip />
      <el-table-column label="指南类别" width="120">
        <template #default="{ row }">{{ categoryLabel(row.guideCategory) }}</template>
      </el-table-column>
      <el-table-column prop="guideType" label="指南类型" width="120" />
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
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <button type="button" class="btn-action btn-detail" @click="emit('detail', row.id)">详情</button>
          <button type="button" class="btn-action btn-edit" @click="emit('edit', row.id)">修改</button>
          <button type="button" class="btn-action btn-disable" @click="emit('disable', row)">禁用</button>
          <button type="button" class="btn-action btn-delete" @click="emit('delete', row.id)">硬删除</button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-wrap">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="currentPageSize" :page-sizes="[10, 20, 30, 50, 100]" :total="total" layout="total, sizes, prev, pager, next" />
    </div>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.btn-tool { border-radius: 20px; padding: 8px 20px; font-size: 13px; cursor: pointer; border: none; transition: all 0.2s; }
.btn-tool:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-outline { background: #fff; color: #6b7280; border: 1px solid #d1d5db; }
.btn-outline:hover { border-color: #F97316; color: #F97316; }
.btn-red { background: linear-gradient(135deg, #ef4444, #f87171); color: #fff; }
.pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.pill-orange { background: #ffedd5; color: #ea580c; }
.pill-red { background: #fee2e2; color: #dc2626; }
.btn-action { background: none; border: 1px solid; border-radius: 16px; padding: 4px 12px; font-size: 12px; cursor: pointer; transition: all 0.2s; margin: 0 2px; }
.btn-detail { color: #F97316; border-color: #F97316; }
.btn-detail:hover { background: #F97316; color: #fff; }
.btn-edit { color: #eab308; border-color: #eab308; }
.btn-edit:hover { background: #eab308; color: #fff; }
.btn-disable { color: #6b7280; border-color: #9ca3af; }
.btn-disable:hover { background: #6b7280; color: #fff; }
.btn-delete { color: #ef4444; border-color: #ef4444; }
.btn-delete:hover { background: #ef4444; color: #fff; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
