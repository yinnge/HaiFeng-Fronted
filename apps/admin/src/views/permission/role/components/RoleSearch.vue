<!-- apps/admin/src/views/permission/role/components/RoleSearch.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import type { RoleQueryDTO } from '@/types/permission/role'

const emit = defineEmits<{
  (e: 'search', params: RoleQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<RoleQueryDTO, 'page' | 'size'>>({
  roleName: '',
  status: undefined,
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.roleName = ''
  searchForm.status = undefined
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="角色名称">
        <el-input
          v-model="searchForm.roleName"
          placeholder="请输入角色名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
