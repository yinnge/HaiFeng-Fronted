<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion, useReducedMotion } from 'motion-v'
import { getChannelList, getStrongBaseScoreList } from '@/api/special'
import { getArchive, type GaokaoArchiveVO } from '@/api/gaokao'
import { useUserStore } from '@/store/modules/user'
import { ProvinceOptions } from '@haifeng/shared'
import type { SpecialChannelListVO, StrongBaseScoreListVO } from '@/types/special'
import {
  DisplayTypeOptions,
  DisplayTypeLabel,
  SubjectTypeOptions,
  EntryScoreTypeOptions,
} from '@/types/special'

type TabKey = 'channel' | 'strong-base'

const activeTab = ref<TabKey>('channel')

const tabs = [
  { key: 'channel' as TabKey, label: '特殊通道' },
  { key: 'strong-base' as TabKey, label: '强基计划入围/录取数据' },
]

// ===== 尊重系统「减弱动态效果」设置（与 gaokao 页一致）：开启时区块直接静态呈现 =====
const reduceMotion = useReducedMotion()
const revealInitial = computed(() =>
  reduceMotion.value ? undefined : { opacity: 0, y: 24 },
)
const revealIn = computed(() =>
  reduceMotion.value ? undefined : { opacity: 1, y: 0 },
)

// ===== 统招 SVG 线稿图标（与高考报志愿页同款） =====
const normalGlyph = {
  paths: [
    'M12 4 3.5 8.5 12 13l8.5-4.5L12 4Z',
    'M6 11.5v4.2c0 1.7 2.7 3.3 6 3.3s6-1.6 6-3.3v-4.2',
    'M21 8.8V14',
  ],
}

// ===== 通道卡 SVG 线稿图标（按 channelCode 映射，与高考报志愿界面同款；未知编码走罗盘兜底） =====
const channelIcon: Record<string, string[]> = {
  COMPREHENSIVE: ['M12 3.6 14.5 8.6l5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3.6Z'],
  STRONG_BASE: ['M4 21h16', 'M6.5 21V9.5m3.5 11.5V9.5m4 11.5V9.5m3.5 11.5V9.5', 'M3.5 9.5 12 4.5l8.5 5'],
  SPECIAL_PROGRAM: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M12 11.6h.01'],
  ETHNIC_MINORITY: ['M12 4.5l1.8 3.9 3.9 1.8-3.9 1.8-1.8 3.9-1.8-3.9-3.9-1.8 3.9-1.8 1.8-3.9Z', 'M18.7 15l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2Z'],
  JOINT_NATIONAL: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3.6 9.5h16.8M3.6 14.5h16.8', 'M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18'],
  FALLBACK: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M16 8l-2.3 5.7L8 16l2.3-5.7L16 8Z'],
}

// ===== 特殊通道搜索字段 =====
const channelName = ref('')
const displayType = ref('')

// ===== 强基搜索字段 =====
const sYear = ref<number | undefined>(undefined)
const sProvince = ref('')
const sSubjectType = ref('')
const sEntryScoreType = ref('')
const sUniversityName = ref('')
const sMajorName = ref('')
const sMajorCode = ref('')

// ===== 分页 =====
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

// ===== 列表数据 =====
const channelRecords = ref<SpecialChannelListVO[]>([])
const strongBaseRecords = ref<StrongBaseScoreListVO[]>([])
const loading = ref(false)

const router = useRouter()
const userStore = useUserStore()

// ===== 统招志愿填报入口 =====
// 是否已建立高考档案：决定入口展示「填写档案」还是「进入报志愿」
const hasArchive = ref(false)
// 高考档案摘要（纯展示用，不改动任何业务流程/接口）
const archive = ref<GaokaoArchiveVO | null>(null)

// 查询用户是否已填写高考档案（本页为公开页，未登录直接按未建档处理，避免触发401）
async function fetchArchive() {
  if (!userStore.isLoggedIn()) {
    hasArchive.value = false
    return
  }
  try {
    const res = await getArchive()
    archive.value = res.data.data
    hasArchive.value = !!res.data.data
  } catch {
    // 未建档或查询失败，统一按「未填写档案」处理，不打断本页浏览
    archive.value = null
    hasArchive.value = false
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

// 生成年份选项（近5年）
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years: { value: number | undefined; label: string }[] = [{ value: undefined, label: '全部' }]
  for (let i = 0; i < 5; i++) {
    const y = currentYear - i
    years.push({ value: y, label: `${y}年` })
  }
  return years
})

