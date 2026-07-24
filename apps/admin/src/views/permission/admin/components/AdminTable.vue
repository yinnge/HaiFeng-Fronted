<!-- apps/admin/src/views/permission/admin/components/AdminTable.vue -->
<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { deleteAdmin, toggleAdminStatus } from '@/api/permission/admin'
import type { AdminVO } from '@/types/permission/admin'

defineProps<{
  data: AdminVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', id: string): void
  (e: 'refresh'): void
}>()

const handleToggleStatus = async (row: AdminVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}管理员"${row.username}"吗？`, '提示', {
      type: 'warning',
    })
    const res = await toggleAdminStatus(row.id)
    if (res.data.code === 200) {
      ElMessage.success(`${action}成功`)
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || `${action}失败`)
    }
  } catch {
    // 用户取消
  }
}

const handleDelete = async (row: AdminVO) => {
  try {
    await ElMessageBox.confirm(`确定要删除管理员"${row.username}"吗？此操作不可恢复！`, '警告', {
      type: 'error',
    })
    const res = await deleteAdmin(row.id)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

const pageSizes = [10, 20, 30, 50, 100, 200, 500, 1000]
</script>

<template>
  <div class="bg-white rounded-lg p-5">
    <el-table :data="data" v-loading="loading" stripe>
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="realName" label="姓名" min-width="100">
        <template #default="{ row }">
          <span>{{ row.realName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="120">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="roleName" label="角色" min-width="100">
        <template #default="{ row }">
          <el-tag type="info" size="small">{{ row.roleName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'primary' : 'warning'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row.id)">详情</el-button>
          <el-button
            :type="row.status === 1 ? 'warning' : 'success'"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex justify-end mt-4">
      <el-pagination
        :current-page="page"
        :page-size="size"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @current-change="emit('page-change', $event)"
        @size-change="emit('size-change', $event)"
      />
    </div>
  </div>
</template>
