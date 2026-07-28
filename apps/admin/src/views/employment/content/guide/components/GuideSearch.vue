<script setup lang="ts">
import { GuideCategoryLabel, GuideTypeOptions } from '@/types/employment/guide'

const props = defineProps<{
  title: string | undefined
  guideCategory: string | undefined
  guideType: string | undefined
  isTop: boolean | undefined
}>()

const emit = defineEmits<{
  'update:title': [val: string | undefined]
  'update:guideCategory': [val: string | undefined]
  'update:guideType': [val: string | undefined]
  'update:isTop': [val: boolean | undefined]
  search: []
  reset: []
}>()
</script>

<template>
  <div class="search-card">
    <div class="search-header">
      <span class="search-icon">🔍</span>
      <span class="search-label">筛选条件</span>
    </div>
    <el-form inline class="search-form">
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
      <el-form-item class="search-actions">
        <button type="button" class="btn-search" @click="emit('search')">查询</button>
        <button type="button" class="btn-reset" @click="emit('reset')">重置</button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.search-card { background: #fff; border-radius: 12px; border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; padding: 20px 24px 8px; margin-bottom: 16px; }
.search-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
.search-icon { font-size: 16px; }
.search-label { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border-radius: 20px; padding: 4px 16px; font-size: 13px; font-weight: 500; }
.search-actions { margin-left: auto; }
.btn-search { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; padding: 8px 24px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-search:hover { filter: brightness(1.1); transform: translateY(-1px); }
.btn-reset { background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; padding: 8px 24px; font-size: 14px; cursor: pointer; transition: all 0.2s; }
.btn-reset:hover { border-color: #F97316; color: #F97316; }
</style>
