<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChannelList, getStrongBaseScoreList } from '@/api/special'
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
    ElMessage.error(e?.response?.data?.msg || '获取数据失败')
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
  router.push(`/special/channel/${id}`)
}

function viewStrongBaseDetail(id: string) {
  router.push(`/special/strong-base/${id}`)
}

onMounted(fetchData)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <!-- 引导区 -->
      <div class="container mx-auto px-6 py-12 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          多元化升学路径一览
        </div>
        <h2 class="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          特殊招生通道
        </h2>
        <p class="mx-auto max-w-2xl text-gray-500">
          强基计划、综合评价、港澳招生等特殊类型招生信息一站式查询，助你把握多元升学机会
        </p>
      </div>

      <!-- Tab 切换 -->
      <div class="container mx-auto px-6 mb-8">
        <div class="flex justify-center gap-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            :class="activeTab === tab.key
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500 shadow-sm'"
            @click="onTabChange(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ===== Tab: 特殊通道 搜索栏 ===== -->
      <div v-if="activeTab === 'channel'" class="container mx-auto px-6 mb-8">
        <div class="flex flex-wrap items-end gap-4 rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-600 mb-1.5">通道名称</label>
            <input
              v-model="channelName"
              type="text"
              placeholder="输入通道名称"
              class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
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
            class="h-[40px] px-6 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
            @click="onSearch"
          >
            搜索
          </button>
        </div>
      </div>

      <!-- ===== Tab: 强基计划 搜索栏 ===== -->
      <div v-if="activeTab === 'strong-base'" class="container mx-auto px-6 mb-8">
        <div class="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
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
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">专业名称</label>
              <input
                v-model="sMajorName"
                type="text"
                placeholder="模糊搜索"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">专业代码</label>
              <input
                v-model="sMajorCode"
                type="text"
                placeholder="模糊搜索"
                class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              />
            </div>
          </div>
          <div class="flex justify-center">
            <button
              class="px-8 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
              @click="onSearch"
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      <!-- ===== Tab: 特殊通道 卡片网格 ===== -->
      <div v-if="activeTab === 'channel'" class="container mx-auto px-6 pb-8">
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="channelRecords.length" class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div
              v-for="item in channelRecords"
              :key="item.id"
              class="group rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all flex flex-col"
            >
              <div class="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-xl">
                {{ item.displayType === 'UNIVERSITY_LIST' ? '🏫' : item.displayType === 'ARTICLE_ONLY' ? '📄' : item.displayType === 'MAJOR_DATA' ? '📊' : '📋' }}
              </div>
              <h3 class="text-base font-bold text-gray-800 mb-0.5 truncate">{{ item.channelName }}</h3>
              <p class="text-xs text-gray-400 mb-2 line-clamp-2">{{ item.subtitle }}</p>
              <span v-if="item.filterLabel" class="self-start rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600 mb-2">{{ item.filterLabel }}</span>
              <p class="text-xs text-gray-400 mb-3">展示: {{ DisplayTypeLabel[item.displayType] || item.displayType }}</p>
              <button
                class="mt-auto w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all opacity-0 group-hover:opacity-100"
                @click="viewChannelDetail(item.id)"
              >
                查看详情 →
              </button>
            </div>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">
            暂无特殊通道数据
          </div>
        </div>
      </div>

      <!-- ===== Tab: 强基计划 卡片网格 ===== -->
      <div v-if="activeTab === 'strong-base'" class="container mx-auto px-6 pb-8">
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="strongBaseRecords.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in strongBaseRecords"
              :key="item.id"
              class="group rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-800">{{ item.universityName }}</h3>
                <span class="text-xs text-gray-400">{{ item.year }}年</span>
              </div>
              <p class="text-sm text-gray-600 mb-3">
                {{ item.majorName }}
                <span v-if="item.majorCode" class="text-xs text-gray-400">({{ item.majorCode }})</span>
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                <span>省份: {{ item.province }}</span>
                <span>科类: {{ item.subjectType }}</span>
                <span>入围类型: {{ item.entryScoreType }}</span>
                <span>入围比例: {{ item.entryRatio }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-t border-gray-100">
                <div class="text-sm">
                  <span class="text-gray-400">入围分: </span>
                  <span class="font-semibold text-orange-500">{{ item.entryScore ?? '-' }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-gray-400">录取分: </span>
                  <span class="font-semibold text-orange-500">{{ item.admissionScore ?? '-' }}</span>
                </div>
                <div class="text-sm">
                  <span class="text-gray-400">计划/录取: </span>
                  <span class="font-semibold text-gray-700">{{ item.planCount ?? '-' }}/{{ item.admissionCount ?? '-' }}</span>
                </div>
              </div>
              <button
                class="mt-3 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click="viewStrongBaseDetail(item.id)"
              >
                查看详情 →
              </button>
            </div>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">
            暂无强基计划数据
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="flex justify-center pb-12">
        <el-pagination
          background
          layout="prev, pager, next, total"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
        />
      </div>
    </main>
  </div>
</template>
