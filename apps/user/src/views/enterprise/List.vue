<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEnterpriseList, getEnterpriseTypes } from '@/api/enterprise'
import type { EnterpriseListVO, EnterpriseQueryDTO } from '@/types/enterprise'
import { Motion } from 'motion-v'

const router = useRouter()

const loading = ref(false)
const list = ref<EnterpriseListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const query = reactive<EnterpriseQueryDTO>({
  page: 1,
  size: 12,
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  cityName: '',
  recruitmentStatus: '',
})

const natureOptions = ['央企', '国企', '民企', '外企', '合资']
const statusOptions = ['招聘中', '已结束']
const typeOptions = ref<string[]>([])

async function fetchTypes() {
  try {
    const res = await getEnterpriseTypes()
    typeOptions.value = res.data.data || []
  } catch {
    // 类型接口失败不影响页面主体功能
  }
}

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
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取企业列表失败')
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

onMounted(() => {
  fetchList()
  fetchTypes()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">企业信息大全 · 科学规划职业的起点</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            聚合优质企业信息，覆盖互联网/IT、金融、制造、教育等行业头部企业，提供企业规模、主营业务、招聘状态等数据，助您了解目标企业，规划职业发展。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['企业性质', '企业规模', '主营业务', '招聘状态']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- 企业检索 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            企业检索
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="query.enterpriseName"
              type="text"
              placeholder="输入企业名称搜索"
              class="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
              @keyup.enter="handleSearch"
            />
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
            <span class="text-sm text-gray-400">精准筛选：</span>
            <el-select v-model="query.enterpriseNature" placeholder="企业性质" clearable class="!w-36">
              <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-select v-model="query.enterpriseType" placeholder="企业类型" clearable class="!w-36">
              <el-option v-for="opt in typeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <input
              v-model="query.cityName"
              type="text"
              placeholder="城市名称"
              class="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
            />
            <el-select v-model="query.recruitmentStatus" placeholder="招聘状态" clearable class="!w-32">
              <el-option v-for="opt in statusOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </div>
        </div>
      </Motion>

      <!-- 企业列表 -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.2 }">
        <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            企业列表
          </div>
          <div v-loading="loading" class="min-h-[400px]">
            <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="item in list"
                :key="item.id"
                class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
              >
                <div class="h-1 bg-gradient-to-r from-[#F97316] to-[#FB923C]"></div>
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
                    class="w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
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
          <div v-if="total > pageSize" class="mt-6 flex justify-center">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="total"
              :page-sizes="[12, 24, 36]"
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
