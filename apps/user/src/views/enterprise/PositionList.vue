<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPositions, getEnterpriseIndustries } from '@/api/enterprise'
import type { EnterprisePositionVO, EnterpriseIndustryGroupVO } from '@/types/enterprise'

const router = useRouter()
const route = useRoute()

const enterpriseId = Number(route.params.id)
const enterpriseName = (route.query.name as string) || ''
const enterpriseNature = (route.query.nature as string) || ''
const enterpriseCity = (route.query.city as string) || ''
const enterpriseLogoUrl = (route.query.logoUrl as string) || ''
const enterpriseRegion = (route.query.region as string) || ''
const enterpriseScale = (route.query.scale as string) || ''
const enterpriseMainBusiness = (route.query.mainBusiness as string) || ''

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
    ElMessage.error(e?.response?.data?.msg || '获取岗位列表失败')
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

function goIndustry(id: number) {
  router.push(`/industry/${id}`)
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
  fetchPositions()
  fetchIndustries()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- 企业信息卡片 -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
        <div class="flex items-start gap-4">
          <div class="shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden">
            <img
              v-if="enterpriseLogoUrl"
              :src="enterpriseLogoUrl"
              :alt="enterpriseName"
              class="w-full h-full object-cover"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
            <span v-else class="text-2xl font-bold text-orange-600">{{ enterpriseName.charAt(0) }}</span>
          </div>
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800">{{ enterpriseName }}</h2>
            <div class="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
              <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ enterpriseNature }}</span>
              <span v-if="enterpriseCity">📍 {{ enterpriseCity }}</span>
              <span v-if="enterpriseRegion">🏠 {{ enterpriseRegion }}</span>
              <span v-if="enterpriseScale">👥 {{ enterpriseScale }}</span>
            </div>
            <p v-if="enterpriseMainBusiness" class="text-sm text-gray-400 mt-2">{{ enterpriseMainBusiness }}</p>
          </div>
        </div>
      </section>

      <!-- 关联行业区块（Pro 功能） -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 mb-6">
        <h3 class="mb-4 text-lg font-bold text-gray-800">🏭 关联行业</h3>
        <div v-if="industriesLoading" class="text-sm text-gray-400">加载中...</div>
        <template v-else-if="isPro">
          <div v-if="industries.length && industries[0].industries.length" class="flex flex-wrap gap-2">
            <button
              v-for="ind in industries[0].industries"
              :key="ind.industryId"
              class="rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-700 font-medium hover:bg-orange-100 transition-colors cursor-pointer"
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

      <!-- 岗位列表 -->
      <section v-loading="loading" class="min-h-[300px]">
        <h3 class="mb-4 text-lg font-bold text-gray-800">📋 共 {{ positions.length }} 个岗位</h3>

        <div v-if="positions.length" class="space-y-4">
          <div
            v-for="(pos, index) in positions"
            :key="index"
            class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
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
                class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click="openApplyLink(pos.applyLink)"
              >
                去申请 →
              </button>
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="py-20 text-center text-gray-400">该企业暂无招聘岗位</div>
      </section>
    </main>
  </div>
</template>
