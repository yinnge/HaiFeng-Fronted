<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { batchDeleteLogs } from '@/api/system/log'
import type { AdminLogListVO } from '@/types/system/log'

defineProps<{
  data: AdminLogListVO[]
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

const selectedIds = ref<string[]>([])

const handleSelectionChange = (rows: AdminLogListVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
}

const handleBatchDelete = async (type: 'ids' | 'lastMonth' | 'all') => {
  if (type === 'ids' && selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的记录')
    return
  }

  const messages: Record<string, string> = {
    ids: `确定要删除选中的 ${selectedIds.value.length} 条记录吗？`,
    lastMonth: '确定要删除一个月前的所有日志吗？',
    all: '确定要删除全部日志吗？此操作不可恢复？',
  }

  try {
    await ElMessageBox.confirm(messages[type], '警告', {
      type: type === 'all' ? 'error' : 'warning',
    })

    const res = await batchDeleteLogs({
      type,
      ids: type === 'ids' ? selectedIds.value : undefined,
    })

    if (res.data.code === 200) {
      ElMessage.success(`成功删除 ${res.data.data} 条记录`)
      emit('refresh')
    } else {
      ElMessage.error(res.data.msg || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

const tagTypeMap: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  DELETE: 'danger',
}

const getMethodTagType = (method: string): 'info' | 'success' | 'warning' | 'danger' =>
  tagTypeMap[method] || 'info'

const pageSizes = [10, 20, 30, 50, 100, 200, 500, 1000]
</script>

<template>
  <div class="bg-white rounded-lg p-5">
    <div class="mb-4">
      <el-dropdown @command="handleBatchDelete">
        <el-button type="danger">
          批量删除
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="ids" :disabled="selectedIds.length === 0">
              删除选中 ({{ selectedIds.length }})
            </el-dropdown-item>
            <el-dropdown-item command="lastMonth">删除一个月前</el-dropdown-item>
            <el-dropdown-item command="all" style="color: #f56c6c">删除全部</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-table :data="data" v-loading="loading" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="adminName" label="管理员" min-width="100" />
      <el-table-column prop="operation" label="操作描述" min-width="180" />
      <el-table-column prop="requestMethod" label="请求方法" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getMethodTagType(row.requestMethod)" size="small">
            {{ row.requestMethod }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="操作结果" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.result === 'SUCCESS' ? 'success' : 'danger'" size="small">
            {{ row.result === 'SUCCESS' ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP 地址" width="140" />
      <el-table-column prop="createdAt" label="操作时间" width="180" />
      <el-table-column label="操作" width="80" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('detail', row.id)">详情</el-button>
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