async function fetchData() {
  loading.value = true
  try {
    if (activeTab.value === 'channel') {
      const res = await getChannelList({
        page: currentPage.value,
        size: pageSize,
        channelName: channelName.value || undefined,
        displayType: displayType.value || undefined,
      })
      channelRecords.value = res.data.data.records
      total.value = res.data.data.total
    } else {
      const res = await getStrongBaseScoreList({
        page: currentPage.value,
        size: pageSize,
        year: sYear.value || undefined,
        province: sProvince.value || undefined,
        subjectType: sSubjectType.value || undefined,
        entryScoreType: sEntryScoreType.value || undefined,
        universityName: sUniversityName.value || undefined,
        majorName: sMajorName.value || undefined,
        majorCode: sMajorCode.value || undefined,
      })
      strongBaseRecords.value = res.data.data.records
      total.value = res.data.data.total
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

function onTabChange(tab: TabKey) {
  activeTab.value = tab
  currentPage.value = 1
  fetchData()
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function viewChannelDetail(id: string) {
  // 统一入口：特殊通道卡片与高考报志愿共用 GaokaoChannelUniversities.vue（含 STRONG_BASE 分支）
  router.push(`/gaokao/channel/${id}`)
}

function viewStrongBaseDetail(id: string) {
  router.push(`/special/strong-base/${id}`)
}

onMounted(() => {
  fetchData()
  fetchArchive()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 pt-10 pb-16 relative">
        <div class="max-w-5xl mx-auto min-h-[200px]">
          <!-- ===== 纯白品牌 Hero（左对齐，与高考报志愿页一致） ===== -->
          <Motion
            :initial="revealInitial"
            :while-in-view="revealIn"
            :transition="{ duration: 0.5 }"
            :in-view-options="{ once: true }"
          >
            <div class="pt-1 md:pt-2">
              <div class="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-sm font-medium text-brand-orange border border-brand-orange/20">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3.6 14.5 8.6l5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3.6Z" />
                </svg>
                多元化升学路径一览
              </div>
              <h2 class="mt-5 text-3xl font-bold tracking-tight text-gray-800 md:text-4xl">特殊招生通道</h2>
              <p class="mt-3 text-base text-gray-500">强基计划、综合评价、港澳招生等特殊类型招生信息一站式查询，助你把握多元升学机会</p>
            </div>
          </Motion>

          <!-- ===== 统招主通道大卡（橙渐变主视觉 + 档案状态 + 双按钮，与高考报志愿页同款） ===== -->
          <Motion
            :initial="revealInitial"
            :while-in-view="revealIn"
            :transition="{ duration: 0.5, delay: 0.1 }"
            :in-view-options="{ once: true }"
            class="mt-7"
          >
            <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-orange-dark via-brand-orange to-brand-orange-light p-7 shadow-card-active transition-all duration-300 md:p-8">
              <div class="flex flex-col gap-6 md:flex-row md:items-center">
                <!-- 左：图标 + 标题 + 描述 -->
                <div class="flex-1">
                  <div class="flex items-center gap-4">
                    <div class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
                      <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path v-for="d in normalGlyph.paths" :key="d" :d="d" />
                      </svg>
                    </div>
                    <div>
                      <div class="flex flex-wrap items-center gap-2.5">
                        <h3 class="text-xl font-bold text-white md:text-2xl">统招 · 主通道</h3>
                        <span class="inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white border border-white/30">
                          志愿填报首选
                        </span>
                      </div>
                      <p class="mt-1 text-[15px] font-medium text-white/90">普通高考统招志愿填报，填写高考档案后开始规划</p>
                    </div>
                  </div>
                </div>

                <!-- 右：档案状态 + 操作按钮 -->
                <div class="shrink-0 space-y-3 md:w-[360px]">
                  <div class="rounded-xl bg-white/10 px-4 py-3 text-sm">
                    <template v-if="hasArchive && archive">
                      <div class="flex items-center gap-2 font-medium text-white">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                        已建档
                      </div>
                      <div class="mt-1.5 leading-relaxed text-white/85">
                        {{ archive.gaokaoYear ?? '-' }} · {{ archive.gaokaoProvince || '-' }} · {{ archive.subjectType || '-' }} · {{ archive.score ?? '-' }} 分 · 位次 {{ archive.rank ?? '-' }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-2 font-medium text-white">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300" />
                        尚未填写高考档案
                      </div>
                      <div class="mt-1.5 leading-relaxed text-white/85">填写档案后开启志愿规划 · 约 30 秒即可完成</div>
                    </template>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    <button
                      class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-orange-dark shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                      @click="hasArchive ? goWishPlan() : goArchive()"
                    >
                      {{ hasArchive ? '进入报志愿 →' : '填写高考档案 →' }}
                    </button>
                    <button
                      v-if="hasArchive"
                      class="rounded-full border border-white/50 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
                      @click="goArchive"
                    >
                      修改档案
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </Motion>

          <!-- ===== Tab 切换（Segmented 容器，结构不变） ===== -->
          <Motion
            :initial="revealInitial"
            :while-in-view="revealIn"
            :transition="{ duration: 0.5, delay: 0.15 }"
            :in-view-options="{ once: true }"
            class="mt-9 mb-5"
          >
            <div class="inline-flex flex-wrap gap-1 rounded-2xl bg-white border border-gray-100 p-1.5 shadow-sm">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all"
                :class="activeTab === tab.key
                  ? 'bg-gradient-to-r from-brand-orange to-amber-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-600 hover:text-brand-orange'"
                @click="onTabChange(tab.key)"
              >
                {{ tab.label }}
              </button>
            </div>
          </Motion>

          <!-- ===== Tab: 特殊通道 ===== -->
          <template v-if="activeTab === 'channel'">
            <!-- 搜索栏 -->
            <div class="rounded-2xl bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white p-5 border border-gray-100/60 mb-6">
              <div class="flex flex-wrap items-end gap-4">
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">通道名称</label>
                  <input
                    v-model="channelName"
                    type="text"
                    placeholder="输入通道名称"
                    class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-orange transition-colors"
                    @keyup.enter="onSearch"
                  />
                </div>
                <div class="w-44">
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">展示类型</label>
                  <el-select v-model="displayType" placeholder="全部" clearable class="w-full" @change="onSearch">
                    <el-option v-for="opt in DisplayTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
                <button
                  class="h-[40px] px-6 rounded-lg bg-gradient-to-r from-brand-orange to-amber-500 text-white font-medium hover:from-brand-orange-dark hover:to-brand-orange transition-all shadow-md shadow-orange-200"
                  @click="onSearch"
                >
                  搜索
                </button>
              </div>
            </div>

            <!-- 卡片网格（按钮常显，整卡可点，图标按 displayType 映射 SVG） -->
            <div v-loading="loading" class="min-h-[300px]">
              <div v-if="channelRecords.length" class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Motion
                  v-for="(item, i) in channelRecords"
                  :key="item.id"
                  :initial="revealInitial"
                  :while-in-view="revealIn"
                  :in-view-options="{ once: true }"
                  :transition="{ duration: 0.5, delay: 0.1 + i * 0.06 }"
                  class="h-full"
                >
                  <div
                    class="group flex h-full flex-col rounded-2xl bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white p-5 border border-gray-100/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-card-hover cursor-pointer"
                    @click="viewChannelDetail(item.id)"
                  >
                    <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange transition-colors group-hover:bg-brand-orange/15">
                      <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path v-for="d in (channelIcon[item.channelCode] || channelIcon.FALLBACK)" :key="d" :d="d" />
                      </svg>
                    </div>
                    <h3 class="text-[15px] font-bold text-gray-800 truncate">{{ item.channelName }}</h3>
                    <p class="mt-1 text-xs text-gray-500 line-clamp-2 flex-1">{{ item.subtitle }}</p>
                    <div class="mt-2 mb-3 flex min-h-[22px] flex-wrap items-center gap-1.5">
                      <span v-if="item.filterLabel" class="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange border border-brand-orange/20">{{ item.filterLabel }}</span>
                      <span class="text-xs text-gray-400">{{ DisplayTypeLabel[item.displayType] || item.displayType }}</span>
                    </div>
                    <span class="inline-flex items-center justify-center gap-1 rounded-lg border border-brand-orange/40 py-2 text-sm font-medium text-brand-orange transition-all group-hover:bg-gradient-to-r group-hover:from-brand-orange group-hover:to-amber-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-md group-hover:shadow-orange-200">
                      查看详情
                      <svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M6.5 3.5 11 8l-4.5 4.5" />
                      </svg>
                    </span>
                  </div>
                </Motion>
              </div>
              <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无特殊通道数据</div>
            </div>
          </template>

          <!-- ===== Tab: 强基计划入围/录取数据 ===== -->
          <template v-else>
            <!-- 搜索栏 -->
            <div class="rounded-2xl bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white p-5 border border-gray-100/60 mb-6">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">年份</label>
                  <el-select v-model="sYear" placeholder="全部" clearable class="w-full">
                    <el-option
                      v-for="opt in yearOptions"
                      :key="String(opt.value ?? 'all')"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">省份</label>
                  <el-select v-model="sProvince" placeholder="全部" clearable filterable class="w-full">
                    <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">科类</label>
                  <el-select v-model="sSubjectType" placeholder="全部" clearable class="w-full">
                    <el-option v-for="opt in SubjectTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">入围类型</label>
                  <el-select v-model="sEntryScoreType" placeholder="全部" clearable class="w-full">
                    <el-option v-for="opt in EntryScoreTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">大学名称</label>
                  <input
                    v-model="sUniversityName"
                    type="text"
                    placeholder="模糊搜索"
                    class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-orange transition-colors"
                    @keyup.enter="onSearch"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">专业名称</label>
                  <input
                    v-model="sMajorName"
                    type="text"
                    placeholder="模糊搜索"
                    class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-orange transition-colors"
                    @keyup.enter="onSearch"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-1.5">专业代码</label>
                  <input
                    v-model="sMajorCode"
                    type="text"
                    placeholder="模糊搜索"
                    class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-orange transition-colors"
                    @keyup.enter="onSearch"
                  />
                </div>
              </div>
              <div class="flex justify-center">
                <button
                  class="px-8 py-2.5 rounded-lg bg-gradient-to-r from-brand-orange to-amber-500 text-white font-medium hover:from-brand-orange-dark hover:to-brand-orange transition-all shadow-md shadow-orange-200"
                  @click="onSearch"
                >
                  搜索
                </button>
              </div>
            </div>

            <!-- 卡片网格（整卡可点） -->
            <div v-loading="loading" class="min-h-[300px]">
              <div v-if="strongBaseRecords.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Motion
                  v-for="(item, i) in strongBaseRecords"
                  :key="item.id"
                  :initial="revealInitial"
                  :while-in-view="revealIn"
                  :in-view-options="{ once: true }"
                  :transition="{ duration: 0.5, delay: 0.1 + i * 0.06 }"
                  class="h-full"
                >
                  <div
                    class="group flex h-full flex-col rounded-2xl bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white p-6 border border-gray-100/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-card-hover cursor-pointer"
                    @click="viewStrongBaseDetail(item.id)"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-base font-bold text-brand-orange">
                          {{ item.universityName?.slice(0, 1) || '大' }}
                        </span>
                        <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.universityName }}</h3>
                      </div>
                      <span class="shrink-0 rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange">{{ item.year }}年</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">
                      {{ item.majorName }}
                      <span v-if="item.majorCode" class="text-xs text-gray-400">({{ item.majorCode }})</span>
                    </p>
                    <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 p-3 rounded-xl bg-white/60 border border-gray-100/60 mb-3">
                      <span>省份: {{ item.province }}</span>
                      <span>科类: {{ item.subjectType }}</span>
                      <span>入围类型: {{ item.entryScoreType }}</span>
                      <span>入围比例: {{ item.entryRatio }}</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 mb-4">
                      <div class="rounded-xl bg-white border border-gray-100/80 py-2.5 text-center">
                        <div class="text-xs text-gray-400 mb-0.5">入围分</div>
                        <div class="text-base font-bold text-brand-orange">{{ item.entryScore ?? '-' }}</div>
                      </div>
                      <div class="rounded-xl bg-white border border-gray-100/80 py-2.5 text-center">
                        <div class="text-xs text-gray-400 mb-0.5">录取分</div>
                        <div class="text-base font-bold text-brand-orange">{{ item.admissionScore ?? '-' }}</div>
                      </div>
                      <div class="rounded-xl bg-white border border-gray-100/80 py-2.5 text-center">
                        <div class="text-xs text-gray-400 mb-0.5">计划/录取</div>
                        <div class="text-base font-bold text-gray-700">{{ item.planCount ?? '-' }}/{{ item.admissionCount ?? '-' }}</div>
                      </div>
                    </div>
                    <span class="mt-auto inline-flex items-center justify-center gap-1 rounded-lg border border-brand-orange/40 py-2 text-sm font-medium text-brand-orange transition-all group-hover:bg-gradient-to-r group-hover:from-brand-orange group-hover:to-amber-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-md group-hover:shadow-orange-200">
                      查看详情
                      <svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M6.5 3.5 11 8l-4.5 4.5" />
                      </svg>
                    </span>
                  </div>
                </Motion>
              </div>
              <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无强基计划数据</div>
            </div>
          </template>

          <!-- 分页 -->
          <div v-if="total > pageSize" class="flex justify-center pt-6">
            <el-pagination
              background
              layout="prev, pager, next, total"
              :total="total"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="onPageChange"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
