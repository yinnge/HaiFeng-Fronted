<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { updateUserStatus } from '@/api/user'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
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
</script>

<template>
  <div class="bg-white rounded-lg p-5">
    <el-table :data="data" v-loading="loading" stripe>
      <el-table-column prop="username" label="用户名" min-width="100" />
      <el-table-column prop="phone" label="手机号" min-width="120" />
      <el-table-column prop="memberType" label="会员类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="MemberTypeTag[row.memberType as keyof typeof MemberTypeTag]" size="small">
            {{ MemberTypeLabel[row.memberType as keyof typeof MemberTypeLabel] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="wechatId" label="微信号" min-width="120">
        <template #default="{ row }">
          <span class="text-gray-400">{{ row.wechatId || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
            {{ row.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row)">详情</el-button>
          <el-button type="warning" link @click="emit('upgrade', row)">升级</el-button>
          <el-button
            :type="row.status === 'active' ? 'danger' : 'success'"
            link
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
          </el-button>
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
