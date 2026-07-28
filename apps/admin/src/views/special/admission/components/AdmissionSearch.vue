<script setup lang="ts">
import { reactive } from 'vue'
import type { ChannelQueryDTO } from '@/types/special/channel'

const props = defineProps<{
  modelValue: ChannelQueryDTO
  displayTypeOptions: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: ChannelQueryDTO): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const queryParams = reactive({ ...props.modelValue })

const handleSearch = () => {
  emit('update:modelValue', { ...queryParams })
  emit('search')
}

const handleReset = () => {
  queryParams.displayType = undefined
  queryParams.channelName = ''
  queryParams.page = 1
  emit('update:modelValue', { ...queryParams })
  emit('reset')
}

const handleKeyup = (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleSearch()
}
</script>

<template>
  <div class="search-card">
    <div class="search-card-header">
      <span class="search-card-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <span class="search-card-title">筛选条件</span>
    </div>
    <el-form :model="queryParams" inline class="search-form">
      <el-form-item label="展示类型">
        <el-select
          v-model="queryParams.displayType"
          placeholder="全部"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="opt in displayTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="通道名称">
        <el-input
          v-model="queryParams.channelName"
          placeholder="通道名称模糊搜索"
          clearable
          style="width: 180px"
          @keyup="handleKeyup"
        />
      </el-form-item>
      <el-form-item class="search-actions">
        <button type="button" class="search-btn" @click="handleSearch">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          查询
        </button>
        <button type="button" class="reset-btn" @click="handleReset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
          重置
        </button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.search-card {
  background: #fff;
  border-radius: 12px;
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  padding: 20px 24px 4px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.search-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.search-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  border-radius: 8px;
  color: #fff;
  flex-shrink: 0;
}

.search-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #F97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  padding: 4px 14px;
  border-radius: 20px;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 16px;
  margin-right: 16px;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.search-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.search-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.search-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-form :deep(.el-select__wrapper) {
  border-radius: 8px;
}

.search-form :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.search-form :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.search-actions {
  margin-left: auto;
}

.search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 22px;
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

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
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
