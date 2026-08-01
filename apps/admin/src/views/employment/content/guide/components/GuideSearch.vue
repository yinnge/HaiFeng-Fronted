<script setup lang="ts">
import { GuideCategoryLabel, GuideTypeOptions } from '@/types/employment/guide'

const props = defineProps<{
  title: string | undefined
  guideCategory: string | undefined
  guideType: string | undefined
  isTop: boolean | undefined
  status: number | undefined
}>()

const emit = defineEmits<{
  'update:title': [val: string | undefined]
  'update:guideCategory': [val: string | undefined]
  'update:guideType': [val: string | undefined]
  'update:isTop': [val: boolean | undefined]
  'update:status': [val: number | undefined]
  search: []
  reset: []
}>()

const statusOptions = [
  { label: '启用', value: 0 },
  { label: '禁用', value: 1 },
]
</script>

<template>
  <div class="search-card">
    <div class="section-label">
      <span class="label-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      筛选条件
    </div>
    <el-form inline class="search-form">
      <div class="filter-fields">
        <el-form-item label="标题">
          <el-input :model-value="title" placeholder="标题模糊搜索" clearable style="width: 180px" @update:model-value="emit('update:title', $event || undefined)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="指南类别">
          <el-select :model-value="guideCategory" placeholder="全部" clearable style="width: 140px" @update:model-value="emit('update:guideCategory', $event || undefined)">
            <el-option v-for="(label, key) in GuideCategoryLabel" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>
        <el-form-item label="指南类型">
          <el-select :model-value="guideType" placeholder="全部" clearable style="width: 140px" @update:model-value="emit('update:guideType', $event || undefined)">
            <el-option v-for="t in GuideTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否置顶">
          <el-select :model-value="isTop" placeholder="全部" clearable style="width: 120px" @update:model-value="emit('update:isTop', $event)">
            <el-option label="置顶" :value="true" />
            <el-option label="未置顶" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select :model-value="status" placeholder="全部" clearable style="width: 110px" @update:model-value="emit('update:status', $event === '' || $event === undefined ? undefined : $event)">
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </el-form-item>
      </div>
      <div class="search-actions">
        <button type="button" class="search-btn" @click="emit('search')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          查询
        </button>
        <button type="button" class="reset-btn" @click="emit('reset')">重置</button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.search-card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid rgba(249, 115, 22, 0.1); border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; }
.section-label { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; font-size: 13px; font-weight: 600; border-radius: 20px; margin-bottom: 20px; }
.label-icon { display: flex; align-items: center; }
.search-form { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.filter-fields { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 8px; }
.search-form :deep(.el-form-item) { margin-bottom: 0; }
.search-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) { border-radius: 8px; transition: all 0.25s ease; }
.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.search-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.search-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 24px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.25s ease; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3); }
.search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.search-btn:active { transform: translateY(0); }
.reset-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.25s ease; }
.reset-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.reset-btn:active { background: #f3f4f6; }
</style>
