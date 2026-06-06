<!-- apps/admin/src/views/permission/module/components/ModuleSearch.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import type { ModuleQueryDTO } from '@/types/permission/module'

const emit = defineEmits<{
  (e: 'search', params: ModuleQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<ModuleQueryDTO>({
  moduleCode: '',
})

const handleSearch = () => {
  emit('search', { ...searchForm })
}

const handleReset = () => {
  searchForm.moduleCode = ''
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="模块编码">
        <el-input
          v-model="searchForm.moduleCode"
          placeholder="请输入模块编码"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
