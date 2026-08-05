<script setup lang="ts">
const props = defineProps<{
  positionName: string | undefined
  organizingDept: string | undefined
  serviceUnit: string | undefined
  projectType: string | undefined
  year: string | undefined
  serviceType: string | undefined
  province: string | undefined
  city: string | undefined
  county: string | undefined
  positionStatus: string | undefined
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
const yearOptions = ['2027', '2026', '2025', '2024', '2023', '2022']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']
</script>

<template>
  <div class="search-card">
    <div class="section-label">
      <span class="search-icon">🔍</span>
      <span>筛选条件</span>
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
            <el-select :model-value="year" placeholder="招募年份" clearable filterable allow-create default-first-option style="width: 140px" @update:model-value="emit('update:year', $event)">
              <el-option v-for="item in yearOptions" :key="item" :label="item" :value="item" />
            </el-select>
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
            <el-select :model-value="province" placeholder="省份" clearable filterable allow-create default-first-option style="width: 120px" @update:model-value="emit('update:province', $event)">
              <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
            </el-select>
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
            <button type="button" class="search-btn" @click="emit('search')">查询</button>
            <button type="button" class="reset-btn" @click="emit('reset')">重置</button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped>
.search-card { position: relative; z-index: 1; background: #fff; border-radius: 12px; padding: 24px; border: 1px solid rgba(249,115,22,0.1); border-top: 3px solid #F97316; border-bottom: 3px solid #FB923C; transition: all .3s ease; margin-bottom: 16px; }
.search-card:hover { box-shadow: 0 4px 16px rgba(249,115,22,0.08); }
.section-label { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; font-size: 13px; font-weight: 600; border-radius: 20px; margin-bottom: 20px; }
.search-icon { font-size: 14px; }
.search-actions { margin-left: auto; }
.search-form :deep(.el-form-item) { margin-bottom: 0; }
.search-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.search-form :deep(.el-input__wrapper), .search-form :deep(.el-select__wrapper) { border-radius: 8px; transition: all .25s ease; }
.search-form :deep(.el-input__wrapper:hover), .search-form :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249,115,22,0.3) inset; }
.search-form :deep(.el-input__wrapper.is-focus), .search-form :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }
.search-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 24px; background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .25s ease; box-shadow: 0 2px 8px rgba(249,115,22,0.3); }
.search-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249,115,22,0.4); }
.reset-btn { display: inline-flex; align-items: center; padding: 8px 20px; background: #fff; color: #6b7280; border: 1px solid #d1d5db; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .25s ease; }
.reset-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
</style>
