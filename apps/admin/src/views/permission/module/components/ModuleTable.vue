<!-- apps/admin/src/views/permission/module/components/ModuleTable.vue -->
<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { deleteModule, toggleModuleStatus } from '@/api/permission/module'
import type { ModuleTreeVO } from '@/types/permission/module'

defineProps<{
  data: ModuleTreeVO[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'detail', module: ModuleTreeVO): void
  (e: 'refresh'): void
}>()

const handleToggleStatus = async (row: ModuleTreeVO) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}模块"${row.moduleName}"吗？`, '提示', {
      type: 'warning',
    })
    const res = await toggleModuleStatus(row.id)
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

const handleDelete = async (row: ModuleTreeVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模块"${row.moduleName}"吗？${row.children?.length ? '该模块下有子模块，将一并删除！' : ''}此操作不可恢复！`,
      '警告',
      {
        type: 'error',
      }
    )
    const res = await deleteModule(row.id)
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
</script>

<template>
  <div class="bg-white rounded-lg">
    <el-table
      :data="data"
      v-loading="loading"
      stripe
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      default-expand-all
    >
      <el-table-column prop="moduleName" label="模块名称" min-width="180" />
      <el-table-column prop="moduleCode" label="模块编码" min-width="150">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.moduleCode }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路径" min-width="150">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.path || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="层级" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" align="center">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.sortOrder }}</span>
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
          <el-button type="primary" link @click="emit('detail', row)">详情</el-button>
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
  </div>
</template>
