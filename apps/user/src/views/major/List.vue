<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMajorList, getMajorCategoryStats, getMajorRanking } from '@/api/major'
import type { MajorListVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO } from '@/types/major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'
import { Motion } from 'motion-v'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const rankingLoading = ref(false)
const list = ref<MajorListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const activeType = ref('本科')
const typeOptions = ['本科', '专科']

const stats = ref<MajorCategoryStatVO[]>([])
const selectedCategory = ref('')

const query = reactive<MajorQueryDTO>({
  page: 1,
  size: 10,
  majorType: '本科',
})

const isPro = computed(() => userStore.userInfo?.memberType === MemberType.PRO || userStore.userInfo?.memberType === MemberType.VIP)

const rankingQuery = reactive<MajorRankingQueryDTO>({
  page: 1,
  size: 10,
  sortBy: 'salaryMax',
  sortOrder: 'desc',
  majorCategory: '',
})
const rankingList = ref<MajorListVO[]>([])
const rankingTotal = ref(0)
const rankingPage = ref(1)
const rankingPageSize = ref(10)
const sortType = ref<'salaryMax' | 'employmentRate'>('salaryMax')

const sortOptions = [
  { value: 'salaryMax', label: '按薪资排序' },
  { value: 'employmentRate', label: '按就业率排序' },
]

async function fetchList() {
  loading.value = true
  try {
    query.majorType = activeType.value
    query.page = currentPage.value
    query.size = pageSize.value
    query.majorCategory = selectedCategory.value || undefined
    const res = await getMajorList(query)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取专业列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const res = await getMajorCategoryStats()
    stats.value = res.data.data
  } catch {
    // silently fail
  }
}

async function fetchRanking() {
  rankingLoading.value = true
  try {
    rankingQuery.page = rankingPage.value
    rankingQuery.size = rankingPageSize.value
    rankingQuery.sortBy = sortType.value
    rankingQuery.sortOrder = 'desc'
    const res = await getMajorRanking(rankingQuery)
    rankingList.value = res.data.data.records
    rankingTotal.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status !== 403) {
      ElMessage.error('获取排行失败')
    }
    rankingList.value = []
  } finally {
    rankingLoading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.code = ''
  query.majorCategory = ''
  selectedCategory.value = ''
  currentPage.value = 1
  fetchList()
}

function switchType(type: string) {
  activeType.value = type
  selectedCategory.value = ''
  query.majorCategory = ''
  currentPage.value = 1
  fetchList()
}

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? '' : category
  currentPage.value = 1
  fetchList()
}

