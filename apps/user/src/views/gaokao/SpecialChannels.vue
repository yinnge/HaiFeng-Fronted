<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion, useReducedMotion } from 'motion-v'
import { getChannelList } from '@/api/special'
import type { SpecialChannelListVO } from '@/types/special'
import ArchiveBar from '@/components/gaokao/ArchiveBar.vue'
import { useGaokaoModuleNav } from '@/composables/useGaokaoModuleNav'

const router = useRouter()
const { HIGH_IDENTITIES, highIdentity, onHighIdentityChange, gaokaoExtraItems } = useGaokaoModuleNav()

const loading = ref(false)
const channels = ref<SpecialChannelListVO[]>([])

// 固定展示 5 类特殊招生通道（统招为产品固定入口，不在此列）
const channelCodes = ['COMPREHENSIVE', 'STRONG_BASE', 'SPECIAL_PROGRAM', 'ETHNIC_MINORITY', 'JOINT_NATIONAL']

const displayChannels = computed(() =>
  channelCodes
    .map((code) => channels.value.find((c) => c.channelCode === code))
    .filter((c): c is SpecialChannelListVO => !!c),
)

// 内联手绘线稿图标（stroke-width 2，延续全站 SVG 线稿风格）
interface ChannelGlyph {
  paths: string[]
}

const channelIcon: Record<string, ChannelGlyph> = {
  COMPREHENSIVE: {
    paths: ['M12 3.6 14.5 8.6l5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3.6Z'],
  },
  STRONG_BASE: {
    paths: [
      'M4 21h16',
      'M6.5 21V9.5m3.5 11.5V9.5m4 11.5V9.5m3.5 11.5V9.5',
      'M3.5 9.5 12 4.5l8.5 5',
    ],
  },
  SPECIAL_PROGRAM: {
    paths: [
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
      'M12 11.6h.01',
    ],
  },
  ETHNIC_MINORITY: {
    paths: [
      'M12 4.5l1.8 3.9 3.9 1.8-3.9 1.8-1.8 3.9-1.8-3.9-3.9-1.8 3.9-1.8 1.8-3.9Z',
      'M18.7 15l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2Z',
    ],
  },
  JOINT_NATIONAL: {
    paths: [
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      'M3.6 9.5h16.8M3.6 14.5h16.8',
      'M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18',
    ],
  },
  FALLBACK: {
    paths: [
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      'M16 8l-2.3 5.7L8 16l2.3-5.7L16 8Z',
    ],
  },
}

const channelDesc: Record<string, string> = {
  COMPREHENSIVE: '高考成绩+综合素质评价，多元录取',
  STRONG_BASE: '聚焦基础学科，培养拔尖创新人才',
  SPECIAL_PROGRAM: '面向农村和贫困地区考生的专项招生',
  ETHNIC_MINORITY: '面向少数民族考生的特殊招生',
  JOINT_NATIONAL: '面向华侨、港澳台学生的联合招生',
}

// 四色分流：图标底座与「进入通道」按通道语义着色，避免整页单一黄色
interface ChannelTone {
  tile: string
  link: string
}

const channelTone: Record<string, ChannelTone> = {
  COMPREHENSIVE: { tile: 'bg-sem-blue-bg text-sem-blue', link: 'text-sem-blue' },
  STRONG_BASE: { tile: 'bg-sem-yellow-bg text-[#D97706]', link: 'text-[#D97706]' },
  SPECIAL_PROGRAM: { tile: 'bg-sem-green-bg text-sem-green', link: 'text-sem-green' },
  ETHNIC_MINORITY: { tile: 'bg-sem-red-bg text-sem-red', link: 'text-sem-red' },
  JOINT_NATIONAL: { tile: 'bg-[#F1F5F9] text-[#475569]', link: 'text-[#475569]' },
}

const fallbackTone: ChannelTone = { tile: 'bg-sem-yellow-bg text-[#D97706]', link: 'text-[#D97706]' }

function toneOf(code: string): ChannelTone {
  return channelTone[code] || fallbackTone
}

function isHot(code: string) {
  return code === 'COMPREHENSIVE' || code === 'STRONG_BASE'
}

function isQualified(code: string) {
  return code === 'SPECIAL_PROGRAM'
}

