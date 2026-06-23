<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SiteFooter from '@/components/SiteFooter.vue'
import { getEnterpriseList } from '@/api/enterprise'
import type { EnterpriseListVO, EnterpriseQueryDTO } from '@/types/enterprise'

const router = useRouter()

const loading = ref(false)
const list = ref<EnterpriseListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(9)

const query = reactive<EnterpriseQueryDTO>({
  page: 1,
  size: 9,
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  cityName: '',
  recruitmentStatus: '',
})

const natureOptions = ['央企', '国企', '民企', '外企', '合资']
const statusOptions = ['招聘中', '已结束']

async function fetchList() {
  loading.value = true
  try {
    const params: EnterpriseQueryDTO = { page: currentPage.value, size: pageSize.value }
    if (query.enterpriseName) params.enterpriseName = query.enterpriseName
    if (query.enterpriseNature) params.enterpriseNature = query.enterpriseNature
    if (query.enterpriseType) params.enterpriseType = query.enterpriseType
    if (query.cityName) params.cityName = query.cityName
    if (query.recruitmentStatus) params.recruitmentStatus = query.recruitmentStatus

    const res = await getEnterpriseList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取企业列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.enterpriseName = ''
  query.enterpriseNature = ''
  query.enterpriseType = ''
  query.cityName = ''
  query.recruitmentStatus = ''
  currentPage.value = 1
  fetchList()
}

function goPositions(item: EnterpriseListVO) {
  router.push({
    path: `/enterprise/${item.id}/positions`,
    query: {
      name: item.enterpriseName,
      nature: item.enterpriseNature,
      city: item.cityName,
      logoUrl: item.logoUrl || '',
      region: item.region || '',
      scale: item.enterpriseScale || '',
      mainBusiness: item.mainBusiness || '',
    },
  })
}

function onPageChange(page: number) { currentPage.value = page; fetchList() }
function onSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; fetchList() }

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回首页</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">企业探索</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Banner -->
      <div class="mb-8 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
        <p class="text-gray-700 leading-relaxed">
          聚合优质企业信息，覆盖互联网/IT、金融、制造、教育等行业头部企业，提供企业规模、主营业务、招聘状态等数据，助您了解目标企业，规划职业发展。
        </p>
      </div>

      <!-- 搜索栏 -->
      <div class="mb-6 flex items-center gap-3">
        <input
          v-model="query.enterpriseName"
          type="text"
          placeholder="输入企业名称搜索"
          class="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
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

      <!-- 精准筛选 -->
      <div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <el-select v-model="query.enterpriseNature" placeholder="企业性质" clearable>
          <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <input
          v-model="query.enterpriseType"
          type="text"
          placeholder="企业类型"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
        />
        <input
          v-model="query.cityName"
          type="text"
          placeholder="城市名称"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
        />
        <el-select v-model="query.recruitmentStatus" placeholder="招聘状态" clearable>
          <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="min-h-[400px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="item in list"
            :key="item.id"
            class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl transition-all overflow-hidden"
          >
            <div class="p-5">
              <div class="flex items-start gap-4 mb-3">
                <div class="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
                  <img
                    v-if="item.logoUrl"
                    :src="item.logoUrl"
                    :alt="item.enterpriseName"
                    class="w-full h-full object-cover"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <span v-else class="text-lg font-bold text-orange-600">{{ item.enterpriseName.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.enterpriseName }}</h3>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.enterpriseNature }}</span>
                    <span v-if="item.enterpriseType" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ item.enterpriseType }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-1.5 text-sm text-gray-500 mb-3">
                <div v-if="item.cityName">📍 {{ item.cityName }}</div>
                <div v-if="item.enterpriseScale">👥 {{ item.enterpriseScale }}</div>
                <div v-if="item.region">🏠 {{ item.region }}</div>
              </div>

              <p v-if="item.mainBusiness" class="text-sm text-gray-400 line-clamp-2 mb-4">{{ item.mainBusiness }}</p>

              <button
                class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click="goPositions(item)"
              >
                查看岗位
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无企业数据</div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[9, 18, 30]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </main>

    <SiteFooter />
  </div>
</template>
