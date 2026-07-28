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
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table
        :data="data"
        stripe
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
      >
        <el-table-column prop="moduleName" label="模块名称" min-width="180" />
        <el-table-column prop="moduleCode" label="模块编码" min-width="150">
          <template #default="{ row }">
            <span class="code-text">{{ row.moduleCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="150">
          <template #default="{ row }">
            <span class="desc-text">{{ row.path || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="层级" width="80" align="center">
          <template #default="{ row }">
            <span class="level-tag">{{ row.level }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" align="center">
          <template #default="{ row }">
            <span class="desc-text">{{ row.sortOrder }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 1" class="status-tag status-on">启用</span>
            <span v-else class="status-tag status-off">禁用</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row)">详情</button>
              <button
                type="button"
                :class="['action-btn', row.status === 1 ? 'action-disable' : 'action-enable']"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </button>
              <button type="button" class="action-btn action-delete" @click="handleDelete(row)">删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
}

.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937 !important;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #F97316 !important;
  padding: 14px 0;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #1f2937;
}

.custom-table :deep(.el-table__body tr) {
  transition: background-color 0.2s ease;
}

.custom-table :deep(.el-table__body tr:hover > td) {
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.03), rgba(251, 146, 60, 0.07)) !important;
}

.custom-table :deep(.el-table__body td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 0;
}

.custom-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(255, 247, 237, 0.3);
}

.custom-table :deep(.el-table__empty-block) {
  min-height: 200px;
}

.code-text {
  font-family: 'SF Mono', 'Consolas', 'Liberation Mono', monospace;
  font-size: 13px;
  color: #6b7280;
}

.desc-text {
  font-size: 13px;
  color: #9ca3af;
}

.level-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-detail {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}
.action-detail:hover {
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.action-disable {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}
.action-disable:hover {
  background: #fde68a;
}

.action-enable {
  background: #d1fae5;
  color: #059669;
  border: 1px solid #a7f3d0;
}
.action-enable:hover {
  background: #a7f3d0;
}

.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}
</style>
