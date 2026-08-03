<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChannelList } from '@/api/special'
import type { SpecialChannelListVO } from '@/types/special'

const router = useRouter()

const loading = ref(false)
const channels = ref<SpecialChannelListVO[]>([])

// 高考报志愿支持的通道代码（按展示顺序）
const channelCodes = ['NORMAL', 'COMPREHENSIVE', 'STRONG_BASE', 'SPECIAL_PROGRAM', 'ETHNIC_MINORITY', 'JOINT_NATIONAL']

const channelIcon: Record<string, string> = {
  NORMAL: '🎓',
  COMPREHENSIVE: '📊',
  STRONG_BASE: '🏛️',
  SPECIAL_PROGRAM: '📋',
  ETHNIC_MINORITY: '🌟',
  JOINT_NATIONAL: '🌏',
}

const channelDesc: Record<string, string> = {
  NORMAL: '普通高考统招志愿填报，填写高考档案后开始规划',
  COMPREHENSIVE: '高考成绩+综合素质评价，多元录取',
  STRONG_BASE: '聚焦基础学科，培养拔尖创新人才',
  SPECIAL_PROGRAM: '面向农村和贫困地区考生的专项招生',
  ETHNIC_MINORITY: '面向少数民族考生的特殊招生',
  JOINT_NATIONAL: '面向华侨、港澳台学生的联合招生',
}

const displayChannels = computed(() =>
  channelCodes
    .map((code) => channels.value.find((c) => c.channelCode === code))
    .filter((c): c is SpecialChannelListVO => !!c)
)

async function fetchChannels() {
  loading.value = true
  try {
    const res = await getChannelList({ page: 1, size: 100 })
    channels.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取通道信息失败')
  } finally {
    loading.value = false
  }
}

function goChannel(id: string) {
  router.push(`/gaokao/channel/${id}`)
}

onMounted(fetchChannels)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-12 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          选择报考类型
        </div>
        <h2 class="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          高考志愿填报
        </h2>
        <p class="mx-auto max-w-2xl text-gray-500">
          选择您的报考类型，查看该通道关联的招生院校，为志愿填报做好准备
        </p>
      </div>

      <div class="container mx-auto px-6 pb-16">
        <div v-loading="loading" class="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto min-h-[200px]">
          <div
            v-for="item in displayChannels"
            :key="item.channelCode"
            class="group rounded-2xl bg-white p-8 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer"
            @click="goChannel(item.id)"
          >
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
              {{ channelIcon[item.channelCode] || '📌' }}
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-800">{{ item.channelName }}</h3>
            <p class="text-gray-500 leading-relaxed">{{ channelDesc[item.channelCode] || item.subtitle }}</p>
            <button
              class="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              进入通道 →
            </button>
          </div>
          <div v-if="!loading && !displayChannels.length" class="col-span-full py-16 text-center text-gray-400">
            暂无报考通道数据
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
