<script setup lang="ts">
import { NoticeCategoryLabel, NoticeTypeOptions } from '@/types/employment/notice'

const props = defineProps<{
  title: string | undefined
  noticeCategory: string | undefined
  noticeType: string | undefined
  province: string | undefined
  city: string | undefined
  year: string | undefined
  isTop: boolean | undefined
  isImportant: boolean | undefined
}>()

const emit = defineEmits<{
  (e: 'update:title', val: string | undefined): void
  (e: 'update:noticeCategory', val: string | undefined): void
  (e: 'update:noticeType', val: string | undefined): void
  (e: 'update:province', val: string | undefined): void
  (e: 'update:city', val: string | undefined): void
  (e: 'update:year', val: string | undefined): void
  (e: 'update:isTop', val: boolean | undefined): void
  (e: 'update:isImportant', val: boolean | undefined): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const yearOptions = ['2026', '2025', '2024', '2023', '2022']
const booleanOptions = [
  { label: '是', value: true },
  { label: '否', value: false },
]
</script>

<template>
  <div class="search-card">
    <div class="section-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      筛选条件
    </div>

    <div class="search-form">
      <el-form inline>
        <el-form-item label="标题">
          <el-input
            :model-value="title"
            placeholder="标题模糊搜索"
            clearable
            style="width: 180px"
            @update:model-value="emit('update:title', $event || undefined)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>

        <el-form-item label="公告类别">
          <el-select
            :model-value="noticeCategory"
            placeholder="全部"
            clearable
            style="width: 140px"
            @update:model-value="emit('update:noticeCategory', $event || undefined)"
          >
            <el-option v-for="(label, key) in NoticeCategoryLabel" :key="key" :label="label" :value="key" />
          </el-select>
        </el-form-item>

        <el-form-item label="公告类型">
          <el-select
            :model-value="noticeType"
            placeholder="全部"
            clearable
            style="width: 140px"
            @update:model-value="emit('update:noticeType', $event || undefined)"
          >
            <el-option v-for="t in NoticeTypeOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>

        <el-form-item label="省份">
          <el-input
            :model-value="province"
            placeholder="省份"
            clearable
            style="width: 120px"
            @update:model-value="emit('update:province', $event || undefined)"
          />
        </el-form-item>

        <el-form-item label="城市">
          <el-input
            :model-value="city"
            placeholder="城市"
            clearable
            style="width: 120px"
            @update:model-value="emit('update:city', $event || undefined)"
          />
        </el-form-item>

        <el-form-item label="年份">
          <el-select
            :model-value="year"
            placeholder="全部"
            clearable
            style="width: 110px"
            @update:model-value="emit('update:year', $event || undefined)"
          >
            <el-option v-for="y in yearOptions" :key="y" :label="y" :value="y" />
          </el-select>
        </el-form-item>

        <el-form-item label="置顶">
          <el-select
            :model-value="isTop"
            placeholder="全部"
            clearable
            style="width: 100px"
            @update:model-value="emit('update:isTop', $event)"
          >
            <el-option v-for="item in booleanOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="重要">
          <el-select
            :model-value="isImportant"
            placeholder="全部"
            clearable
            style="width: 100px"
            @update:model-value="emit('update:isImportant', $event)"
          >
            <el-option v-for="item in booleanOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item class="search-actions">
          <button type="button" class="search-btn" @click="emit('search')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            查询
          </button>
          <button type="button" class="reset-btn" @click="emit('reset')">重置</button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.search-card {
  background: #fff;
  border-radius: 12px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  padding: 20px 24px;
  margin-bottom: 20px;
  transition: box-shadow 0.25s ease;
}

.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-label svg {
  width: 14px;
  height: 14px;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-actions {
  margin-left: auto;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 20px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.search-btn svg {
  width: 14px;
  height: 14px;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}
</style>
