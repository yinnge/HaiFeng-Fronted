<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCityDetail } from '@/api/city'
import type { CityDetailVO } from '@/types/city'
import { Motion } from 'motion-v'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<CityDetailVO | null>(null)

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('城市ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getCityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取城市详情失败')
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
        <!-- Hero Header -->
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-8">
          <section class="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 shadow-lg shadow-orange-200/60">
            <div class="flex items-start justify-between mb-6 flex-wrap gap-4">
              <div>
                <div class="flex items-center gap-3 flex-wrap">
                  <h2 class="text-2xl md:text-3xl font-bold text-white">{{ detail.cityName }}</h2>
                  <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white border border-white/30">{{ detail.cityLevel }}</span>
                </div>
                <p class="text-orange-50 mt-1">{{ detail.subtitle }}</p>
                <p class="text-orange-100/80 mt-1 font-mono text-sm">行政区划代码：{{ detail.adminCode }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-orange-500">{{ detail.area ?? '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">面积(km²)</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-blue-600">{{ detail.perCapitaGdp ?? '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">人均GDP(万元)</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-green-600">{{ detail.gdpGrowthRate ?? '-' }}%</div>
                <div class="text-gray-500 mt-1 text-xs">GDP增速</div>
              </div>
              <div class="rounded-xl bg-white p-4 text-center shadow-md">
                <div class="text-2xl font-bold text-purple-600">{{ detail.highEducation?.totalColleges ?? '-' }}</div>
                <div class="text-gray-500 mt-1 text-xs">高校总数</div>
              </div>
            </div>
          </section>
        </Motion>

        <!-- Two-column content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Left column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 经济指标 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  📊 经济指标
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span class="text-gray-400">人均GDP：</span><span class="text-gray-700">{{ detail.perCapitaGdp ?? '-' }} 元</span></div>
                  <div><span class="text-gray-400">GDP增速：</span><span class="text-gray-700">{{ detail.gdpGrowthRate ?? '-' }}%</span></div>
                  <div><span class="text-gray-400">500强数量：</span><span class="text-gray-700">{{ detail.fortune500Count ?? '-' }} 家</span></div>
                </div>
              </section>
            </Motion>

            <!-- 人口结构 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  👥 人口结构
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span class="text-gray-400">城镇化率：</span><span class="text-gray-700">{{ detail.urbanizationRate ?? '-' }}%</span></div>
                  <div><span class="text-gray-400">农村人口比例：</span><span class="text-gray-700">{{ detail.ruralPopRatio ?? '-' }}%</span></div>
                  <div><span class="text-gray-400">老龄化率：</span><span class="text-gray-700">{{ detail.agingRate ?? '-' }}%</span></div>
                  <div><span class="text-gray-400">流入人口比例：</span><span class="text-gray-700">{{ detail.migrantPopRatio ?? '-' }}%</span></div>
                </div>
              </section>
            </Motion>

            <!-- 产业发展 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.2 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  🏭 产业发展
                </div>
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
            </Motion>

            <!-- 生活配套 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  🏠 生活配套
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">平均房价：</span>
                    <span class="text-gray-700">{{ detail.housingPriceLevel?.avgPrice ?? '-' }}万/㎡</span>
                  </div>
                  <div>
                    <span class="text-gray-400">市中心租金：</span>
                    <span class="text-gray-700">{{ detail.rentalCost?.downtownRentRange ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">人均消费：</span>
                    <span class="text-gray-700">{{ detail.consumption?.perCapitaConsumption ?? '-' }}万/年</span>
                  </div>
                  <div>
                    <span class="text-gray-400">限购政策：</span>
                    <span class="text-gray-700">{{ detail.housingPolicy?.purchaseRestriction ?? '-' }}</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- 教育医疗 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.3 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  🎓 教育医疗
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">高校总数：</span>
                    <span class="text-gray-700">{{ detail.highEducation?.totalColleges ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">双一流高校：</span>
                    <span class="text-gray-700">{{ detail.highEducation?.doubleFirstClassCount ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">学校总数：</span>
                    <span class="text-gray-700">{{ detail.basicEducation?.totalSchools ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">重点学校：</span>
                    <span class="text-gray-700">{{ detail.basicEducation?.keySchoolCount ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">三甲医院：</span>
                    <span class="text-gray-700">{{ detail.medical?.topHospitalCount ?? '-' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">医生密度：</span>
                    <span class="text-gray-700">{{ detail.medical?.doctorDensity ?? '-' }}人/千人</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- 交通文化 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.35 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  🚇 交通文化
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">地铁线路：</span>
                    <span class="text-gray-700">{{ detail.transportation?.metroLines ?? '-' }}条</span>
                  </div>
                  <div>
                    <span class="text-gray-400">高速公路：</span>
                    <span class="text-gray-700">{{ detail.transportation?.highwayMileage ?? '-' }}公里</span>
                  </div>
                  <div>
                    <span class="text-gray-400">世界遗产：</span>
                    <span class="text-gray-700">{{ detail.culture?.worldHeritageCount ?? '-' }}项</span>
                  </div>
                  <div>
                    <span class="text-gray-400">A级景区：</span>
                    <span class="text-gray-700">{{ detail.culture?.aScenicCount ?? '-' }}家</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- 未来规划 -->
            <Motion v-if="detail.futurePlan && Object.keys(detail.futurePlan).length" :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.4 }">
              <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
                <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
                  🔮 未来规划
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div><span class="text-gray-400">发展目标：</span><span class="text-gray-700">{{ detail.futurePlan?.developmentGoal ?? '-' }}</span></div>
                  <div><span class="text-gray-400">目标年份：</span><span class="text-gray-700">{{ detail.futurePlan?.targetYear ?? '-' }}</span></div>
                </div>
                <div v-if="detail.futurePlan?.keyAreas?.length" class="mt-3">
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(area, idx) in detail.futurePlan?.keyAreas" :key="idx" class="rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">{{ area }}</span>
                  </div>
                </div>
              </section>
            </Motion>
          </div>

          <!-- Right column (sticky) -->
          <div class="space-y-6 lg:sticky lg:top-24">
            <!-- 城市速览 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }">
              <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <h3 class="mb-4 text-lg font-bold text-gray-800">ℹ️ 城市速览</h3>
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">行政区划代码</span>
                    <span class="text-gray-700 font-medium font-mono">{{ detail.adminCode }}</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">城市级别</span>
                    <span class="text-gray-700 font-medium">{{ detail.cityLevel }}</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">500强数量</span>
                    <span class="text-gray-700 font-medium">{{ detail.fortune500Count ?? '-' }} 家</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">城镇化率</span>
                    <span class="text-gray-700 font-medium">{{ detail.urbanizationRate ?? '-' }}%</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">老龄化率</span>
                    <span class="text-gray-700 font-medium">{{ detail.agingRate ?? '-' }}%</span>
                  </div>
                  <div class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                    <span class="text-gray-400">流入人口比例</span>
                    <span class="text-gray-700 font-medium">{{ detail.migrantPopRatio ?? '-' }}%</span>
                  </div>
                </div>
              </section>
            </Motion>

            <!-- 产业结构 -->
            <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }">
              <section v-if="detail.industryStructure && Object.keys(detail.industryStructure).length" class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
                <h3 class="mb-4 text-lg font-bold text-gray-800">🏭 产业结构</h3>
                <div class="grid grid-cols-3 gap-4 text-sm">
                  <div class="text-center rounded-xl bg-orange-50 p-3">
                    <div class="text-lg font-bold text-orange-600">{{ detail.industryStructure?.primaryRatio ?? '-' }}%</div>
                    <div class="text-xs text-gray-500 mt-1">第一产业</div>
                  </div>
                  <div class="text-center rounded-xl bg-blue-50 p-3">
                    <div class="text-lg font-bold text-blue-600">{{ detail.industryStructure?.secondaryRatio ?? '-' }}%</div>
                    <div class="text-xs text-gray-500 mt-1">第二产业</div>
                  </div>
                  <div class="text-center rounded-xl bg-green-50 p-3">
                    <div class="text-lg font-bold text-green-600">{{ detail.industryStructure?.tertiaryRatio ?? '-' }}%</div>
                    <div class="text-xs text-gray-500 mt-1">第三产业</div>
                  </div>
                </div>
              </section>
            </Motion>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
