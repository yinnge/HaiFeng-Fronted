<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUniversityDetail } from '@/api/university'
import type { UniversityDetailVO } from '@/types/university'
import { ElMessage } from 'element-plus'
import LaboratoryTab from '@/components/university/LaboratoryTab.vue'
import DepartmentTab from '@/components/university/DepartmentTab.vue'
import SubjectEvaluationTab from '@/components/university/SubjectEvaluationTab.vue'
import PostgradMajorForUniversityTab from '@/components/major/PostgradMajorForUniversityTab.vue'
import ChannelTab from '@/components/university/ChannelTab.vue'
import AdmissionGroupTab from '@/components/university/AdmissionGroupTab.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<UniversityDetailVO | null>(null)
const activeTab = ref('laboratory')

const tabs = [
  { key: 'laboratory', label: '重点实验室', iconClass: 'laboratory' },
  { key: 'postgrad', label: '考研专业', iconClass: 'postgrad' },
  { key: 'department', label: '院系', iconClass: 'department' },
  { key: 'evaluation', label: '学科评估', iconClass: 'evaluation' },
  { key: 'channel', label: '特殊通道', iconClass: 'channel' },
  { key: 'admission', label: '录取数据', iconClass: 'admission' },
]

/** 排行榜英文 key → 中文名称 */
const RANKING_LABELS: Record<string, string> = {
  ruanke: '软科排名',
  xiaoyouhui: '校友会排名',
  wushulian: '武书连排名',
  qs: 'QS排名',
  usnews: 'U.S.NEWS排名',
}
/** 展示顺序（未在表中的 key 追加到末尾） */
const RANKING_ORDER = ['ruanke', 'xiaoyouhui', 'wushulian', 'qs', 'usnews']

