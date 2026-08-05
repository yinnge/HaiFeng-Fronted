<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChannelList } from '@/api/special'
import { getArchive } from '@/api/gaokao'
import type { SpecialChannelListVO } from '@/types/special'

const router = useRouter()

const loading = ref(false)
const channels = ref<SpecialChannelListVO[]>([])

// 是否已建立高考档案（决定统招卡片展示「填写档案」还是「进入报志愿」）
const hasArchive = ref(false)

// 其余通道代码（按展示顺序）
// 注意：统招不在此列表内——它是产品固定入口，直接硬编码展示，
// 不依赖后台是否在 t_special_channel 录入 NORMAL 记录，否则运营没录数据时入口会整个消失
const channelCodes = ['COMPREHENSIVE', 'STRONG_BASE', 'SPECIAL_PROGRAM', 'ETHNIC_MINORITY', 'JOINT_NATIONAL']

const channelIcon: Record<string, string> = {
  COMPREHENSIVE: '📊',
  STRONG_BASE: '🏛️',
  SPECIAL_PROGRAM: '📋',
  ETHNIC_MINORITY: '🌟',
  JOINT_NATIONAL: '🌏',
}

const channelDesc: Record<string, string> = {
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

// 查询用户是否已填写高考档案
async function fetchArchive() {
  try {
    const res = await getArchive()
    hasArchive.value = !!res.data.data
  } catch {
    // 未建档或查询失败，统一按「未填写档案」处理
    hasArchive.value = false
  }
}

// 其余通道：进入通道大学列表
function goChannel(item: SpecialChannelListVO) {
  router.push(`/gaokao/channel/${item.id}`)
}

// 统招入口：未建档先填档案，已建档直接进入报志愿
function goNormal() {
  if (hasArchive.value) {
    goWishPlan()
  } else {
    goArchive()
  }
}

// 填写 / 修改高考档案
function goArchive() {
  router.push('/gaokao/archive')
}

// 进入报志愿（专业组选择）
function goWishPlan() {
  router.push('/gaokao/groups')
}

onMounted(() => {
  fetchChannels()
  fetchArchive()
})
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
          <!-- 统招：产品固定入口，始终展示，不依赖后端通道数据 -->
          <div
            class="group rounded-2xl bg-white p-8 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-all cursor-pointer"
            @click="goNormal"
          >
            <div class="mb-5 flex items-start justify-between">
              <div class="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
                🎓
              </div>
              <span
                v-if="hasArchive"
                class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600"
              >
                已建档
              </span>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-800">统招</h3>
            <p class="text-gray-500 leading-relaxed">普通高考统招志愿填报，填写高考档案后开始规划</p>

            <div v-if="hasArchive" class="mt-6 flex gap-2">
              <button
                class="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click.stop="goWishPlan"
              >
                进入报志愿 →
              </button>
              <button
                class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-600 transition-all"
                @click.stop="goArchive"
              >
                修改档案
              </button>
            </div>
            <button
              v-else
              class="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click.stop="goArchive"
            >
              填写高考档案 →
            </button>
          </div>

          <!-- 其余通道：进入通道大学列表 -->
          <div
            v-for="item in displayChannels"
            :key="item.channelCode"
            class="group rounded-2xl bg-white p-8 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer"
            @click="goChannel(item)"
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
        </div>
        <div v-if="!loading && !displayChannels.length" class="mt-6 text-center text-sm text-gray-400">
          暂无其他报考通道数据
        </div>
      </div>
    </main>
  </div>
</template>
