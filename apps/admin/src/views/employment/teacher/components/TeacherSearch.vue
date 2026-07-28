<script setup lang="ts">
const props = defineProps<{
  schoolName: string
  positionName: string
  schoolType: string
  schoolNature: string
  recruitmentType: string
  province: string
  city: string
  district: string
  positionStatus: string
}>()

const emit = defineEmits<{
  (e: 'update:schoolName', val: string): void
  (e: 'update:positionName', val: string): void
  (e: 'update:schoolType', val: string): void
  (e: 'update:schoolNature', val: string): void
  (e: 'update:recruitmentType', val: string): void
  (e: 'update:province', val: string): void
  (e: 'update:city', val: string): void
  (e: 'update:district', val: string): void
  (e: 'update:positionStatus', val: string): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const schoolTypeOptions = ['幼儿园', '小学', '初中', '高中', '中职', '高职', '大学', '特殊教育学校']
const schoolNatureOptions = ['公办', '民办']
const recruitmentTypeOptions = ['编制', '合同制', '特岗教师', '人事代理', '编外聘用']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
</script>

<template>
  <div class="search-card">
    <div class="section-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      筛选条件
    </div>

    <div class="search-form">
      <el-form inline>
        <el-form-item label="学校名称">
          <el-input
            :model-value="schoolName"
            placeholder="学校名称"
            clearable
            style="width: 200px"
            @update:model-value="emit('update:schoolName', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>

        <el-form-item label="岗位名称">
          <el-input
            :model-value="positionName"
            placeholder="岗位名称"
            clearable
            style="width: 160px"
            @update:model-value="emit('update:positionName', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>

        <el-form-item label="学校类型">
          <el-select
            :model-value="schoolType"
            placeholder="全部"
            clearable
            style="width: 130px"
            @update:model-value="emit('update:schoolType', $event)"
          >
            <el-option v-for="item in schoolTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="学校性质">
          <el-select
            :model-value="schoolNature"
            placeholder="全部"
            clearable
            style="width: 110px"
            @update:model-value="emit('update:schoolNature', $event)"
          >
            <el-option v-for="item in schoolNatureOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="招聘类型">
          <el-select
            :model-value="recruitmentType"
            placeholder="全部"
            clearable
            style="width: 130px"
            @update:model-value="emit('update:recruitmentType', $event)"
          >
            <el-option v-for="item in recruitmentTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="省份">
          <el-input
            :model-value="province"
            placeholder="省份"
            clearable
            style="width: 100px"
            @update:model-value="emit('update:province', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>

        <el-form-item label="城市">
          <el-input
            :model-value="city"
            placeholder="城市"
            clearable
            style="width: 100px"
            @update:model-value="emit('update:city', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>

        <el-form-item label="区县">
          <el-input
            :model-value="district"
            placeholder="区县"
            clearable
            style="width: 100px"
            @update:model-value="emit('update:district', $event)"
            @keyup.enter="emit('search')"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            :model-value="positionStatus"
            placeholder="全部"
            clearable
            style="width: 110px"
            @update:model-value="emit('update:positionStatus', $event)"
          >
            <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
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
