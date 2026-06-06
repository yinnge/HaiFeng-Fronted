<!-- apps/admin/src/views/permission/admin/components/AdminSearch.vue -->
<script setup lang="ts">
import { reactive } from 'vue'
import type { AdminQueryDTO } from '@/types/permission/admin'

const emit = defineEmits<{
  (e: 'search', params: AdminQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<AdminQueryDTO, 'page' | 'size'>>({
  username: '',
  phone: '',
  realName: '',
  status: undefined,
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.realName = ''
  searchForm.status = undefined
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="用户名">
        <el-input
          v-model="searchForm.username"
          placeholder="请输入用户名"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input
          v-model="searchForm.phone"
          placeholder="请输入手机号"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input
          v-model="searchForm.realName"
          placeholder="请输入姓名"
          clearable
          style="width: 150px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部"
          clearable
          style="width: 100px"
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
