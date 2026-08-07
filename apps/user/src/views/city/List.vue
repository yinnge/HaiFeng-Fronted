<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCityList } from '@/api/city'
import type { CityListVO, CityQueryDTO } from '@/types/city'
import { ProvinceOptions } from '@haifeng/shared'
import { Motion } from 'motion-v'

const router = useRouter()

const loading = ref(false)
const list = ref<CityListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const query = reactive<CityQueryDTO>({
  page: 1,
  size: 12,
  cityName: '',
  province: '',
  region: '',
})

const regionOptions = ['华东', '华南', '华北', '华中', '东北', '西南', '西北', '港澳台']

async function fetchList() {
  loading.value = true
  try {
    const params: CityQueryDTO = { page: currentPage.value, size: pageSize.value }
    if (query.cityName) params.cityName = query.cityName
    if (query.province) params.province = query.province
    if (query.region) params.region = query.region
    const res = await getCityList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取城市列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.cityName = ''
  query.province = ''
  query.region = ''
  currentPage.value = 1
  fetchList()
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

function goDetail(id: string) {
  router.push(`/city/${id}`)
}

function selectRegion(region: string) {
  query.region = query.region === region ? '' : region
  currentPage.value = 1
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7zm-2 9.9V17h4v-5.1a2 2 0 10-4 0z"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">城市信息大全 · 填报志愿的重要参考维度</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            城市是高考志愿填报的重要参考维度。通过本页面您可以查询全国各城市的高等教育资源、经济发展水平、产业结构等信息，帮助您做出更科学的院校选择。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['高校资源', '经济发展', '产业结构', '生活配套']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- 城市检索 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            城市检索
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="query.cityName"
              type="text"
              placeholder="输入城市名称搜索"
              class="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              @keyup.enter="handleSearch"
            />
            <el-select v-model="query.province" placeholder="省份" clearable filterable class="!w-40">
              <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <button
              class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
              @click="handleSearch"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              搜索
            </button>
            <button
              class="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
              @click="handleReset"
            >
              重置
            </button>
          </div>
          <div class="mt-4 border-t border-gray-100 pt-4 flex flex-wrap items-center gap-3">
            <span class="text-sm text-gray-400">地区：</span>
            <button
              class="rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer"
              :class="query.region === ''
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
              @click="selectRegion('')"
            >
              全部地区
            </button>
            <button
              v-for="opt in regionOptions" :key="opt"
              class="rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer"
              :class="query.region === opt
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
              @click="selectRegion(opt)"
            >
              {{ opt }}
            </button>
          </div>
        </div>
      </Motion>

      <!-- 城市列表 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.2 }">
        <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2a7 7 0 00-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 001 1h6a1 1 0 001-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 00-7-7zm-2 9.9V17h4v-5.1a2 2 0 10-4 0z"/></svg>
            城市列表
          </div>
          <div v-loading="loading" class="min-h-[400px]">
            <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                v-for="item in list"
                :key="item.id"
                class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 overflow-hidden transition-all cursor-pointer"
                @click="goDetail(item.id)"
              >
                <div class="h-1 bg-gradient-to-r from-[#F97316] to-[#FB923C]"></div>
                <div class="px-5 py-5">
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-gray-800">{{ item.cityName }}</h3>
                    <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.region }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">{{ item.province }}</p>
                  <div class="flex gap-4 mt-3 text-sm">
                    <span class="text-gray-500">高校数 <strong class="text-gray-700">{{ item.collegeCount ?? 0 }}</strong></span>
                    <span class="text-gray-500">重点院校 <strong class="text-orange-500">{{ item.keyCollegeCount ?? 0 }}</strong></span>
                  </div>
                  <p class="text-sm text-gray-700 font-medium mt-2">{{ item.gdp != null ? item.gdp.toFixed(2) : '-' }} 亿元</p>
                  <p class="text-sm text-gray-500 line-clamp-2 mt-2">{{ item.cityIntro || '暂无城市介绍' }}</p>
                  <p class="mt-3 text-sm font-medium text-orange-500 group-hover:text-orange-600 transition-colors">查看详情 →</p>
                </div>
              </div>
            </div>
            <div v-else-if="!loading" class="py-20 text-center text-gray-400">
              暂无城市数据
            </div>
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