function goDetail(id: number) {
  router.push(`/major/${id}`)
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function onRankingPageChange(page: number) {
  rankingPage.value = page
  fetchRanking()
}

function onRankingSizeChange(size: number) {
  rankingPageSize.value = size
  rankingPage.value = 1
  fetchRanking()
}

onMounted(() => {
  fetchStats()
  fetchList()
  if (isPro.value) fetchRanking()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            收录教育部公布的本科、专科和研究生专业目录，包含专业介绍、课程设置、就业方向、薪资水平等数据，为您的学业规划提供全面参考。
          </p>
        </div>
      </Motion>

      <!-- Type buttons -->
      <div class="mb-6 flex gap-4">
        <button
          v-for="type in typeOptions" :key="type"
          class="rounded-xl px-8 py-3 text-base font-semibold transition-all"
          :class="activeType === type
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
          @click="switchType(type)"
        >
          {{ type === '本科' ? '本科专业目录' : '专科专业目录' }}
        </button>
      </div>

      <!-- Search bar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <input
          v-model="query.name"
          type="text"
          placeholder="输入专业名称搜索"
          class="flex-1 min-w-[200px] rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <input
          v-model="query.code"
          type="text"
          placeholder="专业代码"
          class="w-36 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="query.majorCategory" placeholder="专业类别" clearable filterable class="!w-44">
          <el-option
            v-for="item in stats" :key="item.majorCategory"
            :label="item.majorCategory" :value="item.majorCategory"
          />
        </el-select>
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="rounded-lg border border-gray-200 px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="handleReset"
        >
          重置
        </button>
      </div>

      <!-- Category Stats -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-lg font-bold text-gray-800">专业分类统计</h2>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="item in stats" :key="item.majorCategory"
              class="rounded-full px-4 py-2 text-sm font-medium transition-all"
              :class="selectedCategory === item.majorCategory
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
              @click="selectCategory(item.majorCategory)"
            >
              {{ item.majorCategory }}
              <span class="ml-1.5 inline-flex items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs">{{ item.count }}</span>
            </button>
          </div>
        </section>
      </Motion>

      <!-- Major List -->
      <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 class="mb-4 text-lg font-bold text-gray-800">{{ activeType === '本科' ? '本科' : '专科' }}专业列表</h2>
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="pb-3 pr-4 font-medium">代码</th>
                  <th class="pb-3 pr-4 font-medium">专业名称</th>
                  <th class="pb-3 pr-4 font-medium">类别</th>
                  <th class="pb-3 pr-4 font-medium">门类</th>
                  <th class="pb-3 pr-4 font-medium">授予学位</th>
                  <th class="pb-3 pr-4 font-medium">就业率</th>
                  <th class="pb-3 pr-4 font-medium">薪资范围</th>
                  <th class="pb-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, idx) in list" :key="item.id"
                  class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors cursor-pointer"
                  @click="goDetail(item.id)"
                >
                  <td class="py-3 pr-4 text-sm text-gray-600 font-mono">{{ item.majorCode }}</td>
                  <td class="py-3 pr-4 text-sm font-medium text-gray-800">
                    {{ item.majorName }}
                    <span v-if="item.majorTags" class="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.majorTags }}</span>
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.majorCategory }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.parentCategory }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.degreeAwarded }}</td>
                  <td class="py-3 pr-4 text-sm" :class="(item.employmentRate ?? 0) >= 90 ? 'text-green-600' : 'text-gray-600'">
                    {{ item.employmentRate ? `${item.employmentRate.toFixed(1)}%` : '-' }}
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">
                    {{ item.salaryMin ? `${item.salaryMin.toLocaleString()} - ${item.salaryMax?.toLocaleString()}` : '-' }}
                  </td>
                  <td class="py-3 text-sm">
                    <span class="text-orange-500 hover:text-orange-600 font-medium">查看详情</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无专业数据</div>
        </div>
        <div v-if="total > pageSize" class="mt-6 flex justify-center">
          <el-pagination
            background layout="total, sizes, prev, pager, next"
            :total="total" :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize" :current-page="currentPage"
            @current-change="onPageChange" @size-change="onSizeChange"
          />
        </div>
      </section>

      <!-- Salary/Employment Ranking -->
      <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 class="mb-4 text-lg font-bold text-gray-800">薪资就业排行</h2>
        <template v-if="isPro">
          <div class="mb-4 flex flex-wrap items-center gap-4">
            <el-select v-model="rankingQuery.majorCategory" placeholder="专业大类" clearable filterable class="!w-44" @change="fetchRanking">
              <el-option
                v-for="item in stats" :key="item.majorCategory"
                :label="item.majorCategory" :value="item.majorCategory"
              />
            </el-select>
            <div class="flex gap-2">
              <button
                v-for="opt in sortOptions" :key="opt.value"
                class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
                :class="sortType === opt.value
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                @click="sortType = opt.value as any; fetchRanking()"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <div v-loading="rankingLoading" class="min-h-[200px]">
            <div v-if="rankingList.length" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th class="pb-3 pr-4 font-medium w-12">排名</th>
                    <th class="pb-3 pr-4 font-medium">专业名称</th>
                    <th class="pb-3 pr-4 font-medium">类别</th>
                    <th class="pb-3 pr-4 font-medium">就业率</th>
                    <th class="pb-3 font-medium">薪资范围</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in rankingList" :key="item.id"
                    class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors cursor-pointer"
                    @click="goDetail(item.id)"
                  >
                    <td class="py-3 pr-4">
                      <span
                        class="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                        :class="idx < 3 ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' : 'bg-gray-100 text-gray-500'"
                      >{{ idx + 1 + (rankingPage - 1) * rankingPageSize }}</span>
                    </td>
                    <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.majorName }}</td>
                    <td class="py-3 pr-4 text-sm text-gray-600">{{ item.majorCategory }}</td>
                    <td class="py-3 pr-4 text-sm" :class="(item.employmentRate ?? 0) >= 90 ? 'text-green-600' : 'text-gray-600'">
                      {{ item.employmentRate ? `${item.employmentRate.toFixed(1)}%` : '-' }}
                    </td>
                    <td class="py-3 text-sm text-gray-600">
                      {{ item.salaryMin ? `${item.salaryMin.toLocaleString()} - ${item.salaryMax?.toLocaleString()}` : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="!rankingLoading" class="py-12 text-center text-gray-400">暂无排行数据</div>
          </div>
          <div v-if="rankingTotal > rankingPageSize" class="mt-6 flex justify-center">
            <el-pagination
              background layout="total, sizes, prev, pager, next"
              :total="rankingTotal" :page-sizes="[10, 20, 30, 50, 100]"
              :page-size="rankingPageSize" :current-page="rankingPage"
              @current-change="onRankingPageChange" @size-change="onRankingSizeChange"
            />
          </div>
        </template>
        <template v-else>
          <div class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 text-center border border-orange-100">
            <div class="text-4xl mb-3">🔒</div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">开通专业版，查看完整薪资就业排行</h3>
            <p class="text-gray-500 mb-4">包含各专业薪资水平、就业率排名等深度数据</p>
            <button class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
              @click="router.push('/profile')"
            >
              立即升级
            </button>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>
