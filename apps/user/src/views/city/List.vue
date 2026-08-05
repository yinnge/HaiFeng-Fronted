<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCityList } from '@/api/city'
import type { CityListVO, CityQueryDTO } from '@/types/city'
import { ProvinceOptions } from '@haifeng/shared'

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
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取城市列表失败')
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

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 mb-6 border border-orange-100">
        <p class="text-sm text-gray-600 leading-relaxed">
          城市是高考志愿填报的重要参考维度。通过本页面您可以查询全国各城市的高等教育资源、经济发展水平、产业结构等信息，帮助您做出更科学的院校选择。
        </p>
      </div>

      <div class="mb-6 flex items-center gap-3">
        <input
          v-model="query.cityName"
          type="text"
          placeholder="输入城市名称搜索"
          class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <el-select v-model="query.province" placeholder="省份" clearable filterable class="w-40">
          <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="query.region" placeholder="地区" clearable class="w-36">
          <el-option v-for="opt in regionOptions" :key="opt" :label="opt" :value="opt" />
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

      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="item in list"
            :key="item.id"
            class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl overflow-hidden transition-all cursor-pointer"
            @click="goDetail(item.id)"
          >
            <div class="px-5 py-5">
              <h3 class="text-lg font-bold text-gray-800">{{ item.cityName }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ item.province }} · {{ item.region }}</p>
              <div class="flex gap-4 mt-3 text-sm">
                <span class="text-gray-500">高校数 <strong class="text-gray-700">{{ item.collegeCount ?? 0 }}</strong></span>
                <span class="text-gray-500">重点院校 <strong class="text-orange-500">{{ item.keyCollegeCount ?? 0 }}</strong></span>
              </div>
              <p class="text-sm text-gray-700 font-medium mt-2">{{ item.gdp != null ? item.gdp.toFixed(2) : '-' }} 亿元</p>
              <p class="text-sm text-gray-500 line-clamp-2 mt-2">{{ item.cityIntro || '暂无城市介绍' }}</p>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">
          暂无城市数据
        </div>
      </div>

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
