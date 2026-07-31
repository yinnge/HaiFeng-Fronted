<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCityDetail } from '@/api/city'
import type { CityDetailVO } from '@/types/city'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<CityDetailVO | null>(null)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('城市ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getCityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取城市详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-3xl font-bold text-gray-800">{{ detail.cityName }}</h2>
              <p class="text-gray-500 mt-1">{{ detail.subtitle }}</p>
              <span class="inline-block mt-3 rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600 font-medium">{{ detail.cityLevel }}</span>
            </div>
          </div>
          <div class="mt-4 text-sm">
            <span class="text-gray-400">行政区划代码：</span><span class="text-gray-700">{{ detail.adminCode }}</span>
          </div>
          <div class="mt-6 grid grid-cols-3 gap-6 border-t border-gray-100 pt-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-800">{{ detail.area ?? '-' }}</div>
              <div class="text-sm text-gray-400 mt-1">面积(km²)</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-800">{{ detail.perCapitaGdp ?? '-' }}</div>
              <div class="text-sm text-gray-400 mt-1">人均GDP(万元)</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-800">{{ detail.gdpGrowthRate ?? '-' }}%</div>
              <div class="text-sm text-gray-400 mt-1">GDP增速</div>
            </div>
          </div>
        </section>

        <!-- 经济指标 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">📊 经济指标</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
            <div><span class="text-gray-400">人均GDP：</span><span class="text-gray-700">{{ detail.perCapitaGdp ?? '-' }} 元</span></div>
            <div><span class="text-gray-400">GDP增速：</span><span class="text-gray-700">{{ detail.gdpGrowthRate ?? '-' }}%</span></div>
            <div><span class="text-gray-400">500强数量：</span><span class="text-gray-700">{{ detail.fortune500Count ?? '-' }} 家</span></div>
          </div>
          <div v-if="detail.industryStructure && Object.keys(detail.industryStructure).length" class="border-t border-gray-100 pt-4">
            <h4 class="text-sm font-semibold text-gray-600 mb-3">产业结构</h4>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center rounded-xl bg-orange-50 p-3">
                <div class="text-lg font-bold text-orange-600">{{ detail.industryStructure?.primary ?? '-' }}%</div>
                <div class="text-xs text-gray-500 mt-1">第一产业</div>
              </div>
              <div class="text-center rounded-xl bg-blue-50 p-3">
                <div class="text-lg font-bold text-blue-600">{{ detail.industryStructure?.secondary ?? '-' }}%</div>
                <div class="text-xs text-gray-500 mt-1">第二产业</div>
              </div>
              <div class="text-center rounded-xl bg-green-50 p-3">
                <div class="text-lg font-bold text-green-600">{{ detail.industryStructure?.tertiary ?? '-' }}%</div>
                <div class="text-xs text-gray-500 mt-1">第三产业</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 人口结构 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">👥 人口结构</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">城镇化率：</span><span class="text-gray-700">{{ detail.urbanizationRate ?? '-' }}%</span></div>
            <div><span class="text-gray-400">农村人口比例：</span><span class="text-gray-700">{{ detail.ruralPopRatio ?? '-' }}%</span></div>
            <div><span class="text-gray-400">老龄化率：</span><span class="text-gray-700">{{ detail.agingRate ?? '-' }}%</span></div>
            <div><span class="text-gray-400">流入人口比例：</span><span class="text-gray-700">{{ detail.migrantPopRatio ?? '-' }}%</span></div>
          </div>
        </section>

        <!-- 产业发展 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🏭 产业发展</h3>
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-gray-600 mb-2">主导产业</h4>
            <div class="flex flex-wrap gap-2">
              <span v-if="detail.mainIndustries?.length" v-for="item in detail.mainIndustries" :key="item" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">{{ item }}</span>
              <span v-else class="text-gray-400 text-sm">暂无数据</span>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-gray-600 mb-2">新兴产业</h4>
            <div class="flex flex-wrap gap-2">
              <span v-if="detail.emergingIndustries?.length" v-for="item in detail.emergingIndustries" :key="item" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">{{ item }}</span>
              <span v-else class="text-gray-400 text-sm">暂无数据</span>
            </div>
          </div>
          <div v-if="detail.industryDescription" class="border-t border-gray-100 pt-4">
            <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.industryDescription }}</p>
          </div>
        </section>

        <!-- 生活配套 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🏠 生活配套</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-400">房价水平：</span>
              <span class="text-gray-700">{{ detail.housingPriceLevel?.average ?? '-' }}元/㎡ · {{ detail.housingPriceLevel?.level ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">租金水平：</span>
              <span class="text-gray-700">{{ detail.rentalCost?.average ?? '-' }}元/月 · {{ detail.rentalCost?.level ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">消费水平：</span>
              <span class="text-gray-700">{{ detail.consumption?.average ?? '-' }} · {{ detail.consumption?.level ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">住房政策：</span>
              <span class="text-gray-700">{{ detail.housingPolicy?.policy ?? detail.housingPolicy?.description ?? '-' }}</span>
            </div>
          </div>
        </section>

        <!-- 教育医疗 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🎓 教育医疗</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-400">高校数量：</span>
              <span class="text-gray-700">{{ detail.highEducation?.universities ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">重点院校：</span>
              <span class="text-gray-700">{{ detail.highEducation?.keyUniversities ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">小学数量：</span>
              <span class="text-gray-700">{{ detail.basicEducation?.primarySchools ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">中学数量：</span>
              <span class="text-gray-700">{{ detail.basicEducation?.middleSchools ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">三甲医院：</span>
              <span class="text-gray-700">{{ detail.medical?.grade3Hospitals ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">社区诊所：</span>
              <span class="text-gray-700">{{ detail.medical?.communityClinics ?? '-' }}</span>
            </div>
          </div>
        </section>

        <!-- 交通文化 Section -->
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🚇 交通文化</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-400">地铁线路：</span>
              <span class="text-gray-700">{{ detail.transportation?.metroLines ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">机场数量：</span>
              <span class="text-gray-700">{{ detail.transportation?.airports ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">博物馆：</span>
              <span class="text-gray-700">{{ detail.culture?.museums ?? '-' }}</span>
            </div>
            <div>
              <span class="text-gray-400">剧院：</span>
              <span class="text-gray-700">{{ detail.culture?.theaters ?? '-' }}</span>
            </div>
          </div>
        </section>

        <!-- 未来规划 Section -->
        <section v-if="detail.futurePlan && Object.keys(detail.futurePlan).length" class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
          <h3 class="mb-4 text-lg font-bold text-gray-800">🔮 未来规划</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">发展方向：</span><span class="text-gray-700">{{ detail.futurePlan?.focus ?? '-' }}</span></div>
            <div><span class="text-gray-400">目标年份：</span><span class="text-gray-700">{{ detail.futurePlan?.targetYear ?? '-' }}</span></div>
          </div>
          <p v-if="detail.futurePlan?.description" class="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.futurePlan.description }}</p>
        </section>
      </template>
    </main>
  </div>
</template>
