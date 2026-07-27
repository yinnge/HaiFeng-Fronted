<script setup lang="ts">
import { reactive } from 'vue'
import type { PlannerQueryDTO } from '@/types/home/planner'

const emit = defineEmits<{
  (e: 'search', params: Pick<PlannerQueryDTO, 'name' | 'status'>): void
  (e: 'reset'): void
}>()

const searchForm = reactive<{
  name: string
  status: number | undefined
}>({
  name: '',
  status: undefined,
})

const handleSearch = () => {
  emit('search', { name: searchForm.name, status: searchForm.status })
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = undefined
  emit('reset')
}
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
    <el-form :model="searchForm" inline class="search-form">
      <div class="filter-fields">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="姓名模糊搜索"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 130px"
          >
            <el-option label="展示" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
      </div>
      <div class="search-actions">
        <button type="button" class="search-btn" @click="handleSearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          查询
        </button>
        <button type="button" class="reset-btn" @click="handleReset">重置</button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}
.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 20px;
}
.label-icon { display: flex; align-items: center; }
.search-form {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.filter-fields {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.search-form :deep(.el-form-item) { margin-bottom: 0; }
.search-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.search-form :deep(.el-input__wrapper),
.search-form :deep(.el-select__wrapper) { border-radius: 8px; transition: all 0.25s ease; }
.search-form :deep(.el-input__wrapper:hover),
.search-form :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.search-form :deep(.el-input__wrapper.is-focus),
.search-form :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.search-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.search-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff; border: none; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.search-btn:active { transform: translateY(0); }
.reset-btn {
  display: inline-flex; align-items: center;
  padding: 8px 20px; background: #fff; color: #6b7280;
  border: 1px solid #d1d5db; border-radius: 20px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.25s ease;
}
.reset-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.reset-btn:active { background: #f3f4f6; }
</style>
