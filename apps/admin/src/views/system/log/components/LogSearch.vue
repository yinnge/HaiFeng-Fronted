<script setup lang="ts">
import { reactive } from 'vue'
import type { AdminLogQueryDTO } from '@/types/system/log'

const emit = defineEmits<{
  (e: 'search', params: AdminLogQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<AdminLogQueryDTO, 'page' | 'size'>>({
  adminName: '',
  result: undefined,
  requestMethod: undefined,
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.adminName = ''
  searchForm.result = undefined
  searchForm.requestMethod = undefined
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="管理员">
        <el-input
          v-model="searchForm.adminName"
          placeholder="请输入管理员姓名"
          clearable
          style="width: 160px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="操作结果">
        <el-select
          v-model="searchForm.result"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="成功" value="SUCCESS" />
          <el-option label="失败" value="FAIL" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求方法">
        <el-select
          v-model="searchForm.requestMethod"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
