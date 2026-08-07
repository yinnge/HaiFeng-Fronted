<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPositions, getEnterpriseIndustries, getEnterpriseDetail } from '@/api/enterprise'
import type { EnterprisePositionVO, EnterpriseIndustryGroupVO } from '@/types/enterprise'
import { Motion } from 'motion-v'

const router = useRouter()
const route = useRoute()

const enterpriseId = route.params.id as string
// 列表页跳转时带入的 query 参数用于即时渲染；再按 id 调接口拉取权威数据，刷新/深链也不丢
const enterpriseName = ref((route.query.name as string) || '')
const enterpriseNature = ref((route.query.nature as string) || '')
const enterpriseCity = ref((route.query.city as string) || '')
const enterpriseLogoUrl = ref((route.query.logoUrl as string) || '')
const enterpriseRegion = ref((route.query.region as string) || '')
const enterpriseScale = ref((route.query.scale as string) || '')
const enterpriseMainBusiness = ref((route.query.mainBusiness as string) || '')

const loading = ref(false)
const positions = ref<EnterprisePositionVO[]>([])
const industries = ref<EnterpriseIndustryGroupVO[]>([])
const industriesLoading = ref(false)
const isPro = ref(false)

async function fetchPositions() {
  if (!enterpriseId) {
    ElMessage.error('企业ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getPositions(enterpriseId)
    positions.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取岗位列表失败')
  } finally {
    loading.value = false
  }
}

async function fetchIndustries() {
  industriesLoading.value = true
  try {
    const res = await getEnterpriseIndustries([enterpriseId])
    industries.value = res.data.data
    isPro.value = true
  } catch (e: any) {
    if (e?.response?.status === 403) {
      isPro.value = false
    }
  } finally {
    industriesLoading.value = false
  }
}

function goIndustry(id: string) {
  router.push(`/industry/${id}`)
}

async function fetchDetail() {
  if (!enterpriseId) return
  try {
    const res = await getEnterpriseDetail(enterpriseId)
    const d = res.data.data
    if (d) {
      enterpriseName.value = d.enterpriseName
      enterpriseNature.value = d.enterpriseNature
      enterpriseCity.value = d.cityName
      enterpriseLogoUrl.value = d.logoUrl || ''
      enterpriseRegion.value = d.region || ''
      enterpriseScale.value = d.enterpriseScale || ''
      enterpriseMainBusiness.value = d.mainBusiness || ''
    }
  } catch (e: any) {
    // 接口失败时沿用列表页带入的 query 参数兜底，不阻断页面
    console.warn('获取企业详情失败，沿用列表传入信息', e?.response?.data?.msg)
  }
}

function formatSalary(min: number | null, max: number | null): string {
  if (min == null && max == null) return '薪资面议'
  if (min != null && max != null) return `${min}-${max}k/月`
  if (min != null) return `${min}k起/月`
  return `最高${max}k/月`
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return '暂无'
  return deadline.slice(0, 10)
}

function openApplyLink(link: string | null) {
  if (link) window.open(link, '_blank')
}

onMounted(() => {
  fetchDetail()
  fetchPositions()
  fetchIndustries()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- Hero Header -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4 }" class="mb-8">
        <section class="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 shadow-lg shadow-orange-200/60">
          <div class="flex items-start gap-4 mb-6 flex-wrap">
            <div class="shrink-0 w-16 h-16 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
              <img
                v-if="enterpriseLogoUrl"
                :src="enterpriseLogoUrl"
                :alt="enterpriseName"
                class="w-full h-full object-cover"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <span v-else class="text-2xl font-bold text-white">{{ enterpriseName.charAt(0) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-2xl font-bold text-white">{{ enterpriseName }}</h2>
                <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white border border-white/30">{{ enterpriseNature }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-orange-50">
                <span v-if="enterpriseCity">📍 {{ enterpriseCity }}</span>
                <span v-if="enterpriseRegion">🏠 {{ enterpriseRegion }}</span>
                <span v-if="enterpriseScale">👥 {{ enterpriseScale }}</span>
              </div>
            </div>
          </div>
          <p v-if="enterpriseMainBusiness" class="text-orange-50 leading-relaxed mb-6">{{ enterpriseMainBusiness }}</p>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="rounded-xl bg-white p-4 text-center shadow-md">
              <div class="text-2xl font-bold text-orange-500">{{ positions.length }}</div>
              <div class="text-gray-500 mt-1 text-xs">在招岗位</div>
            </div>
            <div class="rounded-xl bg-white p-4 text-center shadow-md">
              <div class="text-2xl font-bold text-green-600">{{ positions.filter((p) => p.positionStatus === '招聘中').length }}</div>
              <div class="text-gray-500 mt-1 text-xs">招聘中</div>
            </div>
            <div class="rounded-xl bg-white p-4 text-center shadow-md">
              <div class="text-2xl font-bold text-blue-600">{{ industries.length && industries[0].industries ? industries[0].industries.length : '-' }}</div>
              <div class="text-gray-500 mt-1 text-xs">关联行业</div>
            </div>
          </div>
        </section>
      </Motion>

      <!-- Two-column content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Left column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 岗位列表 -->
          <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.1 }">
            <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
              <div class="mb-4 flex items-center justify-between flex-wrap gap-2">
                <h3 class="text-lg font-bold text-gray-800">📋 岗位列表</h3>
                <span class="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">共 {{ positions.length }} 个岗位</span>
              </div>
              <div v-loading="loading" class="min-h-[300px]">
                <div v-if="positions.length" class="space-y-4">
                  <div
                    v-for="(pos, index) in positions"
                    :key="index"
                    class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <h4 class="text-lg font-bold text-gray-800">{{ pos.positionName }}</h4>
                      <div class="flex items-center gap-2">
                        <span v-if="pos.recruitmentType" class="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{{ pos.recruitmentType }}</span>
                        <span
                          class="rounded-full px-2 py-0.5 text-xs"
                          :class="pos.positionStatus === '招聘中' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
                        >
                          {{ pos.positionStatus || '未知' }}
                        </span>
                      </div>
                    </div>

                    <div v-if="pos.positionTags?.length" class="flex flex-wrap gap-1.5 mb-3">
                      <span v-for="tag in pos.positionTags" :key="tag" class="rounded-full bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600 border border-gray-200">
                        {{ tag }}
                      </span>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500 mb-4">
                      <div v-if="pos.province || pos.city || pos.workLocation">
                        📍 {{ [pos.province, pos.city, pos.workLocation].filter(Boolean).join('·') }}
                      </div>
                      <div v-if="pos.salaryMin || pos.salaryMax">
                        💰 {{ formatSalary(pos.salaryMin, pos.salaryMax) }}
                      </div>
                      <div v-if="pos.educationRequirement">
                        🎓 {{ pos.educationRequirement }}
                      </div>
                      <div v-if="pos.majorRequirement">
                        📚 {{ pos.majorRequirement }}
                      </div>
                      <div v-if="pos.workExperience">
                        ⏱ {{ pos.workExperience }}
                      </div>
                      <div v-if="pos.deadline">
                        📅 截止: {{ formatDeadline(pos.deadline) }}
                      </div>
                    </div>

                    <div v-if="pos.positionRequirement" class="mb-4">
                      <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">{{ pos.positionRequirement }}</p>
                    </div>

                    <div class="flex justify-end">
                      <button
                        class="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
                        @click="openApplyLink(pos.applyLink)"
                      >
                        去申请 →
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else-if="!loading" class="py-20 text-center text-gray-400">该企业暂无招聘岗位</div>
              </div>
            </section>
          </Motion>
        </div>

        <!-- Right column (sticky) -->
        <div class="space-y-6 lg:sticky lg:top-24">
          <!-- 关联行业（Pro 功能） -->
          <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.15 }">
            <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
              <h3 class="mb-4 text-lg font-bold text-gray-800">🏭 关联行业</h3>
              <div v-if="industriesLoading" class="text-sm text-gray-400">加载中...</div>
              <template v-else-if="isPro">
                <div v-if="industries.length && industries[0].industries.length" class="flex flex-wrap gap-2">
                  <button
                    v-for="ind in industries[0].industries"
                    :key="ind.industryId"
                    class="rounded-full bg-white px-4 py-2 text-sm text-orange-700 font-medium hover:bg-orange-100 transition-colors cursor-pointer border border-orange-200"
                    @click="goIndustry(ind.industryId)"
                  >
                    {{ ind.industryName }} →
                  </button>
                </div>
                <p v-else class="text-sm text-gray-400">暂无关联行业</p>
              </template>
              <div v-else class="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 border border-orange-100">
                <p class="text-sm text-gray-600">
                  🔒 升级
                  <router-link to="/profile" class="text-orange-500 font-semibold hover:underline">专业版</router-link>
                  可查看企业关联行业信息
                </p>
              </div>
            </section>
          </Motion>

          <!-- 企业信息 -->
          <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.25 }">
            <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
              <h3 class="mb-4 text-lg font-bold text-gray-800">ℹ️ 企业信息</h3>
              <div class="space-y-3 text-sm">
                <div v-if="enterpriseNature" class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                  <span class="text-gray-400">企业性质</span>
                  <span class="text-gray-700 font-medium">{{ enterpriseNature }}</span>
                </div>
                <div v-if="enterpriseCity" class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                  <span class="text-gray-400">所在城市</span>
                  <span class="text-gray-700 font-medium">{{ enterpriseCity }}</span>
                </div>
                <div v-if="enterpriseRegion" class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                  <span class="text-gray-400">所属地区</span>
                  <span class="text-gray-700 font-medium">{{ enterpriseRegion }}</span>
                </div>
                <div v-if="enterpriseScale" class="flex justify-between items-center rounded-lg bg-white px-3 py-2.5">
                  <span class="text-gray-400">企业规模</span>
                  <span class="text-gray-700 font-medium">{{ enterpriseScale }}</span>
                </div>
              </div>
            </section>
          </Motion>
        </div>
      </div>
    </main>
  </div>
</template>
