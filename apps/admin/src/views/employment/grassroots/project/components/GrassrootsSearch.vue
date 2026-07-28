<script setup lang="ts">
const props = defineProps<{
  positionName: string
  organizingDept: string
  serviceUnit: string
  projectType: string
  year: string
  serviceType: string
  province: string
  city: string
  county: string
  positionStatus: string
}>()

const emit = defineEmits<{
  'update:positionName': [val: string]
  'update:organizingDept': [val: string]
  'update:serviceUnit': [val: string]
  'update:projectType': [val: string]
  'update:year': [val: string]
  'update:serviceType': [val: string]
  'update:province': [val: string]
  'update:city': [val: string]
  'update:county': [val: string]
  'update:positionStatus': [val: string]
  search: []
  reset: []
}>()

const projectTypeOptions = ['三支一扶', '西部计划']
const serviceTypeOptions = ['支教', '支农', '支医', '帮扶乡村振兴', '基础教育', '服务三农', '医疗卫生', '基层青年工作', '基层社会管理', '服务新疆', '服务西藏']
const positionStatusOptions = ['招募中', '已结束', '即将开始']
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
          <el-form-item label="组织单位">
            <el-input :model-value="organizingDept" placeholder="组织单位" clearable style="width: 160px" @update:model-value="emit('update:organizingDept', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="服务单位">
            <el-input :model-value="serviceUnit" placeholder="服务单位" clearable style="width: 160px" @update:model-value="emit('update:serviceUnit', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="项目类型">
            <el-select :model-value="projectType" placeholder="全部" clearable style="width: 120px" @update:model-value="emit('update:projectType', $event)">
              <el-option v-for="item in projectTypeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="招募年份">
            <el-input :model-value="year" placeholder="招募年份" clearable style="width: 160px" @update:model-value="emit('update:year', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="服务类型">
            <el-select :model-value="serviceType" placeholder="全部" clearable style="width: 160px" @update:model-value="emit('update:serviceType', $event)">
              <el-option v-for="item in serviceTypeOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
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
      </el-row>
      <el-row :gutter="12">
        <el-col :span="6">
          <el-form-item label="区域">
            <el-input :model-value="county" placeholder="请输入区域" clearable style="width: 100px" @update:model-value="emit('update:county', $event)" @keyup.enter="emit('search')" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="状态">
            <el-select :model-value="positionStatus" placeholder="全部" clearable style="width: 110px" @update:model-value="emit('update:positionStatus', $event)">
              <el-option v-for="item in positionStatusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
