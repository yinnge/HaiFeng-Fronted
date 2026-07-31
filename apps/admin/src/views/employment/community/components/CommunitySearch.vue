<script setup lang="ts">
const props = defineProps<{
  positionName: string
  communityName: string
  supervisingDept: string
  positionType: string
  province: string
  city: string
  positionStatus: string
}>()

const emit = defineEmits<{
  'update:positionName': [val: string]
  'update:communityName': [val: string]
  'update:supervisingDept': [val: string]
  'update:positionType': [val: string]
  'update:province': [val: string]
  'update:city': [val: string]
  'update:positionStatus': [val: string]
  search: []
  reset: []
}>()

const positionTypeOptions = ['社区党务工作者', '社区服务工作者', '社区网格员', '社区调解员', '社区安全员', '社区文化专干', '社会工作师', '综合岗', '其他']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
</script>

<template>
  <div class="search-card">
    <div class="section-label">🔍 筛选条件</div>
    <el-form inline class="search-form">
      <div class="filter-fields">
        <el-form-item label="岗位名称">
          <el-input :model-value="positionName" placeholder="岗位名称" clearable style="width: 160px" @update:model-value="emit('update:positionName', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="社区名称">
          <el-input :model-value="communityName" placeholder="社区名称" clearable style="width: 160px" @update:model-value="emit('update:communityName', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="主管部门">
          <el-input :model-value="supervisingDept" placeholder="主管部门" clearable style="width: 160px" @update:model-value="emit('update:supervisingDept', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="岗位类型">
          <el-select :model-value="positionType" placeholder="全部" clearable style="width: 140px" @update:model-value="emit('update:positionType', $event)">
            <el-option v-for="item in positionTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="省份">
          <el-input :model-value="province" placeholder="省份" clearable style="width: 100px" @update:model-value="emit('update:province', $event)" @keyup.enter="emit('search')" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input :model-value="city" placeholder="城市" clearable style="width: 100px" @update:model-value="emit('update:city', $event)" @keyup.enter="emit('search')" />
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
.search-card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid rgba(249,115,22,0.1); border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; transition: all .3s ease; margin-bottom: 16px; }
.search-card:hover { box-shadow: 0 4px 16px rgba(249,115,22,0.08); }
.section-label { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; font-size: 13px; font-weight: 600; border-radius: 20px; margin-bottom: 20px; }
.search-form { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.filter-fields { display: flex; align-items: flex-start; flex-wrap: wrap; gap: 8px; }
.search-form :deep(.el-form-item) { margin-bottom: 0; }
.search-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.search-form :deep(.el-input__wrapper), .search-form :deep(.el-select__wrapper) { border-radius: 8px; transition: all .25s ease; }
.search-form :deep(.el-input__wrapper:hover), .search-form :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset; }
.search-form :deep(.el-input__wrapper.is-focus), .search-form :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.search-actions { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.search-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 24px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .25s ease; box-shadow: 0 2px 8px rgba(249,115,22,0.3); }
.search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249,115,22,0.4); }
.reset-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .25s ease; }
.reset-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
</style>
