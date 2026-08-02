<script setup lang="ts">
const props = defineProps<{
  enterpriseName: string
  cityName: string
  enterpriseNature: string | undefined
  enterpriseType: string
  recruitmentStatus: string | undefined
  isDeleted: boolean | undefined
  natureOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:enterpriseName', val: string): void
  (e: 'update:cityName', val: string): void
  (e: 'update:enterpriseNature', val: string | undefined): void
  (e: 'update:enterpriseType', val: string): void
  (e: 'update:recruitmentStatus', val: string | undefined): void
  (e: 'update:isDeleted', val: boolean | undefined): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const handleReset = () => {
  emit('update:enterpriseName', '')
  emit('update:cityName', '')
  emit('update:enterpriseNature', undefined)
  emit('update:enterpriseType', '')
  emit('update:recruitmentStatus', undefined)
  emit('update:isDeleted', undefined)
  emit('reset')
}
</script>

<template>
  <div class="search-card">
    <div class="search-header">
      <span class="search-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        筛选条件
      </span>
    </div>
    <div class="search-body">
      <el-form inline class="search-form">
        <el-form-item label="企业名称">
          <el-input
            :model-value="enterpriseName"
            placeholder="企业名称模糊搜索"
            clearable
            style="width: 180px"
            @input="emit('update:enterpriseName', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>
        <el-form-item label="城市名称">
          <el-input
            :model-value="cityName"
            placeholder="城市名称模糊搜索"
            clearable
            style="width: 150px"
            @input="emit('update:cityName', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>
        <el-form-item label="企业性质">
          <el-select
            :model-value="enterpriseNature"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="emit('update:enterpriseNature', $event ?? undefined)"
          >
            <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="企业类型">
          <el-input
            :model-value="enterpriseType"
            placeholder="类型模糊搜索"
            clearable
            style="width: 150px"
            @input="emit('update:enterpriseType', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>
        <el-form-item label="招聘状态">
          <el-select
            :model-value="recruitmentStatus"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="emit('update:recruitmentStatus', $event ?? undefined)"
          >
            <el-option label="招聘中" value="招聘中" />
            <el-option label="已结束" value="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            :model-value="isDeleted"
            placeholder="全部"
            clearable
            style="width: 100px"
            @change="emit('update:isDeleted', $event ?? undefined)"
          >
            <el-option label="启用" :value="false" />
            <el-option label="禁用" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <button type="button" class="confirm-btn" @click="emit('search')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            查询
          </button>
          <button type="button" class="reset-btn" @click="handleReset">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            重置
          </button>
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.search-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

.search-header {
  padding: 16px 20px 0;
}

.search-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 16px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.search-pill svg {
  width: 14px;
  height: 14px;
}

.search-body {
  padding: 16px 20px 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-form :deep(.el-form-item__label) {
  color: #6b7280;
  font-weight: 500;
  font-size: 13px;
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

.confirm-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.confirm-btn svg {
  width: 15px;
  height: 15px;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-left: 10px;
}

.reset-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.reset-btn svg {
  width: 15px;
  height: 15px;
}
</style>
