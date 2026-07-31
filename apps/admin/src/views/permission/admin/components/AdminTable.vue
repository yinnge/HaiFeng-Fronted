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
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="姓名" min-width="100">
          <template #default="{ row }">
            <span class="desc-text">{{ row.realName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="120">
          <template #default="{ row }">
            <span class="code-text">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleName" label="角色" min-width="100">
          <template #default="{ row }">
            <span class="role-tag">{{ row.roleName }}</span>
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
              <button type="button" class="action-btn action-detail" @click="emit('detail', row.id)">详情</button>
              <button
                type="button"
                :class="['action-btn', row.roleCode === 'super_admin'
                  ? 'action-btn-locked'
                  : (row.status === 1 ? 'action-disable' : 'action-enable')]"
                :disabled="row.roleCode === 'super_admin'"
                :title="row.roleCode === 'super_admin' ? '超级管理员不可禁用' : ''"
                @click="row.roleCode !== 'super_admin' && handleToggleStatus(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </button>
              <button type="button" class="action-btn action-delete" @click="handleDelete(row)">删除</button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="custom-pagination">
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

.role-tag {
  display: inline-flex;
  align-items: center;
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

.action-btn-locked {
  background: #f3f4f6;
  color: #d1d5db;
  border: 1px solid #e5e7eb;
  cursor: not-allowed;
  opacity: 0.6;
}

.action-delete {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-delete:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.custom-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.custom-pagination :deep(.el-pagination) {
  --el-pagination-hover-color: #F97316;
}

.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.custom-pagination :deep(.el-pager li:hover) {
  color: #F97316;
}

.custom-pagination :deep(.el-pager li.is-active) {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper) {
  border-radius: 8px;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.custom-pagination :deep(.el-pagination__sizes .el-select .el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  color: #F97316;
}
</style>
