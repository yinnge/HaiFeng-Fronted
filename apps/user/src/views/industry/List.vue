<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIndustryList, getIndustryCategories } from '@/api/industry'
import type { IndustryListVO, IndustryQueryDTO } from '@/types/industry'
import { Motion } from 'motion-v'

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
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取行业列表失败')
  } finally {
    loading.value = false
  }
}

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? '' : category
  currentPage.value = 1
  fetchList()
}

function goDetail(id: string) {
  router.push(`/industry/${id}`)
}

function onPageChange(page: number) { currentPage.value = page; fetchList() }
function onSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; fetchList() }

onMounted(() => { fetchCategories(); fetchList() })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">行业趋势分析 · 洞察百业态势，规划职业未来</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            覆盖互联网/IT、金融、教育、医疗、制造业等主流行业，提供行业规模、增长趋势、人才需求、投资热度等数据，助您把握行业发展脉搏。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['行业规模', '增长趋势', '人才需求', '投资热度']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- 行业分类 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            行业分类
          </div>
          <div class="flex flex-wrap gap-3">
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
        </section>
      </Motion>

      <!-- 行业列表 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.2 }">
        <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
            行业列表
          </div>
          <div v-loading="loading" class="min-h-[400px]">
            <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
                v-for="item in list" :key="item.id"
                class="rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                @click="goDetail(item.id)"
              >
                <div class="h-1 bg-gradient-to-r from-[#F97316] to-[#FB923C]"></div>
                <div class="p-5">
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
            </div>
            <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无行业数据</div>
          </div>

          <!-- 分页 -->
          <div v-if="total > pageSize" class="mt-6 flex justify-center">
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
        </section>
      </Motion>
    </main>

  </div>
</template>
