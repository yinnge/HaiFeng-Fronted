<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIndustryList, getIndustryCategories } from '@/api/industry'
import type { IndustryListVO, IndustryQueryDTO } from '@/types/industry'

const router = useRouter()

const loading = ref(false)
const list = ref<IndustryListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const categories = ref<string[]>([])
const selectedCategory = ref('')

async function fetchCategories() {
  try {
    const res = await getIndustryCategories()
    categories.value = res.data.data
  } catch { /* silent */ }
}

async function fetchList() {
  loading.value = true
  try {
    const params: IndustryQueryDTO = { page: currentPage.value, size: pageSize.value }
    if (selectedCategory.value) params.category = selectedCategory.value
    const res = await getIndustryList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取行业列表失败')
  } finally {
    loading.value = false
  }
}

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? '' : category
  currentPage.value = 1
  fetchList()
}

function goDetail(id: number) {
  router.push(`/industry/${id}`)
}

function onPageChange(page: number) { currentPage.value = page; fetchList() }
function onSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; fetchList() }

onMounted(() => { fetchCategories(); fetchList() })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- 行业趋势分析 Theme Title -->
      <div class="mb-6 text-center">
        <h2 class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 text-3xl md:text-4xl font-bold">
          行业趋势分析
        </h2>
        <p class="mt-2 text-gray-500">洞察百业态势，规划职业未来</p>
      </div>

      <!-- Intro Banner -->
      <div class="mb-8 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
        <p class="text-gray-700 leading-relaxed">
          覆盖互联网/IT、金融、教育、医疗、制造业等主流行业，提供行业规模、增长趋势、人才需求、投资热度等数据，助您把握行业发展脉搏。
        </p>
      </div>

      <!-- 分类 Tag 栏 -->
      <div class="mb-8 flex flex-wrap gap-3">
        <button
          class="rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer"
          :class="selectedCategory === ''
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
          @click="selectCategory('')"
        >
          全部行业
        </button>
        <button
          v-for="cat in categories" :key="cat"
          class="rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer"
          :class="selectedCategory === cat
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- 行业卡片网格 -->
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="item in list" :key="item.id"
            class="rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all cursor-pointer p-5"
            @click="goDetail(item.id)"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.industryName }}</h3>
              <span class="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 ml-2">{{ item.category }}</span>
            </div>
            <div class="mb-3">
              <span v-if="item.annualGrowthRate >= 0" class="text-sm text-green-600">
                ↑ {{ item.annualGrowthRate }}%
              </span>
              <span v-else class="text-sm text-red-600">
                ↓ {{ Math.abs(item.annualGrowthRate) }}%
              </span>
              <span class="text-xs text-gray-400 ml-1">年增长率</span>
            </div>
            <div class="space-y-1.5 text-sm text-gray-500 mb-4">
              <div>市场规模：{{ item.marketScale }}</div>
              <div>人才缺口：{{ item.talentGap }}</div>
            </div>
            <div>
              <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>投资热度</span>
                <span>{{ item.investmentHeat }}%</span>
              </div>
              <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all"
                  :style="{ width: item.investmentHeat + '%' }"
                />
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无行业数据</div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 30, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </main>

  </div>
</template>
