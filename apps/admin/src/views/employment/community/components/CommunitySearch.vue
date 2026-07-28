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

const positionTypeOptions = ['社区党务工作者', '社区服务工作者', '社区网格', '社区调解', '社区安全', '社区文化专干', '社会工作', '综合', '其他']
const positionStatusOptions = ['招聘中', '已结束', '即将开始']
</script>

<template>
  <div class="search-card">
    <div class="search-header">
      <span class="search-icon">🔍</span>
      <span class="search-label">筛选条件</span>
    </div>
    <el-form inline class="search-form">
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="岗位名称">
            <el-input :model-value="positionName" placeholder="岗位名称" clearable style="width: 160px" @update:model-value="emit('update:positionName', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="社区名称">
            <el-input :model-value="communityName" placeholder="社区名称" clearable style="width: 160px" @update:model-value="emit('update:communityName', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="主管部门">
            <el-input :model-value="supervisingDept" placeholder="主管部门" clearable style="width: 160px" @update:model-value="emit('update:supervisingDept', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="岗位类型">
            <el-select :model-value="positionType" placeholder="全部" clearable style="width: 140px" @update:model-value="emit('update:positionType', $event)">
              <el-option v-for="item in positionTypeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="省份">
            <el-input :model-value="province" placeholder="省份" clearable style="width: 100px" @update:model-value="emit('update:province', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="城市">
            <el-input :model-value="city" placeholder="城市" clearable style="width: 100px" @update:model-value="emit('update:city', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <el-select :model-value="positionStatus" placeholder="全部" clearable style="width: 110px" @update:model-value="emit('update:positionStatus', $event)">
              <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item class="search-actions">
            <button type="button" class="btn-search" @click="emit('search')">查询</button>
            <button type="button" class="btn-reset" @click="emit('reset')">重置</button>
          </el-form-item>
        </el-col>
      </el-row>
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