async function fetchChannels() {
  loading.value = true
  try {
    const res = await getChannelList({ page: 1, size: 100 })
    channels.value = res.data.data.records
  } catch (err: any) {
    const msg = err.response?.data?.msg || err.message || '获取通道信息失败'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}

function goChannel(item: SpecialChannelListVO) {
  router.push(`/gaokao/channel/${item.id}`)
}

function goBack() {
  router.push('/gaokao')
}

// 尊重系统「减弱动态效果」设置：开启时区块直接静态呈现
const reduceMotion = useReducedMotion()
const revealInitial = computed(() =>
  reduceMotion.value ? undefined : { opacity: 0, y: 24 },
)
const revealIn = computed(() =>
  reduceMotion.value ? undefined : { opacity: 1, y: 0 },
)

onMounted(() => {
  void fetchChannels()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-bg">
    <!-- 档案吸附条：与高考模块其它子页保持一致 -->
    <ArchiveBar
      :extra-items="gaokaoExtraItems"
      :identity-options="HIGH_IDENTITIES"
      :identity="highIdentity"
      @identity-change="onHighIdentityChange"
    />

    <main class="flex-1">
      <div class="mx-auto max-w-5xl px-6 py-8">
        <!-- 返回 + 页头 -->
        <div class="mb-6">
          <button
            class="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-sem-blue"
            @click="goBack"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            返回高考首页
          </button>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-800 md:text-3xl">特殊通道</h1>
            <span class="inline-flex items-center rounded-md border border-sem-yellow/20 bg-sem-yellow-bg px-2.5 py-1 text-xs font-medium text-[#D97706]">
              非统招路径
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-400">综合评价 · 强基计划 · 专项计划 · 民族班 · 全国联招，仅符合相应资格的考生可报考</p>
        </div>

        <!-- 加载中：与卡片同构的骨架屏 -->
        <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div v-for="i in 6" :key="i" class="rounded-2xl bg-white p-6 shadow-hf border border-surface-border animate-pulse">
            <div class="mb-4 h-12 w-12 rounded-xl bg-gray-200/80"></div>
            <div class="h-4 w-24 rounded bg-gray-200/80"></div>
            <div class="mt-3 mb-2 flex gap-1.5">
              <div class="h-5 w-12 rounded-full bg-gray-100"></div>
            </div>
            <div class="h-3 w-full rounded bg-gray-100"></div>
            <div class="mt-2 h-3 w-3/4 rounded bg-gray-100"></div>
          </div>
        </div>

        <!-- 5 类特殊招生通道 -->
        <div v-else-if="displayChannels.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Motion
            v-for="(item, i) in displayChannels"
            :key="item.channelCode"
            :initial="revealInitial"
            :while-in-view="revealIn"
            :in-view-options="{ once: true }"
            :transition="{ duration: 0.5, delay: 0.1 + i * 0.06 }"
            class="h-full"
          >
            <div
              class="group flex h-full flex-col rounded-2xl bg-white p-6 shadow-hf border border-surface-border transition-all duration-300 hover:-translate-y-0.5 hover:border-sem-yellow/40 hover:shadow-hf-hover active:scale-[0.98] cursor-pointer"
              @click="goChannel(item)"
            >
              <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors" :class="toneOf(item.channelCode).tile">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-for="d in (channelIcon[item.channelCode] || channelIcon.FALLBACK).paths" :key="d" :d="d" />
                </svg>
              </div>
              <h2 class="text-[17px] font-bold text-gray-800">{{ item.channelName }}</h2>
              <div class="mb-2 flex min-h-[24px] flex-wrap gap-1.5">
                <span v-if="isHot(item.channelCode)" class="inline-flex items-center rounded-md bg-sem-red-bg px-2 py-0.5 text-[11px] font-semibold text-sem-red border border-sem-red/20">热门</span>
                <span v-if="isQualified(item.channelCode)" class="inline-flex items-center rounded-md bg-sem-blue-bg px-2 py-0.5 text-[11px] font-semibold text-sem-blue border border-sem-blue/20">需资格</span>
              </div>
              <p class="flex-1 text-sm leading-relaxed text-gray-500">{{ channelDesc[item.channelCode] || item.subtitle }}</p>
              <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium" :class="toneOf(item.channelCode).link">
                进入通道
                <svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6.5 3.5 11 8l-4.5 4.5" />
                </svg>
              </span>
            </div>
          </Motion>
        </div>

        <!-- 空态 -->
        <div v-else class="rounded-2xl border border-surface-border bg-white px-6 py-14 text-center text-sm text-gray-400 shadow-hf">
          暂无特殊通道数据
        </div>
      </div>
    </main>
  </div>
</template>
