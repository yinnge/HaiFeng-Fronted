<script setup lang="ts">
const props = defineProps<{
  positionName: string
  developingUnit: string
  employingUnit: string
  positionCategory: string
  province: string
  city: string
  district: string
  maxServiceYears: number | undefined
  positionStatus: string
}>()

const emit = defineEmits<{
  'update:positionName': [val: string]
  'update:developingUnit': [val: string]
  'update:employingUnit': [val: string]
  'update:positionCategory': [val: string]
  'update:province': [val: string]
  'update:city': [val: string]
  'update:district': [val: string]
  'update:maxServiceYears': [val: number | undefined]
  'update:positionStatus': [val: string]
  search: []
  reset: []
}>()

const positionCategoryOptions = ['公共管理', '公共服务', '公共环境', '公共安全', '设施维护', '其他']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
</script>

<template>
  <div class="search-card">
    <div class="section-label">筛选条件</div>
    <el-form class="search-form">
      <div class="filter-fields">
        <el-form-item label="岗位名称">
          <el-input :model-value="positionName" placeholder="岗位名称" clearable style="width: 160px" @update:model-value="emit('update:positionName', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="开发单位">
          <el-input :model-value="developingUnit" placeholder="开发单位" clearable style="width: 160px" @update:model-value="emit('update:developingUnit', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="用工单位">
          <el-input :model-value="employingUnit" placeholder="用工单位" clearable style="width: 160px" @update:model-value="emit('update:employingUnit', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="岗位类别">
          <el-select :model-value="positionCategory" placeholder="全部" clearable style="width: 140px" @update:model-value="emit('update:positionCategory', $event)">
            <el-option v-for="item in positionCategoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="省份">
          <el-input :model-value="province" placeholder="省份" clearable style="width: 100px" @update:model-value="emit('update:province', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input :model-value="city" placeholder="城市" clearable style="width: 100px" @update:model-value="emit('update:city', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="区域">
          <el-input :model-value="district" placeholder="请输入区域" clearable style="width: 100px" @update:model-value="emit('update:district', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="最长服务年限">
          <el-input-number :model-value="maxServiceYears" :min="1" style="width: 120px" @update:model-value="emit('update:maxServiceYears', $event)" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select :model-value="positionStatus" placeholder="全部" clearable style="width: 110px" @update:model-value="emit('update:positionStatus', $event)">
            <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </div>
      <div class="search-actions">
        <button type="button" class="search-btn" @click="emit('search')">查询</button>
        <button type="button" class="reset-btn" @click="emit('reset')">重置</button>
      </div>
    </el-form>
  </div>
</template>

<style scoped>
.search-card { position: relative; z-index: 1; background:#fff; border-radius:12px; padding:24px; border:1px solid rgba(249,115,22,0.1); border-top:3px solid #F97316; border-bottom:3px solid #FB923C; transition:all .3s ease; margin-bottom: 16px; }
.search-card:hover { box-shadow:0 4px 16px rgba(249,115,22,0.08); }
.section-label { display:inline-flex; align-items:center; gap:6px; padding:6px 16px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; font-size:13px; font-weight:600; border-radius:20px; margin-bottom:20px; }
.search-form { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; }
.filter-fields { display:flex; align-items:flex-start; flex-wrap:wrap; gap:8px; }
.search-form :deep(.el-form-item) { margin-bottom:0; }
.search-form :deep(.el-form-item__label) { font-weight:500; color:#374151; }
.search-form :deep(.el-input__wrapper), .search-form :deep(.el-select__wrapper) { border-radius:8px; transition:all .25s ease; }
.search-form :deep(.el-input__wrapper:hover), .search-form :deep(.el-select__wrapper:hover) { box-shadow:0 0 0 1px rgba(249,115,22,0.3) inset; }
.search-form :deep(.el-input__wrapper.is-focus), .search-form :deep(.el-select__wrapper.is-focused) { box-shadow:0 0 0 1px #F97316 inset; }
.search-actions { display:flex; align-items:center; gap:10px; margin-left:auto; }
.search-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 24px; background:linear-gradient(135deg,#F97316,#FB923C); color:#fff; border:none; border-radius:20px; font-size:14px; font-weight:600; cursor:pointer; transition:all .25s ease; box-shadow:0 2px 8px rgba(249,115,22,0.3); }
.search-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(249,115,22,0.4); }
.reset-btn { display:inline-flex; align-items:center; padding:8px 20px; background:#fff; color:#6b7280; border:1px solid #d1d5db; border-radius:20px; font-size:14px; font-weight:500; cursor:pointer; transition:all .25s ease; }
.reset-btn:hover { color:#374151; border-color:#9ca3af; background:#f9fafb; }
</style>