const rankingList = computed(() => {
  const raw = detail.value?.rankings
  if (!raw) return []
  return Object.entries(raw)
    .map(([key, value]) => ({
      key,
      label: RANKING_LABELS[String(key).toLowerCase()] || key,
      value,
    }))
    .sort((a, b) => {
      const ai = RANKING_ORDER.indexOf(String(a.key).toLowerCase())
      const bi = RANKING_ORDER.indexOf(String(b.key).toLowerCase())
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
})

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('院校ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getUniversityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取院校详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/university')
}

function goGuide() {
  router.push(`/university/${route.params.id}/guide`)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-6xl">
      <!-- 骨架屏 -->
      <template v-if="loading && !detail">
        <!-- 顶部操作栏骨架 -->
        <div class="flex justify-between items-center mb-6">
          <div class="space-y-2">
            <div class="h-8 skeleton w-48 rounded" />
            <div class="h-4 skeleton w-24 rounded" />
          </div>
          <div class="h-10 skeleton w-24 rounded-full" />
        </div>

        <!-- 轮播图骨架 -->
        <div class="mb-8 rounded-2xl skeleton aspect-[16/9]" />

        <!-- 基本信息骨架 -->
        <div class="univ-card mb-8 rounded-2xl p-6 space-y-4" >
          <div class="h-8 skeleton w-48 rounded" />
          <div class="h-4 skeleton w-24 rounded" />
          <div class="flex gap-2">
            <div class="h-6 skeleton w-14 rounded-full" />
            <div class="h-6 skeleton w-16 rounded-full" />
            <div class="h-6 skeleton w-12 rounded-full" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="i in 8" :key="i" class="space-y-1">
              <div class="h-3 skeleton w-16 rounded" />
              <div class="h-4 skeleton w-20 rounded" />
            </div>
          </div>
        </div>

        <!-- 详细信息骨架 -->
        <div class="univ-card mb-8 rounded-2xl p-6 space-y-4" >
          <div class="h-5 skeleton w-24 rounded" />
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="i in 9" :key="i" class="space-y-1">
              <div class="h-3 skeleton w-14 rounded" />
              <div class="h-4 skeleton w-24 rounded" />
            </div>
          </div>
        </div>

        <!-- 介绍骨架 -->
        <div class="univ-card mb-8 rounded-2xl p-6 space-y-3" >
          <div class="h-5 skeleton w-20 rounded" />
          <div class="h-4 skeleton w-full rounded" />
          <div class="h-4 skeleton w-3/4 rounded" />
          <div class="h-4 skeleton w-5/6 rounded" />
        </div>

        <!-- Tab骨架 -->
        <div class="mb-8 flex justify-center">
          <div class="inline-flex gap-2">
            <div v-for="i in 6" :key="i" class="h-10 skeleton w-20 rounded-full" />
          </div>
        </div>
      </template>

      <template v-else-if="detail">
        <!-- 顶部操作栏 -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ detail.name }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ detail.nameEn || '院校详情' }}</p>
          </div>
          <button
            class="btn-secondary px-4 py-2 text-sm flex items-center gap-1.5"
            @click="goBack"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回列表
          </button>
        </div>

        <!-- 轮播图 -->
        <div v-if="detail.carouselImages?.length" class="univ-card mb-8 overflow-hidden" >
          <el-carousel height="420px" indicator-position="outside" arrow="always">
            <el-carousel-item v-for="(img, idx) in detail.carouselImages" :key="idx">
              <img :src="img" :alt="`${detail.name} ${idx + 1}`" class="h-full w-full object-cover" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 基本信息 -->
        <section class="univ-card mb-8 rounded-2xl p-6" >
          <h2 class="mb-4 text-3xl font-bold text-gray-800">{{ detail.name }}</h2>
          <p v-if="detail.nameEn" class="mb-4 text-gray-400">{{ detail.nameEn }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tag in detail.tags" :key="tag" class="pill-new text-xs">{{ tag }}</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-base">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div><span class="text-gray-400">大区：</span><span class="text-gray-700 font-medium">{{ detail.region }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div><span class="text-gray-400">省份：</span><span class="text-gray-700 font-medium">{{ detail.provinceName }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div><span class="text-gray-400">类型：</span><span class="text-gray-700 font-medium">{{ detail.category }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div><span class="text-gray-400">性质：</span><span class="text-gray-700 font-medium">{{ detail.nature }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div><span class="text-gray-400">学历层次：</span><span class="text-gray-700 font-medium">{{ detail.educationLevel }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div><span class="text-gray-400">主管部门：</span><span class="text-gray-700 font-medium">{{ detail.department }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div><span class="text-gray-400">所属联盟：</span><span class="text-gray-700 font-medium">{{ detail.famousUnion || '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div><span class="text-gray-400">专业数：</span><span class="text-gray-700 font-medium">{{ detail.majorCount }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <div><span class="text-gray-400">博士点：</span><span class="text-gray-700 font-medium">{{ detail.hasDoctorate ? '有' : '无' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <div><span class="text-gray-400">硕士点：</span><span class="text-gray-700 font-medium">{{ detail.hasMaster ? '有' : '无' }}</span></div>
            </div>
          </div>
        </section>

        <!-- 详细信息 -->
        <section class="univ-card mb-8 rounded-2xl p-6" >
          <h3 class="mb-4 text-xl font-bold text-gray-800">详细信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-base">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div><span class="text-gray-400">地址：</span><span class="text-gray-700">{{ detail.address || '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div><span class="text-gray-400">招生电话：</span><span class="text-gray-700">{{ detail.admissionPhone || '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <span class="text-gray-400">官网：</span>
                <a v-if="detail.website" :href="detail.website" target="_blank" class="text-brand-orange hover:underline">{{ detail.website }}</a>
                <span v-else class="text-gray-700">-</span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div><span class="text-gray-400">历史组分数线：</span><span class="text-gray-700 font-medium">{{ detail.historyGroupScore ?? '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div><span class="text-gray-400">物理组分数线：</span><span class="text-gray-700 font-medium">{{ detail.scienceGroupScore ?? '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <div><span class="text-gray-400">推荐率：</span><span class="text-gray-700 font-medium">{{ detail.recommendationRate ? `${detail.recommendationRate}%` : '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div><span class="text-gray-400">推荐年份：</span><span class="text-gray-700">{{ detail.recommendationYear ?? '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div><span class="text-gray-400">出国比例：</span><span class="text-gray-700">{{ detail.abroadRate || '-' }}</span></div>
            </div>
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div><span class="text-gray-400">男女比例：</span><span class="text-gray-700">{{ detail.genderRatio || '-' }}</span></div>
            </div>
          </div>
          <div v-if="rankingList.length" class="mt-4">
            <span class="text-gray-400">排行榜：</span>
            <div class="mt-2 flex flex-wrap gap-3">
              <span v-for="item in rankingList" :key="item.key" class="pill-new text-xs">
                {{ item.label }}：第 {{ item.value }} 名
              </span>
            </div>
          </div>
        </section>

        <!-- 院校介绍 -->
        <section class="univ-card mb-8 rounded-2xl p-6" >
          <div class="flex items-center gap-3 mb-4">
            <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
            <h3 class="text-xl font-bold text-gray-800">院校介绍</h3>
          </div>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction || '暂无详细介绍' }}</p>
        </section>

        <!-- Tab 导航 -->
        <section class="mb-8 flex justify-center">
          <div class="univ-card inline-flex items-center gap-2 p-1.5" >
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2"
              :class="activeTab === tab.key
                ? 'tab-active'
                : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
              @click="activeTab = tab.key"
            >
              <!-- 实验室 -->
              <svg v-if="tab.iconClass === 'laboratory'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <!-- 考研 -->
              <svg v-else-if="tab.iconClass === 'postgrad'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <!-- 院系 -->
              <svg v-else-if="tab.iconClass === 'department'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <!-- 学科评估 -->
              <svg v-else-if="tab.iconClass === 'evaluation'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <!-- 特殊通道 -->
              <svg v-else-if="tab.iconClass === 'channel'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <!-- 录取数据 -->
              <svg v-else-if="tab.iconClass === 'admission'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {{ tab.label }}
            </button>
          </div>
        </section>

        <!-- Tab 内容区 -->
        <section class="univ-card min-h-[200px] mb-8 rounded-2xl p-6" >
          <Transition name="fade" mode="out-in">
            <LaboratoryTab v-if="activeTab === 'laboratory'" :university-id="route.params.id as string" />
            <PostgradMajorForUniversityTab v-else-if="activeTab === 'postgrad'" :university-id="route.params.id as string" />
            <DepartmentTab v-else-if="activeTab === 'department'" :university-id="route.params.id as string" />
            <SubjectEvaluationTab v-else-if="activeTab === 'evaluation'" :university-id="route.params.id as string" />
            <ChannelTab v-else-if="activeTab === 'channel'" :university-id="route.params.id as string" />
            <AdmissionGroupTab v-else-if="activeTab === 'admission'" :university-id="route.params.id as string" />
          </Transition>
        </section>

        <!-- 底部操作 -->
        <div class="flex justify-center gap-4 pb-8">
          <button
            class="btn-secondary px-6 py-2.5 text-sm flex items-center gap-1.5"
            @click="goBack"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回列表
          </button>
          <button
            class="btn-brand px-6 py-2.5 text-sm flex items-center gap-1.5"
            @click="goGuide"
          >
            查看适应指南
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 新规范卡片：纯白底 + 橙描边 + 渐变顶边 ===== */
.univ-card {
  /* !important 覆盖 .app-shell main > * 的透底规则（卡片是 main 直接子） */
  background: #ffffff !important;
  background-image: none !important;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}

/* ===== 橙系药丸标签 ===== */
.pill-new {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.7rem;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

/* ===== Tab 激活态：新 token 橙渐变 ===== */
.tab-active {
  background: linear-gradient(90deg, #f97316, #fb923c) !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
}

/* ===== 按钮 token 覆盖（本页生效，不动全局） ===== */
.btn-brand {
  background: linear-gradient(90deg, #f97316, #fb923c) !important;
  border-color: transparent !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
