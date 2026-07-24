<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUniversityChannels, getChannelOptions } from '@/api/university'
import { ProvinceOptions } from '@haifeng/shared'
import { ElMessage } from 'element-plus'
import type { ChannelListVO, ChannelOptionVO, ChannelQueryDTO } from '@/types/university'

const props = defineProps<{ universityId: number }>()

const loading = ref(false)
const list = ref<ChannelListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(9)

const channelName = ref('')
const regionTag = ref('')
const channelOptions = ref<ChannelOptionVO[]>([])

async function fetchChannelOptions() {
  try {
    const res = await getChannelOptions()
    channelOptions.value = res.data.data || []
  } catch {
    // 下拉选项加载失败不影响主列表
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: ChannelQueryDTO = { page: page.value, size: size.value }
    if (channelName.value) params.channelName = channelName.value
    if (regionTag.value) params.regionTag = regionTag.value

    const res = await getUniversityChannels(props.universityId, params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取通道数据失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  channelName.value = ''
  regionTag.value = ''
  page.value = 1
  fetchList()
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

function onSizeChange(s: number) {
  size.value = s
  page.value = 1
  fetchList()
}

onMounted(() => {
  fetchChannelOptions()
  fetchList()
})
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
      <div class="min-w-[200px] flex-1">
        <label class="block text-sm font-medium text-gray-600 mb-1.5">通道名称</label>
        <el-select
          v-model="channelName"
          filterable
          clearable
          placeholder="输入或选择通道名称"
          class="w-full"
          @change="handleSearch"
        >
          <el-option
            v-for="opt in channelOptions"
            :key="opt.channelCode"
            :label="opt.channelName"
            :value="opt.channelName"
          />
        </el-select>
      </div>
      <div class="w-44">
        <label class="block text-sm font-medium text-gray-600 mb-1.5">地区标签</label>
        <el-select v-model="regionTag" placeholder="全部" clearable filterable class="w-full" @change="handleSearch">
          <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>
      <button
        class="h-[40px] rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
        @click="handleSearch"
      >
        搜索
      </button>
      <button
        class="h-[40px] rounded-lg border border-gray-200 px-6 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
        @click="handleReset"
      >
        重置
      </button>
    </div>

    <!-- 卡片列表 3列 -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in list"
          :key="item.channelCode"
          class="rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
        >
          <h4 class="text-base font-bold text-gray-800 mb-2 truncate">{{ item.channelName }}</h4>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs text-gray-400">{{ item.year }}年</span>
            <span class="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.regionTag }}</span>
          </div>
          <p class="text-xs text-gray-400">
            报名: {{ item.signupStart ? item.signupStart.slice(0, 10) : '待定' }} ~ {{ item.signupEnd ? item.signupEnd.slice(0, 10) : '待定' }}
          </p>
        </div>
      </div>
      <div v-else-if="!loading" class="py-16 text-center text-gray-400">
        暂无特殊通道数据
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > size" class="mt-6 flex justify-center">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        :page-sizes="[9, 18, 30]"
        :page-size="size"
        :current-page="page"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>
