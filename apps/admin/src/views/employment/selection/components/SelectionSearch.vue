<script setup lang="ts">
const props = defineProps<{
  positionName: string
  targetUnit: string
  organizingDept: string
  selectionType: string
  year: string
  province: string
  politicalStatus: string
  positionStatus: string
}>()

const emit = defineEmits<{
  (e: 'update:positionName', val: string): void
  (e: 'update:targetUnit', val: string): void
  (e: 'update:organizingDept', val: string): void
  (e: 'update:selectionType', val: string): void
  (e: 'update:year', val: string): void
  (e: 'update:province', val: string): void
  (e: 'update:politicalStatus', val: string): void
  (e: 'update:positionStatus', val: string): void
  (e: 'search'): void
  (e: 'reset'): void
}>()

const selectionTypeOptions = ['定向选调', '非定向选调', '急需紧缺专业选调']
const politicalStatusOptions = ['中共党员', '中共预备党员', '共青团员', '不限']
const positionStatusOptions = ['报名中', '笔试阶段', '面试阶段', '已结束', '即将开始']
const yearOptions = ['2027', '2026', '2025', '2024', '2023', '2022']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']
</script>

<template>
  <div class="search-card">
    <div class="section-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      筛选条件
    </div>

    <div class="search-form">
      <el-form inline>
        <el-row :gutter="12">
          <el-col :span="6">
            <el-form-item label="职位名称">
              <el-input
                :model-value="positionName"
                placeholder="职位名称"
                clearable
                style="width: 160px"
                @update:model-value="emit('update:positionName', $event)"
                @keyup.enter="emit('search')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="用人单位">
              <el-input
                :model-value="targetUnit"
                placeholder="用人单位"
                clearable
                style="width: 160px"
                @update:model-value="emit('update:targetUnit', $event)"
                @keyup.enter="emit('search')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="组织部门">
              <el-input
                :model-value="organizingDept"
                placeholder="组织部门"
                clearable
                style="width: 160px"
                @update:model-value="emit('update:organizingDept', $event)"
                @keyup.enter="emit('search')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="选调类型">
              <el-select
                :model-value="selectionType"
                placeholder="全部"
                clearable
                style="width: 150px"
                @update:model-value="emit('update:selectionType', $event)"
              >
                <el-option v-for="item in selectionTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="6">
            <el-form-item label="年份">
              <el-select
                :model-value="year"
                placeholder="年份"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 120px"
                @update:model-value="emit('update:year', $event)"
              >
                <el-option v-for="item in yearOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="省份">
              <el-select
                :model-value="province"
                placeholder="省份"
                clearable
                filterable
                allow-create
                default-first-option
                style="width: 120px"
                @update:model-value="emit('update:province', $event)"
              >
                <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="政治面貌">
              <el-select
                :model-value="politicalStatus"
                placeholder="全部"
                clearable
                style="width: 130px"
                @update:model-value="emit('update:politicalStatus', $event)"
              >
                <el-option v-for="item in politicalStatusOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item class="search-actions">
              <button type="button" class="search-btn" @click="emit('search')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                查询
              </button>
              <button type="button" class="reset-btn" @click="emit('reset')">重置</button>
            </el-form-item>
          </el-col>
        </el-row>
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
