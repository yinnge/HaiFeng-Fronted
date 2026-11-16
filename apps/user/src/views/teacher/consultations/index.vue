<!-- apps/user/src/views/teacher/consultations/index.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  getConsultationDetail,
  getConsultationPage,
  getConsultationUnhandledCount,
  markConsultationHandled,
} from '@/api/consultation'
import type {
  ConsultationDetailVO,
  ConsultationListVO,
  ConsultationQueryDTO,
} from '@/types/consultation'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const list = ref<ConsultationListVO[]>([])
const total = ref(0)
const unhandledCount = ref(0)

const query = ref<ConsultationQueryDTO>({
  page: 1,
  size: 10,
  status: undefined,
  bizType: undefined,
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<ConsultationDetailVO | null>(null)
const handling = ref(false)

async function loadList() {
  loading.value = true
  try {
    const params: ConsultationQueryDTO = { ...query.value }
    // el-select 清空可能给空串，统一转成不传
    if (typeof params.status !== 'number') delete params.status
    if (!params.bizType) delete params.bizType
    const res = await getConsultationPage(params)
    if (res.data.code === 200) {
      list.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      ElMessage.error(res.data.msg || '加载留言失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '加载留言失败')
  } finally {
    loading.value = false
  }
}

async function loadUnhandledCount() {
  try {
    const res = await getConsultationUnhandledCount()
    if (res.data.code === 200) {
      unhandledCount.value = res.data.data.unhandledCount
    }
  } catch {
    // 角标失败不阻塞列表
  }
}

function handleSearch() {
  query.value.page = 1
  loadList()
}

function handleReset() {
  query.value = { page: 1, size: 10, status: undefined, bizType: undefined }
  loadList()
}

function handlePageChange(page: number) {
  query.value.page = page
  loadList()
}

function handleSizeChange(size: number) {
  query.value.size = size
  query.value.page = 1
  loadList()
}

async function openDetail(id: string) {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = null
  try {
    const res = await getConsultationDetail(id)
    if (res.data.code === 200) {
      detail.value = res.data.data
    }
  } catch (e: any) {
    detailVisible.value = false
    ElMessage.error(e?.response?.data?.msg || e?.message || '加载留言详情失败')
  } finally {
    detailLoading.value = false
  }
}

async function handleMarkHandled() {
  if (!detail.value || detail.value.status === 1) return
  handling.value = true
  try {
    await markConsultationHandled(detail.value.id)
    detail.value.status = 1
    detail.value.statusDesc = '已处理'
    const row = list.value.find((item) => item.id === detail.value?.id)
    if (row) {
      row.status = 1
      row.statusDesc = '已处理'
    }
    unhandledCount.value = Math.max(0, unhandledCount.value - 1)
    ElMessage.success('已标记为已处理')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
  } finally {
    handling.value = false
  }
}

async function copyText(text: string | null | undefined, label: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`已复制${label}`)
  } catch {
    ElMessage.info(`请手动复制：${text}`)
  }
}

function formatTime(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  await Promise.all([loadList(), loadUnhandledCount()])
  const focus = route.query.focus
  if (typeof focus === 'string' && focus) {
    await openDetail(focus)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <div class="mx-auto max-w-5xl px-6 py-10">
      <button
        class="mb-5 flex items-center gap-2 text-gray-500 transition-colors hover:text-orange-500"
        @click="router.push('/profile')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回个人中心
      </button>

      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">咨询留言</h1>
          <p class="mt-1 text-sm text-gray-500">查看学员提交的预约留言，及时联系对方</p>
        </div>
        <div class="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600">
          待处理 {{ unhandledCount }} 条
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <el-select v-model="query.status" clearable placeholder="全部状态" style="width: 140px">
          <el-option :value="0" label="待处理" />
          <el-option :value="1" label="已处理" />
        </el-select>
        <el-select v-model="query.bizType" clearable placeholder="全部来源" style="width: 160px">
          <el-option value="planner" label="规划师" />
          <el-option value="institution" label="培训机构" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <div v-loading="loading" class="mt-6 space-y-4">
        <div
          v-for="item in list"
          :key="item.id"
          class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div class="flex flex-wrap items-center gap-2">
            <el-tag :type="item.bizType === 'planner' ? 'warning' : 'success'" size="small">
              {{ item.bizTypeDesc }}
            </el-tag>
            <span class="text-sm font-medium text-gray-700">{{ item.bizName }}</span>
            <el-tag :type="item.status === 0 ? 'warning' : 'success'" size="small" effect="plain">
              {{ item.statusDesc }}
            </el-tag>
            <span class="ml-auto text-xs text-gray-400">{{ formatTime(item.createdAt) }}</span>
          </div>

          <p class="mt-3 whitespace-pre-wrap break-words text-gray-700">{{ item.message }}</p>

          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
            <span>电话：{{ item.phone }}</span>
            <span v-if="item.wechat">微信：{{ item.wechat }}</span>
          </div>

          <div class="mt-3 text-right">
            <el-button size="small" @click="openDetail(item.id)">查看详情</el-button>
          </div>
        </div>

        <div v-if="!loading && list.length === 0" class="rounded-2xl bg-white p-12 text-center text-gray-400 shadow-sm">
          暂无留言
        </div>
      </div>

      <div class="mt-6 flex justify-center">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.size"
          :page-sizes="[10, 20, 30, 50, 100]"
          :total="total"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="留言详情" width="560px" append-to-body destroy-on-close>
      <div v-loading="detailLoading" class="min-h-32">
        <template v-if="detail">
          <div class="space-y-3 text-sm">
            <div class="flex gap-3">
              <span class="w-20 flex-shrink-0 text-gray-400">来源</span>
              <span class="text-gray-800">{{ detail.bizTypeDesc }} · {{ detail.bizName }}</span>
            </div>
            <div class="flex gap-3">
              <span class="w-20 flex-shrink-0 text-gray-400">状态</span>
              <el-tag :type="detail.status === 0 ? 'warning' : 'success'" size="small">
                {{ detail.statusDesc }}
              </el-tag>
            </div>
            <div class="flex gap-3">
              <span class="w-20 flex-shrink-0 text-gray-400">留言</span>
              <span class="whitespace-pre-wrap break-words text-gray-800">{{ detail.message }}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="w-20 flex-shrink-0 text-gray-400">电话</span>
              <span class="text-gray-800">{{ detail.phone }}</span>
              <el-button link type="primary" @click="copyText(detail.phone, '电话')">复制</el-button>
            </div>
            <div v-if="detail.wechat" class="flex items-center gap-3">
              <span class="w-20 flex-shrink-0 text-gray-400">微信号</span>
              <span class="text-gray-800">{{ detail.wechat }}</span>
              <el-button link type="primary" @click="copyText(detail.wechat, '微信号')">复制</el-button>
            </div>
            <div class="flex gap-3">
              <span class="w-20 flex-shrink-0 text-gray-400">提交时间</span>
              <span class="text-gray-800">{{ formatTime(detail.createdAt) }}</span>
            </div>
          </div>
        </template>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="detail && detail.status === 0"
          type="primary"
          :loading="handling"
          @click="handleMarkHandled"
        >
          标记已处理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
