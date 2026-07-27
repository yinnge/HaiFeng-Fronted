<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { updateUserStatus } from '@/api/user'
import { MemberTypeLabel } from '@haifeng/shared'
import type { MemberListVO } from '@/types/user'

defineProps<{
  data: MemberListVO[]
  loading: boolean
  total: number
  page: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'detail', row: MemberListVO): void
  (e: 'upgrade', row: MemberListVO): void
  (e: 'refresh'): void
}>()

const handleToggleStatus = async (row: MemberListVO) => {
  const isDisabling = row.status === 'active'
  const action = isDisabling ? '禁用' : '启用'
  const newStatus = isDisabling ? 'disabled' : 'active'

  try {
    await ElMessageBox.confirm(`确定要${action}用户"${row.username}"吗？`, '提示', {
      type: 'warning',
    })
    const res = await updateUserStatus(row.id, { status: newStatus })
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

const pageSizes = [10, 20, 30, 50, 100, 200, 500, 1000]

const memberTypeStyle: Record<string, { bg: string; color: string; border: string }> = {
  normal: { bg: 'linear-gradient(135deg, rgba(156,163,175,0.1), rgba(156,163,175,0.15))', color: '#6b7280', border: 'rgba(156,163,175,0.3)' },
  pro: { bg: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.12))', color: '#C2410C', border: 'rgba(249,115,22,0.2)' },
  vip: { bg: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(167,139,250,0.12))', color: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
}
</script>

<template>
  <div class="table-card">
    <div class="custom-table" v-loading="loading">
      <el-table :data="data" stripe>
        <el-table-column prop="username" label="用户名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="memberType" label="会员类型" width="100" align="center">
          <template #default="{ row }">
            <span
              class="member-tag"
              :style="{
                background: memberTypeStyle[row.memberType]?.bg,
                color: memberTypeStyle[row.memberType]?.color,
                borderColor: memberTypeStyle[row.memberType]?.border,
              }"
            >
              {{ MemberTypeLabel[row.memberType as keyof typeof MemberTypeLabel] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="wechatId" label="微信号" min-width="120">
          <template #default="{ row }">
            <span class="dim-text">{{ row.wechatId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'active'" class="status-tag status-on">正常</span>
            <span v-else class="status-tag status-off">禁用</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <button type="button" class="action-btn action-detail" @click="emit('detail', row)">详情</button>
              <button type="button" class="action-btn action-upgrade" @click="emit('upgrade', row)">升级</button>
              <button
                type="button"
                :class="['action-btn', row.status === 'active' ? 'action-disable' : 'action-enable']"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </button>
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

/* 表格自定义样式 */
.custom-table :deep(.el-table) {
  --el-table-border-color: #f3f4f6;
  --el-table-header-bg-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header th) {
  background: linear-gradient(135deg, #F97316, #FB923C) !important;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  border-bottom: none;
  padding: 14px 0;
}

.custom-table :deep(.el-table__header th .cell) {
  color: #fff;
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

/* 文字样式 */
.dim-text {
  font-size: 13px;
  color: #9ca3af;
}

/* 会员类型标签 */
.member-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border: 1px solid;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* 状态标签 */
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

/* 操作按钮组 */
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

.action-upgrade {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #fff;
}
.action-upgrade:hover {
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
  transform: translateY(-1px);
}

.action-disable {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
}
.action-disable:hover {
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.action-enable {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: #fff;
}
.action-enable:hover {
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

/* 自定义分页 */
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
