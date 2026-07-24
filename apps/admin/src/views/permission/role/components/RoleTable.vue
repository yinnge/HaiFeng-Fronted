<!-- apps/admin/src/views/permission/role/components/RoleTable.vue -->
<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { deleteRole, toggleRoleStatus } from '@/api/permission/role'
import type { RoleVO } from '@/types/permission/role'

defineProps<{
  data: RoleVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', id: string): void
  (e: 'module', id: string, name: string): void
  (e: 'refresh'): void
}>()

const handleToggleStatus = async (row: RoleVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}角色"${row.roleName}"吗？`, '提示', {
      type: 'warning',
    })
    const res = await toggleRoleStatus(row.id)
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

const handleDelete = async (row: RoleVO) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色"${row.roleName}"吗？此操作不可恢复！`, '警告', {
      type: 'error',
    })
    const res = await deleteRole(row.id)
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
      <el-table-column prop="roleName" label="角色名称" min-width="120" />
      <el-table-column prop="roleCode" label="角色编码" min-width="120">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.roleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.description || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'primary' : 'warning'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row.id)">详情</el-button>
          <el-button type="success" link @click="emit('module', row.id, row.roleName)">分配权限</el-button>
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
